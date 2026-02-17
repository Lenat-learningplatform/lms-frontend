"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export type ChapterMaterialData = {
  id: string;
  chapter_id: string;
  name: string;
  description: string;
  created_at: string;
};

export type ChapterMaterialFile = {
  id: string;
  name: string;
  url: string;
  size?: string;
  mime_type?: string;
};

// extend the material type to include the fuller API response shape
export type ChapterMaterialFull = ChapterMaterialData & {
  created_by?: string;
  link?: string | null;
  is_active?: boolean;
  is_custom?: string | number | boolean;
  files?: ChapterMaterialFile[];
};

export type PaginatedChapterMaterials = {
  data: ChapterMaterialData[];
  current_page: number;
  last_page: number;
};

type ChapterMaterialListProps = {
  chapter_id: string;
  onEdit: (material: ChapterMaterialData) => void;
  onDelete: (id: string) => void;
};

const ChapterMaterialList: React.FC<ChapterMaterialListProps> = ({
  chapter_id,
  onEdit,
  onDelete,
}) => {
  const [page, setPage] = useState(1);
  const [loadingEditId, setLoadingEditId] = useState<string | null>(null);

  const handleEdit = async (id: string) => {
    try {
      setLoadingEditId(id);
      const res = await api.get(`/chapter-materials/${id}`);
      const full = res?.data?.data;
      console.debug("ChapterMaterialList: fetched full material:", full);
      if (full) {
        onEdit(full as ChapterMaterialFull);
      } else {
        // fallback to minimal material if server doesn't return full payload
        const minimal = materials.find((m) => m.id === id);
        if (minimal) onEdit(minimal as ChapterMaterialData);
      }
    } catch (err) {
      console.error("Failed to fetch material details", err);
      const minimal = materials.find((m) => m.id === id);
      if (minimal) onEdit(minimal);
    } finally {
      setLoadingEditId(null);
    }
  };

  const {
    data: paginatedMaterials,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["chapter-materials", chapter_id, page],
    queryFn: async (): Promise<PaginatedChapterMaterials> => {
      const response = await api.get(`/chapter-materials`, {
        params: { chapter_id, page },
      });
      // Assumes response.data.data is in the shape of PaginatedChapterMaterials
      return response.data.data;
    },
  });

  if (isLoading) return <p>Loading materials...</p>;
  if (isError) return <p>Error: {(error as any).message}</p>;

  const materials = paginatedMaterials?.data || [];
  const currentPage = paginatedMaterials?.current_page || 1;
  const lastPage = paginatedMaterials?.last_page || 1;
  console.log({ paginatedMaterials });
  return (
    <div className="">
      {materials.length > 0 ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {materials.map((material) => (
              <div
                key={material.id}
                className="bg-white border border-gray-200 rounded-lg shadow-md p-4 hover:shadow-xl transition duration-300"
              >
                <h3 className="text-xl font-semibold mb-2">{material.name}</h3>
                <p className="text-gray-600 mb-4">
                  {material.description.length > 100
                    ? material.description.substring(0, 100) + "..."
                    : material.description}
                </p>
                <div className="text-xs text-gray-500 mb-4">
                  Created on:{" "}
                  {new Date(material.created_at).toLocaleDateString()}
                </div>
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(material.id)}
                    disabled={loadingEditId === material.id}
                  >
                    {loadingEditId === material.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Edit"
                    )}
                  </Button>
                  <Button
                    // variant="destructive"
                    size="sm"
                    onClick={() => onDelete(material.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>

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
          No materials found for this chapter.
        </p>
      )}
    </div>
  );
};

export default ChapterMaterialList;
