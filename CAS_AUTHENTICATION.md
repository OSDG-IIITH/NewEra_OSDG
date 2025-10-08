# CAS Authentication Setup Guide

This guide explains how to set up and use the CAS (Central Authentication Service) authentication system integrated into the OSDG website.

## Overview

The CAS authentication system allows users to log in using their IIIT Hyderabad credentials. It's based on the authentication flow from the Discord-CAS project but adapted for web use.

## Files Structure

```
src/
├── app/
│   ├── api/auth/
│   │   ├── cas/
│   │   │   ├── login/route.ts          # Initiates CAS login
│   │   │   └── callback/route.ts       # Handles CAS callback
│   │   ├── user/route.ts              # Get current user info
│   │   └── logout/route.ts            # Logout endpoint
│   └── login/page.tsx                 # Login page UI
├── components/
│   ├── AuthWidget.tsx                 # Combined login/profile widget
│   ├── LoginButton.tsx               # Login button component
│   └── UserProfile.tsx               # User profile display
└── contexts/
    └── AuthContext.tsx               # Authentication state management
```

## Environment Variables

Create a `.env.local` file in the root directory with:

```bash
# CAS Server Configuration
CAS_BASE_URL=https://cas.iiit.ac.in

# Next.js Site Configuration  
NEXTAUTH_URL=http://localhost:3000

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Environment
NODE_ENV=development
```

## How It Works

### 1. Authentication Flow

1. User clicks "Login with IIIT CAS" button
2. System redirects to `/api/auth/cas/login`
3. API redirects to CAS server with service URL
4. User authenticates on CAS server
5. CAS redirects back to `/api/auth/cas/callback` with ticket
6. System validates ticket with CAS server
7. If valid, creates JWT session and sets secure cookie
8. User is redirected to the intended page

### 2. User Data

The system extracts the following data from CAS:
- `username`: IIIT username
- `name`: Full name
- `email`: Email address
- `rollno`: Roll number (if available)

### 3. Session Management

- Sessions are stored as JWT tokens in secure HTTP-only cookies
- Tokens expire after 24 hours
- Users can logout, which clears the session and redirects to CAS logout

## Usage

### Using the Authentication Context

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, loading, login, logout } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (user) {
    return (
      <div>
        <p>Welcome, {user.name}!</p>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }
  
  return <button onClick={() => login()}>Login</button>;
}
```

### Using Components

```tsx
import AuthWidget from '@/components/AuthWidget';
import LoginButton from '@/components/LoginButton';

// Complete authentication widget (shows login button or user profile)
<AuthWidget />

// Just the login button
<LoginButton returnTo="/dashboard" />
```

## API Endpoints

- `GET /api/auth/cas/login?returnTo=/path` - Initiate CAS login
- `GET /api/auth/cas/callback` - Handle CAS callback (internal)
- `GET /api/auth/user` - Get current user information
- `POST /api/auth/logout` - Logout user

## Security Features

- JWT tokens with secure signing
- HTTP-only cookies (cannot be accessed by JavaScript)
- Secure cookies in production
- CSRF protection through SameSite cookie attribute
- Token expiration (24 hours)
- Proper CAS ticket validation

## Development

1. Install dependencies:
   ```bash
   npm install jose
   ```

2. Set up environment variables in `.env.local`

3. Start development server:
   ```bash
   npm run dev
   ```

4. Test login at: http://localhost:3000/login

## Production Deployment

1. Update `NEXTAUTH_URL` to your production domain
2. Generate a secure `JWT_SECRET`
3. Ensure `NODE_ENV=production`
4. Configure your web server to handle the authentication routes

## Troubleshooting

### Common Issues

1. **CAS validation fails**: Check that `CAS_BASE_URL` is correct
2. **JWT errors**: Ensure `JWT_SECRET` is set and consistent
3. **Redirect loops**: Verify `NEXTAUTH_URL` matches your domain
4. **Cookie issues**: Check secure/sameSite settings in production

### Debug Mode

Enable debug logging by adding console.log statements in the callback route to see CAS responses.

## Integration with Discord-CAS

This implementation is compatible with the Discord-CAS project structure:
- Uses the same CAS server endpoint
- Extracts the same user attributes
- Follows similar authentication patterns
- Can be extended to integrate with Discord bot features

## Future Enhancements

- Database storage for persistent sessions
- Role-based access control
- Integration with Discord server verification
- Admin panel for user management
- Audit logging for security