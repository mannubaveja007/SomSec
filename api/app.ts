import 'reflect-metadata';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { URL } from 'url';

// Import your existing router and helper functions
import { createLogger } from '@/helpers';
import { router } from '@/router';

// Configure environment
dotenv.config();

// Set up logger
export const logger = createLogger();

// Create express app for serverless environment
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// API routes - adapted for Vercel serverless
app.use('/api', router);

// Vercel serverless handler
export default async function handler(req: Request, res: Response) {
  // Log incoming request
  logger.info(`Serverless function called: ${req.method} ${req.url}`);

  // Special handling for Vercel's URL structure
  if (req.query.path) {
    // Extract path from query string (added by vercel.json rewrite rules)
    const pathSegments = Array.isArray(req.query.path) 
      ? req.query.path.join('/') 
      : req.query.path;
      
    // Rewrite the URL to match our router's expectations
    const originalUrl = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
    req.url = `/${pathSegments}${originalUrl.search || ''}`;
    
    logger.info(`URL rewritten: ${req.url}`);
  }

  // Use the Express app to handle the request
  return app(req, res);
}

// Also export the app for local development
export { app };
