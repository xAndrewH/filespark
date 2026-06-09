import { NextRequest } from "next/server";

/**
 * Lightweight in-memory rate limiter — a fixed-window counter keyed on client
 * IP + bucket name. No external dependencies.
 *
 * Caveat: serverless instances don't share memory, so the effective limit is
 * per-instance. This still meaningfully blunts abuse (a single hot instance
 * won't spin up unlimited Chromium/LibreOffice processes) without requiring
 * Redis. Swap in a shared store later if you need a global limit.
 */

type Bucket = { count: number; resetAt: number };
const store = new Map<string, Bucket>();

export function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export interface RateLimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * @param req      incoming request (for client IP)
 * @param bucket   logical name so different routes have independent budgets
 * @param limit    max requests allowed per window
 * @param windowMs window length in milliseconds
 */
export function rateLimit(
  req: NextRequest,
  bucket: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const key = `${bucket}:${clientIp(req)}`;

  // Opportunistic cleanup of expired buckets to keep the map small.
  if (store.size > 5_000) {
    for (const [k, b] of store) if (b.resetAt <= now) store.delete(k);
  }

  let entry = store.get(key);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + windowMs };
    store.set(key, entry);
  }

  entry.count += 1;
  const remaining = Math.max(0, limit - entry.count);
  return {
    ok: entry.count <= limit,
    limit,
    remaining,
    retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
  };
}

/** Standard headers to attach to a 429 response. */
export function rateLimitHeaders(r: RateLimitResult): Record<string, string> {
  return {
    "Retry-After": String(r.retryAfterSeconds),
    "X-RateLimit-Limit": String(r.limit),
    "X-RateLimit-Remaining": String(r.remaining),
  };
}
