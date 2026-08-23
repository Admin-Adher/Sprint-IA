import { NextResponse } from "next/server";

import { demoFixture } from "@/lib/ai/fixture";
import type { SprintInput } from "@/types/sprint";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as SprintInput | null;

  if (!body?.request?.trim()) {
    return NextResponse.json(
      { error: "Le champ request est obligatoire." },
      { status: 400 },
    );
  }

  return NextResponse.json(demoFixture);
}
