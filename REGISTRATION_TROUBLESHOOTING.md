# Comprehensive Registration Troubleshooting Guide

## Quick Diagnosis Flowchart

```
Registration Fails
    ↓
Check Browser Console (F12)
    ├─ Network Error? → Check Server Connection
    ├─ Validation Error? → Check Input Validation
    ├─ Database Error? → Check Database Migration
    └─ Auth Error? → Check Auth Configuration
```

## Critical Issue: Database Migration Not Run

### Symptom
```
Error: relation "user" does not exist at character 8
NeonDbError: relation "user" does not exist
```

### Root Cause
The database schema hasn't been created. Better Auth and Drizzle need the tables to be initialized before any registration can occur.

### Solution
Run the database migration script:

```bash
# Option 1: Using Node directly (recommended)
node scripts/migrate.ts

# Option 2: Using Drizzle CLI (if installed)
pnpm exec drizzle-kit push:pg

# Option 3: Manual PostgreSQL
# Connect to your Neon database and copy SQL from scripts/migrate.ts
```

### For the User buildw3@gmail.com
When this user attempts to register with password `Allah786#@`, the registration will fail at the database insertion step with `relation "user" does not exist` if migrations haven't run. After running the migration:
1. The `user` table is created with all required columns
2. The registration flow can proceed normally
3. The user's account will be stored in the database

---

## Common Registration Failure Scenarios

### 1. Input Validation Errors

#### Email Validation Failure

**Error Messages:**
```
"Please enter a valid email address"
"Invalid email format"
Email validation failed
```

**Common Causes:**
- Missing @ symbol
- Space in email address
- No domain extension
- Invalid characters (except + and -)

**Example Test Cases:**
```
✗ buildw3@gmail (missing domain)
✗ buildw3 @gmail.com (space in email)
✗ buildw3@gmail..com (consecutive dots)
✗ buildw3@@gmail.com (double @)
✓ buildw3@gmail.com (correct - used for testing)
✓ buildw3+tag@gmail.com (valid with +)
```

**Diagnosis Steps:**
1. Open browser DevTools → Console
2. Look for validation error messages
3. Check the email input field - it should show a red border
4. Verify the email format matches RFC 5322 standard

**Fix:**
```javascript
// Validation schema in lib/validators.ts
export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// Test with valid email
console.log(registerSchema.parse({ 
  email: "buildw3@gmail.com" 
})); // ✓ Valid
```

---

#### Password Validation Failure

**Error Messages:**
```
"Password must be at least 8 characters"
"Password is too weak"
"Password must contain special characters"
```

**Password Requirements:**
- Minimum 8 characters
- No maximum length restriction
- Can contain any characters (special, uppercase, lowercase, numbers)

**Example Test Cases:**
```
✗ pass123 (only 8 chars, but commonly rejected)
✗ Pass@12 (7 chars - too short)
✗ passwrd (7 chars - too short)
✓ Allah786#@ (13 chars - meets requirements)
✓ MyP@ssw0rd (10 chars - valid)
✓ SecurePassword123! (18 chars - valid)
```

**Diagnosis Steps:**
1. Check password length: `password.length >= 8`
2. Look for client-side validation messages
3. Check browser console for validation errors
4. Verify no special character restrictions

**Fix - Specific to buildw3/Allah786#@:**
```javascript
// Password "Allah786#@" analysis:
const password = "Allah786#@";
console.log("Length:", password.length); // 10 ✓
console.log("Has uppercase:", /[A-Z]/.test(password)); // Yes ✓
console.log("Has lowercase:", /[a-z]/.test(password)); // Yes ✓
console.log("Has numbers:", /[0-9]/.test(password)); // Yes ✓
console.log("Has special:", /[!@#$%^&*]/.test(password)); // Yes ✓
// All requirements met - password should pass validation
```

---

### 2. Server-Side Database Errors

#### Error: "relation 'user' does not exist"

**Root Cause:**
Database migration hasn't been run.

**Log Signature:**
```
NeonDbError: relation "user" does not exist at character 8
    at Connection.parseE (...neon.ts:123)
    at Protocol._enqueue (...neon.ts:45)
```

**Affected Credentials:**
When user tries: `buildw3@gmail.com` / `Allah786#@`

**Complete Fix Process:**

1. **Check if migration was run:**
   ```bash
   # Test database connection
   psql $DATABASE_URL -c "\dt" # List tables
   ```

