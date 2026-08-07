import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Slashing window rate limiter: 10 requests per 60 seconds per IP
let ratelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, "60 s"),
    analytics: true,
  });
}

export async function checkRateLimit(identifier: string): Promise<{ success: boolean; limit?: number; remaining?: number }> {
  if (!ratelimit) {
    // If Upstash Redis keys are not configured yet, allow requests gracefully in local dev
    return { success: true };
  }

  const { success, limit, remaining } = await ratelimit.limit(identifier);
  return { success, limit, remaining };
}
