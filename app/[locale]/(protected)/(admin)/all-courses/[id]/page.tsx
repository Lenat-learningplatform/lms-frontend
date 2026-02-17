"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import Image from "next/image";
import TeacherAssignModal from "../component/TeacherAssignModal"; // adjust the path as needed
import { Button } from "@/components/ui/button";
import StudentAssignModal from "../component/StudentAssignModal";
import CourseTeacherTable from "../component/CourseTeacherTable";
import { Loader2 } from "lucide-react";

export type CourseData = {
  id: string;
  title: string;
  description: string;
  price: number;
  cover: string;
  created_at: string;
};

export default function CourseDetailPage() {
  // Use the Next.js hook to get the dynamic parameters.
  const { id } = useParams();

  const [assignModalOpen, setAssignModalOpen] = React.useState(false);
  const [assignStudentModalOpen, setAssignStudentModalOpen] = useState(false);

  const {
    data: course,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["course", id],
    queryFn: async () => {
      const response = await api.get(`modules/${id}`);
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

  return (
    <div className="p-4 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-4">{course.title}</h1>
        {course.cover && (
          <Image
            src={course.cover.url}
            alt={course.title}
            width={400}
            height={300}
            className="object-cover rounded mb-4"
            unoptimized
          />
        )}
        <p className="mb-2">{course.description}</p>
        <p className="font-bold">Price: ${course.price}</p>
      </div>
      <div>
        <Button onClick={() => setAssignModalOpen(true)}>
          Search &amp; Assign Teacher
        </Button>
      </div>

      <CourseTeacherTable />
      {assignModalOpen && (
        <TeacherAssignModal
          courseId={course.id}
          open={assignModalOpen}
          onOpenChange={setAssignModalOpen}
        />
      )}
    </div>
  );
}
