"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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

export type TeacherData = {
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

type TeacherAssignModalProps = {
  courseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const TeacherAssignModal: React.FC<TeacherAssignModalProps> = ({
  courseId,
  open,
  onOpenChange,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Fire the query only if there is a search query
  const {
    data: teachers,
    isLoading,
    isError,
    error,
  } = useQuery<TeacherData[]>({
    queryKey: ["teacherSearch", searchQuery],
    queryFn: async () => {
      const response = await api.get(
        `get-teachers?search=${encodeURIComponent(searchQuery)}`
      );
      return response.data.data.data;
    },
    enabled: !!searchQuery,
  });

  // Mutation to assign teacher to module
  const assignMutation = useMutation({
    mutationFn: (teacherId: string) =>
      api.post(`/assign-teachers/${courseId}`, { teacher_ids: [teacherId] }),
    onSuccess: () => {
      toast.success("Teacher assigned successfully!");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(handleErrorMessage(error));
    },
  });

  const handleAssign = (teacherId: string) => {
    assignMutation.mutate(teacherId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Teacher</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search teacher by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {isLoading && <p>Searching teachers...</p>}
          {isError && <p>Error: {(error as any).message}</p>}
          {teachers && teachers.length > 0 ? (
            <ul className="space-y-2">
              {teachers.map((teacher) => (
                <li key={teacher.id} className="flex items-center gap-2">
                  <Image
                    src={teacher.profile_photo_url}
                    alt={teacher.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full"
                    unoptimized
                  />
                  <span>{teacher.name}</span>
                  <Button onClick={() => handleAssign(teacher.id)} size="sm">
                    Assign
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            searchQuery && <p>No teachers found.</p>
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

export default TeacherAssignModal;
