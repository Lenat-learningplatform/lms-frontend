import React from "react";

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex items-center justify-center w-full mb-8">
      {steps.map((label, idx) => (
        <React.Fragment key={label}>
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center rounded-full w-10 h-10 text-lg font-bold border-2 transition-colors duration-200 ${
                idx <= currentStep
                  ? "bg-[#0870C5] border-[#0870C5] text-white"
                  : "bg-[#96D1FF] border-[#96D1FF] text-black"
              }`}
            >
              {idx + 1}
            </div>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`flex-1 h-1  transition-colors ${
                currentStep > idx ? "bg-[#0870C5]" : "bg-[#96D1FF]"
              }`}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
