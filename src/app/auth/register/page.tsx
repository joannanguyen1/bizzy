"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { CheckIcon, XIcon, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const { isGoogleLoading, signUpWithGoogle } = useGoogleAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<RegisterForm>({
    resolver: zodResolver(RegisterSchema),
  });

  const router = useRouter();
  const watchedUsername = useWatch({ control, name: "username" });

  useEffect(() => {
    const checkUsernameAvailability = async (username: string) => {
      if (!username || username.length < 3) {
        setUsernameAvailable(null);
        return;
      }

      const usernameRegex = /^[a-zA-Z0-9]+$/;
      if (!usernameRegex.test(username)) {
        setUsernameAvailable(null);
        return;
      }

      setCheckingUsername(true);
      try {
        const response = await fetch(`/api/profile/check-username?username=${encodeURIComponent(username.toLowerCase())}`);
        const data = await response.json();
        setUsernameAvailable(data.available);
      } catch (error) {
        console.error("Error checking username:", error);
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (watchedUsername) {
        checkUsernameAvailability(watchedUsername);
      } else {
        setUsernameAvailable(null);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [watchedUsername]);

  const onSubmit = async (data: RegisterForm) => {
    if (usernameAvailable === false) {
      toast.error("Username is already taken");
      return;
    }

    if (usernameAvailable === null) {
      toast.error("Please wait for username validation");
      return;
    }

    setIsLoading(true);

    try {
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
            <div className="min-h-3">
              <AnimatePresence mode="wait">
                {checkingUsername && (
                  <motion.p
                    key="checking"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    className="flex items-center gap-2 text-xs text-zinc-500"
                  >
                    <Loader2 className="size-3 animate-spin" />
                    Checking availability...
                  </motion.p>
                )}
                {!checkingUsername && usernameAvailable === true && watchedUsername && watchedUsername.length >= 3 && (
                  <motion.p
                    key="available"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    className="flex items-center gap-2 text-xs text-green-600"
                  >
                    <CheckIcon className="size-3" />
                    Username is available
                  </motion.p>
                )}
                {!checkingUsername && usernameAvailable === false && (
                  <motion.p
                    key="taken"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    className="flex items-center gap-2 text-xs text-red-600"
                  >
                    <XIcon className="size-3" />
                    Username is already taken
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
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
            placeholder="Enter a unique password"
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
