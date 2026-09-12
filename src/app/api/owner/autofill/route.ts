import { NextRequest, NextResponse } from 'next/server';
import {
  getCategorySeedData,
  resolveShopCategory,
} from '@/lib/shopCategories';

type AiResponse = {
  tagline?: string;
  description?: string;
  openTime?: string;
  closeTime?: string;
};

function cleanText(value: unknown, maxLen: number): string {
  return String(value ?? '').trim().slice(0, maxLen);
}

function parseJsonFromModel(raw: string): AiResponse {
  const cleaned = raw.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleaned) as AiResponse;
  return {
    tagline: cleanText(parsed.tagline, 80),
    description: cleanText(parsed.description, 600),
    openTime: cleanText(parsed.openTime, 5),
    closeTime: cleanText(parsed.closeTime, 5),
  };
}

async function generateWithAnthropic(params: {
  apiKey: string;
  shopName: string;
  categoryLabel: string;
  city: string;
  fallbackTagline: string;
  fallbackDescription: string;
}): Promise<AiResponse | null> {
  const prompt = `You are helping a local shop owner create profile text.

Shop name: ${params.shopName}
Category: ${params.categoryLabel}
City: ${params.city}

Return only valid JSON with this exact shape:
{
  "tagline": "max 8 words",
  "description": "2-3 short sentences, local and trustworthy tone",
  "openTime": "09:00",
  "closeTime": "21:00"
}

Do not return markdown.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': params.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const text = data?.content?.find((entry: any) => entry?.type === 'text')?.text;
  if (!text) return null;

  try {
    return parseJsonFromModel(text);
  } catch {
    return {
      tagline: params.fallbackTagline,
      description: params.fallbackDescription,
      openTime: '09:00',
      closeTime: '21:00',
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const shopName = cleanText(body?.shopName, 120) || 'My Shop';
    const city = cleanText(body?.city, 80) || 'Meerut';

    const resolvedCategory = resolveShopCategory(body?.category);
    const seed = getCategorySeedData(resolvedCategory.id);

    const fallbackTagline = `${shopName} - ${seed.fallbackTagline}`.slice(0, 80);
    const fallbackDescription = `${shopName} is a ${resolvedCategory.label.toLowerCase()} business in ${city}. ${seed.fallbackDescription}`.slice(
      0,
      600
    );

    const apiKey = process.env.ANTHROPIC_API_KEY;
    const ai = apiKey
      ? await generateWithAnthropic({
          apiKey,
          shopName,
          categoryLabel: resolvedCategory.label,
          city,
          fallbackTagline,
          fallbackDescription,
        })
      : null;

    return NextResponse.json({
      source: ai ? 'ai' : 'fallback',
      category: resolvedCategory.id,
      categoryLabel: resolvedCategory.label,
      tagline: cleanText(ai?.tagline || fallbackTagline, 80),
      description: cleanText(ai?.description || fallbackDescription, 600),
      openTime: cleanText(ai?.openTime || '09:00', 5) || '09:00',
      closeTime: cleanText(ai?.closeTime || '21:00', 5) || '21:00',
      specialties: seed.specialties,
      suggestedProducts: seed.suggestedProducts,
    });
  } catch (err: any) {
    console.error('[POST /api/owner/autofill]', err?.message ?? err);
    return NextResponse.json({ error: 'Unable to generate category autofill' }, { status: 500 });
  }
}
