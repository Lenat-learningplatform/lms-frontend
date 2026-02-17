"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import DiscussionList from "@/components/discussion/DiscussionList";
import DiscussionForm from "@/components/discussion/DiscussionForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MeetingView from "../../../(teacher)/tch/course/component/MeetingView";
import { useCoursePermissions } from "@/hooks/useHasPermission";
import DiscussionPage from "@/components/discussion/DiscussionPage";
import AnnouncementGeneralList from "@/components/Announcement/AnnouncementGeneralList";
import TestList from "@/components/test/TestList";

const Page: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "chapters" | "tests" | "discussion" | "meetings"
  >("chapters");
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleClose = () => {
    setIsModalOpen(false);
  };
  const handleNewDiscussion = () => {
    setIsModalOpen(true);
  };

  const {
    data: course,
    isLoading,
    isError,
    isSuccess,
    error,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const response = await api.get(`my-enrolled-module-detail/${id}`);
      return response.data.data; // Assumes response.data is in the shape of PaginatedCourse
    },
  });
  const { canReadDiscussion, canCreateDiscussion } = useCoursePermissions();

  const router = useRouter();
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  const chapters = course?.chapters?.data || [];
  const tests = course?.tests?.data || [];

  return (
    <div className="container mx-auto p-4">
      {/* Cover Image and Tabs */}
      <div
        className="relative w-full h-[300px] rounded-lg shadow-lg mb-5 bg-cover bg-center"
        style={{ backgroundImage: `url(${course?.cover?.url})` }}
      >
        {/* Gradient overlay at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t rounded-lg  from-black/70 via-black/40 to-transparent" />

        {/* Text positioned at bottom with padding */}
        <h1 className="absolute bottom-0 left-0 w-full p-6 text-3xl font-bold text-white">
          {course?.title}
        </h1>
      </div>

      <div className="flex mb-8 gap-4">
        {/* Right side - Tab Buttons */}
        <div className="w-1/2 flex flex-col justify-center bg-white rounded-lg p-4 shadow-md">
          <div className="flex border-b mb-4">
            <button
              onClick={() => setActiveTab("chapters")}
              className={`mr-4 pb-2 ${
                activeTab === "chapters"
                  ? "border-b-2 border-blue-500 font-semibold"
                  : "text-gray-600"
              }`}
            >
              Chapters
            </button>
            <button
              onClick={() => setActiveTab("tests")}
              className={` mr-4 pb-2 ${
                activeTab === "tests"
                  ? "border-b-2 border-blue-500 font-semibold"
                  : "text-gray-600"
              }`}
            >
              Tests
            </button>
            <button
              onClick={() => setActiveTab("discussion")}
              className={`mr-4  pb-2 ${
                activeTab === "discussion"
                  ? "border-b-2 border-blue-500 font-semibold"
                  : "text-gray-600"
              }`}
            >
              Discussion
            </button>
            <button
              onClick={() => setActiveTab("meetings")}
              className={`mr-4  pb-2 ${
                activeTab === "meetings"
                  ? "border-b-2 border-blue-500 font-semibold"
                  : "text-gray-600"
              }`}
            >
              Meetings
            </button>
          </div>
          <div>
            {activeTab === "chapters" && (
              <div>
                {/* Chapters Content */}
                {chapters.length === 0 ? (
                  <p>No chapters available.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {chapters.map((chapter: any, index: number) => (
                      <div
                        key={chapter.id}
                        className="bg-white rounded-lg shadow-md overflow-hidden"
                      >
                        <img
                          src={course?.cover?.url}
                          alt={chapter.name}
                          className="w-full h-40 object-cover"
                        />
                        <div className="p-4">
                          <h3 className="text-xl font-medium">
                            {chapter.name}
                          </h3>
                          <p className="text-gray-600">{chapter.description}</p>
                          <div className="flex justify-end items-center mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(
                                  `/enrolled/courses/${course.id}/chapter/${chapter.id}`
                                )
                              }
                            >
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination for Chapters */}
                {course.chapters?.links && (
                  <div className="flex justify-start mt-6 space-x-4">
                    <button
                      onClick={() => {
                        const prevLink = course.chapters?.links?.find(
                          (link: any) => link.label === "Previous"
                        )?.url;
                        if (prevLink) window.location.href = prevLink;
                      }}
                      className="p-2 bg-default text-white rounded disabled:opacity-50"
                      disabled={
                        !course.chapters?.links?.find(
                          (link: any) => link.label === "Previous"
                        )?.url
                      }
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => {
                        const nextLink = course.chapters?.links?.find(
                          (link: any) => link.label === "Next"
                        )?.url;
                        if (nextLink) window.location.href = nextLink;
                      }}
                      className="p-2 bg-default text-white rounded disabled:opacity-50"
                      disabled={
                        !course.chapters?.links?.find(
                          (link: any) => link.label === "Next"
                        )?.url
                      }
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "tests" && (
              <div>
                <TestList moduleId={course.id} />
              </div>
            )}
            {activeTab === "discussion" && (
              <div>
                {canReadDiscussion && (
                  <DiscussionPage classId={course.module_teacher_id} />
                )}
              </div>
            )}
            {activeTab === "meetings" && (
              <div>
                <MeetingView
                  clid={id as string}
                  module={course.module_teacher_id}
                />
              </div>
            )}
          </div>
        </div>
        <div className="w-1/2">
          <div className="bg-white rounded-lg p-4 mb-2 shadow-md">
            <div className="flex border-b mb-4">
              <h4 className="border-b-2 font-semibold">Announcements</h4>
            </div>
            <AnnouncementGeneralList />
          </div>
          {/* <div className="  bg-white rounded-lg p-4 shadow-md">
            <div className="flex border-b mb-4">
              <h4 className="border-b-2 font-semibold">Calendar</h4>
            </div>
            <AnnouncementGeneralList />
          </div> */}
        </div>
      </div>

      {/* Tab Content */}
    </div>
  );
};

export default Page;
