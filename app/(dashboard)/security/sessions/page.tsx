"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SessionManager } from "@/components/security/session-card";
import { staggerContainer, staggerItem } from "@/lib/animations";

export default function SessionsPage() {
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
            <h1 className="text-3xl font-bold tracking-tight">Active Sessions</h1>
            <p className="text-muted-foreground">
              View and manage your active sessions across devices
            </p>
          </div>
        </motion.div>

        {/* Session Manager */}
        <motion.div variants={staggerItem}>
          <SessionManager />
        </motion.div>
      </motion.div>
    </div>
  );
}
