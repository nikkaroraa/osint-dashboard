"use client";

import { useState, useEffect, useRef } from "react";
import { Source, SourceType } from "@/lib/types";
import { sourceTypeColor } from "@/lib/utils";

interface AddSourceModalProps {
  onAdd: (source: Source) => void;
  onClose: () => void;
}

const sourceTypes: { value: SourceType; label: string; icon: string }[] = [
  { value: "news", label: "News", icon: "📰" },
  { value: "reddit", label: "Reddit", icon: "🔮" },
  { value: "social", label: "Social", icon: "💬" },
  { value: "alert", label: "Alert", icon: "🚨" },
];

export function AddSourceModal({ onAdd, onClose }: AddSourceModalProps) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<SourceType>("news");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    onAdd({
      id: `custom-${Date.now()}`,
      name: name.trim(),
      url: url.trim(),
      type,
      enabled: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] shadow-2xl shadow-black/50 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)]">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Add Source</h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Add an RSS feed to monitor</p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-2">
              Source Name
            </label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., BBC World News"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-all duration-200"
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-2">
              RSS Feed URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/rss"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-all duration-200 font-mono text-xs"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-2">
              Source Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {sourceTypes.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`
                    flex flex-col items-center gap-1.5 rounded-xl px-3 py-3 text-xs font-medium border transition-all duration-200
                    ${type === t.value
                      ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                      : "border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)]"
                    }
                  `}
                >
                  <span className="text-lg">{t.icon}</span>
                  <span>{t.label}</span>
                  {type === t.value && (
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: sourceTypeColor(t.value) }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !url.trim()}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              Add Source
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
