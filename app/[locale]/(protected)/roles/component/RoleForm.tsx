"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useHasPermission } from "@/hooks/useHasPermission";
import { handleErrorMessage } from "@/lib/hasPermission";

// ***********************
// Type Definitions
// ***********************
interface Permission {
  uuid: string;
  name: string;
  action: string;
}

interface Role {
  data: {
    name: string;
    description: string;
    permissions: Permission[];
  };
}

interface GroupedPermissions {
  [category: string]: Permission[];
}

interface FormValues {
  roleName: string;
  permissions: string[];
  description: string;
  id?: string;
}

// ***********************
// Zod Schema for Validation
// ***********************
const schema = z.object({
  id: z.string().optional(),
  roleName: z
    .string()
    .min(1, { message: "Role name is required" })
    .max(50, { message: "Role name cannot exceed 50 characters" }),
  permissions: z
    .array(z.string())
    .min(1, { message: "At least one permission is required" }),
  description: z
    .string()
    .max(200, { message: "Description cannot exceed 200 characters" })
    .optional(),
});

// ***********************
// Data Fetching Functions
// ***********************
const fetchPermissions = async (): Promise<Permission[]> => {
  const res = await api.get(`/permissions`);
  return res.data.data;
};

const fetchRole = async (id: string): Promise<Role | null> => {
  const res = await api.get(`/roles/${id}`);
  return res.data;
};

