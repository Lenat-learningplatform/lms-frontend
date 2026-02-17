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

const testSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    start_date: z
      .string()
      .optional()
      .nullable()
      .refine((date) => {
        if (!date) return true;
        const picked = new Date(date);
        const today = new Date();
        // Compare dates by zeroing time so selecting today's date passes
        picked.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        return picked >= today;
      }, {
        message: "Start date must be today or in the future",
      }),
    due_date: z.string().optional().nullable(),
    duration: z.preprocess(
      (val) => (val === "" ? undefined : Number(val)),
      z.number().min(1, "Duration must be at least 1").optional().nullable()
    ),
    duration_unit: z.enum(["hour", "minute"]).optional().nullable(),
    is_custom: z.boolean().default(false),
    selected_students: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.start_date && data.due_date) {
      const startDate = new Date(data.start_date);
      const dueDate = new Date(data.due_date);

      if (dueDate < startDate) {
        ctx.addIssue({
          code: "custom",
          message: "Due date must be today or later, and after start date",
          path: ["due_date"],
        });
      }
    }

    if (
      data.is_custom &&
      (!data.selected_students || data.selected_students.length === 0)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "At least one student must be selected for custom tests",
        path: ["selected_students"],
      });
    }
  });

type TestFormInputs = z.infer<typeof testSchema>;

type TestFormProps = {
  model_type: "chapter" | "module";
  id: string;
  clid: string;
  open: boolean;
  defaultValues?: TestFormInputs;
  handleClose: () => void;
};

type Student = {
  id: string;
  name: string;
  email: string;
};

const TestForm: React.FC<TestFormProps> = ({
  model_type,
  id,
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
  } = useForm<TestFormInputs>({
    resolver: zodResolver(testSchema),
    defaultValues: defaultValues || {
      name: "",
      description: "",
      is_custom: false,
      selected_students: [],
    },
  });

  useEffect(() => {
    reset(
      defaultValues || {
        name: "",
        description: "",
        is_custom: false,
        selected_students: [],
      }
    );
  }, [defaultValues, reset]);

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
    mutationFn: async (data: TestFormInputs) => {
      const payload: any = {
        ...data,
        model_type,
        student_ids: data.is_custom ? data.selected_students : undefined,
      };

      if (model_type === "chapter") {
        payload.chapter_id = id;
      } else if (model_type === "module") {
        payload.module_id = id;
      }

      return defaultValues?.id
        ? api.patch(`/tests/${defaultValues.id}`, payload)
        : api.post("/tests", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tests"] });
      handleClose();
      toast.success("Test saved successfully!");
    },
    onError: (error) => {
      toast.error(handleErrorMessage(error));
    },
  });

  const onSubmit: SubmitHandler<TestFormInputs> = (data) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {defaultValues?.id ? "Edit Test" : "New Test"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input {...register("name")} />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label>Description</Label>
            <Input {...register("description")} />
            {errors.description && (
              <p className="text-red-500 text-sm">
                {errors.description.message}
              </p>
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
            <Label>Due Date</Label>
            <Input type="date" min={today} {...register("due_date")} />
            {errors.due_date && (
              <p className="text-red-500 text-sm">{errors.due_date.message}</p>
            )}
          </div>

          <div>
            <Label>Duration</Label>
            <Input type="number" {...register("duration")} />
            {errors.duration && (
              <p className="text-red-500 text-sm">{errors.duration.message}</p>
            )}
          </div>

          <div>
            <Label>Duration Unit</Label>
            <Select {...register("duration_unit")}>
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hour">Hour</SelectItem>
                <SelectItem value="minute">Minute</SelectItem>
              </SelectContent>
            </Select>
            {errors.duration_unit && (
              <p className="text-red-500 text-sm">
                {errors.duration_unit.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2 py-4">
            <Label>Custom Test</Label>
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

export default TestForm;
