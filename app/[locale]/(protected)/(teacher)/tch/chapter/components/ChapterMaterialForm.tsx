"use client";

import React, { useState } from "react";
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
    chapter_id: z.string(),
    name: z.string().min(3, { message: "Name must be at least 3 characters" }),
    description: z
      .string()
      .min(10, { message: "Description must be at least 10 characters" }),
    // Make file optional so the form can be prefilled for editing.
    // We'll enforce presence on submit for new materials.
    file: z.any().optional(),
    is_custom: z.boolean().default(false),
    selected_students: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.is_custom &&
      (!data.selected_students || data.selected_students.length === 0)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "At least one student must be selected for custom materials",
        path: ["selected_students"],
      });
    }
  });

export type ChapterFormInputs = z.infer<typeof chapterSchema>;

type ChapterFormProps = {
  chapter_id: string;
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
  chapter_id,
  open,
  clid,
  defaultValues,
  handleClose,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm<ChapterFormInputs>({
    resolver: zodResolver(chapterSchema),
    mode: "all",
    defaultValues: defaultValues || {
      chapter_id,
      name: "",
      description: "",
      is_custom: false,
      selected_students: [],
    },
  });

  // Reset form when defaultValues change so edit opens with existing values
  React.useEffect(() => {
    if (defaultValues) {
      // Keep chapter_id from prop to ensure it remains correct
      reset({ ...defaultValues, chapter_id } as any);
    } else {
      // When creating new, reset to initial defaults
      reset({ chapter_id, name: "", description: "", is_custom: false, selected_students: [] } as any);
    }
    // reset is stable from react-hook-form; avoid including it in deps to satisfy lint
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues, chapter_id]);

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
      const formData = new FormData();
      formData.append("chapter_id", data.chapter_id);
      formData.append("name", data.name);
      formData.append("description", data.description);
      if (data.file) {
        // `data.file` may be a File or FileList depending on the input; handle both
        const fileToAppend =
          data.file instanceof File ? data.file : data.file instanceof FileList ? data.file[0] : undefined;
        if (fileToAppend) formData.append("file", fileToAppend as File);
      }
      formData.append(
        "is_custom",
        data.is_custom.toString() === "true" ? "1" : "0"
      );

      if (data.is_custom) {
        data.selected_students?.forEach((studentId) => {
          formData.append("student_ids[]", studentId);
        });
      }

      if (defaultValues?.id) {
        return api.patch(`/chapter-materials/${defaultValues.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        return api.post("/chapter-materials", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["chapter-materials", chapter_id],
      });
      handleClose();
      toast.success("Chapter Material saved successfully!");
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
            {defaultValues ? "Edit Chapter Material" : "New Chapter Material"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          <input type="hidden" {...register("chapter_id")} value={chapter_id} />

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register("name")}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-destructive mt-2 text-sm">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              {...register("description")}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && (
              <p className="text-destructive mt-2 text-sm">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              type="file"
              {...register("file")}
              className={errors.file ? "border-destructive" : ""}
            />
            {errors.file && (
              <p className="text-destructive mt-2 text-sm">
                {errors.file.message as string}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2 py-4">
            <Label>Custom Material</Label>
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
                <p className="text-destructive mt-2 text-sm">
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
