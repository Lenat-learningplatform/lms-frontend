import { Link } from "@/i18n/routing";
import LoginForm from "@/components/partials/auth/login-form";
import Image from "next/image";
import Social from "@/components/partials/auth/social";
import Copyright from "@/components/partials/auth/copyright";
import Logo from "@/components/partials/auth/logo";
import HeroImage from "/public/images/hero-student.png";
import HeroSection from "@/components/HeroSection";
import StepByStepSection from "@/components/StepByStepSection";
import FeatureWheelSection from "@/components/FeatureWheelSection";
import TrustSection from "@/components/TrustSection";
import SubjectsSection from "@/components/SubjectsSection";
import CTASection from "@/components/CTASection";

export default async function Login({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Use the locale provided in the dynamic route parameters
  const { locale } = await params;

  return (
    <>
      <HeroSection />
      <StepByStepSection />
      <FeatureWheelSection />
      <TrustSection />
      <SubjectsSection />
      <CTASection />
    </>
  );
}
