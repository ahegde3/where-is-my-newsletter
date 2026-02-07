export interface Newsletter {
  id: string;
  userId: string;
  gmailMessageId: string;
  sender: string;
  senderName: string | null;
  subject: string;
  receivedAt: Date;
  htmlBody: string | null;
  plainText: string | null;
  viewInBrowserLink: string | null;
  summary: string | null;
  topics: string[];
  processedAt: Date | null;
  createdAt: Date;
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SyncResult {
  synced: number;
  total: number;
}
