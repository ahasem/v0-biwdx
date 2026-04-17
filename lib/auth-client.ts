"use client";

import { createAuthClient } from "better-auth/react";
import {
  emailOTPClient,
  twoFactorClient,
  organizationClient,
  multiSessionClient,
  lastLoginMethodClient,
} from "better-auth/client/plugins";
// Note: passkeyClient requires: npm install @better-auth/passkey
// Uncomment below after installing @better-auth/passkey
// import { passkeyClient } from "@better-auth/passkey/client";

// Dynamic base URL resolution for client-side
// Uses window.location.origin when available, falls back to env var
const getBaseURL = () => {
  if (typeof window !== "undefined") {
    // Client-side: use current origin for dynamic deployment support
    return window.location.origin;
  }
  // Server-side: use environment variable or fallback
  return process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [
    emailOTPClient(),
    twoFactorClient(),
    organizationClient(),
    multiSessionClient(),
    lastLoginMethodClient({
      cookieName: "hasem.last_login_method",
    }),
    // passkeyClient() - Requires: npm install @better-auth/passkey
  ],
});

// Export commonly used functions and hooks
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  // Email OTP
  emailOtp,
  // Two-factor
  twoFactor,
  // Organization
  organization,
  useActiveOrganization,
  useListOrganizations,
  // Multi-session
  multiSession,
  // Last login method helpers
  getLastUsedLoginMethod,
  isLastUsedLoginMethod,
  clearLastUsedLoginMethod,
} = authClient;

// Custom hook that ensures proper session handling with dynamic origins
export const useAuthClient = () => {
  return useSession();
};
