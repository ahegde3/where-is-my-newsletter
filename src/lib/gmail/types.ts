// Raw parsed email from Gmail before LLM processing
export interface RawNewsletter {
  messageId: string;
  sender: string;
  senderName: string | null;
  subject: string;
  receivedAt: Date;
  plainText: string;
  link: string | null;
}

export interface FetchNewslettersInput {
  accessToken: string;
  afterDate?: Date;
  maxResults?: number;
}
