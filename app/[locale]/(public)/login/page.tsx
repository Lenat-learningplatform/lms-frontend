import { Link } from "@/i18n/routing";
import LoginForm from "@/components/partials/auth/login-form";
import Image from "next/image";
import Social from "@/components/partials/auth/social";
import Copyright from "@/components/partials/auth/copyright";
import Logo from "@/components/partials/auth/logo";

export default async function Login({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Use the locale provided in the dynamic route parameters
  const { locale } = await params;

  return (
    <>
      <div className="flex w-full items-center overflow-hidden min-h-dvh h-dvh basis-full">
        <div className="overflow-y-auto flex flex-wrap w-full ">
          <div className="lg:block hidden flex-1 overflow-hidden text-[40px] leading-[48px] text-default-600 relative z-[1] bg-default-50">
            <Image
              src="/images/signin.jpg"
              alt=""
              width={300}
              height={300}
              className=" w-full h-screen object-cover"
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
                    Welcome back
                  </h4>
                  <div className="text-[#374151] text-base">
                    Empowering Habesha Students through Education and Culture
                  </div>
                </div>
                <LoginForm />
                <div className="md:max-w-[345px] mx-auto font-normal text-default-500 mt-12 uppercase text-sm">
                  Don’t have an account?{" "}
                  <Link
                    href="/register"
                    className="font-medium hover:underline text-[#0870C5] hover:text-[#0870C5] transition"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
              <div className="text-xs font-normal text-default-500 z-[999] pb-10 text-center">
                {/* <Copyright /> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
