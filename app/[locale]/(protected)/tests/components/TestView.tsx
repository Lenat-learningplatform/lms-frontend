"use client";

import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import TestList, { TestData } from "./TestList";
import TestForm from "./TestForm";
import { handleErrorMessage } from "@/lib/hasPermission";
type Test = {
  model_type: "chapter" | "module";
  id: string;
  clid: string;
};

const TestView: React.FC<Test> = ({ model_type, id, clid }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<TestData | undefined>();

  const queryClient = useQueryClient();

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (clid: string) => {
      return api.delete(`/tests/${clid}`);
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
  console.log({ editingTest });
  return (
    <div>
      <div className="">
        <div className="flex justify-between items-center">
          {/* <h1 className="text-3xl font-bold mb-6">Tests</h1> */}
          <div className="flex justify-end mb-4">
            <Button onClick={() => setIsFormOpen(true)}>Add New Test</Button>
          </div>
        </div>
        <TestList
          model_type={model_type}
          id={id}
          clid={clid}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        <TestForm
          id={clid}
          clid={clid}
          model_type={model_type}
          open={isFormOpen}
          defaultValues={editingTest}
          handleClose={handleFormClose}
        />
      </div>
    </div>
  );
};

export default TestView;
