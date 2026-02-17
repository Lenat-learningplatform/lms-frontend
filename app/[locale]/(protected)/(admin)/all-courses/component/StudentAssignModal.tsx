"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import api from "@/lib/api";
import { handleErrorMessage } from "@/lib/hasPermission";

// Define the Student data type
export type StudentData = {
  id: string;
  name: string;
  email: string;
  phone: string;
  username: string;
  current_team_id: string | null;
  created_at: string;
  deleted_at: string | null;
  profile_photo_url: string;
};

type StudentAssignModalProps = {
  classId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const StudentAssignModal: React.FC<StudentAssignModalProps> = ({
  classId,
  open,
  onOpenChange,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  // Fetch students only when there's a search query
  const {
    data: students,
    isLoading,
    isError,
    error,
  } = useQuery<StudentData[]>({
    queryKey: ["studentSearch", searchQuery],
    queryFn: async () => {
      const response = await api.get(
        `get-students?search=${encodeURIComponent(searchQuery)}`
      );
      return response.data.data.data;
    },
    enabled: !!searchQuery,
  });

  // Mutation to assign a student to the class
  const assignMutation = useMutation({
    mutationFn: (studentId: string) =>
      api.post(`/assign-students/${classId}`, { student_ids: [studentId] }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["courseStudents", classId],
      });
      toast.success("Student assigned successfully!");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(handleErrorMessage(error));
    },
  });

  const handleAssign = (studentId: string) => {
    assignMutation.mutate(studentId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Student</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search student by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {isLoading && <p>Searching students...</p>}
          {isError && <p>Error: {(error as any).message}</p>}
          {students && students.length > 0 ? (
            <ul className="space-y-2">
              {students.map((student) => (
                <li key={student.id} className="flex items-center gap-2">
                  <Image
                    src={student.profile_photo_url}
                    alt={student.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full"
                    unoptimized
                  />
                  <span>{student.name}</span>
                  <Button onClick={() => handleAssign(student.id)} size="sm">
                    Assign
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            searchQuery && <p>No students found.</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StudentAssignModal;
