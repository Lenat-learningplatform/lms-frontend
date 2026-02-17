import LayoutProvider from "@/providers/layout.provider";
import LayoutContentProvider from "@/providers/content.provider";
import DashCodeHeader from "@/components/partials/header";
import { getServerSession } from "next-auth";

import { redirect } from "@/components/navigation";
import { authOptions } from "@/lib/authOptions";
import CourseHeader from "@/components/partials/header/CourseHeader";
import Banner from "@/components/Banner";
import { usePathname } from "next/navigation";
import path from "path";

const layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/"); // Removed unnecessary 'await'
  }

  return (
    <LayoutProvider>
      <CourseHeader />

      <Banner />
      <LayoutContentProvider>{children}</LayoutContentProvider>
      {/* <DashCodeFooter /> */}
    </LayoutProvider>
  );
};

export default layout;
