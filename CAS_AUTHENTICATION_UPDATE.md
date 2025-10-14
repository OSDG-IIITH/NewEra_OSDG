# CAS Authentication Update

## Summary
Updated CAS authentication implementation based on the working forms-portal project to use IIIT's official CAS server at `https://login.iiit.ac.in/cas`.

## Changes Made

### 1. Updated CAS Base URL
- **Old**: `https://cas.iiit.ac.in` (incorrect)
- **New**: `https://login.iiit.ac.in/cas` (correct IIIT CAS endpoint)

### 2. Login Route (`src/app/api/auth/cas/login/route.ts`)
- Updated CAS_BASE_URL to use `login.iiit.ac.in/cas`
- Changed NEXTAUTH_URL to NEXT_PUBLIC_SITE_URL for consistency
- Improved service URL construction to include returnTo parameter

### 3. Callback Route (`src/app/api/auth/cas/callback/route.ts`)
**Major improvements based on forms-portal:**
- **JSON Format**: Added `&format=JSON` to CAS serviceValidate request instead of parsing XML
- **Response Structure**: Updated to handle IIIT CAS JSON response format:
  ```typescript
  {
    serviceResponse: {
      authenticationSuccess: {
        attributes: {
          uid: string[],
          Name: string[],
          'E-Mail': string[]
        }
      }
    }
  }
  ```
- **Better Error Handling**: Check for authenticationFailure in response
- **Service URL Matching**: Service URL in validation matches the one sent to login
- **Removed XML Parsing**: No more regex parsing of XML responses

### 4. Logout Route (`src/app/api/auth/cas/logout/route.ts`)
- Updated CAS_BASE_URL
- Added GET method for direct logout redirect
- Simplified logout URL (removed unnecessary parameters)

### 5. Environment Variables (`.env.local`)
Added CAS configuration:
```bash
CAS_BASE_URL=https://login.iiit.ac.in/cas
JWT_SECRET=your-secret-key-change-this-in-production
```

### 6. Markdown Support (`src/components/ChatModal.tsx`)
- Fixed TypeScript errors by wrapping ReactMarkdown in div with className
- Added prose styling for proper markdown rendering:
  - Code blocks with syntax highlighting
  - Lists with proper spacing
  - Inline code with green highlighting
  - Responsive typography

## Key Improvements

### From XML to JSON
**Before:**
```typescript
const xmlText = await response.text();
const usernameMatch = xmlText.match(/<cas:user>([^<]+)<\/cas:user>/);
```

**After:**
```typescript
const data: CASResponse = await response.json();
const username = data.serviceResponse.authenticationSuccess?.attributes.uid[0];
```

### Proper Attribute Extraction
IIIT CAS returns attributes in a specific format:
- `uid[]` - Username/Roll number
- `Name[]` - Full name
- `E-Mail[]` - Email address

All arrays with first element containing the actual value.

### Service URL Consistency
The service URL sent to `/login` must exactly match the one used in `/serviceValidate`:
```typescript
// Login
const serviceUrl = `${SITE_URL}/api/auth/cas/callback?returnTo=${encodeURIComponent(returnTo)}`;

// Callback validation  
const serviceUrl = `${SITE_URL}/api/auth/cas/callback?returnTo=${encodeURIComponent(returnTo)}`;
```

## Testing Checklist

- [ ] Login redirects to `https://login.iiit.ac.in/cas/login`
- [ ] After IIIT credentials, redirects back to callback
- [ ] Callback receives ticket parameter
- [ ] Ticket validation returns user data (uid, Name, E-Mail)
- [ ] JWT token created and stored in cas-auth cookie
- [ ] User redirected to returnTo path or home
- [ ] `/api/auth/user` returns user info from JWT
- [ ] Logout clears cookie and redirects to CAS logout

## Production Considerations

1. **JWT Secret**: Change `JWT_SECRET` to a strong random value in production
2. **HTTPS**: Ensure `secure: true` for cookies in production
3. **CORS**: Configure appropriate CORS headers if frontend is on different domain
4. **Rate Limiting**: Add rate limiting to prevent abuse of auth endpoints
5. **Logging**: Monitor CAS validation failures for debugging

## Differences from forms-portal

The forms-portal uses Go backend with Echo framework, while osdg-web uses Next.js:
- **Session Management**: Forms-portal uses custom session system, we use JWT
- **Database**: Forms-portal stores users in PostgreSQL, we keep auth stateless
- **Response Format**: Both now use JSON format with `&format=JSON` parameter
- **Error Handling**: Similar approach with proper error codes and redirects

## References

- IIIT CAS Endpoint: https://login.iiit.ac.in/cas
- Forms Portal: `meow/forms-portal/server/handlers/auth/main.go`
- CAS Protocol: https://apereo.github.io/cas/6.6.x/protocol/CAS-Protocol-Specification.html
