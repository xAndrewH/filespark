export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export function getExtension(name: string): string {
  return name.split(".").pop()?.toLowerCase() || "";
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function replaceExtension(filename: string, newExt: string): string {
  const dot = filename.lastIndexOf(".");
  const base = dot > 0 ? filename.slice(0, dot) : filename;
  return `${base}.${newExt}`;
}
