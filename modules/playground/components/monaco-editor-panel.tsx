"use client";

import { useRef, useEffect, useCallback } from "react";
import MonacoEditor, { OnMount } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { useEditorStore } from "@/modules/playground/store/editor-store";
import { getMonacoLanguage } from "@/modules/playground/utils/file-tree-utils";
import type * as Monaco from "monaco-editor";

const AUTOSAVE_DELAY = 1000; // 1 second debounce

export function MonacoEditorPanel() {
  const { resolvedTheme } = useTheme();
  const { activeFile, files, updateFileContent, persistFiles } = useEditorStore();

  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentFileRef = useRef<string | null>(null);

  const monacoTheme = resolvedTheme === "dark" ? "vs-dark" : "vs";
  const language = activeFile ? getMonacoLanguage(activeFile) : "plaintext";
  const value = activeFile ? (files[activeFile] ?? "") : "";

  const handleSave = useCallback(() => {
    const editor = editorRef.current;
    if (!editor || !activeFile) return;

    // Format then save
    editor.getAction("editor.action.formatDocument")?.run().then(() => {
      const formatted = editor.getValue();
      updateFileContent(activeFile, formatted);
      persistFiles({ ...useEditorStore.getState().files, [activeFile]: formatted });
    }).catch(() => {
      // Format not available for this language — just save as-is
      const content = editor.getValue();
      updateFileContent(activeFile, content);
      persistFiles(useEditorStore.getState().files);
    });
  }, [activeFile, updateFileContent, persistFiles]);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Ctrl+S / Cmd+S to save
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave();
    });

    // Monaco editor options
    editor.updateOptions({
      autoClosingBrackets: "always",
      autoClosingQuotes: "always",
      autoIndent: "full",
      formatOnPaste: true,
      tabSize: 2,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 13,
      fontFamily: "var(--font-geist-mono), 'Fira Code', 'Cascadia Code', monospace",
      fontLigatures: true,
      lineNumbers: "on",
      renderLineHighlight: "line",
      smoothScrolling: true,
      cursorBlinking: "smooth",
      cursorSmoothCaretAnimation: "on",
      padding: { top: 12, bottom: 12 },
    });
  };

  // When active file changes, update the editor model
  useEffect(() => {
    currentFileRef.current = activeFile;
  }, [activeFile]);

  const handleChange = useCallback((newValue: string | undefined) => {
    if (!activeFile || newValue === undefined) return;

    // Update store immediately (in-memory)
    updateFileContent(activeFile, newValue);

    // Debounced persist to DB
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      persistFiles(useEditorStore.getState().files);
    }, AUTOSAVE_DELAY);
  }, [activeFile, updateFileContent, persistFiles]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, []);

  if (!activeFile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1e1e1e]">
        <div className="text-center">
          <p className="text-sm text-zinc-500">Select a file to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <MonacoEditor
      key={activeFile} // remount editor when file changes to reset model
      height="100%"
      language={language}
      value={value}
      theme={monacoTheme}
      onChange={handleChange}
      onMount={handleMount}
      loading={
        <div className="flex-1 flex items-center justify-center bg-[#1e1e1e]">
          <p className="text-xs text-zinc-500">Loading editor...</p>
        </div>
      }
      options={{
        autoClosingBrackets: "always",
        autoClosingQuotes: "always",
        minimap: { enabled: false },
        fontSize: 13,
        tabSize: 2,
        scrollBeyondLastLine: false,
        fontFamily: "var(--font-geist-mono), 'Fira Code', monospace",
        padding: { top: 12, bottom: 12 },
        renderLineHighlight: "line",
        smoothScrolling: true,
      }}
    />
  );
}