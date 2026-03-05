"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Source, FeedItem, SourceType, TimeFilter } from "@/lib/types";
import { getSources, saveSources, getKeywords, saveKeywords } from "@/lib/storage";
import { stripHtml, isWithinTimeFilter } from "@/lib/utils";
import { Sidebar } from "@/components/sidebar";
import { Feed } from "@/components/feed";
import { AddSourceModal } from "@/components/add-source-modal";

export default function Dashboard() {
  const [sources, setSources] = useState<Source[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [activeTypes, setActiveTypes] = useState<Set<SourceType>>(
    new Set(["news", "reddit", "social", "alert"])
  );
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddSource, setShowAddSource] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSources(getSources());
    setKeywords(getKeywords());
  }, []);

  const fetchFeeds = useCallback(async () => {
    const enabledSources = sources.filter((s) => s.enabled);
    if (enabledSources.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let errors = 0;
    const allItems: FeedItem[] = [];

    const results = await Promise.allSettled(
      enabledSources.map(async (source) => {
        try {
          const res = await fetch(
            `/api/fetch-feed?url=${encodeURIComponent(source.url)}`
          );
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          if (data.error) throw new Error(data.error);

          return (data.items || []).map(
            (item: { title: string; link: string; description?: string; pubDate: string; guid: string }) => {
              const title = stripHtml(item.title);
              const desc = stripHtml(item.description || "");
              const text = `${title} ${desc}`.toLowerCase();
              const matched = keywords.filter((k) =>
                text.includes(k.toLowerCase())
              );

              return {
                id: `${source.id}-${item.guid || item.link}`,
                title,
                link: item.link,
                description: desc,
                pubDate: item.pubDate,
                source: { name: source.name, type: source.type },
                matchedKeywords: matched,
              } as FeedItem;
            }
          );
        } catch {
          errors++;
          return [];
        }
      })
    );

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        allItems.push(...result.value);
      }
    });

    allItems.sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );

    const seen = new Set<string>();
    const deduped = allItems.filter((item) => {
      const key = item.title.toLowerCase().slice(0, 60);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    setItems(deduped);
    setErrorCount(errors);
    setLastRefresh(new Date());
    setLoading(false);
  }, [sources, keywords]);

  useEffect(() => {
    if (sources.length > 0) {
      fetchFeeds();
    }
    intervalRef.current = setInterval(fetchFeeds, 5 * 60 * 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchFeeds, sources.length]);

  const filteredItems = items.filter((item) => {
    if (!activeTypes.has(item.source.type)) return false;
    if (!isWithinTimeFilter(item.pubDate, timeFilter)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        (item.description || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleToggleSource = (id: string) => {
    const updated = sources.map((s) =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    setSources(updated);
    saveSources(updated);
  };

  const handleRemoveSource = (id: string) => {
    const updated = sources.filter((s) => s.id !== id);
    setSources(updated);
    saveSources(updated);
  };

  const handleAddSource = (source: Source) => {
    const updated = [...sources, source];
    setSources(updated);
    saveSources(updated);
    setShowAddSource(false);
  };

  const handleAddKeyword = (keyword: string) => {
    if (!keyword.trim() || keywords.includes(keyword.trim())) return;
    const updated = [...keywords, keyword.trim()];
    setKeywords(updated);
    saveKeywords(updated);
  };

  const handleRemoveKeyword = (keyword: string) => {
    const updated = keywords.filter((k) => k !== keyword);
    setKeywords(updated);
    saveKeywords(updated);
  };

  const handleToggleType = (type: SourceType) => {
    const updated = new Set(activeTypes);
    if (updated.has(type)) {
      updated.delete(type);
    } else {
      updated.add(type);
    }
    setActiveTypes(updated);
  };

  const keywordMatchCount = items.filter(
    (i) => i.matchedKeywords.length > 0
  ).length;

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] glass">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <button
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] transition-all duration-200"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/20">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-base font-semibold tracking-tight text-[var(--color-text-primary)]">
                  OSINT Dashboard
                </h1>
                <p className="text-[11px] text-[var(--color-text-muted)] hidden sm:block -mt-0.5">
                  Real-time intelligence monitoring
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Last refresh */}
            {lastRefresh && (
              <span className="text-xs text-[var(--color-text-muted)] hidden md:flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
                {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}

            {/* Error badge */}
            {errorCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400 border border-red-500/20">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
                {errorCount}
              </span>
            )}

            {/* Keyword match badge */}
            {keywordMatchCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400 border border-red-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 pulse-dot" />
                {keywordMatchCount} alert{keywordMatchCount > 1 ? "s" : ""}
              </span>
            )}

            {/* Refresh button */}
            <button
              onClick={() => fetchFeeds()}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-bg-tertiary)] transition-all duration-200 disabled:opacity-50"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={loading ? "animate-spin" : ""}>
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Add source button */}
            <button
              onClick={() => setShowAddSource(true)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-500 active:scale-[0.98] transition-all duration-200"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span className="hidden sm:inline">Add Source</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          sources={sources}
          keywords={keywords}
          activeTypes={activeTypes}
          timeFilter={timeFilter}
          searchQuery={searchQuery}
          sidebarOpen={sidebarOpen}
          onToggleSource={handleToggleSource}
          onRemoveSource={handleRemoveSource}
          onToggleType={handleToggleType}
          onSetTimeFilter={setTimeFilter}
          onSetSearchQuery={setSearchQuery}
          onAddKeyword={handleAddKeyword}
          onRemoveKeyword={handleRemoveKeyword}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Feed */}
        <main className="flex-1 min-w-0">
          <Feed
            items={filteredItems}
            keywords={keywords}
            loading={loading}
          />
        </main>
      </div>

      {/* Mobile bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-[var(--color-border)] glass px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center gap-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h12M3 18h18" />
            </svg>
            <span className="text-[10px] font-medium">Filters</span>
          </button>

          <button
            onClick={() => fetchFeeds()}
            disabled={loading}
            className="flex flex-col items-center gap-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors disabled:opacity-50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={loading ? "animate-spin" : ""}>
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
            <span className="text-[10px] font-medium">Refresh</span>
          </button>

          <button
            onClick={() => setShowAddSource(true)}
            className="flex flex-col items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span className="text-[10px] font-medium">Add</span>
          </button>
        </div>
      </div>

      {/* Add Source Modal */}
      {showAddSource && (
        <AddSourceModal
          onAdd={handleAddSource}
          onClose={() => setShowAddSource(false)}
        />
      )}
    </div>
  );
}
