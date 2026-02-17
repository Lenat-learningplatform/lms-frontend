"use client";
import React, { useState, useCallback } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { handleErrorMessage } from "@/lib/hasPermission";

const profileSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  last_name: z.string().min(1, { message: "Last name is required" }),
  gender: z.string().optional(),
  grade_level: z.string().optional(),
  school: z.string().optional(),
  time_zone: z.string().optional(),
});

const passwordSchema = z
  .object({
    current_password: z
      .string()
      .min(6, { message: "Current password is required" }),
    new_password: z
      .string()
      .min(6, { message: "New password must be at least 6 characters" })
      .regex(/[A-Z]/, {
        message: "New password must contain at least one uppercase letter",
      })
      .regex(/[a-z]/, {
        message: "New password must contain at least one lowercase letter",
      })
      .regex(/[0-9]/, {
        message: "New password must contain at least one number",
      })
      .regex(/[!@#$%^&*(),.?":{}|<>]/, {
        message: "New password must contain at least one special character",
      }),
    confirm_new_password: z.string().min(6, {
      message: "Confirm new password must be at least 6 characters",
    }),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    message: "Passwords do not match",
    path: ["confirm_new_password"],
  });

const UserProfilePage = () => {
  const queryClient = useQueryClient();

  type ProfileData = {
    profile_photo_url: string;
    name: string;
    email: string;
  };

  const {
    register: profileRegister,
    handleSubmit: handleProfileSubmit,
    setValue: setProfileValue,
    watch: watchProfile,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    mode: "all",
    defaultValues: {
      name: "",
      last_name: "",
      gender: "",
      grade_level: "",
      school: "",
      time_zone: "",
    },
  });
  const {
    register: passwordRegister,
    handleSubmit: handlePasswordSubmit,
    setValue: setPasswordValue,
    watch: watchPassword,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    mode: "all",
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_new_password: "",
    },
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showImageActions, setShowImageActions] = useState(false);

  const {
    data: profileData,
    isLoading: isProfileLoading,
    isError: isProfileError,
    error: profileError,
  } = useQuery<ProfileData, Error>({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await api.get("/my-profile");
      return response.data.data as ProfileData;
    },
  });

  React.useEffect(() => {
    if (profileData) {
      // try to split full name into first / last name when possible
      const fullName = (profileData.name || "").trim();
      const parts = fullName.length ? fullName.split(/\s+/) : [];
      const first = parts.length ? parts[0] : "";
      const last = parts.length > 1 ? parts.slice(1).join(" ") : "";

      setProfileValue("name", first);
      setProfileValue("last_name", last);
      // the API payload doesn't include gender/grade/school/timezone in this response;
      // clear or leave existing values as appropriate
      setProfileValue("gender", "");
      setProfileValue("grade_level", "");
      setProfileValue("school", "");
      setProfileValue("time_zone", "");
    }
  }, [profileData, setProfileValue]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: {
      name?: string;
      last_name?: string;
      gender?: string;
      grade_level?: string;
      school?: string;
      time_zone?: string;
    }) => {
      await api.post("/update-profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(handleErrorMessage(error));
      console.error("Error updating profile:", error);
    },
  });

  const updateProfileImageMutation = useMutation({
    mutationFn: async (image: File) => {
      const formData = new FormData();
      formData.append("profile_image", image);
      const response = await api.post("/update-profile-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile image updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(handleErrorMessage(error));
      console.error("Error updating profile image:", error);
    },
  });

  const removeProfileImageMutation = useMutation({
    mutationFn: async () => {
      await api.post("/remove-profile-image");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile image removed successfully!");
    },
    onError: (error: Error) => {
      toast.error(handleErrorMessage(error));
      console.error("Error removing profile image:", error);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: {
      current_password: string;
      new_password: string;
      confirm_new_password: string;
    }) => {
      await api.post("/change-password", data);
    },
    onSuccess: () => {
      setShowPasswordModal(false);
      toast.success("Password changed successfully!");
    },
    onError: (error: Error) => {
      toast.error(handleErrorMessage(error));
    },
  });

  // react-query mutation loading flag (typed as any to avoid strict type issues)
  const changePasswordLoading = (changePasswordMutation as any).isLoading ?? false;

  if (isProfileLoading)
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  return (
    <div className="container mx-auto  bg-white rounded-lg border border-brand-border p-10">
      {isProfileLoading ? (
        <p>Loading profile...</p>
      ) : isProfileError ? (
        <p className="text-red-500">
          {profileError?.message || "Failed to load profile."}
        </p>
      ) : (
        profileData && (
          <>
            <div className="flex items-center space-x-4  justify-between mb-20">
              <div className="flex items-center space-x-4 ">
                <div
                  className="relative cursor-pointer"
                  onClick={() => setShowImageActions((prev) => !prev)}
                >
                  <img
                    src={profileData.profile_photo_url}
                    alt="Profile"
                    width={64}
                    height={64}
                    className="rounded-full"
                  />
                  {showImageActions && (
                    <div className="absolute top-0 left-0 mt-16 flex space-x-2">
                      <label className="flex items-center space-x-1 text-blue-500 cursor-pointer">
                        <UploadCloud size={16} />
                        <span>Update</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              updateProfileImageMutation.mutate(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-semibold">{profileData.name}</h2>
                  <p className="text-gray-500">{profileData.email}</p>
                </div>
              </div>
              <Button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="rounded-full"
              >
                Change Password
              </Button>
            </div>

            {/* Update profile form */}
            <form
              onSubmit={handleProfileSubmit((data) =>
                updateProfileMutation.mutate(data)
              )}
              className="grid grid-cols-2 gap-4 mb-6"
            >
              <div>
                <Label>Name</Label>
                <Input {...profileRegister("name")} placeholder="Your Name" />
                {profileErrors.name && (
                  <p className="text-destructive mt-2 text-sm">
                    {profileErrors.name.message}
                  </p>
                )}
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  {...profileRegister("last_name")}
                  placeholder="Your Last Name"
                />
                {profileErrors.last_name && (
                  <p className="text-destructive mt-2 text-sm">
                    {profileErrors.last_name.message}
                  </p>
                )}
              </div>
              <div>
                <Label>Gender</Label>
                <select
                  {...profileRegister("gender")}
                  className="w-full border rounded p-2"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label>Grade Level</Label>
                <Input
                  {...profileRegister("grade_level")}
                  placeholder="Grade Level"
                />
              </div>
              <div>
                <Label>School</Label>
                <Input {...profileRegister("school")} placeholder="School" />
              </div>
              <div>
                <Label>Time Zone</Label>
                <select
                  {...profileRegister("time_zone")}
                  className="w-full border rounded p-2"
                >
                  <option value="">Select Time Zone</option>
                  <option value="UTC-12">UTC-12:00</option>
                  <option value="UTC-11">UTC-11:00</option>
                  <option value="UTC-10">UTC-10:00</option>
                  <option value="UTC-9">UTC-09:00</option>
                  <option value="UTC-8">UTC-08:00</option>
                  <option value="UTC-7">UTC-07:00</option>
                  <option value="UTC-6">UTC-06:00</option>
                  <option value="UTC-5">UTC-05:00</option>
                  <option value="UTC-4">UTC-04:00</option>
                  <option value="UTC-3">UTC-03:00</option>
                  <option value="UTC-2">UTC-02:00</option>
                  <option value="UTC-1">UTC-01:00</option>
                  <option value="UTC+0">UTC+00:00</option>
                  <option value="UTC+1">UTC+01:00</option>
                  <option value="UTC+2">UTC+02:00</option>
                  <option value="UTC+3">UTC+03:00</option>
                  <option value="UTC+4">UTC+04:00</option>
                  <option value="UTC+5">UTC+05:00</option>
                  <option value="UTC+5:30">UTC+05:30</option>
                  <option value="UTC+6">UTC+06:00</option>
                  <option value="UTC+7">UTC+07:00</option>
                  <option value="UTC+8">UTC+08:00</option>
                  <option value="UTC+9">UTC+09:00</option>
                  <option value="UTC+10">UTC+10:00</option>
                  <option value="UTC+11">UTC+11:00</option>
                  <option value="UTC+12">UTC+12:00</option>
                  <option value="UTC+13">UTC+13:00</option>
                  <option value="UTC+14">UTC+14:00</option>
                </select>
              </div>
              <div className="col-span-2 flex justify-end">
                <Button type="submit" className="!px-10 mt-28 rounded-full">
                  Save
                </Button>
              </div>
            </form>

            {/* Change password form */}
            {showPasswordModal && (
              <Dialog
                onOpenChange={(open) => setShowPasswordModal(open)}
                open={showPasswordModal}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={handlePasswordSubmit((data) =>
                      changePasswordMutation.mutate(data)
                    )}
                    className="space-y-4"
                  >
                    <div>
                      <Label>Current Password</Label>
                      <Input
                        {...passwordRegister("current_password")}
                        type="password"
                        placeholder="Current Password"
                      />
                      {passwordErrors.current_password && (
                        <p className="text-destructive mt-2 text-sm">
                          {passwordErrors.current_password.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>New Password</Label>
                      <Input
                        {...passwordRegister("new_password")}
                        type="password"
                        placeholder="New Password"
                      />
                      {passwordErrors.new_password && (
                        <p className="text-destructive mt-2 text-sm">
                          {passwordErrors.new_password.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>Confirm New Password</Label>
                      <Input
                        {...passwordRegister("confirm_new_password")}
                        type="password"
                        placeholder="Confirm New Password"
                      />
                      {passwordErrors.confirm_new_password && (
                        <p className="text-destructive mt-2 text-sm">
                          {passwordErrors.confirm_new_password.message}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        color="secondary"
                        onClick={() => setShowPasswordModal(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="px-6"
                        disabled={changePasswordLoading}
                      >
                        {changePasswordLoading ? (
                          <div className="flex items-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Saving...
                          </div>
                        ) : (
                          "Save"
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </>
        )
      )}
    </div>
  );
};

export default UserProfilePage;
