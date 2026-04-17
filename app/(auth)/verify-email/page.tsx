"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { OTPInput } from "@/components/auth/otp-input";
import { emailOtp } from "@/lib/auth-client";
import { cardVariants, staggerContainer, staggerItem } from "@/lib/animations";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [loading, setLoading] = React.useState(false);
  const [otpValue, setOtpValue] = React.useState("");
  const [verified, setVerified] = React.useState(false);

  const handleVerify = async () => {
    if (otpValue.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const result = await emailOtp.verifyEmail({
        email,
        otp: otpValue,
      });

      if (result?.error) {
        toast.error(result.error.message || "Invalid OTP");
      } else {
        setVerified(true);
        toast.success("Email verified successfully!");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (error) {
      toast.error("Failed to verify email");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });
      toast.success("Verification code resent! Check your console.");
    } catch (error) {
      toast.error("Failed to resend code");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
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
              Email Verified!
            </CardTitle>
            <CardDescription>
              Your email has been successfully verified.
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
            <Mail className="h-8 w-8 text-primary" />
          </motion.div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Verify your email
          </CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to
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
              <OTPInput
                value={otpValue}
                onChange={setOtpValue}
                disabled={loading}
              />
            </motion.div>

            <motion.div variants={staggerItem}>
              <Button
                className="w-full"
                onClick={handleVerify}
                disabled={loading || otpValue.length !== 6}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify Email
              </Button>
            </motion.div>
          </motion.div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Didn&apos;t receive the code?{" "}
            <Button
              variant="link"
              className="h-auto p-0 text-primary"
              onClick={handleResend}
              disabled={loading}
            >
              Resend
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
