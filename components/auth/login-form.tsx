"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { SocialLogin } from "./social-login";
import { PasskeyButton } from "./passkey-button";
import { OTPInput } from "./otp-input";
import { loginSchema, type LoginInput, emailOtpSchema, type EmailOtpInput } from "@/lib/validators";
import { signIn, emailOtp, getLastUsedLoginMethod, isLastUsedLoginMethod } from "@/lib/auth-client";
import { cardVariants, staggerContainer, staggerItem } from "@/lib/animations";
import { Badge } from "@/components/ui/badge";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [otpSent, setOtpSent] = React.useState(false);
  const [otpEmail, setOtpEmail] = React.useState("");
  const [otpValue, setOtpValue] = React.useState("");
  const [requires2FA, setRequires2FA] = React.useState(false);

  // Get last used login method for UI hints
  const lastLoginMethod = React.useMemo(() => {
    if (typeof window !== "undefined") {
      return getLastUsedLoginMethod();
    }
    return null;
  }, []);

  // Determine default tab based on last login method
  const defaultTab = React.useMemo(() => {
    if (lastLoginMethod === "email-otp") return "otp";
    return "credentials";
  }, [lastLoginMethod]);

  const credentialForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const otpForm = useForm<EmailOtpInput>({
    resolver: zodResolver(emailOtpSchema),
    defaultValues: { email: "" },
  });

  const handleCredentialLogin = async (data: LoginInput) => {
    setLoading(true);
    try {
      const result = await signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: callbackUrl,
      });

      if (result?.error) {
        if (result.error.message?.includes("2FA")) {
          setRequires2FA(true);
          router.push(`/two-factor?email=${encodeURIComponent(data.email)}`);
        } else {
          toast.error(result.error.message || "Invalid credentials");
        }
      } else {
        toast.success("Signed in successfully!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      toast.error("An error occurred during sign in");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (data: EmailOtpInput) => {
    setLoading(true);
    try {
      const result = await emailOtp.sendVerificationOtp({
        email: data.email,
        type: "sign-in",
      });

      if (result?.error) {
        toast.error(result.error.message || "Failed to send OTP");
      } else {
        setOtpEmail(data.email);
        setOtpSent(true);
        toast.success("OTP sent to your email. Check your console for the code.");
      }
    } catch (error) {
      toast.error("Failed to send OTP");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpValue.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn.emailOtp({
        email: otpEmail,
        otp: otpValue,
      });

      if (result?.error) {
        toast.error(result.error.message || "Invalid OTP");
      } else {
        toast.success("Signed in successfully!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to verify OTP");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (requires2FA) {
    return null; // Will redirect to 2FA page
  }

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible">
      <Card className="border-0 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Welcome back
          </CardTitle>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="credentials" className="relative">
                  Email & Password
                  {isLastUsedLoginMethod("email") && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Last used
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="otp" className="relative">
                  Email OTP
                  {isLastUsedLoginMethod("email-otp") && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Last used
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Credential Login */}
              <TabsContent value="credentials" className="mt-4 space-y-4">
                <Form {...credentialForm}>
                  <form
                    onSubmit={credentialForm.handleSubmit(handleCredentialLogin)}
                    className="space-y-4"
                  >
                    <motion.div variants={staggerItem}>
                      <FormField
                        control={credentialForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="name@example.com"
                                autoComplete="email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div variants={staggerItem}>
                      <FormField
                        control={credentialForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel>Password</FormLabel>
                              <Link
                                href="/forgot-password"
                                className="text-sm text-primary hover:underline"
                              >
                                Forgot password?
                              </Link>
                            </div>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter your password"
                                  autoComplete="current-password"
                                  {...field}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <span className="sr-only">
                                    {showPassword ? "Hide password" : "Show password"}
                                  </span>
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div variants={staggerItem}>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sign In
                      </Button>
                    </motion.div>
                  </form>
                </Form>
              </TabsContent>

              {/* OTP Login */}
              <TabsContent value="otp" className="mt-4 space-y-4">
                {!otpSent ? (
                  <Form {...otpForm}>
                    <form
                      onSubmit={otpForm.handleSubmit(handleSendOTP)}
                      className="space-y-4"
                    >
                      <motion.div variants={staggerItem}>
                        <FormField
                          control={otpForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="name@example.com"
                                  autoComplete="email"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      <motion.div variants={staggerItem}>
                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Mail className="mr-2 h-4 w-4" />
                          )}
                          Send OTP
                        </Button>
                      </motion.div>
                    </form>
                  </Form>
                ) : (
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                  >
                    <motion.div variants={staggerItem} className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Enter the 6-digit code sent to
                      </p>
                      <p className="font-medium">{otpEmail}</p>
                    </motion.div>

                    <motion.div variants={staggerItem}>
                      <OTPInput
                        value={otpValue}
                        onChange={setOtpValue}
                        disabled={loading}
                      />
                    </motion.div>

                    <motion.div variants={staggerItem} className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setOtpSent(false);
                          setOtpValue("");
                        }}
                        disabled={loading}
                      >
                        Back
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={handleVerifyOTP}
                        disabled={loading || otpValue.length !== 6}
                      >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Verify
                      </Button>
                    </motion.div>

                    <motion.div variants={staggerItem} className="text-center">
                      <Button
                        variant="link"
                        className="text-sm"
                        onClick={() => handleSendOTP({ email: otpEmail })}
                        disabled={loading}
                      >
                        Resend OTP
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </TabsContent>
            </Tabs>

            <motion.div variants={staggerItem}>
              <PasskeyButton mode="signin" />
            </motion.div>

            <motion.div variants={staggerItem} className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </motion.div>

            <SocialLogin callbackUrl={callbackUrl} />
          </motion.div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
