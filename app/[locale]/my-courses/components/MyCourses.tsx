"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { getStatusBadge } from "@/lib/utils";

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

  if (isLoading)
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  if (isError) return <p>Error: {(error as any).message}</p>;

  const courses = data?.data || [];
  const currentPage = data?.current_page || 1;
  const lastPage = data?.last_page || 1;

  return (
    <div className="p-6 px-10 bg-white border border-brand-border rounded-lg">
      <div className="flex items-center mb-6 gap-4">
        <BookOpen size={25} strokeWidth={3} className=" text-[#3BD07A]" />
        <h2 className="text-xl font-poppins font-semibold text-brand-dark">
          My Courses
        </h2>
      </div>
      {courses.length > 0 ? (
        <div>
          {/* Grid switches from 2 columns on very small screens to 1 column on small and up */}
          <div className="grid gap-16 grid-cols-1 md:grid-cols-2">
            {courses.map((course: MyCourseData) => (
              <div
                key={course.id}
                className="bg-white border border-brand-border flex flex-col p-2 rounded-lg"
              >
                <div className="relative">
                  <img
                    src={course.cover.url}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div
                    className={`absolute top-2 right-2 bg-brand-border text-white text-xs px-2 py-1 rounded-lg ${getStatusBadge(
                      course.status
                    )}`}
                  >
                    {course.status}
                  </div>
                </div>
                <div className="flex flex-col flex-1 p-4">
                  <h3 className="text-xl font-semibold mb-2 text-brand-dark">
                    {course.title}
                  </h3>
                  {/* <p className="text-gray-600 mb-2 line-clamp-2">
                    {course.description}
                  </p> */}
                  {/* Bottom section always at the end */}
                  <div className="mt-auto flex justify-between items-center">
                    <p className="text-gray-500 text-sm">
                      Enrolled: <br />
                      {new Date(course.enrolled_at).toLocaleDateString(
                        "en-GB",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </p>
                    <Button
                      size="sm"
                      onClick={() =>
                        router.push(`/my-courses/courses/${course.id}`)
                      }
                    >
                      Learn
                    </Button>
                  </div>
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
