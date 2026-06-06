import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const toolsDir = join(root, "src/app/tools");
const pageSrc = readFileSync(join(toolsDir, "page.tsx"), "utf8");

// Only parse the CATEGORIES array (entries with an href), not COMING_SOON.
const entryRe = /\{\s*href:\s*"\/tools\/([^"]+)",[^}]*?title:\s*"([^"]+)",\s*description:\s*"((?:[^"\\]|\\.)*)"\s*\}/g;
const meta = new Map();
let m;
while ((m = entryRe.exec(pageSrc)) !== null) {
  const [, slug, title, description] = m;
  meta.set(slug, { title, description: description.replace(/\\"/g, '"') });
}

// Fallback metadata for live tool dirs not present in the registry.
const fallback = {
  "code-beautifier": {
    title: "Code Beautifier",
    description: "Format and indent HTML, CSS, JavaScript, and more in one place.",
  },
};

const dirs = readdirSync(toolsDir).filter((d) => {
  const p = join(toolsDir, d);
  return statSync(p).isDirectory() && existsSync(join(p, "page.tsx"));
});

let written = 0, skipped = 0, missing = [];
for (const slug of dirs) {
  const info = meta.get(slug) ?? fallback[slug];
  if (!info) { missing.push(slug); continue; }

  const layoutPath = join(toolsDir, slug, "layout.tsx");
  const title = `${info.title} — FileSpark`;
  const desc = info.description;

  const content = `import type { Metadata } from "next";

export const metadata: Metadata = {
  title: ${JSON.stringify(title)},
  description: ${JSON.stringify(desc)},
  alternates: { canonical: ${JSON.stringify(`/tools/${slug}`)} },
  openGraph: {
    title: ${JSON.stringify(title)},
    description: ${JSON.stringify(desc)},
    url: ${JSON.stringify(`/tools/${slug}`)},
    type: "website",
  },
  twitter: {
    card: "summary",
    title: ${JSON.stringify(title)},
    description: ${JSON.stringify(desc)},
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
`;
  writeFileSync(layoutPath, content);
  written++;
}

console.log(`Wrote ${written} layout.tsx files, skipped ${skipped}.`);
if (missing.length) console.log(`No metadata for: ${missing.join(", ")}`);
