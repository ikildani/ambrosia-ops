// Simple in-memory rate limiter for serverless
// Tracks requests per IP/user with sliding window

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

// Clean expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetAt) rateLimitMap.delete(key);
  }
}, 60000);

export interface RateLimitConfig {
  windowMs: number;  // time window in ms
  maxRequests: number;  // max requests per window
}

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  screening: { windowMs: 60000, maxRequests: 10 },      // 10 screenings/min (AI-heavy)
  intelligence: { windowMs: 60000, maxRequests: 5 },     // 5 reports/min (AI-heavy)
  scoring: { windowMs: 60000, maxRequests: 20 },         // 20 scorings/min
  crud: { windowMs: 60000, maxRequests: 60 },            // 60 CRUD ops/min
  search: { windowMs: 60000, maxRequests: 30 },          // 30 searches/min
};

export function checkRateLimit(
  identifier: string,  // IP or user ID
  endpoint: string,    // key from RATE_LIMITS
): { allowed: boolean; remaining: number; resetIn: number } {
  const config = RATE_LIMITS[endpoint] || RATE_LIMITS.crud;
  const key = `${identifier}:${endpoint}`;
  const now = Date.now();

  const existing = rateLimitMap.get(key);

  if (!existing || now > existing.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.windowMs };
  }

  if (existing.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetIn: existing.resetAt - now };
  }

  existing.count++;
  return { allowed: true, remaining: config.maxRequests - existing.count, resetIn: existing.resetAt - now };
}
