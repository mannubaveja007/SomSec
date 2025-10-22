# Deployment Guide

This guide explains how to deploy the Somnia Smart Contract Security Analyzer to various platforms.

## Prerequisites

Before deploying, ensure you have:
- Node.js 18 or higher
- All required environment variables set (see `.env.example`)
- API keys for:
  - `GEMINI_API_KEY` (for Google Gemini AI)
  - `TOGETHER_API_KEY` (for Together AI chat features)

## Deployment Options

### 1. Vercel (Serverless)

**Note**: Vercel has limitations with traditional Express apps. For better results, consider Railway or Render.

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# For production
vercel --prod
```

**Important**:
- Set environment variables in Vercel dashboard
- The app uses serverless functions via `/api/index.js`

### 2. Railway (Recommended)

Railway is ideal for Node.js/Express apps:

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables in the Railway dashboard:
   - `GEMINI_API_KEY`
   - `TOGETHER_API_KEY`
   - `NODE_ENV=production`
   - `PORT` (Railway will set this automatically)
6. Railway will automatically detect and build your app

### 3. Render

1. Push your code to GitHub
2. Go to [render.com](https://render.com)
3. Click "New +" → "Web Service"
4. Connect your repository
5. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node
6. Add environment variables in the Render dashboard

### 4. Docker (Any Platform)

Build and run with Docker:

```bash
# Build the image
docker build -t somnia-security .

# Run the container
docker run -p 3000:3000 \
  -e GEMINI_API_KEY=your_key \
  -e TOGETHER_API_KEY=your_key \
  -e NODE_ENV=production \
  somnia-security
```

Deploy to any Docker-compatible platform:
- Google Cloud Run
- AWS ECS
- Azure Container Instances
- DigitalOcean App Platform

### 5. Traditional VPS (Ubuntu/Debian)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone your repository
git clone <your-repo-url>
cd SomSec

# Install dependencies
npm install

# Build
npm run build

# Set environment variables
cp .env.example .env
# Edit .env with your API keys

# Install PM2 for process management
sudo npm install -g pm2

# Start the app
pm2 start dist/src/app.js --name somnia-security

# Make it start on boot
pm2 startup
pm2 save
```

## Environment Variables

Create a `.env` file or set these in your deployment platform:

```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here
TOGETHER_API_KEY=your_together_api_key_here

# Optional
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
LOG_LEVEL=info
```

## Build Process

The build process:
1. Removes old `dist` folder
2. Compiles TypeScript to JavaScript
3. Resolves path aliases (`@/` imports)
4. Outputs to `dist/` directory

```bash
npm run build
```

## Testing Build Locally

Before deploying, test the production build locally:

```bash
# Build
npm run build

# Run production build
npm start

# Or test with Node directly
NODE_ENV=production node dist/src/app.js
```

## Troubleshooting

### Build Fails on Deployment

- Ensure `tsc-alias` is in `dependencies`, not `devDependencies`
- Check that all TypeScript files compile without errors
- Verify `tsconfig.json` excludes test files

### Static Files Not Serving

- Ensure `src/public` directory is included in your deployment
- Check that the path in `app.ts` is correct: `app.use(express.static('src/public'))`

### Port Issues

- Make sure your platform's `PORT` environment variable is used
- The app defaults to port 3000 if not set

### API Keys Not Working

- Double-check environment variables are set correctly
- Ensure no quotes around keys in `.env` file
- Restart the application after changing environment variables

## Performance Optimization

For production:

1. **Enable compression**:
   ```bash
   npm install compression
   ```
   Add to `src/app.ts`:
   ```typescript
   import compression from 'compression'
   app.use(compression())
   ```

2. **Add rate limiting**:
   ```bash
   npm install express-rate-limit
   ```

3. **Set up a CDN** for static files

4. **Use caching** for API responses

## Monitoring

Recommended monitoring solutions:
- **Railway**: Built-in metrics and logs
- **Render**: Built-in metrics dashboard
- **PM2**: `pm2 monit` for VPS deployments
- **External**: New Relic, Datadog, or Sentry

## Security Checklist

Before deploying:
- [ ] All API keys are stored as environment variables
- [ ] `.env` file is in `.gitignore`
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] HTTPS is enforced
- [ ] Dependencies are up to date (`npm audit`)

## Support

For deployment issues:
- Check the platform-specific documentation
- Review application logs
- Ensure all environment variables are set
- Test the build locally first
