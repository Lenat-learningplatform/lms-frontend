"use client";

import React, { useState } from "react";
import StudentAssignModal from "../../component/StudentAssignModal";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import StudentClassTable from "../../component/StudentClassTable";
const Page = () => {
  const [assignStudentModalOpen, setAssignStudentModalOpen] = useState(false);
  const { id } = useParams();
  const classId = Array.isArray(id) ? id[0] : id;
  return (
    <div>
      <div>
        <Button onClick={() => setAssignStudentModalOpen(true)}>
          Search &amp; Assign Student
        </Button>
      </div>
      <StudentClassTable />
      {assignStudentModalOpen && classId && (
        <StudentAssignModal
          open={assignStudentModalOpen}
          onOpenChange={setAssignStudentModalOpen}
          classId={classId}
        />
      )}
    </div>
  );
};

export default Page;
