export type NotificationType = 'push' | 'in_app' | 'sms' | 'email';

export interface NotificationData {
  orderId?: string;
  depotId?: string;
  driverId?: string;
  [key: string]: string | undefined;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  data: NotificationData;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationListParams {
  page?: number;
  limit?: number;
}

export interface MarkReadRequest {
  ids: string[];
}
