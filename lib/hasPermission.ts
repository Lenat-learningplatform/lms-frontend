// utils/hasPermission.ts

import { Role } from "./type";

/**
 * Check if any of the user's roles include a specific permission.
 * @param roles - The roles array from the user session.
 * @param permission - The permission name to check for.
 * @returns True if the permission is found; false otherwise.
 */
export function hasPermission(
  roles: Role[] | undefined,
  permission: string
): boolean {
  if (!roles) return false;
  // Special case: if permission is "any", always return true.
  if (permission === "any") return true;

  // Loop through roles and check if any contain the permission.
  for (const role of roles) {
    if (
      role.permissions &&
      role.permissions.some((perm) => perm.name === permission)
    ) {
      return true;
    }
  }
  return false;
}

export function handleErrorMessage(error: any) {
 
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return error.response.data.data.message;
  } else if (error.request) {
    // The request was made but no response was received
    return "No response was received from the server.";
  } else {
    // Something happened in setting up the request that triggered an Error
    return error.message;
  }
}
