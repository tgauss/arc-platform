# ARC Platform - Vercel Deployment Guide

## Quick Deploy to Vercel Dashboard

### Step 1: Import from GitHub
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import from GitHub: Search for `arc-platform`
4. Click "Import" on the `tgauss/arc-platform` repository

### Step 2: Configure Project Settings
**IMPORTANT**: Use these exact settings for the monorepo structure:

```
Framework Preset: Other
Root Directory: apps/web
Build Command: npm run build  
Install Command: npm install
Output Directory: .next
```

### Step 3: Deploy
- Click "Deploy" 
- Wait for build to complete (~2-3 minutes)
- You'll get a URL like `https://arc-platform-xyz.vercel.app`

## Expected Build Output
```
✓ Compiled successfully
Route (app)                              Size     First Load JS
┌ ○ /                                    174 B          88.8 kB
├ ○ /_not-found                          866 B          82.7 kB  
├ ○ /dashboard                           137 B            82 kB
├ ○ /dashboard/programs                  2.08 kB          84 kB
└ ○ /login                               1.61 kB        83.5 kB
```

## After Successful Deployment

### Test the Deployed App
- **Homepage**: `https://your-app.vercel.app`
- **Login**: `https://your-app.vercel.app/login`
- **Dashboard**: `https://your-app.vercel.app/dashboard`

**Demo Login Credentials:**
- Email: `admin@perk.studio`  
- Password: `admin123`

### Next Steps After Deploy
1. ✅ Verify all pages load correctly
2. 🔄 Set up Supabase database
3. 🔧 Configure environment variables
4. 🌐 Point `perk.ooo` domain to Vercel
5. 🎯 Set up wildcard SSL for `*.perk.ooo`

## Troubleshooting

**Build Fails?**
- Check Root Directory is set to `apps/web`
- Verify Build Command is `npm run build`
- Ensure Install Command is `npm install`

**Pages Don't Load?**
- Check Output Directory is `.next`
- Verify the GitHub repository is public and accessible

**Need to Redeploy?**
- Push changes to GitHub main branch
- Vercel auto-deploys on push

## Environment Variables (Next Phase)
```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET=your-secret-key
PERK_API_KEY=your-perk-key
ANTHROPIC_API_KEY=your-claude-key
```