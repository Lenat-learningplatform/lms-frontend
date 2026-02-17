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
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import api from "@/lib/api";
import { handleErrorMessage } from "@/lib/hasPermission";
import { useDebounce } from "@/hooks/use-debounce";
import TiptapEditor from "@/components/RichUI";
import { useParams, useRouter } from "next/navigation";

type Student = {
  id: string;
  name: string;
  email: string;
};

// Schema for validation
const chapterSchema = z
  .object({
    id: z.string().optional(),
    is_custom: z.boolean().default(false),
    module_id: z.string(),
    name: z.string().min(3, { message: "Name must be at least 3 characters" }),

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

const CreateChapterPage: React.FC = () => {
  const { clid, id } = useParams();
  const [description, setDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [parentChapterQuery, setParentChapterQuery] = useState("");
  const [selectedParentChapter, setSelectedParentChapter] = useState<
    string | null
  >(null);
  const debouncedSearch = useDebounce(searchQuery, 500);
  const debouncedParentChapterSearch = useDebounce(parentChapterQuery, 500);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<ChapterFormInputs>({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      module_id: "",
      name: "",

      is_custom: false,
      selected_students: [],
    },
  });

  const queryClient = useQueryClient();

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

  const { data: parentChapters, isLoading: isLoadingParentChapters } = useQuery(
    {
      queryKey: ["parentChapters", clid, debouncedSearch],
      queryFn: async () => {
        if (!clid) return [];
        try {
          const res = await api.get(
            `/my-module-chapters/${clid}?search=${debouncedSearch}`
          );
          return res.data.data.data;
        } catch {
          return [];
        }
      },
      enabled: !!clid,
    }
  );

  const mutation = useMutation({
    mutationFn: async (data: ChapterFormInputs) => {
      const payload = {
        ...data,
        description, // Use TipTap editor content
        student_ids: data.is_custom ? data.selected_students : undefined,
        module_id: id,
        parent_id: selectedParentChapter, // Include selected parent chapter
      };

      return api.post("/chapters", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["chapters"],
      });
      toast.success("Chapter created successfully!");

      router.back();
    },
    onError: (error) => {
      toast.error(handleErrorMessage(error));
    },
  });

  const onSubmit: SubmitHandler<ChapterFormInputs> = (data) => {
    mutation.mutate(data);
  };

  useEffect(() => {
    reset({
      module_id: "",
      name: "",

      is_custom: false,
      selected_students: [],
    });
  }, [reset]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Create Chapter</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name Input */}
        <div>
          <Label htmlFor="name" className="text-lg font-medium text-gray-700">
            Chapter Name
          </Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Enter chapter name"
            className="mt-1 text-base p-3 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        {/* TipTap Editor for Description */}
        <div>
          <Label
            htmlFor="description"
            className="text-lg font-medium text-gray-700"
          >
            Content
          </Label>
          <div className="mt-1">
            <div className="border rounded-md bg-white min-h-[180px] p-2 focus-within:ring-2 focus-within:ring-blue-500">
              <TiptapEditor
                content={description}
                onUpdate={(html: string) => setDescription(html)}
              />
            </div>
            <p className="text-sm text-gray-400 mt-2">Use the editor to add rich content for the chapter.</p>
          </div>
        </div>

        {/* Custom Chapter Toggle */}
        <div className="flex items-center space-x-2 py-4">
          <Label>Custom Chapter</Label>
          <Controller
            name="is_custom"
            control={control}
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                  {students.map((student: Student) => (
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
                <p className="text-sm text-gray-500">No students found</p>
              )}
            </ScrollArea>

            {errors.selected_students && (
              <p className="text-red-500 text-sm">
                {errors.selected_students.message}
              </p>
            )}
          </div>
        )}

        {/* Parent Chapter Selection */}
        <div className="space-y-2">
          <Label>Select Parent Chapter</Label>
          <Input
            placeholder="Search parent chapters..."
            value={parentChapterQuery}
            onChange={(e) => setParentChapterQuery(e.target.value)}
          />

          <ScrollArea className="h-48 border rounded-md p-2 mt-2">
            {isLoadingParentChapters ? (
              <p className="text-sm text-gray-500">
                Loading parent chapters...
              </p>
            ) : parentChapters?.length ? (
              <div className="space-y-2">
                {parentChapters.map((chapter: { id: string; name: string }) => (
                  <div
                    key={chapter.id}
                    className={`p-2 rounded-md cursor-pointer ${
                      selectedParentChapter === chapter.id
                        ? "bg-blue-100"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => setSelectedParentChapter(chapter.id)}
                  >
                    {chapter.name}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No parent chapters found</p>
            )}
          </ScrollArea>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 text-lg font-medium"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Saving..." : "Create Chapter"}
        </Button>
      </form>
    </div>
  );
};

export default CreateChapterPage;
