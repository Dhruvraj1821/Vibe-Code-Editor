"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search, Plus, Github, Star } from "lucide-react";
import { ThemeToggle } from "@/modules/home/components/theme-toggle";

interface DashboardHeaderProps {
  search: string;
  onSearchChange: (val: string) => void;
  starredOnly: boolean;
  onStarredToggle: () => void;
}

export function DashboardHeader({
  search,
  onSearchChange,
  starredOnly,
  onStarredToggle,
}: DashboardHeaderProps) {
  return (
    <header className="h-14 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10 flex items-center px-4 gap-3">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

      <div className="flex-1 flex items-center gap-3">
        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search playgrounds..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-sm bg-muted/40 border-border focus-visible:ring-violet-500/40"
          />
        </div>

        {/* Starred toggle */}
        <Button
          variant={starredOnly ? "secondary" : "ghost"}
          size="sm"
          onClick={onStarredToggle}
          className={`h-8 gap-1.5 text-xs ${starredOnly ? "text-yellow-500" : "text-muted-foreground"}`}
        >
          <Star className={`w-3.5 h-3.5 ${starredOnly ? "fill-yellow-500 text-yellow-500" : ""}`} />
          Starred
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        {/* Import from GitHub */}
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <Github className="w-3.5 h-3.5" />
          Import
        </Button>

        {/* New Project */}
        <Link href="/dashboard/new">
          <Button size="sm" className="h-8 gap-1.5 text-xs bg-violet-600 hover:bg-violet-500 text-white">
            <Plus className="w-3.5 h-3.5" />
            New Project
          </Button>
        </Link>
      </div>
    </header>
  );
}