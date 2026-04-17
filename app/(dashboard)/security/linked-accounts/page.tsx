"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LinkedAccounts } from "@/components/security/linked-accounts";
import { staggerContainer, staggerItem } from "@/lib/animations";

export default function LinkedAccountsPage() {
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
            <h1 className="text-3xl font-bold tracking-tight">Linked Accounts</h1>
            <p className="text-muted-foreground">
              Manage your connected accounts for easy sign-in
            </p>
          </div>
        </motion.div>

        {/* Linked Accounts */}
        <motion.div variants={staggerItem}>
          <LinkedAccounts />
        </motion.div>
      </motion.div>
    </div>
  );
}
