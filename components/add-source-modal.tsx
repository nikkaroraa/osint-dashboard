"use client";

import { useState } from "react";
import { Source, SourceType } from "@/lib/types";

interface AddSourceModalProps {
  onAdd: (source: Source) => void;
  onClose: () => void;
}

export function AddSourceModal({ onAdd, onClose }: AddSourceModalProps) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<SourceType>("news");

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-xl p-6"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
        }}
      >
        <h2 className="text-lg font-bold mb-4">Add Source</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., BBC World News"
              className="w-full px-3 py-2 rounded text-sm outline-none"
              style={{
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
              autoFocus
            />
          </div>

          <div>
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              RSS Feed URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/rss"
              className="w-full px-3 py-2 rounded text-sm outline-none"
              style={{
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div>
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Type
            </label>
            <div className="flex gap-2">
              {(["news", "reddit", "social", "alert"] as SourceType[]).map(
                (t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className="px-3 py-1.5 rounded text-xs font-medium uppercase transition-colors"
                    style={{
                      background:
                        type === t
                          ? "var(--accent-blue)"
                          : "var(--bg-tertiary)",
                      color:
                        type === t ? "white" : "var(--text-secondary)",
                    }}
                  >
                    {t}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded text-sm font-medium"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--text-secondary)",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded text-sm font-medium"
              style={{
                background: "var(--accent-blue)",
                color: "white",
              }}
            >
              Add Source
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
