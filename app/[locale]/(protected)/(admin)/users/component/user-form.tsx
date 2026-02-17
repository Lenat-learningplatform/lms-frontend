"use client";

import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Select, { SingleValue } from "react-select"; // Use single-select
import { handleErrorMessage } from "@/lib/hasPermission";
import { useHasPermission } from "@/hooks/useHasPermission";

// ✅ Define the schema for validation (roles as an array)
// Added 'bod' field with required format "YYYY-MM-DD"
const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  roles: z
    .array(z.string())
    .min(1, { message: "At least one role is required" }),
  bod: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Date of birth must be in the format YYYY-MM-DD",
  }),
});

// ✅ Define the form inputs type
type UserFormInputs = z.infer<typeof schema>;

// ✅ Fetch roles from API using TanStack Query
const fetchRoles = async (): Promise<{ uuid: string; name: string }[]> => {
  const response = await api.get("roles");
  return response.data.data; // API returns { data: [{ uuid, name }, ...] }
};

const UserForm = ({
  defaultValues,
  handleClose,
}: {
  defaultValues?: UserFormInputs;
  handleClose: () => void;
}) => {
  const [isPending, startTransition] = React.useTransition();
  const createUser = useHasPermission("create_user");
  const updateUser = useHasPermission("update_user");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormInputs>({
    resolver: zodResolver(schema),
    mode: "all",
    defaultValues: defaultValues || {
      name: "",
      email: "",
      phone: "",
      password: "",
      roles: [],
      bod: "", // ✅ Added default for bod
    },
  });

  const queryClient = useQueryClient();
  const {
    data: roles,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
  });

  // Convert API role data to react-select format
  const roleOptions =
    roles?.map((role) => ({
      value: role.uuid,
      label: role.name,
    })) || [];

  // Function to handle single-select changes — store as single-element array
  const handleRoleChange = (
    selectedOption: SingleValue<{ value: string; label: string }>
  ) => {
    const selectedRoles = selectedOption ? [selectedOption.value] : [];
    setValue("roles", selectedRoles as [string, ...string[]]);
  };

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return defaultValues?.name
        ? api.patch(`/users/${defaultValues.id}`, data)
        : api.post("/users", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
      handleClose();
      toast.success("User details saved successfully!");
    },
    onError: (error) => {
      toast.error(handleErrorMessage(error));
    },
  });

  const onSubmit: SubmitHandler<UserFormInputs> = async (data) => {
    startTransition(async () => {
      try {
        mutation.mutate(data);
      } catch (err: any) {}
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
      {/* Name Input */}
      <div className="space-y-2">
        <Label htmlFor="name" className="font-medium text-default-600">
          Full Name
        </Label>
        <Input
          size="lg"
          disabled={isPending}
          {...register("name")}
          type="text"
          id="name"
          className={cn("", { "border-destructive": errors.name })}
        />
        {errors.name && (
          <p className="text-destructive mt-2 text-sm">{errors.name.message}</p>
        )}
      </div>

      {/* Email Input */}
      <div className="space-y-2">
        <Label htmlFor="email" className="font-medium text-default-600">
          Email
        </Label>
        <Input
          size="lg"
          disabled={isPending}
          {...register("email")}
          type="email"
          id="email"
          className={cn("", { "border-destructive": errors.email })}
        />
        {errors.email && (
          <p className="text-destructive mt-2 text-sm">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Phone Input */}
      <div className="space-y-2">
        <Label htmlFor="phone" className="font-medium text-default-600">
          Phone Number
        </Label>
        <Input
          size="lg"
          disabled={isPending}
          {...register("phone")}
          type="text"
          id="phone"
          className={cn("", { "border-destructive": errors.phone })}
        />
        {errors.phone && (
          <p className="text-destructive mt-2 text-sm">
            {errors.phone.message}
          </p>
        )}
      </div>

      {/* Date of Birth Input */}
      <div className="space-y-2">
        <Label htmlFor="bod" className="font-medium text-default-600">
          Date of Birth
        </Label>
        <Input
          size="lg"
          disabled={isPending}
          {...register("bod")}
          type="date" // You can also use "text" with a placeholder if you prefer
          id="bod"
          placeholder="1990-12-12"
          className={cn("", { "border-destructive": errors.bod })}
        />
        {errors.bod && (
          <p className="text-destructive mt-2 text-sm">{errors.bod.message}</p>
        )}
      </div>

      {/* Password Input */}
      <div className="space-y-2">
        <Label htmlFor="password" className="font-medium text-default-600">
          Password
        </Label>
        <Input
          size="lg"
          disabled={isPending}
          {...register("password")}
          type="password"
          id="password"
          className={cn("", { "border-destructive": errors.password })}
        />
        {errors.password && (
          <p className="text-destructive mt-2 text-sm">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Multi-Select Role Selection */}
      <div className="space-y-2">
        <Label htmlFor="roles" className="font-medium text-default-600">
          Roles
        </Label>
        {isLoading ? (
          <p>Loading roles...</p>
        ) : isError ? (
          <p className="text-red-500">
            {error?.message || "Failed to load roles."}
          </p>
        ) : (
          <Select
            // single-select (only one role allowed)
            options={roleOptions}
            onChange={handleRoleChange}
            defaultValue={roleOptions.find((option) =>
              (watch("roles") ?? []).includes(option.value)
            ) || null}
            // Render the menu into a portal so it won't be clipped by the modal
            menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
            // Use fixed positioning to avoid layout clipping inside modals
            menuPosition="fixed"
            // Let react-select decide best placement (top/bottom)
            menuPlacement="auto"
            // Prevent page scroll while menu is open
            menuShouldBlockScroll={true}
            // Ensure the portaled menu is above the modal and receives pointer events
            styles={{
              menuPortal: (base) => ({
                ...base,
                zIndex: 2147483647,
                position: "fixed",
                pointerEvents: "auto",
              }),
              menu: (base) => ({ ...base, pointerEvents: "auto" }),
            }}
          />
        )}
        {errors.roles && (
          <p className="text-destructive mt-2 text-sm">
            {errors.roles.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        fullWidth
        disabled={
          isPending ||
          (!!defaultValues?.name && !updateUser) ||
          (!defaultValues?.name && !createUser)
        }
      >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? "Saving..." : "Save"}
      </Button>
    </form>
  );
};

export default UserForm;
