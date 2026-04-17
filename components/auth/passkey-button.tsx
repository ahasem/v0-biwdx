"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { staggerItem } from "@/lib/animations";
import { toast } from "sonner";

interface PasskeyButtonProps {
  mode: "signin" | "register";
  email?: string;
}

export function PasskeyButton({ mode }: PasskeyButtonProps) {
  const handlePasskeyAuth = () => {
    // Passkey support requires installing @better-auth/passkey
    // Run: npm install @better-auth/passkey
    // Then uncomment passkeyClient() in lib/auth-client.ts
    // and passkey() in lib/auth.ts
    toast.info(
      "Passkey support requires additional setup. See SETUP.md for details."
    );
  };

  return (
    <motion.div variants={staggerItem}>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handlePasskeyAuth}
      >
        <Fingerprint className="mr-2 h-4 w-4" />
        {mode === "signin" ? "Sign in with Passkey" : "Add a Passkey"}
      </Button>
    </motion.div>
  );
}
