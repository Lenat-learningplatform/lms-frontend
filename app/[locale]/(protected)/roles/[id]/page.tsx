"use client";

import React from "react";
import RoleForm from "../component/RoleForm";
import { useHasPermission } from "@/hooks/useHasPermission";
import PermissionDenied from "@/components/Permission";

const Role = () => {
  const readRole = useHasPermission("read_role");
  const readPermission = useHasPermission("read_permission");

  if (!readRole) {
    return <PermissionDenied ending={"read role"} />;
  }
  if (!readPermission) {
    return <PermissionDenied ending={"read permission"} />;
  }
  return (
    <div>
      <RoleForm />
    </div>
  );
};

export default Role;
