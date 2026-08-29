export type AppNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: {
    participantId?: string;
    sessionId?: string;
    shareUrl?: string;
    url?: string;
    instructorName?: string;
    learnerCount?: number;
  } | null;
  readAt?: string | null;
  createdAt: string;
};
