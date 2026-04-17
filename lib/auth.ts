import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  emailOTP,
  twoFactor,
  organization,
  multiSession,
  lastLoginMethod,
} from "better-auth/plugins";
// Note: passkey requires: npm install @better-auth/passkey
// Uncomment below after installing @better-auth/passkey
// import { passkey } from "@better-auth/passkey";
import { db } from "./db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  // Secret key for session encryption and token generation
  secret: process.env.BETTER_AUTH_SECRET || "dev-secret-change-in-production",

  // Dynamic base URL configuration for flexible deployment scenarios
  // Supports multiple domains, preview deployments, and branch environments
  baseURL: {
    // Allowed hosts with wildcard patterns for flexible origin matching
    allowedHosts: [
      // Production domains
      ...(process.env.PRODUCTION_HOST ? [process.env.PRODUCTION_HOST] : []),
      // Vercel preview deployments
      "*.vercel.app",
      // v0.dev preview environment
      "*.vusercontent.net",
      // Local development
      "localhost:*",
      "127.0.0.1:*",
    ],
    // Protocol: "auto" derives from x-forwarded-proto header, then request URL, then defaults to HTTPS
    protocol: "auto",
    // Fallback URL when incoming host doesn't match allowed hosts
    // Ensures the URL always has a protocol prefix
    fallback: (() => {
      const url = process.env.BETTER_AUTH_URL || "http://localhost:3000";
      if (url.startsWith("http://") || url.startsWith("https://")) return url;
      return `https://${url}`;
    })(),
  },

  // Additional trusted origins with wildcard support for CORS and CSRF protection
  trustedOrigins: [
    // Production origins
    ...(process.env.BETTER_AUTH_URL
      ? [
          process.env.BETTER_AUTH_URL.startsWith("http")
            ? process.env.BETTER_AUTH_URL
            : `https://${process.env.BETTER_AUTH_URL}`,
        ]
      : []),
    // Vercel preview deployments
    "https://*.vercel.app",
    // v0.dev preview environment - wildcard pattern for flexible matching
    "https://*.vusercontent.net",
    // Local development
    "http://localhost:*",
    "http://127.0.0.1:*",
  ],
  
  // User configuration with additional fields
  user: {
    additionalFields: {
      firstName: {
        type: "string",
        required: false,
      },
      lastName: {
        type: "string",
        required: false,
      },
    },
  },

  // Enable email and password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  // Social providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
    },
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  // Plugins
  plugins: [
    // Email OTP for verification and passwordless login
    emailOTP({
      otpLength: 6,
      expiresIn: 600, // 10 minutes
      async sendVerificationOTP({ email, otp, type }) {
        // ============================================================
        // EMAIL INTEGRATION POINT
        // 
        // Replace the console.log below with your email service:
        //
        // Option 1: Nodemailer
        // ---------------------------------------------------------
        // import nodemailer from 'nodemailer';
        // const transporter = nodemailer.createTransport({
        //   host: process.env.SMTP_HOST,
        //   port: parseInt(process.env.SMTP_PORT || '587'),
        //   secure: false,
        //   auth: {
        //     user: process.env.SMTP_USER,
        //     pass: process.env.SMTP_PASS,
        //   },
        // });
        // await transporter.sendMail({
        //   from: '"Hasem App" <noreply@yourdomain.com>',
        //   to: email,
        //   subject: `Your verification code: ${otp}`,
        //   html: `
        //     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        //       <h2>Your Verification Code</h2>
        //       <p>Use the following code to ${type === 'sign-in' ? 'sign in' : type === 'email-verification' ? 'verify your email' : 'reset your password'}:</p>
        //       <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 8px; font-weight: bold;">
        //         ${otp}
        //       </div>
        //       <p style="color: #666; font-size: 14px; margin-top: 20px;">
        //         This code will expire in 10 minutes.
        //       </p>
        //     </div>
        //   `,
        // });
        //
        // Option 2: SendGrid
        // ---------------------------------------------------------
        // import sgMail from '@sendgrid/mail';
        // sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
        // await sgMail.send({
        //   to: email,
        //   from: 'noreply@yourdomain.com',
        //   subject: 'Your verification code',
        //   text: `Your OTP is: ${otp}`,
        //   html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
        // });
        //
        // Option 3: Resend
        // ---------------------------------------------------------
        // import { Resend } from 'resend';
        // const resend = new Resend(process.env.RESEND_API_KEY);
        // await resend.emails.send({
        //   from: 'Hasem App <noreply@yourdomain.com>',
        //   to: email,
        //   subject: 'Your verification code',
        //   html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
        // });
        //
        // Option 4: AWS SES
        // ---------------------------------------------------------
        // import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
        // const ses = new SESClient({ region: process.env.AWS_REGION });
        // await ses.send(new SendEmailCommand({
        //   Source: 'noreply@yourdomain.com',
        //   Destination: { ToAddresses: [email] },
        //   Message: {
        //     Subject: { Data: 'Your verification code' },
        //     Body: { Text: { Data: `Your OTP is: ${otp}` } },
        //   },
        // }));
        // ============================================================

        const typeLabel = {
          "sign-in": "SIGN IN",
          "email-verification": "EMAIL VERIFICATION",
          "forget-password": "PASSWORD RESET",
        }[type] || type.toUpperCase();

        console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                      EMAIL OTP - ${typeLabel.padEnd(25)}║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  To:        ${email.padEnd(52)}║
║                                                                  ║
║  ┌─────────────────────────────────────────────────────────┐     ║
║  │                                                         │     ║
║  │               OTP CODE: ${otp}                         │     ║
║  │                                                         │     ║
║  └─────────────────────────────────────────────────────────┘     ║
║                                                                  ║
║  Type:      ${type.padEnd(52)}║
║  Expires:   10 minutes                                           ║
║  Timestamp: ${new Date().toISOString().padEnd(52)}║
║                                                                  ║
║  [!] Replace this console.log with your email service above      ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
        `);
      },
    }),

    // Two-factor authentication
    twoFactor({
      issuer: "Hasem App",
      totpOptions: {
        digits: 6,
        period: 30,
      },
      backupCodes: {
        enabled: true,
        count: 10,
        length: 8,
      },
    }),

    // Multi-session support
    // Allows users to maintain multiple active sessions across different accounts
    multiSession({
      // Maximum number of concurrent sessions per device
      maximumSessions: 5,
    }),

    // Last login method tracking
    // Tracks and displays the most recent authentication method used
    lastLoginMethod({
      // Store in database for persistent tracking and analytics
      storeInDatabase: true,
      // Cookie configuration
      cookieName: "hasem.last_login_method",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      // Custom method resolution for email OTP
      customResolveMethod: (ctx) => {
        // Track email OTP authentication
        if (ctx.path?.includes("/email-otp/verify")) {
          return "email-otp";
        }
        // Track passkey authentication
        if (ctx.path?.includes("/passkey/")) {
          return "passkey";
        }
        // Return null to use default resolution logic
        return null;
      },
    }),

    // Organization and team management
    organization({
      teams: {
        enabled: true,
      },
      async sendInvitationEmail({ email, organization: org, inviter, url }) {
        // ============================================================
        // EMAIL INTEGRATION POINT - ORGANIZATION INVITATION
        // 
        // Replace the console.log below with your email service.
        // See the sendVerificationOTP function above for email
        // service integration examples (Nodemailer, SendGrid, 
        // Resend, AWS SES).
        //
        // Example with Resend:
        // ---------------------------------------------------------
        // import { Resend } from 'resend';
        // const resend = new Resend(process.env.RESEND_API_KEY);
        // await resend.emails.send({
        //   from: 'Hasem App <noreply@yourdomain.com>',
        //   to: email,
        //   subject: `You've been invited to join ${org.name}`,
        //   html: `
        //     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        //       <h2>You're Invited!</h2>
        //       <p>${inviter.user.name} has invited you to join <strong>${org.name}</strong>.</p>
        //       <a href="${url}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
        //         Accept Invitation
        //       </a>
        //       <p style="color: #666; font-size: 14px; margin-top: 20px;">
        //         This invitation will expire in 7 days.
        //       </p>
        //     </div>
        //   `,
        // });
        // ============================================================

        console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                    ORGANIZATION INVITATION                       ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  To:           ${email.padEnd(49)}║
║  Organization: ${org.name.padEnd(49)}║
║  Invited By:   ${inviter.user.name?.padEnd(49) || "Unknown".padEnd(49)}║
║                                                                  ║
║  Accept URL:                                                     ║
║  ${url.substring(0, 64).padEnd(64)}║
║                                                                  ║
║  Expires:      7 days                                            ║
║  Timestamp:    ${new Date().toISOString().padEnd(49)}║
║                                                                  ║
║  [!] Replace this console.log with your email service            ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
        `);
      },
    }),
  ],

  // Advanced configuration
  advanced: {
    cookiePrefix: "hasem",
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});

// Export types
export type Auth = typeof auth;
