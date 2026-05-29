"use client";
import { useState, useCallback, useEffect } from "react";

const FAV_KEY = "ff-favorites";
const RECENT_KEY = "ff-recents";

export interface RecentEntry { href: string; title: string; ts: number }

export function useToolHistory() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recents, setRecents] = useState<RecentEntry[]>([]);

  useEffect(() => {
    try {
      const f = localStorage.getItem(FAV_KEY);
      if (f) setFavorites(JSON.parse(f));
      const r = localStorage.getItem(RECENT_KEY);
      if (r) setRecents(JSON.parse(r));
    } catch {}
  }, []);

  const toggleFavorite = useCallback((href: string) => {
    setFavorites(prev => {
      const next = prev.includes(href) ? prev.filter(h => h !== href) : [...prev, href];
      try { localStorage.setItem(FAV_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const recordVisit = useCallback((href: string, title: string) => {
    setRecents(prev => {
      const filtered = prev.filter(r => r.href !== href);
      const next = [{ href, title, ts: Date.now() }, ...filtered].slice(0, 8);
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  return { favorites, recents, toggleFavorite, recordVisit };
}
