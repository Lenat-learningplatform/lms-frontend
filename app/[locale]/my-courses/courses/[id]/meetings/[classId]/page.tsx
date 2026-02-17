"use client";

import MeetingView from "@/app/[locale]/(protected)/(teacher)/tch/course/component/MeetingView";
import { useParams } from "next/navigation";
import React from "react";

const MeetingPage = () => {
  const { id, classId } = useParams(); // Assuming you're using a router that provides this hook
  return (
    <div>
      <MeetingView clid={id as string} module={classId as string} />
    </div>
  );
};

export default MeetingPage;
