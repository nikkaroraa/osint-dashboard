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

  // Load from localStorage
  useEffect(() => {
    setSources(getSources());
    setKeywords(getKeywords());
  }, []);

  // Fetch feeds
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

    // Sort by date descending
    allItems.sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );

    // Deduplicate by title similarity
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

  // Initial fetch and auto-refresh
  useEffect(() => {
    if (sources.length > 0) {
      fetchFeeds();
    }
    // Auto-refresh every 5 minutes
    intervalRef.current = setInterval(fetchFeeds, 5 * 60 * 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchFeeds, sources.length]);

  // Filter items
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
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b px-4 py-3 flex items-center justify-between"
        style={{
          background: "var(--bg-secondary)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-1"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-lg">🔍</span>
            <h1 className="text-lg font-bold tracking-tight">
              OSINT Dashboard
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span
              className="text-xs hidden sm:block"
              style={{ color: "var(--text-muted)" }}
            >
              Updated {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          {errorCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(239,68,68,0.2)", color: "var(--accent-red)" }}>
              {errorCount} feed error{errorCount > 1 ? "s" : ""}
            </span>
          )}
          {keywordMatchCount > 0 && (
            <span
              className="text-xs font-medium px-2 py-0.5 rounded"
              style={{
                background: "rgba(239, 68, 68, 0.2)",
                color: "var(--accent-red)",
              }}
            >
              🔴 {keywordMatchCount} alert{keywordMatchCount > 1 ? "s" : ""}
            </span>
          )}
          <button
            onClick={() => fetchFeeds()}
            className="text-sm px-3 py-1.5 rounded font-medium transition-colors"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-primary)",
            }}
            disabled={loading}
          >
            {loading ? "⏳" : "↻"} Refresh
          </button>
          <button
            onClick={() => setShowAddSource(true)}
            className="text-sm px-3 py-1.5 rounded font-medium transition-colors"
            style={{
              background: "var(--accent-blue)",
              color: "white",
            }}
          >
            + Source
          </button>
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
