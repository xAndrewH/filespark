"use client";

import { useEffect } from "react";

const KEY = "tools-scroll-y";

export function ToolsScrollSaver() {
  useEffect(() => {
    // If we arrived from outside the /tools section, clear any saved position
    const ref = document.referrer;
    const origin = window.location.origin;
    if (!ref || !ref.startsWith(origin + "/tools/")) {
      sessionStorage.removeItem(KEY);
    }

    let ticking = false;
    const save = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          sessionStorage.setItem(KEY, String(window.scrollY));
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", save, { passive: true });
    return () => window.removeEventListener("scroll", save);
  }, []);

  return null;
}

export function ToolsScrollRestorer() {
  useEffect(() => {
    if (window.location.hash) return; // let the browser handle anchor scrolling
    const y = sessionStorage.getItem(KEY);
    if (!y) return;
    const id = setTimeout(() => window.scrollTo({ top: Number(y), behavior: "instant" }), 0);
    return () => clearTimeout(id);
  }, []);

  return null;
}
