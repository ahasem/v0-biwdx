"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, KeyRound, ArrowLeft } from "lucide-react";
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

import { emailOtpSchema, type EmailOtpInput } from "@/lib/validators";
import { emailOtp } from "@/lib/auth-client";
import { cardVariants, staggerContainer, staggerItem } from "@/lib/animations";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const form = useForm<EmailOtpInput>({
    resolver: zodResolver(emailOtpSchema),
    defaultValues: { email: "" },
  });

  const handleSendOTP = async (data: EmailOtpInput) => {
    setLoading(true);
    try {
      const result = await emailOtp.sendVerificationOtp({
        email: data.email,
        type: "forget-password",
      });

      if (result?.error) {
        toast.error(result.error.message || "Failed to send reset code");
      } else {
        toast.success("Reset code sent! Check your console.");
        router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
      }
    } catch (error) {
      toast.error("Failed to send reset code");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
            <KeyRound className="h-8 w-8 text-primary" />
          </motion.div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Forgot password?
          </CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a code to reset your password
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
              <form onSubmit={form.handleSubmit(handleSendOTP)} className="space-y-4">
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
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Reset Code
                  </Button>
                </motion.div>
              </form>
            </Form>
          </motion.div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
