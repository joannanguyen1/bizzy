"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import FormInput from "@/components/FormInput";
import { Button } from "@/components/ui/button";
import BizzyLogo from "@/components/logo";
import { authClient } from "@/lib/auth-client";

const SignInSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInForm = z.infer<typeof SignInSchema>;

const SignInPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(SignInSchema),
  });
  const router = useRouter();

  const onSubmit = async (data: SignInForm) => {
    setIsLoading(true);

    try {
      await authClient.signIn.email({
        ...data,
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
          onSuccess: async () => {
            router.replace("/");
          },
        },
      });
    } catch (error) {
      console.error("An error occurred during sign-in:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        fetchOptions: {
          onError: (ctx) => {
            toast.error(ctx.error.message);
          },
          onSuccess: async () => {
            router.replace("/");
          },
        },
      });
    } catch (error) {
      console.error("An error occurred during Google sign-in:", error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
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
            Log in to your account
          </h1>
          <p className="text-sm text-zinc-500">
            Welcome back! Please enter your details.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <FormInput
            label="Email"
            name="email"
            type="email"
            register={register}
            errors={errors}
          />
          <FormInput
            label="Password"
            name="password"
            type="password"
            register={register}
            errors={errors}
          />

          <div className="flex items-center justify-between text-xs text-zinc-600">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 rounded border border-zinc-300"
              />
              <span>Remember for 30 days</span>
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-amber-600 hover:underline"
            >
              Forgot password
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-amber-500 text-white hover:bg-amber-600"
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </div>

        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            className="flex w-full items-center justify-center gap-2 bg-white"
            onClick={handleGoogleSignIn}
            disabled={isLoading || isGoogleLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="0.98em"
              height="1em"
              viewBox="0 0 256 262"
            >
              <path
                fill="#4285f4"
                d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
              />
              <path
                fill="#34a853"
                d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
              />
              <path
                fill="#fbbc05"
                d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
              />
              <path
                fill="#eb4335"
                d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
              />
            </svg>
            <span>
              {isGoogleLoading ? "Redirecting..." : "Sign in with Google"}
            </span>
          </Button>
        </div>

        <div className="mt-6">
          <p className="text-center text-sm text-zinc-600">
            Don&apos;t have an account?
            <Button asChild variant="link" className="px-2 text-amber-600">
              <Link href="/auth/register">Sign up</Link>
            </Button>
          </p>
        </div>
      </form>
    </section>
  );
};

export default SignInPage;