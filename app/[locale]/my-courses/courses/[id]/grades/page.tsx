"use client";

import React from "react";
import GradeList from "./component/GradeList";
import { useParams } from "next/navigation";

const GradePage = () => {
  const { id } = useParams();
  return (
    <div>
      <GradeList id={id as string} />
    </div>
  );
};

export default GradePage;
