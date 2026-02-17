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
import { Label } from "@radix-ui/react-label";
import { useHasPermission } from "@/hooks/useHasPermission";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

// Define the user data type based on your API response
export type UserData = {
  id: string;
  name: string;
  email: string;
  phone: string;
  username: string;
  profile_photo_url: string;
  roles: { uuid: string; name: string }[];
  created_at: string;
  student: {
    id: string;
    user_id: string;
    parent_name: string;
    country: string;
    grade_label: string;
    support_subjects: string;
    learning_goals: string;
    device_access: string;
    tutoring_times: string;
    created_at: string;
  } | null;
};

// Define the Edit state type
export type Edit = {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  roles: string[];
  bod: string;
};

// Paginated response type for users
export type UserPaginatedResponse = {
  current_page: number;
  data: UserData[];
  last_page: number;
  // ... add other pagination fields if needed
};

type Props = {
  setEdit: (user: Edit) => void;
  setDeleteModal: (userId: string) => void;
};

const fetchRoles = async (): Promise<{ uuid: string; name: string }[]> => {
  const response = await api.get("roles");
  return response.data.data;
};

const fetchUsers = async (
  role: string,
  page: number
): Promise<UserPaginatedResponse> => {
  const response = await api.get(`users?role=${role}&page=${page}`);
  return response.data.data;
};

const UserTable: React.FC<Props> = ({ setEdit, setDeleteModal }) => {
  const [rolesState, setRoles] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] =
    useState<UserData["student"]>(null);
  const createUser = useHasPermission("create_user");
  const updateUser = useHasPermission("update_user");
  const deleteUser = useHasPermission("delete_user");
  const viewUser = useHasPermission("read_user");
  const readRoles = useHasPermission("read_role");
  const {
    data: roles,
    isLoading: rolesIsLoading,
    isError: rolesIsError,
    error: rolesError,
  } = useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
  });

  const {
    data: users,
    isLoading,
    isError,
    error,
    isSuccess,
  } = useQuery({
    queryKey: ["users", rolesState, page],
    queryFn: () => fetchUsers(rolesState, page),
    enabled: !!rolesState,
  });

  // Sorting state is always initialized
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<UserData>[] = [
    {
      accessorKey: "profile_photo_url",
      header: "Profile",
      cell: ({ row }) => (
        <img
          src={row.getValue("profile_photo_url")}
          alt={row.getValue("name")}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full"
        />
      ),
    },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "username", header: "Username" },
    {
      accessorKey: "roles",
      header: "Roles",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          {(row.getValue("roles") as { name: string }[]).map((role) => (
            <span
              key={role.name}
              className="bg-gray-200 text-gray-700 px-2 py-1 rounded"
            >
              {role.name}
            </span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "student",
      header: "Student Info",
      cell: ({ row }) => {
        const st = row.original.student;
        return st ? `${st.parent_name} (${st.grade_label})` : "-";
      },
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => new Date(row.getValue("created_at")).toLocaleString(),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <Select
            onValueChange={(value) =>
              handleUserAction(value, user, setEdit, setDeleteModal)
            }
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Actions" />
            </SelectTrigger>
            <SelectContent>
              {viewUser && <SelectItem value="view">👁️ View</SelectItem>}
              {updateUser && <SelectItem value="edit">✏️ Edit</SelectItem>}
              {deleteUser && <SelectItem value="delete">🗑️ Delete</SelectItem>}
            </SelectContent>
          </Select>
        );
      },
    },
  ];

  const handleUserAction = (
    action: string,
    user: UserData,
    setEdit: (user: Edit) => void,
    setDeleteModal: (userId: string) => void
  ) => {
    if (action === "view") {
      if (user.student) {
        setSelectedStudent(user.student);
        setDialogOpen(true);
      } else {
        alert("No student information available.");
      }
    } else if (action === "edit") {
      setEdit({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        password: "", // Leave password empty for security reasons
        roles: user.roles.map((role) => role.uuid),
        bod: "", // reset bod value
      });
    } else if (action === "delete") {
      setDeleteModal(user.id);
    }
  };

  // Always call useReactTable, even if users data is empty
  const table = useReactTable({
    data: isSuccess ? users?.data : [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
  });

  return (
    <>
      <div className="w-full overflow-x-auto">
        {/* Roles Select Section */}
        <div className="space-y-2 mb-3">
          <Label htmlFor="roles" className="font-medium text-default-600">
            Roles
          </Label>
          {rolesIsLoading ? (
            <p>Loading roles...</p>
          ) : rolesIsError ? (
            <p className="text-red-500">
              {rolesError?.message || "Failed to load roles."}
            </p>
          ) : (
            <Select
              onValueChange={(value) => {
                setRoles(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles?.map((role) => (
                  <SelectItem key={role.uuid} value={role.name}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        {/* Conditionally render table or prompt */}
        {rolesState ? (
          <>
            {isLoading ? (
              <p>Loading users...</p>
            ) : isError ? (
              <p>Error: {(error as any).message}</p>
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
                          No users found.
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
                    Page {users?.current_page} of {users?.last_page}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (users && page < users.last_page) {
                        setPage((prev) => prev + 1);
                      }
                    }}
                    disabled={users ? page === users.last_page : true}
                    className="w-8 h-8"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </>
        ) : (
          <p className="text-center">Please select a role to view users.</p>
        )}
      </div>

      {/* Student Info Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent size="md" className="bg-white p-6 rounded-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold mb-4">
              Student Information
            </DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <DialogDescription className="space-y-3 text-sm text-gray-700">
              <p>
                <strong>Parent Name:</strong> {selectedStudent.parent_name}
              </p>
              <p>
                <strong>Country:</strong> {selectedStudent.country}
              </p>
              <p>
                <strong>Grade:</strong> {selectedStudent.grade_label}
              </p>
              <p>
                <strong>Subjects:</strong>{" "}
                {(() => {
                  try {
                    const list = JSON.parse(selectedStudent.support_subjects);
                    return Array.isArray(list)
                      ? list.join(", ")
                      : selectedStudent.support_subjects;
                  } catch {
                    return selectedStudent.support_subjects;
                  }
                })()}
              </p>
              <p>
                <strong>Learning Goals:</strong>{" "}
                {selectedStudent.learning_goals}
              </p>
              {/* <p>
                <strong>Device Access:</strong> {selectedStudent.device_access}
              </p> */}
              <p>
                <strong>Tutoring Times:</strong>{" "}
                {selectedStudent.tutoring_times}
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {new Date(selectedStudent.created_at).toLocaleString()}
              </p>
            </DialogDescription>
          )}
          <DialogClose className="mt-6 bg-[#0071B9] text-white px-4 py-2 rounded-md hover:bg-[#005a8c] transition-colors self-end">
            Close
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserTable;
