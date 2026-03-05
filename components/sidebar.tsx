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
  { value: "1h", label: "1h" },
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
  { value: "all", label: "All" },
];

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
      {children}
    </h3>
  );
}

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
  const [sourcesExpanded, setSourcesExpanded] = useState(true);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:sticky top-0 lg:top-16 left-0 z-40 
          w-80 h-screen lg:h-[calc(100vh-64px)] overflow-y-auto
          border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)]
          transition-transform duration-300 ease-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Mobile header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] lg:hidden">
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">Filters & Sources</span>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-8">
          {/* Search */}
          <div className="relative">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search feed..."
              value={searchQuery}
              onChange={(e) => onSetSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] pl-10 pr-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-all duration-200"
            />
          </div>

          {/* Source Type Filters */}
          <div>
            <SectionHeader>Source Types</SectionHeader>
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
                    className={`
                      w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200
                      ${active
                        ? "bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-primary)]"
                      }
                    `}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className="w-2 h-2 rounded-full transition-all duration-200"
                        style={{
                          background: active ? sourceTypeColor(type) : "var(--color-text-muted)",
                          boxShadow: active ? `0 0 8px ${sourceTypeColor(type)}40` : "none",
                        }}
                      />
                      <span className="font-medium">{sourceTypeLabel(type)}</span>
                    </span>
                    <span className={`
                      text-[11px] font-medium px-1.5 py-0.5 rounded-md
                      ${active ? "bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)]" : "text-[var(--color-text-muted)]"}
                    `}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Filter */}
          <div>
            <SectionHeader>Time Range</SectionHeader>
            <div className="flex gap-1 p-1 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
              {timeFilters.map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => onSetTimeFilter(tf.value)}
                  className={`
                    flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200
                    ${timeFilter === tf.value
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                    }
                  `}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div>
            <SectionHeader>Alert Keywords</SectionHeader>
            <div className="flex flex-wrap gap-2 mb-3">
              {keywords.length === 0 && (
                <p className="text-xs text-[var(--color-text-muted)] italic">No keywords set</p>
              )}
              {keywords.map((kw) => (
                <span
                  key={kw}
                  className="group inline-flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/20 px-2.5 py-1 text-xs font-medium text-red-400 hover:bg-red-500/15 transition-colors duration-200"
                >
                  {kw}
                  <button
                    onClick={() => onRemoveKeyword(kw)}
                    className="opacity-50 group-hover:opacity-100 hover:text-red-300 transition-opacity"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
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
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="Add keyword..."
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/25 transition-all duration-200"
              />
              <button
                type="submit"
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 active:scale-95 transition-all duration-200"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </form>
          </div>

          {/* Sources */}
          <div>
            <button
              onClick={() => setSourcesExpanded(!sourcesExpanded)}
              className="flex items-center justify-between w-full mb-3 group"
            >
              <SectionHeader>Sources ({sources.length})</SectionHeader>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`text-[var(--color-text-muted)] transition-transform duration-200 ${sourcesExpanded ? "rotate-180" : ""}`}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {sourcesExpanded && (
              <div className="space-y-1 animate-fade-in">
                {sources.length === 0 && (
                  <p className="text-xs text-[var(--color-text-muted)] italic py-2">No sources added yet</p>
                )}
                {sources.map((source) => (
                  <div
                    key={source.id}
                    className="group flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[var(--color-bg-primary)] transition-colors duration-200"
                  >
                    {/* Custom checkbox */}
                    <button
                      onClick={() => onToggleSource(source.id)}
                      className={`
                        flex items-center justify-center w-4 h-4 rounded border shrink-0 transition-all duration-200
                        ${source.enabled
                          ? "bg-blue-600 border-blue-600"
                          : "border-[var(--color-text-muted)] hover:border-[var(--color-text-secondary)]"
                        }
                      `}
                    >
                      {source.enabled && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      )}
                    </button>

                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: sourceTypeColor(source.type) }}
                      />
                      <span
                        className={`text-sm truncate transition-colors duration-200 ${
                          source.enabled ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]"
                        }`}
                      >
                        {source.name}
                      </span>
                    </div>

                    <button
                      onClick={() => onRemoveSource(source.id)}
                      className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-6 h-6 rounded-md hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-400 transition-all duration-200"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
