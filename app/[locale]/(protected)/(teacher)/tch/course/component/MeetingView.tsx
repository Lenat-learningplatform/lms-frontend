"use client";

import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

import { handleErrorMessage } from "@/lib/hasPermission";
import MeetingList, { MeetingData } from "./MeetingList";
import MeetingForm from "./MeetingForm";
import { useCoursePermissions } from "@/hooks/useHasPermission";

type MeetingProps = {
  module: string; // assuming you're using module id to fetch meetings and students
  clid: string;
};

const MeetingView: React.FC<MeetingProps> = ({ module, clid }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<
    MeetingData | undefined
  >();

  const queryClient = useQueryClient();

  // Delete mutation for meetings
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/meetings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings", module] });
      toast.success("Meeting deleted successfully!");
    },
    onError: (error) => {
      toast.error(handleErrorMessage(error));
    },
  });

  const handleEdit = (meeting: MeetingData) => {
    setEditingMeeting(meeting);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this meeting?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setEditingMeeting(undefined);
    setIsFormOpen(false);
  };
  const { canCreateMeetings } = useCoursePermissions();
  return (
    <div>
      {canCreateMeetings && (
        <Button onClick={() => setIsFormOpen(true)}>Add New Meeting</Button>
      )}

      <MeetingList
        module={module}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <MeetingForm
        module={module}
        clid={clid}
        open={isFormOpen}
        defaultValues={
          editingMeeting
            ? {
                ...editingMeeting,
                all_day: editingMeeting.all_day ?? false,
                is_custom: editingMeeting.is_custom ?? false,
              }
            : undefined
        }
        handleClose={handleFormClose}
      />
    </div>
  );
};

export default MeetingView;
