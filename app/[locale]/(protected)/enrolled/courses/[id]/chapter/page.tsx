"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const Page: React.FC = () => {
  const { id } = useParams();
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);

  // Fetch course data
  const {
    data: course,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["courses", id],
    queryFn: async () => {
      const response = await api.get(`my-enrolled-module-detail/${id}`);
      return response.data.data;
    },
  });

  // Fetch chapter materials
  const { data: materials } = useQuery({
    queryKey: ["chapter-materials", activeChapterId],
    queryFn: async () => {
      if (!activeChapterId) return null;
      const response = await api.get(
        `chapter-materials?chapter_id=${activeChapterId}`
      );
      return response.data.data;
    },
    enabled: !!activeChapterId,
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  const chapters = course?.chapters?.data || [];

  return (
    <div className="container mx-auto p-4">
      {/* Course Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{course?.title}</h1>
        <div className="mt-2 flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Progress: {course?.progress}%
          </span>
          <Progress value={course?.progress} className="h-2 w-[200px]" />
        </div>
      </div>

      <div className="flex gap-8">
        {/* Left Column - Chapters List */}
        <div className="w-1/3">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Chapters</h2>
            <div className="space-y-2">
              {chapters.map((chapter: any) => (
                <div
                  key={chapter.id}
                  onClick={() => setActiveChapterId(chapter.id)}
                  className={cn(
                    "cursor-pointer rounded-lg p-4 transition-colors",
                    activeChapterId === chapter.id
                      ? "bg-blue-50 border-2 border-blue-200"
                      : "hover:bg-gray-50 border"
                  )}
                >
                  <h3 className="font-medium">{chapter.name}</h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {chapter.completed_topics}/{chapter.total_topics} topics
                    </span>
                    <span className="text-sm text-blue-600">
                      {Math.round(
                        (chapter.completed_topics / chapter.total_topics) * 100
                      )}
                      %
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Chapter Materials */}
        <div className="flex-1">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            {!activeChapterId ? (
              <div className="text-center text-gray-500">
                Select a chapter to view materials
              </div>
            ) : (
              <>
                <h2 className="mb-6 text-xl font-semibold">
                  {chapters.find((c: any) => c.id === activeChapterId)?.name}
                </h2>

                {/* Materials List */}
                <div className="space-y-4">
                  {materials?.data.map((material: any) => (
                    <div
                      key={material.id}
                      className="rounded-lg border p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{material.title}</h3>
                          <p className="text-sm text-gray-500">
                            {material.type} • {material.file_size}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(material.download_url, "_blank")
                          }
                        >
                          Download
                        </Button>
                      </div>
                      {material.progress && (
                        <div className="mt-2 flex items-center gap-2">
                          <Progress
                            value={material.progress}
                            className="h-2 flex-1"
                          />
                          <span className="text-sm text-gray-500">
                            {material.progress}%
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
