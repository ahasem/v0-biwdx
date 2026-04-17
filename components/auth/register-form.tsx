"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
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

import { SocialLogin } from "./social-login";
import { registerSchema, type RegisterInput } from "@/lib/validators";
import { signUp, emailOtp } from "@/lib/auth-client";
import { cardVariants, staggerContainer, staggerItem } from "@/lib/animations";

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [registrationComplete, setRegistrationComplete] = React.useState(false);
  const [registeredEmail, setRegisteredEmail] = React.useState("");

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const password = form.watch("password");

  const passwordRequirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter", met: /[a-z]/.test(password) },
    { label: "One number", met: /[0-9]/.test(password) },
  ];

  const handleRegister = async (data: RegisterInput) => {
    setLoading(true);
    try {
      const result = await signUp.email({
        email: data.email,
        password: data.password,
        name: `${data.firstName} ${data.lastName}`,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      if (result?.error) {
        toast.error(result.error.message || "Registration failed");
      } else {
        // Send verification OTP
        await emailOtp.sendVerificationOtp({
          email: data.email,
          type: "email-verification",
        });

        setRegisteredEmail(data.email);
        setRegistrationComplete(true);
        toast.success("Account created! Check your console for the verification code.");
      }
    } catch (error) {
      toast.error("An error occurred during registration");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (registrationComplete) {
    return (
      <motion.div variants={cardVariants} initial="hidden" animate="visible">
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
            >
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </motion.div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Check your email
            </CardTitle>
            <CardDescription>
              We&apos;ve sent a verification code to
              <br />
              <span className="font-medium text-foreground">{registeredEmail}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              Check your console for the OTP code (in development mode), then verify your email to continue.
            </p>
            <Button
              className="w-full"
              onClick={() =>
                router.push(`/verify-email?email=${encodeURIComponent(registeredEmail)}`)
              }
            >
              Enter Verification Code
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              Didn&apos;t receive the code?{" "}
              <Button
                variant="link"
                className="h-auto p-0 text-primary"
                onClick={async () => {
                  setLoading(true);
                  try {
                    await emailOtp.sendVerificationOtp({
                      email: registeredEmail,
                      type: "email-verification",
                    });
                    toast.success("Verification code resent! Check your console.");
                  } catch {
                    toast.error("Failed to resend code");
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                Resend
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible">
      <Card className="border-0 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Create an account
          </CardTitle>
          <CardDescription>
            Enter your information to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleRegister)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <motion.div variants={staggerItem}>
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John"
                              autoComplete="given-name"
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
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Doe"
                              autoComplete="family-name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                </div>

                <motion.div variants={staggerItem}>
                  <FormField
                    control={form.control}
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
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a password"
                              autoComplete="new-password"
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

                {/* Password requirements */}
                {password && (
                  <motion.div
                    variants={staggerItem}
                    className="space-y-2 rounded-lg bg-muted/50 p-3"
                  >
                    <p className="text-xs font-medium text-muted-foreground">
                      Password requirements:
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {passwordRequirements.map((req, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-1.5 text-xs ${
                            req.met ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          <div
                            className={`h-1.5 w-1.5 rounded-full ${
                              req.met ? "bg-primary" : "bg-muted-foreground/50"
                            }`}
                          />
                          {req.label}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                <motion.div variants={staggerItem}>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </motion.div>
              </form>
            </Form>

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

            <SocialLogin />
          </motion.div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <p className="text-center text-xs text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
