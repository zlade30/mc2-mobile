export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  createdAt: string;
}
