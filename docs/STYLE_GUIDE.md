# FileSpark Style Guide

The design language for [filespark.app](https://filespark.app) — a dark-themed
file converter and browser-tools app. This guide documents the patterns actually
used across the codebase so new pages and tools stay visually consistent.

**Stack:** Next.js (App Router) · Tailwind CSS · lucide-react · Geist font

---

## 1. Brand

### Logo / mark
A rounded square with a blue→violet gradient and a white "spark" glyph (a plus
sign with a center dot — electric, quick, transformative).

```tsx
<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600
                flex items-center justify-center shadow-lg shadow-blue-500/25">
  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 16 16"
       stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2 8h4M10 8h4M8 2v4M8 10v4" />
    <circle cx="8" cy="8" r="2" fill="currentColor" stroke="none" />
  </svg>
</div>
```

The same mark ships as the favicon (`src/app/favicon.ico`) and `icon.svg`.

### Wordmark
"FileSpark" — `font-bold tracking-tight text-white`. On marketing surfaces the
name may use the gradient text treatment (see §2).

### Voice
Plain, confident, no jargon. Emphasize **free**, **private** (files stay in the
browser where possible), and **fast**. Avoid hype words and em dashes in titles
— use a pipe `|` as the title separator (e.g. `Word Counter | FileSpark`).

---

## 2. Color

The palette is **dark slate** with a **blue→violet** accent.

### Backgrounds
| Token | Use |
|-------|-----|
| `bg-slate-950` | Root page background (darkest) |
| `bg-slate-900/60` (also `/50`, `/40`) | Cards, panels, inputs |
| `bg-slate-800` | Interactive surfaces (secondary buttons, thumbnails) |

### Text
| Token | Use |
|-------|-----|
| `text-white` | Headings, primary labels |
| `text-slate-100` | Body text (set on `<body>`) |
| `text-slate-400` | Secondary body / descriptions |
| `text-slate-500` | Tertiary text, captions, tool subtitles |
| `text-slate-600` | Placeholders, disabled |
| `text-slate-300` | Hover target for secondary text |

### Brand accent
| Purpose | Classes |
|---------|---------|
| Logo / mark gradient | `bg-gradient-to-br from-blue-500 to-violet-600` |
| Hero gradient text | `text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400` |
| Progress / accent bar | `bg-gradient-to-r from-blue-500 to-violet-500` |
| Primary action | `bg-blue-600` → `hover:bg-blue-500` → `active:bg-blue-700` |
| Compress mode accent | `bg-violet-600` / `accent-violet-500` |
| Range inputs | `accent-color: #3b82f6` (blue) |

### Semantic
| Meaning | Background | Text | Border |
|---------|-----------|------|--------|
| Success / done | `bg-green-600` | `text-green-400` | `border-green-900/40` |
| Error / danger | `bg-red-500` | `text-red-400` | `border-red-900/40` |
| Warning | `bg-yellow-500` | `text-yellow-400` | `border-yellow-500/20` |
| Highlight CTA | `bg-yellow-400` | — | — |

### Borders
Default `border-slate-800/60`; slightly lighter `border-slate-700/60`.
Focus: `focus:border-blue-500/60`. Use low-opacity semantic borders
(`/20`–`/40`) for status panels.

> **Opacity is part of the system.** Backgrounds and borders lean heavily on
> `/10`–`/70` opacity modifiers for layered depth on the dark base.

---

## 3. Typography

**Font:** Geist via `next/font/google` (`--font-geist-sans`); Geist Mono for code.

| Role | Classes |
|------|---------|
| Hero `h1` | `text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight` |
| Section `h2` | `text-4xl font-black` |
| Subsection `h2` | `text-2xl font-black` |
| Tool page `h1` | `text-3xl font-bold text-white` |
| Card / link title | `text-sm font-semibold text-white` |
| Form label | `text-sm font-medium text-white` |
| Body | `text-slate-400 leading-relaxed` (large: `text-xl`) |
| Caption / hint | `text-xs text-slate-500` |
| Eyebrow / section label | `text-xs uppercase tracking-widest text-slate-500` |
| Code / hashes / passwords | `font-mono text-sm` |

Weights: `font-black` (900) for marketing headlines, `font-bold` (700) for tool
headers, `font-semibold` (600) for titles, `font-medium` (500) for labels.

---

## 4. Layout & Spacing

- **Containers:** `max-w-5xl` for primary content; `max-w-2xl`/`max-w-lg` for
  focused tool UIs; `max-w-md` for modals. Center with `mx-auto`.
- **Horizontal padding:** `px-4` page gutter; `px-6` buttons; `px-8` large
  sections.
- **Section rhythm:** `mt-24` between major sections; `mb-6`/`mb-5`/`mb-3`
  within components.
- **Gaps:** `gap-2.5` / `gap-3` / `gap-4` for flex/grid.

### Border radius
| Token | Use |
|-------|-----|
| `rounded-lg` (~8px) | Default — small buttons, thumbnails, chips |
| `rounded-xl` (~12px) | Cards, inputs, primary buttons |
| `rounded-2xl` (~16px) | Modals, large containers |
| `rounded-full` | Pills, badges, circular controls |

---

## 5. Components

### Buttons

**Primary**
```tsx
className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white
           text-sm font-semibold rounded-xl px-4 py-1.5
           shadow-sm shadow-blue-500/20 transition-colors"
```

**Secondary**
```tsx
className="bg-slate-800 hover:bg-slate-700 border border-slate-700
           text-slate-300 hover:text-white text-sm font-medium
           rounded-lg px-4 py-1.5 transition-colors"
```

**Compress / alt accent:** swap blue for `bg-violet-600 hover:bg-violet-500`.

> Always give icon-only buttons an `aria-label`. Add `focus:outline-none
> focus:ring-2 focus:ring-blue-500` for keyboard focus visibility.

### Card
```tsx
className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5
           transition-colors duration-300"
```
Status variants use a colored left bar or border (`border-green-900/40` done,
`border-red-900/40` error).

### Input / textarea
```tsx
className="bg-slate-900/60 border border-slate-800/60 text-white text-sm
           rounded-xl px-4 py-3 placeholder-slate-600
           focus:outline-none focus:border-blue-500/60 transition-colors"
```
Pair every input with a `<label htmlFor>` (visible or `sr-only`). Use
`font-mono` for code/hash/token fields.

### Modal
```tsx
className="bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl
           p-6 max-w-md"
```

### Tool page header (standard pattern)
```tsx
<Link href="/tools" className="text-slate-500 hover:text-slate-300 text-sm">← All tools</Link>
<h1 className="text-3xl font-bold text-white mt-4">Tool Name</h1>
<p className="text-slate-500 text-sm mb-8">One-line description of the tool.</p>
```
Each tool also needs a co-located `layout.tsx` exporting `metadata` (title,
description, canonical, openGraph, twitter) — see existing tools for the shape.

---

## 6. Icons

- **Library:** `lucide-react`.
- **Sizes:** `w-3.5 h-3.5` (inline/nav), `w-4 h-4` (content), `w-3 h-3`
  (compact), `w-7 h-7`+ (feature/section).
- **Colors:** `text-slate-400` default; accent with `text-blue-400`,
  `text-green-400`, `text-red-400`, `text-yellow-400` to match semantics.
- **Stroke:** `strokeWidth={1.5}` default, `{2}`–`{2.5}` for emphasis.

---

## 7. Effects & Motion

### Shadows
`shadow-sm` small · `shadow-lg` buttons/CTAs · `shadow-xl` cards ·
`shadow-2xl` modals. Tint with the accent: `shadow-blue-500/20`,
`shadow-violet-500/30`.

### Glass / depth
- Sticky navbar: `bg-slate-950/80 backdrop-blur-md border-b border-slate-800/70`.
- `hero-glow` radial overlay and `dot-pattern` background live in `globals.css`.

### Transitions
- `transition-colors` for color/hover changes (the default).
- `transition-all duration-150` for interactive controls.
- `duration-300`–`500` for progress bars and larger animations.

### Hover / focus
- Scale: `hover:scale-105` (CTAs), `hover:scale-110` (swatches),
  `active:scale-[0.98]` (press).
- Move: `group-hover:-translate-x-0.5` (back-arrows).
- Always preserve a visible focus state for keyboard users.

### Custom utilities (`globals.css`)
`.progress-indeterminate`, `.progress-shimmer`, `.bounce-soft`,
`.animate-spin-slow`, `.scrollbar-thin`, `.dot-pattern`, `.hero-glow`.

---

## 8. Responsive

Tailwind default breakpoints: `sm` 640 · `md` 768 · `lg` 1024. Scale typography
and grids up the ladder, e.g. hero `text-6xl sm:text-7xl lg:text-8xl`. Design
mobile-first; verify at 375px (iPhone SE) that controls wrap without horizontal
overflow.

---

## 9. Accessibility checklist

- Icon-only buttons → `aria-label`.
- Inputs → associated `<label htmlFor>` (or `aria-label`).
- Images → meaningful `alt` (empty `alt=""` only for purely decorative).
- Loading/progress regions → `aria-busy={true}` while working.
- Lists/drawers → friendly empty state when there's nothing to show.
- Keep text contrast ≥ 4.5:1 — prefer `text-slate-400`+ over `text-slate-600`
  for anything users must read.

---

## Quick reference

| | Value |
|---|---|
| Page background | `bg-slate-950` |
| Surface | `bg-slate-900/60 border border-slate-800/60` |
| Primary text | `text-white` / body `text-slate-400` |
| Brand gradient | `from-blue-500 to-violet-600` |
| Primary button | `bg-blue-600 hover:bg-blue-500 rounded-xl` |
| Font | Geist |
| Default radius | `rounded-xl` |
| Container | `max-w-5xl mx-auto px-4` |
| Icon size | `w-4 h-4` |
| Accent hex | `#3b82f6` blue · `#8b5cf6` violet |
