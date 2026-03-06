import { create } from "zustand";
import { updateTemplateFiles } from "@/modules/dashboard/actions";
import { isHiddenFromTree } from "../utils/file-tree-utils";
interface EditorStore {
  playgroundId: string | null;
  projectName: string;
  files: Record<string, string>;
  activeFile: string | null;
  isSaving: boolean;
  isDirty: boolean;
  initStore: (playgroundId: string, projectName: string, files: Record<string, string>) => void;
  setActiveFile: (path: string) => void;
  addFile: (folderPath: string | null, name: string) => void;
  addFolder: (folderPath: string | null, name: string) => void;
  renameNode: (oldPath: string, newName: string) => void;
  deleteNode: (path: string, type: "file" | "folder") => void;
  updateFileContent: (path: string, content: string) => void;
  persistFiles: (files: Record<string, string>) => Promise<void>;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  playgroundId: null,
  projectName: "",
  files: {},
  activeFile: null,
  isSaving: false,
  isDirty: false,

  initStore: (playgroundId, projectName, files) => {
    const firstFile = Object.keys(files).find(f => !isHiddenFromTree(f)) ?? null;
    set({
      playgroundId,
      projectName,
      files,
      activeFile: firstFile,
    });
  },

  setActiveFile: (path) => set({ activeFile: path }),

  addFile: (folderPath, name) => {
    const { files, persistFiles } = get();
    const path = folderPath ? `${folderPath}/${name}` : name;
    if (files[path] !== undefined) return;
    const updated = { ...files, [path]: "" };
    set({ files: updated, activeFile: path });
    persistFiles(updated);
  },

  addFolder: (folderPath, name) => {
    const { files, persistFiles } = get();
    const keepPath = `${folderPath ? `${folderPath}/${name}` : name}/.gitkeep`;
    if (files[keepPath] !== undefined) return;
    const updated = { ...files, [keepPath]: "" };
    set({ files: updated });
    persistFiles(updated);
  },

  renameNode: (oldPath, newName) => {
    const { files, activeFile, persistFiles } = get();
    const parts = oldPath.split("/");
    parts[parts.length - 1] = newName;
    const newPath = parts.join("/");
    if (oldPath === newPath) return;
    const updated: Record<string, string> = {};
    for (const [key, value] of Object.entries(files)) {
      if (key === oldPath) updated[newPath] = value;
      else if (key.startsWith(oldPath + "/")) updated[newPath + key.slice(oldPath.length)] = value;
      else updated[key] = value;
    }
    let newActiveFile = activeFile;
    if (activeFile === oldPath) newActiveFile = newPath;
    else if (activeFile?.startsWith(oldPath + "/")) newActiveFile = newPath + activeFile.slice(oldPath.length);
    set({ files: updated, activeFile: newActiveFile });
    persistFiles(updated);
  },

  deleteNode: (path, type) => {
    const { files, activeFile, persistFiles } = get();
    const updated: Record<string, string> = {};
    for (const [key, value] of Object.entries(files)) {
      if (type === "folder" ? (!key.startsWith(path + "/") && key !== path) : key !== path) {
        updated[key] = value;
      }
    }
    let newActiveFile = activeFile;
    if (activeFile === path || (type === "folder" && activeFile?.startsWith(path + "/"))) {
      newActiveFile = Object.keys(updated)[0] ?? null;
    }
    set({ files: updated, activeFile: newActiveFile });
    persistFiles(updated);
  },

  updateFileContent: (path, content) => {
    const { files } = get();
    set({ files: { ...files, [path]: content }, isDirty: true });
  },

  persistFiles: async (files) => {
    const { playgroundId } = get();
    if (!playgroundId) return;
    set({ isSaving: true });
    try {
      await updateTemplateFiles(playgroundId, files);
      set({isDirty: false});
    } finally {
      set({ isSaving: false });
    }
  },
}));