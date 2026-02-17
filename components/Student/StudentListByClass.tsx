"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  username: string;
  bod: string;
  created_at: string;
  profile_photo_url: string;
}

interface StudentListResponse {
  success: boolean;
  message: string;
  status: number;
  data: {
    current_page: number;
    data: Student[];
    last_page: number;
  };
}

type StudentListByClassProps = {
  module: string;
  action?: {
    label: string;
    route: (studentId: string) => string; // Function to generate route based on student ID
  };
  title?: string; // Optional title prop
  showInformation?: boolean; // Optional prop to hide information
};

const StudentListByClass: React.FC<StudentListByClassProps> = ({
  module,
  action,
  showInformation = false,
  title,
}) => {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [renderedStudents, setRenderedStudents] = useState<Student[]>([]);

  const {
    data: studentData,
    isLoading,
    isError,
  } = useQuery<StudentListResponse>({
    queryKey: ["students", module, page],
    queryFn: async () => {
      const response = await api.get(
        `/get-students-by-course/${module}?page=${page}`
      );
      return response.data as StudentListResponse;
    },
  });

  useEffect(() => {
    if (studentData?.data) {
      if (page === 1) {
        setRenderedStudents(studentData.data.data);
      } else {
        setRenderedStudents((prev) => [...prev, ...studentData.data.data]);
      }
      setHasMore(studentData.data.current_page < studentData.data.last_page);
    }
  }, [studentData, page]);

  const loadMore = () => {
    if (
      studentData?.data &&
      studentData.data.current_page < studentData.data.last_page
    ) {
      setPage((prev) => prev + 1);
    } else {
      setHasMore(false);
    }
  };

  if (isLoading && page === 1) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 py-8">
        Failed to load students
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      {title && <h1 className="text-2xl font-bold mb-6">{title}</h1>}

      <div className="space-y-6">
        {renderedStudents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No students found for this course.</p>
          </div>
        ) : (
          renderedStudents.map((student) => (
            <div
              key={student.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center space-x-4"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={student.profile_photo_url} />
                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{student.name}</h3>
                <p className="text-sm text-gray-500">{student.email}</p>
                <p className="text-sm text-gray-500">{student.phone}</p>
                {showInformation && (
                  <>
                    <p className="text-sm text-gray-500">
                      Username: {student.username}
                    </p>
                    <p className="text-sm text-gray-500">
                      Date of Birth:{" "}
                      {new Date(student.bod).toLocaleDateString()}
                    </p>
                  </>
                )}
              </div>
              {action && (
                <Link href={action.route(student.id)}>
                  <Button variant="outline">{action.label}</Button>
                </Link>
              )}
            </div>
          ))
        )}
      </div>

      {hasMore && studentData?.data?.data?.length ? (
        <div className="border border-default-100 p-2 mt-6 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadMore}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default StudentListByClass;
