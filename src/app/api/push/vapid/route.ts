import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const publicKey =
    process.env.VAPID_PUBLIC_KEY ??
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ??
    '';

  if (!publicKey) {
    return NextResponse.json(
      {
        enabled: false,
        publicKey: null,
        message: 'Push notifications are disabled. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY in .env.local.',
      },
      { status: 200 }
    );
  }

  return NextResponse.json({ enabled: true, publicKey }, { status: 200 });
}
