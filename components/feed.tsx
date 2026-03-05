"use client";

import { FeedItem } from "@/lib/types";
import { timeAgo, sourceTypeColor, sourceTypeLabel, highlightKeywords } from "@/lib/utils";

interface FeedProps {
  items: FeedItem[];
  keywords: string[];
  loading: boolean;
}

function SkeletonCard({ index }: { index: number }) {
  return (
    <div
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5 animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="skeleton h-5 w-14 rounded-full" />
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-3 w-12 ml-auto" />
      </div>
      <div className="skeleton h-4 w-4/5 mb-2" />
      <div className="skeleton h-3 w-full mb-1.5" />
      <div className="skeleton h-3 w-2/3" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-4 animate-fade-in">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] mb-6">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-text-muted)]">
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">No items found</h3>
      <p className="text-sm text-[var(--color-text-muted)] text-center max-w-sm">
        Try adjusting your filters, adding new sources, or changing the time range to see more results.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-3 pb-28 lg:pb-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} index={i} />
      ))}
    </div>
  );
}

export function Feed({ items, keywords, loading }: FeedProps) {
  if (loading && items.length === 0) {
    return <LoadingState />;
  }

  if (items.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8">
      {/* Feed header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Feed</h2>
          <span className="inline-flex items-center rounded-full bg-[var(--color-bg-tertiary)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-text-muted)] border border-[var(--color-border)]">
            {items.length}
          </span>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <div className="h-3 w-3 rounded-full border-2 border-[var(--color-text-muted)] border-t-blue-400 animate-spin" />
            Refreshing...
          </div>
        )}
      </div>

      {/* Feed items */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <FeedCard key={item.id} item={item} keywords={keywords} index={index} />
        ))}
      </div>
    </div>
  );
}

function FeedCard({ item, keywords, index }: { item: FeedItem; keywords: string[]; index: number }) {
  const hasKeywords = item.matchedKeywords.length > 0;

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        group block rounded-xl p-5 border transition-all duration-200 animate-fade-in-up
        ${hasKeywords
          ? "keyword-highlight border-red-500/20 hover:border-red-500/30"
          : "border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-bg-tertiary)]"
        }
      `}
      style={{ animationDelay: `${Math.min(index, 10) * 50}ms` }}
    >
      {/* Header: source badge + source name + time */}
      <div className="flex items-center gap-2.5 mb-3">
        <span
          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
          style={{
            background: `${sourceTypeColor(item.source.type)}15`,
            color: sourceTypeColor(item.source.type),
            border: `1px solid ${sourceTypeColor(item.source.type)}25`,
          }}
        >
          {sourceTypeLabel(item.source.type)}
        </span>
        <span className="text-xs text-[var(--color-text-muted)] font-medium">
          {item.source.name}
        </span>
        <span className="text-xs text-[var(--color-text-muted)] ml-auto shrink-0 tabular-nums">
          {timeAgo(item.pubDate)}
        </span>
      </div>

      {/* Title */}
      <h3
        className="text-[15px] font-medium leading-snug text-[var(--color-text-primary)] group-hover:text-white mb-2 transition-colors duration-200"
        dangerouslySetInnerHTML={{
          __html: highlightKeywords(item.title, keywords),
        }}
      />

      {/* Description snippet */}
      {item.description && (
        <p
          className="text-sm leading-relaxed text-[var(--color-text-secondary)] line-clamp-2"
          dangerouslySetInnerHTML={{
            __html: highlightKeywords(
              item.description.slice(0, 250),
              keywords
            ),
          }}
        />
      )}

      {/* Keyword badges */}
      {hasKeywords && (
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[var(--color-border)]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400 shrink-0">
            <path d="M12 9v2m0 4h.01M5.07 19H18.93a2 2 0 001.64-3.14L13.64 4.36a2 2 0 00-3.28 0L2.43 15.86A2 2 0 004.07 19z" />
          </svg>
          {item.matchedKeywords.map((kw) => (
            <span
              key={kw}
              className="inline-flex items-center rounded-full bg-red-500/10 border border-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-400"
            >
              {kw}
            </span>
          ))}
        </div>
      )}

      {/* External link indicator */}
      <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <span className="text-[11px] text-[var(--color-text-muted)]">Open article</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-text-muted)]">
          <path d="M7 17L17 7M17 7H7M17 7v10" />
        </svg>
      </div>
    </a>
  );
}
