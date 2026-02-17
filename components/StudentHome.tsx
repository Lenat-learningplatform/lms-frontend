import MyCourse from "@/app/[locale]/my-courses/components/MyCourses";
import React from "react";
import AnnouncementGeneralList from "./Announcement/AnnouncementGeneralList";
import TodayEvent from "./Event/TodayEvent";

const StudentHome = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col lg:flex-row gap-7">
        <div className="flex-1">
          <MyCourse />
        </div>
        <div className="w-full lg:w-[40%] flex flex-col gap-2">
          <AnnouncementGeneralList />
          <TodayEvent />
        </div>
      </div>
    </div>
  );
};

export default StudentHome;
