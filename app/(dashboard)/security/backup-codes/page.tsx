"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BackupCodes } from "@/components/security/backup-codes";
import { staggerContainer, staggerItem } from "@/lib/animations";

export default function BackupCodesPage() {
  return (
    <div className="container max-w-3xl px-4 py-8">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={staggerItem} className="space-y-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/security">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Security
            </Link>
          </Button>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Backup Codes</h1>
            <p className="text-muted-foreground">
              Use backup codes to sign in if you lose access to your authenticator
            </p>
          </div>
        </motion.div>

        {/* Backup Codes */}
        <motion.div variants={staggerItem}>
          <BackupCodes />
        </motion.div>
      </motion.div>
    </div>
  );
}
