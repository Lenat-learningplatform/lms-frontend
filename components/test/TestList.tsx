"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { useRouter } from "next/navigation";
import { getStatusBadge } from "@/lib/utils";
import { Calendar, Clock } from "lucide-react"; // Import icons

interface Test {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  start_date: string;
  due_date: string;
  duration: number;
  duration_unit: string;
  is_custom: number;
  is_completed: boolean;
  created_at: string;
}

type TestListProps = {
  moduleId: string;
};

const TestList: React.FC<TestListProps> = ({ moduleId }) => {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [renderedTests, setRenderedTests] = useState<Test[]>([]);
  const router = useRouter();
  const {
    data: testsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["tests", moduleId, page],
    queryFn: async () => {
      const response = await api.get(`/module-tests/${moduleId}?page=${page}`);
      return response.data.data as {
        current_page: number;
        data: Test[];
        last_page: number;
      };
    },
  });

  useEffect(() => {
    if (testsData) {
      if (page === 1) {
        setRenderedTests(testsData.data);
      } else {
        setRenderedTests((prev) => [...prev, ...testsData.data]);
      }
      setHasMore(testsData.current_page < testsData.last_page);
    }
  }, [testsData, page]);

  const loadMore = () => {
    if (testsData && testsData.current_page < testsData.last_page) {
      setPage((prev) => prev + 1);
    } else {
      setHasMore(false);
    }
  };

  if (isLoading && page === 1) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="text-center text-red-500 py-8">Failed to load tests</div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      {/* Test List */}
      {renderedTests.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No tests available.</p>
        </div>
      ) : (
        renderedTests.map((test) => (
          <div
            key={test.id}
            className="bg-white p-4 md:py-9  md:px-16 border border-brand-border mb-6 rounded-lg"
          >
            {/* Title and Status */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-poppins font-medium text-[20px]  leading-[100%] text-gray-800">
                {test.name}
              </h3>

              <span
                className={`text-xs font-medium px-2 py-1 ${getStatusBadge(
                  test.is_active ? "active" : "inactive"
                )}`}
              >
                {test.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            {/* Description */}
            <p className="font-nunito text-[18px] font-normal leading-[100%] text-gray-600 mb-4">
              {test.description
                ? test.description
                : "No description available."}
            </p>

            {/* Due Date & Duration */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between  gap-5 sm:gap-8 ">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-20 ">
                <div className="flex items-center gap-2">
                  <Calendar
                    className=" text-[#3BD07A]"
                    size={25}
                    strokeWidth={3}
                  />
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Due Date</div>
                    <div className="text-sm text-gray-800">
                      {new Date(test.due_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock
                    className=" text-[#3BD07A]"
                    size={25}
                    strokeWidth={3}
                  />
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Duration</div>
                    <div className="text-sm text-gray-800">
                      {test.duration} {test.duration_unit}
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full sm:w-auto">
                <Button
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    if (test.is_completed) {
                      router.push(`/enrolled/tests/result/${test.id}`);
                    } else {
                      router.push(`/enrolled/tests/${test.id}`);
                    }
                  }}
                >
                  Take Exam
                </Button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Load More Button */}
      {hasMore && testsData?.data?.length && (
        <div className="border border-default-100 p-2 mt-2 flex justify-center rounded-none">
          <Button
            variant="ghost"
            size="sm"
            className="w-full rounded-none"
            onClick={loadMore}
            disabled={isLoading}
          >
            {isLoading ? (
              <Icon
                icon="heroicons-outline:refresh"
                className="h-4 w-4 animate-spin"
              />
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TestList;
