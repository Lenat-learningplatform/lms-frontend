"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table";
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
import Image from "next/image";
import api from "@/lib/api";

export type CourseTeacherData = {
  id: string;
  teacher_id: string;
  name: string;
  username: string;
  phone: string;
  email: string;
  bod: string;
  assigned_at: string;
  profile_photo_url: string;
};

export type CourseTeacherPaginatedResponse = {
  current_page: number;
  data: CourseTeacherData[];
  last_page: number;
};

const fetchCourseTeachers = async (
  courseId: string,
  page: number
): Promise<CourseTeacherPaginatedResponse> => {
  const response = await api.get(
    `get-module-teachers/${courseId}?page=${page}`
  );
  return response.data.data;
};

const CourseTeacherTable: React.FC = () => {
  const { id: courseId } = useParams();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);

  const {
    data: teachers,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["courseTeachers", courseId, page],
    queryFn: () => {
      if (!courseId) throw new Error("Course ID is required");
      return fetchCourseTeachers(courseId as string, page);
    },
    enabled: !!courseId,
  });

  const columns: ColumnDef<CourseTeacherData>[] = [
    {
      accessorKey: "profile_photo_url",
      header: "Profile",
      cell: ({ row }) => (
        <Image
          src={row.getValue("profile_photo_url")}
          alt={row.getValue("name")}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full"
          unoptimized
        />
      ),
    },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "username", header: "Username" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "assigned_at",
      header: "Assigned At",
      cell: ({ row }) => new Date(row.getValue("assigned_at")).toLocaleString(),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const teacher = row.original;
        return (
          <Button
            onClick={() => router.push(`/all-courses/class/${teacher.id}`)}
            size="sm"
          >
            Detail
          </Button>
        );
      },
    },
  ];

  const table = useReactTable({
    data: teachers ? teachers.data : [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
  });

  return (
    <div className="w-full overflow-x-auto">
      {isLoading ? (
        <p>Loading teachers...</p>
      ) : isError ? (
        <p>Error: {(error as any)?.message}</p>
      ) : (
        <>
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
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="h-[75px]">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No teachers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-center py-4 gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="w-8 h-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="flex items-center">
              Page {teachers?.current_page} of {teachers?.last_page}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (teachers && page < teachers.last_page) {
                  setPage((prev) => prev + 1);
                }
              }}
              disabled={teachers ? page === teachers.last_page : true}
              className="w-8 h-8"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default CourseTeacherTable;
