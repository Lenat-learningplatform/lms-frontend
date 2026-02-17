import Image from "next/image";

export default function SubjectsSection() {
  return (
    <section
      id="subjects"
      className="w-full flex flex-col items-center justify-center py-20 px-2 bg-white"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-[#1a365d] text-center mb-20 tracking-wide">
        SUBJECTS WE OFFER
      </h2>
      <div className="flex flex-col items-center w-full max-w-[1400px] mx-auto">
        {/* Top row: 3 subjects */}
        <div className="flex flex-col md:flex-row justify-around items-center gap-12 w-full mb-16">
          {/* Math */}
          <div className="flex flex-col items-center md:items-start md:flex-row gap-6 md:gap-4">
            <div className="bg-[#EEFFEB] rounded-full w-24 h-24 flex items-center justify-center mb-4 md:mb-0">
              <Image
                src="/images/subject/2.svg"
                alt="Habesha family"
                className="rounded-md z-20"
                height={40}
                width={40}
                priority
              />
            </div>
            <div>
              <div className="font-bold text-lg md:text-xl text-[#1a365d] mb-1">
                Math
              </div>
              <div className="text-[#4b5563] text-base">All levels</div>
            </div>
          </div>
          {/* Science */}
          <div className="flex flex-col items-center md:items-start md:flex-row gap-6 md:gap-4">
            <div className="bg-[#EEFFEB] rounded-full w-24 h-24 flex items-center justify-center mb-4 md:mb-0">
              <Image
                src="/images/subject/1.svg"
                alt="Habesha family"
                className="rounded-md z-20"
                height={40}
                width={40}
                priority
              />
            </div>
            <div>
              <div className="font-bold text-lg md:text-xl text-[#1a365d] mb-1">
                Science
              </div>
              <div className="text-[#4b5563] text-base">
                Biology, Chemistry, Physics
              </div>
            </div>
          </div>
          {/* English & ESL */}
          <div className="flex flex-col items-center md:items-start md:flex-row gap-6 md:gap-4">
            <div className="bg-[#EEFFEB] rounded-full w-24 h-24 flex items-center justify-center mb-4 md:mb-0">
              <Image
                src="/images/subject/3.svg"
                alt="Habesha family"
                className="rounded-md z-20"
                height={40}
                width={40}
                priority
              />
            </div>
            <div>
              <div className="font-bold text-lg md:text-xl text-[#1a365d] mb-1">
                English & ESL
              </div>
              <div className="text-[#4b5563] text-base">
                Literature & Language
              </div>
            </div>
          </div>
        </div>
        {/* Bottom row: 2 subjects */}
        <div className="flex flex-col md:flex-row justify-around items-center gap-12 w-full">
          {/* History & Social Studies */}
          <div className="flex flex-col items-center md:items-start md:flex-row gap-6 md:gap-4">
            <div className="bg-[#EEFFEB] rounded-full w-24 h-24 flex items-center justify-center mb-4 md:mb-0">
              <Image
                src="/images/subject/4.svg"
                alt="Habesha family"
                className="rounded-md z-20"
                height={40}
                width={40}
                priority
              />
            </div>
            <div>
              <div className="font-bold text-lg md:text-xl text-[#1a365d] mb-1">
                History & Social Studies
              </div>
              <div className="text-[#4b5563] text-base">World & US History</div>
            </div>
          </div>
          {/* Computer & Tech Basics */}
          <div className="flex flex-col items-center md:items-start md:flex-row gap-6 md:gap-4">
            <div className="bg-[#EEFFEB] rounded-full w-24 h-24 flex items-center justify-center mb-4 md:mb-0">
              <Image
                src="/images/subject/5.svg"
                alt="Habesha family"
                className="rounded-md z-20"
                height={40}
                width={40}
                priority
              />
            </div>
            <div>
              <div className="font-bold text-lg md:text-xl text-[#1a365d] mb-1">
                Computer & Tech Basics
              </div>
              <div className="text-[#4b5563] text-base">
                Programming & Digital Skills
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
