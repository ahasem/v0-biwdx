# Hasem - Architecture Documentation

## Overview

Hasem is a sophisticated authentication and organization management system built with Next.js 16, better-auth, Drizzle ORM, and Neon PostgreSQL. The application follows modern security practices and provides a comprehensive feature set for managing users, organizations, teams, and security settings.

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **Authentication**: better-auth v1.6.5
- **Database ORM**: Drizzle ORM v0.45.2
- **Database**: Neon PostgreSQL (serverless)
- **Validation**: Zod v3.24.1 with z.email()
- **Styling**: Tailwind CSS v4 with shadcn/ui
- **Animations**: Framer Motion 12.x
- **State Management**: React hooks with SWR patterns
- **Form Management**: React Hook Form
- **Icons**: Lucide React

## Database Schema

### Core Tables

**users**
- Stores user account information (id, email, name, createdAt)
- Core table referenced by most other tables

**accounts**
- Links external authentication providers to users
- Supports OAuth providers (Google, Facebook)
- Stores provider-specific data and credentials

**sessions**
- Manages active user sessions
- Tracks device information, IP, user agent
- Enables session management and device authorization

**verificationTokens**
- Stores temporary verification tokens
- Used for email verification, password reset, OTP
- Auto-cleanup based on expiration

**passpasses (Passkeys)**
- Stores WebAuthn passkey data for each user
- Enables passwordless authentication
- Tracks passkey metadata and creation date

**twoFactors**
- Stores 2FA configuration for users
- Tracks TOTP secret and backup codes
- Enables 2FA setup and verification

**deviceAuthorizations**
- Tracks authorized devices per user
- Stores device fingerprints and trust status
- Manages device-based security policies

**organizations**
- Represents organizations/workspaces
- Stores org metadata (name, slug)
- Supports multiple organizations per user

**organizationMembers**
- Links users to organizations with roles
- Tracks member roles (owner, admin, member)
- Manages member permissions

**teams**
- Represents teams within organizations
- Belongs to an organization
- Manages team-specific settings

**teamMembers**
- Links users to teams with roles
- Enables team-based collaboration
- Tracks team-specific permissions

**invitations**
- Stores pending member invitations
- Tracks invitation status and expiration
- Enables invitation reminder and cancellation

## API Architecture

### Middleware (`proxy.ts`)

The proxy.ts file serves as the central API routing middleware:
- Routes auth requests to better-auth handlers
- Protects routes that require authentication
- Handles CSRF protection
- Manages session validation

### API Routes

#### Authentication Routes
- `GET /api/auth/[...all]` - Better-auth core endpoints
  - Handles login, registration, OAuth, session management
  - All routes managed by better-auth library

#### Session Management
- `GET /api/auth/sessions` - List user sessions
  - Retrieves all active sessions for current user
  - Includes device information and timestamps
- `POST /api/auth/revoke-session` - Revoke specific session
  - Deletes session by ID
  - Logs out user from that device immediately

#### Organization Management
- `GET /api/organizations` - List user organizations
  - Returns organizations where user is a member
  - Includes member role and permissions
- `POST /api/organizations` - Create new organization
  - Creates organization and adds creator as owner
  - Validates organization name and slug uniqueness
- `GET /api/organizations/[id]/invitations` - List invitations
  - Returns pending invitations for organization
  - Filters by status and expiration
- `POST /api/organizations/[id]/invitations` - Send invitation
  - Creates invitation for new member
  - Logs where email should be sent
  - Sets 7-day expiration

## Authentication Flow

### Email OTP Registration
1. User enters email on register page
2. System generates 6-digit OTP code
3. **Console logs OTP** (email sending commented out with TODO)
4. User enters OTP to verify email
5. User creates password and account
6. Account created, user redirected to login

### Credential Login
1. User enters email and password
2. System validates credentials
3. If 2FA enabled, redirects to 2FA page
4. If passkey available, shows passkey option
5. Creates session upon successful auth
6. Redirects to dashboard

### 2FA (TOTP) Login
1. User completes credential login
2. Redirected to 2FA page
3. User enters TOTP code from authenticator app
4. Alternative: User enters backup code
5. Session created if valid
6. Sets device as trusted (optional)

### Social Login (OAuth)
1. User clicks Google or Facebook button
2. Redirected to provider's consent screen
3. User approves application permissions
4. Returned to app with auth code
5. better-auth exchanges code for tokens
6. Account linked or new account created
7. Session established

### Passkey Authentication
1. User selects "Sign in with Passkey"
2. Browser's WebAuthn API called
3. User verifies with biometric or PIN
4. Passkey credential verified
5. Session created if valid
6. Dashboard access granted

## Security Components

### Session Management (`/security/sessions`)
- Lists all active sessions with device info
- Shows login time, last activity, device type, IP
- Allows individual session revocation
- Logout all devices feature

### Password Management (`/security`)
- Change password with current password verification
- Password strength validation
- Invalidates all sessions after password change
- Secures account from unauthorized changes

### 2FA Setup (`/security/backup-codes`)
- TOTP configuration with QR code
- Manual key entry option
- Generates 10 backup codes
- Codes downloadable as text file

### Passkey Management (`/security/passkeys`)
- Register new passkeys/security keys
- List all registered passkeys
- Delete passkeys individually
- Rename/label passkeys for identification

### Linked Accounts (`/security/linked-accounts`)
- View all connected authentication methods
- Link new OAuth providers
- Unlink existing connections
- Maintain multiple login methods

## Organization & Team Management

### Organization Flow
1. User creates organization from `/organizations`
2. Organization created with user as owner
3. User can invite members via email
4. Invited users can join organization
5. Owner manages member roles and permissions

