"use client";

import React, { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export type ChapterData = {
  id: string;
  course_id: string;
  name: string;
  description: string;
  created_at: string;
  parent_id?: string | null; // Added parent_id field
  child?: ChapterData[]; // Added child field for nested chapters
};

export type PaginatedChapters = {
  data: ChapterData[];
  current_page: number;
  last_page: number;
};

type ChapterListProps = {
  course_id: string;
  clid: string;
};

const ChapterList: React.FC<ChapterListProps> = ({ course_id, clid }) => {
  const [page, setPage] = useState(1);
  const router = useRouter();

  const {
    data: paginatedChapters,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["chapters", course_id, page],
    queryFn: async (): Promise<PaginatedChapters> => {
      const response = await api.get("/chapters", {
        params: { module_id: course_id, page },
      });
      // Assumes response.data.data is in the shape of PaginatedChapters
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

  const chapters = paginatedChapters?.data || [];
  const currentPage = paginatedChapters?.current_page || 1;
  const lastPage = paginatedChapters?.last_page || 1;

  const renderChaptersWithChildren = (chapters: ChapterData[]) => {
    const renderChapter = (chapter: ChapterData) => (
      <li key={chapter.id} className="mb-4">
        <div className="bg-white rounded-lg mt-2  transition duration-300">
          <h3 className="text-xl font-semibold mb-2">{chapter.name}</h3>
          <div className="text-xs text-gray-500 mb-2">
            Created on: {new Date(chapter.created_at).toLocaleDateString()}
          </div>
          <button
            onClick={() => {
              router.push(`/tch/chapter/${chapter.id}/class/${clid}`);
            }}
            className="text-sm text-blue-500 hover:underline"
          >
            View Chapter
          </button>
        </div>
        {chapter.child && chapter.child.length > 0 && (
          <ul className="ml-6 mt-2 border-l border-gray-300 pl-4">
            {chapter.child.map(renderChapter)}
          </ul>
        )}
      </li>
    );

    return <ul>{chapters.map(renderChapter)}</ul>;
  };

  return (
    <div className="">
      {chapters.length > 0 ? (
        <>
          {renderChaptersWithChildren(chapters)}

          {/* Pagination Controls */}
          <div className="flex items-center justify-center py-4 gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
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
              disabled={page === lastPage}
              className="w-8 h-8"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500">
          No chapters found for this course.
        </p>
      )}
    </div>
  );
};

export default ChapterList;
