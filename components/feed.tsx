"use client";

import { FeedItem } from "@/lib/types";
import { timeAgo, sourceTypeColor, sourceTypeLabel, highlightKeywords } from "@/lib/utils";

interface FeedProps {
  items: FeedItem[];
  keywords: string[];
  loading: boolean;
}

export function Feed({ items, keywords, loading }: FeedProps) {
  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-pulse text-4xl mb-4">📡</div>
          <p style={{ color: "var(--text-muted)" }}>Fetching feeds...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-4xl mb-4">📭</div>
          <p style={{ color: "var(--text-muted)" }}>
            No items match your filters
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-2">
      <div
        className="text-xs mb-3"
        style={{ color: "var(--text-muted)" }}
      >
        {items.length} items
        {loading && " • refreshing..."}
      </div>

      {items.map((item) => (
        <FeedCard key={item.id} item={item} keywords={keywords} />
      ))}
    </div>
  );
}

function FeedCard({ item, keywords }: { item: FeedItem; keywords: string[] }) {
  const hasKeywords = item.matchedKeywords.length > 0;

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`block rounded-lg p-3 transition-colors ${hasKeywords ? "keyword-highlight" : ""}`}
      style={{
        background: hasKeywords ? undefined : "var(--bg-secondary)",
        border: `1px solid ${hasKeywords ? "var(--keyword-border)" : "var(--border)"}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--bg-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = hasKeywords
          ? "var(--keyword-bg)"
          : "var(--bg-secondary)";
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {/* Header: source badge + time */}
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
              style={{
                background: `${sourceTypeColor(item.source.type)}22`,
                color: sourceTypeColor(item.source.type),
              }}
            >
              {sourceTypeLabel(item.source.type)}
            </span>
            <span
              className="text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              {item.source.name}
            </span>
            <span
              className="text-xs ml-auto shrink-0"
              style={{ color: "var(--text-muted)" }}
            >
              {timeAgo(item.pubDate)}
            </span>
          </div>

          {/* Title */}
          <h3
            className="text-sm font-medium leading-snug mb-1"
            dangerouslySetInnerHTML={{
              __html: highlightKeywords(item.title, keywords),
            }}
          />

          {/* Description snippet */}
          {item.description && (
            <p
              className="text-xs leading-relaxed line-clamp-2"
              style={{ color: "var(--text-secondary)" }}
              dangerouslySetInnerHTML={{
                __html: highlightKeywords(
                  item.description.slice(0, 200),
                  keywords
                ),
              }}
            />
          )}

          {/* Keyword badges */}
          {hasKeywords && (
            <div className="flex gap-1 mt-1.5">
              {item.matchedKeywords.map((kw) => (
                <span
                  key={kw}
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                  style={{
                    background: "rgba(239, 68, 68, 0.2)",
                    color: "var(--accent-red)",
                  }}
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </a>
  );
}
