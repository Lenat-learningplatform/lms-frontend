"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useHasPermission } from "@/hooks/useHasPermission";
import PermissionDenied from "@/components/Permission";

export type RoleData = {
  uuid: string;
  name: string;
  permissions_count: number;
  created_at: string;
};

const fetchRoles = async (): Promise<RoleData[]> => {
  const response = await api.get("roles");
  return response.data.data;
};

const Roles: React.FC = () => {
  const {
    data: rolesData,
    isLoading,
    isError,
    error,
    isSuccess,
  } = useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
  });

  const router = useRouter();
  const createRole = useHasPermission("create_role");
  const readRole = useHasPermission("read_role");

  if (!readRole) {
    return <PermissionDenied ending="view roles and permissions" />;
  }

  return (
    <div className="w-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Roles</h1>
        {createRole && (
          <Button onClick={() => router.push("/roles/add")} className="gap-2">
            <span>+</span> Add New Role
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <p>Loading roles...</p>
        </div>
      ) : isError ? (
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-600">Error: {(error as Error)?.message}</p>
        </div>
      ) : rolesData && rolesData.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-4">
          <p className="text-gray-500">No roles found</p>
          {createRole && (
            <Button onClick={() => router.push("/roles/add")}>
              Create Role
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rolesData?.map((role) => (
            <div
              key={role.uuid}
              className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {role.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {role.permissions_count} permissions
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/roles/${role.uuid}`)}
                >
                  View
                </Button>
              </div>
              {/* <div className="mt-3 text-xs text-gray-400">
                Created: {new Date(role.created_at).toLocaleDateString()}
              </div> */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Roles;
