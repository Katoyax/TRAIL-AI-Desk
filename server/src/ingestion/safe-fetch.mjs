import { lookup as dnsLookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { request as httpsRequest } from 'node:https';

export const DEFAULT_ALLOWED_DOMAINS = ['ustp.edu.ph'];
const invalid = (message) => Object.assign(new Error(message), { status: 400 });

export function validateSourceUrl(input, { allowedDomains = DEFAULT_ALLOWED_DOMAINS } = {}) {
  let url;
  try { url = new URL(input); } catch { throw invalid('Enter a valid official HTTPS URL.'); }
  const hostname = url.hostname.toLowerCase();
  if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443') || isIP(hostname.replace(/[\[\]]/g, ''))) {
    throw invalid('Official URLs must use HTTPS without credentials, IP addresses, or custom ports.');
  }
  if (!allowedDomains.some((domain) => {
    const approved = String(domain).trim().toLowerCase().replace(/^\./, '');
    return approved && (hostname === approved || hostname.endsWith(`.${approved}`));
  })) throw invalid('This URL is outside the approved university domains.');
  url.hash = '';
  return url;
}

// Accept globally routable addresses only. This also blocks metadata servers and
// IPv4-mapped IPv6 addresses, rather than relying on host names alone.
export function isPublicAddress(address) {
  const family = isIP(address);
  if (family === 4) {
    const [a, b, c] = address.split('.').map(Number);
    return !(a === 0 || a === 10 || a === 127 || a >= 224
      || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254)
      || (a === 172 && b >= 16 && b <= 31)
      || (a === 192 && (b === 0 || b === 168 || (b === 88 && c === 99)))
      || (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100)))
      || (a === 203 && b === 0 && c === 113));
  }
  if (family === 6) {
    const lower = address.toLowerCase();
    const [firstPart, secondPart] = lower.split(':');
    const first = Number.parseInt(firstPart, 16);
    const second = secondPart ? Number.parseInt(secondPart, 16) : 0;
    return first >= 0x2000 && first <= 0x3fff
      && !(first === 0x2001 && (second === 0 || second === 0xdb8)) && first !== 0x2002;
  }
  return false;
}

export async function resolvePublicAddresses(url, { lookup = dnsLookup, timeoutMs = 12_000 } = {}) {
  let timer;
  try {
    const addresses = await Promise.race([
      lookup(url.hostname, { all: true, verbatim: true }),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Official-source DNS lookup timed out.')), timeoutMs); }),
    ]);
    if (!addresses.length || addresses.some(({ address }) => !isPublicAddress(address))) {
      throw invalid('The official URL resolved to a private or reserved network address.');
    }
    return addresses;
  } finally { clearTimeout(timer); }
}

function pinnedRequest(url, { address, family, timeoutMs, maxBytes }) {
  return new Promise((resolve, reject) => {
    // Disable pooled connections and pin DNS to the address validated above;
    // subsequent DNS changes cannot redirect the socket into an internal network.
    const request = httpsRequest(url, {
      agent: false, servername: url.hostname,
      lookup: (_hostname, options, callback) => options?.all
        ? callback(null, [{ address, family }]) : callback(null, address, family),
      headers: { accept: 'text/html, application/pdf, text/plain', 'accept-encoding': 'identity', 'user-agent': 'TRAIL-AI-Desk/1.0 source-verification' },
    }, (response) => {
      const parts = [];
      let length = 0;
      if (Number(response.headers['content-length']) > maxBytes) {
        response.destroy(invalid('The official source exceeds the upload size limit.'));
      }
      response.on('data', (part) => {
        length += part.length;
        if (length > maxBytes) response.destroy(invalid('The official source exceeds the upload size limit.'));
        else parts.push(part);
      });
      response.on('error', reject);
      response.on('end', () => resolve({ status: response.statusCode, headers: response.headers, bytes: Buffer.concat(parts) }));
    });
    const timer = setTimeout(() => request.destroy(new Error('Official-source fetch timed out.')), timeoutMs);
    request.once('close', () => clearTimeout(timer));
    request.once('error', reject);
    request.end();
  });
}

export async function fetchOfficialSource(input, {
  allowedDomains = DEFAULT_ALLOWED_DOMAINS, lookup = dnsLookup, request = pinnedRequest,
  timeoutMs = 12_000, maxBytes = 8 * 1024 * 1024, maxRedirects = 4,
} = {}) {
  let url = validateSourceUrl(input, { allowedDomains });
  const deadline = Date.now() + timeoutMs;
  for (let redirect = 0; redirect <= maxRedirects; redirect++) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw new Error('Official-source fetch timed out.');
    const addresses = await resolvePublicAddresses(url, { lookup, timeoutMs: remaining });
    const result = await request(url, { ...addresses[0], timeoutMs: Math.max(1, deadline - Date.now()), maxBytes });
    if ([301, 302, 303, 307, 308].includes(result.status)) {
      if (!result.headers.location || redirect === maxRedirects) throw invalid('Official-source redirect limit exceeded.');
      url = validateSourceUrl(new URL(result.headers.location, url).href, { allowedDomains });
      continue;
    }
    if (result.status < 200 || result.status >= 300) throw new Error(`Official source returned HTTP ${result.status}.`);
    if (result.bytes.length > maxBytes) throw invalid('The official source exceeds the upload size limit.');
    const contentType = String(result.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
    if (!['text/html', 'application/xhtml+xml', 'application/pdf', 'text/plain'].includes(contentType)) {
      throw invalid('Official sources must be HTML, PDF, or plain text.');
    }
    return { ...result, sourceUrl: url.href, contentType };
  }
  throw invalid('Official-source redirect limit exceeded.');
}
