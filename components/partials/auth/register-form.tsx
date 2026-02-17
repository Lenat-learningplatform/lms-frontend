"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  studentId?: string;
  major?: string;
  year?: string;
  learningStyle?: string;
  consent: boolean;
};

const RegisterForm = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    consent: false,
  });

  const registerMutation = useMutation({
    mutationFn: (data: FormData) => api.post("/register", data),
    onSuccess: () => {
      toast.success("Registration successful");
      router.push("/auth/login");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Registration failed");
    },
  });

  const handleNext = () => setStep((s) => Math.min(s + 1, 4));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = () => {
    registerMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between text-sm font-medium text-gray-600">
        <span className={step === 1 ? "text-brand-dark" : ""}>
          1 Basic Info
        </span>
        <span className={step === 2 ? "text-brand-dark" : ""}>2 Academic</span>
        <span className={step === 3 ? "text-brand-dark" : ""}>
          3 Preferences
        </span>
        <span className={step === 4 ? "text-brand-dark" : ""}>4 Consent</span>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="studentId">Student ID</Label>
            <Input
              id="studentId"
              name="studentId"
              value={formData.studentId || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="major">Major</Label>
            <Input
              id="major"
              name="major"
              value={formData.major || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              name="year"
              value={formData.year || ""}
              onChange={handleChange}
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <Label htmlFor="learningStyle">Preferred Learning Style</Label>
          <Input
            id="learningStyle"
            name="learningStyle"
            value={formData.learningStyle || ""}
            onChange={handleChange}
          />
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <div>
            <Label>
              <input
                type="checkbox"
                name="consent"
                checked={formData.consent}
                onChange={handleChange}
                className="mr-2"
              />
              I agree to the Terms and Conditions
            </Label>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        {step > 1 && (
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
        )}
        {step < 4 && <Button onClick={handleNext}>Next</Button>}
        {step === 4 && (
          <Button
            disabled={registerMutation.isPending || !formData.consent}
            onClick={handleSubmit}
          >
            {registerMutation.isPending ? "Submitting..." : "Submit"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default RegisterForm;
