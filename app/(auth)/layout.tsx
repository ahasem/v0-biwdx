"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { fadeIn } from "@/lib/animations";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Header */}
      <header className="absolute top-0 z-50 flex w-full items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <span className="text-lg font-semibold">Hasem</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-20">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 w-full p-4 text-center text-sm text-muted-foreground">
        <p>Protected by advanced authentication</p>
      </footer>

      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>
    </div>
  );
}
