# Hasem - Advanced Authentication System

A sophisticated Next.js 16 application with comprehensive authentication, featuring email OTP verification, 2FA with backup codes, passkey support, social login (Google/Facebook), organization and team management, multi-session support, and complete session management.

## Status

✅ **All environment variables configured** (BETTER_AUTH_SECRET, DATABASE_URL, OAuth)
✅ **Better Auth fully integrated** with all plugins enabled
✅ **Multi-session support** for multiple active sessions per device
✅ **Last login method tracking** for authentication flow optimization
✅ **Dynamic base URL** with wildcard patterns for flexible deployments
✅ **Comprehensive documentation** - SETUP, ARCHITECTURE, TROUBLESHOOTING guides

## Quick Start

```bash
# 1. Copy environment template
cp .env.example .env.local

# 2. Update required variables:
#    - BETTER_AUTH_SECRET (generate: openssl rand -base64 32)
#    - DATABASE_URL (your Neon PostgreSQL URL)
#    - BETTER_AUTH_URL (http://localhost:3000 for dev)

# 3. Verify setup
npm run verify

# 4. Start development server
npm run dev

# 5. Open http://localhost:3000
```

The startup verification automatically validates all requirements before starting.

## Features

### Authentication Methods
- **Email OTP**: Registration, login, password reset (console-logged in dev)
- **Credential Login**: Email & password authentication
- **Passkeys**: WebAuthn passwordless authentication
- **Social OAuth**: Google and Facebook login
- **2FA**: TOTP with 10 backup codes
- **Device Authorization**: Track trusted devices
- **Multi-Session**: Multiple concurrent sessions on same device (up to 5)

### Security Features
- **Session Management**: List, revoke, and logout all active sessions
- **Last Login Method**: Tracks and optimizes auth flow based on last login method
- **Multi-Session Switching**: Switch between linked accounts on same device
- **Password Management**: Change password with verification
- **Passkey Management**: Register, list, and delete passkeys
- **Backup Codes**: Generate and manage recovery codes
- **Linked Accounts**: Connect multiple OAuth providers

### User Experience
- **Profile Management**: Update first/last name and email
- **Dashboard**: Account overview with quick actions
- **User Dropdown**: Advanced options and navigation
- **Dark Mode**: System preference detection + manual toggle
- **Org/Team Switcher**: Quick switching in header
- **Responsive Design**: Mobile-first responsive layout

### Organizations & Teams
- **Organization Management**: Create and manage organizations
- **Team Management**: Create teams within organizations
- **Role-Based Access**: Owner, admin, member roles
- **Member Invitations**: Send, remind, cancel invitations
- **Member Management**: Add/remove members with roles

### Developer Experience
- **Dynamic Base URL**: Automatic origin detection
- **Wildcard Patterns**: Works with *.vercel.app, *.vusercontent.net, localhost
- **OTP Console Logging**: Development-friendly OTP display
- **Email Integration Points**: Clear comments for email service setup
- **Startup Verification**: Automatic validation before dev starts
- **Comprehensive Docs**: Complete setup and troubleshooting guides

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, Framer Motion |
| **UI** | shadcn/ui, Tailwind CSS v4, Radix UI |
| **Auth** | Better Auth v1.6.5 with plugins |
| **Database** | Neon PostgreSQL, Drizzle ORM |
| **Validation** | Zod with email validation |
| **State** | React hooks, SWR |

## Project Structure

```
app/
├── (auth)/                     # Authentication routes
│   ├── login/
│   ├── register/
│   ├── verify-email/           # OTP verification
│   ├── two-factor/             # 2FA login
│   ├── forgot-password/
│   └── reset-password/
├── (dashboard)/                # Protected routes
│   ├── dashboard/              # Home
│   ├── profile/                # User profile
│   ├── security/               # Security settings
│   │   ├── passkeys/           # Passkey management
│   │   ├── sessions/           # Session management + multi-session
│   │   ├── backup-codes/       # 2FA backup codes
│   │   └── linked-accounts/    # OAuth providers
│   └── organizations/          # Org management
│       └── [id]/
│           ├── members/
│           ├── invitations/
│           └── teams/
└── api/
    ├── auth/[...all]/          # Better Auth handler
    ├── auth/sessions/          # Session APIs
    └── organizations/          # Organization APIs

components/
├── auth/                       # Authentication forms
├── security/                   # Security components
├── organizations/              # Org management
└── layout/                     # Layout & navigation

lib/
├── auth.ts                     # Better Auth config
├── auth-client.ts              # Client utilities
├── db/
│   ├── schema.ts              # Database schema
│   └── index.ts               # Drizzle connection
├── validators.ts               # Zod schemas
├── animations.ts               # Framer Motion
└── env.ts                      # Environment validation
```

