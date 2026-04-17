import { Suspense } from "react";
import { Metadata } from "next";
import { TwoFactorForm } from "@/components/auth/two-factor-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Two-Factor Authentication",
  description: "Verify your identity with 2FA",
};

function TwoFactorFormFallback() {
  return (
    <div className="w-full max-w-md space-y-4">
      <Skeleton className="h-[400px] w-full rounded-lg" />
    </div>
  );
}

export default function TwoFactorPage() {
  return (
    <Suspense fallback={<TwoFactorFormFallback />}>
      <TwoFactorForm />
    </Suspense>
  );
}
