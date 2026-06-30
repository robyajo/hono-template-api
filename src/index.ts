import "dotenv/config";
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import apiRouter from './routes/index.js';
import type { AuthVariables } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { writeLog } from './lib/logger.js';
import { serveStatic } from '@hono/node-server/serve-static';

const app = new Hono<{
  Variables: AuthVariables;
}>();

// Mount secure headers middleware globally
app.use(secureHeaders());

// Serve public storage assets statically under /storage/*
app.use(
  '/storage/*',
  serveStatic({
    root: './storage/app/public',
    rewriteRequestPath: (path) => path.replace(/^\/storage/, ''),
  })
);

// Mount logger middleware for console tracing and file writing
app.use(logger((message) => {
  writeLog("INFO", message);
}));

// Mount CORS middleware for all api routes
app.use(
  '/api/*',
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    credentials: true,
  })
);

// Mount the main API router under /api
app.route('/api', apiRouter);

// Home route
app.get('/', (c) => {
  return c.text('Kilex Hono API is online!');
});

// Global Error Handler
app.onError(errorHandler);

// 404 Not Found Handler
app.notFound((c) => {
  return c.json({
    error: "NotFound",
    message: `Cannot ${c.req.method} ${c.req.path}`,
    status: 404,
  }, 404);
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 8000;

serve({
  fetch: app.fetch,
  port
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});
