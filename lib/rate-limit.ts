/**
 * In-memory sliding-window rate limiter.
 *
 * ⚠️ Single-instance only — does NOT work across multiple serverless invocations.
 * For production with Vercel / multi-instance deployments, replace with an
 * Upstash Redis-backed implementation (e.g. @upstash/ratelimit).
 */

interface Window {
  count: number;
  reset: number; // epoch ms
}

const store = new Map<string, Window>();

// Prune expired windows every 5 minutes to prevent memory leaks.
const PRUNE_INTERVAL_MS = 5 * 60 * 1_000;

function prune() {
  const now = Date.now();
  for (const [key, window] of store) {
    if (now > window.reset) store.delete(key);
  }
}

if (typeof setInterval !== "undefined") {
  setInterval(prune, PRUNE_INTERVAL_MS).unref?.();
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // epoch ms
}

/**
 * Check whether `identifier` is within the rate limit.
 * @param identifier - unique key, e.g. IP address or userId
 * @param limit      - max requests per window (default 20)
 * @param windowMs   - window duration in ms (default 60 s)
 */
export function rateLimit(
  identifier: string,
  limit = 20,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now();
  const existing = store.get(identifier);

  if (!existing || now > existing.reset) {
    store.set(identifier, { count: 1, reset: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.reset };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: limit - existing.count,
    resetAt: existing.reset,
  };
}

/**
 * Convenience wrapper: extract client IP from request headers and rate-limit by it.
 * Falls back to "unknown" if the IP cannot be determined.
 */
export function rateLimitByIP(
  request: Request,
  limit?: number,
  windowMs?: number
): RateLimitResult {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return rateLimit(ip, limit, windowMs);
}

/**
 * Build the standard rate-limit response headers.
 */
export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  };
}
