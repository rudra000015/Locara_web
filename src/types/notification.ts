export type NotificationType = 'new_product' | 'offer' | 'open_now' | 'general';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  type: NotificationType;
  shopId?: string | null;
  shopName?: string;
  url?: string;
}
