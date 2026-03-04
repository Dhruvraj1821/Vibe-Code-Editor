"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { FileTree } from "./file-tree";
import { EditorTopBar } from "./editor-topbar";
import { MonacoEditorPanel } from "./monaco-editor-panel";
import { buildFileTree } from "@/modules/playground/utils/file-tree-utils";
import { useEditorStore } from "@/modules/playground/store/editor-store";
import {
  getWebContainer,
  destroyWebContainer,
  filesToWebContainerTree,
} from "@/modules/playground/lib/webcontainer";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { TerminalHandle } from "./terminal-panel";

const TerminalPanel = dynamic(
  () => import("./terminal-panel").then((m) => m.TerminalPanel),
  { ssr: false }
);

interface EditorLayoutProps {
  playgroundId: string;
  projectName: string;
  files: Record<string, string>;
}

const TERMINAL_MIN_HEIGHT = 120;
const TERMINAL_DEFAULT_HEIGHT = 220;

export function EditorLayout({ playgroundId, projectName, files }: EditorLayoutProps) {
  const { initStore, files: storeFiles, activeFile } = useEditorStore();

  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(TERMINAL_DEFAULT_HEIGHT);
  const [isBooting, setIsBooting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const terminalRef = useRef<TerminalHandle | null>(null);
  const dragStartY = useRef<number | null>(null);
  const dragStartHeight = useRef<number>(TERMINAL_DEFAULT_HEIGHT);

  useEffect(() => {
    initStore(playgroundId, projectName, files);
    return () => {
      initStore("", "", {});
      destroyWebContainer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playgroundId]);

  const fileTree = useMemo(() => buildFileTree(storeFiles), [storeFiles]);

  const handleRun = useCallback(async () => {
    if (isBooting || isRunning) return;

    setTerminalOpen(true);
    setIsBooting(true);

    // Wait for terminal to mount before writing to it
    await new Promise((resolve) => setTimeout(resolve, 150));

    try {
      terminalRef.current?.terminal?.writeln(
        "\r\n\x1b[35m⚡ Booting WebContainer...\x1b[0m"
      );
      const wc = await getWebContainer();

      terminalRef.current?.terminal?.writeln("\x1b[35m📦 Mounting files...\x1b[0m");
      const tree = filesToWebContainerTree(useEditorStore.getState().files);
      await wc.mount(tree);

      terminalRef.current?.terminal?.writeln(
        "\x1b[35m📥 Installing dependencies...\x1b[0m\r\n"
      );
      setIsBooting(false);
      setIsRunning(true);

      const installProcess = await wc.spawn("npm", ["install"]);
      installProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            terminalRef.current?.terminal?.write(data);
          },
        })
      );
      const installExitCode = await installProcess.exit;

      if (installExitCode !== 0) {
        terminalRef.current?.terminal?.writeln(
          "\r\n\x1b[31m✗ npm install failed\x1b[0m"
        );
        setIsRunning(false);
        return;
      }

      terminalRef.current?.terminal?.writeln(
        "\r\n\x1b[32m✓ Dependencies installed\x1b[0m"
      );
      terminalRef.current?.terminal?.writeln(
        "\x1b[35m🚀 Starting dev server...\x1b[0m\r\n"
      );

      const startProcess = await wc.spawn("npm", ["run", "start"]);
      startProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            terminalRef.current?.terminal?.write(data);
          },
        })
      );

      wc.on("server-ready", (port, url) => {
        terminalRef.current?.terminal?.writeln(
          `\r\n\x1b[32m✓ Server ready at ${url}\x1b[0m`
        );
      });
    } catch (err: any) {
      terminalRef.current?.terminal?.writeln(
        `\r\n\x1b[31m✗ Error: ${err?.message ?? "Unknown error"}\x1b[0m`
      );
      setIsBooting(false);
      setIsRunning(false);
    }
  }, [isBooting, isRunning]);

  const handleDragStart = (e: React.MouseEvent) => {
    dragStartY.current = e.clientY;
    dragStartHeight.current = terminalHeight;
    const onMouseMove = (e: MouseEvent) => {
      if (dragStartY.current === null) return;
      const delta = dragStartY.current - e.clientY;
      setTerminalHeight(
        Math.max(TERMINAL_MIN_HEIGHT, dragStartHeight.current + delta)
      );
    };
    const onMouseUp = () => {
      dragStartY.current = null;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <EditorTopBar
        projectName={projectName}
        activeFile={activeFile}
        onRun={handleRun}
        isBooting={isBooting}
        isRunning={isRunning}
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

        {/* Editor + Terminal */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Monaco editor */}
          <main className="flex-1 overflow-hidden flex flex-col min-h-0">
            {activeFile && (
              <div className="h-8 border-b border-border flex items-center px-1 gap-1 shrink-0 bg-background overflow-x-auto">
                <div className="flex items-center gap-1.5 px-3 h-full border-r border-border bg-muted/30 text-xs text-foreground shrink-0">
                  <span>{activeFile.split("/").pop()}</span>
                </div>
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <MonacoEditorPanel />
            </div>
          </main>

          {/* Drag handle — only visible when terminal is open */}
          {terminalOpen && (
            <div
              onMouseDown={handleDragStart}
              className="h-1 bg-border hover:bg-violet-500/50 cursor-row-resize shrink-0 transition-colors"
            />
          )}

          {/* Terminal — always in DOM so xterm stays mounted, toggled via display */}
          <div
            className="shrink-0 flex flex-col border-t border-border bg-[#0a0a0a] overflow-hidden"
            style={{
              height: terminalOpen ? terminalHeight : 0,
              display: terminalOpen ? "flex" : "none",
            }}
          >
            <div className="h-7 flex items-center justify-between px-3 border-b border-border/50 shrink-0 bg-[#111111]">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Terminal
                </span>
                {isBooting && (
                  <span className="text-[10px] text-yellow-400">Booting...</span>
                )}
                {isRunning && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Running
                  </span>
                )}
              </div>
              <button
                onClick={() => setTerminalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <TerminalPanel ref={terminalRef} visible={terminalOpen} />
            </div>
          </div>

          {/* Terminal toggle bar when closed */}
          {!terminalOpen && (
            <div className="h-7 border-t border-border flex items-center px-3 bg-background shrink-0">
              <button
                onClick={() => setTerminalOpen(true)}
                className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors"
              >
                <ChevronUp className="w-3 h-3" />
                Terminal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}