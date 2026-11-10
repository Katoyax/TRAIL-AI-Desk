export const MONGODB_TARGET = Object.freeze({
  protocol: 'mongodb+srv:',
  hostname: 'cluster1.9duxxbp.mongodb.net',
  databaseName: 'trail_db',
  username: 'trail_db',
});

const MONGODB_PASSWORD_PLACEHOLDERS = new Set([
  'password',
  '<password>',
  'your_password',
  'your_url_encoded_password',
  'replace_with_password',
  'replace_with_url_encoded_password',
]);

function configurationValue(config, name) {
  return typeof config[name] === 'string' ? config[name].trim() : '';
}

export function validateMongoConfig(
  config = process.env,
  { allowDemo = true } = {},
) {
  const uri = configurationValue(config, 'MONGODB_URI');
  const databaseName = configurationValue(config, 'MONGODB_DATABASE');

  if (!uri && !databaseName) {
    if (!allowDemo) {
      throw new Error('Live MongoDB configuration is required for this operation.');
    }

    return { mode: 'demo', uri: null, databaseName: null };
  }

  if (!uri) {
    throw new Error('MONGODB_URI is required when MONGODB_DATABASE is configured.');
  }

  if (!databaseName) {
    throw new Error('MONGODB_DATABASE is required when MONGODB_URI is configured.');
  }

  if (databaseName !== MONGODB_TARGET.databaseName) {
    throw new Error(`MONGODB_DATABASE must be ${MONGODB_TARGET.databaseName}.`);
  }

  let parsed;
  let username;
  let password;
  let pathDatabase;

  try {
    parsed = new URL(uri);
    username = decodeURIComponent(parsed.username);
    password = decodeURIComponent(parsed.password);
    pathDatabase = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
  } catch {
    throw new Error('MongoDB connection configuration is invalid.');
  }

  const normalizedPassword = password.trim().toLowerCase();
  const placeholderPassword =
    !normalizedPassword ||
    MONGODB_PASSWORD_PLACEHOLDERS.has(normalizedPassword) ||
    normalizedPassword.includes('replace_with');

  if (
    parsed.protocol !== MONGODB_TARGET.protocol ||
    parsed.hostname.toLowerCase() !== MONGODB_TARGET.hostname ||
    username !== MONGODB_TARGET.username ||
    placeholderPassword ||
    (pathDatabase && pathDatabase !== MONGODB_TARGET.databaseName)
  ) {
    throw new Error('MongoDB connection configuration does not match the approved target.');
  }

  return {
    mode: 'live',
    uri,
    databaseName: MONGODB_TARGET.databaseName,
  };
}

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
  validateMongoConfig(config);
  return config;
}
