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

const chapterSchema = z
  .object({
    id: z.string().optional(),
    is_custom: z.boolean().default(false),
    module_id: z.string(),
    name: z.string().min(3, { message: "Name must be at least 3 characters" }),
    description: z
      .string()
      .min(10, { message: "Description must be at least 10 characters" }),
    selected_students: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.is_custom &&
      (!data.selected_students || data.selected_students.length === 0)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "At least one student must be selected for custom chapters",
        path: ["selected_students"],
      });
    }
  });

type ChapterFormInputs = z.infer<typeof chapterSchema>;

type ChapterFormProps = {
  module_id: string;
  clid: string;
  open: boolean;
  defaultValues?: ChapterFormInputs;
  handleClose: () => void;
};

type Student = {
  id: string;
  name: string;
  email: string;
};

const ChapterForm: React.FC<ChapterFormProps> = ({
  module_id,
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
  } = useForm<ChapterFormInputs>({
    resolver: zodResolver(chapterSchema),
    defaultValues: defaultValues || {
      module_id,
      name: "",
      description: "",
      is_custom: false,
      selected_students: [],
    },
  });

  useEffect(() => {
    reset(
      defaultValues || {
        module_id,
        name: "",
        description: "",
        is_custom: false,
        selected_students: [],
      }
    );
  }, [defaultValues, reset, module_id]);

  const { data: students, isLoading: isLoadingStudents } = useQuery<Student[]>({
    queryKey: ["students", clid, debouncedSearch],
    queryFn: async () => {
      if (!clid) return [];
      try {
        const res = await api.get(
          `/get-students-by-course/${clid}?search=${debouncedSearch}`
        );
        return res.data.data.data;
      } catch {
        return [];
      }
    },
    enabled: watch("is_custom") && !!clid,
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: ChapterFormInputs) => {
      const payload: any = {
        ...data,
        student_ids: data.is_custom ? data.selected_students : undefined,
      };

      return defaultValues?.id
        ? api.patch(`/chapters/${defaultValues.id}`, payload)
        : api.post("/chapters", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters", module_id] });
      handleClose();
      toast.success("Chapter saved successfully!");
    },
    onError: (error) => {
      toast.error(handleErrorMessage(error));
    },
  });

  const onSubmit: SubmitHandler<ChapterFormInputs> = (data) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {defaultValues?.id ? "Edit Chapter" : "New Chapter"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Hidden field to pass the module_id */}
          <input type="hidden" {...register("module_id")} value={module_id} />

          {/* Name Input */}
          <div>
            <Label>Name</Label>
            <Input {...register("name")} />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          {/* Description Input */}
          <div>
            <Label>Description</Label>
            <Input {...register("description")} />
            {errors.description && (
              <p className="text-red-500 text-sm">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Custom Chapter Toggle */}
          <div className="flex items-center space-x-2 py-4">
            <Label>Custom Chapter</Label>
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

          {/* Student Selection (only shown when is_custom is true) */}
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
                          name="selected_students"
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
                      : "Please select a valid course"}
                  </p>
                )}
              </ScrollArea>

              {errors.selected_students && (
                <p className="text-red-500 text-sm">
                  {errors.selected_students.message}
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

export default ChapterForm;
