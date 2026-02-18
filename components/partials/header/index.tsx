"use client";

import React from "react";
import HeaderContent from "./header-content";
import HeaderSearch from "./header-search";
import ProfileInfo from "./profile-info";
import Notifications from "./notifications";
import Messages from "./messages";
import { Cart } from "./cart";
import ThemeSwitcher from "./theme-switcher";
import { SidebarToggle } from "@/components/partials/sidebar/sidebar-toggle";
import { SheetMenu } from "@/components/partials/sidebar/menu/sheet-menu";
import HorizontalMenu from "./horizontal-menu";
import LocalSwitcher from "./locale-switcher";
import HeaderLogo from "./header-logo";
import { usePathname } from "@/components/navigation";
import { useTranslations } from "next-intl";
import { getMenuList } from "@/lib/menus";
import { hasPermission } from "@/lib/hasPermission";
import { permission } from "process";
import { useSession } from "next-auth/react";
import SecondHeaderContent from "./second-header";
import { Link } from "@/i18n/routing";
const DashCodeHeader = () => {
  const t = useTranslations("Menu");
  const pathname = usePathname();
  const menuList = getMenuList(pathname, t);
  const { data: session } = useSession();
  const roles = session?.user.roles;
  return (
    <>
      <HeaderContent>
        <div className="flex gap-3 items-center">
          <HeaderLogo />
          <SidebarToggle />
          {/* <HeaderSearch /> */}
        </div>
        <div className="nav-tools flex items-center md:gap-4 gap-3">
          {/* <LocalSwitcher /> */}
          {/* <ThemeSwitcher /> */}
          {/* <Cart /> */}
          {/* <Messages /> */}
          <Notifications />
          <ProfileInfo />
          <SheetMenu />
        </div>
      </HeaderContent>

      <SecondHeaderContent>
        <div className="flex  items-center ">
          {menuList.map((group, index) => (
            <div key={group.id + index} className="group-menu">
              {/* Removed extra emphasis on the group label */}
              <div className="menu-items flex ">
                {group.menus.map((menu, index) => (
                  <React.Fragment key={menu.id + index}>
                    {hasPermission(roles, menu.permission) && (
                      <div
                        className={`menu-item text-sm font-medium cursor-pointer mr-3  ${
                          menu.active
                            ? "text-brand-light font-extrabold "
                            : "text-gray-700 hover:text-brand-light"
                        }`}
                      >
                        <Link
                          href={menu.href}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="flex items-center gap-2"
                        >
                          {menu.label}
                        </Link>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SecondHeaderContent>

      <HorizontalMenu />
    </>
  );
};

export default DashCodeHeader;
