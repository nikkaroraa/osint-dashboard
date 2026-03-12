"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Activity,
  AlertCircle,
  BellRing,
  Menu,
  Plus,
  RefreshCw,
  Server,
} from "lucide-react";
import { Source, FeedItem, SourceType, TimeFilter } from "@/lib/types";
import { getSources, saveSources, getKeywords, saveKeywords } from "@/lib/storage";
import { isWithinTimeFilter, stripHtml } from "@/lib/utils";
import { Sidebar } from "@/components/sidebar";
import { Feed } from "@/components/feed";
import { AddSourceModal } from "@/components/add-source-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
          const res = await fetch(`/api/fetch-feed?url=${encodeURIComponent(source.url)}`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          if (data.error) throw new Error(data.error);

          return (data.items || []).map(
            (item: { title: string; link: string; description?: string; pubDate: string; guid: string }) => {
              const title = stripHtml(item.title);
              const desc = stripHtml(item.description || "");
              const text = `${title} ${desc}`.toLowerCase();
              const matched = keywords.filter((k) => text.includes(k.toLowerCase()));

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
      if (result.status === "fulfilled") allItems.push(...result.value);
    });

    allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

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
    if (sources.length > 0) fetchFeeds();

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
      return item.title.toLowerCase().includes(q) || (item.description || "").toLowerCase().includes(q);
    }
    return true;
  });

  const handleToggleSource = (id: string) => {
    const updated = sources.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
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
    if (updated.has(type)) updated.delete(type);
    else updated.add(type);
    setActiveTypes(updated);
  };

  const keywordMatchCount = items.filter((i) => i.matchedKeywords.length > 0).length;
  const activeSourcesCount = sources.filter((s) => s.enabled).length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="border-zinc-800 bg-zinc-900 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-bold tracking-tight">OSINT Dashboard</h1>
              <p className="text-xs text-zinc-400">Real-time intelligence monitoring</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {lastRefresh && (
              <Badge variant="outline" className="hidden border-zinc-800 bg-zinc-900 text-zinc-300 md:inline-flex">
                Last refresh {lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Badge>
            )}
            <Button
              variant="outline"
              onClick={() => fetchFeeds()}
              disabled={loading}
              className="border-zinc-800 bg-zinc-900"
            >
              <RefreshCw className={loading ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} />
              Refresh
            </Button>
            <Button onClick={() => setShowAddSource(true)} className="bg-emerald-600 hover:bg-emerald-500">
              <Plus className="mr-2 h-4 w-4" />
              Add source
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 lg:grid-cols-[20rem_1fr]">
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

        <main className="min-w-0 px-4 py-4 sm:px-6 sm:py-6">
          <section className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <Card className="border-zinc-800 bg-zinc-900/60">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs text-zinc-400">Total items</p>
                  <p className="text-xl font-bold tracking-tight">{filteredItems.length}</p>
                </div>
                <Activity className="h-5 w-5 text-emerald-400" />
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-zinc-900/60">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs text-zinc-400">Active sources</p>
                  <p className="text-xl font-bold tracking-tight">{activeSourcesCount}</p>
                </div>
                <Server className="h-5 w-5 text-blue-400" />
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-zinc-900/60">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs text-zinc-400">Alerts / errors</p>
                  <p className="text-xl font-bold tracking-tight">{keywordMatchCount + errorCount}</p>
                </div>
                {errorCount > 0 ? (
                  <AlertCircle className="h-5 w-5 text-red-400" />
                ) : (
                  <BellRing className="h-5 w-5 text-orange-400" />
                )}
              </CardContent>
            </Card>
          </section>

          <Feed items={filteredItems} keywords={keywords} loading={loading} />
        </main>
      </div>

      {showAddSource && <AddSourceModal onAdd={handleAddSource} onClose={() => setShowAddSource(false)} />}
    </div>
  );
}
