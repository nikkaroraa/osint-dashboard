"use client";

import { useState } from "react";
import { Source, SourceType, TimeFilter } from "@/lib/types";
import { sourceTypeColor, sourceTypeLabel } from "@/lib/utils";

interface SidebarProps {
  sources: Source[];
  keywords: string[];
  activeTypes: Set<SourceType>;
  timeFilter: TimeFilter;
  searchQuery: string;
  sidebarOpen: boolean;
  onToggleSource: (id: string) => void;
  onRemoveSource: (id: string) => void;
  onToggleType: (type: SourceType) => void;
  onSetTimeFilter: (filter: TimeFilter) => void;
  onSetSearchQuery: (query: string) => void;
  onAddKeyword: (keyword: string) => void;
  onRemoveKeyword: (keyword: string) => void;
  onClose: () => void;
}

const sourceTypes: SourceType[] = ["news", "reddit", "social", "alert"];
const timeFilters: { value: TimeFilter; label: string }[] = [
  { value: "1h", label: "Last hour" },
  { value: "24h", label: "Today" },
  { value: "7d", label: "This week" },
  { value: "all", label: "All" },
];

export function Sidebar({
  sources,
  keywords,
  activeTypes,
  timeFilter,
  searchQuery,
  sidebarOpen,
  onToggleSource,
  onRemoveSource,
  onToggleType,
  onSetTimeFilter,
  onSetSearchQuery,
  onAddKeyword,
  onRemoveKeyword,
  onClose,
}: SidebarProps) {
  const [newKeyword, setNewKeyword] = useState("");

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:sticky top-0 lg:top-[57px] left-0 z-40 
          w-72 h-screen lg:h-[calc(100vh-57px)] overflow-y-auto
          border-r transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{
          background: "var(--bg-secondary)",
          borderColor: "var(--border)",
        }}
      >
        <div className="p-4 space-y-6">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search feed..."
              value={searchQuery}
              onChange={(e) => onSetSearchQuery(e.target.value)}
              className="w-full px-3 py-2 rounded text-sm outline-none"
              style={{
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Source Type Filters */}
          <div>
            <h3
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              Filter by Type
            </h3>
            <div className="space-y-1">
              {sourceTypes.map((type) => {
                const count = sources.filter(
                  (s) => s.type === type && s.enabled
                ).length;
                const active = activeTypes.has(type);
                return (
                  <button
                    key={type}
                    onClick={() => onToggleType(type)}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded text-sm transition-colors"
                    style={{
                      background: active ? "var(--bg-tertiary)" : "transparent",
                      color: active
                        ? "var(--text-primary)"
                        : "var(--text-muted)",
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{
                          background: active
                            ? sourceTypeColor(type)
                            : "var(--text-muted)",
                        }}
                      />
                      {sourceTypeLabel(type)}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Filter */}
          <div>
            <h3
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              Time Range
            </h3>
            <div className="flex flex-wrap gap-1">
              {timeFilters.map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => onSetTimeFilter(tf.value)}
                  className="px-2.5 py-1 rounded text-xs font-medium transition-colors"
                  style={{
                    background:
                      timeFilter === tf.value
                        ? "var(--accent-blue)"
                        : "var(--bg-tertiary)",
                    color:
                      timeFilter === tf.value
                        ? "white"
                        : "var(--text-secondary)",
                  }}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div>
            <h3
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              Keywords
            </h3>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {keywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                  style={{
                    background: "rgba(239, 68, 68, 0.15)",
                    color: "var(--accent-red)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                  }}
                >
                  {kw}
                  <button
                    onClick={() => onRemoveKeyword(kw)}
                    className="hover:opacity-70 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onAddKeyword(newKeyword);
                setNewKeyword("");
              }}
              className="flex gap-1"
            >
              <input
                type="text"
                placeholder="Add keyword..."
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                className="flex-1 px-2 py-1 rounded text-xs outline-none"
                style={{
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
              <button
                type="submit"
                className="px-2 py-1 rounded text-xs font-medium"
                style={{
                  background: "var(--accent-red)",
                  color: "white",
                }}
              >
                +
              </button>
            </form>
          </div>

          {/* Sources */}
          <div>
            <h3
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              Sources
            </h3>
            <div className="space-y-1">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="flex items-center justify-between px-2 py-1.5 rounded text-sm group"
                  style={{ background: "var(--bg-tertiary)" }}
                >
                  <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={source.enabled}
                      onChange={() => onToggleSource(source.id)}
                      className="accent-blue-500 shrink-0"
                    />
                    <span
                      className="truncate"
                      style={{
                        color: source.enabled
                          ? "var(--text-primary)"
                          : "var(--text-muted)",
                      }}
                    >
                      {source.name}
                    </span>
                  </label>
                  <div className="flex items-center gap-1">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: sourceTypeColor(source.type) }}
                    />
                    <button
                      onClick={() => onRemoveSource(source.id)}
                      className="opacity-0 group-hover:opacity-100 text-xs transition-opacity"
                      style={{ color: "var(--text-muted)" }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
