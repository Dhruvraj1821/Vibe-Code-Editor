const HIDDEN_FROM_TREE = new Set([
  "package-lock.json",
  ".gitkeep",
]);

export interface FileNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileNode[];
}

export function buildFileTree(files: Record<string, string>): FileNode[] {
  const root: Record<string, any> = {};

  for (const filePath of Object.keys(files)) {
    const parts = filePath.split("/");
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      if (isLast) {
        current[part] = { __type: "file", __path: filePath };
      } else {
        if (!current[part]) {
          current[part] = { __type: "folder" };
        }
        current = current[part];
      }
    }
  }

  function toNodes(obj: Record<string, any>, parentPath = ""): FileNode[] {
    const folders: FileNode[] = [];
    const fileNodes: FileNode[] = [];

    for (const [name, value] of Object.entries(obj)) {
      if (name.startsWith("__")) continue;
      if (HIDDEN_FROM_TREE.has(name)) continue;

      const path = parentPath ? `${parentPath}/${name}` : name;

      if (value.__type === "file") {
        fileNodes.push({ name, path: value.__path, type: "file" });
      } else {
        const children = toNodes(value, path);
        if (children.length > 0) {
          folders.push({ name, path, type: "folder", children });
        }
      }
    }

    // folders first, then files, both alphabetically
    folders.sort((a, b) => a.name.localeCompare(b.name));
    fileNodes.sort((a, b) => a.name.localeCompare(b.name));

    return [...folders, ...fileNodes];
  }

  return toNodes(root);
}

export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

export function getFileIcon(filename: string): string {
  const ext = getFileExtension(filename);
  const iconMap: Record<string, string> = {
    js: "🟨",
    jsx: "⚛️",
    ts: "🔷",
    tsx: "⚛️",
    css: "🎨",
    html: "🌐",
    json: "📋",
    md: "📝",
    svg: "🖼️",
    png: "🖼️",
    jpg: "🖼️",
    env: "🔒",
    gitignore: "🙈",
  };
  return iconMap[ext] ?? "📄";
}

export function getMonacoLanguage(filename: string): string {
  const ext = getFileExtension(filename);
  const langMap: Record<string, string> = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    css: "css",
    html: "html",
    json: "json",
    md: "markdown",
    svg: "xml",
  };
  return langMap[ext] ?? "plaintext";
}