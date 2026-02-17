import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./theme.css";
import { ThemeProvider } from "@/providers/theme-provider";
import MountedProvider from "@/providers/mounted.provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { getLangDir } from "rtl-detect";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import DirectionProvider from "@/providers/direction-provider";
import AuthProvider from "@/providers/auth.provider";
import { Providers } from "../providers";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dashcode admin Template",
  description: "created by codeshaper",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // You can validate and use params.locale directly
  const { locale } = await params;
  const messages = await getMessages({ locale });
  const direction = getLangDir(locale);
  return (
    <html
      lang={locale}
      dir={direction}
      className="light"
      style={{ colorScheme: "light" }}
    >
      <body className={`${inter.className} dashcode-app `}>
        <Providers>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <AuthProvider>
              <ThemeProvider attribute="class" defaultTheme="light">
                <MountedProvider>
                  <DirectionProvider direction={direction}>
                    {children}
                  </DirectionProvider>
                </MountedProvider>
                <Toaster />
                <SonnerToaster />
              </ThemeProvider>
            </AuthProvider>
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
