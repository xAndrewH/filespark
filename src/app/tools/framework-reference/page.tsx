"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type Framework = "tailwind" | "bootstrap" | "sass" | "react" | "nextjs";

interface Entry {
  title: string;
  description: string;
  code: string;
}

const FRAMEWORKS: { id: Framework; label: string; color: string }[] = [
  { id: "tailwind",  label: "Tailwind CSS", color: "bg-cyan-500/20 border-cyan-500/40 text-cyan-400" },
  { id: "bootstrap", label: "Bootstrap",    color: "bg-purple-500/20 border-purple-500/40 text-purple-400" },
  { id: "sass",      label: "Sass",         color: "bg-pink-500/20 border-pink-500/40 text-pink-400" },
  { id: "react",     label: "React",        color: "bg-blue-500/20 border-blue-500/40 text-blue-400" },
  { id: "nextjs",    label: "Next.js",      color: "bg-slate-400/20 border-slate-400/40 text-slate-300" },
];

const ENTRIES: Record<Framework, Entry[]> = {
  tailwind: [
    { title: "Flexbox center", description: "Center content both axes with flexbox", code: `<div class="flex items-center justify-center">\n  Content\n</div>` },
    { title: "Grid layout", description: "Responsive grid with auto columns", code: `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">\n  <div>Item</div>\n</div>` },
    { title: "Responsive text", description: "Text that scales across breakpoints", code: `<h1 class="text-2xl md:text-4xl lg:text-5xl font-bold">Title</h1>` },
    { title: "Dark mode", description: "Toggle dark mode with dark: prefix", code: `<div class="bg-white dark:bg-slate-900 text-black dark:text-white">\n  Content\n</div>` },
    { title: "Hover + transition", description: "Smooth hover animation", code: `<button class="bg-blue-600 hover:bg-blue-500 transition-colors duration-200 text-white px-4 py-2 rounded-lg">\n  Click me\n</button>` },
    { title: "Custom colors", description: "Extend theme with custom colors", code: `// tailwind.config.js\nexport default {\n  theme: {\n    extend: {\n      colors: {\n        brand: { 500: '#6366f1', 600: '#4f46e5' }\n      }\n    }\n  }\n}` },
    { title: "Arbitrary values", description: "One-off values with square brackets", code: `<div class="top-[117px] w-[calc(100%-2rem)] bg-[#1e293b]">\n  Content\n</div>` },
    { title: "Container query", description: "Style based on parent container size", code: `<div class="@container">\n  <div class="@md:grid-cols-2 grid">\n    Item\n  </div>\n</div>` },
    { title: "Ring / outline", description: "Focus ring for accessibility", code: `<input class="focus:ring-2 focus:ring-blue-500 focus:outline-none border border-slate-300 rounded" />` },
    { title: "Truncate text", description: "Single-line text overflow ellipsis", code: `<p class="truncate max-w-xs">Long text that will be truncated…</p>` },
    { title: "Aspect ratio", description: "Force a specific aspect ratio", code: `<div class="aspect-video bg-slate-800">\n  16:9 container\n</div>` },
    { title: "Gradient", description: "Background gradient utility", code: `<div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8">\n  Gradient\n</div>` },
    { title: "Group hover", description: "Style children on parent hover", code: `<div class="group">\n  <p class="group-hover:text-blue-400 transition-colors">Hover parent</p>\n</div>` },
    { title: "Animate spin", description: "Loading spinner animation", code: `<div class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />` },
    { title: "Line clamp", description: "Clamp multiline text to N lines", code: `<p class="line-clamp-3">Long paragraph that will be clamped after 3 lines of text…</p>` },
  ],
  bootstrap: [
    { title: "Grid system", description: "12-column responsive grid", code: `<div class="container">\n  <div class="row">\n    <div class="col-md-6">Left</div>\n    <div class="col-md-6">Right</div>\n  </div>\n</div>` },
    { title: "Navbar", description: "Responsive collapsible navigation", code: `<nav class="navbar navbar-expand-lg navbar-dark bg-dark">\n  <a class="navbar-brand" href="#">Brand</a>\n  <button class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#nav">\n    <span class="navbar-toggler-icon"></span>\n  </button>\n  <div class="collapse navbar-collapse" id="nav">\n    <ul class="navbar-nav">\n      <li class="nav-item"><a class="nav-link" href="#">Link</a></li>\n    </ul>\n  </div>\n</nav>` },
    { title: "Modal", description: "Popup modal dialog", code: `<button data-bs-toggle="modal" data-bs-target="#myModal" class="btn btn-primary">Open</button>\n\n<div class="modal fade" id="myModal">\n  <div class="modal-dialog">\n    <div class="modal-content">\n      <div class="modal-header">\n        <h5 class="modal-title">Title</h5>\n        <button data-bs-dismiss="modal" class="btn-close"></button>\n      </div>\n      <div class="modal-body">Content</div>\n    </div>\n  </div>\n</div>` },
    { title: "Card", description: "Styled content card component", code: `<div class="card shadow-sm">\n  <img class="card-img-top" src="image.jpg" alt="...">\n  <div class="card-body">\n    <h5 class="card-title">Title</h5>\n    <p class="card-text">Body text.</p>\n    <a href="#" class="btn btn-primary">Action</a>\n  </div>\n</div>` },
    { title: "Forms", description: "Styled form controls", code: `<form>\n  <div class="mb-3">\n    <label class="form-label">Email</label>\n    <input type="email" class="form-control" placeholder="you@example.com">\n  </div>\n  <button type="submit" class="btn btn-primary">Submit</button>\n</form>` },
    { title: "Alert", description: "Dismissible alert banner", code: `<div class="alert alert-success alert-dismissible fade show">\n  Success message!\n  <button data-bs-dismiss="alert" class="btn-close"></button>\n</div>` },
    { title: "Badges", description: "Small count / label badge", code: `<button class="btn btn-primary">\n  Messages\n  <span class="badge bg-danger">4</span>\n</button>` },
    { title: "Flex utilities", description: "Bootstrap flex helpers", code: `<div class="d-flex justify-content-between align-items-center gap-3">\n  <span>Left</span>\n  <span>Right</span>\n</div>` },
    { title: "Spacing", description: "Margin and padding utilities", code: `<!-- m=margin, p=padding, t/b/s/e/x/y=side -->\n<div class="mt-3 mb-2 px-4 py-3">Spaced</div>` },
    { title: "Breakpoints", description: "Responsive breakpoint prefixes", code: `<!-- xs(<576), sm(≥576), md(≥768), lg(≥992), xl(≥1200), xxl(≥1400) -->\n<div class="col-12 col-md-6 col-lg-4">Item</div>` },
    { title: "Offcanvas", description: "Sidebar drawer panel", code: `<button data-bs-toggle="offcanvas" data-bs-target="#sidebar" class="btn btn-primary">Open</button>\n<div class="offcanvas offcanvas-start" id="sidebar">\n  <div class="offcanvas-header">\n    <h5>Sidebar</h5>\n    <button data-bs-dismiss="offcanvas" class="btn-close"></button>\n  </div>\n  <div class="offcanvas-body">Content</div>\n</div>` },
    { title: "Tooltip", description: "Hover tooltip on any element", code: `<!-- Requires Bootstrap JS initialized -->\n<button data-bs-toggle="tooltip" title="Hello!" class="btn btn-secondary">\n  Hover me\n</button>` },
  ],
  sass: [
    { title: "Variables", description: "Store reusable values", code: `$primary: #6366f1;\n$font-size-base: 16px;\n$radius: 8px;\n\n.button {\n  background: $primary;\n  font-size: $font-size-base;\n  border-radius: $radius;\n}` },
    { title: "Nesting", description: "Nest selectors for readability", code: `.card {\n  padding: 1rem;\n  border-radius: 8px;\n\n  &:hover {\n    box-shadow: 0 4px 20px rgba(0,0,0,.1);\n  }\n\n  .card-title {\n    font-size: 1.25rem;\n    font-weight: 600;\n  }\n}` },
    { title: "Mixin", description: "Reusable chunks of CSS", code: `@mixin flex-center {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n@mixin button($color, $hover) {\n  background: $color;\n  &:hover { background: $hover; }\n}\n\n.hero { @include flex-center; }\n.btn { @include button(#3b82f6, #2563eb); }` },
    { title: "Extend", description: "Inherit styles from another selector", code: `%panel {\n  padding: 1.5rem;\n  border-radius: 12px;\n  border: 1px solid #e2e8f0;\n}\n\n.card { @extend %panel; }\n.modal { @extend %panel; background: white; }` },
    { title: "Functions", description: "Custom CSS functions", code: `@function rem($px) {\n  @return $px / 16px * 1rem;\n}\n\n.hero {\n  font-size: rem(48px);\n  padding: rem(24px);\n}` },
    { title: "Each loop", description: "Generate repetitive rules", code: `$sizes: (sm: 8px, md: 16px, lg: 24px);\n\n@each $name, $size in $sizes {\n  .p-#{$name} { padding: $size; }\n  .m-#{$name} { margin: $size; }\n}` },
    { title: "For loop", description: "Numeric loop for generating classes", code: `@for $i from 1 through 12 {\n  .col-#{$i} {\n    width: $i / 12 * 100%;\n  }\n}` },
    { title: "Partials & import", description: "Split Sass across multiple files", code: `// _variables.scss\n$primary: #6366f1;\n\n// _mixins.scss\n@mixin respond($bp) { ... }\n\n// main.scss\n@use 'variables';\n@use 'mixins';` },
    { title: "Color functions", description: "Manipulate colors programmatically", code: `$base: #3b82f6;\n\n.light { background: lighten($base, 20%); }\n.dark  { background: darken($base, 20%); }\n.trans { background: rgba($base, 0.5); }\n.mix  { background: mix(white, $base, 30%); }` },
    { title: "Media query mixin", description: "Wrap breakpoints in a mixin", code: `@mixin respond($bp) {\n  @if $bp == md { @media (min-width: 768px) { @content; } }\n  @if $bp == lg { @media (min-width: 1024px) { @content; } }\n}\n\n.hero {\n  font-size: 1.5rem;\n  @include respond(md) { font-size: 2rem; }\n  @include respond(lg) { font-size: 3rem; }\n}` },
  ],
  react: [
    { title: "Function component", description: "Basic functional component", code: `function Greeting({ name }: { name: string }) {\n  return <h1>Hello, {name}!</h1>;\n}\n\nexport default Greeting;` },
    { title: "useState", description: "Local state management", code: `import { useState } from 'react';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(c => c + 1)}>+</button>\n    </div>\n  );\n}` },
    { title: "useEffect", description: "Side effects and lifecycle", code: `import { useEffect, useState } from 'react';\n\nfunction DataLoader() {\n  const [data, setData] = useState(null);\n\n  useEffect(() => {\n    fetch('/api/data')\n      .then(r => r.json())\n      .then(setData);\n  }, []); // [] = run once on mount\n\n  return <div>{data ? JSON.stringify(data) : 'Loading…'}</div>;\n}` },
    { title: "useRef", description: "Mutable ref for DOM or values", code: `import { useRef } from 'react';\n\nfunction Input() {\n  const inputRef = useRef<HTMLInputElement>(null);\n\n  const focus = () => inputRef.current?.focus();\n\n  return (\n    <>\n      <input ref={inputRef} placeholder="Click button" />\n      <button onClick={focus}>Focus</button>\n    </>\n  );\n}` },
    { title: "useCallback", description: "Memoize a callback function", code: `import { useCallback, useState } from 'react';\n\nfunction Form() {\n  const [val, setVal] = useState('');\n\n  const handleChange = useCallback(\n    (e: React.ChangeEvent<HTMLInputElement>) => {\n      setVal(e.target.value);\n    },\n    [] // deps array\n  );\n\n  return <input value={val} onChange={handleChange} />;\n}` },
    { title: "useMemo", description: "Memoize an expensive computation", code: `import { useMemo, useState } from 'react';\n\nfunction List({ items }: { items: number[] }) {\n  const [filter, setFilter] = useState('');\n\n  const filtered = useMemo(\n    () => items.filter(i => String(i).includes(filter)),\n    [items, filter]\n  );\n\n  return <ul>{filtered.map(i => <li key={i}>{i}</li>)}</ul>;\n}` },
    { title: "Context", description: "Share state without prop drilling", code: `import { createContext, useContext, useState } from 'react';\n\nconst ThemeCtx = createContext<'light' | 'dark'>('light');\n\nfunction Provider({ children }: { children: React.ReactNode }) {\n  const [theme] = useState<'light' | 'dark'>('dark');\n  return <ThemeCtx.Provider value={theme}>{children}</ThemeCtx.Provider>;\n}\n\nfunction Child() {\n  const theme = useContext(ThemeCtx);\n  return <p>Theme: {theme}</p>;\n}` },
    { title: "Custom hook", description: "Extract reusable logic", code: `import { useState, useEffect } from 'react';\n\nfunction useFetch<T>(url: string) {\n  const [data, setData] = useState<T | null>(null);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    fetch(url).then(r => r.json()).then(d => {\n      setData(d);\n      setLoading(false);\n    });\n  }, [url]);\n\n  return { data, loading };\n}\n\n// Usage\nconst { data, loading } = useFetch<User[]>('/api/users');` },
    { title: "Event handling", description: "Typed event handlers", code: `function Form() {\n  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {\n    e.preventDefault();\n    const form = new FormData(e.currentTarget);\n    console.log(Object.fromEntries(form));\n  };\n\n  return (\n    <form onSubmit={handleSubmit}>\n      <input name="email" type="email" />\n      <button type="submit">Submit</button>\n    </form>\n  );\n}` },
    { title: "Conditional rendering", description: "Render based on state/props", code: `function Alert({ type, message }: { type: 'success' | 'error'; message: string }) {\n  return (\n    <div className={type === 'success' ? 'text-green-600' : 'text-red-600'}>\n      {type === 'success' ? '✓' : '✗'} {message}\n    </div>\n  );\n}` },
    { title: "List rendering", description: "Map over arrays to render lists", code: `const items = ['Apple', 'Banana', 'Cherry'];\n\nfunction List() {\n  return (\n    <ul>\n      {items.map((item, i) => (\n        <li key={i}>{item}</li>\n        // Prefer a stable unique key over index\n      ))}\n    </ul>\n  );\n}` },
    { title: "Forwarding refs", description: "Pass refs through components", code: `import { forwardRef } from 'react';\n\nconst Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(\n  (props, ref) => <input ref={ref} className="border rounded px-3 py-2" {...props} />\n);\n\nInput.displayName = 'Input';` },
  ],
  nextjs: [
    { title: "App Router page", description: "Server component page in App Router", code: `// app/about/page.tsx\nexport default function AboutPage() {\n  return <h1>About</h1>;\n}\n\nexport const metadata = {\n  title: 'About — My App',\n};` },
    { title: "Dynamic route", description: "Dynamic segment with params", code: `// app/blog/[slug]/page.tsx\nexport default function BlogPost({\n  params,\n}: {\n  params: Promise<{ slug: string }>;\n}) {\n  const { slug } = use(params);\n  return <h1>Post: {slug}</h1>;\n}` },
    { title: "Data fetching (server)", description: "Fetch data in a Server Component", code: `// Server component — no 'use client'\nasync function getPosts() {\n  const res = await fetch('https://api.example.com/posts', {\n    next: { revalidate: 60 }, // ISR: revalidate every 60s\n  });\n  return res.json();\n}\n\nexport default async function PostsPage() {\n  const posts = await getPosts();\n  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>;\n}` },
    { title: "Client component", description: "Client-side interactivity with use client", code: `'use client';\n\nimport { useState } from 'react';\n\nexport default function Counter() {\n  const [n, setN] = useState(0);\n  return <button onClick={() => setN(n + 1)}>Count: {n}</button>;\n}` },
    { title: "Route Handler (API)", description: "API endpoint in App Router", code: `// app/api/hello/route.ts\nimport { NextRequest, NextResponse } from 'next/server';\n\nexport async function GET(req: NextRequest) {\n  const name = req.nextUrl.searchParams.get('name') ?? 'World';\n  return NextResponse.json({ message: \`Hello, \${name}!\` });\n}` },
    { title: "Middleware", description: "Run code before a request completes", code: `// middleware.ts (root)\nimport { NextResponse } from 'next/server';\nimport type { NextRequest } from 'next/server';\n\nexport function middleware(req: NextRequest) {\n  const token = req.cookies.get('token')?.value;\n  if (!token) return NextResponse.redirect(new URL('/login', req.url));\n  return NextResponse.next();\n}\n\nexport const config = { matcher: ['/dashboard/:path*'] };` },
    { title: "generateStaticParams", description: "Pre-render dynamic routes at build", code: `// app/blog/[slug]/page.tsx\nexport async function generateStaticParams() {\n  const posts = await fetch('/api/posts').then(r => r.json());\n  return posts.map((p: { slug: string }) => ({ slug: p.slug }));\n}` },
    { title: "Image component", description: "Optimized image with next/image", code: `import Image from 'next/image';\n\nexport default function Avatar() {\n  return (\n    <Image\n      src="/avatar.jpg"\n      alt="Avatar"\n      width={64}\n      height={64}\n      className="rounded-full"\n      priority\n    />\n  );\n}` },
    { title: "Link component", description: "Client-side navigation with next/link", code: `import Link from 'next/link';\n\nexport default function Nav() {\n  return (\n    <nav>\n      <Link href="/">Home</Link>\n      <Link href="/about">About</Link>\n      <Link href="/blog" prefetch={false}>Blog</Link>\n    </nav>\n  );\n}` },
    { title: "useRouter (client)", description: "Programmatic navigation client-side", code: `'use client';\n\nimport { useRouter } from 'next/navigation';\n\nexport default function BackButton() {\n  const router = useRouter();\n  return (\n    <button onClick={() => router.push('/dashboard')}>\n      Go to dashboard\n    </button>\n  );\n}` },
    { title: "Layout", description: "Shared layout wrapping child pages", code: `// app/layout.tsx\nimport type { Metadata } from 'next';\n\nexport const metadata: Metadata = { title: 'My App' };\n\nexport default function RootLayout({\n  children,\n}: {\n  children: React.ReactNode;\n}) {\n  return (\n    <html lang="en">\n      <body>{children}</body>\n    </html>\n  );\n}` },
    { title: "Error boundary", description: "Catch errors in a route segment", code: `// app/dashboard/error.tsx\n'use client';\n\nexport default function Error({\n  error,\n  reset,\n}: {\n  error: Error;\n  reset: () => void;\n}) {\n  return (\n    <div>\n      <h2>Something went wrong</h2>\n      <p>{error.message}</p>\n      <button onClick={reset}>Try again</button>\n    </div>\n  );\n}` },
    { title: "Loading UI", description: "Instant loading state while data loads", code: `// app/dashboard/loading.tsx\nexport default function Loading() {\n  return (\n    <div className="animate-pulse space-y-4">\n      <div className="h-8 bg-slate-200 rounded w-1/3" />\n      <div className="h-4 bg-slate-200 rounded w-2/3" />\n    </div>\n  );\n}` },
    { title: "Server Actions", description: "Mutate data from Server Components", code: `// app/actions.ts\n'use server';\n\nimport { revalidatePath } from 'next/cache';\n\nexport async function createPost(formData: FormData) {\n  const title = formData.get('title') as string;\n  await db.post.create({ data: { title } });\n  revalidatePath('/posts');\n}` },
    { title: "next.config.ts", description: "Common Next.js configuration", code: `import type { NextConfig } from 'next';\n\nconst config: NextConfig = {\n  images: {\n    remotePatterns: [{ hostname: 'images.example.com' }],\n  },\n  redirects: async () => [\n    { source: '/old', destination: '/new', permanent: true },\n  ],\n};\n\nexport default config;` },
  ],
};

