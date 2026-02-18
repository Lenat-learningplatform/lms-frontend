import { Link } from "@/i18n/routing";
import ForgotPass from "@/components/partials/auth/forgot-pass";
import Image from "next/image";
import Logo from "@/components/partials/auth/logo";

export default async function ForgotPassword() {
  return (
    <>
      <div className="flex w-full items-center overflow-hidden min-h-dvh h-dvh basis-full">
        <div className="overflow-y-auto flex flex-wrap w-full">
          <div className="lg:block hidden flex-1 overflow-hidden text-[40px] leading-[48px] text-default-600 relative z-[1] bg-default-50">
            <Image
              src="/images/signin.jpg"
              alt=""
              width={300}
              height={300}
              className="w-full h-screen object-cover"
            />
          </div>
          <div className="flex-1 relative">
            <div className="h-full flex flex-col dark:bg-default-100 bg-white">
              <div className="max-w-[524px] md:px-[42px] md:py-[44px] p-7 mx-auto w-full text-2xl text-default-900 mb-3 h-full flex flex-col justify-center">
                <div className="flex justify-center items-center text-center mb-6 lg:hidden">
                  <Link href="/">
                    <Logo />
                  </Link>
                </div>
                <div className="text-center 2xl:mb-10 mb-4">
                  <h4 className="font-bold text-lg md:text-[40px] text-[#0870C5] mb-5">
                    Forgot password
                  </h4>
                  <div className="text-[#374151] text-base">
                    Enter your email and we’ll send you a link to reset your
                    password.
                  </div>
                </div>
                <ForgotPass />
                <div className="md:max-w-[345px] mx-auto font-normal text-default-500 mt-8 uppercase text-sm">
                  <Link
                    href="/login"
                    className="font-medium hover:underline text-[#0870C5] transition"
                  >
                    ← Back to login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
