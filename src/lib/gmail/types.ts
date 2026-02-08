// Raw parsed email from Gmail before LLM processing
export interface RawNewsletter {
  id: string;
  messageId: string;
  from: {
    name: string | null;
    email: string;
  };
  subject: string;
  receivedAt: Date;
  htmlBody: string | null;
  plainText: string | null;
  link: string | null;
}

export interface FetchNewslettersInput {
  accessToken: string;
  afterDate?: Date;
  maxResults?: number;
}
