"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import FormInput from "@/components/FormInput";
import { Button } from "@/components/ui/button";
import BizzyLogo from "@/components/logo";
import { authClient } from "@/lib/auth-client";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import GoogleIcon from "@/components/GoogleIcon";
import { OnboardingDialog } from "@/components/onboarding-dialog";

const RegisterSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be 20 characters or less")
    .regex(/^[a-zA-Z0-9]+$/, "Username can only contain letters and numbers")
    .transform((val) => val.toLowerCase()),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterForm = z.infer<typeof RegisterSchema>;

const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [newUserId, setNewUserId] = useState<string | null>(null);
  const { isGoogleLoading, signUpWithGoogle } = useGoogleAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(RegisterSchema),
  });

  const router = useRouter();

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);

    try {
      const checkResponse = await fetch(`/api/profile/check-username?username=${encodeURIComponent(data.username)}`);
      const checkData = await checkResponse.json();

      if (!checkData.available) {
        toast.error("Username is already taken");
        setIsLoading(false);
        return;
      }

      await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.username,
        username: data.username,
        fetchOptions: {
          onResponse: () => {
            setIsLoading(false);
          },
          onRequest: () => {
            setIsLoading(true);
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
          },
          onSuccess: async (ctx) => {
            const userId = ctx.data?.user?.id;
            if (userId) {
              setNewUserId(userId);
              setShowOnboarding(true);
            } else {
              router.replace("/");
            }
          },
        },
      });
    } catch (error) {
      console.error("An error occurred during registration:", error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    router.replace("/");
  };

  return (
    <>
      {newUserId && (
        <OnboardingDialog
          open={showOnboarding}
          userId={newUserId}
          onComplete={handleOnboardingComplete}
        />
      )}
      <section className="flex min-h-screen items-center justify-center bg-white px-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-md mx-auto p-8"
        >
        <div className="text-center">
          <Link href="/" aria-label="Go home" className="mx-auto block w-fit">
            <BizzyLogo width={54} height={54} />
          </Link>
          <h1 className="mb-1 mt-6 text-2xl font-semibold text-zinc-900">
            Create an account
          </h1>
          <p className="text-sm text-zinc-500">
            Welcome to Bizzy! Please enter your details.
          </p>
        </div>

        <div className="mt-8">
          <Button
            type="button"
            variant="outline"
            className="flex w-full items-center justify-center gap-2 bg-white"
            onClick={signUpWithGoogle}
            disabled={isLoading || isGoogleLoading}
          >
            <GoogleIcon className="h-4 w-4" />
            <span>
              {isGoogleLoading ? "Redirecting..." : "Sign up with Google"}
            </span>
          </Button>
        </div>

        <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs text-zinc-500">
          <hr className="border-dashed" />
          <span>OR</span>
          <hr className="border-dashed" />
        </div>

        <div className="space-y-4">
          <div>
            <FormInput
              label="Username"
              name="username"
              type="text"
              register={register}
              placeholder="janedoe"
              errors={errors}
            />
          </div>
          <FormInput
            label="Email"
            name="email"
            type="email"
            register={register}
            placeholder="janedoe@gmail.com"
            errors={errors}
          />
          <FormInput
            label="Password"
            name="password"
            type="password"
            register={register}
            placeholder="••••••••"
            errors={errors}
          />

          <Button
            type="submit"
            className="w-full bg-amber-500 text-white hover:bg-amber-600"
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading ? "Registering..." : "Sign up"}
          </Button>
        </div>

        <div className="mt-6">
          <p className="text-center text-sm text-zinc-600">
            Already have an account?
            <Button asChild variant="link" className="px-2 text-amber-600">
              <Link href="/auth/signin">Log in</Link>
            </Button>
          </p>
        </div>
      </form>
    </section>
    </>
  );
};

export default RegisterPage;
