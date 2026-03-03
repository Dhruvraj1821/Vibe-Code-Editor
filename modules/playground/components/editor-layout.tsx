"use client";

import { useEffect, useMemo } from "react";
import { FileTree } from "./file-tree";
import { EditorTopBar } from "./editor-topbar";
import { MonacoEditorPanel } from "./monaco-editor-panel";
import { buildFileTree } from "@/modules/playground/utils/file-tree-utils";
import { useEditorStore } from "@/modules/playground/store/editor-store";

interface EditorLayoutProps {
  playgroundId: string;
  projectName: string;
  files: Record<string, string>;
}

export function EditorLayout({ playgroundId, projectName, files }: EditorLayoutProps) {
  const { initStore, files: storeFiles, activeFile, isSaving } = useEditorStore();

  useEffect(() => {
    initStore(playgroundId, projectName, files);
    return () => initStore("", "", {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playgroundId]);

  const fileTree = useMemo(() => buildFileTree(storeFiles), [storeFiles]);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <EditorTopBar
        projectName={projectName}
        activeFile={activeFile}
        isSaving={isSaving}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* File tree sidebar */}
        <aside className="w-56 shrink-0 border-r border-border bg-background flex flex-col overflow-hidden">
          <div className="h-8 flex items-center px-3 border-b border-border shrink-0">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              Explorer
            </span>
          </div>
          <div className="px-3 py-2 border-b border-border shrink-0">
            <p className="text-xs font-medium text-foreground truncate uppercase tracking-wide">
              {projectName}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <FileTree nodes={fileTree} />
          </div>
        </aside>

        {/* Editor area */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {/* Open file tab */}
          {activeFile && (
            <div className="h-8 border-b border-border flex items-center px-1 gap-1 shrink-0 bg-background overflow-x-auto">
              <div className="flex items-center gap-1.5 px-3 h-full border-r border-border bg-muted/30 text-xs text-foreground shrink-0">
                <span>{activeFile.split("/").pop()}</span>
              </div>
            </div>
          )}

          {/* Monaco editor */}
          <div className="flex-1 overflow-hidden">
            <MonacoEditorPanel />
          </div>
        </main>
      </div>
    </div>
  );
}