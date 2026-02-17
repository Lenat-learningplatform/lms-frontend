import LayoutContentProvider from "@/providers/content.provider";
import LayoutProvider from "@/providers/layout.provider";

import HomeHeader from "@/components/partials/header/HomeHeader";
import LayoutContentProviderLanding from "@/providers/content.provider.landing";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <LayoutProvider>
      <HomeHeader />

      <LayoutContentProviderLanding>{children}</LayoutContentProviderLanding>
      {/* <DashCodeFooter /> */}
    </LayoutProvider>
  );
};

export default layout;
