// ============================================================
// Database Migration Script
// Run with: npx tsx scripts/migrate.ts
// ============================================================

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log("Starting database migration...");

  try {
    // Create user table
    await sql`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL UNIQUE,
        "email_verified" BOOLEAN NOT NULL DEFAULT false,
        "image" TEXT,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "first_name" TEXT,
        "last_name" TEXT,
        "two_factor_enabled" BOOLEAN DEFAULT false,
        "last_login_method" TEXT
      )
    `;
    console.log("✓ Created user table");

    // Add last_login_method column if it doesn't exist (for existing tables)
    await sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'user' AND column_name = 'last_login_method'
        ) THEN 
          ALTER TABLE "user" ADD COLUMN "last_login_method" TEXT;
        END IF;
      END $$;
    `;
    console.log("✓ Ensured last_login_method column exists");

    // Create session table
    await sql`
      CREATE TABLE IF NOT EXISTS "session" (
        "id" TEXT PRIMARY KEY,
        "expires_at" TIMESTAMP NOT NULL,
        "token" TEXT NOT NULL UNIQUE,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "ip_address" TEXT,
        "user_agent" TEXT,
        "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "active_organization_id" TEXT
      )
    `;
    console.log("✓ Created session table");

    // Create account table
    await sql`
      CREATE TABLE IF NOT EXISTS "account" (
        "id" TEXT PRIMARY KEY,
        "account_id" TEXT NOT NULL,
        "provider_id" TEXT NOT NULL,
        "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "access_token" TEXT,
        "refresh_token" TEXT,
        "id_token" TEXT,
        "access_token_expires_at" TIMESTAMP,
        "refresh_token_expires_at" TIMESTAMP,
        "scope" TEXT,
        "password" TEXT,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log("✓ Created account table");

    // Create verification table
    await sql`
      CREATE TABLE IF NOT EXISTS "verification" (
        "id" TEXT PRIMARY KEY,
        "identifier" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log("✓ Created verification table");

    // Create two_factor table
    await sql`
      CREATE TABLE IF NOT EXISTS "two_factor" (
        "id" TEXT PRIMARY KEY,
        "secret" TEXT NOT NULL,
        "backup_codes" TEXT NOT NULL,
        "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
      )
    `;
    console.log("✓ Created two_factor table");

    // Create passkey table
    await sql`
      CREATE TABLE IF NOT EXISTS "passkey" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT,
        "public_key" TEXT NOT NULL,
        "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "webauthn_user_id" TEXT NOT NULL,
        "counter" INTEGER NOT NULL,
        "device_type" TEXT,
        "backed_up" BOOLEAN NOT NULL,
        "transports" TEXT,
        "created_at" TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log("✓ Created passkey table");

    // Create organization table
    await sql`
      CREATE TABLE IF NOT EXISTS "organization" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "slug" TEXT UNIQUE,
        "logo" TEXT,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "metadata" TEXT
      )
    `;
    console.log("✓ Created organization table");

    // Create member table
    await sql`
      CREATE TABLE IF NOT EXISTS "member" (
        "id" TEXT PRIMARY KEY,
        "organization_id" TEXT NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
        "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "role" TEXT NOT NULL DEFAULT 'member',
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log("✓ Created member table");

    // Create invitation table
    await sql`
      CREATE TABLE IF NOT EXISTS "invitation" (
        "id" TEXT PRIMARY KEY,
        "organization_id" TEXT NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
        "email" TEXT NOT NULL,
        "role" TEXT DEFAULT 'member',
        "status" TEXT NOT NULL DEFAULT 'pending',
        "expires_at" TIMESTAMP NOT NULL,
        "inviter_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
      )
    `;
    console.log("✓ Created invitation table");

    // Create team table
    await sql`
      CREATE TABLE IF NOT EXISTS "team" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "organization_id" TEXT NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log("✓ Created team table");

    // Create team_member table
    await sql`
      CREATE TABLE IF NOT EXISTS "team_member" (
        "id" TEXT PRIMARY KEY,
        "team_id" TEXT NOT NULL REFERENCES "team"("id") ON DELETE CASCADE,
        "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log("✓ Created team_member table");

    console.log("\n✅ Database migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
