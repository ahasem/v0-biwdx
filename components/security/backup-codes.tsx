"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Key, Loader2, Copy, RefreshCw, Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

import { twoFactor, useSession } from "@/lib/auth-client";
import { staggerContainer, staggerItem } from "@/lib/animations";

export function BackupCodes() {
  const { data: session } = useSession();
  const [loading, setLoading] = React.useState(false);
  const [backupCodes, setBackupCodes] = React.useState<string[]>([]);
  const [showCodes, setShowCodes] = React.useState(false);

  const is2FAEnabled = session?.user?.twoFactorEnabled;

  const handleViewCodes = async () => {
    setLoading(true);
    try {
      // Note: In production, you would need to verify the user's identity
      // before showing backup codes (e.g., by requiring password or 2FA code)
      const result = await twoFactor.generateBackupCodes();
      if (result?.data?.codes) {
        setBackupCodes(result.data.codes);
        setShowCodes(true);
      } else if (result?.error) {
        toast.error(result.error.message || "Failed to generate backup codes");
      }
    } catch (error) {
      toast.error("Failed to generate backup codes");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateCodes = async () => {
    setLoading(true);
    try {
      const result = await twoFactor.generateBackupCodes();
      if (result?.data?.codes) {
        setBackupCodes(result.data.codes);
        toast.success("New backup codes generated!");
      } else if (result?.error) {
        toast.error(result.error.message || "Failed to regenerate backup codes");
      }
    } catch (error) {
      toast.error("Failed to regenerate backup codes");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    toast.success("Backup codes copied to clipboard");
  };

  const downloadCodes = () => {
    const content = `Hasem Backup Codes
Generated: ${new Date().toISOString()}

${backupCodes.join("\n")}

Keep these codes safe. Each code can only be used once.`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hasem-backup-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Backup codes downloaded");
  };

  if (!is2FAEnabled) {
    return (
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Backup Codes</CardTitle>
              <CardDescription>
                Backup codes are only available when two-factor authentication is enabled
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Key className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Enable two-factor authentication to generate backup codes
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Backup Codes</CardTitle>
            <CardDescription>
              Use these codes to sign in if you lose access to your authenticator
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showCodes ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Backup codes can be used to sign in to your account if you lose access
                  to your authenticator app. Each code can only be used once.
                </p>
                <Button onClick={handleViewCodes} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  View Backup Codes
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/50 p-4">
                  {backupCodes.map((code, index) => (
                    <code key={index} className="font-mono text-sm">
                      {code}
                    </code>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadCodes}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Regenerate
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Regenerate Backup Codes</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will invalidate all existing backup codes. Make sure to
                          save the new codes in a safe place. Continue?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRegenerateCodes}>
                          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Regenerate
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <p className="text-xs text-muted-foreground">
                  Store these codes in a safe place. Each code can only be used once.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
