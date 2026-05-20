export interface AppNotification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationSummary {
  items: AppNotification[];
  unread_count: number;
}
