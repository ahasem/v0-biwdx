"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck, Key } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

import { OTPInput } from "./otp-input";
import { twoFactor } from "@/lib/auth-client";
import { cardVariants, staggerContainer, staggerItem } from "@/lib/animations";

export function TwoFactorForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [loading, setLoading] = React.useState(false);
  const [totpCode, setTotpCode] = React.useState("");
  const [backupCode, setBackupCode] = React.useState("");

  const handleTOTPVerify = async () => {
    if (totpCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const result = await twoFactor.verifyTotp({
        code: totpCode,
      });

      if (result?.error) {
        toast.error(result.error.message || "Invalid code");
      } else {
        toast.success("Verification successful!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to verify code");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackupCodeVerify = async () => {
    if (backupCode.length !== 8) {
      toast.error("Please enter a valid 8-character backup code");
      return;
    }

    setLoading(true);
    try {
      const result = await twoFactor.verifyBackupCode({
        code: backupCode,
      });

      if (result?.error) {
        toast.error(result.error.message || "Invalid backup code");
      } else {
        toast.success("Verification successful!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to verify backup code");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
            <ShieldCheck className="h-8 w-8 text-primary" />
          </motion.div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Enter your authentication code to continue
            {email && (
              <>
                <br />
                <span className="font-medium text-foreground">{email}</span>
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <Tabs defaultValue="totp" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="totp">
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Authenticator
                </TabsTrigger>
                <TabsTrigger value="backup">
                  <Key className="mr-2 h-4 w-4" />
                  Backup Code
                </TabsTrigger>
              </TabsList>

              {/* TOTP Authentication */}
              <TabsContent value="totp" className="mt-4 space-y-4">
                <motion.div variants={staggerItem} className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </motion.div>

                <motion.div variants={staggerItem}>
                  <OTPInput
                    value={totpCode}
                    onChange={setTotpCode}
                    disabled={loading}
                  />
                </motion.div>

                <motion.div variants={staggerItem}>
                  <Button
                    className="w-full"
                    onClick={handleTOTPVerify}
                    disabled={loading || totpCode.length !== 6}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify
                  </Button>
                </motion.div>
              </TabsContent>

              {/* Backup Code */}
              <TabsContent value="backup" className="mt-4 space-y-4">
                <motion.div variants={staggerItem} className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Enter one of your 8-character backup codes
                  </p>
                </motion.div>

                <motion.div variants={staggerItem}>
                  <Label htmlFor="backup-code" className="sr-only">
                    Backup Code
                  </Label>
                  <Input
                    id="backup-code"
                    type="text"
                    placeholder="XXXXXXXX"
                    value={backupCode}
                    onChange={(e) =>
                      setBackupCode(e.target.value.toUpperCase().slice(0, 8))
                    }
                    className="text-center font-mono text-lg tracking-widest"
                    disabled={loading}
                  />
                </motion.div>

                <motion.div variants={staggerItem}>
                  <Button
                    className="w-full"
                    onClick={handleBackupCodeVerify}
                    disabled={loading || backupCode.length !== 8}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify Backup Code
                  </Button>
                </motion.div>

                <motion.div variants={staggerItem}>
                  <p className="text-center text-xs text-muted-foreground">
                    Note: Each backup code can only be used once
                  </p>
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Having trouble?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Try a different method
            </Link>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
