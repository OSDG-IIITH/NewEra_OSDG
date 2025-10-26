# 📋 OSDG Web - Deployment Checklist# CAS Authentication Implementation Checklist



Use this checklist to verify your deployment is complete and working correctly.## ✅ OSDG.IN (Current Repo) - READY

All code changes complete. Ready to deploy.

## Pre-Deployment

### Files Modified:

### Environment Setup- ✅ `src/app/api/auth/cas/login/route.ts` - Redirects to CAS with proxy URL

- [ ] Docker installed and running- ✅ `src/app/api/auth/cas/callback/route.ts` - Validates ticket and logs in user

- [ ] Docker Compose installed- ✅ `src/contexts/AuthContext.tsx` - Handles login flow and user state

- [ ] Git repository cloned

- [ ] Port 3000 available (or configured alternative)### Action Required:

1. **Deploy to Vercel** (or your hosting platform)

### Code Verification2. Test after osdg.iiit.ac.in proxy is live

- [ ] Latest code pulled: `git pull origin main`

- [ ] No TypeScript errors: `pnpm run build` (optional check)---

- [ ] Dependencies updated: `pnpm install`

## ⚠️ OSDG.IIIT.AC.IN - ACTION NEEDED

## Docker Setup

You need to add ONE simple proxy endpoint to the osdg.iiit.ac.in repository.

### Data Initialization

- [ ] Run init script (Linux/Mac): `./scripts/init-data.sh`### What to Do:

- [ ] Run init script (Windows): `.\scripts\init-data.ps1`

- [ ] Verify `data/` directory exists1. **Open the osdg.iiit.ac.in repository**

- [ ] Verify `data/projects.json` exists (should be `[]`)

- [ ] Check permissions (Linux/Mac): `ls -la data/`2. **Identify the tech stack:**

   - Next.js? → Use the TypeScript version

### Docker Build   - Express/Node? → Use the JavaScript version  

- [ ] Build image: `docker-compose build`   - PHP/Static? → Use the PHP version

- [ ] No build errors

- [ ] Image created: `docker images | grep osdg`3. **Add the proxy code** (from `PROXY_CODE_FOR_OSDG_IIIT.md`)

   - For Next.js: Create `src/app/api/cas-proxy/route.ts`

### Docker Run   - For Express: Add route to your router

- [ ] Start container: `docker-compose up -d`   - For PHP: Create `api/cas-proxy.php`

- [ ] Container running: `docker-compose ps` (status: Up)

- [ ] No startup errors: `docker-compose logs`4. **Deploy to production**

- [ ] Container healthy: `docker ps` shows osdg-web

5. **Test the endpoint:**

## Functionality Testing   ```

   https://osdg.iiit.ac.in/api/cas-proxy?test=true

### Basic Access   ```

- [ ] Open http://localhost:3000   Should return 400 (because no ticket/target), but proves endpoint exists

- [ ] Homepage loads successfully

- [ ] No console errors (F12 → Console)---

- [ ] All assets load (images, CSS, JS)

## 🧪 Testing Steps (After Both Deployed)

### CAS Authentication

- [ ] Click "Login" button1. Go to https://osdg.in

- [ ] Redirects to login-test2.iiit.ac.in2. Open browser DevTools (F12) → Console tab

- [ ] Enter valid IIIT credentials3. Click "CAS Login" button

- [ ] Redirects back to osdg.in4. Watch the logs in console:

- [ ] User logged in (see profile in navbar)   ```

- [ ] Hover over logout icon shows tooltip   [Auth] === LOGIN STARTED ===

  - [ ] Name displayed   [Auth] ReturnTo: /

  - [ ] Email displayed   [Auth] Redirecting to: /api/auth/cas/login?returnTo=%2F

  - [ ] Username displayed   ```

- [ ] Click logout button

- [ ] Successfully logged out5. You'll be redirected to IIIT CAS login page

- [ ] Session cleared6. Enter your IIIT credentials

7. After authentication, watch the URL changes:

### Project Management   - Briefly: `login.iiit.ac.in` → `osdg.iiit.ac.in` (proxy)

- [ ] Navigate to /list page   - Finally: `osdg.in/?casAuth=success&username=...`

- [ ] Add a new project (fill all fields)

- [ ] Project appears immediately8. Check console logs:

