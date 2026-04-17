## Troubleshooting Guide

This guide helps resolve common issues with the Hasem authentication application.

### Prerequisites Check

Before running the application, ensure:

1. **Node.js**: v18+ installed
2. **PostgreSQL**: Database connection configured
3. **Environment Variables**: All required variables set

### Common Issues and Solutions

#### 1. Missing BETTER_AUTH_SECRET

**Error**: `Error: Missing required environment variable: BETTER_AUTH_SECRET`

**Solution**:
- Generate a secure secret: `openssl rand -base64 32`
- Add to your `.env.local` file: `BETTER_AUTH_SECRET=<generated-secret>`
- Restart the development server

#### 2. Database Connection Failed

**Error**: `Error: connect ECONNREFUSED` or `Database connection failed`

**Solution**:
- Verify `DATABASE_URL` is correct in `.env.local`
- Ensure PostgreSQL is running
- Check network connectivity to database host
- Test connection with: `psql $DATABASE_URL`

#### 3. Better Auth Secret Not Recognized

**Error**: `Session validation failed` or `Invalid signature`

**Solution**:
- Verify `BETTER_AUTH_SECRET` is correctly set and persists across restarts
- Check that the secret hasn't changed (use same secret in all environments)
- Clear browser cookies and session storage
- Restart the development server

#### 4. Port Already in Use

**Error**: `Error: listen EADDRINUSE :::3000`

**Solution**:
- Kill process on port 3000: `lsof -ti:3000 | xargs kill -9`
- Or change port: `PORT=3001 npm run dev`

#### 5. OAuth Provider Not Working

**Error**: `Error: Invalid OAuth credentials` or `Provider not configured`

**Solution**:
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- Check OAuth credentials are for web application (not mobile/desktop)
- Verify redirect URI in provider settings matches `BETTER_AUTH_URL/callback`
- For development, ensure `localhost:3000` is in authorized origins

#### 6. OTP Not Showing in Console

**Error**: OTP emails not being sent, console logs not showing

**Solution**:
- Ensure you're looking at server-side logs (not browser console)
- Check that `NODE_ENV` is not production (OTP console logging is dev-only)
- Verify the email OTP endpoint is being hit: `/api/auth/email-otp/send-otp`
- Email integration points in `lib/auth.ts` show where to add your email service

#### 7. Session Not Persisting

**Error**: User gets logged out immediately after login

**Solution**:
- Verify `BETTER_AUTH_SECRET` is set and consistent
- Check browser cookie settings (allow third-party cookies)
- Verify `BETTER_AUTH_URL` is correct and accessible
- Check that `trustedOrigins` in `lib/auth.ts` includes current domain
- Clear browser cache and cookies

#### 8. Passkey Registration Fails

**Error**: `Invalid origin for passkey registration` or `WebAuthn not available`

**Solution**:
- Ensure HTTPS is enabled (required for passkeys in production)
- Check `BETTER_AUTH_URL` matches the actual domain
- For localhost development, passkeys use standard HTTP (automatically handled)
- Verify browser supports WebAuthn (Chrome, Firefox, Safari 13+, Edge)

### Startup Verification

When the app starts, you should see:

```
✓ Environment variables validated
✓ Database connected
✓ Better Auth initialized
✓ Ready on http://localhost:3000
```

If any of these fail:

1. Check the error message above the message
2. Verify the corresponding requirement in "Prerequisites Check"
3. Restart the development server after fixing

### Database Schema Verification

To verify the database schema was created correctly:

```bash
# Run migration script
pnpm exec ts-node scripts/migrate.ts

# Expected output:
# ✓ Created user table
# ✓ Created account table
# ✓ Created session table
# ✓ Created verification table
# ✓ Created device table
# ✓ Created passkey table
# ✓ Created two factor table
# ✓ Created organization table
# ✓ Created organization member table
# ✓ Created team table
# ✓ Created team member table
# ✓ Created invitation table
```

### Development Mode Features

- OTP codes are logged to console (replace with email service)
- Invitation URLs are logged to console (replace with email service)
- Session errors show detailed messages in browser console
- Database queries can be logged: Set `DATABASE_URL_LOG=true`

### Production Deployment

Before deploying to production:

1. **Generate new BETTER_AUTH_SECRET**: `openssl rand -base64 32`
2. **Set NODE_ENV=production**
3. **Use HTTPS for BETTER_AUTH_URL**
4. **Configure email service** (update sendVerificationOTP and sendInvitationEmail)
5. **Set up OAuth providers** with production URLs
6. **Test with Vercel Preview Deployment** first
7. **Verify all environment variables** in deployment platform
8. **Run database migrations** in production database
9. **Monitor application logs** for errors

### Getting Help

Check:
- [Better Auth Docs](https://better-auth.com)
- [Next.js Docs](https://nextjs.org/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- Application logs in browser DevTools
- Server logs in terminal running `npm run dev`

### Resetting the Application

To completely reset (clear all data):

```bash
# 1. Drop all tables
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# 2. Re-run migrations
pnpm exec ts-node scripts/migrate.ts

# 3. Clear browser data
# - DevTools → Application → Clear storage
# - Or use Ctrl+Shift+Delete (Windows) / Cmd+Shift+Delete (Mac)

# 4. Restart development server
npm run dev
```

**Warning**: This will delete all user data. Only do this in development!
