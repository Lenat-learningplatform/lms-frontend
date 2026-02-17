"use client";

import React from "react";
import axios from "axios";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/api";

// Define the log data type based on your API response
export type LogData = {
  id: number;
  name: string;
  event: string;
  created_at: string;
};

// Define the columns for the logs table
export const columns: ColumnDef<LogData>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "event",
    header: "Event",
  },
  {
    accessorKey: "created_at",
    header: "Created At",
  },
];

// Function to fetch logs from your Laravel API
const fetchLogs = async (): Promise<LogData[]> => {
  const response = await api.get("get-activity-logs");
  return response.data.data.data;
};

const LogTable = () => {
  // Use TanStack Query to fetch the logs
  const {
    data: logs,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["get-activity-logs"],
    queryFn: fetchLogs,
  });

  // You can add more state for sorting, pagination, etc. if needed.
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data: logs ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
  });
  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error: {(error as any).message}</p>;

  return (
    <div className="w-full overflow-x-auto">
      <Table className="overflow-hidden">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-default-200">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="h-[75px]">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-center py-4 gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="w-8 h-8"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        {table.getPageOptions().map((page, pageIndex) => (
          <Button
            key={`log-table-page-${pageIndex}`}
            onClick={() => table.setPageIndex(pageIndex)}
            size="icon"
            className="w-8 h-8"
            variant={
              table.getState().pagination?.pageIndex === pageIndex
                ? "default"
                : "outline"
            }
          >
            {page + 1}
          </Button>
        ))}
        <Button
          variant="outline"
          size="icon"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="w-8 h-8"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default LogTable;
