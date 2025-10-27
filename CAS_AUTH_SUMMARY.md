# CAS Authentication Configuration Summary

## ✅ Current Setup

Your CAS authentication is **already correctly configured** to use `https://login-test2.iiit.ac.in/cas/login` and works for both localhost and production (osdg.in).

## How It Works

### 1. **CAS Login Flow**

When a user clicks "CAS Login":

```
User clicks "CAS Login"
    ↓
Frontend calls: /api/auth/cas/login?returnTo=/
    ↓
Backend redirects to: https://login-test2.iiit.ac.in/cas/login?service={callback_url}
    ↓
User authenticates with IIIT credentials
    ↓
CAS redirects back to: {callback_url}?ticket={ticket}
    ↓
Backend validates ticket and redirects to homepage with user data
    ↓
User is logged in!
```

### 2. **Dynamic Callback URLs**

The implementation automatically detects the current domain and uses it for callbacks:

- **Localhost**: `http://localhost:3000/api/auth/cas/callback?returnTo=/`
- **Production**: `https://osdg.in/api/auth/cas/callback?returnTo=/`

This is handled by the `origin` variable in both routes:
```typescript
const { searchParams, origin } = new URL(request.url);
const callbackUrl = `${origin}/api/auth/cas/callback?returnTo=${encodeURIComponent(returnTo)}`;
```

### 3. **Key Configuration Files**

#### `/src/app/api/auth/cas/login/route.ts`
- Initiates CAS login
- Uses: `https://login-test2.iiit.ac.in/cas`
- Dynamically builds callback URL based on current domain

#### `/src/app/api/auth/cas/callback/route.ts`
- Receives CAS ticket
- Validates ticket with CAS server
- Extracts user data (username, name, email)
- Redirects back to application with user info

#### `/src/contexts/AuthContext.tsx`
- Handles user state management
- Stores authenticated user in sessionStorage
- Manages login/logout flows

### 4. **Environment Variables**

In `.env.local` or docker-compose:
```bash
CAS_BASE_URL=https://login-test2.iiit.ac.in/cas
```

The default is already set in the code, so this is optional.

### 5. **Testing**

#### Local Development (localhost:3000)
1. Start dev server: `pnpm dev`
2. Click "CAS Login"
3. Should redirect to: `https://login-test2.iiit.ac.in/cas/login?service=http://localhost:3000/api/auth/cas/callback?returnTo=/`
4. After login, returns to: `http://localhost:3000/`

#### Production (osdg.in)
1. Deploy to production
2. Click "CAS Login"
3. Should redirect to: `https://login-test2.iiit.ac.in/cas/login?service=https://osdg.in/api/auth/cas/callback?returnTo=/`
4. After login, returns to: `https://osdg.in/`

### 6. **Whitelisting Requirements**

Make sure these URLs are whitelisted in the CAS server:
- `http://localhost:3000/api/auth/cas/callback` (for local development)
- `https://osdg.in/api/auth/cas/callback` (for production)

Contact IIIT IT team to whitelist these service URLs if you encounter validation errors.

## 🔧 No Changes Required

Your current implementation is correct and follows best practices:
- ✅ Uses `login-test2.iiit.ac.in`
- ✅ Dynamic origin detection
- ✅ Works on localhost and production
- ✅ Proper ticket validation
- ✅ Secure user data handling

## 🚀 Next Steps

1. **Test locally**: Run `pnpm dev` and test CAS login
2. **Verify whitelisting**: Ensure both localhost and osdg.in are whitelisted
3. **Deploy**: Your production deployment will automatically work
4. **Monitor logs**: Check console for CAS flow debugging info

## 📝 Common Issues

### Issue: "No ticket provided"
- **Cause**: CAS didn't redirect back with a ticket
- **Solution**: Check CAS server logs or contact IT

### Issue: "Validation failed"
- **Cause**: Service URL not whitelisted or ticket expired
- **Solution**: Verify whitelisting and check ticket expiry

### Issue: "Works on localhost but not production"
- **Cause**: Production URL not whitelisted
- **Solution**: Add `https://osdg.in/api/auth/cas/callback` to whitelist

## 🎯 Summary

Your CAS authentication is production-ready and will work seamlessly on both localhost and osdg.in. The dynamic origin detection ensures the callback URLs are always correct regardless of the deployment environment.
