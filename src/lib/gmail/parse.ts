import type { gmail_v1 } from "googleapis";
import * as cheerio from "cheerio";

// ─── Header extraction ───────────────────────────────────────

function getHeader(
  { payload }: { payload: gmail_v1.Schema$MessagePart | undefined },
  name: string
): string | null {
  if (!payload?.headers) return null;
  const header = payload.headers.find(
    (h) => h.name?.toLowerCase() === name.toLowerCase()
  );
  return header?.value ?? null;
}

export function parseSender({ from }: { from: string | null }): {
  email: string;
  name: string | null;
} {
  if (!from) return { email: "unknown@unknown.com", name: null };

  // Format: "Display Name <email@example.com>" or just "email@example.com"
  const match = from.match(/^(?:"?([^"<]*)"?\s*)?<?([^>]+@[^>]+)>?$/);
  if (!match) return { email: from.trim(), name: null };

  const name = match[1]?.trim() || null;
  const email = match[2]?.trim() || from.trim();
  return { email, name };
}

export function parseDate({
  internalDate,
}: {
  internalDate: string | null | undefined;
}): Date {
  if (!internalDate) return new Date();
  return new Date(parseInt(internalDate, 10));
}

// ─── Body decoding ───────────────────────────────────────────

function decodeBase64Url(encoded: string): string {
  // Gmail uses URL-safe base64
  const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(base64, "base64").toString("utf-8");
}

function findBodyPart({
  payload,
  mimeType,
}: {
  payload: gmail_v1.Schema$MessagePart | undefined;
  mimeType: string;
}): string | null {
  if (!payload) return null;

  // Direct body match
  if (payload.mimeType === mimeType && payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }

  // Recurse into multipart
  if (payload.parts) {
    for (const part of payload.parts) {
      const result = findBodyPart({ payload: part, mimeType });
      if (result) return result;
    }
  }

  return null;
}

export function extractBody({
  payload,
}: {
  payload: gmail_v1.Schema$MessagePart | undefined;
}): {
  html: string | null;
  plainText: string | null;
} {
  const html = findBodyPart({ payload, mimeType: "text/html" });
  const plainText = findBodyPart({ payload, mimeType: "text/plain" });
  return { html, plainText };
}

// ─── HTML processing ─────────────────────────────────────────

const VIEW_IN_BROWSER_PATTERNS = [
  /view\s+(this\s+)?(email\s+)?in\s+(your\s+)?browser/i,
  /view\s+(this\s+)?(email\s+)?online/i,
  /view\s+(this\s+)?in\s+(a\s+)?web\s*browser/i,
  /read\s+(this\s+)?online/i,
  /view\s+online/i,
  /open\s+in\s+browser/i,
  /browser\s+version/i,
  /web\s+version/i,
];

export function extractViewInBrowserLink({
  html,
}: {
  html: string | null;
}): string | null {
  if (!html) return null;

  const $ = cheerio.load(html);
  let found: string | null = null;

  $("a").each((_, el) => {
    if (found) return false; // stop once found
    const text = $(el).text().trim();
    const href = $(el).attr("href");
    if (!href || href.startsWith("mailto:")) return;

    for (const pattern of VIEW_IN_BROWSER_PATTERNS) {
      if (pattern.test(text)) {
        found = href;
        return false;
      }
    }
  });

  return found;
}

export function stripHtmlToPlainText({
  html,
}: {
  html: string | null;
}): string {
  if (!html) return "";

  const $ = cheerio.load(html);

  // Remove script, style, head elements
  $("script, style, head, noscript").remove();

  // Get text content
  let text = $("body").text() || $.root().text();

  // Clean up whitespace: collapse multiple newlines/spaces
  text = text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n /g, "\n")
    .trim();

  return text;
}

// ─── Full message parser ─────────────────────────────────────

export function parseMessage({
  message,
}: {
  message: gmail_v1.Schema$Message;
}): {
  messageId: string;
  sender: string;
  senderName: string | null;
  subject: string;
  receivedAt: Date;
  plainText: string;
  link: string | null;
} {
  const from = getHeader({ payload: message.payload }, "From");
  const subject =
    getHeader({ payload: message.payload }, "Subject") ?? "(no subject)";
  const { email, name } = parseSender({ from });
  const receivedAt = parseDate({ internalDate: message.internalDate });

  const { html, plainText: rawPlainText } = extractBody({
    payload: message.payload,
  });

  // Prefer HTML-derived plain text (better formatting), fall back to raw plain text
  const plainText = html ? stripHtmlToPlainText({ html }) : rawPlainText ?? "";

  const link = extractViewInBrowserLink({ html });

  return {
    messageId: message.id!,
    sender: email,
    senderName: name,
    subject,
    receivedAt,
    plainText,
    link,
  };
}
