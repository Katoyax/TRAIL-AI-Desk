export async function requestChat(apiUrl, question, conversation, fetcher = fetch) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetcher(`${apiUrl.replace(/\/$/, '')}/api/chat`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ question, conversation: conversation.slice(-8) }),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'TRAIL API request failed.');
    return body;
  } finally {
    clearTimeout(timeout);
  }
}
