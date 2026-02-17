"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

// types/test.ts
export type TestData = {
  id: string;
  name: string;
  description: string;
  start_date?: string | null;
  due_date?: string | null;
  duration?: number | null;
  duration_unit?: "hour" | "minute" | null;
  is_custom: boolean;
  selected_students?: string[];
};

type TestListProps = {
  onEdit: (test: TestData) => void;
  onDelete: (id: string) => void;
  model_type: "chapter" | "module";
  id: string;
  clid: string;
};

const TestList: React.FC<TestListProps> = ({
  onEdit,
  onDelete,
  model_type,
  id,
  clid,
}) => {
  const [page, setPage] = useState(1);
  const router = useRouter();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["tests", model_type, id, page],
    queryFn: async () => {
      // Build the params based on the model_type
      const params: any = { page, model_type };
      if (model_type === "chapter") {
        params.chapter_id = clid;
      } else if (model_type === "module") {
        params.module_id = clid;
      }
      const response = await api.get(`/tests`, { params });
      // Assumes your API returns { data: { data, current_page, last_page } }
      return response.data.data;
    },
  });

  if (isLoading) return <p>Loading tests...</p>;
  if (isError) return <p>Error: {(error as any).message}</p>;

  const tests = data || [];
  const currentPage = data?.current_page || 1;
  const lastPage = data?.last_page || 1;

  return (
    <div className="">
      {/* <h2 className="text-2xl font-bold mb-4">Tests</h2> */}
      {tests.length > 0 ? (
        <>
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {tests.map((test: TestData) => (
              <div
                key={test.id}
                className="bg-white border rounded-lg shadow-md p-4"
              >
                <h3 className="text-xl font-semibold mb-2">{test.name}</h3>
                <p className="text-gray-600 mb-2">{test.description}</p>
                <p className="text-gray-500 text-sm">
                  Start Date:{" "}
                  {test.start_date
                    ? new Date(test.start_date).toLocaleDateString()
                    : "N/A"}
                </p>
                <p className="text-gray-500 text-sm">
                  Due Date:{" "}
                  {test.due_date
                    ? new Date(test.due_date).toLocaleDateString()
                    : "N/A"}
                </p>
                <p className="text-gray-500 text-sm">
                  Duration:{" "}
                  {test.duration && test.duration_unit
                    ? `${test.duration} ${test.duration_unit}`
                    : "N/A"}
                </p>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/tests/evaluate/${test.id}/${clid}`)
                    }
                  >
                    Evaluate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/tests/manage/${test.id}`)}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(test)}
                  >
                    Edit
                  </Button>
                  <Button size="sm" onClick={() => onDelete(test.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {/* <div className="flex items-center justify-center py-4 gap-2">
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
          </div> */}
        </>
      ) : (
        <p className="text-center text-gray-500">No tests found.</p>
      )}
    </div>
  );
};

export default TestList;
