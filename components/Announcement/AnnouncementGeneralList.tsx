"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronDown, Megaphone } from "lucide-react";

export type AnnouncementData = {
  id: string;
  title: string;
  content: string;
  start_date: string;
  end_date: string;
  created_at: string;
};

const AnnouncementGeneralList = () => {
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ["announcements", page],
    queryFn: async () => {
      const response = await api.get(`/get-announcements?page=${page}`);
      return response.data;
    },
  });

  const announcements = data?.data?.data || [];
  const hasMore = data?.data?.current_page < data?.data?.last_page;

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );

  if (isError)
    return (
      <p className="text-red-500 text-center py-8">
        Error: {(error as any).message}
      </p>
    );

  return (
    <div className="p-4 bg-white border border-brand-border rounded-lg">
      {/* Announcements Container */}
      <div className="">
        <div className="flex items-center mb-6 gap-4">
          <Megaphone size={25} strokeWidth={3} className=" text-[#3BD07A]" />

          <h2 className="text-xl font-poppins font-semibold text-brand-dark">
            Announcements
          </h2>
        </div>
        {announcements.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No announcements available.
          </p>
        )}
        <div className="pl-2">
          {announcements.map(
            (announcement: AnnouncementData, index: number) => (
              <div
                key={announcement.id}
                className={`relative bg-white p-4 cursor-pointer transition-all duration-300 w-full ${
                  expandedId === announcement.id ? "bg-blue-50" : "bg-white"
                } ${
                  index !== announcements.length - 1
                    ? "border-b border-brand-border"
                    : ""
                }`}
                onClick={() => toggleExpand(announcement.id)}
              >
                <div className="flex items-start">
                  {/* <div
                    className={`h-2 w-2 rounded-full mt-2 mr-2 ${
                      new Date(announcement.end_date) > new Date()
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  /> */}
                  <div className="overflow-hidden">
                    <h3 className="font-medium ">{announcement.title}</h3>
                    {expandedId === announcement.id && (
                      <div className="mt-2 animate-fade-in">
                        <p className="text-sm text-gray-600">
                          {announcement.content}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(
                            announcement.created_at
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <ChevronDown
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 transition-transform ${
                    expandedId === announcement.id ? "rotate-180" : ""
                  }`}
                  size={16}
                />
              </div>
            )
          )}
        </div>
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={isFetching}
            className="flex items-center gap-2 rounded-none"
          >
            {isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>Load More</span>
                <ChevronDown size={16} />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AnnouncementGeneralList;
