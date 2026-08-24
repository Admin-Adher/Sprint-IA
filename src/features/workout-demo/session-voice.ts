"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MAX_TEXT = 400;

export function useSessionVoice() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cacheRef = useRef(new Map<string, string>());
  const generationRef = useRef(0);
  const openaiAvailableRef = useRef<boolean | null>(null);
  const [available, setAvailable] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/tts")
      .then((response) => response.json())
      .then((body: { available?: boolean }) => {
        if (cancelled) return;
        const openai = Boolean(body.available);
        openaiAvailableRef.current = openai;
        const browser = "speechSynthesis" in window;
        setAvailable(openai || browser);
        setUsingFallback(!openai && browser);
      })
      .catch(() => {
        if (cancelled) return;
        openaiAvailableRef.current = false;
        const browser = "speechSynthesis" in window;
        setAvailable(browser);
        setUsingFallback(browser);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const speakBrowser = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = 1.08;
    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    generationRef.current += 1;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
    }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  const playUrl = useCallback(async (url: string, text: string, generation: number) => {
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;
    audio.src = url;
    if (generation !== generationRef.current) return;
    try {
      await audio.play();
    } catch {
      if (generation === generationRef.current) speakBrowser(text);
    }
  }, [speakBrowser]);

  const fetchAndPlay = useCallback(async (text: string, generation: number) => {
    const cached = cacheRef.current.get(text);
    if (cached) {
      await playUrl(cached, text, generation);
      return;
    }
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) throw new Error("tts");
    const blob = await response.blob();
    if (generation !== generationRef.current) return;
    const url = URL.createObjectURL(blob);
    cacheRef.current.set(text, url);
    await playUrl(url, text, generation);
  }, [playUrl]);

  const speak = useCallback((text: string) => {
    const clipped = text.slice(0, MAX_TEXT);
    stop();
    const generation = generationRef.current;
    if (openaiAvailableRef.current === false) {
      speakBrowser(clipped);
      return;
    }
    void fetchAndPlay(clipped, generation).catch(() => {
      if (generation !== generationRef.current) return;
      openaiAvailableRef.current = false;
      setUsingFallback(true);
      speakBrowser(clipped);
    });
  }, [fetchAndPlay, speakBrowser, stop]);

  const prefetch = useCallback((texts: string[]) => {
    if (openaiAvailableRef.current !== true) return;
    for (const text of texts) {
      const clipped = text.slice(0, MAX_TEXT);
      if (!clipped || cacheRef.current.has(clipped)) continue;
      void fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: clipped }),
      })
        .then((response) => (response.ok ? response.blob() : Promise.reject()))
        .then((blob) => {
          if (cacheRef.current.has(clipped)) return;
          cacheRef.current.set(clipped, URL.createObjectURL(blob));
        })
        .catch(() => undefined);
    }
  }, []);

  useEffect(() => () => {
    stop();
    for (const url of cacheRef.current.values()) URL.revokeObjectURL(url);
  }, [stop]);

  return { available, usingFallback, speak, prefetch, stop };
}
