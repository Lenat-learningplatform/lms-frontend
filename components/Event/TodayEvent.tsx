"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, ChevronDown } from "lucide-react";

export type EventData = {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  extendedProps: {
    calendar: string;
  };
};

const TodayEvent = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Fetch events from the API
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["today-events"],
    queryFn: async () => {
      const response = await api.get(
        `/get-calendars?start_date=2025-05-31&end_date=2025-07-12`
      );
      return response.data;
    },
  });

  const events: EventData[] = data?.data || [];

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

  // Format time and date
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    });
  };

  return (
    <div className="p-4 bg-white border border-brand-border rounded-lg">
      {/* Events Container */}
      <div className="">
        <div className="flex items-center mb-6 gap-4">
          <Calendar size={25} strokeWidth={3} className="text-[#3BD07A]" />

          <h2 className="text-xl font-poppins font-semibold text-brand-dark">
            Events for June 20
          </h2>
        </div>
        {/* Vertical List */}
        {events.length === 0 && (
          <p className="text-gray-500 text-center py-8">No events available.</p>
        )}
        <div className="pl-2">
          {events.map((event: EventData, index: number) => {
            const isSameDay =
              new Date(event.start).toDateString() ===
              new Date(event.end).toDateString();

            return (
              <div
                key={event.id}
                className={`relative bg-white p-4 cursor-pointer transition-all duration-300 w-full ${
                  expandedId === event.id ? "bg-blue-50" : "bg-white"
                } ${
                  index !== events.length - 1
                    ? "border-b border-brand-border"
                    : ""
                }`}
                onClick={() => toggleExpand(event.id)}
              >
                <div className="flex items-start">
                  <div className="overflow-hidden">
                    <h3 className="font-medium">{event.title}</h3>
                    {expandedId === event.id && (
                      <div className="mt-2 animate-fade-in">
                        <p className="text-sm text-gray-600">
                          Start: {formatTime(event.start)}
                        </p>
                        <p className="text-sm text-gray-600">
                          End:{" "}
                          {isSameDay
                            ? formatTime(event.end)
                            : `${formatDate(event.end)} ${formatTime(
                                event.end
                              )}`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <ChevronDown
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 transition-transform ${
                    expandedId === event.id ? "rotate-180" : ""
                  }`}
                  size={16}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TodayEvent;
