"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { Link, usePathname } from "@/components/navigation";
import { useConfig } from "@/hooks/use-config";
import { useTranslations } from "next-intl";
import { getStudentMenuList } from "@/lib/menus";
import { Icon } from "@/components/ui/icon";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { useMediaQuery } from "@/hooks/use-media-query";

// Adjusted types to align with getStudentMenuList
interface Menu {
  href: string;
  label: string;
  icon?: string | null; // Allow null or undefined for icon
  active?: boolean;
  id?: string;
  submenus?: Menu[]; // Made submenus optional to match the returned type
}

export default function HorizontalMenu() {
  const [config] = useConfig();

  const t = useTranslations("Menu");
  const pathname = usePathname();

  // Updated menuList to use getStudentMenuList
  const menuList: Menu[] = getStudentMenuList(pathname, t);

  const [openDropdown, setOpenDropdown] = React.useState<boolean>(false);

  const isDesktop = useMediaQuery("(min-width: 1280px)");

  if (config.layout !== "horizontal" || !isDesktop) return null;
  return (
    <div>
      <Menubar className="py-2.5 h-auto flex-wrap bg-card">
        {menuList?.map(({ href, label, icon, active, id, submenus }, index) =>
          submenus?.length === 0 ? (
            <MenubarMenu key={index}>
              <MenubarTrigger asChild>
                <Link
                  href={href}
                  className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-md ${
                    active ? "bg-blue-500 text-white" : "hover:bg-gray-100"
                  }`}
                >
                  {icon && <Icon icon={icon} className="h-5 w-5" />}
                  {label}
                </Link>
              </MenubarTrigger>
            </MenubarMenu>
          ) : (
            <MenubarMenu key={index}>
              <MenubarTrigger className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100">
                {icon && <Icon icon={icon} className="h-5 w-5" />}
                <span>{label}</span>
                <ChevronDown className="h-4 w-4" />
              </MenubarTrigger>
              <MenubarContent>
                {submenus?.map(
                  ({ href, label, icon, submenus: subChildren }, index) =>
                    subChildren?.length === 0 ? (
                      <MenubarItem
                        key={`sub-index-${index}`}
                        className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                        asChild
                      >
                        <Link href={href} className="flex items-center gap-2">
                          {icon && <Icon icon={icon} className="h-4 w-4" />}
                          {label}
                        </Link>
                      </MenubarItem>
                    ) : (
                      <React.Fragment key={`sub-in-${index}`}>
                        <MenubarSub>
                          <MenubarSubTrigger className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
                            {icon && <Icon icon={icon} className="h-4 w-4" />}
                            {label}
                          </MenubarSubTrigger>
                          <MenubarSubContent>
                            {subChildren?.map(({ href, label }, index) => (
                              <MenubarItem
                                key={index}
                                className="px-4 py-2 hover:bg-gray-100"
                              >
                                <Link href={href} className="flex items-center">
                                  {label}
                                </Link>
                              </MenubarItem>
                            ))}
                          </MenubarSubContent>
                        </MenubarSub>
                      </React.Fragment>
                    )
                )}
              </MenubarContent>
            </MenubarMenu>
          )
        )}
      </Menubar>
    </div>
  );
}
