#!/usr/bin/env bash

# Hasem Authentication App - Quick Reference Guide
# This file documents the most common tasks and commands

echo "
╔════════════════════════════════════════════════════════════════════╗
║                   HASEM QUICK REFERENCE GUIDE                     ║
╚════════════════════════════════════════════════════════════════════╝
"

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📖 DOCUMENTATION${NC}"
echo "  README.md          - Project overview and features"
echo "  SETUP.md           - Environment setup and deployment"
echo "  ARCHITECTURE.md    - Technical architecture"
echo "  TROUBLESHOOTING.md - Common issues and solutions"
echo ""

echo -e "${BLUE}🚀 GETTING STARTED${NC}"
echo "  cp .env.example .env.local"
echo "  npm run verify                  # Validates all config"
echo "  npm run dev                     # Start development server"
echo "  http://localhost:3000           # Open application"
echo ""

echo -e "${BLUE}🗄️  DATABASE${NC}"
echo "  npm run db:migrate              # Create schema"
echo "  psql \$DATABASE_URL             # Connect to database"
echo ""

echo -e "${BLUE}🔐 AUTHENTICATION TESTING${NC}"
echo "  Email OTP:"
echo "    - Check browser console (F12 → Console)"
echo "    - Check server terminal output"
echo "    - Codes expire in 10 minutes"
echo ""
echo "  Passkeys:"
echo "    - Requires HTTPS in production"
echo "    - HTTP works on localhost"
echo ""
echo "  2FA:"
echo "    - Use authenticator app (Google Authenticator, Authy)"
echo "    - Or use backup codes provided"
echo ""
echo "  Multi-Session:"
echo "    - Login from multiple browser tabs"
echo "    - View sessions in Security → Sessions"
echo "    - Switch or remove linked accounts"
echo ""

echo -e "${BLUE}🔑 ENVIRONMENT VARIABLES${NC}"
echo "  Required:"
echo "    BETTER_AUTH_SECRET     (generate: openssl rand -base64 32)"
echo "    DATABASE_URL           (your Neon PostgreSQL URL)"
echo "    BETTER_AUTH_URL        (http://localhost:3000)"
echo ""
echo "  Optional (for social login):"
echo "    GOOGLE_CLIENT_ID       (from Google Cloud Console)"
echo "    GOOGLE_CLIENT_SECRET   (from Google Cloud Console)"
echo "    FACEBOOK_CLIENT_ID     (from Facebook Developers)"
echo "    FACEBOOK_CLIENT_SECRET (from Facebook Developers)"
echo ""

echo -e "${BLUE}📧 EMAIL INTEGRATION${NC}"
echo "  Development:  OTP codes logged to console"
echo "  Production:   Replace console.log in lib/auth.ts"
echo ""
echo "  Supported services:"
echo "    - Nodemailer (SMTP)"
echo "    - SendGrid"
echo "    - Resend"
echo "    - AWS SES"
echo ""

echo -e "${BLUE}🏗️  PROJECT STRUCTURE${NC}"
echo "  app/(auth)/              - Login, register, password reset"
echo "  app/(dashboard)/         - Protected user pages"
echo "  components/auth/         - Authentication forms"
echo "  components/security/     - Security settings components"
echo "  components/organizations/- Organization management"
echo "  lib/auth.ts              - Better Auth configuration"
echo "  lib/auth-client.ts       - Client-side auth utilities"
echo "  lib/db/                  - Database schema and connection"
echo "  scripts/migrate.ts       - Database migration script"
echo ""

echo -e "${BLUE}🛠️  DEVELOPMENT COMMANDS${NC}"
echo "  npm run dev              - Start with verification"
echo "  npm run verify           - Check environment setup"
echo "  npm run db:migrate       - Run database migrations"
echo "  npm run build            - Build for production"
echo "  npm start                - Start production server"
echo ""

echo -e "${BLUE}🐛 DEBUGGING${NC}"
echo "  Browser Console (F12)    - Client-side errors and OTP codes"
echo "  Server Terminal          - Server-side errors and formatted OTP"
echo "  Database Connection:"
echo "    psql \$DATABASE_URL -c \"SELECT 1\""
echo ""

echo -e "${BLUE}🚀 DEPLOYMENT${NC}"
echo "  Vercel:"
echo "    1. Connect GitHub repo"
echo "    2. Add environment variables"
echo "    3. Deploy automatically on push"
echo ""
echo "  Manual:"
echo "    npm install"
echo "    npm run build"
echo "    npm run db:migrate       # On production database"
echo "    npm start"
echo ""

echo -e "${BLUE}🔗 USEFUL LINKS${NC}"
echo "  Better Auth Docs    https://better-auth.com"
echo "  Next.js Docs        https://nextjs.org/docs"
echo "  Drizzle ORM         https://orm.drizzle.team"
echo "  Zod Validation      https://zod.dev"
echo ""

echo -e "${YELLOW}❓ NEED HELP?${NC}"
echo "  See TROUBLESHOOTING.md for common issues"
echo "  Check ARCHITECTURE.md for technical details"
echo "  Review SETUP.md for configuration help"
echo ""
