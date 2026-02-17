import LayoutProvider from "@/providers/layout.provider";
import LayoutContentProvider from "@/providers/content.provider";
import DashCodeSidebar from "@/components/partials/sidebar";
import DashCodeFooter from "@/components/partials/footer";
import DashCodeHeader from "@/components/partials/header";
import { getServerSession } from "next-auth";

import { redirect } from "@/components/navigation";
import { authOptions } from "@/lib/authOptions";

const layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }
  return (
    <LayoutProvider>
      <DashCodeHeader />
      {/* <DashCodeSidebar /> */}
      <LayoutContentProvider>{children}</LayoutContentProvider>
      {/* <DashCodeFooter /> */}
    </LayoutProvider>
  );
};

export default layout;
