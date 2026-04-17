"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Shield,
  User,
  Building2,
  Key,
  Fingerprint,
  Users,
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

import { useSession, useListOrganizations } from "@/lib/auth-client";
import { staggerContainer, staggerItem, cardVariants } from "@/lib/animations";

const quickActions = [
  {
    title: "Profile Settings",
    description: "Update your personal information",
    href: "/profile",
    icon: User,
  },
  {
    title: "Security",
    description: "Manage passwords, 2FA, and sessions",
    href: "/security",
    icon: Shield,
  },
  {
    title: "Passkeys",
    description: "Set up passwordless authentication",
    href: "/security/passkeys",
    icon: Fingerprint,
  },
  {
    title: "Organizations",
    description: "Manage your teams and members",
    href: "/organizations",
    icon: Building2,
  },
];

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const { data: organizations } = useListOrganizations();

  const user = session?.user;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="container max-w-6xl px-4 py-8">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Welcome Section */}
        <motion.div variants={staggerItem} className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {getGreeting()}, {user?.firstName || user?.name?.split(" ")[0] || "there"}
          </h1>
          <p className="text-muted-foreground">
            Welcome to your dashboard. Here&apos;s an overview of your account.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={staggerItem}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Organizations</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {organizations?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Teams you belong to
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant={user?.twoFactorEnabled ? "default" : "secondary"}>
                  {user?.twoFactorEnabled ? "2FA Enabled" : "2FA Disabled"}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {user?.twoFactorEnabled
                  ? "Your account is protected"
                  : "Enable for extra security"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Email</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant={user?.emailVerified ? "default" : "destructive"}>
                  {user?.emailVerified ? "Verified" : "Not Verified"}
                </Badge>
              </div>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {user?.email}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate">
                {user?.name || "Unknown"}
              </div>
              <p className="text-xs text-muted-foreground">Your display name</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={staggerItem} className="space-y-4">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.href}
                variants={cardVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href={action.href}>
                  <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <action.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{action.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {action.description}
                        </CardDescription>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Organizations */}
        {organizations && organizations.length > 0 && (
          <motion.div variants={staggerItem} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Organizations</h2>
              <Link
                href="/organizations"
                className="text-sm text-primary hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {organizations.slice(0, 3).map((org) => (
                <motion.div
                  key={org.id}
                  variants={cardVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link href={`/organizations/${org.id}`}>
                    <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{org.name}</CardTitle>
                            <CardDescription className="text-xs">
                              {org.slug}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
