import Image from "next/image";

export default function StepByStepSection() {
  return (
    <section
      id="how-it-works"
      className="bg-white w-full flex flex-col items-center justify-center py-20 px-2"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-[#1a365d] text-center mb-4">
        We Walk With You, Step by Step
      </h2>
      <p className="text-lg text-[#4b5563] text-center mb-16 max-w-2xl">
        Our program is designed to support your child&apos;s educational journey
        with personalized attention and cultural understanding.
      </p>
      <div className="w-full max-w-5xl mx-auto">
        <div className="relative flex flex-col md:flex-row justify-center items-center md:items-stretch gap-y-12 md:gap-x-8">
          {/* Dashed Arcs - Hidden on mobile */}
          <div className="hidden md:block absolute inset-0 pointer-events-none">
            {/* Arc 1: 1 -> 2 (Bottom) */}
            <Image
              src="/images/dotcurve.svg"
              className="absolute bottom-[-30px] left-[5%] "
              alt=""
              height={100}
              width={400}
            />
            <Image
              src="/images/dotcurve.svg"
              className="absolute top-[-30px] left-[50%] -translate-x-1/2 rotate-180"
              alt=""
              height={100}
              width={400}
            />
            <Image
              src="/images/dotcurve.svg"
              className="absolute  bottom-[-30px] left-[75%] -translate-x-1/2"
              alt=""
              height={100}
              width={400}
            />
          </div>

          {/* Step 1 */}
          <div className="group relative z-10 flex-1 bg-white hover:bg-[#f4faff] border border-[#e3eaf5] rounded-lg p-6 flex flex-col items-start w-full max-w-xs transition-colors duration-300">
            <div className="bg-[#e6faeb] rounded-md w-12 h-12 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-[#34d399]">1</span>
            </div>
            <h3 className="text-lg font-semibold text-[#1a365d] mb-2">
              Sign up
            </h3>
            <p className="text-[#4b5563] text-base">
              Tell us about your child&apos;s grade and learning needs.
            </p>
          </div>
          {/* Step 2 */}
          <div className="group relative z-10 flex-1 bg-white hover:bg-[#f4faff] border border-[#e3eaf5] rounded-lg p-6 flex flex-col items-start w-full max-w-xs transition-colors duration-300">
            <div className="bg-[#e6faeb] rounded-md w-12 h-12 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-[#34d399]">2</span>
            </div>
            <h3 className="text-lg font-semibold text-[#1a365d] mb-2">
              We Assign a Tutor
            </h3>
            <p className="text-[#4b5563] text-base">
              One of our trained tutors will be matched with your child.
            </p>
          </div>
          {/* Step 3 */}
          <div className="group relative z-10 flex-1 bg-white hover:bg-[#f4faff] border border-[#e3eaf5] rounded-lg p-6 flex flex-col items-start w-full max-w-xs transition-colors duration-300">
            <div className="bg-[#e6faeb] rounded-md w-12 h-12 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-[#34d399]">3</span>
            </div>
            <h3 className="text-lg font-semibold text-[#1a365d] mb-2">
              Start Learning
            </h3>
            <p className="text-[#4b5563] text-base">
              Regular sessions, homework help, and guided lessons begin.
            </p>
          </div>
          {/* Step 4 */}
          <div className="group relative z-10 flex-1 bg-white hover:bg-[#f4faff] border border-[#e3eaf5] rounded-lg p-6 flex flex-col items-start w-full max-w-xs transition-colors duration-300">
            <div className="bg-[#e6faeb] rounded-md w-12 h-12 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-[#34d399]">4</span>
            </div>
            <h3 className="text-lg font-semibold text-[#1a365d] mb-2">
              Track Progress
            </h3>
            <p className="text-[#4b5563] text-base">
              Use our web platform to see growth, quizzes, and class reports.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
