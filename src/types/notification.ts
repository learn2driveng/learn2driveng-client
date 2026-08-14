export type AppNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: {
    participantId?: string;
    sessionId?: string;
  } | null;
  readAt?: string | null;
  createdAt: string;
};
