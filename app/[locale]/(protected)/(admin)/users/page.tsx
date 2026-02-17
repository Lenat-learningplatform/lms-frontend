"use client";

import React, { useState } from "react";
import UserForm from "./component/user-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UserTable from "./component/UserTable";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { handleErrorMessage } from "@/lib/hasPermission";
import { useHasPermission } from "@/hooks/useHasPermission";
import PermissionDenied from "@/components/Permission";

type Edit = {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  roles: string[];
  bod: string; // added property
};

const Page = () => {
  // State to manage the modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState("");

  // State to store user data for editing
  const [edit, setEdit] = useState<Edit>({
    id: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    roles: [],
    bod: "", // initialize bod as an empty string
  });

  // Function to open modal and set user data
  const handleEdit = (userData: Edit) => {
    setEdit(userData);
    setIsModalOpen(true);
  };

  // Function to open the modal for a new user
  const handleNewUser = () => {
    setEdit({
      id: "",
      name: "",
      email: "",
      phone: "",
      password: "",
      roles: [],
      bod: "", // add default bod value
    });
    setIsModalOpen(true);
  };

  // Function to reset state when modal is closed
  const handleClose = () => {
    setEdit({
      id: "",
      name: "",
      email: "",
      phone: "",
      password: "",
      roles: [],
      bod: "", // reset bod value
    });
    setIsModalOpen(false);
    setDeleteModal("");
  };
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (userId: string) => api.delete(`/users/${userId}`),
    onSuccess: () => {
      toast.success("User details saved successfully!");
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
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

  const createUser = useHasPermission("create_user");
  const deleteUser = useHasPermission("delete_user");
  const viewUser = useHasPermission("read_user");
  const readRoles = useHasPermission("read_role");

  if (!viewUser) {
    return <PermissionDenied ending={"view users"} />;
  }
  if (!readRoles) {
    return <PermissionDenied ending={"view roles"} />;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-semibold text-gray-800">Users</h1>
        {/* Button to open modal for adding a new user */}
        {createUser && (
          <Button variant="default" onClick={handleNewUser}>
            Add New User
          </Button>
        )}
      </div>

      {/* Controlled Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {edit?.name ? "Edit User" : "Add New User"}
            </DialogTitle>
          </DialogHeader>
          <UserForm defaultValues={edit} handleClose={handleClose} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteModal} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to delete this user?
            </DialogTitle>
          </DialogHeader>
          <Button
            className="bg-red-500"
            disabled={deleteUser}
            onClick={handleDelete}
          >
            Yes Delete
          </Button>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogContent>
      </Dialog>

      {/* Pass handleEdit function to UserTable */}
      <UserTable setEdit={handleEdit} setDeleteModal={setDeleteModal} />
    </>
  );
};

export default Page;
