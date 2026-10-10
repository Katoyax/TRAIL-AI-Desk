import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const deriveKey = promisify(scrypt);
// OWASP's scrypt minimum: 32 MiB, r=8, p=3. Kept fixed and versioned so
// a malformed database hash cannot choose unbounded KDF work parameters.
const options = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };
const prefix = 'scrypt$v1$32768$8$3';

export function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 12 || password.length > 128) {
    throw Object.assign(new Error('Use a password between 12 and 128 characters.'), { status: 400 });
  }
  return password;
}

export async function hashPassword(password) {
  validatePassword(password);
  const salt = randomBytes(16);
  const key = await deriveKey(password, salt, 64, options);
  return `${prefix}$${salt.toString('hex')}$${key.toString('hex')}`;
}

export async function verifyPassword(password, encoded) {
  if (typeof password !== 'string' || password.length > 128 || typeof encoded !== 'string') return false;
  const parts = encoded.split('$');
  if (parts.length !== 7 || parts.slice(0, 5).join('$') !== prefix ||
      !/^[a-f0-9]{32}$/.test(parts[5]) || !/^[a-f0-9]{128}$/.test(parts[6])) return false;
  const expected = Buffer.from(parts[6], 'hex');
  const actual = await deriveKey(password, Buffer.from(parts[5], 'hex'), expected.length, options);
  return timingSafeEqual(actual, expected);
}
