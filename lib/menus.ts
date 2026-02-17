export type SubChildren = {
  href: string;
  label: string;
  active: boolean;
  children?: SubChildren[];
};
export type Submenu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus?: Submenu[];
  children?: SubChildren[];
};

export type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  permission: string;
  submenus: Submenu[];
  id: string;
};

export type Group = {
  groupLabel: string;
  menus: Menu[];
  id: string;
};

export function getMenuList(pathname: string, t: any): Group[] {
  return [
    {
      groupLabel: t("setup"),
      id: "setup",
      menus: [
        {
          id: "roles",
          href: "/roles",
          label: t("roles"),
          active: pathname.includes("/roles"),
          icon: "heroicons-outline:home",
          permission: "read_permission",
          submenus: [],
        },
      ],
    },

    {
      groupLabel: t("admin"),
      id: "admin",
      menus: [
        {
          id: "users",
          href: "/users",
          label: t("users"),
          active: pathname.includes("/users"),
          icon: "heroicons-outline:home",
          submenus: [],
          permission: "read_user",
        },
      ],
    },
    {
      groupLabel: t("courses"),
      id: "courses",
      menus: [
        {
          id: "courses",
          href: "/all-courses",
          label: t("courses"),
          active: pathname.includes("/all-courses"),
          icon: "heroicons-outline:home",
          submenus: [],
          permission: "read_user",
          // permission: "create_module",
        },
        {
          id: "courses22",
          href: "/tch/course",
          label: t("my-courses"),
          active: pathname.includes("/tch/course"),
          icon: "heroicons-outline:home",
          submenus: [],
          permission: "create_module",
        },
      ],
    },
    {
      groupLabel: t("enrolled"),
      id: "enrolled",
      menus: [
        {
          id: "enrolled-courses",
          href: "/my-courses/courses",
          label: t("courses"),
          active: pathname.includes("/enrolled/courses"),
          icon: "heroicons-outline:home",
          submenus: [],
          permission: "read_my_enrolled_module",
        },
      ],
    },
    {
      groupLabel: t("logs"),
      id: "logs",
      menus: [
        {
          id: "my-activity",
          href: "/my-activity",
          label: t("my-activity"),
          active: pathname.includes("/my-activity"),
          icon: "heroicons-outline:home",
          submenus: [],
          permission: "any",
        },
        {
          id: "logs",
          href: "/logs",
          label: t("logs"),
          active: pathname.includes("/logs"),
          icon: "heroicons-outline:home",
          submenus: [],
          permission: "read_activity_log",
        },
      ],
    },
    {
      groupLabel: t("calendar"),
      id: "calendar",
      menus: [
        {
          id: "calendar",
          href: "/calendar",
          label: t("calendar"),
          active: pathname.includes("/calendar"),
          icon: "heroicons-outline:home",
          submenus: [],
          permission: "any",
        },
      ],
    },
  ];
}
export function getStudentMenuList(pathname: string, t: any): Menu[] {
  // Extract the courseId from the pathname if it matches the pattern
  const courseIdMatch = pathname.match(/\/my-courses\/courses\/([^/]+)/);
  const courseId = courseIdMatch ? courseIdMatch[1] : null;

  return [
    {
      id: "introduction",
      href: courseId ? `/my-courses/courses/${courseId}` : "",
      label: t("intro"),
      active: pathname === `/my-courses/courses/${courseId}`,
      icon: "heroicons-outline:home",
      submenus: [],
      permission: "read_my_enrolled_module",
    },
    {
      id: "chapters",
      href: courseId ? `/my-courses/courses/${courseId}/chapter` : "",
      label: t("chapters"),
      active: pathname.includes(`/my-courses/courses/${courseId}/chapter`),
      icon: "heroicons-outline:home",
      submenus: [],
      permission: "read_my_enrolled_module",
    },
    {
      id: "tests",
      href: courseId ? `/my-courses/courses/${courseId}/tests` : "",
      label: t("tests"),
      active: pathname.includes(`/my-courses/courses/${courseId}/tests`),
      icon: "heroicons-outline:home",
      submenus: [],
      permission: "read_my_enrolled_module",
    },
    {
      id: "grades",
      href: courseId ? `/my-courses/courses/${courseId}/grades` : "",
      label: t("grades"),
      active: pathname === `/my-courses/courses/${courseId}/grades`,
      icon: "heroicons-outline:home",
      submenus: [],
      permission: "read_my_enrolled_module",
    },
    {
      id: "meetings",
      href: "meetings",
      label: t("meetings"),
      active: pathname.includes("/meetings"),
      icon: "heroicons-outline:home",
      submenus: [],
      permission: "read_my_enrolled_module",
    },

    {
      id: "logs",
      href: "/logs",
      label: t("logs"),
      active: pathname === "/logs",
      icon: "heroicons-outline:home",
      submenus: [],
      permission: "read_activity_log",
    },
    {
      id: "calendar",
      href: "calendar",
      label: t("calendar"),
      active: pathname.includes("/calendar"),
      icon: "heroicons-outline:home",
      submenus: [],
      permission: "any",
    },
    {
      id: "discussions",
      href: "discussions",
      label: t("discussions"),
      active: pathname.includes("/discussions"),
      icon: "heroicons-outline:home",
      submenus: [],
      permission: "read_my_enrolled_module",
    },
  ];
}

export function getHorizontalMenuList(pathname: string, t: any): Group[] {
  return [
    {
      groupLabel: t("dashboard"),
      id: "dashboard",
      menus: [
        {
          id: "dashboard",
          href: "/",
          label: t("dashboard"),
          active: pathname.includes("/"),
          icon: "heroicons-outline:home",
          submenus: [],
          permission: "any",
        },
      ],
    },
  ];
}
