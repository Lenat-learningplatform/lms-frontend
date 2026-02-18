"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/routing";
import { Icon } from "@/components/ui/icon";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth";
import { useSession } from "next-auth/react";
import { hasPermission } from "@/lib/hasPermission";

// Define the schema for validation
const schema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters",
  }),
  password: z
    .string()
    .min(4, { message: "Password must be at least 4 characters." }),
});

type FormInputs = z.infer<typeof schema>;

const LoginForm = () => {
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();
  const [passwordType, setPasswordType] = React.useState("password");
  const { data: session, status } = useSession(); // Get session and status

  const togglePasswordType = () => {
    setPasswordType((prevType) =>
      prevType === "password" ? "text" : "password"
    );
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: zodResolver(schema),
    mode: "all",
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    startTransition(async () => {
      try {
        const response = await signIn("credentials", {
          username: data.username,
          password: data.password,
          redirect: false,
        });

        if (!response || response.error) {
          toast.error(
            response?.error || "Invalid credentials. Please try again."
          );
        } else {
          toast.success("Successfully logged in");
          // Do not redirect here; let useEffect handle it
        }
      } catch (err: any) {
        console.log({ err, data });
        toast.error(err.message || "Login failed. Please try again.");
      }
    });
  };

  // Redirect based on roles when session is updated
  useEffect(() => {
    if (status === "authenticated" && session?.user.roles) {
      const roles = session.user.roles;
      if (hasPermission(roles, "read_my_enrolled_module")) {
        router.push("/my-courses/courses");
      } else if (hasPermission(roles, "read_teacher")) {
        router.push("/all-courses");
      } else if (hasPermission(roles, "read_my_module")) {
        router.push("/tch/course");
      } else if (hasPermission(roles, "read_permission")) {
        router.push("/roles");
      } else {
        router.push("/getting-started");
      }
    }
  }, [status, session, router]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-5 2xl:mt-7 space-y-4">
      {/* Username Input */}
      <div className="space-y-2">
        <Label htmlFor="username" className="font-medium text-default-600">
          Email / Username
        </Label>
        <Input
          size="lg"
          disabled={isPending}
          {...register("username")}
          type="text"
          id="username"
          className={cn("", {
            "border-destructive": errors.username,
          })}
        />
        {errors.username && (
          <p className="text-destructive mt-2 text-sm">
            {errors.username.message}
          </p>
        )}
      </div>

      {/* Password Input */}
      <div className="mt-3.5 space-y-2">
        <Label htmlFor="password" className="mb-2 font-medium text-default-600">
          Password
        </Label>
        <div className="relative">
          <Input
            size="lg"
            disabled={isPending}
            {...register("password")}
            type={passwordType}
            id="password"
            className="peer"
            placeholder=" "
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 right-4 cursor-pointer"
            onClick={togglePasswordType}
          >
            {passwordType === "password" ? (
              <Icon icon="heroicons:eye" className="w-5 h-5 text-default-400" />
            ) : (
              <Icon
                icon="heroicons:eye-slash"
                className="w-5 h-5 text-default-400"
              />
            )}
          </div>
        </div>
        {errors.password && (
          <p className="text-destructive mt-2 text-sm">
            {errors.password.message}
          </p>
        )}
        <div className="mt-2 text-right">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-[#0870C5] hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="bg-[#0870C5]"
        fullWidth
        disabled={isPending}
      >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? "Loading..." : "Log in"}
      </Button>
    </form>
  );
};

export default LoginForm;
