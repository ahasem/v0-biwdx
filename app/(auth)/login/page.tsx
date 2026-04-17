import { Suspense } from "react";
import { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your account",
};

function LoginFormFallback() {
  return (
    <div className="w-full max-w-md space-y-4">
      <Skeleton className="h-[600px] w-full rounded-lg" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginForm />
    </Suspense>
  );
}
