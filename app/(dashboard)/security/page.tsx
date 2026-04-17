"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Shield,
  Key,
  Fingerprint,
  Smartphone,
  Link2,
  ChevronRight,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { PasswordForm } from "@/components/security/password-form";
import { TwoFactorSetup } from "@/components/security/two-factor-setup";
import { useSession } from "@/lib/auth-client";
import { staggerContainer, staggerItem, cardVariants } from "@/lib/animations";

const securityLinks = [
  {
    title: "Passkeys",
    description: "Manage your passkeys for passwordless sign-in",
    href: "/security/passkeys",
    icon: Fingerprint,
  },
  {
    title: "Backup Codes",
    description: "View or regenerate your 2FA backup codes",
    href: "/security/backup-codes",
    icon: Key,
  },
  {
    title: "Active Sessions",
    description: "View and manage your active sessions",
    href: "/security/sessions",
    icon: Smartphone,
  },
  {
    title: "Linked Accounts",
    description: "Manage connected social accounts",
    href: "/security/linked-accounts",
    icon: Link2,
  },
];

export default function SecurityPage() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="container max-w-3xl px-4 py-8">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={staggerItem} className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Security</h1>
          <p className="text-muted-foreground">
            Manage your account security and authentication methods
          </p>
        </motion.div>

        {/* Security Overview */}
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant={user?.emailVerified ? "default" : "destructive"}>
                  {user?.emailVerified ? "Email Verified" : "Email Not Verified"}
                </Badge>
                <Badge variant={user?.twoFactorEnabled ? "default" : "secondary"}>
                  {user?.twoFactorEnabled ? "2FA Enabled" : "2FA Disabled"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Password Section */}
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PasswordForm />
            </CardContent>
          </Card>
        </motion.div>

        {/* 2FA Section */}
        <motion.div variants={staggerItem}>
          <TwoFactorSetup />
        </motion.div>

        {/* Security Links */}
        <motion.div variants={staggerItem} className="space-y-4">
          <h2 className="text-xl font-semibold">More Security Options</h2>
          <div className="grid gap-4">
            {securityLinks.map((link) => (
              <motion.div
                key={link.href}
                variants={cardVariants}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Link href={link.href}>
                  <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <link.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{link.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {link.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
