import { createHash } from 'node:crypto';

export function cleanText(value) {
  return String(value || '').normalize('NFKC').replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .replace(/[\t ]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function contentHash(text) { return createHash('sha256').update(cleanText(text)).digest('hex'); }

export function chunkText(text, { size = 1800, overlap = 250 } = {}) {
  if (!Number.isInteger(size) || size < 200 || overlap < 0 || overlap >= size) throw new Error('Invalid chunk size or overlap.');
  const normalized = cleanText(text);
  const chunks = [];
  let start = 0;
  while (start < normalized.length) {
    let end = Math.min(start + size, normalized.length);
    if (end < normalized.length) {
      const boundary = normalized.lastIndexOf(' ', end);
      if (boundary > start + size * 0.65) end = boundary;
    }
    const content = normalized.slice(start, end).trim();
    if (content) chunks.push({ content, index: chunks.length, start, end });
    if (end === normalized.length) break;
    start = Math.max(start + 1, end - overlap);
  }
  return chunks;
}

export async function extractText(bytes, contentType, { pdfParser } = {}) {
  let text;
  let title = '';
  if (contentType === 'application/pdf') {
    if (bytes.subarray(0, 5).toString() !== '%PDF-') throw Object.assign(new Error('The file is not a valid PDF.'), { status: 400 });
    if (pdfParser) text = await pdfParser(bytes);
    else {
      const { PDFParse } = await import('pdf-parse');
      const parser = new PDFParse({ data: new Uint8Array(bytes) });
      try { text = (await parser.getText()).text; } finally { await parser.destroy(); }
    }
  } else if (['text/html', 'application/xhtml+xml'].includes(contentType)) {
    const { load } = await import('cheerio');
    const $ = load(bytes.toString('utf8'));
    title = cleanText($('title').first().text());
    $('script, style, noscript, iframe, nav, header, footer, form, [hidden], [aria-hidden="true"]').remove();
    $('br').replaceWith('\n');
    $('p, h1, h2, h3, h4, li, tr, section, div').append('\n');
    const main = $('main, article, [role="main"]').first();
    text = (main.length ? main : $('body')).text();
  } else if (contentType === 'text/plain') text = bytes.toString('utf8');
  else throw Object.assign(new Error('Only PDF and UTF-8 text document uploads are supported.'), { status: 400 });
  text = cleanText(text);
  if (text.length < 20) throw Object.assign(new Error('No readable document text was found. Scanned PDFs need OCR before uploading.'), { status: 400 });
  if (text.length > 750_000) throw Object.assign(new Error('Extracted text is too large for this prototype.'), { status: 413 });
  return { text, title };
}

export function decodeUpload(upload, { maxBytes = 5 * 1024 * 1024 } = {}) {
  if (!upload || typeof upload.data !== 'string' || !/^[A-Za-z0-9+/]*={0,2}$/.test(upload.data)
    || upload.data.length % 4 !== 0) throw Object.assign(new Error('Upload must contain valid base64 document data.'), { status: 400 });
  if (upload.data.length > Math.ceil(maxBytes / 3) * 4) throw Object.assign(new Error('The uploaded document exceeds 5 MB.'), { status: 413 });
  const bytes = Buffer.from(upload.data, 'base64');
  if (!bytes.length || bytes.length > maxBytes || bytes.toString('base64') !== upload.data) throw Object.assign(new Error('Invalid document data or document exceeds 5 MB.'), { status: 400 });
  const mimeType = String(upload.mimeType || '').toLowerCase();
  if (!['application/pdf', 'text/plain'].includes(mimeType)) throw Object.assign(new Error('Upload a PDF or plain text document.'), { status: 400 });
  const filename = String(upload.filename || 'document').replace(/[^a-zA-Z0-9._ -]/g, '_').slice(0, 120).replace(/^\.+/, '') || 'document';
  return { bytes, mimeType, filename };
}
