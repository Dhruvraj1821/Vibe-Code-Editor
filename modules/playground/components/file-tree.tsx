"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen } from "lucide-react";
import { FileNode, getFileIcon } from "@/modules/playground/utils/file-tree-utils";
import { useEditorStore } from "@/modules/playground/store/editor-store";
import { cn } from "@/lib/utils";

interface ContextMenuState { x: number; y: number; node: FileNode | null; }
interface InlineInput { type: "file" | "folder" | "rename"; parentPath: string | null; targetPath?: string; currentName?: string; }

function ContextMenuPortal({ menu, onClose, onAddFile, onAddFolder, onRename, onDelete }: {
  menu: ContextMenuState; onClose: () => void; onAddFile: () => void; onAddFolder: () => void;
  onRename?: () => void; onDelete?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div ref={ref} style={{ position: "fixed", top: menu.y, left: menu.x, zIndex: 9999 }}
      className="bg-popover border border-border rounded-md shadow-lg py-1 min-w-40">
      <button onClick={() => { onAddFile(); onClose(); }} className="w-full text-left px-3 py-1.5 text-xs text-foreground hover:bg-accent transition-colors">New File</button>
      <button onClick={() => { onAddFolder(); onClose(); }} className="w-full text-left px-3 py-1.5 text-xs text-foreground hover:bg-accent transition-colors">New Folder</button>
      {(onRename || onDelete) && <div className="h-px bg-border my-1" />}
      {onRename && <button onClick={() => { onRename(); onClose(); }} className="w-full text-left px-3 py-1.5 text-xs text-foreground hover:bg-accent transition-colors">Rename</button>}
      {onDelete && <button onClick={() => { onDelete(); onClose(); }} className="w-full text-left px-3 py-1.5 text-xs text-destructive hover:bg-accent transition-colors">Delete</button>}
    </div>
  );
}

function InlineInputField({ placeholder, defaultValue, onConfirm, onCancel, indent }: {
  placeholder: string; defaultValue?: string; onConfirm: (v: string) => void; onCancel: () => void; indent: number;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
    if (defaultValue) { const d = defaultValue.lastIndexOf("."); inputRef.current?.setSelectionRange(0, d > 0 ? d : defaultValue.length); }
  }, [defaultValue]);
  return (
    <div className="flex items-center py-0.5 pr-2" style={{ paddingLeft: `${indent}px` }}>
      <input ref={inputRef} value={value} onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { if (value.trim()) onConfirm(value.trim()); else onCancel(); } if (e.key === "Escape") onCancel(); }}
        onBlur={() => { if (value.trim()) onConfirm(value.trim()); else onCancel(); }}
        placeholder={placeholder}
        className="flex-1 bg-input border border-violet-500/50 rounded px-1.5 py-0.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-violet-500/50 min-w-0" />
    </div>
  );
}

function FolderNode({ node, depth }: { node: FileNode; depth: number }) {
  const { addFile, addFolder, renameNode, deleteNode } = useEditorStore();
  const [isOpen, setIsOpen] = useState(depth === 0);
  const [inlineInput, setInlineInput] = useState<InlineInput | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const indent = depth * 12;

  return (
    <div>
      {contextMenu && (
        <ContextMenuPortal menu={contextMenu} onClose={() => setContextMenu(null)}
          onAddFile={() => { setIsOpen(true); setInlineInput({ type: "file", parentPath: node.path }); }}
          onAddFolder={() => { setIsOpen(true); setInlineInput({ type: "folder", parentPath: node.path }); }}
          onRename={() => setInlineInput({ type: "rename", parentPath: null, currentName: node.name, targetPath: node.path })}
          onDelete={() => deleteNode(node.path, "folder")} />
      )}
      <button onClick={() => setIsOpen((p) => !p)}
        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setContextMenu({ x: e.clientX, y: e.clientY, node }); }}
        className="w-full flex items-center gap-1.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded transition-colors"
        style={{ paddingLeft: `${8 + indent}px` }}>
        <span className="shrink-0 w-3.5 h-3.5 flex items-center justify-center">
          {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </span>
        <span className="shrink-0">
          {isOpen ? <FolderOpen className="w-3.5 h-3.5 text-yellow-400/80" /> : <Folder className="w-3.5 h-3.5 text-yellow-400/80" />}
        </span>
        {inlineInput?.type === "rename" && inlineInput.targetPath === node.path ? (
          <InlineInputField placeholder="folder name" defaultValue={node.name} indent={0}
            onConfirm={(n) => { renameNode(node.path, n); setInlineInput(null); }} onCancel={() => setInlineInput(null)} />
        ) : <span className="truncate font-medium">{node.name}</span>}
      </button>
      {isOpen && (
        <div>
          {inlineInput && inlineInput.parentPath === node.path && inlineInput.type !== "rename" && (
            <InlineInputField placeholder={inlineInput.type === "file" ? "filename.ext" : "folder name"}
              indent={8 + indent + 24}
              onConfirm={(name) => { if (inlineInput.type === "file") addFile(node.path, name); else addFolder(node.path, name); setInlineInput(null); }}
              onCancel={() => setInlineInput(null)} />
          )}
          {node.children?.map((child) => <FileTreeNode key={child.path} node={child} depth={depth + 1} />)}
        </div>
      )}
    </div>
  );
}

