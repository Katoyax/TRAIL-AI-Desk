export function createRateLimiter({ now = Date.now, maxKeys = 10000 } = {}) {
  const buckets = new Map();
  return (key, { limit = 60, windowMs = 60000 } = {}) => {
    const time = now();
    let entry = buckets.get(key);
    if (!entry || time >= entry.expires) {
      if (buckets.size >= maxKeys) {
        for (const [id, bucket] of buckets) if (time >= bucket.expires) buckets.delete(id);
        if (buckets.size >= maxKeys) throw Object.assign(new Error('Request capacity reached. Try again shortly.'), { status: 429 });
      }
      entry = { count: 0, expires: time + windowMs };
      buckets.set(key, entry);
    }
    if (++entry.count > limit) throw Object.assign(new Error('Too many requests. Try again shortly.'), { status: 429 });
  };
}
