import { NextRequest, NextResponse } from 'next/server';
import { saveNotification } from '@/lib/notifications';
import { readPushDb, writePushDb } from '@/lib/pushDb';

export const runtime = 'nodejs';

type NotifyPayload = {
  title: string;
  body: string;
  type?: 'new_product' | 'offer' | 'open_now' | 'general';
  url?: string;
  shopId?: string | null;
  shopName?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
};

function envSecret() {
  return (
    process.env.NOTIFY_SECRET ??
    process.env.NEXT_PUBLIC_NOTIFY_SECRET ??
    'purani-dukan-secret'
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const secret = String(body?.secret ?? '');
    const shopId = String(body?.shopId ?? '');
    const payload = body?.payload as NotifyPayload | undefined;

    if (!payload?.title || !payload?.body) {
      return NextResponse.json({ success: false, error: 'Missing payload' }, { status: 400 });
    }

    if (secret !== envSecret()) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const notification = await saveNotification({
      title: payload.title,
      body: payload.body,
      type: payload.type ?? 'general',
      shopId: payload.shopId ?? shopId ?? null,
      shopName: payload.shopName,
      url: payload.url || (shopId ? `/explorer/shop/${shopId}` : '/explorer/notifications'),
    });

    const publicKey =
      process.env.VAPID_PUBLIC_KEY ??
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ??
      '';
    const privateKey = process.env.VAPID_PRIVATE_KEY ?? '';
    const subject = process.env.VAPID_SUBJECT ?? 'mailto:example@example.com';

    let webPush: any = null;
    try {
      webPush = require('web-push');
    } catch {
      webPush = null;
    }

    if (!webPush || !publicKey || !privateKey) {
      return NextResponse.json(
        {
          success: true,
          sent: 0,
          failed: 0,
          totalTargets: 0,
          delivery: 'feed-only',
          notification,
        },
        { status: 200 }
      );
    }

    webPush.setVapidDetails(subject, publicKey, privateKey);

    const db = await readPushDb();
    const targets = db.subscriptions.filter((subscription) => {
      if (shopId) return (subscription.shopIds ?? []).includes(shopId);
      return true;
    });

    const toRemove: string[] = [];
    const results = await Promise.allSettled(
      targets.map(async (subscription) => {
        if (
          payload.type &&
          subscription.types?.length &&
          !subscription.types.includes(payload.type)
        ) {
          return 'skipped';
        }

        const sub = {
          endpoint: subscription.endpoint,
          keys: subscription.keys,
          expirationTime: subscription.expirationTime ?? undefined,
        };

        try {
          await webPush.sendNotification(sub, JSON.stringify(payload));
          return 'sent';
        } catch (error: any) {
          const code = error?.statusCode ?? error?.status;
          if (code === 404 || code === 410) {
            toRemove.push(subscription.endpoint);
          }
          return 'failed';
        }
      })
    );

    const sent = results.filter((result) => result.status === 'fulfilled' && result.value === 'sent').length;
    const failed = results.filter((result) => {
      if (result.status === 'rejected') return true;
      return result.value === 'failed';
    }).length;

    if (toRemove.length > 0) {
      await writePushDb({
        subscriptions: db.subscriptions.filter((subscription) => !toRemove.includes(subscription.endpoint)),
      });
    }

    return NextResponse.json(
      {
        success: true,
        sent,
        failed,
        totalTargets: targets.length,
        delivery: 'push-and-feed',
        notification,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[POST /api/notify]', error?.message ?? error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
