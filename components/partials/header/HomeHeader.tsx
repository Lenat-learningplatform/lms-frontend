"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const navLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Platform", href: "#platform" },
  { label: "Subjects", href: "#subjects" },
  { label: "Why Us", href: "#why-us" },
];

const HomeHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && !!session;

  const isRegisterPage = pathname === "/en/register";
  const isLoginPage = pathname === "/en/login";

  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (isLoginPage) {
    return;
  }

  return (
    <header className="w-full bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 min-w-[160px]">
          <Image
            src="/images/logo/logo.svg"
            alt="TenaEd Logo"
            width={120}
            height={32}
            className="h-8 w-auto"
            priority
          />
        </Link>

        {/* Conditional Rendering for Register/Login Pages */}
        {isRegisterPage && (
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-[#222] font-medium hover:text-[#0071B9]"
            >
              Already have an account?{" "}
              <span className="font-semibold text-[#0870C5]">Login</span>
            </Link>
          </div>
        )}

        {isLoginPage && (
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/register"
              className="text-[#222] font-medium hover:text-[#0071B9]"
            >
              Don&apos;t have an account?{" "}
              <span className="font-semibold text-[#0870C5]">Sign Up</span>
            </Link>
          </div>
        )}

        {/* Default Header Content */}
        {!isRegisterPage && !isLoginPage && (
          <>
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-[#222] font-medium hover:text-[#0071B9] transition-colors"
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/my-courses/courses"
                    className="text-[#222] font-medium hover:text-[#0071B9]"
                  >
                    My Courses
                  </Link>
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="bg-[#0071B9] text-white px-4 py-2 rounded-md font-medium hover:bg-[#005a8c] transition-colors"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-[#222] font-medium hover:text-[#0071B9]"
                  >
                    Login to Platform
                  </Link>
                  <Link
                    href="/register"
                    className="bg-[#0071B9] text-white px-4 py-2 rounded-md font-medium hover:bg-[#005a8c] transition-colors"
                  >
                    Start Learning Today
                  </Link>
                </>
              )}
            </div>
          </>
        )}

        {/* Mobile Hamburger */}
        {!isRegisterPage && !isLoginPage && (
          <button
            className="md:hidden flex items-center justify-center p-2 ml-2"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Open menu"
          >
            <svg
              width="28"
              height="28"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#0071B9"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        )}
      </div>
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#F3FAFF] border-t border-[#e0eaf3] px-4 pb-4">
          <nav className="flex flex-col gap-2 mt-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[#222] font-medium py-2 hover:text-[#0071B9] transition-colors"
                onClick={(e) => {
                  handleSmoothScroll(e, link.href);
                  setMenuOpen(false);
                }}
              >
                {link.label}
              </a>
            ))}
            {isAuthenticated ? (
              <>
                <Link
                  href="/my-courses/courses"
                  className="text-[#222] font-medium py-2 hover:text-[#0071B9]"
                  onClick={() => setMenuOpen(false)}
                >
                  My Courses
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="bg-[#0071B9] text-white px-4 py-2 rounded-md font-medium mt-2 w-full hover:bg-[#005a8c] transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-[#222] font-medium py-2 hover:text-[#0071B9]"
                  onClick={() => setMenuOpen(false)}
                >
                  Login to Platform
                </Link>
                <Link
                  href="/register"
                  className="bg-[#0071B9] text-white px-4 py-2 rounded-md font-medium mt-2 text-center hover:bg-[#005a8c] transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Start Learning Today
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default HomeHeader;
