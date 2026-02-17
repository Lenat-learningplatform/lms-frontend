"use client";
import React from "react";
import DashCodeLogo from "./dascode-logo";
import { Link } from "@/i18n/routing";
import { useConfig } from "@/hooks/use-config";
import { useMenuHoverConfig } from "@/hooks/use-menu-hover";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useSession } from "next-auth/react";
import { hasPermission } from "@/lib/hasPermission";
import { useGetLink } from "@/hooks/useHasPermission";

const Logo = () => {
  const [config] = useConfig();
  const [hoverConfig] = useMenuHoverConfig();
  const { data: session, status } = useSession(); // Get session and status
  const { hovered } = hoverConfig;
  const link = useGetLink();
  const isDesktop = useMediaQuery("(min-width: 1280px)");

  if (config.sidebar === "compact") {
    return (
      <Link
        href={link || "#"}
        className="flex gap-2 items-center   justify-center    "
      >
        <DashCodeLogo className="  text-default-900 h-8 w-8 [&>path:nth-child(3)]:text-background [&>path:nth-child(2)]:text-background" />
      </Link>
    );
  }
  if (config.sidebar === "two-column" || !isDesktop) return null;

  return (
    <Link href={link || "#"} className="flex gap-2 items-center    ">
      <DashCodeLogo className="  text-default-900 h-8 w-8 [&>path:nth-child(3)]:text-background [&>path:nth-child(2)]:text-background" />
      {(!config?.collapsed || hovered) && (
        <h1 className="text-xl font-semibold text-default-900 ">DashCode</h1>
      )}
    </Link>
  );
};

export default Logo;
