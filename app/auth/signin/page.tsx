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
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import GoogleIcon from "@/components/GoogleIcon";

const SignInSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInForm = z.infer<typeof SignInSchema>;

const SignInPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isGoogleLoading, signInWithGoogle } = useGoogleAuth();
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

          <div className="flex items-center justify-between text-xs text-zinc-600">
            <label htmlFor="remember" className="flex cursor-pointer items-center gap-2">
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
              onClick={signInWithGoogle}
              disabled={isLoading || isGoogleLoading}
            >
              <GoogleIcon className="h-4 w-4" />
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