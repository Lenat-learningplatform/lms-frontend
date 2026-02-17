"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import api from "@/lib/api";
import { handleErrorMessage } from "@/lib/hasPermission";
import { useDebounce } from "@/hooks/use-debounce";

const today = new Date().toISOString().split("T")[0];

const meetingSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    url: z.string().url("Invalid URL").optional().nullable(),
    all_day: z.boolean().default(false),
    start_date: z
      .string()
      .optional()
      .nullable()
      .refine((date) => !date || new Date(date) >= new Date(), {
        message: "Start date must be today or in the future",
      }),
    end_date: z.string().optional().nullable(),
    start_time: z.string().optional().nullable(),
    end_time: z.string().optional().nullable(),
    is_custom: z.boolean().default(false),
    participants: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    // If not an all-day meeting, require start and end times
    if (!data.all_day) {
      if (!data.start_time) {
        ctx.addIssue({
          code: "custom",
          message: "Start time is required for non-all-day meetings",
          path: ["start_time"],
        });
      }
      if (!data.end_time) {
        ctx.addIssue({
          code: "custom",
          message: "End time is required for non-all-day meetings",
          path: ["end_time"],
        });
      }
    }

    // Ensure end_date is not before start_date
    if (data.start_date && data.end_date) {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      if (endDate < startDate) {
        ctx.addIssue({
          code: "custom",
          message: "End date must be after start date",
          path: ["end_date"],
        });
      }
    }

    // If custom meeting, require at least one participant
    if (
      data.is_custom &&
      (!data.participants || data.participants.length === 0)
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          "At least one participant must be selected for custom meetings",
        path: ["participants"],
      });
    }
  });

type MeetingFormInputs = z.infer<typeof meetingSchema>;

type Student = {
  id: string;
  name: string;
  email: string;
};

type MeetingFormProps = {
  module: string;
  clid: string;
  open: boolean;
  defaultValues?: MeetingFormInputs;
  handleClose: () => void;
};

const MeetingForm: React.FC<MeetingFormProps> = ({
  module,
  clid,
  open,
  defaultValues,
  handleClose,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<MeetingFormInputs>({
    resolver: zodResolver(meetingSchema),
    defaultValues: defaultValues || {
      title: "",
      description: "",
      all_day: false,
      is_custom: false,
      participants: [],
    },
  });

  useEffect(() => {
    reset(
      defaultValues || {
        title: "",
        description: "",
        all_day: false,
        is_custom: false,
        participants: [],
      }
    );
  }, [defaultValues, reset]);

  const { data: students, isLoading: isLoadingStudents } = useQuery<Student[]>({
    queryKey: ["students", clid, debouncedSearch],
    queryFn: async () => {
      try {
        const res = await api.get(
          `/get-students-by-course/${clid}?search=${debouncedSearch}`
        );
        return res.data.data.data;
      } catch {
        return [];
      }
    },
    enabled: open && !!clid && watch("is_custom"),
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: MeetingFormInputs) => {
      const payload: any = {
        ...data,
        teacher_module_id: clid,
        student_ids: data.is_custom ? data.participants : undefined,
      };

      return defaultValues?.id
        ? api.patch(`/meetings/${defaultValues.id}`, payload)
        : api.post("/meetings", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings", module] });
      handleClose();
      toast.success("Meeting saved successfully!");
    },
    onError: (error) => {
      toast.error(handleErrorMessage(error));
    },
  });

  const onSubmit: SubmitHandler<MeetingFormInputs> = (data) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {defaultValues?.id ? "Edit Meeting" : "New Meeting"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Title*</Label>
            <Input {...register("title")} placeholder="Meeting title" />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Label>Description*</Label>
            <Input
              {...register("description")}
              placeholder="Meeting description"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <Label>Meeting URL</Label>
            <Input
              {...register("url")}
              placeholder="https://example.com/meeting"
            />
            {errors.url && (
              <p className="text-red-500 text-sm mt-1">{errors.url.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2 py-2">
            <Label>All Day Meeting</Label>
            <Controller
              name="all_day"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date*</Label>
              <Input type="date" min={today} {...register("start_date")} />
              {errors.start_date && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.start_date.message}
                </p>
              )}
            </div>

            <div>
              <Label>End Date*</Label>
              <Input type="date" min={today} {...register("end_date")} />
              {errors.end_date && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.end_date.message}
                </p>
              )}
            </div>
          </div>

          {!watch("all_day") && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Time*</Label>
                <Input type="time" {...register("start_time")} />
                {errors.start_time && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.start_time.message}
                  </p>
                )}
              </div>

              <div>
                <Label>End Time*</Label>
                <Input type="time" {...register("end_time")} />
                {errors.end_time && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.end_time.message}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2 py-2">
            <Label>Custom Meeting</Label>
            <Controller
              name="is_custom"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          {watch("is_custom") && (
            <div className="space-y-2">
              <Label>Participants*</Label>
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <ScrollArea className="h-48 border rounded-md p-2 mt-2">
                {isLoadingStudents ? (
                  <p className="text-sm text-gray-500">Loading students...</p>
                ) : students?.length ? (
                  <div className="space-y-2">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center space-x-2"
                      >
                        <Controller
                          name="participants"
                          control={control}
                          render={({ field }) => (
                            <>
                              <input
                                type="checkbox"
                                id={`student-${student.id}`}
                                checked={
                                  field.value?.includes(student.id) || false
                                }
                                onChange={(e) => {
                                  const newValue = e.target.checked
                                    ? [...(field.value || []), student.id]
                                    : field.value?.filter(
                                        (id) => id !== student.id
                                      ) || [];
                                  field.onChange(newValue);
                                }}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <label
                                htmlFor={`student-${student.id}`}
                                className="text-sm"
                              >
                                {student.name} ({student.email})
                              </label>
                            </>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    {clid
                      ? "No students found"
                      : "Please select a valid module"}
                  </p>
                )}
              </ScrollArea>

              {errors.participants && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.participants.message}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save Meeting"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MeetingForm;
