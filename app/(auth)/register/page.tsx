import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a new account to get started",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