2. **Run migration if tables don't exist:**
   ```bash
   node scripts/migrate.ts
   ```

3. **Verify tables were created:**
   ```bash
   psql $DATABASE_URL -c "\dt public.*"
   # Should show: user, account, session, verification_token, etc.
   ```

4. **Retry registration:**
   User can now register with `buildw3@gmail.com` / `Allah786#@`

---

#### Error: "duplicate key value violates unique constraint"

**Root Cause:**
Email already exists in database.

**Error Message:**
```
NeonDbError: duplicate key value violates unique constraint "user_email_key"
```

**Diagnosis:**
1. Check if user previously registered with this email
2. Verify you're not re-registering same email in same test session
3. Use a different email for testing

**Solution:**
```bash
# Check existing users
psql $DATABASE_URL -c "SELECT email FROM \"user\";"

# Delete a specific user if needed (dev only)
psql $DATABASE_URL -c "DELETE FROM \"user\" WHERE email='buildw3@gmail.com';"
```

---

#### Error: "connection refused" or "ECONNREFUSED"

**Root Cause:**
Database server is not accessible or `DATABASE_URL` is invalid.

**Log Pattern:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
or
NeonDbError: getaddrinfo ENOTFOUND neon.tech
```

**Diagnosis:**
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Verify environment variable
echo $DATABASE_URL

# Check if URL has protocol
# Should be: postgresql://user:pass@host/db
```

**Fix:**
1. Verify DATABASE_URL is set correctly
2. Check PostgreSQL is running (if local)
3. Check network connectivity to Neon
4. Verify credentials are correct

---

### 3. API Endpoint Errors

#### Error: "POST /api/auth/register 404 Not Found"

**Root Cause:**
Better Auth API route isn't properly configured.

**Check:**
```bash
# Verify route exists
ls -la app/api/auth/\[...all\]/route.ts
```

**Fix:**
Ensure the auth route handler exports both GET and POST:
```typescript
export const { POST, GET } = handle(auth);
```

---

#### Error: "POST /api/auth/register 500 Internal Server Error"

**Root Cause:**
Server-side error during registration processing.

**Diagnosis:**
1. Check browser Network tab → Response
2. Check server console for error stack trace
3. Look for specific error messages

**Common Causes:**
- `BETTER_AUTH_SECRET` not set
- `BETTER_AUTH_URL` invalid or missing
- Environment variables not loaded
- Database connection failed
- Email sending failed (if enabled)

**Fix:**
```bash
# Verify required environment variables
echo "SECRET: $BETTER_AUTH_SECRET"
echo "URL: $BETTER_AUTH_URL"
echo "DB: $DATABASE_URL"

# All should have values, not be empty
```

---

### 4. Email OTP Issues

#### Symptom: "Email failed to send" or "OTP not received"

**Root Cause:**
Email service not configured (expected in development).

**In Development:**
OTP codes are logged to console, not sent via email:

```javascript
// Locate OTP in browser console (F12)
// Or in server terminal where npm run dev is running
// You'll see:
// ════════════════════════════════════════════════════════════════
// 📧 EMAIL OTP
// ════════════════════════════════════════════════════════════════
// Email: buildw3@gmail.com
// Code: 123456
// Expires: 2026-04-17T10:30:00Z
// Type: email_verification
// ════════════════════════════════════════════════════════════════
```

**Diagnosis:**
1. Check browser console (F12 → Console tab)
2. Check terminal where `npm run dev` runs
3. Search for "OTP" or the email address

**For Production:**
Configure email service in `lib/auth.ts`:

```typescript
// Look for: TODO: Send email
// Replace console.log with email service call

// Example: Using Resend
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: "onboarding@resend.dev",
  to: email,
  subject: "Verify your email",
  html: `Your verification code: ${code}`,
});
```

---

### 5. Client-Side JavaScript Errors

#### Error: "Cannot read property 'email' of undefined"

**Root Cause:**
Form data not properly collected or submitted.

**Diagnosis:**
```javascript
// Add debug logging in register form
console.log("[v0] Form data:", formData);
console.log("[v0] Email:", formData?.email);
console.log("[v0] Password:", formData?.password);
```

**Fix:**
Ensure form submission is working:
```javascript
// In register-form.tsx
const handleSubmit = async (values: RegisterInput) => {
  console.log("[v0] Submitting:", values);
  // ... rest of submission logic
};
```

