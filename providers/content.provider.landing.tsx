"use client";
import { useConfig } from "@/hooks/use-config";
import React from "react";
import { cn } from "@/lib/utils";

const LayoutContentProviderLanding = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [config] = useConfig();

  return (
    <main
      className={cn("flex-1  ", {
        "bg-white dark:bg-background": config.skin === "default",
        "bg-transparent": config.skin === "bordered",
      })}
    >
      <div
        className={cn("", {
          container: config.contentWidth === "boxed",
        })}
      >
        {children}
      </div>
    </main>
  );
};

export default LayoutContentProviderLanding;
