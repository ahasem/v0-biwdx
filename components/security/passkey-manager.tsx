"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Fingerprint, Info } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { staggerContainer, staggerItem } from "@/lib/animations";

export function PasskeyManager() {
  // Passkey support requires installing @better-auth/passkey
  // Run: npm install @better-auth/passkey
  // Then:
  // 1. Uncomment passkeyClient() in lib/auth-client.ts
  // 2. Uncomment passkey() in lib/auth.ts
  // 3. Import { passkey } from "@/lib/auth-client" and use it here

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
            <CardTitle className="text-lg">Passkeys</CardTitle>
            <CardDescription>
              Manage your passkeys for passwordless authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Setup Required</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>
                  Passkey support requires the <code className="rounded bg-muted px-1 py-0.5 text-xs">@better-auth/passkey</code> package.
                </p>
                <p className="text-xs text-muted-foreground">
                  Install it with: <code className="rounded bg-muted px-1 py-0.5">npm install @better-auth/passkey</code>
                </p>
              </AlertDescription>
            </Alert>
            <div className="mt-6 flex flex-col items-center justify-center py-4 text-center">
              <Fingerprint className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Passkeys provide secure, passwordless authentication
              </p>
              <p className="text-xs text-muted-foreground">
                Once configured, you can add and manage passkeys here
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
