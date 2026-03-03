"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { X, Play, Settings, ChevronRight } from "lucide-react";
import { useEditorStore } from "@/modules/playground/store/editor-store";

interface EditorTopBarProps {
  projectName: string;
  activeFile: string | null;
  onRun?: () => void;
}

export function EditorTopBar({ projectName, activeFile, onRun }: EditorTopBarProps) {
  const { isSaving, isDirty } = useEditorStore();

  return (
    <div className="h-11 border-b border-border bg-background flex items-center px-3 gap-2 shrink-0">
      <Link href="/dashboard" className="flex items-center gap-1.5 group mr-2">
        <div className="relative w-5 h-5 shrink-0">
          <div className="absolute inset-0 bg-violet-500 rounded rotate-6 group-hover:rotate-12 transition-transform duration-300" />
          <div className="absolute inset-0 bg-background border border-border rounded flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
              <path d="M2 4L5.5 7L2 10" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7.5 10H12" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0 flex-1">
        <Link href="/dashboard" className="hover:text-foreground transition-colors shrink-0">
          Dashboard
        </Link>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <span className="text-foreground font-medium truncate">{projectName}</span>
        {activeFile && (
          <>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="text-muted-foreground truncate">
              {activeFile.split("/").pop()}
            </span>
          </>
        )}

        {/* Save status indicators */}
        {isSaving && (
          <span className="text-muted-foreground text-[10px] ml-2 shrink-0">
            Saving...
          </span>
        )}
        {isDirty && !isSaving && (
          <span
            className="w-1.5 h-1.5 rounded-full bg-yellow-400 ml-2 shrink-0"
            title="Unsaved changes"
          />
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          size="sm"
          onClick={onRun}
          className="h-7 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3"
        >
          <Play className="w-3 h-3" />
          Run
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
        >
          <Settings className="w-3.5 h-3.5" />
        </Button>
        <Link href="/dashboard">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}