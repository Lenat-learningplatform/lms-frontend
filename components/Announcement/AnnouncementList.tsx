"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

// types/announcement.ts
export type AnnouncementData = {
  id: string;
  title: string;
  content: string;
  start_date: string; // Adding optional fields that might be in your form
  end_date: string;
  is_custom: boolean;
  student_ids: string[];
  created_at: string;
};

type AnnouncementListProps = {
  onEdit: (announcement: AnnouncementData) => void;
  onDelete: (id: string) => void;
  courseId: string;
};

const AnnouncementList: React.FC<AnnouncementListProps> = ({
  onEdit,
  onDelete,
  courseId,
}) => {
  const [page, setPage] = useState(1);
  const router = useRouter();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["announcements", courseId, page],
    queryFn: async () => {
      const params = { page, course_id: courseId };
      const response = await api.get(`/announcements`, { params });
      return response.data; // Return the full response
    },
  });

  if (isLoading) return <p>Loading announcements...</p>;
  if (isError) return <p>Error: {(error as any).message}</p>;

  // Access the nested data array and pagination info
  const announcements = data?.data?.data || [];
  const currentPage = data?.data?.current_page || 1;
  const lastPage = data?.data?.last_page || 1;

  return (
    <div className="">
      {announcements.length > 0 ? (
        <>
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {announcements.map((announcement: AnnouncementData) => (
              <div
                key={announcement.id}
                className="bg-white border rounded-lg shadow-md p-4"
              >
                <h3 className="text-xl font-semibold mb-2">
                  {announcement.title}
                </h3>
                <p className="text-gray-600 mb-2">{announcement.content}</p>
                <p className="text-gray-500 text-sm">
                  Created:{" "}
                  {new Date(announcement.created_at).toLocaleDateString()}
                </p>
                {/* Add these fields if they exist in your actual data */}
                {announcement.start_date && (
                  <p className="text-gray-500 text-sm">
                    Start Date:{" "}
                    {new Date(announcement.start_date).toLocaleDateString()}
                  </p>
                )}
                {announcement.end_date && (
                  <p className="text-gray-500 text-sm">
                    End Date:{" "}
                    {new Date(announcement.end_date).toLocaleDateString()}
                  </p>
                )}
                {announcement.is_custom !== undefined && (
                  <p className="text-gray-500 text-sm">
                    Custom: {announcement.is_custom ? "Yes" : "No"}
                  </p>
                )}
                <div className="flex justify-end gap-2 mt-4">
                  {/* <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/announcements/manage/${announcement.id}`)
                    }
                  >
                    View
                  </Button> */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(announcement)}
                  >
                    Edit
                  </Button>
                  <Button size="sm" onClick={() => onDelete(announcement.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-center py-4 gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {lastPage}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setPage((prev) => (prev < lastPage ? prev + 1 : prev))
              }
              disabled={currentPage === lastPage}
              className="w-8 h-8"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500">No announcements found.</p>
      )}
    </div>
  );
};

export default AnnouncementList;
