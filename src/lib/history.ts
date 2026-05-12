const STORAGE_KEY = "fileflow_history";
const MAX_ENTRIES = 200;

export interface HistoryEntry {
  id: string;
  timestamp: number;
  originalName: string;
  originalSize: number;
  originalExt: string;
  targetFormat: string;
  resultSize: number;
  category: string;
  mode: "convert" | "compress";
}

function load(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as HistoryEntry[];
  } catch {
    return [];
  }
}

function save(entries: HistoryEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function addHistoryEntry(entry: Omit<HistoryEntry, "id" | "timestamp">): void {
  const entries = load();
  entries.unshift({ ...entry, id: crypto.randomUUID(), timestamp: Date.now() });
  save(entries.slice(0, MAX_ENTRIES));
}

export function getHistory(): HistoryEntry[] {
  return load();
}

export function deleteHistoryEntry(id: string): void {
  save(load().filter((e) => e.id !== id));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
