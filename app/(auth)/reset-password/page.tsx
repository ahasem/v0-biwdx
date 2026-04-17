"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, KeyRound, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { OTPInput } from "@/components/auth/otp-input";
import { authClient } from "@/lib/auth-client";
import { cardVariants, staggerContainer, staggerItem } from "@/lib/animations";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [loading, setLoading] = React.useState(false);
  const [otpValue, setOtpValue] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [resetComplete, setResetComplete] = React.useState(false);

  const passwordRequirements = [
    { label: "At least 8 characters", met: newPassword.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(newPassword) },
    { label: "One lowercase letter", met: /[a-z]/.test(newPassword) },
    { label: "One number", met: /[0-9]/.test(newPassword) },
  ];

  const allRequirementsMet = passwordRequirements.every((req) => req.met);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleResetPassword = async () => {
    if (otpValue.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    if (!allRequirementsMet) {
      toast.error("Password does not meet requirements");
      return;
    }

    if (!passwordsMatch) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const result = await authClient.resetPassword({
        newPassword,
        token: otpValue, // OTP is used as token for password reset
      });

      if (result?.error) {
        toast.error(result.error.message || "Failed to reset password");
      } else {
        setResetComplete(true);
        toast.success("Password reset successfully!");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (error) {
      toast.error("Failed to reset password");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (resetComplete) {
    return (
      <motion.div variants={cardVariants} initial="hidden" animate="visible">
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10"
            >
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </motion.div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Password Reset!
            </CardTitle>
            <CardDescription>
              Your password has been successfully reset.
              <br />
              Redirecting you to sign in...
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible">
      <Card className="border-0 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
          >
            <KeyRound className="h-8 w-8 text-primary" />
          </motion.div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Reset your password
          </CardTitle>
          <CardDescription>
            Enter the code sent to
            <br />
            <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <motion.div variants={staggerItem}>
              <Label className="mb-2 block text-sm font-medium">
                Verification Code
              </Label>
              <OTPInput
                value={otpValue}
                onChange={setOtpValue}
                disabled={loading}
              />
            </motion.div>

            <motion.div variants={staggerItem}>
              <Label htmlFor="newPassword" className="mb-2 block text-sm font-medium">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </motion.div>

            {newPassword && (
              <motion.div
                variants={staggerItem}
                className="space-y-2 rounded-lg bg-muted/50 p-3"
              >
                <p className="text-xs font-medium text-muted-foreground">
                  Password requirements:
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {passwordRequirements.map((req, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-1.5 text-xs ${
                        req.met ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      <div
                        className={`h-1.5 w-1.5 rounded-full ${
                          req.met ? "bg-primary" : "bg-muted-foreground/50"
                        }`}
                      />
                      {req.label}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div variants={staggerItem}>
              <Label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              {confirmPassword && !passwordsMatch && (
                <p className="mt-1 text-xs text-destructive">
                  Passwords do not match
                </p>
              )}
            </motion.div>

            <motion.div variants={staggerItem}>
              <Button
                className="w-full"
                onClick={handleResetPassword}
                disabled={
                  loading ||
                  otpValue.length !== 6 ||
                  !allRequirementsMet ||
                  !passwordsMatch
                }
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset Password
              </Button>
            </motion.div>
          </motion.div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
