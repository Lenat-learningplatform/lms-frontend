import React from "react";

type PermissionDeniedProps = {
  ending: string;
};

const PermissionDenied: React.FC<PermissionDeniedProps> = ({ ending }) => {
  return (
    <div className="w-full overflow-x-auto p-4">
      <p className="text-red-500">You do not have permission to {ending}.</p>
    </div>
  );
};

export default PermissionDenied;
