import { SourceType, TimeFilter } from "./types";

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export function isWithinTimeFilter(dateStr: string, filter: TimeFilter): boolean {
  if (filter === "all") return true;
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = diff / (1000 * 60 * 60);

  switch (filter) {
    case "1h": return hours <= 1;
    case "24h": return hours <= 24;
    case "7d": return hours <= 168;
    default: return true;
  }
}

export function sourceTypeColor(type: SourceType): string {
  switch (type) {
    case "news": return "#3b82f6";
    case "reddit": return "#f97316";
    case "social": return "#a855f7";
    case "alert": return "#ef4444";
  }
}

export function sourceTypeLabel(type: SourceType): string {
  switch (type) {
    case "news": return "NEWS";
    case "reddit": return "REDDIT";
    case "social": return "SOCIAL";
    case "alert": return "ALERT";
  }
}

export function highlightKeywords(text: string, keywords: string[]): string {
  if (!keywords.length) return text;
  const escaped = keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  return text.replace(regex, '<mark class="keyword">$1</mark>');
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").trim();
}
