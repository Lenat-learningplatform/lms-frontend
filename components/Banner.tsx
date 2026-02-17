"use client";

import { getServerSession } from "next-auth";
import { getSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

const Banner: React.FC = () => {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Fetch session on component mount
    const fetchSession = async () => {
      const sessionData = await getSession();
      setSession(sessionData);
    };

    fetchSession();
  }, []);

  const pathname = usePathname();
  if (!session) {
    return null; // or a loading spinner or placeholder
  }

  if (pathname === "/en/my-courses/courses" || pathname === "/en/my-courses") {
    return (
      <div className="bg-[#f8fcff] dark:bg-background ">
        <div
          className="w-full  h-auto flex items-center lg:h-[200px] "
          style={{
            background:
              "linear-gradient(87.7deg, #218EE1 -3.03%, #347CB3 38.12%, #396180 103.95%)",
          }}
        >
          <div className="p-6 flex flex-col md:flex-row items-center container justify-center  md:pb-0">
            {/* Left Image */}
            <div className="w-full mb-4 md:mb-0 md:w-auto md:mr-6 hidden md:block">
              <img
                src="/images/banner.png"
                alt="Banner Image"
                className="w-full h-auto object-contain object-bottom max-w-[280px]"
              />
            </div>
            {/* Right Text */}
            <div className="w-full text-center md:w-auto">
              <h1 className="font-poppins font-bold text-[32px] md:text-[40px] leading-[100%] tracking-[0%] text-white mb-3">
                Hi, {session?.user?.name || ""}!
              </h1>
              <p className="font-poppins font-medium text-[18px] md:text-[24px] leading-[100%] tracking-[0%] text-white">
                Welcome back to Dashcode, let’s continue our journey.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Banner;
