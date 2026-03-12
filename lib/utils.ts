import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SourceType, TimeFilter } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sourceTypeLabel(type: SourceType): string {
  switch (type) {
    case "news":
      return "News";
    case "reddit":
      return "Reddit";
    case "social":
      return "Social";
    case "alert":
      return "Alert";
    default:
      return type;
  }
}

export function sourceTypeDotClass(type: SourceType): string {
  switch (type) {
    case "news":
      return "bg-blue-400";
    case "reddit":
      return "bg-orange-400";
    case "social":
      return "bg-purple-400";
    case "alert":
      return "bg-red-400";
    default:
      return "bg-zinc-400";
  }
}

export function sourceTypeBadgeClass(type: SourceType): string {
  switch (type) {
    case "news":
      return "border-blue-500/30 bg-blue-500/10 text-blue-300";
    case "reddit":
      return "border-orange-500/30 bg-orange-500/10 text-orange-300";
    case "social":
      return "border-purple-500/30 bg-purple-500/10 text-purple-300";
    case "alert":
      return "border-red-500/30 bg-red-500/10 text-red-300";
    default:
      return "border-zinc-700 bg-zinc-900 text-zinc-300";
  }
}

export function stripHtml(text: string): string {
  if (!text) return "";

  const withoutComments = text.replace(/<!--[\s\S]*?-->/g, " ");
  const withoutTags = withoutComments.replace(/<\/?[^>]+>/g, " ");
  const decoded = decodeHtmlEntities(withoutTags);
  const normalized = decoded.replace(/\s+/g, " ").trim();

  return truncateForCard(normalized);
}

const HTML_ENTITY_MAP: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: "\"",
  apos: "'",
  "#039": "'",
  nbsp: " ",
};

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&#x([0-9a-fA-F]+);/g, (_match, hex) => {
      const codePoint = Number.parseInt(hex, 16);
      return Number.isNaN(codePoint) ? "" : String.fromCodePoint(codePoint);
    })
    .replace(/&#(\d+);/g, (_match, dec) => {
      const codePoint = Number.parseInt(dec, 10);
      return Number.isNaN(codePoint) ? "" : String.fromCodePoint(codePoint);
    })
    .replace(/&([a-zA-Z#0-9]+);/g, (match, name) => {
      const key = name.toLowerCase();
      return HTML_ENTITY_MAP[key] ?? match;
    });
}

function truncateForCard(input: string, maxLength = 250): string {
  if (input.length <= maxLength) return input;
  const truncated = input.slice(0, Math.max(0, maxLength - 3)).trimEnd();
  return `${truncated}...`;
}

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function highlightKeywords(text: string, keywords: string[]): string {
  if (!text || keywords.length === 0) return text;
  const valid = keywords.map((k) => k.trim()).filter(Boolean);
  if (valid.length === 0) return text;

  const pattern = new RegExp(`(${valid.map(escapeRegExp).join("|")})`, "gi");
  return text.replace(pattern, '<mark class="keyword">$1</mark>');
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (Number.isNaN(seconds) || seconds < 0) return "just now";
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

export function isWithinTimeFilter(dateString: string, filter: TimeFilter): boolean {
  if (filter === "all") return true;

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return true;

  const now = new Date();
  const diff = now.getTime() - date.getTime();

  switch (filter) {
    case "1h":
      return diff <= 60 * 60 * 1000;
    case "24h":
      return diff <= 24 * 60 * 60 * 1000;
    case "7d":
      return diff <= 7 * 24 * 60 * 60 * 1000;
    default:
      return true;
  }
}
