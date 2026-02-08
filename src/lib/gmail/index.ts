import type { gmail_v1 } from "googleapis";
import { getGmailClient } from "./client";
import { parseMessage } from "./parse";
import type { RawNewsletter, FetchNewslettersInput } from "./types";

export type { RawNewsletter, FetchNewslettersInput };

// ─── Hardcoded sender list (move to DB / env later) ──────────

export const NEWSLETTER_SENDERS = [
  "nl@email.vestedfinance.com",
  "bytebytego@substack.com",
];

// ─── Build Gmail search query ────────────────────────────────

function buildQuery({
  senders,
  afterDate,
}: {
  senders: string[];
  afterDate?: Date;
}): string {
  // from:(a OR b OR c)
  const fromClause = `from:(${senders.join(" OR ")})`;

  if (!afterDate) return fromClause;

  // Gmail "after:" uses epoch seconds
  const epochSeconds = Math.floor(afterDate.getTime() / 1000);
  return `${fromClause} after:${epochSeconds}`;
}

// ─── List message IDs ────────────────────────────────────────

async function listMessageIds({
  gmail,
  query,
  maxResults = 50,
}: {
  gmail: gmail_v1.Gmail;
  query: string;
  maxResults: number;
}): Promise<string[]> {
  const ids: string[] = [];
  let pageToken: string | undefined;

  do {
    const response = await gmail.users.messages.list({
      userId: "me",
      q: query,
      maxResults: Math.min(maxResults - ids.length, 100),
      pageToken,
    });

    const messages = response.data.messages ?? [];
    for (const msg of messages) {
      if (msg.id) ids.push(msg.id);
    }

    pageToken = response.data.nextPageToken ?? undefined;

    if (ids.length >= maxResults) break;
  } while (pageToken);

  return ids.slice(0, maxResults);
}

// ─── Fetch a single full message ─────────────────────────────

async function fetchFullMessage({
  gmail,
  messageId,
}: {
  gmail: gmail_v1.Gmail;
  messageId: string;
}): Promise<RawNewsletter> {
  const response = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });

  return parseMessage({ message: response.data });
}

// ─── Public API ──────────────────────────────────────────────

export async function fetchNewsletters({
  accessToken,
  afterDate,
  maxResults = 50,
}: FetchNewslettersInput): Promise<RawNewsletter[]> {
  if (!accessToken) throw new Error("No access token provided");

  const gmail = getGmailClient({ accessToken });

  const query = buildQuery({
    senders: NEWSLETTER_SENDERS,
    afterDate,
  });

  const messageIds = await listMessageIds({ gmail, query, maxResults });

  if (messageIds.length === 0) return [];

  // Fetch full messages in parallel (batches of 5 to avoid rate limits)
  const newsletters: RawNewsletter[] = [];
  const batchSize = 5;

  for (let i = 0; i < messageIds.length; i += batchSize) {
    const batch = messageIds.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map((messageId) => fetchFullMessage({ gmail, messageId }))
    );
    newsletters.push(...results);
  }

  // Sort by date, newest first
  newsletters.sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime());

  return newsletters;
}
