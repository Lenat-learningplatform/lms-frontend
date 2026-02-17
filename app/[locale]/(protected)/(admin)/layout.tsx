import { getServerSession } from "next-auth";
import { redirect } from "@/components/navigation";
import { authOptions } from "@/lib/authOptions";

const layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }
  return <>{children}</>;
};

export default layout;
