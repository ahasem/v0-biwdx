"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, User, Camera } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

import { profileSchema, type ProfileInput } from "@/lib/validators";
import { useSession, authClient } from "@/lib/auth-client";
import { staggerContainer, staggerItem } from "@/lib/animations";

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const [loading, setLoading] = React.useState(false);

  const user = session?.user;

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      image: "",
    },
  });

  // Update form when session loads
  React.useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || user.name?.split(" ")[0] || "",
        lastName: user.lastName || user.name?.split(" ").slice(1).join(" ") || "",
        image: user.image || "",
      });
    }
  }, [user, form]);

  const handleUpdateProfile = async (data: ProfileInput) => {
    setLoading(true);
    try {
      const result = await authClient.updateUser({
        name: `${data.firstName} ${data.lastName}`,
        firstName: data.firstName,
        lastName: data.lastName,
        image: data.image || undefined,
      });

      if (result?.error) {
        toast.error(result.error.message || "Failed to update profile");
      } else {
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      toast.error("An error occurred while updating profile");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isPending) {
    return (
      <div className="container flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and preferences
          </p>
        </motion.div>

        {/* Profile Card */}
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your profile details and how others see you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleUpdateProfile)}
                  className="space-y-6"
                >
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={form.watch("image") || user?.image || undefined}
                        alt={user?.name || "User"}
                      />
                      <AvatarFallback className="text-lg">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h3 className="font-medium">{user?.name || "User"}</h3>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Name Fields */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Image URL */}
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Image URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/avatar.jpg"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email (read-only) */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input value={user?.email || ""} disabled />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed from here
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Info Card */}
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Details about your account status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Verification</p>
                  <p className="text-sm text-muted-foreground">
                    Your email verification status
                  </p>
                </div>
                <span
                  className={`text-sm font-medium ${
                    user?.emailVerified ? "text-green-600" : "text-destructive"
                  }`}
                >
                  {user?.emailVerified ? "Verified" : "Not Verified"}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Additional account security
                  </p>
                </div>
                <span
                  className={`text-sm font-medium ${
                    user?.twoFactorEnabled ? "text-green-600" : "text-muted-foreground"
                  }`}
                >
                  {user?.twoFactorEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Account Created</p>
                  <p className="text-sm text-muted-foreground">
                    When you joined Hasem
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "Unknown"}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
