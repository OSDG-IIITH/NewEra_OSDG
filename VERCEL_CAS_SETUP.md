# Fix CAS Authentication on Vercel (osdg.in)

## Problem
Vercel is using `https://login.iiit.ac.in/cas` instead of `https://login-test2.iiit.ac.in/cas` because the environment variable isn't configured in Vercel.

## Solution: Configure Environment Variables in Vercel

### Step 1: Go to Vercel Dashboard
1. Open https://vercel.com
2. Select your project (osdg-web or whatever it's named)
3. Click on **Settings** tab

### Step 2: Add Environment Variable
1. In Settings, click on **Environment Variables** in the left sidebar
2. Add a new environment variable:
   - **Key**: `CAS_BASE_URL`
   - **Value**: `https://login-test2.iiit.ac.in/cas`
   - **Environments**: Check all three:
     - ✅ Production
     - ✅ Preview
     - ✅ Development

3. Click **Save**

### Step 3: Redeploy
After adding the environment variable, you need to trigger a new deployment:

**Option A: Redeploy from Vercel Dashboard**
1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the three dots (...) menu
4. Select **Redeploy**

**Option B: Push a new commit**
```bash
git commit --allow-empty -m "Trigger redeploy for CAS config"
git push
```

### Step 4: Verify
After redeployment:
1. Go to https://osdg.in
2. Click "CAS Login"
3. Should now redirect to: `https://login-test2.iiit.ac.in/cas/login`

## Quick Visual Guide

```
Vercel Dashboard
    ↓
Your Project
    ↓
Settings → Environment Variables
    ↓
Add Variable:
  CAS_BASE_URL = https://login-test2.iiit.ac.in/cas
    ↓
Save → Redeploy
    ↓
Done! ✅
```

## Important Notes

1. **Environment variables must be set in Vercel dashboard** - `.env.local` files are NOT deployed
2. **Redeploy is required** - Environment variable changes don't apply until you redeploy
3. **Check all environments** - Make sure to enable for Production, Preview, and Development
4. **Whitelisting** - Ensure `https://osdg.in/api/auth/cas/callback` and `https://www.osdg.in/api/auth/cas/callback` are both whitelisted in CAS

## Verification Command

After redeploying, check the logs in Vercel:
- Go to Deployments → Latest → Functions
- Click on any API route execution
- Check the logs to confirm it's using `login-test2.iiit.ac.in`
