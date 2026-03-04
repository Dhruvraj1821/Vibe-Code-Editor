import { WebContainer } from "@webcontainer/api";

let webcontainerInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;

export async function getWebContainer(): Promise<WebContainer> {
  if (webcontainerInstance) return webcontainerInstance;
  if (bootPromise) return bootPromise;
  bootPromise = WebContainer.boot().then((instance) => {
    webcontainerInstance = instance;
    bootPromise = null;
    return instance;
  });
  return bootPromise;
}

export function destroyWebContainer() {
  if (webcontainerInstance) {
    webcontainerInstance.teardown();
    webcontainerInstance = null;
    bootPromise = null;
  }
}

export function filesToWebContainerTree(files: Record<string, string>) {
  const tree: Record<string, any> = {};
  for (const [filePath, content] of Object.entries(files)) {
    const parts = filePath.split("/");
    let current = tree;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      if (isLast) {
        current[part] = { file: { contents: content } };
      } else {
        if (!current[part]) current[part] = { directory: {} };
        current = current[part].directory;
      }
    }
  }
  return tree;
}