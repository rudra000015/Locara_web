import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { category, shopName, city = "Meerut" } = await req.json();

  const prompt = `You are helping a small Indian shop owner create their digital profile.

Shop details:
- Name: ${shopName}
- Category: ${category}
- City: ${city}

Generate a complete shop profile in simple, warm Hindi-English (Hinglish) that feels authentic for a traditional Indian market shop. Return ONLY valid JSON with no extra text:

{
  "tagline": "Short catchy tagline in Hinglish (max 8 words)",
  "description": "2-3 sentence warm description of the shop in Hinglish, mentioning heritage and quality",
  "specialties": ["specialty 1", "specialty 2", "specialty 3", "specialty 4"],
  "suggestedProducts": [
    { "name": "product name", "price": 50, "unit": "kg" },
    { "name": "product name", "price": 20, "unit": "piece" },
    { "name": "product name", "price": 100, "unit": "packet" },
    { "name": "product name", "price": 30, "unit": "litre" },
    { "name": "product name", "price": 15, "unit": "piece" }
  ],
  "openTime": "09:00",
  "closeTime": "21:00",
  "whatsappMessage": "Friendly WhatsApp greeting message for customers in Hinglish"
}`;

  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text = (message.content[0] as any).text;
  const json = JSON.parse(text);

  return NextResponse.json(json);
}