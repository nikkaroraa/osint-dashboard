"use client";

import { useState } from "react";
import { Source, SourceType } from "@/lib/types";
import { sourceTypeBadgeClass } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddSourceModalProps {
  onAdd: (source: Source) => void;
  onClose: () => void;
}

const sourceTypes: { value: SourceType; label: string }[] = [
  { value: "news", label: "News" },
  { value: "reddit", label: "Reddit" },
  { value: "social", label: "Social" },
  { value: "alert", label: "Alert" },
];

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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-bold tracking-tight">Add source</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Add an RSS feed endpoint to monitor in real-time.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300">Source name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. BBC World"
              className="border-zinc-800 bg-zinc-900"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300">RSS feed URL</label>
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/rss"
              className="border-zinc-800 bg-zinc-900 font-mono text-xs"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300">Source type</label>
            <Select value={type} onValueChange={(value) => setType(value as SourceType)}>
              <SelectTrigger className="border-zinc-800 bg-zinc-900">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-100">
                {sourceTypes.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs ${sourceTypeBadgeClass(item.value)}`}>
                      {item.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} className="border-zinc-800 bg-zinc-900">
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || !url.trim()} className="bg-emerald-600 hover:bg-emerald-500">
              Add source
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
