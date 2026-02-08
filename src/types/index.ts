export interface Newsletter {
  id: string;
  userId: string;
  messageId: string;
  sender: string;
  senderName: string | null;
  subject: string;
  receivedAt: Date;
  htmlBody: string | null;
  plainText: string | null;
  viewInBrowserLink: string | null;
  summary: string | null;
  topics: string[];
  isRead: boolean;
  processedAt: Date | null;
  createdAt: Date;
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
