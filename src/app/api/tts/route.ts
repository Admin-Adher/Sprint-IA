import { NextResponse } from "next/server";

import { isTtsConfigured, synthesizeSpeech } from "@/lib/ai/tts";

export const maxDuration = 15;

const MAX_TEXT = 400;

export async function GET() {
  return NextResponse.json({ available: isTtsConfigured() });
}

export async function POST(request: Request) {
  if (!isTtsConfigured()) {
    return NextResponse.json({ error: "Voix indisponible." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as { text?: unknown } | null;
  const text = typeof body?.text === "string" ? body.text.trim() : "";

  if (!text) {
    return NextResponse.json({ error: "Le texte est obligatoire." }, { status: 400 });
  }

  if (text.length > MAX_TEXT) {
    return NextResponse.json({ error: "Texte trop long." }, { status: 400 });
  }

  try {
    const audio = await synthesizeSpeech(text);
    return new NextResponse(Buffer.from(audio), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Voix indisponible." }, { status: 503 });
  }
}
