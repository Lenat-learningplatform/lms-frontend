"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  SortingState,
  useReactTable,
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

// Define the student data type based on your API response
export type CourseStudentData = {
  id: string;
  student_id: string;
  module_teacher_id: string;
  created_by: string;
  started_at: string | null;
  completed_at: string | null;
  status: string;
  created_at: string;
  student: {
    id: string;
    name: string;
    email: string;
    phone: string;
    username: string;
    bod: string;
    created_at: string;
    profile_photo_url: string;
  };
};

// Define the paginated response type
export type CourseStudentPaginatedResponse = {
  current_page: number;
  data: CourseStudentData[];
  last_page: number;
};

const fetchCourseStudents = async (
  CourseTeacherId: string,
  page: number
): Promise<CourseStudentPaginatedResponse> => {
  const response = await api.get(
    `get-module-students/${CourseTeacherId}?page=${page}`
  );
  return response.data.data;
};

const StudentClassTable: React.FC = () => {
  // Retrieve module teacher ID from URL params
  const { id: CourseTeacherId } = useParams();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);

  const {
    data: students,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["courseStudents", CourseTeacherId, page],
    queryFn: () => {
      if (!CourseTeacherId) throw new Error("Course teacher ID is required");
      // Ensure CourseTeacherId is a string
      return fetchCourseStudents(CourseTeacherId as string, page);
    },
    enabled: !!CourseTeacherId,
  });

  const columns: ColumnDef<CourseStudentData>[] = [
    {
      accessorKey: "student.profile_photo_url",
      header: "Profile",
      cell: ({ row }) => (
        <Image
          src={row.original.student.profile_photo_url}
          alt={row.original.student.name}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full"
          unoptimized
        />
      ),
    },
    {
      accessorKey: "student.name",
      header: "Name",
      cell: ({ row }) => row.original.student.name,
    },
    {
      accessorKey: "student.username",
      header: "Username",
      cell: ({ row }) => row.original.student.username,
    },
    {
      accessorKey: "student.phone",
      header: "Phone",
      cell: ({ row }) => row.original.student.phone,
    },
    {
      accessorKey: "student.email",
      header: "Email",
      cell: ({ row }) => row.original.student.email,
    },
    {
      accessorKey: "created_at",
      header: "Enrolled At",
      cell: ({ row }) => new Date(row.original.created_at).toLocaleString(),
    },
    // {
    //   id: "actions",
    //   header: "Actions",
    //   cell: ({ row }) => {
    //     const studentRecord = row.original;
    //     return (
    //       <Button
    //         onClick={() => router.push(`/module-students/${studentRecord.id}`)}
    //         size="sm"
    //       >
    //         Detail
    //       </Button>
    //     );
    //   },
    // },
  ];

  const table = useReactTable({
    data: students ? students.data : [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
  });

  return (
    <div className="w-full overflow-x-auto mt-5">
      {isLoading ? (
        <p>Loading students...</p>
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
                    No students found.
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
              Page {students?.current_page} of {students?.last_page}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (students && page < students.last_page) {
                  setPage((prev) => prev + 1);
                }
              }}
              disabled={students ? page === students.last_page : true}
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

export default StudentClassTable;
