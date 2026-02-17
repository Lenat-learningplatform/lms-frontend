"use client";

import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import ChapterMaterialList, {
  ChapterMaterialData,
} from "../../../components/ChapterMaterialList";
import { useParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import ChapterForm, {
  ChapterFormInputs,
} from "../../../components/ChapterMaterialForm";
import { handleErrorMessage } from "@/lib/hasPermission";

const Chapter = () => {
  const params = useParams();
  const chapterId = params.id as string;
  const classId = params.clid as string;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any>();

  const queryClient = useQueryClient();

  // Delete mutation for chapter materials
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/chapter-materials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["chapter-materials", chapterId],
      });
      toast.success("Material deleted successfully!");
    },
    onError: (error) => {
      toast.error(handleErrorMessage(error));
    },
  });

  const handleEdit = (material: ChapterMaterialData) => {
    // Map list data to the form's expected shape.
    // The file field is omitted when editing.
    setEditingMaterial({
      id: material.id,
      chapter_id: material.chapter_id,
      name: material.name,
      description: material.description,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this material?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setEditingMaterial(undefined);
    setIsFormOpen(false);
  };

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold mb-6">Chapter Materials</h1>

          <Button onClick={() => setIsFormOpen(true)}>Add New Material</Button>
        </div>
        <ChapterMaterialList
          chapter_id={chapterId}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        <ChapterForm
          clid={classId}
          chapter_id={chapterId}
          open={isFormOpen}
          defaultValues={editingMaterial}
          handleClose={handleFormClose}
        />
      </div>
    </div>
  );
};

export default Chapter;
