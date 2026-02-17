"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  FileIcon,
  VideoIcon,
  ImageIcon,
  FileTextIcon,
  FileArchiveIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Loader2,
} from "lucide-react";
import { Icon } from "@/components/ui/icon";

const StudentChapter: React.FC = () => {
  const { id, cid } = useParams();
  const [activeChapterId, setActiveChapterId] = useState<string | null>(
    typeof cid === "string" ? cid : null
  );
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [chapterPage, setChapterPage] = useState(1);
  const [materialPage, setMaterialPage] = useState(1);
  const [chapters, setChapters] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);

  // Fetch course data with pagination
  const {
    data: course,
    isLoading,
    isError,
    error,
    isFetching: isFetchingChapters,
  } = useQuery({
    queryKey: ["courses", id, chapterPage],
    queryFn: async () => {
      const response = await api.get(`my-enrolled-module-detail/${id}`, {
        params: { page: chapterPage },
      });
      return response.data.data;
    },
  });

  // Fetch chapter materials with pagination
  const { data: materialData, isFetching: isFetchingMaterials } = useQuery({
    queryKey: ["chapter-materials", activeChapterId, materialPage],
    queryFn: async () => {
      if (!activeChapterId) return null;
      const response = await api.get(`chapter-materials`, {
        params: { chapter_id: activeChapterId, page: materialPage },
      });
      return response.data.data;
    },
    enabled: !!activeChapterId,
  });

  // Handle chapter pagination
  const loadMoreChapters = () => {
    if (course?.chapters?.next_page_url) {
      setChapterPage(chapterPage + 1);
    }
  };

  // Handle material pagination
  const loadMoreMaterials = () => {
    if (materialData?.next_page_url) {
      setMaterialPage(materialPage + 1);
    }
  };

  // Update chapters state when new data arrives
  React.useEffect(() => {
    if (course?.chapters?.data) {
      if (chapterPage === 1) {
        setChapters(course.chapters.data);
      } else {
        setChapters((prev) => [...prev, ...course.chapters.data]);
      }
    }
  }, [course?.chapters?.data, chapterPage]);

  // Update materials state when new data arrives
  React.useEffect(() => {
    if (materialData?.data) {
      if (materialPage === 1) {
        setMaterials(materialData.data);
      } else {
        setMaterials((prev) => [...prev, ...materialData.data]);
      }
    }
  }, [materialData?.data, materialPage]);

  // Reset material pagination when chapter changes
  React.useEffect(() => {
    if (activeChapterId) {
      setMaterialPage(1);
      // setMaterials([]);
    }
  }, [activeChapterId]);

  // Get icon based on mime type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("video/")) {
      return <VideoIcon className="h-5 w-5 text-red-500" />;
    }
    if (mimeType.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />;
    }
    if (mimeType === "application/pdf") {
      return <FileTextIcon className="h-5 w-5 text-red-500" />;
    }
    if (
      mimeType.includes("word") ||
      mimeType.includes("document") ||
      mimeType === "application/msword" ||
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return <FileTextIcon className="h-5 w-5 text-blue-500" />;
    }
    if (
      mimeType.includes("excel") ||
      mimeType.includes("spreadsheet") ||
      mimeType === "application/vnd.ms-excel" ||
      mimeType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      return <FileTextIcon className="h-5 w-5 text-green-500" />;
    }
    if (
      mimeType.includes("zip") ||
      mimeType.includes("compressed") ||
      mimeType === "application/zip" ||
      mimeType === "application/x-rar-compressed"
    ) {
      return <FileArchiveIcon className="h-5 w-5 text-yellow-500" />;
    }
    return <FileIcon className="h-5 w-5 text-gray-500" />;
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const renderChaptersWithChildren = (
    chapters: any[],
    parentId: string | null = null
  ) => {
    const renderChapter = (chapter: any) => {
      const isExpanded = expandedIds.has(chapter.id);

      const onSelect = (e?: React.MouseEvent) => {
        // Prevent propagation if clicking the expand toggle
        if (e) e.stopPropagation();
        // select this chapter
        setActiveChapterId(chapter.id);
        // expand the path to this chapter
        const path = findPathToChapter(chaptersRootRef.current, chapter.id);
        if (path) {
          setExpandedIds((prev) => new Set([...prev, ...path]));
        }
      };

      const toggleExpand = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setExpandedIds((prev) => {
          const next = new Set(prev);
          if (next.has(chapter.id)) next.delete(chapter.id);
          else next.add(chapter.id);
          return next;
        });
      };

      return (
        <li
          key={chapter.id}
          className={`mb-4 ${chapter.parent_id === null ? "border-b border-[#E7E7E7]" : ""}`}
        >
          <div
            onClick={() => onSelect()}
            className={cn(
              "flex items-center justify-between cursor-pointer p-2 transition-colors",
              activeChapterId === chapter.id
                ? "text-brand-light font-semibold"
                : "text-brand-dark"
            )}
          >
            <h3 className={`${chapter.parent_id === null ? "font-bold" : "font-medium"}`}>
              {chapter.name}
            </h3>
            {chapter.child && chapter.child.length > 0 && (
              <button
                onClick={toggleExpand}
                aria-expanded={isExpanded}
                className="ml-2 p-1 rounded hover:bg-gray-100"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? (
                  <ChevronUpIcon className="h-4 w-4" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
          {chapter.child && chapter.child.length > 0 && isExpanded && (
            <ul className="pl-4">{chapter.child.map(renderChapter)}</ul>
          )}
        </li>
      );
    };

    return <ul>{chapters.map(renderChapter)}</ul>;
  };

  // dedupe/merge chapters by id to avoid duplicate nodes from API causing
  // multiple instances of the same chapter to be rendered and highlighted
  const dedupedChapters = React.useMemo(() => {
    const map = new Map<string, any>();

    const mergeNode = (node: any) => {
      if (!map.has(node.id)) {
        map.set(node.id, { ...node, child: [] });
      }
      const existing = map.get(node.id);
      if (node.child && node.child.length > 0) {
        for (const ch of node.child) {
          const mergedChild = mergeNode(ch);
          if (!existing.child.find((c: any) => c.id === mergedChild.id)) {
            existing.child.push(mergedChild);
          }
        }
      }
      return existing;
    };

    for (const c of chapters) {
      mergeNode(c);
    }

    const roots: any[] = [];
    for (const c of chapters) {
      const node = map.get(c.id);
      if (node && c.parent_id === null) {
        if (!roots.find((r) => r.id === node.id)) roots.push(node);
      }
    }
    return roots;
  }, [chapters]);

  // keep a stable reference to the deduped tree for searching
  const chaptersRootRef = React.useRef<any[]>(dedupedChapters);
  React.useEffect(() => {
    chaptersRootRef.current = dedupedChapters;
  }, [dedupedChapters]);

  // find path (array of ids) from root to target id
  const findPathToChapter = (nodes: any[], targetId: string): string[] | null => {
    for (const node of nodes) {
      if (node.id === targetId) return [node.id];
      if (node.child && node.child.length > 0) {
        const childPath = findPathToChapter(node.child, targetId);
        if (childPath) return [node.id, ...childPath];
      }
    }
    return null;
  };

  const findChapterById = (nodes: any[], idToFind: string | null): any | null => {
    if (!idToFind) return null;
    for (const node of nodes) {
      if (node.id === idToFind) return node;
      if (node.child && node.child.length > 0) {
        const found = findChapterById(node.child, idToFind);
        if (found) return found;
      }
    }
    return null;
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  if (isError) return <div>Error: {error.message}</div>;
  console.log({ materialData, materials });
  if (chapters.length === 0 && chapterPage === 1) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center text-gray-500">
          No chapters available for this course
        </div>
      </div>
    );
  }
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column - Chapters List */}
        <div className="w-full md:w-1/3 ">
          <div className="rounded-lg border bg-white p-6 border-brand-border">
            <div className="space-y-2">
              {renderChaptersWithChildren(dedupedChapters)}

              {course?.chapters?.next_page_url && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadMoreChapters}
                    disabled={isFetchingChapters}
                    className="w-full"
                  >
                    {isFetchingChapters ? (
                      <Icon
                        icon="heroicons-outline:refresh"
                        className="h-4 w-4 animate-spin"
                      />
                    ) : (
                      <>
                        <ChevronDownIcon className="h-4 w-4 mr-1" />
                        Load More Chapters
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Chapter Materials */}
        <div className="flex-1">
          <div className="rounded-lg border bg-white p-6 border-brand-border">
            {!activeChapterId ? (
              <div className="text-center text-gray-500">
                Select a chapter to view materials
              </div>
            ) : (
              <>
                <h2 className="mb-6 text-xl font-semibold text-center">
                  {findChapterById(dedupedChapters, activeChapterId)?.name}
                </h2>
                <div className="tiptap mb-10">
                  <div
                    className="prose dark:prose-invert"
                    dangerouslySetInnerHTML={{
                      __html: findChapterById(dedupedChapters, activeChapterId)
                        ?.description,
                    }}
                  ></div>
                </div>

                {/* Materials List */}
                <div className="space-y-4">
                  {materials.length === 0 && !isFetchingMaterials ? (
                    <div className="text-center text-gray-500">
                      No materials found for this chapter
                    </div>
                  ) : (
                    <>
                      <span className="text-sm  font-bold">Resources</span>
                      {materials.map((material: any) => (
                        <div
                          key={material.id}
                          className="border-b p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            {material.files[0] && (
                              <div className="mt-1">
                                {/* {getFileIcon(material.files[0].mime_type)} */}
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="font-medium">{material.name}</h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {material.description}
                              </p>

                              {material.files.length > 0 && (
                                <div className="">
                                  {material.files.map((file: any) => (
                                    <div
                                      className="flex items-center justify-between"
                                      key={file.id}
                                    >
                                      <div className="flex items-center gap-2">
                                        {getFileIcon(file.mime_type)}
                                        <div>
                                          <p className="text-sm">
                                            {file.name.length > 30
                                              ? `${file.name.substring(
                                                  0,
                                                  30
                                                )}...`
                                              : file.name}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            {file.mime_type
                                              .split("/")[1]
                                              .toUpperCase()}{" "}
                                            • {formatFileSize(file.size)}
                                          </p>
                                        </div>
                                      </div>
                                      <a
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-brand-light flex items-center gap-2 text-sm font-medium hover:underline"
                                        download
                                      >
                                        <Icon
                                          icon="heroicons-outline:download"
                                          className="h-4 w-4"
                                        />
                                        Download
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          {material.progress && (
                            <div className="mt-3 flex items-center gap-2">
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

                      {materialData?.next_page_url && (
                        <div className="flex justify-center pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={loadMoreMaterials}
                            disabled={isFetchingMaterials}
                            className="w-full"
                          >
                            {isFetchingMaterials ? (
                              <Icon
                                icon="heroicons-outline:refresh"
                                className="h-4 w-4 animate-spin"
                              />
                            ) : (
                              <>
                                <ChevronDownIcon className="h-4 w-4 mr-1" />
                                Load More Materials
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentChapter;
