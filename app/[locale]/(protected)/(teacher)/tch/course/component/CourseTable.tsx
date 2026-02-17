"use client";

import React, { useState } from "react";
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
import api from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { useRouter } from "next/navigation";

export type CourseData = {
  id: string;
  module_id: string;
  title: string;
  description: string;
  price: number;
  cover: { url: string };
  created_at: string;
};

export type CourseEdit = {
  id: string;
  title: string;
  description: string;
  price: number;
  cover: string;
};

// Define a paginated response type for courses
export type PaginatedCourse = {
  data: CourseData[];
  current_page: number;
  last_page: number;
};

type Props = {
  setEdit: (course: CourseEdit) => void;
  setDeleteModal: (courseId: string) => void;
};

const CourseTable: React.FC<Props> = ({ setEdit, setDeleteModal }) => {
  const router = useRouter();
  const [page, setPage] = useState(1);

  // Update the query function to return a paginated response
  const {
    data: courses,
    isLoading,
    isError,
    isSuccess,
    error,
  } = useQuery({
    queryKey: ["my-courses", page],
    queryFn: async (): Promise<PaginatedCourse> => {
      const response = await api.get("my-modules", { params: { page } });
      return response.data.data; // Assumes response.data is in the shape of PaginatedCourse
    },
  });

  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Action handler for course actions
  const handleCourseAction = (action: string, course: CourseData) => {
    if (action === "detail") {
      router.push(`/tch/course/${course.module_id}/class/${course.id}`);
    } else if (action === "view") {
      alert(`Viewing Course: ${course.title}`);
    } else if (action === "edit") {
      setEdit({
        id: course.id,
        title: course.title,
        description: course.description,
        price: course.price,
        cover: course.cover.url,
      });
    } else if (action === "delete") {
      setDeleteModal(course.id);
    }
  };

  const columns: ColumnDef<CourseData>[] = [
    {
      accessorKey: "cover",
      header: "",
      cell: ({ row }) => {
        const cover = row.getValue("cover") as { url: string };
        const title = row.getValue("title") as string;
        return (
          <Image
            src={cover.url}
            alt={title}
            width={40}
            height={40}
            className="w-10 h-10 object-cover rounded"
            unoptimized
          />
        );
      },
    },
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return description.substring(0, 50) + "...";
      },
    },
    // {
    //   accessorKey: "created_at",
    //   header: "Created At",
    //   cell: ({ row }) =>
    //     new Date(row.getValue("created_at") as string).toLocaleString(),
    // },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const zCourse = row.original;
        return (
          // <Select onValueChange={(value) => handleCourseAction(value, zCourse)}>
          //   <SelectTrigger className="w-[120px]">
          //     <SelectValue placeholder="Actions" />
          //   </SelectTrigger>
          //   <SelectContent>
          //     <SelectItem value="detail">🔍 Detail</SelectItem>
          //     <SelectItem value="view">👁️ View</SelectItem>
          //     <SelectItem value="edit">✏️ Edit</SelectItem>
          //     <SelectItem value="delete">🗑️ Delete</SelectItem>
          //   </SelectContent>
          // </Select>
          <Button
            // variant="outline"
            size="sm"
            onClick={() => handleCourseAction("detail", zCourse)}
          >
            Detail
          </Button>
        );
      },
    },
  ];

  // Use courses.data as the table data when the query is successful
  const table = useReactTable({
    data: isSuccess && courses ? courses.data : [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
  });

  if (isLoading) return <p>Loading courses...</p>;
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
                No courses found.
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
          Page {courses?.current_page} of {courses?.last_page}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            if (courses && page < courses.last_page) {
              setPage((prev) => prev + 1);
            }
          }}
          disabled={courses ? page === courses.last_page : true}
          className="w-8 h-8"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default CourseTable;