- [ ] Project has correct data   ```

- [ ] Add another project   [Auth] === FETCH USER STARTED ===

- [ ] Both projects visible   [Auth] URL Params check: {casAuth: "success", username: "...", ...}

- [ ] Delete a project   [Auth] ✅ CAS authentication found in URL!

- [ ] Project removed successfully   [Auth] Setting user from URL params: {...}

- [ ] Remaining project still visible   ```



### Data Persistence9. Verify you're logged in:

- [ ] Add a test project   - Username should appear in navbar

- [ ] Verify it appears in list   - User profile should be accessible

- [ ] Stop container: `docker-compose down`

- [ ] Start container: `docker-compose up -d`---

- [ ] Navigate to /list page

- [ ] Test project still exists ✅## 🐛 Troubleshooting

- [ ] Check file: `cat data/projects.json`

- [ ] Project data in JSON file### If stuck on osdg.iiit.ac.in:

- **Problem:** Proxy endpoint not working

### Docker Volumes- **Check:** Is the proxy code deployed?

- [ ] Verify volume mount: `docker inspect osdg-web | grep -A 5 Mounts`- **Test:** Visit https://osdg.iiit.ac.in/api/cas-proxy directly

- [ ] Should show: `./data` → `/app/data`- **Fix:** Deploy the proxy code

- [ ] Manually edit `data/projects.json`

- [ ] Restart: `docker-compose restart`### If "Application Not Authorized" error:

- [ ] Changes reflected on website- **Problem:** Wrong service URL being sent to CAS

- **Check:** Console logs in osdg.in login route

## Monitoring- **Expected:** Should see `service=https://osdg.iiit.ac.in/api/cas-proxy...`

- **Fix:** Verify login route code is correct

### Container Health

- [ ] Check logs: `docker-compose logs -f` (no errors)### If validation fails:

- [ ] Check status: `docker-compose ps` (State: Up)- **Problem:** Service URL mismatch between login and callback

- [ ] Check resources: `docker stats osdg-web`- **Check:** Both URLs must be IDENTICAL

- [ ] Memory usage < 200MB- **Expected:** Both should use `https://osdg.iiit.ac.in/api/cas-proxy?target=...`

- [ ] CPU usage < 5%- **Fix:** Ensure callback uses same URL as login for validation



### Application Health### If user not logged in on osdg.in:

- [ ] Homepage loads in < 2s- **Problem:** URL params not being read

- [ ] API endpoints respond:- **Check:** Console logs in browser

  - [ ] GET /api/projects- **Look for:** `[Auth] URL Params check:`

  - [ ] GET /api/auth/user- **Fix:** Check AuthContext fetchUser function

- [ ] No JavaScript errors in console

- [ ] No network errors in Network tab---



## Security Verification## 📊 Success Criteria



### Docker Security✅ User clicks login on osdg.in

- [ ] Container runs as non-root: `docker exec osdg-web whoami` → `nextjs`✅ Redirected to CAS login page  

- [ ] Data directory owned by correct user✅ Enters credentials successfully

- [ ] No unnecessary ports exposed✅ Briefly passes through osdg.iiit.ac.in (may be too fast to see)

- [ ] Restart policy set: `unless-stopped`✅ Lands back on osdg.in with username visible

✅ User is logged in and can access protected features

### Application Security✅ Session persists across page refreshes

- [ ] CAS authentication required for protected pages

- [ ] Session expires on logout---

- [ ] No sensitive data in logs

- [ ] HTTPS ready (if deployed to production)## 🚀 Deployment Order



## Performance Checks1. **First:** Deploy proxy to osdg.iiit.ac.in

2. **Then:** Deploy updated code to osdg.in

### Build Performance3. **Test:** Full authentication flow

- [ ] Build completes in < 5 minutes

- [ ] Image size < 200MB: `docker images osdg-web`---

- [ ] No unnecessary layers

## 📝 What Each Service Does

### Runtime Performance

- [ ] First load < 3s### osdg.in:

- [ ] Subsequent loads < 1s- Initiates login → redirects to CAS with proxy URL

- [ ] API responses < 500ms- Receives ticket from proxy → validates with CAS

- [ ] No memory leaks (check after 1 hour: `docker stats`)- Logs user in → stores in session



## Backup & Recovery### osdg.iiit.ac.in (proxy):

