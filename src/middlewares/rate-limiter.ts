import type { Context, MiddlewareHandler } from "hono";

import * as HttpStatusCodes from "stoker/http-status-codes";

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyGenerator?: (c: Context) => string; // Function to generate rate limit key
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetTime < now) {
      store.delete(key);
    }
  }
}, 60000); // Clean up every minute

export function rateLimiter(options: RateLimitOptions): MiddlewareHandler {
  const { windowMs, maxRequests, keyGenerator } = options;

  return async (c, next) => {
    // Generate key for rate limiting (default to IP address)
    const key = keyGenerator
      ? keyGenerator(c)
      : c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";

    const now = Date.now();
    const entry = store.get(key);

    if (!entry || entry.resetTime < now) {
      // Create new entry
      store.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (entry.count >= maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      c.header("Retry-After", retryAfter.toString());
      c.header("X-RateLimit-Limit", maxRequests.toString());
      c.header("X-RateLimit-Remaining", "0");
      c.header("X-RateLimit-Reset", new Date(entry.resetTime).toISOString());

      return c.json(
        {
          error: "Too many requests",
          message: `Rate limit exceeded. Try again in ${retryAfter} seconds`,
        },
        HttpStatusCodes.TOO_MANY_REQUESTS,
      );
    }

    // Increment count
    entry.count += 1;
    store.set(key, entry);

    // Add rate limit headers
    c.header("X-RateLimit-Limit", maxRequests.toString());
    c.header("X-RateLimit-Remaining", (maxRequests - entry.count).toString());
    c.header("X-RateLimit-Reset", new Date(entry.resetTime).toISOString());

    return next();
  };
}

// Pre-configured rate limiters
export const strictRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
});

export const standardRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 500,
});

export const authRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // Only 5 login attempts per 15 minutes
});
