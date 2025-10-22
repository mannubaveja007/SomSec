# Deploy to Vercel (Fixed Configuration)

## ⚠️ Important Note

Vercel has **limitations** with Express apps:
- 10-second timeout on free tier (serverless functions)
- 50MB max deployment size
- Can be slow for AI analysis (Gemini takes 5-10 seconds)

But it WILL work! Here's how:

## Step-by-Step Deployment

### 1. Commit Your Changes

```bash
git add .
git commit -m "Fix Vercel configuration"
git push origin main
```

### 2. Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" → Sign in with GitHub
3. Click **"Add New..."** → **"Project"**
4. Import your `SomSec` repository
5. Configure:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build` (should auto-detect)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

6. Add Environment Variables:
   Click "Environment Variables" and add:
   ```
   GEMINI_API_KEY = your_actual_gemini_api_key
   TOGETHER_API_KEY = your_actual_together_api_key
   NODE_ENV = production
   ```

7. Click **"Deploy"**

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: somsec
# - Directory: ./
# - Override settings? No

# Add environment variables
vercel env add GEMINI_API_KEY
# Paste your API key when prompted

vercel env add TOGETHER_API_KEY
# Paste your API key when prompted

# Deploy to production
vercel --prod
```

### 3. Wait for Deployment

- Build takes 2-3 minutes
- Vercel will give you a URL like: `https://somsec.vercel.app`

### 4. Test Your Deployment

Visit your URL and:
1. Load a sample contract
2. Click "Analyze Contract"
3. Wait ~10 seconds for results

## How It Works

Your app is now set up to run as Vercel Serverless Functions:

```
User Request
    ↓
Vercel Edge Network
    ↓
/api/index.js (Serverless Function)
    ↓
Your Express App (from dist/src/app.js)
    ↓
Gemini AI Analysis
    ↓
Response to User
```

## Troubleshooting

### Issue 1: "404 Page Not Found"

**Cause**: Vercel can't find your Express app

**Fix**:
1. Make sure `api/index.js` exists
2. Check that `dist/src/app.js` is created during build
3. Run `npm run build` locally to verify

### Issue 2: "Error: Cannot find module '../dist/src/app'"

**Cause**: Build didn't run or failed

**Fix**:
1. Check Vercel build logs
2. Make sure `vercel-build` script exists in package.json
3. Verify `tsconfig.json` excludes test files

### Issue 3: "Function Execution Timeout"

**Cause**: Gemini AI takes longer than 10 seconds

**Solutions**:
- **Upgrade to Pro** ($20/month) → 60-second timeout
- **Or use Railway/Render** instead (no timeout limits)

### Issue 4: Environment Variables Not Working

**Fix**:
1. Go to Vercel Dashboard → Your Project
2. Click "Settings" → "Environment Variables"
3. Add:
   - `GEMINI_API_KEY`
   - `TOGETHER_API_KEY`
4. Redeploy: `vercel --prod`

### Issue 5: Static Files (CSS/JS) Not Loading

**Fix**: Make sure `src/public` is in your git repository:
```bash
git add src/public -f
git commit -m "Add static files"
git push
```

## Vercel Limitations for Your App

| Feature | Free Tier | Pro Tier |
|---------|-----------|----------|
| Timeout | 10 seconds | 60 seconds |
| Deployments | Unlimited | Unlimited |
| Bandwidth | 100GB/month | 1TB/month |
| Team Size | 1 | Unlimited |
| **Price** | **$0** | **$20/month** |

### Recommended: Upgrade to Pro If...

- AI analysis takes > 10 seconds
- You get timeout errors frequently
- You need more reliability

## Alternative: Use Railway or Render

If you encounter timeout issues, I **highly recommend** Railway or Render instead:

- ✅ No timeout limits
- ✅ Always-on server
- ✅ Better for Express apps
- ✅ Cheaper ($7/month)

See `DEPLOY_TO_RAILWAY.md` or `DEPLOY_TO_RENDER.md`

## Post-Deployment Checklist

After deploying:
- [ ] Visit your Vercel URL
- [ ] Load sample contract
- [ ] Click "Analyze Contract"
- [ ] Wait for results
- [ ] Check if all features work
- [ ] Test API endpoints
- [ ] Verify environment variables

## Custom Domain (Optional)

Once deployed, you can add a custom domain:

1. Go to Project Settings → Domains
2. Add your domain (e.g., `somsec.yourdomain.com`)
3. Update DNS records as instructed
4. Done!

## Monitoring

Check your deployment status:
- Vercel Dashboard → Your Project → Deployments
- View logs for each deployment
- Monitor function execution times
- Check error rates

## Need Help?

Common commands:
```bash
# Check deployment status
vercel ls

# View logs
vercel logs

# Rollback to previous deployment
vercel rollback

# Remove deployment
vercel rm your-deployment-url
```

## Summary

✅ Fixed `vercel.json` configuration
✅ Added `api/index.js` wrapper
✅ Added `vercel-build` script
✅ Updated `.vercelignore`

**Now you can deploy!** 🚀

Just push to GitHub and deploy via Vercel dashboard or CLI.
