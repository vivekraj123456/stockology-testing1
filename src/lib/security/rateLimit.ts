type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitBucketStore = Map<string, RateLimitEntry>;

type RateLimitGlobalStore = Map<string, RateLimitBucketStore>;

type ConsumeRateLimitInput = {
  bucket: string;
  key: string;
  limit: number;
  windowMs: number;
};

type ConsumeRateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

const globalForRateLimit = globalThis as typeof globalThis & {
  __rateLimitStore__?: RateLimitGlobalStore;
};

const store: RateLimitGlobalStore =
  globalForRateLimit.__rateLimitStore__ ?? new Map();

if (!globalForRateLimit.__rateLimitStore__) {
  globalForRateLimit.__rateLimitStore__ = store;
}

function getBucket(bucketName: string): RateLimitBucketStore {
  const existing = store.get(bucketName);
  if (existing) {
    return existing;
  }

  const created = new Map<string, RateLimitEntry>();
  store.set(bucketName, created);
  return created;
}

function gcBucket(bucket: RateLimitBucketStore, now: number): void {
  if (bucket.size < 500) {
    return;
  }

  bucket.forEach((entry, key) => {
    if (entry.resetAt <= now) {
      bucket.delete(key);
    }
  });
}

export function consumeRateLimit({
  bucket,
  key,
  limit,
  windowMs,
}: ConsumeRateLimitInput): ConsumeRateLimitResult {
  const now = Date.now();
  const bucketStore = getBucket(bucket);
  gcBucket(bucketStore, now);

  const existing = bucketStore.get(key);

  if (!existing || existing.resetAt <= now) {
    bucketStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      allowed: true,
      remaining: Math.max(limit - 1, 0),
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  existing.count += 1;
  bucketStore.set(key, existing);

  const allowed = existing.count <= limit;
  const remaining = Math.max(limit - existing.count, 0);
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((existing.resetAt - now) / 1000)
  );

  return {
    allowed,
    remaining,
    retryAfterSeconds,
  };
}
