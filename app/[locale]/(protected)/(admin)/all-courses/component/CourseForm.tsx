"use client";

import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { handleErrorMessage } from "@/lib/hasPermission";
import { useCoursePermissions } from "@/hooks/useHasPermission";

// Define the schema for a module.
// The "cover" field is transformed to extract the File from the FileList.
const schema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  price: z.preprocess(
    (val) => Number(val),
    z.number({ invalid_type_error: "Price must be a number" }).gt(0, {
      message: "Price must be greater than 0",
    })
  ),
  cover: z
    .any()
    .transform((val) => {
      if (val instanceof FileList) return val.item(0) as File;
      return val;
    })
    .refine((file) => file instanceof File || typeof file === "string", {
      message: "Cover must be a file or a valid URL",
    }),
});

// Define the form inputs type
type CourseFormInputs = z.infer<typeof schema>;

const CourseForm = ({
  defaultValues,
  handleClose,
}: {
  defaultValues?: CourseFormInputs;
  handleClose: () => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CourseFormInputs>({
    resolver: zodResolver(schema),
    mode: "all",
    defaultValues: defaultValues || {
      title: "",
      description: "",
      price: 0,
      cover: "",
    },
  });

  const queryClient = useQueryClient();

  const { canCreateCourse, canUpdateCourse } = useCoursePermissions();

  const mutation = useMutation({
    mutationFn: async (data: CourseFormInputs) => {
      // Use FormData to handle the file upload
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("price", data.price.toString());

      if (data.cover instanceof File) {
        formData.append("cover", data.cover);
      } else if (typeof data.cover === "string") {
        formData.append("cover", data.cover);
      }

      // If editing, send a PATCH request; otherwise, POST a new module
      if (defaultValues?.title) {
        return api.patch(`/modules/${defaultValues.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        return api.post("/modules", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      handleClose();
      toast.success("Course saved successfully!");
    },
    onError: (error) => {
      toast.error(handleErrorMessage(error));
    },
  });

  const onSubmit: SubmitHandler<CourseFormInputs> = async (data) => {
    mutation.mutate(data);
  };

  console.log({ defaultValues, canCreateCourse, canUpdateCourse });
  const disableButton = (pending: boolean) => {
    if (pending) {
      true;
    }
    if (defaultValues && !canUpdateCourse) {
      return true;
    }
    if (!defaultValues && !canCreateCourse) {
      return true;
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
      {/* Title Input */}
      <div className="space-y-2">
        <Label htmlFor="title" className="font-medium text-default-600">
          Title
        </Label>
        <Input
          size="lg"
          {...register("title")}
          type="text"
          id="title"
          className={cn("", { "border-destructive": errors.title })}
        />
        {errors.title && (
          <p className="text-destructive mt-2 text-sm">
            {errors.title.message}
          </p>
        )}
      </div>

      {/* Description Input */}
      <div className="space-y-2">
        <Label htmlFor="description" className="font-medium text-default-600">
          Description
        </Label>
        <Input
          size="lg"
          {...register("description")}
          type="text"
          id="description"
          className={cn("", { "border-destructive": errors.description })}
        />
        {errors.description && (
          <p className="text-destructive mt-2 text-sm">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Price Input */}
      <div className="space-y-2">
        <Label htmlFor="price" className="font-medium text-default-600">
          Price
        </Label>
        <Input
          size="lg"
          {...register("price")}
          type="number"
          step="any"
          id="price"
          className={cn("", { "border-destructive": errors.price })}
        />
        {errors.price && (
          <p className="text-destructive mt-2 text-sm">
            {errors.price.message}
          </p>
        )}
      </div>

      {/* Cover Input */}
      <div className="space-y-2">
        <Label htmlFor="cover" className="font-medium text-default-600">
          Cover Image
        </Label>
        <Input
          size="lg"
          {...register("cover")}
          type="file"
          id="cover"
          className={cn("", { "border-destructive": errors.cover })}
        />
        {errors.cover && (
          <p className="text-destructive mt-2 text-sm">
            {errors.cover.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        fullWidth
        disabled={disableButton(mutation.isPending)}
      >
        {mutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
          </>
        ) : (
          "Save"
        )}
      </Button>
    </form>
  );
};

export default CourseForm;
