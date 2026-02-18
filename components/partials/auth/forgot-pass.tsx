"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormInputs = z.infer<typeof schema>;

const ForgotPass = () => {
  const [isPending, startTransition] = React.useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: zodResolver(schema),
    mode: "all",
    defaultValues: { email: "" },
  });

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    startTransition(async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_LARAVEL_API_URL;
        await axios.post(`${baseUrl}/reset-password`, { email: data.email });

        toast.success(
          "If an account exists with this email, you will receive a password reset link."
        );
      } catch (err: unknown) {
        const message =
          axios.isAxiosError(err) && err.response?.data?.message
            ? String(err.response.data.message)
            : "Something went wrong. Please try again.";
        toast.error(message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="font-medium text-default-600">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          size="lg"
          disabled={isPending}
          placeholder="you@example.com"
          {...register("email")}
          className="text-sm text-default-900"
        />
        {errors.email && (
          <p className="text-destructive mt-2 text-sm">{errors.email.message}</p>
        )}
      </div>

      <Button
        type="submit"
        fullWidth
        disabled={isPending}
        className="bg-[#0870C5]"
      >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? "Sending..." : "Send recovery email"}
      </Button>
    </form>
  );
};

export default ForgotPass;
