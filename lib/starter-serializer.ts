import fs from "fs";
import path from "path";

const IGNORE_FILES = new Set([
  "package-lock.json",
  "README.md",
  ".gitignore",
  "netlify.toml",
]);

const STARTERS_ROOT = path.join(process.cwd(), "vibecode-starters");

const TEMPLATE_FOLDER_MAP: Record<string, string> = {
  REACT: "react",
  REACT_TS: "react-ts",
  NEXTJS: "nextjs",
  EXPRESS: "express-simple",
  VUE: "vue",
  HONO: "hono-nodejs-starter",
  ANGULAR: "angular",
};


function readDirRecursive(
  dirPath: string,
  baseDir: string
): Record<string, string> {
  const result: Record<string, string> = {};

  if (!fs.existsSync(dirPath)) return result;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (IGNORE_FILES.has(entry.name)) continue;
    // skip hidden files/folders like .next, .angular etc
    if (entry.name.startsWith(".")) continue;

    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.relative(baseDir, fullPath);

    if (entry.isDirectory()) {
      const nested = readDirRecursive(fullPath, baseDir);
      Object.assign(result, nested);
    } else {
      try {
        const content = fs.readFileSync(fullPath, "utf-8");
        // normalize path separators to forward slash
        result[relativePath.replace(/\\/g, "/")] = content;
      } catch {
        // skip binary files that can't be read as utf-8
      }
    }
  }

  return result;
}

export function getStarterFiles(
  template: string,
  useTypeScript: boolean
): Record<string, string> {
  let folderKey = template;

  
  if (template === "REACT" && useTypeScript) {
    folderKey = "REACT_TS";
  }

  const folderName = TEMPLATE_FOLDER_MAP[folderKey];
  if (!folderName) {
    throw new Error(`No starter folder mapped for template: ${template}`);
  }

  const starterPath = path.join(STARTERS_ROOT, folderName);

  if (!fs.existsSync(starterPath)) {
    throw new Error(
      `Starter folder not found: ${starterPath}. Make sure you have downloaded the starters into vibecode-starters/`
    );
  }

  return readDirRecursive(starterPath, starterPath);
}