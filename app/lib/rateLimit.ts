type RateLimitOptions = {
  keyPrefix: string;
  maxRequests: number;
  windowMs: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 1000;

function clientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return forwardedFor || realIp || "unknown";
}

function pruneExpiredBuckets(now: number) {
  if (buckets.size <= MAX_BUCKETS) return;

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function checkRateLimit(request: Request, options: RateLimitOptions) {
  const now = Date.now();
  pruneExpiredBuckets(now);

  const key = `${options.keyPrefix}:${clientKey(request)}`;
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return { ok: true as const, remaining: options.maxRequests - 1, retryAfter: 0 };
  }

  if (current.count >= options.maxRequests) {
    return { ok: false as const, remaining: 0, retryAfter: Math.ceil((current.resetAt - now) / 1000) };
  }

  current.count += 1;
  buckets.set(key, current);

  return { ok: true as const, remaining: options.maxRequests - current.count, retryAfter: 0 };
}
