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

const announcementSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().min(3, "Title must be at least 3 characters"),
    content: z.string().min(10, "Content must be at least 10 characters"),
    start_date: z.string().refine((date) => new Date(date) >= new Date(today), {
      message: "Start date must be today or in the future",
    }),
    end_date: z.string(),
    is_custom: z.boolean().default(false),
    student_ids: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (new Date(data.end_date) < new Date(data.start_date)) {
      ctx.addIssue({
        code: "custom",
        message: "End date must be after start date",
        path: ["end_date"],
      });
    }

    if (
      data.is_custom &&
      (!data.student_ids || data.student_ids.length === 0)
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          "At least one student must be selected for custom announcements",
        path: ["student_ids"],
      });
    }
  });

type AnnouncementFormInputs = z.infer<typeof announcementSchema>;

type AnnouncementFormProps = {
  open: boolean;
  defaultValues?: AnnouncementFormInputs;
  handleClose: () => void;
  courseId: string;
};

type Student = {
  id: string;
  name: string;
  email: string;
};

const AnnouncementForm: React.FC<AnnouncementFormProps> = ({
  open,
  defaultValues,
  handleClose,
  courseId,
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
  } = useForm<AnnouncementFormInputs>({
    resolver: zodResolver(announcementSchema),
    defaultValues: defaultValues || {
      title: "",
      content: "",
      start_date: today,
      end_date: today,
      is_custom: false,
      student_ids: [],
    },
  });

  useEffect(() => {
    reset(
      defaultValues || {
        title: "",
        content: "",
        start_date: today,
        end_date: today,
        is_custom: false,
        student_ids: [],
      }
    );
  }, [defaultValues, reset]);

  const { data: students, isLoading: isLoadingStudents } = useQuery<Student[]>({
    queryKey: ["students", courseId, debouncedSearch],
    queryFn: async () => {
      if (!courseId) return [];
      const res = await api.get(
        `/get-students-by-course/${courseId}?search=${debouncedSearch}`
      );
      return res.data.data.data;
    },
    enabled: watch("is_custom") && !!courseId,
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: AnnouncementFormInputs) => {
      const payload = {
        ...data,
        student_ids: data.is_custom ? data.student_ids : undefined,
      };
      return defaultValues?.id
        ? api.patch(`/announcements/${defaultValues.id}`, payload)
        : api.post("/announcements", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements", courseId] });
      handleClose();
      toast.success("Announcement saved successfully!");
    },
    onError: (error) => {
      toast.error(handleErrorMessage(error));
    },
  });

  const onSubmit: SubmitHandler<AnnouncementFormInputs> = (data) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {defaultValues?.id ? "Edit Announcement" : "New Announcement"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input {...register("title")} />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label>Content</Label>
            <Input {...register("content")} />
            {errors.content && (
              <p className="text-red-500 text-sm">{errors.content.message}</p>
            )}
          </div>

          <div>
            <Label>Start Date</Label>
            <Input type="date" min={today} {...register("start_date")} />
            {errors.start_date && (
              <p className="text-red-500 text-sm">
                {errors.start_date.message}
              </p>
            )}
          </div>

          <div>
            <Label>End Date</Label>
            <Input type="date" min={today} {...register("end_date")} />
            {errors.end_date && (
              <p className="text-red-500 text-sm">{errors.end_date.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2 py-4">
            <Label>Custom Announcement</Label>
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
              <Label>Select Students</Label>
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
                          name="student_ids"
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
                    {courseId
                      ? "No students found"
                      : "Please select a valid course"}
                  </p>
                )}
              </ScrollArea>
              {errors.student_ids && (
                <p className="text-red-500 text-sm">
                  {errors.student_ids.message}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AnnouncementForm;
