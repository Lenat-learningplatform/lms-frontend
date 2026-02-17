"use client";
import StudentListByClass from "@/components/Student/StudentListByClass";
import { useParams } from "next/navigation";
import React from "react";

const Page = () => {
  const { id, coid } = useParams();
  console.log({ id, coid });
  return (
    <div>
      <StudentListByClass
        module={coid as string}
        action={{
          label: "View Result",
          route: (studentId: string) =>
            `/tests/evaluate/${id}/student/${studentId}`,
        }}
        title="Students in Course"
      />
    </div>
  );
};

export default Page;