export default function FrameworkReferencePage() {
  const [fw, setFw] = useState<Framework>("tailwind");
  const [query, setQuery] = useState("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const current = FRAMEWORKS.find(f => f.id === fw)!;

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return ENTRIES[fw];
    return ENTRIES[fw].filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.code.toLowerCase().includes(q)
    );
  }, [fw, query]);

  const copy = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Framework Reference</h1>
        <p className="text-slate-500 text-sm mb-8">Searchable code snippets for Tailwind, Bootstrap, Sass, React, and Next.js.</p>

        {/* Framework tabs */}
        <div className="flex flex-wrap gap-2 mb-5">
          {FRAMEWORKS.map(f => (
            <button key={f.id} onClick={() => { setFw(f.id); setQuery(""); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${fw === f.id ? f.color : "bg-slate-800/60 border-slate-700/50 text-slate-400 hover:text-white"}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={`Search ${current.label} snippets…`}
            className="w-full bg-slate-900/60 border border-slate-800/60 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs">✕</button>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          {filtered.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-10">No snippets match &quot;{query}&quot;</p>
          )}
          {filtered.map((entry, i) => (
            <div key={i} className="bg-slate-900/60 border border-slate-800/60 rounded-xl overflow-hidden">
              <div className="flex items-start justify-between px-4 pt-4 pb-2 gap-3">
                <div>
                  <h3 className="text-white text-sm font-semibold">{entry.title}</h3>
                  <p className="text-slate-500 text-xs mt-0.5">{entry.description}</p>
                </div>
                <button
                  onClick={() => copy(entry.code, i)}
                  className="shrink-0 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors">
                  {copiedIdx === i ? "Copied!" : "Copy"}
                </button>
              </div>
              <pre className="px-4 pb-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed whitespace-pre">{entry.code}</pre>
            </div>
          ))}
        </div>

        {filtered.length > 0 && (
          <p className="text-slate-600 text-xs text-center mt-6">{filtered.length} snippet{filtered.length !== 1 ? "s" : ""} shown</p>
        )}
      </div>
    </div>
  );
}
