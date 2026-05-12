"use client";

import { useEffect } from "react";

const SCROLL_KEY = "tools-scroll-y";
const FLAG_KEY   = "tools-restore-scroll";

// Placed on the /tools page. Saves scroll position when the user clicks any
// tool link, and sets a flag so the restorer knows to replay it on return.
export function ToolsScrollSaver() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      // Only trigger for direct tool page links (e.g. /tools/image-editor)
      if (/^\/tools\/.+/.test(href)) {
        sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
        sessionStorage.setItem(FLAG_KEY, "1");
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}

// Placed on the /tools page. If the flag is set, restores the saved scroll
// position. Uses double-rAF so it runs after Next.js resets scroll to 0.
export function ToolsScrollRestorer() {
  useEffect(() => {
    if (window.location.hash) return;
    const flag = sessionStorage.getItem(FLAG_KEY);
    if (!flag) return;
    sessionStorage.removeItem(FLAG_KEY);
    const y = Number(sessionStorage.getItem(SCROLL_KEY) ?? "0");
    if (!y) return;

    // Next.js App Router resets scroll during navigation. We counter it by
    // applying our target position in two nested animation frames (after
    // layout + paint), which is later than Next.js's own reset.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: y, behavior: "instant" });
      });
    });
  }, []);

  return null;
}
