"use client";

import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import CourseTable from "./component/CourseTable";
import CourseForm from "./component/CourseForm";
import { handleErrorMessage } from "@/lib/hasPermission";
import { useHasPermission } from "@/hooks/useHasPermission";
import PermissionDenied from "@/components/Permission";

type CourseEdit = {
  id: string;
  title: string;
  description: string;
  price: number;
  cover: string;
};

const Page = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState("");
  const [edit, setEdit] = useState<CourseEdit>({
    id: "",
    title: "",
    description: "",
    price: 0,
    cover: "",
  });

  const handleEdit = (courseData: CourseEdit) => {
    setEdit(courseData);
    setIsModalOpen(true);
  };

  const handleNewCourse = () => {
    setEdit({
      id: "",
      title: "",
      description: "",
      price: 0,
      cover: "",
    });
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setEdit({
      id: "",
      title: "",
      description: "",
      price: 0,
      cover: "",
    });
    setIsModalOpen(false);
    setDeleteModal("");
  };

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (courseId: string) => api.delete(`/modules/${courseId}`),
    onSuccess: () => {
      toast.success("Course deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error) => {
      toast.error(handleErrorMessage(error));
    },
  });

  const handleDelete = async () => {
    try {
      mutation.mutate(deleteModal);
      handleClose();
    } catch (err: any) {}
  };
  const createCourse = useHasPermission("create_module");
  const deleteCourse = useHasPermission("delete_module");
  const viewCourse = useHasPermission("read_module");

  if (!viewCourse) {
    return <PermissionDenied ending="view courses" />;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-semibold text-gray-800">Courses</h1>
        {createCourse && (
          <Button variant="default" onClick={handleNewCourse}>
            Add New Course
          </Button>
        )}
      </div>

      {/* Modal for add/edit course */}
      <Dialog open={isModalOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {edit?.title ? "Edit Course" : "Add New Course"}
            </DialogTitle>
          </DialogHeader>
          <CourseForm defaultValues={edit} handleClose={handleClose} />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation modal */}
      <Dialog open={!!deleteModal} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to delete this course?
            </DialogTitle>
          </DialogHeader>
          <Button
            className="bg-red-500"
            disabled={!deleteCourse}
            onClick={handleDelete}
          >
            Yes Delete
          </Button>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogContent>
      </Dialog>

      <CourseTable setEdit={handleEdit} setDeleteModal={setDeleteModal} />
    </>
  );
};

export default Page;
