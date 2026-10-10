export function validateConfig(config = process.env) {
  const ranges = {
    PORT: [1, 65535], SOURCE_REFRESH_INTERVAL_HOURS: [1 / 60, 720], SOURCE_REFRESH_POLL_MS: [1000, 3600000],
    AUTH_SESSION_HOURS: [1, 168], PASSWORD_RESET_MINUTES: [5, 60], RETRIEVAL_MIN_COSINE: [0, 1],
  };
  for (const [name, [minimum, maximum]] of Object.entries(ranges)) {
    if (config[name] === undefined || config[name] === '') continue;
    const value = Number(config[name]);
    if (!Number.isFinite(value) || value < minimum || value > maximum) throw new Error(`${name} must be between ${minimum} and ${maximum}.`);
  }
  if (config.SOURCE_REFRESH_ENABLED && !['true', 'false'].includes(config.SOURCE_REFRESH_ENABLED)) throw new Error('SOURCE_REFRESH_ENABLED must be true or false.');
  if (config.SOURCE_ALLOWED_DOMAINS) {
    const domains = config.SOURCE_ALLOWED_DOMAINS.split(',').map((domain) => domain.trim());
    if (domains.some((domain) => !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(domain))) throw new Error('SOURCE_ALLOWED_DOMAINS must contain domain names, without protocols or wildcards.');
  }
  return config;
}
