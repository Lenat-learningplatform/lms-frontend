"use client";

import DiscussionPage from "@/components/discussion/DiscussionPage";
import { useParams } from "next/navigation";
import React from "react";

const Discussions = () => {
  const { classId } = useParams(); // Assuming you're using a router that provides this hook

  return (
    <div>
      <DiscussionPage classId={classId as string} />
    </div>
  );
};

export default Discussions;
