"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Zap, Lightbulb, Database, Compass, Flame, Terminal, Code2, Star
} from "lucide-react";
import { PlaygroundRowActions } from "./playground-row-actions";
import { Badge } from "@/components/ui/badge";

const iconMap: Record<string, React.ElementType> = {
  Zap, Lightbulb, Database, Compass, FlameIcon: Flame, Terminal, Code2,
};

const templateColors: Record<string, string> = {
  REACT: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  NEXTJS: "bg-white/10 text-white border-white/20",
  EXPRESS: "bg-green-500/10 text-green-500 border-green-500/20",
  VUE: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  HONO: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  ANGULAR: "bg-red-500/10 text-red-500 border-red-500/20",
};

export interface PlaygroundTableItem {
  id: string;
  name: string;
  template: string;
  starred: boolean;
  icon: string;
  updatedAt: string;
}

interface PlaygroundTableProps {
  data: PlaygroundTableItem[];
}

export function PlaygroundTable({ data: initialData }: PlaygroundTableProps) {
  const [data, setData] = useState<PlaygroundTableItem[]>(initialData);

  const handleDelete = (id: string) => {
    setData((prev) => prev.filter((p) => p.id !== id));
  };

  const handleDuplicate = (id: string) => {
    // router.refresh() in the action will re-fetch — optimistic update handled by parent
  };

  const handleStarToggle = (id: string) => {
    setData((prev) =>
      prev.map((p) => (p.id === id ? { ...p, starred: !p.starred } : p))
    );
  };

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
          <Code2 className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">No playgrounds yet</p>
        <p className="text-xs text-muted-foreground">Create your first project to get started</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="grid grid-cols-[2fr_1fr_1fr_40px] gap-4 px-4 py-2.5 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
        <span>Name</span>
        <span>Template</span>
        <span>Last Updated</span>
        <span />
      </div>

      {/* Rows */}
      <div className="divide-y divide-border">
        {data.map((item) => {
          const Icon = iconMap[item.icon] ?? Code2;
          const colorClass = templateColors[item.template] ?? "bg-muted text-muted-foreground border-border";

          return (
            <div
              key={item.id}
              className="group grid grid-cols-[2fr_1fr_1fr_40px] gap-4 px-4 py-3 items-center hover:bg-accent/40 transition-colors"
            >
              {/* Name */}
              <Link
                href={`/playground/${item.id}`}
                className="flex items-center gap-2.5 min-w-0"
              >
                <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-violet-400" />
                </div>
                <span className="text-sm font-medium text-foreground truncate hover:text-violet-400 transition-colors">
                  {item.name}
                </span>
                {item.starred && (
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                )}
              </Link>

              {/* Template */}
              <Badge
                variant="outline"
                className={`text-[11px] px-2 py-0.5 w-fit font-medium ${colorClass}`}
              >
                {item.template}
              </Badge>

              {/* Last Updated */}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
              </span>

              {/* Actions */}
              <PlaygroundRowActions
                id={item.id}
                name={item.name}
                starred={item.starred}
                onStarToggle={handleStarToggle}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}