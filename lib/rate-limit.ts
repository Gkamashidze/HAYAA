// In-memory fixed-window rate limiter.
//
// Scope: single Railway instance. State is per-process and resets on redeploy.
// Adequate for brute-force mitigation on a low-traffic admin login; a multi-
// instance deployment would need a shared store (Redis).

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();

export interface RateLimitResult {
  readonly allowed: boolean;
  readonly retryAfterSeconds: number;
}

// Drop expired windows so the map does not grow unbounded.
function sweep(now: number): void {
  for (const [key, win] of windows) {
    if (now >= win.resetAt) windows.delete(key);
  }
}

/**
 * Records one hit against `key` and reports whether it is within `limit`
 * hits per `windowSeconds`.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): RateLimitResult {
  const now = Date.now();
  if (windows.size > 500) sweep(now);

  const win = windows.get(key);
  if (!win || now >= win.resetAt) {
    windows.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  win.count += 1;
  if (win.count > limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((win.resetAt - now) / 1000),
    };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}
