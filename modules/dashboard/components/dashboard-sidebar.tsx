"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  Zap, Lightbulb, Database, Compass, Flame, Terminal, Code2,
  Star, LayoutDashboard, Settings, ChevronRight
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const iconMap: Record<string, React.ElementType> = {
  Zap, Lightbulb, Database, Compass, FlameIcon: Flame, Terminal, Code2,
};

interface PlaygroundItem {
  id: string;
  name: string;
  starred: boolean;
  icon: string;
}

interface DashboardSidebarProps {
  initialPlaygroundData?: PlaygroundItem[];
}

export function DashboardSidebar({ initialPlaygroundData = [] }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [playgrounds] = useState<PlaygroundItem[]>(initialPlaygroundData);

  const starredPlaygrounds = playgrounds.filter((p) => p.starred);
  const user = session?.user;
  const fallback = user?.name?.charAt(0).toUpperCase() ?? user?.email?.charAt(0).toUpperCase() ?? "U";

  return (
    <Sidebar className="border-r border-border">
      {/* Logo */}
      <SidebarHeader className="px-4 py-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-6 h-6 shrink-0">
            <div className="absolute inset-0 bg-violet-500 rounded-md rotate-6 group-hover:rotate-12 transition-transform duration-300" />
            <div className="absolute inset-0 bg-background border border-border rounded-md flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M2 4L5.5 7L2 10" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7.5 10H12" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <span className="text-foreground font-semibold tracking-tight text-[14px]">
            Vibe<span className="text-violet-400">Code</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2">
        {/* Main Nav */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/dashboard"}
                className="gap-2.5 text-sm"
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/dashboard/settings"}
                className="gap-2.5 text-sm"
              >
                <Link href="/dashboard/settings">
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Starred */}
        {starredPlaygrounds.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider px-2 mb-1">
              <Star className="w-3 h-3 mr-1.5" />
              Starred
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {starredPlaygrounds.map((p) => {
                  const Icon = iconMap[p.icon] ?? Code2;
                  return (
                    <SidebarMenuItem key={p.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === `/dashboard/playground/${p.id}`}
                        className="gap-2.5 text-sm"
                      >
                        <Link href={`/dashboard/playground/${p.id}`}>
                          <Icon className="w-4 h-4 text-violet-400" />
                          <span className="truncate">{p.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* All Playgrounds */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider px-2 mb-1 flex items-center justify-between">
            <span>Playgrounds</span>
            <span className="text-xs font-normal">{playgrounds.length}</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {playgrounds.length === 0 ? (
                <p className="text-xs text-muted-foreground px-2 py-2">No playgrounds yet</p>
              ) : (
                playgrounds.map((p) => {
                  const Icon = iconMap[p.icon] ?? Code2;
                  return (
                    <SidebarMenuItem key={p.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === `/dashboard/playground/${p.id}`}
                        className="gap-2.5 text-sm"
                      >
                        <Link href={`/dashboard/playground/${p.id}`}>
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <span className="truncate">{p.name}</span>
                          {p.starred && <Star className="w-3 h-3 ml-auto text-yellow-400 fill-yellow-400" />}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User at bottom */}
      <SidebarFooter className="border-t border-border px-3 py-3">
        <Link href="/dashboard/settings" className="flex items-center gap-2.5 rounded-md p-1.5 hover:bg-accent transition-colors group">
          <Avatar className="h-7 w-7">
            <AvatarImage src={user?.image ?? ""} alt={user?.name ?? "User"} />
            <AvatarFallback className="text-xs bg-violet-600 text-white">{fallback}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{user?.name ?? "User"}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}