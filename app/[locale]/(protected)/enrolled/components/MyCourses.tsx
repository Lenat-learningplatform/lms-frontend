"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Define the type for your enrolled modules (courses)
export type MyCourseData = {
  id: string;
  module_id: string;
  title: string;
  description: string;
  cover: {
    uuid: string;
    url: string;
    mime_type: string;
  };
  status: string;
  enrolled_at: string;
  started_at: string | null;
  completed_at: string | null;
};

const MyCourse: React.FC = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["my-enrolled-modules", page],
    queryFn: async () => {
      const response = await api.get(`/my-enrolled-modules?page=${page}`);
      // Assumes the API returns the data inside response.data.data as an array of modules
      return response.data.data;
    },
  });

  if (isLoading) return <p>Loading courses...</p>;
  if (isError) return <p>Error: {(error as any).message}</p>;

  const courses = data?.data || [];
  const currentPage = data?.current_page || 1;
  const lastPage = data?.last_page || 1;

  return (
    <div className="">
      {courses.length > 0 ? (
        <div>
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course: MyCourseData) => (
              <div
                key={course.id}
                className="bg-white border rounded-lg shadow-md p-4"
              >
                <div className="mb-4">
                  <img
                    src={course.cover.url}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-md"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                <p className="text-gray-600 mb-2">{course.description}</p>
                <p className="text-gray-500 text-sm">Status: {course.status}</p>
                <p className="text-gray-500 text-sm">
                  Enrolled: {new Date(course.enrolled_at).toLocaleDateString()}
                </p>
                {course.started_at && (
                  <p className="text-gray-500 text-sm">
                    Started: {new Date(course.started_at).toLocaleDateString()}
                  </p>
                )}
                {course.completed_at && (
                  <p className="text-gray-500 text-sm">
                    Completed:{" "}
                    {new Date(course.completed_at).toLocaleDateString()}
                  </p>
                )}
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/my-courses/courses/${course.id}`)
                    }
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center py-4 gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-8 h-8"
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
        </div>
      ) : (
        <p className="text-center text-gray-500">No courses found.</p>
      )}
    </div>
  );
};

export default MyCourse;
