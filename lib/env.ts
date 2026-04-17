/**
 * Environment variable validation utility
 * Ensures all required env vars are set and valid
 */

const requiredEnvVars = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
];

const optionalEnvVars = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "FACEBOOK_CLIENT_ID",
  "FACEBOOK_CLIENT_SECRET",
  "PASSKEY_RP_ID",
];

/**
 * Validates that all required environment variables are set
 * Call this at application startup
 */
export function validateEnv() {
  const missing: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach((v) => console.error(`   - ${v}`));
    console.error("\nPlease add these to your .env.local file.");
    console.error("See .env.example for more information.\n");
    
    // In production, throw error; in development, warn
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `Missing required environment variables: ${missing.join(", ")}`
      );
    }
  }

  // Warn about optional OAuth vars if not set
  const oauthVars = [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "FACEBOOK_CLIENT_ID",
    "FACEBOOK_CLIENT_SECRET",
  ];
  
  const oauthMissing = oauthVars.filter((v) => !process.env[v]);
  if (oauthMissing.length > 0) {
    console.warn(
      "⚠️  Social login not fully configured. Missing: " + oauthMissing.join(", ")
    );
  }

  console.log("✓ Environment variables validated");
}

/**
 * Gets a required environment variable
 * Throws if not set
 */
export function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Gets an optional environment variable with a default
 */
export function getOptionalEnv(key: string, defaultValue?: string): string | undefined {
  return process.env[key] || defaultValue;
}
