"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import Stepper from "@/components/Stepper";

const steps = [
  "Basic Information",
  "Academic Information",
  "Learning Preferences",
  "Consent & Submit",
];

// Zod schema for form
const registerSchema = z
  .object({
    studentFullName: z.string().min(1, "Student full name is required"),
    parentName: z.string().min(1, "Parent/Guardian name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    country: z.string().min(1, "Country of origin is required"),
    gradeLevel: z.string().min(1, "Current grade level is required"),
    schoolName: z.string().optional(),
    supportSubjects: z
      .array(
        z.enum([
          "Math",
          "Science",
          "English",
          "History/Social Studies",
          "Reading/Writing",
        ])
      )
      .min(1, "Select at least one subject area needing support"),
    learningGoals: z.string().min(1, "Learning needs & goals are required"),
    tutoringTime: z.enum(["Morning", "Afternoon", "Evening", "Weekend"], {
      required_error: "Preferred tutoring time is required",
    }),
    deviceAccess: z.boolean().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm your password"),
    consentTutoring: z.boolean().refine((val) => val, {
      message:
        "You must consent to your child receiving tutoring through Habesha Tutors.",
    }),
    consentTerms: z.boolean().refine((val) => val, {
      message: "You must agree to the Terms and Conditions and Privacy Policy.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type FormData = z.infer<typeof registerSchema>;

const subjectOptions = [
  "Math",
  "Science",
  "English",
  "History/Social Studies",
  "Reading/Writing",
] as const;

export default function RegisterPage() {
  const router = useRouter();
  const { locale } = useParams() as { locale: string };
  const [step, setStep] = useState(0);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      supportSubjects: [],
      deviceAccess: false,
      consentTutoring: false,
      consentTerms: false,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.post("/register", data),
    onSuccess: () => {
      toast.success("Registration successful");
      router.push(`/${locale}/login`);
    },
    onError: (error: any) =>
      toast.error(error.message || "Registration failed"),
  });

  // Fields per step for validation
  const fieldsPerStep: Array<Array<keyof FormData>> = [
    ["studentFullName", "parentName", "email", "phone", "country"],
    ["gradeLevel", "schoolName", "supportSubjects", "learningGoals"],
    ["tutoringTime", "deviceAccess", "password", "confirmPassword"],
    ["consentTutoring", "consentTerms"],
  ];

  const next = async () => {
    const valid = await trigger(fieldsPerStep[step]);
    if (valid && step < steps.length - 1) setStep(step + 1);
  };
  const back = () => step > 0 && setStep(step - 1);
  const onSubmit = (data: FormData) => mutation.mutate(data);

  const values = watch();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative overflow-hidden md:container p-2 md:p-6 md:pt-0 mb-24 md:mb-0">
      {/* Radial gradients on page edges */}
      <div className="pointer-events-none select-none">
        <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(8,112,197,0.15)_0%,transparent_70%)] z-0" />
        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(8,112,197,0.10)_0%,transparent_70%)] z-0" />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(8,112,197,0.10)_0%,transparent_70%)] z-0" />
        <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(8,112,197,0.15)_0%,transparent_70%)] z-0" />
      </div>
      <div className="max-w-xl w-full ">
        <Stepper steps={steps} currentStep={step} />
      </div>

      <div className="w-full max-w-[950px] bg-white border border-brand-border rounded-xl shadow-lg p-10">
        <form onSubmit={handleSubmit(onSubmit)} className="">
          {step === 0 && (
            <>
              <h2 className="text-[30px] font-bold text-center text-[#0870C5] ">
                Basic Information
              </h2>
              <p className="text-center text-gray-500 mb-8">
                Let&apos;s start with some basic information about the student
                and parent/guardian.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="studentFullName">Student Full Name *</Label>
                  <Input
                    id="studentFullName"
                    placeholder="Enter student's full name"
                    {...register("studentFullName")}
                  />
                  {errors.studentFullName && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.studentFullName.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="parentName">Parent/Guardian Name *</Label>
                  <Input
                    id="parentName"
                    placeholder="Enter parent/guardian's name"
                    {...register("parentName")}
                  />
                  {errors.parentName && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.parentName.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number (optional)"
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
                <div className="md:col-span-1">
                  <Label htmlFor="country">Country of Origin *</Label>
                  <select
                    id="country"
                    {...register("country")}
                    className="block w-full border rounded px-3 py-2 mt-1"
                  >
                    <option value="">Select country</option>
                    <option value="Ethiopia">Ethiopia</option>
                    <option value="Eritrea">Eritrea</option>
                    <option value="USA">USA</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.country && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.country.message}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <h2 className="text-[30px] font-bold text-center text-[#0870C5] ">
                Academic Information
              </h2>
              <p className="text-center text-gray-500 mb-8">
                Tell us about the student&apos;s academic background and needs.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="gradeLevel">Current Grade Level *</Label>
                  <Input
                    id="gradeLevel"
                    placeholder="e.g., 8th Grade, High School Junior"
                    {...register("gradeLevel")}
                  />
                  {errors.gradeLevel && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.gradeLevel.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="schoolName">School Name</Label>
                  <Input
                    id="schoolName"
                    placeholder="Enter school name (optional)"
                    {...register("schoolName")}
                  />
                  {errors.schoolName && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.schoolName.message}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <Label>Subject Areas Needing Support *</Label>
                  <Controller
                    control={control}
                    name="supportSubjects"
                    render={({ field }) => (
                      <div className="flex flex-wrap gap-6 mt-2">
                        {subjectOptions.map((subject) => (
                          <label
                            key={subject}
                            className="flex items-center gap-2 text-base"
                          >
                            <input
                              type="checkbox"
                              value={subject}
                              checked={field.value.includes(subject)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                const next = checked
                                  ? [...field.value, subject]
                                  : field.value.filter((v) => v !== subject);
                                field.onChange(next);
                              }}
                              className="accent-[#2563EB] w-5 h-5"
                            />
                            {subject}
                          </label>
                        ))}
                      </div>
                    )}
                  />
                  {errors.supportSubjects && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.supportSubjects.message as string}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="learningGoals">
                    Learning Needs & Goals *
                  </Label>
                  <textarea
                    id="learningGoals"
                    {...register("learningGoals")}
                    rows={3}
                    className="block w-full border rounded px-3 py-2 mt-1"
                    placeholder="What are the student's main learning challenges or goals? (e.g., catching up in school, learning English, preparing for college)"
                  />
                  {errors.learningGoals && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.learningGoals.message}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <h2 className="text-[30px] font-bold text-center text-[#0870C5] ">
                Learning Preferences
              </h2>
              <p className="text-center text-gray-500 mb-8">
                Help us understand how and when the student learns best.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label>Preferred Tutoring Time *</Label>
                  <div className="flex flex-wrap gap-8 justify-around mt-2">
                    {["Morning", "Afternoon", "Evening", "Weekend"].map(
                      (time) => (
                        <label
                          key={time}
                          className="flex items-center gap-2 text-base"
                        >
                          <input
                            type="radio"
                            value={time}
                            {...register("tutoringTime")}
                            className="accent-[#2563EB] w-5 h-5"
                          />
                          {time}
                        </label>
                      )
                    )}
                  </div>
                  {errors.tutoringTime && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.tutoringTime.message}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 mt-4 text-base">
                    <input
                      type="checkbox"
                      {...register("deviceAccess")}
                      className="accent-[#2563EB] w-5 h-5"
                    />
                    Student has access to a computer/tablet and reliable
                    internet
                  </label>
                </div>
                <div>
                  <Label htmlFor="password">Create Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <h2 className="text-[30px] font-bold text-center text-[#0870C5] ">
                Consent & Submit
              </h2>
              <p className="text-center text-gray-500 mb-8">
                Please review your information and provide consent to complete
                registration.
              </p>
              <div className="bg-[#f4faff] border rounded p-6 mb-6 max-w-[617px] mx-auto">
                <div className="font-semibold mb-2 text-center">
                  Registration Summary
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm font-bold">
                  <div className="text-gray-600">Student Name:</div>
                  <div>{values.studentFullName}</div>
                  <div className="text-gray-600">Parent/Guardian:</div>
                  <div>{values.parentName}</div>
                  <div className="text-gray-600">Email:</div>
                  <div>{values.email}</div>
                  <div className="text-gray-600">Country of Origin:</div>
                  <div>{values.country}</div>
                  <div className="text-gray-600">Grade Level:</div>
                  <div>{values.gradeLevel}</div>
                  <div className="text-gray-600">Subjects:</div>
                  <div>{values.supportSubjects?.join(", ")}</div>
                </div>
              </div>
              <div className="flex flex-col gap-4 mb-4">
                <label className="flex items-start gap-2 text-base">
                  <input
                    type="checkbox"
                    id="consentTutoring"
                    {...register("consentTutoring")}
                    className="accent-[#2563EB] w-5 h-5 mt-1"
                  />
                  <span>
                    I consent to my child receiving tutoring through Habesha
                    Tutors and understand that data shared will be used only for
                    educational purposes and tutor matching.
                  </span>
                </label>
                {errors.consentTutoring && (
                  <p className="text-destructive text-sm mb-2">
                    {errors.consentTutoring.message}
                  </p>
                )}
                <label className="flex items-start gap-2 text-base">
                  <input
                    type="checkbox"
                    id="consentTerms"
                    {...register("consentTerms")}
                    className="accent-[#2563EB] w-5 h-5 mt-1"
                  />
                  <span>
                    I agree to the{" "}
                    <a href="#" className="text-[#2563EB] underline">
                      Terms and Conditions and Privacy Policy
                    </a>
                    .
                  </span>
                </label>
                {errors.consentTerms && (
                  <p className="text-destructive text-sm mb-2">
                    {errors.consentTerms.message}
                  </p>
                )}
              </div>
            </>
          )}
          <div className="flex justify-between pt-4">
            {step > 0 && (
              <Button
                variant="outline"
                type="button"
                className="bg-[#0870C5] text-white"
                onClick={back}
              >
                Previous
              </Button>
            )}
            {step < steps.length - 1 && (
              <Button type="button" className="bg-[#0870C5]" onClick={next}>
                Next Step
              </Button>
            )}
            {step === steps.length - 1 && (
              <Button
                type="submit"
                className="bg-[#0870C5]"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registering..." : "Register My Student"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
