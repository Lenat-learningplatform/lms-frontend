"use client";

import { useHasPermission } from "@/hooks/useHasPermission";
import LogTable from "./components/log-table";
import PermissionDenied from "@/components/Permission";

const Page = () => {
  const readLogs = useHasPermission("read_activity_log");
  if (!readLogs) {
    return <PermissionDenied ending="read logs" />;
  }
  return (
    <div>
      <LogTable />
    </div>
  );
};

export default Page;
