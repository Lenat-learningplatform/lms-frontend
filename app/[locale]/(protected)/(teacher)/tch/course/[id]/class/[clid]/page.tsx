"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import Image from "next/image";
import { Button } from "@/components/ui/button";

import { useHasPermission } from "@/hooks/useHasPermission";
import TestView from "@/app/[locale]/(protected)/tests/components/TestView";
import ChapterForm from "../../../component/ChapterForm";
import ChapterList from "../../../component/ChaptersTable";
import MeetingView from "../../../component/MeetingView";
import AnnouncementView from "@/components/Announcement/AnnouncementView";
import StudentListByClass from "@/components/Student/StudentListByClass";
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
  const { id, clid } = useParams();

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
  const [chapterOpen, setChapterOpen] = useState(false);
  const router = useRouter();
  const handleClose = () => {
    setChapterOpen(false);
  };
  const canAddChapter = useHasPermission("create_chapter");
  const [activeTab, setActiveTab] = useState<
    "chapters" | "tests" | "meetings" | "announcements" | "students"
  >("chapters");

  if (isLoading)
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  if (isError) return <p>Error: {(error as any).message}</p>;
  return (
    <div className="p-4 space-y-8">
      <div className="bg-white p-4 rounded-lg shadow-md dark:bg-gray-800">
        <h1 className="text-2xl font-bold mb-4">{course.title}</h1>
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
        <p className="mb-2 text-gray-700 dark:text-gray-300">
          {course.description}
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md dark:bg-gray-800">
        {/* Tab Buttons */}
        <div className="flex border-b mb-4">
          <button
            onClick={() => setActiveTab("chapters")}
            className={`mr-4 pb-2 text-xl  ${
              activeTab === "chapters"
                ? "border-b-2 border-blue-500 font-bold"
                : "text-gray-600"
            }`}
          >
            Chapters
          </button>
          <button
            onClick={() => setActiveTab("tests")}
            className={`mr-4 pb-2 text-xl ${
              activeTab === "tests"
                ? "border-b-2 border-blue-500 font-bold"
                : "text-gray-600"
            }`}
          >
            Tests
          </button>
          <button
            onClick={() => setActiveTab("meetings")}
            className={`mr-4 pb-2 text-xl ${
              activeTab === "meetings"
                ? "border-b-2 border-blue-500 font-bold"
                : "text-gray-600"
            }`}
          >
            Meetings
          </button>
          <button
            onClick={() => setActiveTab("announcements")}
            className={`mr-4 pb-2 text-xl ${
              activeTab === "announcements"
                ? "border-b-2 border-blue-500 font-bold"
                : "text-gray-600"
            }`}
          >
            Announcements
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`mr-4 pb-2 text-xl ${
              activeTab === "students"
                ? "border-b-2 border-blue-500 font-bold"
                : "text-gray-600"
            }`}
          >
            Students
          </button>
        </div>

        {/* Tab Content */}
        <div className="my-8">
          {activeTab === "chapters" && (
            <div>
              {/* Replace with your Chapters content */}
              <div className="flex justify-between items-center mb-3">
                {canAddChapter && (
                  <div>
                    <Button
                      onClick={() =>
                        router.push(`/tch/course/${id}/class/${clid}/create`)
                      }
                    >
                      Add Chapter
                    </Button>
                  </div>
                )}
              </div>
              {id && (
                <ChapterForm
                  open={chapterOpen}
                  handleClose={handleClose}
                  module_id={id as string}
                  clid={clid as string}
                />
              )}
              <ChapterList course_id={id as string} clid={clid as string} />
            </div>
          )}
          {activeTab === "tests" && (
            <div>
              {id && (
                <TestView
                  model_type="module"
                  id={id as string}
                  clid={clid as string}
                />
              )}
            </div>
          )}
          {activeTab === "meetings" && (
            <div>
              {id && (
                <MeetingView module={id as string} clid={clid as string} />
              )}
            </div>
          )}
          {activeTab === "announcements" && (
            <div>{id && <AnnouncementView courseId={clid as string} />}</div>
          )}
          {activeTab === "students" && (
            <div>{id && <StudentListByClass module={clid as string} />}</div>
          )}
        </div>
      </div>
    </div>
  );
}
