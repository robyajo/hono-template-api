import "dotenv/config";
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import apiRouter from './routes/index.js';
import type { AuthVariables } from './middleware/auth.js';

const app = new Hono<{
  Variables: AuthVariables;
}>();

// Mount logger middleware for console tracing
app.use(logger());

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
app.onError((err, c) => {
  console.error(`[Error] ${err.name}: ${err.message}`, err.stack);
  
  const status = c.res.status === 200 || !c.res.status ? 500 : c.res.status;
  return c.json({
    error: err.name || "InternalServerError",
    message: err.message || "An unexpected error occurred",
    status,
  }, status as any);
});

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
