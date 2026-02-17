"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Loader2, Calendar } from "lucide-react";

const UpcomingEvents = ({ module_id }: { module_id: string }) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["upcoming-events", module_id],
    queryFn: async () => {
      const response = await api.get(
        `https://lms.amanueld.info/api/upcoming-events?module_id=${module_id}`
      );
      return response.data.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-red-500 text-center py-8">
        Error: {error instanceof Error ? error.message : "Unknown error"}
      </p>
    );
  }

  return (
    <div className="p-4 bg-white border border-brand-border rounded-lg pb-0 text-brand-dark">
      {/* Events Container */}
      <div className="">
        <div className="flex items-center mb-6 gap-4">
          <Calendar size={25} strokeWidth={3} className="text-[#3BD07A]" />

          <h2 className="text-xl font-poppins font-semibold text-brand-dark">
            Upcoming Events
          </h2>
        </div>
        {data.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No upcoming events available.
          </p>
        )}
        <div className="pl-2">
          {data.map((event: any) => {
            const startDate = new Date(event.start);
            const month = startDate.toLocaleString("default", {
              month: "short",
            });
            const day = startDate.getDate();
            const time = startDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={event.title}
                className="relative bg-white p-4 cursor-pointer transition-all duration-300 w-full border-b border-brand-border"
              >
                <div className="flex items-start">
                  <div className="flex flex-col items-center justify-center w-16 border-r border-brand-border">
                    <span className="text-lg font-bold ">{month}</span>
                    <span className="text-2xl font-extrabold ">{day}</span>
                  </div>
                  {/* Thin vertical line */}
                  <div className="overflow-hidden pl-2">
                    <h3 className="font-medium text-brand-dark">
                      {event.title}
                    </h3>
                    <p className="text-sm  mt-1">{time}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UpcomingEvents;
