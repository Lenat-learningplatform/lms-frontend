"use client";

import { usePathname } from "@/components/navigation";
import { SheetMenu } from "@/components/partials/sidebar/menu/sheet-menu-2";
import { SidebarToggle } from "@/components/partials/sidebar/sidebar-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/i18n/routing";
import api from "@/lib/api";
import { hasPermission } from "@/lib/hasPermission";
import { getStudentMenuList } from "@/lib/menus";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, ChevronDown } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import HeaderContent from "./header-content";
import HeaderLogo from "./header-logo";
import HorizontalMenu from "./horizontal-menu-2";
import Messages from "./messages";
import Notifications from "./notifications";
import ProfileInfo from "./profile-info";
import SecondHeaderContent from "./second-header";
import ThemeSwitcher from "./theme-switcher";
import { useMediaQuery } from "@/hooks/use-media-query";

type MyCourseData = {
  id: string;
  module_id: string;
  title: string;
  status: string;
  module_teacher_id: string;
};

const CourseHeader = () => {
  const t = useTranslations("Menu");
  const pathname = usePathname();
  const router = useRouter();
  const menuList = getStudentMenuList(pathname, t);
  const { data: session } = useSession();
  const roles = session?.user.roles;
  console.log({ roles });
  const [coursesOpen, setCoursesOpen] = useState(false);
  const getProperID = (currentCourse: MyCourseData, menu: string) => {
    if (menu === "meetings") {
      return currentCourse.module_teacher_id;
    } else if (menu === "discussions") {
      return currentCourse.module_teacher_id;
    } else if (menu === "calendar") {
      return currentCourse.module_teacher_id;
    }
    return "";
  };

  // Fetch enrolled courses
  const { data: coursesData } = useQuery({
    queryKey: ["header-enrolled-courses"],
    queryFn: async () => {
      const response = await api.get("/my-enrolled-modules?page=1&per_page=5");
      return response.data.data;
    },
  });

  const courses = coursesData?.data || [];
  const isCoursePage = pathname.includes("/my-courses/courses/");
  const isCourseDetailPage = pathname.includes("/my-courses/courses/");
  // Extract current course ID if on a course page
  const currentCourseIdArray = isCoursePage ? pathname.split("/") : null;
  const currentCourseId =
    currentCourseIdArray?.length !== 0 && currentCourseIdArray !== null
      ? currentCourseIdArray[3]
      : null;

  console.log({
    isCoursePage,
    currentCourseId,
    pathname,
    isCourseDetailPage,
    split: pathname.split("/"),
  });
  const currentCourse = courses.find(
    (c: MyCourseData) => c.id === currentCourseId
  );
  const isDesktop = useMediaQuery("(min-width: 1280px)");
  return (
    <>
      <HeaderContent>
        <div className="flex gap-3 items-center">
          <HeaderLogo />

          <SidebarToggle />
        </div>
        <div>
          {courses.length > 0 && (
            <DropdownMenu open={coursesOpen} onOpenChange={setCoursesOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 hover:bg-white "
                >
                  {isCoursePage && currentCourse ? (
                    <>
                      {/* <BookOpen className="w-4 h-4" /> */}
                      <span className="truncate max-w-[160px] text-brand-dark">
                        {currentCourse.title}
                      </span>
                    </>
                  ) : (
                    <>
                      {/* <BookOpen className="w-4 h-4" /> */}
                      <span>My Courses</span>
                    </>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      coursesOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 max-h-[400px] overflow-y-auto text-#242E49">
                {isCoursePage && (
                  <DropdownMenuItem
                    onClick={() => router.push("/my-courses")}
                    className="cursor-pointer hover:bg-default dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      All Courses
                    </div>
                  </DropdownMenuItem>
                )}
                {courses.map((course: MyCourseData, index: number) => (
                  <DropdownMenuItem
                    key={course.id + " " + index}
                    onClick={() =>
                      router.push(`/my-courses/courses/${course.id}`)
                    }
                    className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
                      course.id === currentCourseId
                        ? "bg-gray-100 dark:bg-gray-800"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          course.status === "completed"
                            ? "bg-green-500"
                            : course.status === "in_progress"
                            ? "bg-blue-500"
                            : "bg-gray-300"
                        }`}
                      />
                      <span className="truncate">{course.title}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
                {coursesData?.last_page > 1 && (
                  <DropdownMenuItem
                    onClick={() => router.push("/my-courses")}
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-600 dark:text-blue-400"
                  >
                    View all courses...
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div className="nav-tools flex items-center md:gap-4 gap-3">
          {/* <ThemeSwitcher /> */}
          {/* <Messages /> */}
          <Notifications />
          <ProfileInfo />
          {currentCourse && <SheetMenu />}
        </div>
      </HeaderContent>
      {currentCourse && isDesktop && (
        <SecondHeaderContent>
          <div className="flex items-center justify-around max-w-[766px] mx-auto">
            {menuList.map((menu, index) => (
              <>
                {hasPermission(roles, menu.permission) && (
                  <div
                    key={menu.id + index}
                    className={`menu-item group text-sm font-medium cursor-pointer mr-3 relative pb-2 `}
                  >
                    <button
                      onClick={() => {
                        let targetHref = menu.href;
                        if (
                          isCourseDetailPage &&
                          currentCourseId &&
                          menu.href.startsWith("/")
                        ) {
                          targetHref = menu.href;
                        } else if (
                          isCourseDetailPage &&
                          currentCourseId &&
                          !menu.href.startsWith("/")
                        ) {
                          targetHref = `/my-courses/courses/${currentCourseId}/${
                            menu.href
                          }/${getProperID(currentCourse, menu.href)}`;
                        }
                        router.push(targetHref);
                      }}
                      className={`flex items-center gap-2 px-6 py-1 text-brand-gray  ${
                        menu.active
                          ? "bg-[#ABE2FF] border border-[#25D3FF] rounded-full text-brand-dark font-medium "
                          : "text-brand-gray hover:text-brand-light "
                      }`}
                    >
                      {menu.label}
                    </button>
                  </div>
                )}
              </>
            ))}
          </div>
        </SecondHeaderContent>
      )}

      {/* <HorizontalMenu /> */}
    </>
  );
};

export default CourseHeader;
