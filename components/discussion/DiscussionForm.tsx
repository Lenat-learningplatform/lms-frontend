"use client";

import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { handleErrorMessage } from "@/lib/hasPermission";

// Define the schema for a discussion
const schema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  content: z
    .string()
    .min(10, { message: "Content must be at least 10 characters" }),
  image: z
    .any()
    .transform((val) => {
      if (val instanceof FileList) return val.item(0) as File;
      return val;
    })
    .refine(
      (file) =>
        file instanceof File || typeof file === "string" || file === null,
      {
        message: "Image must be a file or a valid URL",
      }
    )
    .optional(),
});

// Define the form inputs type
type DiscussionFormInputs = z.infer<typeof schema>;

const DiscussionForm = ({
  id,
  classId,
  defaultValues,
  handleClose,
}: {
  id?: string;
  classId?: string;
  defaultValues?: DiscussionFormInputs;
  handleClose: () => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DiscussionFormInputs>({
    resolver: zodResolver(schema),
    mode: "all",
    defaultValues: defaultValues || {
      title: "",
      content: "",
      image: null,
    },
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: DiscussionFormInputs) => {
      // Use FormData to handle the file upload
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("content", data.content);

      if (data.image instanceof File) {
        formData.append("image", data.image);
      } else if (typeof data.image === "string") {
        formData.append("image", data.image);
      }

      // If editing, send a PATCH request; otherwise, POST a new discussion
      if (defaultValues?.title && id) {
        return api.patch(`/update-discussion/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else if (classId) {
        return api.post(`/create-discussion/${classId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discussions", classId] });
      reset();
      handleClose();
      toast.success(
        defaultValues?.title
          ? "Discussion updated successfully!"
          : "Discussion created successfully!"
      );
    },
    onError: (error) => {
      toast.error(handleErrorMessage(error));
    },
  });

  const onSubmit: SubmitHandler<DiscussionFormInputs> = async (data) => {
    await mutation.mutateAsync(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
      {/* Title Input */}
      <div className="space-y-2">
        <Label htmlFor="title" className="font-medium text-default-600">
          Discussion Title
        </Label>
        <Input
          size="lg"
          {...register("title")}
          type="text"
          id="title"
          className={cn("", { "border-destructive": errors.title })}
          placeholder="Enter discussion title"
        />
        {errors.title && (
          <p className="text-destructive mt-2 text-sm">
            {errors.title.message}
          </p>
        )}
      </div>

      {/* Content Input */}
      <div className="space-y-2">
        <Label htmlFor="content" className="font-medium text-default-600">
          Discussion Content
        </Label>
        <Textarea
          {...register("content")}
          id="content"
          className={cn("min-h-[120px]", {
            "border-destructive": errors.content,
          })}
          placeholder="What would you like to discuss?"
        />
        {errors.content && (
          <p className="text-destructive mt-2 text-sm">
            {errors.content.message}
          </p>
        )}
      </div>

      {/* Image Input */}
      <div className="space-y-2">
        <Label htmlFor="image" className="font-medium text-default-600">
          Attach Image (Optional)
        </Label>
        <Input
          size="lg"
          {...register("image")}
          type="file"
          id="image"
          accept="image/*"
          className={cn("", { "border-destructive": errors.image })}
        />
        {errors.image && (
          <p className="text-destructive mt-2 text-sm">error with the image</p>
        )}
        {defaultValues?.image && typeof defaultValues.image === "string" && (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">Current image:</p>
            <img
              src={defaultValues.image}
              alt="Current discussion image"
              className="mt-1 h-20 w-20 object-cover rounded"
            />
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          disabled={mutation.isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {defaultValues?.title ? "Updating..." : "Creating..."}
            </>
          ) : defaultValues?.title ? (
            "Update Discussion"
          ) : (
            "Create Discussion"
          )}
        </Button>
      </div>
    </form>
  );
};

export default DiscussionForm;
