import { NextResponse } from 'next/server';
import { FESTIVALS, getActiveFestivals } from '@/data/festivals';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    festivals: FESTIVALS,
    active: getActiveFestivals(),
  });
}