function FileNodeItem({ node, depth }: { node: FileNode; depth: number }) {
  const { activeFile, setActiveFile, renameNode, deleteNode } = useEditorStore();
  const [renaming, setRenaming] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const indent = depth * 12;
  const isActive = activeFile === node.path;

  return (
    <>
      {contextMenu && (
        <ContextMenuPortal menu={contextMenu} onClose={() => setContextMenu(null)}
          onAddFile={() => {}} onAddFolder={() => {}}
          onRename={() => setRenaming(true)}
          onDelete={() => deleteNode(node.path, "file")} />
      )}
      {renaming ? (
        <InlineInputField placeholder="filename.ext" defaultValue={node.name} indent={8 + indent + 16}
          onConfirm={(n) => { renameNode(node.path, n); setRenaming(false); }} onCancel={() => setRenaming(false)} />
      ) : (
        <button onClick={() => setActiveFile(node.path)}
          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setContextMenu({ x: e.clientX, y: e.clientY, node }); }}
          className={cn("w-full flex items-center gap-1.5 py-1 text-xs rounded transition-colors",
            isActive ? "bg-violet-500/20 text-violet-300" : "text-muted-foreground hover:text-foreground hover:bg-accent/50")}
          style={{ paddingLeft: `${8 + indent + 16}px` }}>
          <span className="text-[11px] leading-none shrink-0">{getFileIcon(node.name)}</span>
          <span className="truncate">{node.name}</span>
        </button>
      )}
    </>
  );
}

function FileTreeNode({ node, depth = 0 }: { node: FileNode; depth?: number }) {
  if (node.type === "folder") return <FolderNode node={node} depth={depth} />;
  return <FileNodeItem node={node} depth={depth} />;
}

export function FileTree({ nodes }: { nodes: FileNode[] }) {
  const { addFile, addFolder } = useEditorStore();
  const [rootInput, setRootInput] = useState<"file" | "folder" | null>(null);
  const [rootMenu, setRootMenu] = useState<ContextMenuState | null>(null);

  return (
    <div className="py-1 min-h-full"
      onContextMenu={(e) => { if (e.target === e.currentTarget) { e.preventDefault(); setRootMenu({ x: e.clientX, y: e.clientY, node: null }); } }}>
      {rootMenu && (
        <ContextMenuPortal menu={rootMenu} onClose={() => setRootMenu(null)}
          onAddFile={() => setRootInput("file")} onAddFolder={() => setRootInput("folder")} />
      )}
      {nodes.map((node) => <FileTreeNode key={node.path} node={node} depth={0} />)}
      {rootInput && (
        <InlineInputField placeholder={rootInput === "file" ? "filename.ext" : "folder name"} indent={8}
          onConfirm={(name) => { if (rootInput === "file") addFile(null, name); else addFolder(null, name); setRootInput(null); }}
          onCancel={() => setRootInput(null)} />
      )}
    </div>
  );
}