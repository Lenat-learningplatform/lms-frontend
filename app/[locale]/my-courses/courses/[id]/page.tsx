"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import AnnouncementGeneralList from "@/components/Announcement/AnnouncementGeneralList";
import api from "@/lib/api";
import React from "react";
import { BookOpen, Loader2 } from "lucide-react";
import Image from "next/image";
import UpcomingEvents from "@/components/UpcommingEvents";

const Page: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();

  const {
    data: course,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const response = await api.get(`my-enrolled-module-detail/${id}`);
      return response.data.data;
    },
  });

  if (isLoading)
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  if (isError) return <div>Error: {error.message}</div>;

  const chapters = course?.chapters?.data || [];

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side */}
        <div className="flex-1">
          <div className=" p-0x md:p-8 md:pt-0">
            <h1 className="text-3xl md:text-[48px] font-bold mb-2 text-brand-dark md:leading-[100%] ">
              {course?.title}
            </h1>
            <p className="mb-6 text-brand-gray">{course?.description}</p>
            <div className=" flex items-center gap-4 mb-6">
              <img
                src={course?.instructor_image}
                alt="D"
                className="rounded-full w-11 h-w-11"
              />
              <p className="text-brand-dark font-semibold">
                Instructor: <u>{course?.instructor}</u>
              </p>
            </div>
          </div>

          <div className="border border-brand-border rounded-lg bg-white p-6">
            <div className="flex items-center mb-6 gap-4">
              <BookOpen size={25} strokeWidth={3} className=" text-[#3BD07A]" />
              <h2 className="text-xl font-poppins font-semibold text-brand-dark">
                Chapters
              </h2>
            </div>
            {chapters.length === 0 ? (
              <p className="p-4 text-gray-500">No chapters available.</p>
            ) : (
              chapters.map((chapter: any, idx: number) => (
                <div
                  key={chapter.id}
                  onClick={() =>
                    router.push(
                      `/my-courses/courses/${id}/chapter/${chapter.id}`
                    )
                  }
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                    idx !== chapters.length - 1
                      ? "border-b border-brand-border"
                      : ""
                  }`}
                >
                  <h3 className="text-lg font-medium text-brand-dark mb-1">
                    {chapter.name}
                  </h3>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full lg:w-[450px] flex flex-col gap-2">
          <div>
            <img
              src={course?.cover?.url}
              alt={course?.title}
              className="w-full h-72 rounded-lg object-cover  border border-gray-200"
            />
          </div>

          <AnnouncementGeneralList />
          <UpcomingEvents module_id={course.module_teacher_id as string} />
        </div>
      </div>
    </div>
  );
};

export default Page;