- Receives ticket from CAS (whitelisted ✅)

### Backup Test- Immediately redirects to osdg.in with ticket

- [ ] Create backup: `cp data/projects.json data/backup.json`- No data storage, just passthrough

- [ ] Verify backup file exists

- [ ] Backup contains valid JSON### CAS (login.iiit.ac.in):

- Authenticates user credentials

### Recovery Test- Issues ticket for whitelisted domain (osdg.iiit.ac.in)

- [ ] Delete `data/projects.json`- Validates ticket when requested

- [ ] Restore from backup: `cp data/backup.json data/projects.json`

- [ ] Restart container: `docker-compose restart`---

- [ ] Projects restored successfully

## 🔒 Security Notes

## Documentation

- Tickets are one-time use (CAS enforced)

### Files Present- Tickets expire in ~5 minutes

- [ ] README.md exists and updated- Proxy doesn't store any user data

- [ ] DOCKER_DEPLOYMENT.md exists- HTTPS enforced throughout

- [ ] DOCKER_QUICKREF.md exists- User data cleared from URL after login

- [ ] IMPLEMENTATION_SUMMARY.md exists

- [ ] This checklist file exists---



### Scripts Executable## Need Help?

- [ ] `scripts/init-data.sh` has execute permission (Linux/Mac)

- [ ] `scripts/deploy-docker.sh` has execute permission (Linux/Mac)If something doesn't work:

- [ ] Windows scripts (.ps1) present1. Check browser console logs (F12)

2. Check server logs on both osdg.in and osdg.iiit.ac.in

## Production Readiness3. Verify proxy endpoint is accessible

4. Test CAS login with curl/Postman

### Configuration5. Check that service URLs match exactly

- [ ] Environment variables set correctly

- [ ] CAS server configured (test or prod)---

- [ ] Domain configured (if applicable)

- [ ] SSL certificate installed (if production)**Ready to deploy! The humanitarian rescue mission can proceed! 🚀**


### Deployment
- [ ] Code deployed to server
- [ ] Docker running on server
- [ ] Firewall rules configured
- [ ] Domain DNS configured
- [ ] Reverse proxy setup (Nginx/Caddy)

### Monitoring
- [ ] Logging configured
- [ ] Monitoring tools setup
- [ ] Alert rules defined
- [ ] Backup schedule created

## Troubleshooting

### If Container Won't Start
- [ ] Check logs: `docker-compose logs`
- [ ] Check port: `netstat -an | grep 3000`
- [ ] Check disk space: `df -h`
- [ ] Verify Docker running: `docker ps`

### If Data Not Persisting
- [ ] Check volume mount: `docker inspect osdg-web`
- [ ] Check file permissions: `ls -la data/`
- [ ] Check file contents: `cat data/projects.json`
- [ ] Verify directory exists in container: `docker exec osdg-web ls -la /app/data`

### If Authentication Fails
- [ ] Check CAS server URL in code
- [ ] Check network connectivity to login-test2.iiit.ac.in
- [ ] Check callback URL configuration
- [ ] Check browser console for errors
- [ ] Check server logs: `docker-compose logs | grep CAS`

## Sign-Off

### Developer
- [ ] All code changes committed
- [ ] All tests passed
- [ ] Documentation updated
- [ ] No known issues

**Name:** _________________  
**Date:** _________________  
**Signature:** _________________

### Tester
- [ ] All tests executed
- [ ] All features working
- [ ] No critical bugs
- [ ] Ready for deployment

**Name:** _________________  
**Date:** _________________  
**Signature:** _________________

### Deployer
- [ ] Deployment completed
- [ ] Production verified
- [ ] Monitoring active
- [ ] Backup configured

**Name:** _________________  
**Date:** _________________  
**Signature:** _________________

---

## Quick Commands Reference

```bash
# Deploy
./scripts/deploy-docker.sh  # or .\scripts\deploy-docker.ps1

# Check Status
docker-compose ps
docker-compose logs -f

# Test
curl http://localhost:3000
cat data/projects.json

# Backup
cp data/projects.json data/backup-$(date +%Y%m%d).json

# Stop
docker-compose down

# Clean Up
docker system prune -a
```

---

**Deployment Date:** _________________  
**Version:** _________________  
**Deployed By:** _________________  
**Status:** ☐ Success ☐ Failed ☐ Partial
