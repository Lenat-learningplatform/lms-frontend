"use client";

import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import AnnouncementForm from "./AnnouncementForm";
import { handleErrorMessage } from "@/lib/hasPermission";
import AnnouncementList, { AnnouncementData } from "./AnnouncementList";

type AnnouncementProps = {
  courseId: string;
};

const AnnouncementView: React.FC<AnnouncementProps> = ({ courseId }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<
    AnnouncementData | undefined
  >();

  const queryClient = useQueryClient();

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/announcements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Announcement deleted successfully!");
    },
    onError: (error) => {
      toast.error(handleErrorMessage(error));
    },
  });

  const handleEdit = (announcement: AnnouncementData) => {
    setEditingAnnouncement(announcement);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this announcement?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setEditingAnnouncement(undefined);
    setIsFormOpen(false);
  };

  return (
    <div>
      <div className="">
        <div className="flex justify-between items-center">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setIsFormOpen(true)}>
              Add New Announcement
            </Button>
          </div>
        </div>
        <AnnouncementList
          courseId={courseId}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        <AnnouncementForm
          courseId={courseId}
          open={isFormOpen}
          defaultValues={editingAnnouncement} // This should now work with the updated form
          handleClose={handleFormClose}
        />
      </div>
    </div>
  );
};

export default AnnouncementView;
