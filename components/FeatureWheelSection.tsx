import Image from "next/image";

export default function FeatureWheelSection() {
  return (
    <section
      id="platform"
      className="w-full flex flex-col items-center justify-center py-20 px-2 bg-white"
    >
      <div className="max-w-5xl w-full mx-auto flex flex-col items-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1a365d] mb-3 text-center">
          Modern Learning, <br className="hidden md:block" />
          Made for Our Community
        </h2>
        <p className="text-base md:text-lg text-[#4b5563] max-w-xl text-center mb-12">
          Our web app helps families access everything in one place in English,
          Amharic, and Tigrinya.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {/* Row 1 */}
          <div className="flex flex-col items-center bg-[#f4faff] rounded-lg p-6 shadow-sm">
            <Image
              src="/images/wheel/9.png"
              alt="Live Tutoring Sessions"
              width={64}
              height={64}
              className="mb-3"
            />
            <div className="font-semibold text-[#1a365d] mb-1 text-center">
              Live Tutoring Sessions
            </div>
            <div className="text-xs text-[#4b5563] text-center">
              Meet your tutor online
            </div>
          </div>
          <div className="flex flex-col items-center bg-[#f4faff] rounded-lg p-6 shadow-sm">
            <Image
              src="/images/wheel/8.png"
              alt="Choose Courses"
              width={64}
              height={64}
              className="mb-3"
            />
            <div className="font-semibold text-[#1a365d] mb-1 text-center">
              Choose Courses
            </div>
            <div className="text-xs text-[#4b5563] text-center">
              Math, Science, English, History & more
            </div>
          </div>
          <div className="flex flex-col items-center bg-[#f4faff] rounded-lg p-6 shadow-sm">
            <Image
              src="/images/wheel/7.png"
              alt="Quizzes & Practice Tests"
              width={64}
              height={64}
              className="mb-3"
            />
            <div className="font-semibold text-[#1a365d] mb-1 text-center">
              Quizzes & Practice Tests
            </div>
            <div className="text-xs text-[#4b5563] text-center">
              Test your knowledge and track your growth
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-8">
          {/* Row 2 */}
          <div className="flex flex-col items-center bg-[#f4faff] rounded-lg p-6 shadow-sm">
            <Image
              src="/images/wheel/10.png"
              alt="Parental Dashboard"
              width={64}
              height={64}
              className="mb-3"
            />
            <div className="font-semibold text-[#1a365d] mb-1 text-center">
              Parental Dashboard
            </div>
            <div className="text-xs text-[#4b5563] text-center">
              See how your child is improving
            </div>
          </div>
          <div className="flex flex-col items-center bg-[#f4faff] rounded-lg p-6 shadow-sm">
            <Image
              src="/images/wheel/11.png"
              alt="Multilingual Support"
              width={64}
              height={64}
              className="mb-3"
            />
            <div className="font-semibold text-[#1a365d] mb-1 text-center">
              Multilingual Support
            </div>
            <div className="text-xs text-[#4b5563] text-center">
              Built with Habesha families in mind
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
