"use client";

import { useState, useMemo } from "react";
import { DashboardHeader } from "@/modules/dashboard/components/dashboard-header";
import { PlaygroundTable, PlaygroundTableItem } from "@/modules/dashboard/components/playground-table";

interface DashboardClientProps {
  initialData: PlaygroundTableItem[];
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const [search, setSearch] = useState("");
  const [starredOnly, setStarredOnly] = useState(false);

  const filtered = useMemo(() => {
    return initialData.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesStarred = starredOnly ? p.starred : true;
      return matchesSearch && matchesStarred;
    });
  }, [initialData, search, starredOnly]);

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        search={search}
        onSearchChange={setSearch}
        starredOnly={starredOnly}
        onStarredToggle={() => setStarredOnly((prev) => !prev)}
      />
      <div className="flex-1 p-6">
        <div className="mb-5">
          <h1 className="text-lg font-semibold text-foreground">My Playgrounds</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filtered.length} project{filtered.length !== 1 ? "s" : ""}
            {starredOnly ? " starred" : ""}
            {search ? ` matching "${search}"` : ""}
          </p>
        </div>
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          <PlaygroundTable data={filtered} />
        </div>
      </div>
    </div>
  );
}