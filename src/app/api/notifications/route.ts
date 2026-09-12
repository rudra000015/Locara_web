import { NextRequest, NextResponse } from 'next/server';
import { listNotifications } from '@/lib/notifications';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limitRaw = Number(searchParams.get('limit') ?? '40');
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(100, limitRaw)) : 40;

  const notifications = await listNotifications(limit);
  return NextResponse.json({ notifications }, { status: 200 });
}
