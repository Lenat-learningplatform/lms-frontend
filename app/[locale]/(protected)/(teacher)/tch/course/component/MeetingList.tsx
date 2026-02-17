"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useCoursePermissions } from "@/hooks/useHasPermission";
import { Icon } from "@/components/ui/icon";
import { Calendar, Clock, Video, User, Loader2 } from "lucide-react"; // Import icons

export type MeetingData = {
  id: string;
  title: string;
  description: string;
  url?: string;
  all_day?: boolean;
  is_custom?: boolean;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  participants?: string[];
  creator: {
    id: string;
    name: string;
    email: string;
  };
};

type MeetingListProps = {
  onEdit: (meeting: MeetingData) => void;
  onDelete: (id: string) => void;
  module: string;
};

const MeetingList: React.FC<MeetingListProps> = ({
  onEdit,
  onDelete,
  module,
}) => {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [meetings, setMeetings] = useState<MeetingData[]>([]);
  const router = useRouter();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["meetings", module, page],
    queryFn: async () => {
      const response = await api.get(`/meetings`, {
        params: { page },
      });
      return response.data.data;
    },
  });
  const { canUpdateMeetings, canDeleteMeetings, canViewMeetings } =
    useCoursePermissions();

  const loadMore = () => {
    if (hasMore && !isLoading) {
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (data) {
      if (page === 1) {
        setMeetings(data.data);
      } else {
        setMeetings((prev) => [...prev, ...data.data]);
      }
      setHasMore(data.current_page < data.last_page);
    }
  }, [data, page]);

  if (isLoading && !data && meetings.length === 0)
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  if (isError) return <p>Error: {(error as any).message}</p>;
  if (!canViewMeetings)
    return <p>You do not have permission to view meetings.</p>;

  return (
    <div className="">
      {meetings.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1">
          {meetings.map((meeting: MeetingData) => (
            <div
              key={meeting.id}
              className="bg-white border border-brand-border rounded-lg p-4 md:py-9 md:px-16"
            >
              {/* Title */}
              <h3 className="text-xl font-semibold mb-2">{meeting.title}</h3>
              {/* Description */}
              <p className="text-brand-gray mb-4">{meeting.description}</p>
              {/* Grid: Organizer, Date, Time, Meeting Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {/* Organizer */}
                <div className="flex items-center gap-2">
                  <User
                    className="text-[#3BD07A] font-bold"
                    size={25}
                    strokeWidth={3}
                  />
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Organizer</div>
                    <div className="text-sm text-gray-800">
                      {meeting.creator.name}
                    </div>
                  </div>
                </div>
                {/* Date */}
                <div className="flex items-center gap-2">
                  <Calendar
                    className="text-[#3BD07A] font-bold"
                    size={25}
                    strokeWidth={3}
                  />
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Date</div>
                    <div className="text-sm text-gray-800">
                      {meeting.all_day
                        ? "All Day"
                        : meeting.start_date
                        ? new Date(meeting.start_date).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )
                        : "N/A"}
                    </div>
                  </div>
                </div>
                {/* Time */}
                <div className="flex items-center gap-2">
                  <Clock
                    className="text-[#3BD07A] font-bold"
                    size={25}
                    strokeWidth={3}
                  />
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Time</div>
                    <div className="text-sm text-gray-800">
                      {meeting.all_day
                        ? "-"
                        : meeting.start_time && meeting.end_time
                        ? `${meeting.start_time} - ${meeting.end_time}`
                        : "N/A"}
                    </div>
                  </div>
                </div>
                {/* Meeting Link */}
                {/* <div className="flex items-center gap-2">
                  <Video
                    className="text-[#3BD07A] font-bold"
                    size={25}
                    strokeWidth={3}
                  />
                  <div>
                    <div className="text-xs text-gray-400 mb-1">
                      Meeting Link
                    </div>
                    {meeting.url ? (
                      <a
                        href={meeting.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 text-sm underline"
                      >
                        Join Meeting
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">N/A</span>
                    )}
                  </div>
                </div> */}
                <div className=" border border-brand-border p-4 rounded-lg bg-[#E2F0FF] col-span-full ">
                  <span className="text-brand-light mb-4">Meeting Links </span>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 mt-3">
                      <Video
                        className="text-[#3BD07A] font-bold"
                        size={25}
                        strokeWidth={3}
                      />
                      <div>
                        {meeting.url ? (
                          <a
                            href={meeting.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 text-sm underline"
                          >
                            Join Meeting
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </div>
                    </div>
                  
                  
                  </div>
                </div>
              </div>
              {/* Actions */}
              <div className="flex justify-end gap-2 mt-4">
                {canUpdateMeetings && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-none"
                    onClick={() => onEdit(meeting)}
                  >
                    Edit
                  </Button>
                )}
                {canDeleteMeetings && (
                  <Button
                    size="sm"
                    className="rounded-none"
                    onClick={() => onDelete(meeting.id)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No meetings found.</p>
      )}

      {/* Pagination controls */}
      {hasMore && meetings.length > 0 && (
        <div className="border border-brand-border p-2 mt-2 flex justify-center rounded-none">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadMore}
            disabled={isLoading}
            className="w-full rounded-none"
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

export default MeetingList;
