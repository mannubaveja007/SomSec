# Somnia Smart Contract Security Analyzer

AI-powered smart contract security analyzer built with Next.js and Gemini AI.

## Features

- Smart contract vulnerability detection
- AI-powered analysis using Google Gemini
- Monaco Editor for code editing
- Real-time security analysis
- Detailed vulnerability reports

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```env
GEMINI_API_KEY=your_gemini_api_key
TOGETHER_API_KEY=your_together_api_key
```

3. Run development server:
```bash
npm run dev
```

Visit http://localhost:3000

## Build

```bash
npm run build
npm start
```

## Deploy

### Vercel (Recommended)
```bash
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

## API Endpoints

- `POST /api/detection/analyze-contract` - Analyze smart contracts
- `POST /api/chat` - Chat with AI assistant
- `GET /api/app/health-check` - Health check
- `GET /api/app/version` - Get version

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Monaco Editor
- Tailwind CSS
- Google Gemini AI
- Together AI
