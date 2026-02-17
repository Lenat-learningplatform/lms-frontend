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

// The "cover" field is transformed to extract the File from the FileList.
const schema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  price: z.preprocess(
    (val) => Number(val),
    z.number({ invalid_type_error: "Price must be a number" }).min(0, {
      message: "Price must be at least 0",
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
    setError,
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

      // If editing, send a PATCH request; otherwise, POST a new course
      if (defaultValues?.title) {
        // Let the browser/axios set the multipart Content-Type boundary
        return api.patch(`/my-modules/${defaultValues.id}`, formData);
      } else {
        return api.post("/my-modules", formData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      handleClose();
      toast.success("Course saved successfully!");
    },
    onError: (error: any) => {
      // If the server returned field validation errors, map them into the form
      const resp = error?.response?.data;
      if (resp && resp.errors && typeof resp.errors === "object") {
        Object.entries(resp.errors).forEach(([field, messages]) => {
          const message = Array.isArray(messages) ? messages[0] : (messages as any);
          try {
            setError(field as any, { type: "server", message: String(message) });
          } catch (e) {
            // ignore unknown fields
          }
        });
        // also show a toast for immediate feedback
        if (resp.message) toast.error(String(resp.message));
      } else {
        toast.error(handleErrorMessage(error));
      }
    },
  });

  const onSubmit: SubmitHandler<CourseFormInputs> = async (data) => {
    try {
      // Use mutateAsync so we can await completion and let the
      // mutation's onSuccess/onError handlers run as before.
      await mutation.mutateAsync(data);
    } catch (err: any) {
      // mutation.onError will handle toasts; swallow here to avoid unhandled rejection
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
          {...register("price", { valueAsNumber: true })}
          type="number"
          id="price"
          step="0.01"
          inputMode="decimal"
          min="0"
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
      <Button type="submit" fullWidth disabled={mutation.isPending}>
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