## Environment Variables

### Required
```env
# Database
DATABASE_URL=postgresql://...

# Authentication
BETTER_AUTH_SECRET=<openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:3000

# Client-side
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

### Optional (for social login)
```env
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
FACEBOOK_CLIENT_ID=xxx
FACEBOOK_CLIENT_SECRET=xxx
```

See [SETUP.md](./SETUP.md) for detailed configuration instructions.

## Database Schema

The application includes 12 core tables:
- `user` - User accounts with lastLoginMethod tracking
- `account` - OAuth provider accounts
- `session` - Active sessions
- `verificationToken` - Email verification tokens
- `device` - Trusted devices
- `passkey` - WebAuthn credentials
- `twoFactor` - 2FA configuration
- `organization` - Organizations
- `organizationMember` - Organization members
- `team` - Teams within organizations
- `teamMember` - Team members
- `invitation` - Pending invitations

All tables are automatically created during migration.

## Getting Started

### Installation
```bash
npm install
# or
pnpm install
```

### Database Setup
```bash
# Run migrations to create schema
npm run db:migrate
```

### Development
```bash
# Verify setup (checks env vars, files, config)
npm run verify

# Start dev server with auto-verification
npm run dev
```

Visit `http://localhost:3000` to start.

### Testing Features

**Email OTP:**
- Try registration or login with email
- OTP appears in browser console (F12) and server terminal

**Multi-Session:**
- Login from multiple browser tabs
- View linked accounts in Security → Sessions
- Switch between accounts or remove them

**2FA:**
- Enable TOTP in Security settings
- Use authenticator app or backup codes
- All codes validated server-side

**Social Login:**
- Google/Facebook buttons appear if credentials set
- Automatic account linking for same email

## Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup and environment configuration
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical architecture and design patterns
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[.env.example](./.env.example)** - All environment variables reference

## Email Integration

In development, OTP codes and invitation URLs are logged to console. For production, update the email functions in `lib/auth.ts`:

**Supported Services:**
- Nodemailer (SMTP)
- SendGrid
- Resend
- AWS SES
- Mailgun

Look for `TODO: Send email` comments in the code.

## Security Best Practices

- OTP codes expire after 10 minutes
- Passwords hashed with bcrypt
- Session tokens in secure HTTP-only cookies
- CSRF protection enabled
- Rate limiting on auth endpoints
- Dynamic origin validation
- Secure passkey configuration
- Multi-session device tracking

## API Endpoints

### Authentication
- `POST /api/auth/[...all]` - All Better Auth routes

### Sessions
- `GET /api/auth/sessions` - List user's sessions
- `POST /api/auth/revoke-session` - Revoke a session

### Organizations
- `GET /api/organizations` - List user's organizations
- `POST /api/organizations` - Create organization
- `POST /api/organizations/[id]/invitations` - Send invitation

## Deployment

### Vercel (Recommended)
```bash
# 1. Connect GitHub repo to Vercel
# 2. Add environment variables in project settings
# 3. Push to main branch - automatic deployment
```

### Docker
```bash
docker build -t hasem .
docker run -e DATABASE_URL=... -e BETTER_AUTH_SECRET=... -p 3000:3000 hasem
```

### Manual VPS
```bash
npm install
npm run build
npm start
```

See [SETUP.md](./SETUP.md) for detailed deployment instructions.

## Troubleshooting

### OTP Not Showing
- Check browser console (F12 → Console)
- Check server terminal where `npm run dev` runs

### Database Connection Failed
- Verify `DATABASE_URL` in `.env.local`
- Run `npm run db:migrate` to create schema

### Session Expires Immediately
- Verify `BETTER_AUTH_SECRET` is set and unchanged
- Clear browser cookies and session storage

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more solutions.

## License

MIT

## Support

Refer to the documentation files or create an issue in the repository.
