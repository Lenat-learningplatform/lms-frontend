import Image from "next/image";
import Link from "next/link";

export default function CTASection() {
  return (
    <section className="w-full bg-[#0d7ad1] pt-0 pb-24 flex flex-col items-center justify-center overflow-hidden">
      {/* Top decorative wave, very short wavelength, blue on top, wave rotated 180 */}
      <div className="w-full" style={{ lineHeight: 0 }}>
        <svg
          viewBox="0 0 1920 60"
          width="100%"
          height="60"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            display: "block",
            width: "100%",
            height: 60,
            transform: "rotate(180deg)",
          }}
        >
          <path
            d="M0,30 Q40,0 80,30 T160,30 T240,30 T320,30 T400,30 T480,30 T560,30 T640,30 T720,30 T800,30 T880,30 T960,30 T1040,30 T1120,30 T1200,30 T1280,30 T1360,30 T1440,30 T1520,30 T1600,30 T1680,30 T1760,30 T1840,30 T1920,30 L1920,60 L0,60 Z"
            fill="#fff"
          />
        </svg>
      </div>
      <div className="relative z-20 flex flex-col items-center justify-center w-full px-4 mt-20">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-6">
          Ready to Support Your Child&apos;s Journey?
        </h2>
        <p className="text-lg text-white text-center mb-10 max-w-2xl">
          Fill out our short form and we&apos;ll match your child with the
          perfect tutor from our team.
        </p>
       
        <div className="flex flex-wrap gap-6 justify-center items-center">
              <Link
               href="/register"
           className="bg-white hover:bg-[#e3f2fd] text-[#0d7ad1] font-semibold px-10 py-3 rounded transition text-lg min-w-[160px]"
          >
            Enroll Now
          </Link>
          {/* <button  className="bg-white hover:bg-[#e3f2fd] text-[#0d7ad1] font-semibold px-10 py-3 rounded transition text-lg min-w-[260px] flex items-center gap-2">
            <svg
              width="22"
              height="22"
              fill="none"
              stroke="#0d7ad1"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            Book a Free Consultation
          </button>
          <button className="text-white font-semibold px-6 py-3 rounded transition text-lg underline underline-offset-2">
            Login to Student Platform
          </button> */}
        </div>
      </div>
    </section>
  );
}
