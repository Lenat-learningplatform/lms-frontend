"use client";

import { useParams } from "next/navigation";
import React from "react";
import TestList from "./components/TestList";

const Tests = () => {
  const { id } = useParams();
  return (
    <div>
      {" "}
      <TestList moduleId={id as string} />{" "}
    </div>
  );
};

export default Tests;