### Team Flow
1. Owner/admin creates team within organization
2. Team assigned to organization
3. Members can be added to team
4. Teams enable sub-group collaboration
5. Team-specific permissions and settings

### Member Roles

**Owner**
- Full organization control
- Can manage all members
- Can delete organization
- Can configure settings

**Admin**
- Member management
- Can invite/remove members
- Can create teams
- Cannot delete organization

**Member**
- Access organization resources
- Can view team members
- Limited settings access
- Cannot manage other members

## File Structure Details

### Components Organization

**`/components/auth`**
- `login-form.tsx` - Email/password login form with OTP fallback
- `register-form.tsx` - Registration with email verification
- `otp-input.tsx` - 6-digit OTP input component with auto-focus
- `two-factor-form.tsx` - 2FA TOTP/backup code entry
- `social-login.tsx` - Google/Facebook OAuth buttons
- `passkey-button.tsx` - WebAuthn passkey authentication

**`/components/security`**
- `password-form.tsx` - Change password form with validation
- `passkey-manager.tsx` - Register, list, delete passkeys
- `two-factor-setup.tsx` - TOTP setup with QR code
- `backup-codes.tsx` - Display, download backup codes
- `session-card.tsx` - Display session info with revoke button
- `linked-accounts.tsx` - List and manage OAuth connections

**`/components/organizations`**
- `org-switcher.tsx` - Dropdown to switch organizations
- `team-switcher.tsx` - Dropdown to switch teams
- `invitation-dialog.tsx` - Send member invitations
- `member-table.tsx` - List and manage members
- `invitation-list.tsx` - Pending invitations with actions
- `org-form.tsx` - Create/edit organization details

**`/components/layout`**
- `header.tsx` - Main navigation header
- `user-dropdown.tsx` - User menu with profile/settings/logout
- `theme-toggle.tsx` - Dark mode toggle with system preference

### Page Routes

**`/(auth)`** - Unauthenticated routes
- `/login` - Email/password login
- `/register` - New account creation
- `/verify-email` - Email verification after signup
- `/two-factor` - 2FA challenge during login
- `/forgot-password` - Password reset request
- `/reset-password` - Complete password reset

**`/(dashboard)`** - Protected routes
- `/dashboard` - Main dashboard overview
- `/profile` - User profile (name, email)
- `/security` - Security hub with sub-routes:
  - `/passkeys` - Passkey management
  - `/backup-codes` - 2FA backup codes
  - `/sessions` - Active session management
  - `/linked-accounts` - OAuth connections
- `/organizations` - List user organizations
- `/organizations/[id]` - Organization detail
- `/organizations/[id]/members` - Member management
- `/organizations/[id]/invitations` - Invitation management
- `/organizations/[id]/teams` - Team management

## State Management

### Session State
- Managed by better-auth
- Stored in HTTP-only cookies
- Client-side caching with SWR patterns
- Automatic refresh on expiration

### User State
- Fetched from session on app load
- Cached in React context when needed
- Invalidated on logout
- Re-fetched on page refresh

### Organization State
- Fetched from API on demand
- Cached per organization ID
- Updated when switching orgs
- Cleared on org deletion

## Animations & Transitions

All animations use Framer Motion with predefined variants in `lib/animations.ts`:

- **containerVariants**: Stagger animation for parent containers
- **itemVariants**: Fade-in animation for child items
- **slideUpVariants**: Slide up from bottom
- **scaleVariants**: Scale in animation
- **pageTransition**: Page route transitions

## Error Handling

- API errors caught and logged with `[v0]` prefix
- User-friendly error messages via toast notifications
- Validation errors shown inline on forms
- 401 errors redirect to login
- 403 errors show permission denied message

## Performance Optimizations

- Next.js 16 automatic code splitting
- Dynamic imports for large components
- Image optimization with next/image
- CSS-in-JS optimization via Tailwind
- SWR for efficient data fetching with caching
- Request deduplication and revalidation

## Security Considerations

### Data Protection
- All sensitive data encrypted in transit (HTTPS)
- Passwords hashed with bcrypt
- OTP codes expire after 15 minutes
- Session tokens are HTTP-only cookies
- CSRF tokens on state-changing requests

### Access Control
- Proxy middleware validates authentication
- Role-based access control (RBAC) in organizations
- Organization members table for permission checks
- Team-based access within organizations

### Rate Limiting
- Authentication endpoints rate limited
- Prevents brute force attacks
- Per-IP tracking for login attempts
- Exponential backoff on repeated failures

### Audit Trail
- Session creation/deletion logged
- Member invitations tracked with timestamps
- Password changes recorded
- 2FA configuration changes logged

## Deployment Checklist

- [ ] Set all required environment variables
- [ ] Generate strong BETTER_AUTH_SECRET
- [ ] Configure OAuth providers (Google, Facebook)
- [ ] Setup email service (Nodemailer, SendGrid, etc)
- [ ] Run database migrations
- [ ] Test all authentication flows
- [ ] Verify 2FA setup and backup codes
- [ ] Test organization/team features
- [ ] Configure custom domain and SSL
- [ ] Enable database backups
- [ ] Setup monitoring and logging
- [ ] Configure rate limiting rules
- [ ] Enable CORS if needed for APIs

## Future Enhancements

- WebAuthn resident keys for passwordless auth
- FIDO2 security key support
- SMS-based OTP
- Risk-based authentication
- Session anomaly detection
- API key management
- Audit log export
- Custom branding per organization
- Single sign-on (SSO) integration
- Advanced team hierarchies

## Troubleshooting Guide

See [SETUP.md](./SETUP.md) for environment variable issues and [README.md](./README.md) for general troubleshooting.
