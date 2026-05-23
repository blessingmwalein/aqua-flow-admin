"use client";

// Static metadata is not possible in client components for Next.js 16
// Title is handled by root layout template

// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { useForm, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Droplets, Mail, AlertCircle } from "lucide-react";
import { loginSchema, type LoginFormValues } from "@/schemas/auth";
import { useAuth } from "@/hooks";
import { CustomInput } from "@/components/forms/CustomInput";
import { CustomPasswordInput } from "@/components/forms/CustomPasswordInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const { login, isLoading } = useAuth();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema) as Resolver<LoginFormValues>,
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const rememberMe = watch("rememberMe");

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data);
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message.includes('Network Error')
            ? 'Cannot reach the server. Check your connection and try again.'
            : err.message.includes('timeout')
            ? 'Request timed out. The server may be unavailable.'
            : err.message
          : 'Login failed. Please try again.';
      setError('root', { message });
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-blue-100/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600" />

        <div className="px-8 pt-8 pb-6">
          {/* Logo + branding */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 ring-1 ring-blue-100 dark:ring-blue-900/50">
              <Droplets className="w-7 h-7 text-blue-500" strokeWidth={2} />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                AquaFlow
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Admin Dashboard
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Global form error */}
            {(errors as Record<string, { message?: string }>).root?.message && (
              <div className="flex items-start gap-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 px-3.5 py-3 text-sm text-red-700 dark:text-red-400">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{(errors as Record<string, { message?: string }>).root?.message}</span>
              </div>
            )}

            {/* Email */}
            <CustomInput<LoginFormValues>
              name="email"
              control={control}
              label="Email address"
              placeholder="admin@aquaflow.com"
              type="email"
              icon={Mail}
              disabled={isLoading}
            />

            {/* Password */}
            <CustomPasswordInput<LoginFormValues>
              name="password"
              control={control}
              label="Password"
              placeholder="Enter your password"
              disabled={isLoading}
            />

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between pt-0.5">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="rememberMe"
                  checked={!!rememberMe}
                  onCheckedChange={(checked) =>
                    setValue("rememberMe", checked === true, {
                      shouldValidate: true,
                    })
                  }
                  disabled={isLoading}
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-sm font-normal text-gray-600 dark:text-gray-400 cursor-pointer select-none"
                >
                  Remember me
                </Label>
              </div>
              <button
                type="button"
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline underline-offset-4 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              isLoading={isLoading}
              disabled={isLoading}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold rounded-lg h-10 text-sm transition-all duration-200 shadow-sm shadow-blue-200 dark:shadow-blue-900/30"
            >
              {isLoading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
          <p className="text-center text-xs text-gray-500 dark:text-gray-500">
            Need help?{" "}
            <a
              href="mailto:support@aquaflow.com"
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline underline-offset-4"
            >
              Contact support
            </a>
          </p>
        </div>
      </div>

      {/* Below-card hint */}
      <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-600">
        AquaFlow &copy; {new Date().getFullYear()} &mdash; Secure admin access only
      </p>
    </div>
  );
}