---

#### Error: "Response is not JSON" or "Failed to parse response"

**Root Cause:**
Server returned HTML error page instead of JSON.

**Diagnosis:**
1. Network tab → select POST request
2. Response tab shows HTML (not JSON)
3. Check server logs for errors

**Fix:**
Look for actual server error in console and fix it first.

---

### 6. Account Restrictions & State Issues

#### Error: "Email already verified"

**Cause:**
User already has an account with this email.

**Solution:**
- Use a different email for testing
- Or delete the previous account via database

---

#### Error: "Too many requests" or Rate Limit

**Cause:**
Multiple registration attempts in short time.

**Solution:**
Wait before retrying (default: 60 seconds).

---

## Testing Registration with buildw3@gmail.com / Allah786#@

### Complete Test Flow

**Step 1: Pre-Flight Checks**
```bash
# Check database is ready
psql $DATABASE_URL -c "\dt"

# Check environment variables
echo $BETTER_AUTH_SECRET
echo $DATABASE_URL
echo $BETTER_AUTH_URL
```

**Step 2: Clear Previous Test Data (if needed)**
```bash
psql $DATABASE_URL -c "DELETE FROM \"user\" WHERE email='buildw3@gmail.com';"
```

**Step 3: Navigate to Registration**
1. Open http://localhost:3000/register
2. Enter email: `buildw3@gmail.com`
3. Enter password: `Allah786#@`
4. Enter name fields
5. Click Register

**Step 4: Monitor for Errors**

Open browser DevTools (F12) and check:
- **Console tab:** For any JavaScript errors
- **Network tab:** For API requests/responses
- **Application tab:** For cookies/session storage

**Step 5: Expected Success Flow**
```
1. Form validates inputs ✓
2. POST /api/auth/register is called
3. User record created in database
4. Session is established
5. Redirected to email verification page
6. OTP is logged to console
7. User enters OTP to verify email
8. Account is activated
9. Redirected to dashboard
```

---

## Debugging Checklist

### Before Registration
- [ ] Database tables exist (`\dt` shows tables)
- [ ] `DATABASE_URL` is set and valid
- [ ] `BETTER_AUTH_SECRET` is set
- [ ] `BETTER_AUTH_URL` is set with protocol
- [ ] Server is running (`npm run dev`)
- [ ] No TypeScript compilation errors

### During Registration
- [ ] Email passes validation (contains @, domain)
- [ ] Password is at least 8 characters
- [ ] Form submission doesn't show validation errors
- [ ] Network request shows 200/201 status

### After Registration
- [ ] User appears in database: `SELECT * FROM "user";`
- [ ] Session is created: `SELECT * FROM "session";`
- [ ] Redirected to email verification page
- [ ] OTP is visible in console

---

## Common Error Messages & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `relation "user" does not exist` | Migration not run | Run `node scripts/migrate.ts` |
| `duplicate key value` | Email already exists | Use different email or delete user |
| `ECONNREFUSED` | Database unreachable | Check DATABASE_URL and connection |
| `EMAIL_ALREADY_EXISTS` | Account already created | Use unique email |
| `INVALID_EMAIL` | Email format wrong | Check email includes @ and domain |
| `PASSWORD_TOO_SHORT` | Password < 8 chars | Password must be 8+ characters |
| `SECRET_NOT_SET` | BETTER_AUTH_SECRET missing | Set in .env.local |
| `url.startsWith is not a function` | Invalid BETTER_AUTH_URL | Ensure it starts with http:// or https:// |

---

## Prevention Best Practices

1. **Always run migrations on setup:**
   ```bash
   node scripts/migrate.ts
   ```

2. **Verify environment before starting:**
   ```bash
   npm run verify
   ```

3. **Check logs during development:**
   - Keep browser DevTools open (F12)
   - Monitor server terminal for errors
   - Check for OTP codes in console

4. **Test with valid credentials:**
   - Email: Must be valid format
   - Password: At least 8 characters
   - Names: Not empty

5. **Use consistent test data:**
   ```javascript
   const testUser = {
     email: "buildw3@gmail.com",
     password: "Allah786#@",
     firstName: "Test",
     lastName: "User",
   };
   ```

---

## Related Documentation

- [SETUP.md](./SETUP.md) - Environment configuration
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - General troubleshooting
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
