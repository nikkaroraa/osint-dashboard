"use client";

import { useState } from "react";
import { X, Search, Plus, Trash2, Filter } from "lucide-react";
import { Source, SourceType, TimeFilter } from "@/lib/types";
import { cn, sourceTypeBadgeClass, sourceTypeDotClass, sourceTypeLabel } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

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

function SidebarBody({
  sources,
  keywords,
  activeTypes,
  timeFilter,
  searchQuery,
  onToggleSource,
  onRemoveSource,
  onToggleType,
  onSetTimeFilter,
  onSetSearchQuery,
  onAddKeyword,
  onRemoveKeyword,
}: Omit<SidebarProps, "sidebarOpen" | "onClose">) {
  const [newKeyword, setNewKeyword] = useState("");

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={(e) => onSetSearchQuery(e.target.value)}
            placeholder="Search feed"
            className="border-zinc-800 bg-zinc-900 pl-9"
          />
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Source types</p>
          <div className="flex flex-wrap gap-2">
            {sourceTypes.map((type) => {
              const enabledCount = sources.filter((s) => s.type === type && s.enabled).length;
              const active = activeTypes.has(type);
              return (
                <button key={type} onClick={() => onToggleType(type)} type="button">
                  <Badge
                    variant="outline"
                    className={cn(
                      "cursor-pointer border-zinc-700 bg-zinc-900 text-zinc-300 transition-colors duration-200 hover:border-zinc-600",
                      active && sourceTypeBadgeClass(type)
                    )}
                  >
                    {sourceTypeLabel(type)} · {enabledCount}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Time filter</p>
          <Select value={timeFilter} onValueChange={(value) => onSetTimeFilter(value as TimeFilter)}>
            <SelectTrigger className="border-zinc-800 bg-zinc-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-100">
              <SelectItem value="1h">Last 1 hour</SelectItem>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator className="bg-zinc-800" />

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Keywords</p>
          <div className="flex flex-wrap gap-2">
            {keywords.length === 0 ? (
              <span className="text-xs text-zinc-500">No keywords set</span>
            ) : (
              keywords.map((kw) => (
                <Badge key={kw} variant="outline" className="gap-1 border-red-500/30 bg-red-500/10 text-red-300">
                  {kw}
                  <button type="button" onClick={() => onRemoveKeyword(kw)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              onAddKeyword(newKeyword);
              setNewKeyword("");
            }}
          >
            <Input
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="Add keyword"
              className="h-9 border-zinc-800 bg-zinc-900"
            />
            <Button type="submit" size="icon" variant="outline" className="h-9 w-9 border-zinc-800 bg-zinc-900">
              <Plus className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <Separator className="bg-zinc-800" />

        <div className="space-y-3 pb-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Sources</p>
            <Badge variant="outline" className="border-zinc-700 text-zinc-400">{sources.length}</Badge>
          </div>

          <div className="space-y-2">
            {sources.length === 0 ? (
              <p className="text-xs text-zinc-500">No sources added yet</p>
            ) : (
              sources.map((source) => (
                <div
                  key={source.id}
                  className="group flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 transition-colors duration-200 hover:bg-zinc-900"
                >
                  <span className={cn("h-2 w-2 rounded-full", sourceTypeDotClass(source.type))} />
                  <span className={cn("flex-1 truncate text-sm", source.enabled ? "text-zinc-200" : "text-zinc-500")}>
                    {source.name}
                  </span>
                  <Switch checked={source.enabled} onCheckedChange={() => onToggleSource(source.id)} />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => onRemoveSource(source.id)}
                    className="h-7 w-7 text-zinc-500 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

export function Sidebar({ sidebarOpen, onClose, ...props }: SidebarProps) {
  return (
    <>
      <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-80 border-r border-zinc-800 bg-zinc-950 lg:block">
        <SidebarBody {...props} />
      </aside>

      <Sheet open={sidebarOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="left" className="w-[88vw] border-zinc-800 bg-zinc-950 p-0 sm:max-w-sm">
          <SheetHeader className="border-b border-zinc-800 px-4 py-3">
            <SheetTitle className="flex items-center gap-2 text-zinc-100">
              <Filter className="h-4 w-4" />
              Filters & sources
            </SheetTitle>
          </SheetHeader>
          <div className="h-[calc(100%-57px)]">
            <SidebarBody {...props} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
