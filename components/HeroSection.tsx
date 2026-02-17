"use client";

import Image from "next/image";
import { Phone, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HeroSection() {
  const router = useRouter();
  return (
    <section className="relative flex flex-col md:flex-row items-center justify-between px-6 md:px-20 py-16 bg-[#f4faff] overflow-hidden min-h-screen">
      <div className="max-w-[780px] z-10">
        <h1 className="text-3xl md:text-5xl md:leading-[67px] font-bold text-[#0C4A6E] mb-6">
          Supporting <span className="text-[#2083B6]">Habesha Students</span>
          <br />
          with Personalized Tutoring and
          <br />
          Cultural Understanding
        </h1>
        <p className="text-base md:text-lg text-[#4b5563] mb-8">
          Our in-house tutors provide guided support for Ethiopian and Eritrean
          immigrant students to succeed academically with a web platform
          designed to meet your needs, in your language.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/register"
            className="bg-gradient-to-r from-[#2083B6] to-[#01A0F3] hover:opacity-90 text-white font-semibold px-8 py-2 rounded transition text-center"
          >
            Start Learning Today
          </Link>
          {/* <Link
               href="/register"
            className="border border-[#2083B6] text-[#2083B6] hover:bg-[#e3f2fd] font-semibold px-8 py-2 rounded transition flex items-center gap-2"
          >
            <Phone className="w-5 h-5 text-[#2083B6]" />
            Schedule a Free Call
          </Link>
          <Link
               href="/register"
            className="border border-[#2083B6] text-[#2083B6] hover:bg-[#e3f2fd] font-semibold px-8 py-2 rounded transition flex items-center gap-2"
          >
            <Play className="w-5 h-5 text-[#2083B6]" />
            Explore Our Platform
          </Link> */}
        </div>
      </div>
      <div className="relative mt-12 md:mt-0 md:ml-12 flex-1 flex justify-center z-10">
        <Image
          src="/images/hero12.png"
          alt="Student"
          width={300}
          height={300}
          className="w-[260px]  md:w-[600px]  object-cover rounded-2xl relative z-10"
          priority
        />
      </div>
      {/* Decorative bottom wave */}
      <div
        className="absolute bottom-0 left-0 w-full h-[88px] z-20 pointer-events-none"
        style={{
          minHeight: 44,
          height: "6vw",
          maxHeight: 120,
          position: "absolute",
        }}
      >
        <Image
          src="/images/wave.svg"
          alt="Decorative wave"
          fill
          style={{ objectFit: "cover" }}
          className="pointer-events-none select-none"
          priority
        />
      </div>
      <div className="absolute bottom-0 left-0 w-full h-[44px] bg-white z-10" />
    </section>
  );
}
