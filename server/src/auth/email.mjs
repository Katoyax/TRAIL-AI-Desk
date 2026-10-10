export function parseResetUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value);
    const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    if (url.username || url.password || url.hash || (url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback))) return null;
    return url;
  } catch { return null; }
}

export function createResetEmailSender(config = process.env, { fetchImpl = fetch } = {}) {
  const apiKey = config.RESEND_API_KEY?.trim();
  const from = config.RESET_EMAIL_FROM?.trim();
  if (!apiKey || !from) return null;
  return async ({ email, resetUrl, expiresMinutes }) => {
    const response = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST',
      signal: AbortSignal.timeout(10_000),
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from, to: [email], subject: 'Reset your TRAIL AI Desk password',
        text: `A password reset was requested for your TRAIL AI Desk account.\n\nOpen this link to choose a new password:\n${resetUrl}\n\nThis link expires in ${expiresMinutes} minutes and can be used once. If you did not request this, ignore this email.`,
      }),
    });
    if (!response.ok) throw new Error('The email provider rejected the reset email.');
    const result = await response.json();
    if (typeof result?.id !== 'string' || !result.id) throw new Error('The email provider did not accept the reset email.');
    // Provider acceptance is not proof of inbox delivery.
    return { accepted: true, id: result.id };
  };
}
