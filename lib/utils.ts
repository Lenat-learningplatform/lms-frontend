import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const hexToRGB = (hex: any, alpha?: number): any => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  if (alpha) {
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  } else {
    return `rgb(${r}, ${g}, ${b})`;
  }
};

export const getStatusBadge = (status: string) => {
  // lower case the status for consistency
  status = status.toLowerCase();

  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 rounded-lg px-4";
    case "inactive":
      return "bg-gray-100 text-gray-800 rounded-lg px-4";
    case "pending":
      return "bg-yellow-100 text-yellow-800 rounded-lg px-4";
    case "completed":
      return "bg-green-100 text-green-800 rounded-lg px-4";
    case "incomplete":
      return "bg-gray-100 text-gray-800 rounded-lg px-4";
    default:
      return "bg-gray-200 text-gray-700 rounded-lg px-4";
  }
};

export const changeDateFormat = (date: string | Date): string => {
  //  date that looks like Mon, 01 Jan 2024

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };

  // Convert to Date object if it's a string
  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Format the date
  return dateObj.toLocaleDateString("en-US", options);
};
