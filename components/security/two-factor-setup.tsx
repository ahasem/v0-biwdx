"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2, CheckCircle2, XCircle, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

import { OTPInput } from "@/components/auth/otp-input";
import { twoFactor, useSession } from "@/lib/auth-client";
import { staggerContainer, staggerItem } from "@/lib/animations";

export function TwoFactorSetup() {
  const { data: session, isPending } = useSession();
  const [loading, setLoading] = React.useState(false);
  const [setupStep, setSetupStep] = React.useState<"idle" | "qr" | "verify" | "backup">("idle");
  const [qrCodeUrl, setQrCodeUrl] = React.useState("");
  const [totpUri, setTotpUri] = React.useState("");
  const [verificationCode, setVerificationCode] = React.useState("");
  const [backupCodes, setBackupCodes] = React.useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const is2FAEnabled = session?.user?.twoFactorEnabled;

  const handleEnable2FA = async () => {
    setLoading(true);
    try {
      const result = await twoFactor.enable();

      if (result?.error) {
        toast.error(result.error.message || "Failed to initialize 2FA");
        return;
      }

      if (result?.data?.totpURI) {
        setTotpUri(result.data.totpURI);
        const qr = await QRCode.toDataURL(result.data.totpURI);
        setQrCodeUrl(qr);
        setSetupStep("qr");
      }
    } catch (error) {
      toast.error("Failed to initialize 2FA setup");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const result = await twoFactor.verifyTotp({
        code: verificationCode,
      });

      if (result?.error) {
        toast.error(result.error.message || "Invalid code");
      } else {
        // Get backup codes
        const backupResult = await twoFactor.generateBackupCodes();
        if (backupResult?.data?.codes) {
          setBackupCodes(backupResult.data.codes);
          setSetupStep("backup");
        } else {
          toast.success("Two-factor authentication enabled!");
          setDialogOpen(false);
          resetSetup();
        }
      }
    } catch (error) {
      toast.error("Failed to verify code");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setLoading(true);
    try {
      const result = await twoFactor.disable();

      if (result?.error) {
        toast.error(result.error.message || "Failed to disable 2FA");
      } else {
        toast.success("Two-factor authentication disabled");
      }
    } catch (error) {
      toast.error("Failed to disable 2FA");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetSetup = () => {
    setSetupStep("idle");
    setQrCodeUrl("");
    setTotpUri("");
    setVerificationCode("");
    setBackupCodes([]);
  };

  const copySecret = () => {
    const secret = totpUri.match(/secret=([^&]+)/)?.[1];
    if (secret) {
      navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Secret copied to clipboard");
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    toast.success("Backup codes copied to clipboard");
  };

  if (isPending) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </div>
              <Badge variant={is2FAEnabled ? "default" : "secondary"}>
                {is2FAEnabled ? (
                  <>
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Enabled
                  </>
                ) : (
                  <>
                    <XCircle className="mr-1 h-3 w-3" /> Disabled
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {is2FAEnabled
                  ? "Your account is protected with two-factor authentication."
                  : "Protect your account with a TOTP authenticator app."}
              </p>
              {is2FAEnabled ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Disable 2FA
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Disable Two-Factor Authentication</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove the extra security from your account. Are you sure
                        you want to continue?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDisable2FA}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Disable
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Dialog open={dialogOpen} onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) resetSetup();
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Enable 2FA
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {setupStep === "idle" && "Enable Two-Factor Authentication"}
                        {setupStep === "qr" && "Scan QR Code"}
                        {setupStep === "verify" && "Verify Setup"}
                        {setupStep === "backup" && "Save Backup Codes"}
                      </DialogTitle>
                      <DialogDescription>
                        {setupStep === "idle" &&
                          "Use an authenticator app to generate verification codes."}
                        {setupStep === "qr" &&
                          "Scan this QR code with your authenticator app."}
                        {setupStep === "verify" &&
                          "Enter the code from your authenticator app."}
                        {setupStep === "backup" &&
                          "Save these codes in a safe place. You can use them if you lose access to your authenticator."}
                      </DialogDescription>
                    </DialogHeader>

                    {setupStep === "idle" && (
                      <div className="space-y-4 py-4">
                        <div className="flex items-center gap-4 rounded-lg border p-4">
                          <ShieldCheck className="h-8 w-8 text-primary" />
                          <div>
                            <p className="font-medium">Authenticator App</p>
                            <p className="text-sm text-muted-foreground">
                              Use apps like Google Authenticator, Authy, or 1Password
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {setupStep === "qr" && (
                      <div className="space-y-4 py-4">
                        <div className="flex justify-center">
                          {qrCodeUrl && (
                            <img
                              src={qrCodeUrl}
                              alt="2FA QR Code"
                              className="rounded-lg border"
                              width={200}
                              height={200}
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 rounded bg-muted px-2 py-1 text-xs">
                            {totpUri.match(/secret=([^&]+)/)?.[1]?.substring(0, 20)}...
                          </code>
                          <Button variant="outline" size="icon" onClick={copySecret}>
                            {copied ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-center text-xs text-muted-foreground">
                          Can&apos;t scan? Enter the secret key manually.
                        </p>
                      </div>
                    )}

                    {setupStep === "verify" && (
                      <div className="space-y-4 py-4">
                        <OTPInput
                          value={verificationCode}
                          onChange={setVerificationCode}
                          disabled={loading}
                        />
                      </div>
                    )}

                    {setupStep === "backup" && (
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/50 p-4">
                          {backupCodes.map((code, index) => (
                            <code key={index} className="font-mono text-sm">
                              {code}
                            </code>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={copyBackupCodes}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy All Codes
                        </Button>
                        <p className="text-center text-xs text-muted-foreground">
                          Each code can only be used once. Store them securely.
                        </p>
                      </div>
                    )}

                    <DialogFooter>
                      {setupStep === "idle" && (
                        <Button onClick={handleEnable2FA} disabled={loading}>
                          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Continue
                        </Button>
                      )}
                      {setupStep === "qr" && (
                        <Button onClick={() => setSetupStep("verify")}>
                          I&apos;ve scanned the code
                        </Button>
                      )}
                      {setupStep === "verify" && (
                        <Button
                          onClick={handleVerify2FA}
                          disabled={loading || verificationCode.length !== 6}
                        >
                          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Verify & Enable
                        </Button>
                      )}
                      {setupStep === "backup" && (
                        <Button
                          onClick={() => {
                            setDialogOpen(false);
                            resetSetup();
                            toast.success("Two-factor authentication enabled!");
                          }}
                        >
                          I&apos;ve saved my codes
                        </Button>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
