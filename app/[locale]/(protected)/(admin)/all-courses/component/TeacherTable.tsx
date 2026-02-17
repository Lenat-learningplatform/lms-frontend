"use client";

import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import Image from "next/image";
import { toast } from "sonner";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { handleErrorMessage } from "@/lib/hasPermission";

// Teacher types based on your API response
export type TeacherData = {
  id: string;
  name: string;
  email: string;
  phone: string;
  username: string;
  // bod is ignored
  current_team_id: string | null;
  created_at: string;
  deleted_at: string | null;
  profile_photo_url: string;
};

export type TeacherPaginatedResponse = {
  current_page: number;
  data: TeacherData[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: any[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
};

type TeacherTableProps = {
  courseId: string;
};

const TeacherTable: React.FC<TeacherTableProps> = ({ courseId }) => {
  // Local state for pagination and assignment confirmation
  const [page, setPage] = React.useState(1);
  const [selectedTeacher, setSelectedTeacher] =
    React.useState<TeacherData | null>(null);

  // Fetch teachers from your API endpoint "get-teachers"
  const {
    data: teacherResponse,
    isLoading,
    isError,
    error,
  } = useQuery<TeacherPaginatedResponse>({
    queryKey: ["teachers", page],
    queryFn: async () => {
      const response = await api.get(`get-teachers?page=${page}`);
      return response.data.data; // Assumes API returns the full paginated object
    },
  });

  // Mutation to assign a teacher to the module
  const assignMutation = useMutation({
    mutationFn: (teacherId: string) =>
      api.post(`/assign-teachers/${courseId}`, { teacher_ids: [teacherId] }),
    onSuccess: () => {
      toast.success("Teacher assigned successfully!");
    },
    onError: (error) => {
      toast.error(handleErrorMessage(error));
    },
  });

  // Handler for confirming the assignment
  const handleConfirmAssign = () => {
    if (selectedTeacher) {
      assignMutation.mutate(selectedTeacher.id);
      setSelectedTeacher(null);
    }
  };

  // Define columns for the react-table
  const columns: ColumnDef<TeacherData>[] = [
    {
      accessorKey: "profile_photo_url",
      header: "Profile",
      cell: ({ row }) => (
        <Image
          src={row.getValue("profile_photo_url")}
          alt={row.getValue("name")}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover"
          unoptimized
        />
      ),
    },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "username", header: "Username" },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => new Date(row.getValue("created_at")).toLocaleString(),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const teacher = row.original;
        return (
          <Select
            onValueChange={(value) => {
              if (value === "assign") {
                setSelectedTeacher(teacher);
              }
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="assign">Assign</SelectItem>
            </SelectContent>
          </Select>
        );
      },
    },
  ];

  // Create the table instance
  const table = useReactTable({
    data: teacherResponse?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <p>Loading teachers...</p>;
  if (isError) return <p>Error: {(error as any).message}</p>;

  return (
    <>
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

        {/* Custom Pagination Controls */}
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
            Page {teacherResponse?.current_page} of {teacherResponse?.last_page}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (teacherResponse && page < teacherResponse.last_page) {
                setPage((prev) => prev + 1);
              }
            }}
            disabled={
              teacherResponse ? page === teacherResponse.last_page : true
            }
            className="w-8 h-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {selectedTeacher && (
        <Dialog open onOpenChange={() => setSelectedTeacher(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Confirm Assignment</DialogTitle>
            </DialogHeader>
            <p className="mb-4">
              Are you sure you want to assign{" "}
              <strong>{selectedTeacher.name}</strong> to this module?
            </p>
            <DialogFooter>
              <Button onClick={handleConfirmAssign}>Confirm</Button>
              <Button
                variant="outline"
                onClick={() => setSelectedTeacher(null)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default TeacherTable;
