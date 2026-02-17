// hooks/useHasPermission.ts
import { hasPermission } from "@/lib/hasPermission";
import { useSession } from "next-auth/react";

export const useHasPermission = (permission: string): boolean => {
  const { data: session } = useSession();
  // session.user.roles should match the Role[] type defined earlier.
  return hasPermission(session?.user.roles, permission);
};

export const useCoursePermissions = () => {
  return {
    canCreateCourse: useHasPermission("create_module"),
    canUpdateCourse: useHasPermission("update_module"),
    canReadPermission: useHasPermission("read_permission"),
    canViewMeetings: useHasPermission("read_meeting"),
    canCreateMeetings: useHasPermission("create_meeting"),
    canDeleteMeetings: useHasPermission("delete_meeting"),
    canUpdateMeetings: useHasPermission("update_meeting"),
    canReadDiscussion: useHasPermission("read_discussion"),
    canCreateDiscussion: useHasPermission("create_discussion"),
    canUpdateDiscussion: useHasPermission("update_discussion"),
    canDeleteDiscussion: useHasPermission("delete_discussion"),
  };
};

export const useGetLink = () => {
  const { data: session, status } = useSession();
  if (status === "authenticated" && session?.user.roles) {
    const roles = session.user.roles;
    if (hasPermission(roles, "read_my_enrolled_module")) {
      return "/my-courses/courses";
    } else if (hasPermission(roles, "read_teacher")) {
      return "/all-courses";
    } else if (hasPermission(roles, "read_my_module")) {
      return "/tch/course";
    } else if (hasPermission(roles, "read_permission")) {
      return "/roles";
    }
  }
};
