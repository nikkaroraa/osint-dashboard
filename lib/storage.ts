"use client";

import { Source } from "./types";
import { defaultSources, defaultKeywords } from "./default-sources";

const SOURCES_KEY = "osint-sources";
const KEYWORDS_KEY = "osint-keywords";

export function getSources(): Source[] {
  if (typeof window === "undefined") return defaultSources;
  const stored = localStorage.getItem(SOURCES_KEY);
  if (!stored) {
    localStorage.setItem(SOURCES_KEY, JSON.stringify(defaultSources));
    return defaultSources;
  }
  return JSON.parse(stored);
}

export function saveSources(sources: Source[]) {
  localStorage.setItem(SOURCES_KEY, JSON.stringify(sources));
}

export function getKeywords(): string[] {
  if (typeof window === "undefined") return defaultKeywords;
  const stored = localStorage.getItem(KEYWORDS_KEY);
  if (!stored) {
    localStorage.setItem(KEYWORDS_KEY, JSON.stringify(defaultKeywords));
    return defaultKeywords;
  }
  return JSON.parse(stored);
}

export function saveKeywords(keywords: string[]) {
  localStorage.setItem(KEYWORDS_KEY, JSON.stringify(keywords));
}