// ***********************
// RoleForm Component
// ***********************
const RoleForm: React.FC = () => {
  // Retrieve id from URL via Next.js useParams.
  const { id } = useParams();
  const roleId = Array.isArray(id) ? id[0] : id;
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const createRole = useHasPermission("create_role");
  const updateRole = useHasPermission("update_role");

  // Fetch all permissions (with search filtering)
  const {
    data: permissionsData,
    isLoading: permissionsLoading,
    isError: permissionsError,
  } = useQuery<Permission[]>({
    queryKey: ["permissions", search],
    queryFn: async () => {
      const res = await api.get(`/permissions?search=${search}`);
      return res.data.data;
    },
  });

  // Group permissions by category based on colon-separated names.
  const groupedPermissions: GroupedPermissions =
    permissionsData?.reduce(
      (acc: GroupedPermissions, permission: Permission) => {
        const index = permission.name.indexOf("_");
        let action: string;
        let group: string;
        if (index !== -1) {
          // First word is the action
          action = permission.name.slice(0, index);
          // Everything after the first underscore becomes the group,
          // convert it to title case.
          const remainder = permission.name.slice(index + 1);
          group = remainder
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
        } else {
          // Fallback if no underscore is found.
          action = permission.name;
          group = "General";
        }
        if (!acc[group]) {
          acc[group] = [];
        }
        // Include the computed action.
        acc[group].push({ ...permission, action });
        return acc;
      },
      {} as GroupedPermissions
    ) || {};

  // If editing, fetch role details.
  const {
    data: roleData,
    isLoading: roleLoading,
    isError: roleError,
  } = useQuery<Role | null>({
    queryKey: ["role", roleId],
    queryFn: async () => {
      if (roleId && roleId !== "add") {
        return await fetchRole(roleId);
      }
      return null;
    },
    enabled: roleId !== "add",
  });

  // Prepare initial form values.
  const initialValues: FormValues = {
    roleName: roleData?.data?.name || "",
    permissions: roleData?.data?.permissions?.map((p) => p.uuid) || [],
    description: roleData?.data?.description || "",
    id: roleId && roleId !== "add" ? roleId : undefined,
  };

  // Setup React Hook Form.
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  });

  // Update form when roleData loads.
  useEffect(() => {
    if (roleData) {
      reset({
        roleName: roleData.data.name,
        permissions: roleData.data.permissions.map((p) => p.uuid),
        description: roleData.data.description,
        id: roleId,
      });
    }
  }, [roleData, reset, roleId]);

  // Mutation for creating/updating role.
  const mutation = useMutation({
    mutationFn: (data: FormValues) => {
      const payload = {
        name: data.roleName,
        permissions: data.permissions,
        description: data.description,
      };
      if (data.id) {
        if (!updateRole) {
          toast.error("You don't have permission to update role.");
        }
        return api.put(`/roles/${data.id}`, payload);
      } else {
        if (!createRole) {
          toast.error("You don't have permission to create role.");
        }
        return api.post("/roles", payload);
      }
    },
    onSuccess: () => {
      toast.success(
        `${
          roleId && roleId !== "add" ? "Role updated" : "Role created"
        } successfully!`
      );
      setSearch("");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["role", roleId] });
    },
    onError: (error) => {
      toast.error(handleErrorMessage(error));
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    await mutation.mutateAsync(data);
  };

  if (roleLoading && roleId && roleId !== "add") {
    return <div>Loading role data...</div>;
  }
  if (roleError && roleId && roleId !== "add") {
    return <div>Failed to load role data.</div>;
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-4">
      <div className="bg-white dark:bg-gray-800 dark:text-white p-8 rounded shadow-md w-full mx-auto max-w-4xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Role Name */}
          <div className="mb-4">
            <Label
              htmlFor="roleName"
              className="block font-medium text-gray-700 dark:text-gray-300"
            >
              Role Name
            </Label>
            <Input
              id="roleName"
              placeholder="Enter role name"
              className="w-full"
              {...register("roleName")}
            />
            {errors.roleName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.roleName.message}
              </p>
            )}
          </div>

          {/* Permissions Search */}
          <div className="mb-4">
            <Label
              htmlFor="search"
              className="block font-medium text-gray-700 dark:text-gray-300"
            >
              Search Permissions
            </Label>
            <Input
              id="search"
              placeholder="Type to search..."
              className="w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Grouped Permissions */}
          <div className="mb-4">
            <Label className="block font-medium text-gray-700 dark:text-gray-300 mb-3">
              Permissions
            </Label>
            {permissionsLoading ? (
              <p>Loading permissions...</p>
            ) : permissionsError ? (
              <p className="text-red-500">Failed to load permissions</p>
            ) : (
              Object.entries(groupedPermissions).map(([category, perms]) => (
                <div
                  key={category}
                  className="mb-4 border rounded p-3 bg-gray-50 dark:bg-gray-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-semibold text-gray-800 dark:text-white">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const currentPermissions = watch("permissions");
                        const categoryPermissions = perms.map(
                          (perm) => perm.uuid
                        );
                        const allSelected = categoryPermissions.every((uuid) =>
                          currentPermissions.includes(uuid)
                        );
                        if (allSelected) {
                          // Deselect all in this group
                          setValue(
                            "permissions",
                            currentPermissions.filter(
                              (uuid) => !categoryPermissions.includes(uuid)
                            )
                          );
                        } else {
                          // Select all in this group
                          setValue(
                            "permissions",
                            Array.from(
                              new Set([
                                ...currentPermissions,
                                ...categoryPermissions,
                              ])
                            )
                          );
                        }
                      }}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {perms.every((perm) =>
                        watch("permissions").includes(perm.uuid)
                      )
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {perms.map((permission) => (
                      <div key={permission.uuid} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`perm-${permission.uuid}`}
                          value={permission.uuid}
                          checked={watch("permissions").includes(
                            permission.uuid
                          )}
                          onChange={(e) => {
                            const currentPermissions = watch("permissions");
                            if (e.target.checked) {
                              setValue(
                                "permissions",
                                Array.from(
                                  new Set([
                                    ...currentPermissions,
                                    permission.uuid,
                                  ])
                                )
                              );
                            } else {
                              setValue(
                                "permissions",
                                currentPermissions.filter(
                                  (uuid) => uuid !== permission.uuid
                                )
                              );
                            }
                          }}
                          className="mr-2"
                        />
                        <label
                          htmlFor={`perm-${permission.uuid}`}
                          className="text-gray-700 dark:text-gray-300"
                        >
                          {permission.action}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
            {errors.permissions && (
              <p className="text-red-500 text-sm mt-1">
                {errors.permissions.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <Label
              htmlFor="description"
              className="block font-medium text-gray-700 dark:text-gray-300"
            >
              Description
            </Label>
            <textarea
              id="description"
              placeholder="Enter a brief description"
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 text-black dark:text-white"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <Button
              type="submit"
              fullWidth
              disabled={
                isSubmitting ||
                (!updateRole && !!roleId && roleId !== "add") ||
                (!createRole && !!roleId && roleId === "add")
              }
            >
              {isSubmitting
                ? `${
                    roleId && roleId !== "add" ? "Updating" : "Creating"
                  } Role...`
                : `${roleId && roleId !== "add" ? "Update" : "Create"} Role`}
            </Button>
          </div>
        </form>
        <div className="mt-4 text-center">
          <Link
            href="/roles"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Back to Roles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RoleForm;
