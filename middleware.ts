import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "@/config";

export default async function middleware(request: NextRequest) {
  console.log("🌍 Middleware executing...");
  console.log("Requested URL:", request.nextUrl.pathname);

  const handleI18nRouting = createMiddleware({
    locales,
    defaultLocale,
  });

  const response = handleI18nRouting(request);
  response.headers.set("dashcode-locale", defaultLocale);

  console.log("Locale applied:", defaultLocale);
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"], // Ensure middleware applies correctly
};

//teshaktual
