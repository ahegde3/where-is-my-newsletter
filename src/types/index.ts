export interface Publisher {
  id: string;
  userId: string;
  name: string | null;
  email: string;
  createdAt: Date;
}

export interface Newsletter {
  id: string;
  userId: string;
  publisherId: string;
  messageId: string;
  subject: string;
  receivedAt: Date;
  plainText: string | null;
  link: string | null;
  summary: string | null;
  topics: string[];
  isRead: boolean;
  processedAt: Date | null;
  createdAt: Date;
}

export interface NewsletterWithPublisher extends Newsletter {
  publisher: Publisher;
}

export type ReadFilter = "all" | "read" | "unread";

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SyncResult {
  synced: number;
  total: number;
}
