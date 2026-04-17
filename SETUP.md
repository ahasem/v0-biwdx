# Getting Started with Environment Variables

## Quick Start

1. **Copy environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Add required environment variables:**
   ```bash
   BETTER_AUTH_SECRET=<run: openssl rand -base64 32>
   DATABASE_URL=<your-neon-postgres-url>
   BETTER_AUTH_URL=http://localhost:3000
   ```

3. **Verify setup:**
   ```bash
   npm run verify
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

The application will automatically validate all required environment variables and display a detailed status.

## Environment Variables Guide

### Required Variables

#### `DATABASE_URL`
PostgreSQL connection string for Neon database
- Format: `postgresql://[user[:password]@][netloc][:port][/dbname]`
- Get from Neon project dashboard
- Example: `postgresql://user:pass@neon.tech/mydb?sslmode=require`

#### `BETTER_AUTH_SECRET`
Secret key for session encryption and token signing (CRITICAL)
- Generate with: `openssl rand -base64 32`
- Must be at least 32 characters
- **Never commit to version control**
- Use same secret across all environments for consistent sessions
- In production, use a strong random value from your deployment platform

#### `BETTER_AUTH_URL`
Base URL of your application
- Development: `http://localhost:3000`
- Production: `https://yourdomain.com`
- Used for OAuth callbacks and session validation
- Must be publicly accessible in production

### Optional Variables

#### OAuth Credentials (for social login)

**Google:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials (Web application type)
3. Add authorized redirect URI: `{BETTER_AUTH_URL}/api/auth/callback/google`
4. Copy credentials to `.env.local`:
   ```
   GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxx
   ```

**Facebook:**
1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create application → Add Facebook Login product
3. Configure OAuth URI: `{BETTER_AUTH_URL}/api/auth/callback/facebook`
4. Copy credentials:
   ```
   FACEBOOK_CLIENT_ID=123456789
   FACEBOOK_CLIENT_SECRET=abc123def456
   ```

#### Email Service Configuration

In development, all OTP codes and invitation URLs are logged to console. For production, configure one of the following:

**Option 1: Sendgrid**
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
```

**Option 2: Resend**
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**Option 3: Nodemailer (SMTP)**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

**Option 4: AWS SES**
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

#### Passkey Configuration (Optional)
```env
PASSKEY_RP_ID=yourdomain.com
```

For localhost development, this is automatically set. For production, set it to your domain.

## Development Workflow

### 1. First Time Setup
```bash
# Install dependencies
npm install

# Run verification (checks all env vars and files)
npm run verify

# Run database migrations
npm run db:migrate

# Start dev server
npm run dev
```

### 2. Testing Features

**Email OTP Testing:**
- Try registration or login with email OTP
- Check browser console (F12) for OTP code
- Or check server terminal for formatted OTP display

**Social Login:**
- If `GOOGLE_CLIENT_ID` and `FACEBOOK_CLIENT_ID` are set, buttons appear
- Redirect URIs must be configured in provider dashboards

**2FA Testing:**
- Add TOTP authenticator or use backup codes
- QR code displays in browser
- Backup codes are shown after setup

**Multi-Session:**
- Login from multiple browser windows/tabs
- Switch between accounts on same device
- View all active sessions in Security page

### 3. Database Inspection

```bash
# Connect to database directly
psql $DATABASE_URL

# Common queries:
# \dt - list all tables
# SELECT * FROM "user" - view all users
# SELECT * FROM "session" - view active sessions
```

## Deployment

### Vercel Deployment

1. **Connect repository to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository

2. **Set environment variables in Vercel:**
   - Go to project settings → Environment Variables
   - Add all required and optional variables

3. **Deploy:**
   ```bash
   git push origin main
   ```
   Vercel automatically builds and deploys

4. **Verify deployment:**
   - Visit your Vercel URL
   - Check application logs for errors
   - Test login and OAuth flows

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
CMD ["npm", "start"]
```

```bash
docker build -t hasem .
docker run -e DATABASE_URL=... -e BETTER_AUTH_SECRET=... -p 3000:3000 hasem
```

### Manual VPS Deployment

```bash
# On server:
git clone <repo>
cd hasem
npm install
npm run build

# Set environment variables
export BETTER_AUTH_SECRET=...
export DATABASE_URL=...
export BETTER_AUTH_URL=https://yourdomain.com

# Start with process manager (pm2, systemd, etc.)
npm start
```

## Troubleshooting

**Environment variable not found:**
```bash
# Make sure .env.local exists
ls -la .env.local

# Verify variable is set
echo $BETTER_AUTH_SECRET

# Restart dev server after adding variables
npm run dev
```

**Database connection refused:**
```bash
# Test connection directly
psql $DATABASE_URL

# If fails, check:
# 1. DATABASE_URL is correct
# 2. PostgreSQL is running
# 3. Network connectivity to database host
```

**OTP codes not displaying:**
```bash
# Development: Codes appear in:
# 1. Browser console (F12 → Console)
# 2. Server terminal (where npm run dev runs)

# Check server logs:
npm run dev 2>&1 | grep "OTP\|EMAIL"
```

**Session expires immediately:**
```bash
# Verify secret hasn't changed
echo $BETTER_AUTH_SECRET

# Clear browser cookies and try again
# Check BETTER_AUTH_URL matches your domain
```

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more issues and solutions.
