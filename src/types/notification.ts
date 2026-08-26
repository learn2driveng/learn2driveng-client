export type AppNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: {
    notificationId?: string;
    participantId?: string;
    sessionId?: string;
  } | null;
  readAt?: string | null;
  createdAt: string;
};

export type NotificationPreferences = {
  sessionReminders: boolean;
  packageUpdates: boolean;
  promotions: boolean;
  lessonReminders: boolean;
  scheduleChanges: boolean;
  reportReminders: boolean;
};

export type NotificationPreferenceKey = keyof NotificationPreferences;
