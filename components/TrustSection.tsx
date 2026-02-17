import Image from "next/image";

export default function TrustSection() {
  return (
    <section
      id="why-us"
      className="relative w-full bg-[#f4faff] py-40 px-2 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Top decorative wave, match CTASection */}
      <div
        className="w-full absolute top-0 left-0 z-10"
        style={{ lineHeight: 0 }}
      >
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
      <div className="relative z-20 w-full max-w-[1400px] mx-auto flex flex-col items-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[#1a365d] text-center mb-3 mt-8">
          Why Habesha Families Trust Us
        </h2>
        <p className="text-lg text-[#4b5563] text-center mb-12 max-w-2xl">
          We&apos;re committed to supporting our community with culturally-aware
          education.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center w-full gap-10 md:gap-16">
          {/* Image with double border */}
          <div className="relative w-[320px] h-[260px] md:w-[540px] md:h-[460px] flex-shrink-0 mb-8 md:mb-0">
            <Image
              src="/images/fam.png"
              alt="Habesha family"
              fill
              style={{ objectFit: "contain" }}
              className="rounded-md z-20"
              priority
            />
          </div>
          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-28 gap-y-20 w-full max-w-3xl">
            {/* Card 1 */}
            <div className="relative bg-white border border-[#e3eaf5] rounded-md p-6 flex flex-col justify-center min-h-[110px]">
              <div className="absolute -right-8 bottom-0 translate-y-1/2 w-12 h-12 bg-[#F0F9FF] border-4 border-white rounded-full flex items-center justify-center shadow-md">
                <span className="text-xl font-bold text-[#34d399]">1</span>
              </div>
              <div className="font-semibold text-[#1a365d] mb-1">
                Cultural Understanding
              </div>
              <div className="text-[#4b5563] text-sm">
                Specialized support for immigrant students adjusting to U.S.
                schools
              </div>
            </div>
            {/* Card 2 */}
            <div className="relative bg-white border border-[#e3eaf5] rounded-md p-6 flex flex-col justify-center min-h-[110px]">
              <div className="absolute -left-8 bottom-0 translate-y-1/2 w-12 h-12 bg-[#F0F9FF] border-4 border-white  rounded-full flex items-center justify-center shadow-md">
                <span className="text-xl font-bold text-[#34d399]">2</span>
              </div>
              <div className="font-semibold text-[#1a365d] mb-1">
                Easy-to-Use Platform
              </div>
              <div className="text-[#4b5563] text-sm">
                Tutors who understand our culture, language, and values
              </div>
            </div>
            {/* Card 3 */}
            <div className="relative bg-white border border-[#e3eaf5] rounded-md p-6 flex flex-col justify-center min-h-[110px]">
              <div className="absolute -right-8 top-0 -translate-y-1/2 w-12 h-12 bg-[#F0F9FF] border-4 border-white  rounded-full flex items-center justify-center shadow-md">
                <span className="text-xl font-bold text-[#34d399]">3</span>
              </div>
              <div className="font-semibold text-[#1a365d] mb-1">
                Specialized Support
              </div>
              <div className="text-[#4b5563] text-sm">
                A safe space where students are encouraged and uplifted
              </div>
            </div>
            {/* Card 4 */}
            <div className="relative bg-white border border-[#e3eaf5] rounded-md p-6 flex flex-col justify-center min-h-[110px]">
              <div className="absolute -left-8 top-0 -translate-y-1/2 w-12 h-12 bg-[#F0F9FF] border-4 border-white  rounded-full flex items-center justify-center shadow-md">
                <span className="text-xl font-bold text-[#34d399]">4</span>
              </div>
              <div className="font-semibold text-[#1a365d] mb-1">
                Safe Learning Environment
              </div>
              <div className="text-[#4b5563] text-sm">
                A mission-driven company focused on empowering our community
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Bottom decorative wave, match CTASection */}
      <div
        className="w-full absolute bottom-0 left-0 z-20"
        style={{ lineHeight: 0 }}
      >
        <svg
          viewBox="0 0 1920 60"
          width="100%"
          height="60"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block", width: "100%", height: 60 }}
        >
          <path
            d="M0,30 Q40,0 80,30 T160,30 T240,30 T320,30 T400,30 T480,30 T560,30 T640,30 T720,30 T800,30 T880,30 T960,30 T1040,30 T1120,30 T1200,30 T1280,30 T1360,30 T1440,30 T1520,30 T1600,30 T1680,30 T1760,30 T1840,30 T1920,30 L1920,60 L0,60 Z"
            fill="#fff"
          />
        </svg>
      </div>
    </section>
  );
}
