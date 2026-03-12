"use client";

import { ExternalLink, AlertTriangle } from "lucide-react";
import { FeedItem } from "@/lib/types";
import {
  cn,
  highlightKeywords,
  sourceTypeBadgeClass,
  sourceTypeLabel,
  timeAgo,
} from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface FeedProps {
  items: FeedItem[];
  keywords: string[];
  loading: boolean;
}

function FeedSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="border-zinc-800 bg-zinc-900/60">
          <CardHeader className="space-y-2 p-4 pb-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16 bg-zinc-800" />
              <Skeleton className="h-4 w-24 bg-zinc-800" />
              <Skeleton className="ml-auto h-4 w-14 bg-zinc-800" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2 p-4 pt-1">
            <Skeleton className="h-4 w-11/12 bg-zinc-800" />
            <Skeleton className="h-3.5 w-full bg-zinc-800" />
            <Skeleton className="h-3.5 w-2/3 bg-zinc-800" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="border-zinc-800 bg-zinc-900/60">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-base font-semibold tracking-tight text-zinc-100">No items found</p>
        <p className="mt-2 max-w-md text-sm text-zinc-400">
          Try adjusting filters, expanding the time range, or enabling more sources.
        </p>
      </CardContent>
    </Card>
  );
}

export function Feed({ items, keywords, loading }: FeedProps) {
  if (loading && items.length === 0) {
    return <FeedSkeleton />;
  }

  if (items.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <FeedCard key={item.id} item={item} keywords={keywords} />
      ))}
    </div>
  );
}

function FeedCard({ item, keywords }: { item: FeedItem; keywords: string[] }) {
  const hasKeywords = item.matchedKeywords.length > 0;

  return (
    <a href={item.link} target="_blank" rel="noopener noreferrer" className="block">
      <Card
        className={cn(
          "border-zinc-800 bg-zinc-900/60 transition-colors duration-200 hover:border-zinc-700 hover:bg-zinc-900",
          hasKeywords && "border-red-500/30"
        )}
      >
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Badge variant="outline" className={cn("text-[10px] uppercase", sourceTypeBadgeClass(item.source.type))}>
              {sourceTypeLabel(item.source.type)}
            </Badge>
            <span className="truncate">{item.source.name}</span>
            <span className="ml-auto whitespace-nowrap">{timeAgo(item.pubDate)}</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 p-4 pt-1">
          <h3
            className="line-clamp-2 text-sm font-semibold leading-relaxed text-zinc-100"
            dangerouslySetInnerHTML={{ __html: highlightKeywords(item.title, keywords) }}
          />

          {item.description && (
            <p
              className="line-clamp-3 text-sm leading-relaxed text-zinc-400"
              dangerouslySetInnerHTML={{
                __html: highlightKeywords(item.description.slice(0, 280), keywords),
              }}
            />
          )}

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              {item.matchedKeywords.map((kw) => (
                <Badge key={kw} variant="outline" className="border-red-500/30 bg-red-500/10 text-red-300">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  {kw}
                </Badge>
              ))}
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
              Open <ExternalLink className="h-3.5 w-3.5" />
            </span>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
