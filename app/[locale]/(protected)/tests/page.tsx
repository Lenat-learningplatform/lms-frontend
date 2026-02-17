"use client";

import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import TestList, { TestData } from "./components/TestList";
import TestForm from "./components/TestForm";
import { handleErrorMessage } from "@/lib/hasPermission";

const Tests = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<TestData | undefined>();

  const queryClient = useQueryClient();

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/tests/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tests"] });
      toast.success("Test deleted successfully!");
    },
    onError: (error) => {
      toast.error(handleErrorMessage(error));
    },
  });

  const handleEdit = (test: TestData) => {
    setEditingTest(test);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this test?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setEditingTest(undefined);
    setIsFormOpen(false);
  };

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Tests</h1>
        <div className="flex justify-end mb-4">
          <Button onClick={() => setIsFormOpen(true)}>Add New Test</Button>
        </div>
        {/* <TestList onEdit={handleEdit} onDelete={handleDelete} /> */}
        {/* <TestForm
          open={isFormOpen}
          defaultValues={editingTest}
          handleClose={handleFormClose}
        /> */}
      </div>
    </div>
  );
};

export default Tests;
