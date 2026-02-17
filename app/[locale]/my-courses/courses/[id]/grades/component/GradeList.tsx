"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/ui/icon";
import { Calendar, Clock, Award, User, Loader2 } from "lucide-react"; // Import icons
import { getStatusBadge } from "@/lib/utils";

export type GradeData = {
  id: string;
  name: string;
  question_count: number;
  response_count: number;
  value: number;
  score: number;
  points: string;
  point_by_percent: string;
  grade: string;
  remark: string;
  is_completed: boolean;
  created_at: string;
};

type GradeListProps = {
  id: string;
};

const GradeList: React.FC<GradeListProps> = ({ id }) => {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [grades, setGrades] = useState<GradeData[]>([]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["grades", id, page],
    queryFn: async () => {
      const response = await api.get(`/module-grades/${id}`, {
        params: { page },
      });
      return response.data;
    },
  });

  const loadMore = () => {
    if (hasMore && !isLoading) {
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (data) {
      if (page === 1) {
        setGrades(data.data);
      } else {
        setGrades((prev) => [...prev, ...data.data]);
      }
      setHasMore(data.current_page < data.last_page);
    }
  }, [data, page]);

  if (isLoading && !data && grades.length === 0)
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  if (isError) return <p>Error: {(error as any).message}</p>;

  return (
    <div className="">
      {grades.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1">
          {grades.map((grade: GradeData) => (
            <div
              key={grade.id}
              className="bg-white border border-brand-border rounded-lg p-4 md:py-9 md:px-16"
            >
              {/* Title and Status */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">{grade.name}</h3>
                {/* Updated Status Rendering */}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${
                    grade.is_completed
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                  }`}
                >
                  {grade.is_completed ? "Completed" : "Incomplete"}
                </span>
              </div>

              {/* Info Row: Completed On, Duration, Score, Grade */}
              <div className="flex flex-wrap items-stretch justify-between gap-6 mb-4">
                {/* Completed On */}
                <div className="flex items-center gap-2 ">
                  <Calendar
                    className=" text-[#3BD07A] "
                    size={25}
                    strokeWidth={3}
                  />
                  <div>
                    <div className="text-xs text-gray-400 mb-1">
                      Completed On
                    </div>
                    <div className="text-sm text-gray-800">
                      {grade.is_completed
                        ? new Date(grade.created_at).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )
                        : "---"}
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-2 ">
                  <Clock
                    className=" text-[#3BD07A] font-bold"
                    size={25}
                    strokeWidth={3}
                  />
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Duration</div>
                    <div className="text-sm text-gray-800">
                      {grade.value ? `${grade.value} min` : "---"}
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="flex items-center gap-2 ">
                  <Award
                    className=" text-[#3BD07A] font-bold"
                    size={25}
                    strokeWidth={3}
                  />
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Score</div>
                    <div className="text-sm text-gray-800">
                      {grade.points && grade.point_by_percent
                        ? `${grade.points} (${grade.point_by_percent})`
                        : "---"}
                    </div>
                  </div>
                </div>

                {/* Grade */}
                <div className="flex items-center gap-2 ">
                  <User
                    className=" text-[#3BD07A] font-bold"
                    size={25}
                    strokeWidth={3}
                  />
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Grade</div>
                    <div className="text-sm text-gray-800 font-bold">
                      {grade.grade && grade.remark
                        ? `${grade.grade} - ${grade.remark}`
                        : "---"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No grades found.</p>
      )}

      {/* Pagination controls */}
      {hasMore && grades.length > 0 && (
        <div className="border border-brand-border p-2 mt-2 flex justify-center rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadMore}
            disabled={isLoading}
            className="w-full rounded-lg"
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

export default GradeList;
