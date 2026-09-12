import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import path from 'path';
import { AppNotification } from '@/types/notification';

type NotificationStore = {
  notifications: AppNotification[];
};

const DB_PATH = path.join(process.cwd(), 'data', 'notifications.json');
const EVENT_NAME = 'notification';

declare global {
  // eslint-disable-next-line no-var
  var __locaraNotificationEmitter__: EventEmitter | undefined;
}

function getEmitter() {
  if (!global.__locaraNotificationEmitter__) {
    global.__locaraNotificationEmitter__ = new EventEmitter();
    global.__locaraNotificationEmitter__.setMaxListeners(0);
  }

  return global.__locaraNotificationEmitter__;
}

async function ensureDb() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify({ notifications: [] }, null, 2), 'utf8');
  }
}

export async function readNotificationDb(): Promise<NotificationStore> {
  await ensureDb();

  try {
    const raw = await fs.readFile(DB_PATH, 'utf8');
    const parsed = JSON.parse(raw) as NotificationStore;
    return {
      notifications: Array.isArray(parsed?.notifications) ? parsed.notifications : [],
    };
  } catch {
    return { notifications: [] };
  }
}

export async function writeNotificationDb(store: NotificationStore) {
  await ensureDb();
  await fs.writeFile(DB_PATH, JSON.stringify(store, null, 2), 'utf8');
}

export async function listNotifications(limit = 50): Promise<AppNotification[]> {
  const store = await readNotificationDb();
  return [...store.notifications]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export async function saveNotification(
  payload: Omit<AppNotification, 'id' | 'createdAt'>
): Promise<AppNotification> {
  const store = await readNotificationDb();
  const notification: AppNotification = {
    ...payload,
    id:
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };

  const notifications = [notification, ...store.notifications].slice(0, 250);
  await writeNotificationDb({ notifications });
  getEmitter().emit(EVENT_NAME, notification);
  return notification;
}

export function subscribeToNotifications(handler: (notification: AppNotification) => void) {
  const emitter = getEmitter();
  emitter.on(EVENT_NAME, handler);
  return () => emitter.off(EVENT_NAME, handler);
}
