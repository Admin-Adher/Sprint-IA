const OPENAI_SPEECH_URL = "https://api.openai.com/v1/audio/speech";
const TTS_INSTRUCTIONS =
  "Coach HIIT francophone. Voix claire, phrases très courtes, rythme un peu rapide. Pas de dramatisation.";

export const isTtsConfigured = () => Boolean(process.env.OPENAI_API_KEY?.trim());

export async function synthesizeSpeech(text: string): Promise<Uint8Array> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY manquante.");
  }

  const response = await fetch(OPENAI_SPEECH_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini-tts",
      voice: "coral",
      input: text,
      instructions: TTS_INSTRUCTIONS,
      response_format: "mp3",
    }),
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`TTS OpenAI ${response.status}: ${detail.slice(0, 180)}`);
  }

  return new Uint8Array(await response.arrayBuffer());
}
