# Quick Deployment Guide

## Fixed Issues ✅

1. **Vercel Configuration**: Updated to work with Express/TypeScript apps
2. **Build Process**: Excluded test files that were causing build failures
3. **Docker Configuration**: Added static files and proper environment variables
4. **TypeScript Compilation**: Fixed path aliases and build output

## Fastest Deployment Options

### Option 1: Railway (Recommended) ⚡

**Why Railway?**: Best for Node.js apps, automatic HTTPS, easy environment variables.

1. Push code to GitHub
2. Visit [railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub"
4. Add environment variables:
   - `GEMINI_API_KEY`
   - `TOGETHER_API_KEY`
5. Done! Railway auto-deploys on push.

### Option 2: Render 🚀

**Why Render?**: Free tier available, auto-deploys from Git.

1. Push code to GitHub
2. Visit [render.com](https://render.com)
3. New Web Service → Connect GitHub repo
4. Settings:
   - Build: `npm install && npm run build`
   - Start: `npm start`
5. Add environment variables
6. Deploy!

### Option 3: Vercel (Serverless) ⚡

**Note**: Works but has limitations with Express. Better for static/API routes.

```bash
npm i -g vercel
vercel
```

Add environment variables in Vercel dashboard.

## Environment Variables Required

```
GEMINI_API_KEY=your_gemini_api_key
TOGETHER_API_KEY=your_together_api_key
NODE_ENV=production
```

## Test Before Deploy

```bash
# Build
npm run build

# Test production build locally
npm start
```

## Common Issues & Fixes

### Build fails with "Cannot find module 'together-ai'"
✅ **Fixed**: Test files excluded from build in `tsconfig.json`

### Static files not loading
✅ **Fixed**: Dockerfile now copies `src/public` directory

### Vercel deployment fails
✅ **Fixed**: Added `/api/index.js` wrapper for serverless functions

### Port issues
✅ **Fixed**: Dockerfile sets `HOST=0.0.0.0` for container compatibility

## Files Created/Updated

- ✅ `vercel.json` - Vercel configuration
- ✅ `api/index.js` - Vercel serverless wrapper
- ✅ `.vercelignore` - Files to exclude from Vercel
- ✅ `Dockerfile` - Updated with static files and env vars
- ✅ `tsconfig.json` - Excludes test files from build
- ✅ `railway.json` - Railway configuration
- ✅ `render.yaml` - Render configuration
- ✅ `.dockerignore` - Docker build optimization

## Deployment Success Checklist

Before deploying:
- [ ] Code pushed to GitHub
- [ ] `.env` file NOT committed (it's in `.gitignore`)
- [ ] API keys ready (Gemini & Together AI)
- [ ] Build tested locally (`npm run build`)
- [ ] Production server tested (`npm start`)

After deploying:
- [ ] Environment variables set in platform
- [ ] App builds successfully
- [ ] App starts without errors
- [ ] Can access the web interface
- [ ] API endpoints respond correctly

## Quick Test Commands

```bash
# Test build
npm run build

# Test production server
npm start

# Test with Docker
docker build -t somnia-test .
docker run -p 3000:3000 --env-file .env somnia-test
```

## Need Help?

See `DEPLOYMENT.md` for detailed instructions for each platform.
