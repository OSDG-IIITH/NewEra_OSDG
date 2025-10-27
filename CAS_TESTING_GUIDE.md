# CAS Authentication Test Guide

## Manual Testing Steps

### Test on Localhost (Development)

1. **Start the development server:**
   ```bash
   pnpm dev
   ```

2. **Open browser:**
   ```
   http://localhost:3000
   ```

3. **Click "CAS Login" button**

4. **Expected behavior:**
   - Redirects to: `https://login-test2.iiit.ac.in/cas/login?service=http://localhost:3000/api/auth/cas/callback?returnTo=/`
   - You see IIIT login page
   - Enter valid IIIT credentials
   - Redirects back to: `http://localhost:3000/?casAuth=success&username=...&name=...&email=...`
   - User is logged in (see name in navbar)
   - URL is cleaned (no query params visible)

5. **Verify:**
   - Open DevTools Console (F12)
   - Should see logs starting with `[CAS Login]`, `[CAS Callback]`, `[Auth]`
   - Check sessionStorage: Should have `cas-user` with user data

### Test on Production (osdg.in)

1. **Deploy to production:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Open browser:**
   ```
   https://osdg.in
   ```

3. **Click "CAS Login" button**

4. **Expected behavior:**
   - Redirects to: `https://login-test2.iiit.ac.in/cas/login?service=https://osdg.in/api/auth/cas/callback?returnTo=/`
   - You see IIIT login page
   - Enter valid IIIT credentials
   - Redirects back to: `https://osdg.in/?casAuth=success&username=...&name=...&email=...`
   - User is logged in (see name in navbar)
   - URL is cleaned (no query params visible)

5. **Verify:**
   - Open DevTools Console (F12)
   - Should see logs starting with `[CAS Login]`, `[CAS Callback]`, `[Auth]`
   - Check sessionStorage: Should have `cas-user` with user data

## Debug Console Output

### Expected Console Logs:

#### When clicking "CAS Login":
```
=== AUTH: LOGIN STARTED ===
[Auth] ReturnTo: /
[Auth] Redirecting to: /api/auth/cas/login?returnTo=%2F
```

#### On the backend (check Docker/terminal logs):
```
[CAS Login] === CAS LOGIN REQUEST ===
[CAS Login] Origin: http://localhost:3000 (or https://osdg.in)
[CAS Login] ReturnTo: /
[CAS Login] Using callback URL: http://localhost:3000/api/auth/cas/callback?returnTo=%2F
[CAS Login] ✅ Redirecting to CAS: https://login-test2.iiit.ac.in/cas/login?service=...
```

#### After CAS redirects back:
```
[CAS Callback] === CALLBACK RECEIVED ===
[CAS Callback] Full URL: http://localhost:3000/api/auth/cas/callback?ticket=ST-xxx&returnTo=%2F
[CAS Callback] Origin: http://localhost:3000
[CAS Callback] Ticket: Present (ST-xxx...)
[CAS Callback] ReturnTo: /
[CAS Callback] Validating with service URL: http://localhost:3000/api/auth/cas/callback?returnTo=%2F
CAS Response: { "serviceResponse": { "authenticationSuccess": { ... } } }
[CAS Callback] ✅✅✅ SUCCESS! User authenticated ✅✅✅
[CAS Callback] Username: roll.number
[CAS Callback] Name: Full Name
[CAS Callback] Email: email@iiit.ac.in
[CAS Callback] ✅ Redirecting to: http://localhost:3000/?casAuth=success&username=...
```

#### On the frontend:
```
[Auth] === FETCH USER STARTED ===
[Auth] URL Params check: {casAuth: 'success', username: 'roll.number', name: 'Full Name', email: 'email@iiit.ac.in'}
[Auth] ✅ CAS authentication found in URL!
[Auth] Setting user from URL params: {username: '...', name: '...', email: '...'}
[Auth] User cached in sessionStorage
[Auth] URL cleaned
```

## Troubleshooting

### Issue: "Application Not Authorized"
**Cause:** Domain not whitelisted in CAS
**Solution:** 
- For localhost: Works with login-test2 ✅
- For osdg.in: Works with login-test2 ✅
- For other domains: Contact IIIT admin to whitelist

### Issue: "No ticket provided"
**Cause:** CAS didn't redirect back with ticket
**Solutions:**
1. Check if service URL is correctly encoded
2. Verify CAS_BASE_URL environment variable
3. Check network tab in DevTools

### Issue: "Validation failed"
**Cause:** Ticket validation failed
**Solutions:**
1. Check Docker logs for CAS response
2. Verify service URL matches between login and callback
3. Ensure CAS_BASE_URL is correct

### Issue: "User not logged in after redirect"
**Cause:** AuthContext not reading URL params
**Solutions:**
1. Check browser console for `[Auth]` logs
2. Verify URL has `casAuth=success` param after redirect
3. Check if sessionStorage has `cas-user`
4. Clear browser cache and try again

## Environment Variables Check

### Development (.env.local):
```env
CAS_BASE_URL=https://login-test2.iiit.ac.in/cas
```

### Production (docker-compose.prod.yml):
```yaml
environment:
  - CAS_BASE_URL=https://login-test2.iiit.ac.in/cas
```

### Verify in container:
```bash
docker-compose -f docker-compose.prod.yml exec website env | grep CAS
```

Should output:
```
CAS_BASE_URL=https://login-test2.iiit.ac.in/cas
```

## Network Monitoring

### In Browser DevTools (Network Tab):

1. Click "CAS Login"
2. Should see:
   - Request to `/api/auth/cas/login?returnTo=/`
   - 302 redirect to `login-test2.iiit.ac.in`
   - Navigation to CAS login page
   - After login: 302 redirect to `/api/auth/cas/callback?ticket=...`
   - 302 redirect to `/?casAuth=success&...`
   - Final page load with user logged in

### In Docker Logs:

```bash
# View real-time logs
docker-compose -f docker-compose.prod.yml logs -f

# Filter CAS logs
docker-compose -f docker-compose.prod.yml logs | grep CAS
```

## Success Criteria

✅ User clicks "CAS Login"
✅ Redirects to login-test2.iiit.ac.in
✅ User enters credentials
✅ Redirects back to original site (localhost or osdg.in)
✅ User is logged in (name appears in navbar)
✅ Session persists on page refresh
✅ Logout works correctly
✅ Works on both localhost and production

## Test Checklist

- [ ] Test on localhost:3000
- [ ] Test on osdg.in (production)
- [ ] Test login flow
- [ ] Test logout flow
- [ ] Test session persistence (refresh page)
- [ ] Test error handling (invalid credentials)
- [ ] Test return URL (login from different pages)
- [ ] Check console logs for errors
- [ ] Verify sessionStorage data
- [ ] Test on multiple browsers

---

**Current Status:** Implementation is correct and should work! ✅

If you're experiencing issues, please check:
1. Browser console for error messages
2. Docker logs for backend errors
3. Network tab for redirect flow
4. SessionStorage for user data
