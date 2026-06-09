import type { Entry } from "../types";

export const nextjsEntries: Entry[] = [
  // ─── File conventions ───────────────────────────────────────────────────────
  {
    title: "page.tsx convention",
    description: "Defines a unique UI for a route segment.",
    code: `// app/dashboard/page.tsx
export default function DashboardPage() {
  return <h1>Dashboard</h1>;
}`,
  },
  {
    title: "layout.tsx convention",
    description: "Wraps pages; persists across navigations.",
    code: `// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <nav>Dashboard Nav</nav>
      {children}
    </section>
  );
}`,
  },
  {
    title: "loading.tsx convention",
    description: "Instant loading UI via React Suspense.",
    code: `// app/dashboard/loading.tsx
export default function Loading() {
  return <p>Loading dashboard…</p>;
}`,
  },
  {
    title: "error.tsx convention",
    description: "Error boundary for a route segment.",
    code: `// app/dashboard/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <p>Something went wrong: {error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}`,
  },
  {
    title: "not-found.tsx convention",
    description: "Renders when notFound() is called.",
    code: `// app/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h2>Page Not Found</h2>
      <p>Could not find the requested resource.</p>
    </div>
  );
}`,
  },
  {
    title: "route.ts convention",
    description: "Defines API endpoint handlers for a segment.",
    code: `// app/api/hello/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello" });
}`,
  },
  {
    title: "template.tsx convention",
    description: "Like layout but re-mounts on navigation.",
    code: `// app/dashboard/template.tsx
export default function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  // Re-renders fresh on every navigation (unlike layout)
  return <div>{children}</div>;
}`,
  },
  {
    title: "default.tsx convention",
    description: "Fallback UI for parallel route slots.",
    code: `// app/@modal/default.tsx
// Rendered when the slot has no active match
export default function Default() {
  return null;
}`,
  },

  // ─── Routing ────────────────────────────────────────────────────────────────
  {
    title: "Static route",
    description: "Fixed path mapped to a page file.",
    code: `// app/about/page.tsx
export default function AboutPage() {
  return <h1>About Us</h1>;
}
// Accessible at /about`,
  },
  {
    title: "Dynamic [slug] route",
    description: "Single dynamic segment in the path.",
    code: `// app/blog/[slug]/page.tsx
export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <h1>Post: {slug}</h1>;
}`,
  },
  {
    title: "Catch-all [...slug]",
    description: "Matches any number of path segments.",
    code: `// app/docs/[...slug]/page.tsx
export default async function DocsPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  // slug is an array: ['a', 'b', 'c'] for /docs/a/b/c
  return <p>Path: {slug.join("/")}</p>;
}`,
  },
  {
    title: "Optional [[...slug]]",
    description: "Catch-all that also matches the root.",
    code: `// app/shop/[[...slug]]/page.tsx
export default async function ShopPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  if (!slug) return <p>Shop home</p>;
  return <p>Category: {slug.join("/")}</p>;
}`,
  },
  {
    title: "Route group (folder)",
    description: "Groups routes without affecting the URL.",
    code: `// app/(marketing)/about/page.tsx  → /about
// app/(marketing)/contact/page.tsx → /contact
// app/(app)/dashboard/page.tsx     → /dashboard
//
// The (marketing) and (app) folders are NOT in the URL.
// Each group can have its own layout.tsx.`,
  },
  {
    title: "Parallel route @slot",
    description: "Render multiple pages in one layout.",
    code: `// app/layout.tsx
export default function Layout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
// app/@modal/login/page.tsx  → fills the modal slot at /login`,
  },
  {
    title: "Intercepting (.) route",
    description: "Intercepts sibling route for soft navigation.",
    code: `// app/feed/@modal/(.)photo/[id]/page.tsx
// Intercepts /photo/[id] when navigating within /feed
// Hard navigation still renders app/photo/[id]/page.tsx
export default async function PhotoModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <dialog open>Photo {id}</dialog>;
}`,
  },
  {
    title: "Intercepting (..) route",
    description: "Intercepts a parent-level route segment.",
    code: `// app/dashboard/@modal/(..)settings/page.tsx
// Intercepts /settings when navigating from /dashboard
export default function SettingsModal() {
  return <dialog open>Settings</dialog>;
}`,
  },
  {
    title: "Intercepting (...) route",
    description: "Intercepts from root level.",
    code: `// app/@modal/(...)/auth/login/page.tsx
// Intercepts /auth/login from anywhere in the app
export default function LoginModal() {
  return <dialog open>Login</dialog>;
}`,
  },

  // ─── Layouts ─────────────────────────────────────────────────────────────────
  {
    title: "Root layout",
    description: "Required top-level layout with html/body.",
    code: `// app/layout.tsx
export const metadata = { title: "My App" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`,
  },
  {
    title: "Nested layout",
    description: "Layout scoped to a route segment subtree.",
    code: `// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-shell">
      <aside>Sidebar</aside>
      <main>{children}</main>
    </div>
  );
}`,
  },
  {
    title: "Layout with nav",
    description: "Server layout containing navigation links.",
    code: `// app/(marketing)/layout.tsx
import Link from "next/link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/pricing">Pricing</Link>
        </nav>
      </header>
      <main>{children}</main>
      <footer>Footer</footer>
    </>
  );
}`,
  },
  {
    title: "Layout with server data",
    description: "Fetch data in layout, pass to children.",
    code: `// app/dashboard/layout.tsx
async function getUser() {
  const res = await fetch("https://api.example.com/me", {
    cache: "no-store",
  });
  return res.json();
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  return (
    <div>
      <p>Welcome, {user.name}</p>
      {children}
    </div>
  );
}`,
  },

  // ─── Server Components ───────────────────────────────────────────────────────
  {
    title: "Async server component",
    description: "Server component that fetches its own data.",
    code: `// app/posts/page.tsx
// No "use client" | server component by default
async function getPosts() {
  const res = await fetch("https://api.example.com/posts");
  return res.json() as Promise<{ id: number; title: string }[]>;
}

export default async function PostsPage() {
  const posts = await getPosts();
  return (
    <ul>
      {posts.map((p) => (
        <li key={p.id}>{p.title}</li>
      ))}
    </ul>
  );
}`,
  },
  {
    title: "Server to client props",
    description: "Pass serializable data from server to client.",
    code: `// app/page.tsx (Server Component)
import { Counter } from "@/components/Counter";

export default async function Home() {
  const data = await fetch("https://api.example.com/count").then((r) =>
    r.json()
  );
  // Only serializable data can cross the boundary
  return <Counter initialCount={data.count} />;
}

// components/Counter.tsx
"use client";
import { useState } from "react";

export function Counter({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}`,
  },
  {
    title: "Component composition",
    description: "Interleave server and client components.",
    code: `// Server component wraps a client component
// app/page.tsx
import { Modal } from "@/components/Modal"; // client
import { ServerList } from "@/components/ServerList"; // server

export default function Page() {
  return (
    <Modal>
      {/* Children are rendered on the server, passed as props */}
      <ServerList />
    </Modal>
  );
}

// components/Modal.tsx
"use client";
import { useState } from "react";

export function Modal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(!open)}>Toggle</button>
      {open && children}
    </div>
  );
}`,
  },
  {
    title: "Server component with DB",
    description: "Query database directly in server component.",
    code: `// app/users/page.tsx
import { db } from "@/lib/db";

export default async function UsersPage() {
  // This code only runs on the server | safe to use ORM/DB directly
  const users = await db.user.findMany({ take: 10 });
  return (
    <ul>
      {users.map((u) => (
        <li key={u.id}>{u.email}</li>
      ))}
    </ul>
  );
}`,
  },

  // ─── Client Components ───────────────────────────────────────────────────────
  {
    title: "'use client' directive",
    description: "Marks a module as a client component.",
    code: `"use client";
// Every import in this file is also treated as client-side.
// Place this at the very top before any imports.
import { useState } from "react";

export function Toggle() {
  const [on, setOn] = useState(false);
  return <button onClick={() => setOn(!on)}>{on ? "ON" : "OFF"}</button>;
}`,
  },
  {
    title: "useState in client",
    description: "Local state inside a client component.",
    code: `"use client";
import { useState } from "react";

export function EmailForm() {
  const [email, setEmail] = useState("");
  return (
    <input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="you@example.com"
    />
  );
}`,
  },
  {
    title: "Event handlers client",
    description: "onClick and other DOM events need client.",
    code: `"use client";

export function LikeButton({ postId }: { postId: string }) {
  async function handleClick() {
    await fetch(\`/api/like/\${postId}\`, { method: "POST" });
    alert("Liked!");
  }
  return <button onClick={handleClick}>Like</button>;
}`,
  },
  {
    title: "Browser API in client",
    description: "Access window/localStorage on the client.",
    code: `"use client";
import { useEffect, useState } from "react";

export function ThemeReader() {
  const [theme, setTheme] = useState<string | null>(null);
  useEffect(() => {
    setTheme(localStorage.getItem("theme"));
  }, []);
  return <p>Theme: {theme ?? "default"}</p>;
}`,
  },

  // ─── Data Fetching ───────────────────────────────────────────────────────────
  {
    title: "fetch no-store",
    description: "Opt out of caching; always fresh data.",
    code: `export default async function LivePage() {
  const res = await fetch("https://api.example.com/live", {
    cache: "no-store",
  });
  const data = await res.json();
  return <p>{data.value}</p>;
}`,
  },
  {
    title: "fetch revalidate",
    description: "Revalidate cached response after N seconds.",
    code: `export default async function NewsPage() {
  const res = await fetch("https://api.example.com/news", {
    next: { revalidate: 60 }, // revalidate every 60 s
  });
  const articles = await res.json();
  return (
    <ul>
      {articles.map((a: { id: number; title: string }) => (
        <li key={a.id}>{a.title}</li>
      ))}
    </ul>
  );
}`,
  },
  {
    title: "fetch force-cache",
    description: "Aggressively cache the response indefinitely.",
    code: `export default async function StaticPage() {
  const res = await fetch("https://api.example.com/config", {
    cache: "force-cache", // default in Server Components
  });
  const config = await res.json();
  return <pre>{JSON.stringify(config, null, 2)}</pre>;
}`,
  },
  {
    title: "Parallel data fetching",
    description: "Fetch multiple resources simultaneously.",
    code: `async function getUser(id: string) {
  return fetch(\`https://api.example.com/users/\${id}\`).then((r) => r.json());
}
async function getPosts(userId: string) {
  return fetch(\`https://api.example.com/users/\${userId}/posts\`).then((r) =>
    r.json()
  );
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Both fetches fire at the same time
  const [user, posts] = await Promise.all([getUser(id), getPosts(id)]);
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{posts.length} posts</p>
    </div>
  );
}`,
  },
  {
    title: "Sequential data fetching",
    description: "Second fetch depends on first result.",
    code: `export default async function ArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const artist = await fetch(\`https://api.example.com/artists/\${id}\`).then(
    (r) => r.json()
  );
  // Must wait for artist before fetching albums
  const albums = await fetch(
    \`https://api.example.com/artists/\${artist.id}/albums\`
  ).then((r) => r.json());
  return (
    <div>
      <h1>{artist.name}</h1>
      <p>{albums.length} albums</p>
    </div>
  );
}`,
  },
  {
    title: "unstable_cache helper",
    description: "Cache arbitrary async functions like fetch.",
    code: `import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

const getCachedUser = unstable_cache(
  async (id: string) => db.user.findUnique({ where: { id } }),
  ["user"], // cache key parts
  { revalidate: 3600, tags: ["users"] }
);

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCachedUser(id);
  if (!user) return <p>Not found</p>;
  return <h1>{user.name}</h1>;
}`,
  },

  // ─── Server Actions ──────────────────────────────────────────────────────────
  {
    title: "'use server' directive",
    description: "Marks async functions as server actions.",
    code: `// app/actions.ts
"use server";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  await db.post.create({ data: { title } });
}`,
  },
  {
    title: "Form with server action",
    description: "HTML form submits directly to server action.",
    code: `// app/new-post/page.tsx
import { createPost } from "@/app/actions";

export default function NewPostPage() {
  return (
    <form action={createPost}>
      <input name="title" placeholder="Post title" required />
      <button type="submit">Create</button>
    </form>
  );
}`,
  },
  {
    title: "useActionState hook",
    description: "Track server action state in a client component.",
    code: `"use client";
import { useActionState } from "react";
import { createPost } from "@/app/actions";

export function PostForm() {
  const [state, formAction, isPending] = useActionState(createPost, null);
  return (
    <form action={formAction}>
      <input name="title" />
      <button disabled={isPending}>{isPending ? "Saving…" : "Save"}</button>
      {state?.error && <p>{state.error}</p>}
    </form>
  );
}`,
  },
  {
    title: "revalidatePath in action",
    description: "Purge route cache after a mutation.",
    code: `"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function deletePost(id: string) {
  await db.post.delete({ where: { id } });
  revalidatePath("/posts"); // refresh the /posts page cache
}`,
  },
  {
    title: "revalidateTag in action",
    description: "Purge all cache entries with a tag.",
    code: `"use server";
import { revalidateTag } from "next/cache";

export async function updateProduct(id: string, data: FormData) {
  await fetch(\`https://api.example.com/products/\${id}\`, {
    method: "PATCH",
    body: data,
  });
  revalidateTag("products"); // invalidates any fetch tagged "products"
}`,
  },
  {
    title: "redirect in action",
    description: "Redirect to another route after an action.",
    code: `"use server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export async function createAndRedirect(formData: FormData) {
  const post = await db.post.create({
    data: { title: formData.get("title") as string },
  });
  redirect(\`/posts/\${post.id}\`); // must be outside try/catch
}`,
  },
  {
    title: "cookies in action",
    description: "Read or set cookies inside a server action.",
    code: `"use server";
import { cookies } from "next/headers";

export async function setPreference(formData: FormData) {
  const cookieStore = await cookies();
  cookieStore.set("theme", formData.get("theme") as string, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
}`,
  },
  {
    title: "headers in action",
    description: "Read request headers in a server action.",
    code: `"use server";
import { headers } from "next/headers";

export async function getLocale() {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language");
  return acceptLanguage?.split(",")[0] ?? "en";
}`,
  },

  // ─── Route Handlers ──────────────────────────────────────────────────────────
  {
    title: "GET route handler",
    description: "Handle GET requests at an API endpoint.",
    code: `// app/api/items/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const items = await db.item.findMany();
  return NextResponse.json(items);
}`,
  },
  {
    title: "POST route handler",
    description: "Create a resource via POST request.",
    code: `// app/api/items/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const item = await db.item.create({ data: body });
  return NextResponse.json(item, { status: 201 });
}`,
  },
  {
    title: "PUT route handler",
    description: "Update a resource via PUT request.",
    code: `// app/api/items/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const item = await db.item.update({ where: { id }, data: body });
  return NextResponse.json(item);
}`,
  },
  {
    title: "DELETE route handler",
    description: "Remove a resource via DELETE request.",
    code: `// app/api/items/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.item.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}`,
  },
  {
    title: "Dynamic route handler",
    description: "Route handler with URL parameter.",
    code: `// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await db.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}`,
  },
  {
    title: "Handler headers/cookies",
    description: "Read headers and cookies in route handler.",
    code: `// app/api/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies, headers } from "next/headers";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const headersList = await headers();
  const ua = headersList.get("user-agent");
  return NextResponse.json({ token, ua });
}`,
  },
  {
    title: "Streaming route handler",
    description: "Stream response with ReadableStream.",
    code: `// app/api/stream/route.ts
export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < 5; i++) {
        controller.enqueue(encoder.encode(\`data: chunk \${i}\n\n\`));
        await new Promise((r) => setTimeout(r, 500));
      }
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream" },
  });
}`,
  },

  // ─── Middleware ───────────────────────────────────────────────────────────────
  {
    title: "Auth redirect middleware",
    description: "Redirect unauthenticated users to login.",
    code: `// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
};`,
  },
  {
    title: "A/B testing middleware",
    description: "Randomly split traffic between two variants.",
    code: `// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const bucket = Math.random() < 0.5 ? "a" : "b";
  const response = NextResponse.rewrite(
    new URL(\`/\${bucket}\${request.nextUrl.pathname}\`, request.url)
  );
  response.cookies.set("ab-bucket", bucket, { maxAge: 60 * 60 });
  return response;
}`,
  },
  {
    title: "i18n redirect middleware",
    description: "Redirect to locale-prefixed path.",
    code: `// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = ["en", "fr", "de"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = LOCALES.some(
    (l) => pathname.startsWith(\`/\${l}/\`) || pathname === \`/\${l}\`
  );
  if (!hasLocale) {
    const locale = request.headers.get("accept-language")?.slice(0, 2) ?? "en";
    return NextResponse.redirect(
      new URL(\`/\${LOCALES.includes(locale) ? locale : "en"}\${pathname}\`, request.url)
    );
  }
}

export const config = { matcher: ["/((?!_next|api).*)"] };`,
  },
  {
    title: "Middleware adding headers",
    description: "Attach custom response headers in middleware.",
    code: `// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  return response;
}`,
  },
  {
    title: "Middleware matcher config",
    description: "Limit middleware to specific paths.",
    code: `// middleware.ts
export const config = {
  matcher: [
    // Match all except static files and Next internals
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};`,
  },

  // ─── Metadata ─────────────────────────────────────────────────────────────────
  {
    title: "Static metadata export",
    description: "Export metadata object from page or layout.",
    code: `// app/about/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about our company.",
};

export default function AboutPage() {
  return <h1>About</h1>;
}`,
  },
  {
    title: "generateMetadata async",
    description: "Dynamic metadata based on route params.",
    code: `// app/blog/[slug]/page.tsx
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetch(\`https://api.example.com/posts/\${slug}\`).then((r) =>
    r.json()
  );
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <h1>{slug}</h1>;
}`,
  },
  {
    title: "OpenGraph metadata",
    description: "Set OG image, title, and type.",
    code: `import type { Metadata } from "next";

export const metadata: Metadata = {
  openGraph: {
    title: "My App",
    description: "The best app ever.",
    url: "https://myapp.com",
    siteName: "My App",
    images: [
      {
        url: "https://myapp.com/og.png",
        width: 1200,
        height: 630,
        alt: "My App",
      },
    ],
    type: "website",
  },
};`,
  },
  {
    title: "Twitter card metadata",
    description: "Set Twitter card for social sharing.",
    code: `import type { Metadata } from "next";

export const metadata: Metadata = {
  twitter: {
    card: "summary_large_image",
    title: "My App",
    description: "The best app ever.",
    creator: "@myhandle",
    images: ["https://myapp.com/twitter-card.png"],
  },
};`,
  },
  {
    title: "Robots metadata",
    description: "Control search engine indexing directives.",
    code: `import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};`,
  },
  {
    title: "Canonical URL metadata",
    description: "Set canonical link to avoid duplicate content.",
    code: `import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://myapp.com/about",
    languages: {
      "en-US": "https://myapp.com/en/about",
      "fr-FR": "https://myapp.com/fr/about",
    },
  },
};`,
  },
  {
    title: "generateViewport export",
    description: "Control viewport meta in a dedicated export.",
    code: `import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};`,
  },

  // ─── Static Generation ───────────────────────────────────────────────────────
  {
    title: "generateStaticParams",
    description: "Pre-render dynamic routes at build time.",
    code: `// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await fetch("https://api.example.com/posts").then((r) =>
    r.json()
  );
  return posts.map((post: { slug: string }) => ({ slug: post.slug }));
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <h1>{slug}</h1>;
}`,
  },
  {
    title: "force-static segment",
    description: "Force a route segment to always be static.",
    code: `// app/docs/page.tsx
export const dynamic = "force-static";

export default async function DocsPage() {
  // Will always be statically generated, even with dynamic APIs
  return <h1>Documentation</h1>;
}`,
  },
  {
    title: "revalidate = false segment",
    description: "Opt segment into indefinite static caching.",
    code: `// app/changelog/page.tsx
export const revalidate = false; // cache forever (until redeploy)

export default async function ChangelogPage() {
  const data = await fetch("https://api.example.com/changelog").then((r) =>
    r.json()
  );
  return <pre>{JSON.stringify(data)}</pre>;
}`,
  },

  // ─── Dynamic Rendering ───────────────────────────────────────────────────────
  {
    title: "force-dynamic segment",
    description: "Opt route into dynamic rendering per request.",
    code: `// app/dashboard/page.tsx
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Always server-renders on every request
  const data = await fetch("https://api.example.com/me", {
    cache: "no-store",
  }).then((r) => r.json());
  return <h1>Hi {data.name}</h1>;
}`,
  },
  {
    title: "revalidate = 0 segment",
    description: "Revalidate on every request (no cache).",
    code: `// app/feed/page.tsx
export const revalidate = 0;

export default async function FeedPage() {
  const posts = await fetch("https://api.example.com/feed").then((r) =>
    r.json()
  );
  return <ul>{posts.map((p: { id: number; title: string }) => <li key={p.id}>{p.title}</li>)}</ul>;
}`,
  },
  {
    title: "noStore() dynamic opt-out",
    description: "Programmatically opt out of caching.",
    code: `import { unstable_noStore as noStore } from "next/cache";

export default async function LiveScores() {
  noStore(); // equivalent to cache: "no-store" on all fetches
  const scores = await fetch("https://api.example.com/scores").then((r) =>
    r.json()
  );
  return <pre>{JSON.stringify(scores)}</pre>;
}`,
  },

  // ─── Caching & Revalidation ──────────────────────────────────────────────────
  {
    title: "revalidatePath call",
    description: "Purge specific path from cache on demand.",
    code: `// app/api/revalidate/route.ts
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { path } = await request.json();
  revalidatePath(path);
  return NextResponse.json({ revalidated: true });
}`,
  },
  {
    title: "revalidateTag call",
    description: "Purge all cache entries sharing a tag.",
    code: `// app/api/revalidate/route.ts
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST() {
  revalidateTag("products");
  return NextResponse.json({ revalidated: true });
}`,
  },
  {
    title: "On-demand ISR endpoint",
    description: "Webhook triggers revalidation of stale pages.",
    code: `// app/api/webhook/route.ts
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-webhook-secret");
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await request.json();
  revalidatePath(\`/blog/\${slug}\`);
  revalidateTag("blog");
  return NextResponse.json({ revalidated: true });
}`,
  },
  {
    title: "Cache tags in fetch",
    description: "Tag fetch responses for targeted revalidation.",
    code: `export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await fetch(\`https://api.example.com/products/\${id}\`, {
    next: { tags: ["products", \`product-\${id}\`] },
  }).then((r) => r.json());
  return <h1>{product.name}</h1>;
}`,
  },

  // ─── Params & Search Params ──────────────────────────────────────────────────
  {
    title: "use(params) server",
    description: "Unwrap params Promise in server component.",
    code: `// app/blog/[slug]/page.tsx
export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // In Next.js 15, params is a Promise in server components
  const { slug } = await params;
  return <h1>{slug}</h1>;
}`,
  },
  {
    title: "useParams client hook",
    description: "Read dynamic params in a client component.",
    code: `"use client";
import { useParams } from "next/navigation";

export function SlugBadge() {
  const params = useParams<{ slug: string }>();
  return <span>Current slug: {params.slug}</span>;
}`,
  },
  {
    title: "useSearchParams hook",
    description: "Read query string in a client component.",
    code: `"use client";
import { useSearchParams } from "next/navigation";

export function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  return <p>Searching for: {query}</p>;
}`,
  },
  {
    title: "searchParams page prop",
    description: "Access search params in a server page.",
    code: `// app/search/page.tsx
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page = "1" } = await searchParams;
  const results = await fetch(
    \`https://api.example.com/search?q=\${q}&page=\${page}\`
  ).then((r) => r.json());
  return <p>{results.total} results for "{q}"</p>;
}`,
  },

  // ─── Navigation ───────────────────────────────────────────────────────────────
  {
    title: "Link component",
    description: "Client-side navigation with prefetching.",
    code: `import Link from "next/link";

export function Nav() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
      <Link href={\`/blog/\${slug}\`}>Read Post</Link>
    </nav>
  );
}`,
  },
  {
    title: "useRouter navigate",
    description: "Programmatic navigation with router hook.",
    code: `"use client";
import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();
  return (
    <div>
      <button onClick={() => router.push("/dashboard")}>Dashboard</button>
      <button onClick={() => router.replace("/login")}>Replace</button>
      <button onClick={() => router.back()}>Back</button>
      <button onClick={() => router.refresh()}>Refresh</button>
    </div>
  );
}`,
  },
  {
    title: "usePathname hook",
    description: "Read current URL pathname on the client.",
    code: `"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link href={href} aria-current={isActive ? "page" : undefined}>
      {children}
    </Link>
  );
}`,
  },
  {
    title: "redirect() server-side",
    description: "Redirect from a server component or action.",
    code: `// app/protected/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function ProtectedPage() {
  const session = await getSession();
  if (!session) redirect("/login"); // throws internally | no return needed
  return <h1>Protected content</h1>;
}`,
  },
  {
    title: "permanentRedirect()",
    description: "Issue a 308 permanent redirect server-side.",
    code: `import { permanentRedirect } from "next/navigation";

export default async function OldPage() {
  permanentRedirect("/new-path"); // 308 status
}`,
  },

  // ─── next/image ───────────────────────────────────────────────────────────────
  {
    title: "Local image",
    description: "Import and display a local image file.",
    code: `import Image from "next/image";
import hero from "@/public/hero.png";

export function Hero() {
  return (
    <Image
      src={hero}
      alt="Hero image"
      // width and height are inferred from the import
      priority
    />
  );
}`,
  },
  {
    title: "Remote image",
    description: "Display image from a remote URL.",
    code: `import Image from "next/image";

export function Avatar({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt="User avatar"
      width={64}
      height={64}
    />
  );
}
// next.config.ts must allowlist the remote hostname`,
  },
  {
    title: "Image fill layout",
    description: "Image fills its positioned parent container.",
    code: `import Image from "next/image";

export function Cover({ src }: { src: string }) {
  return (
    <div style={{ position: "relative", width: "100%", height: "400px" }}>
      <Image
        src={src}
        alt="Cover photo"
        fill
        style={{ objectFit: "cover" }}
        sizes="100vw"
      />
    </div>
  );
}`,
  },
  {
    title: "Image blur placeholder",
    description: "Show blurred placeholder while image loads.",
    code: `import Image from "next/image";
import hero from "@/public/hero.jpg";

export function BlurHero() {
  return (
    <Image
      src={hero}
      alt="Hero"
      placeholder="blur"
      // For remote images: blurDataURL="data:image/..."
    />
  );
}`,
  },
  {
    title: "Image priority and sizes",
    description: "LCP image with responsive sizes hint.",
    code: `import Image from "next/image";

export function HeroImage({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt="Hero"
      width={1280}
      height={720}
      priority // preloads the image
      sizes="(max-width: 768px) 100vw, 50vw"
    />
  );
}`,
  },

  // ─── next/font ────────────────────────────────────────────────────────────────
  {
    title: "Google font",
    description: "Self-host a Google font with next/font.",
    code: `// app/layout.tsx
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}`,
  },
  {
    title: "Local font",
    description: "Load a custom local font file.",
    code: `import localFont from "next/font/local";

const myFont = localFont({
  src: "./fonts/MyFont.woff2",
  variable: "--font-my",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={myFont.variable}>
      <body>{children}</body>
    </html>
  );
}`,
  },
  {
    title: "Variable font with Tailwind",
    description: "Use CSS variable from next/font in Tailwind.",
    code: `// app/layout.tsx
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}

// tailwind.config.ts
// theme: { extend: { fontFamily: { sans: ["var(--font-inter)"] } } }`,
  },
  {
    title: "Multiple fonts",
    description: "Combine two fonts in one layout.",
    code: `import { Inter, Merriweather } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-serif",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={\`\${inter.variable} \${merriweather.variable}\`}>
      <body>{children}</body>
    </html>
  );
}`,
  },

  // ─── next/link ────────────────────────────────────────────────────────────────
  {
    title: "Link prefetch false",
    description: "Disable prefetching on hover for a link.",
    code: `import Link from "next/link";

export function LazyLink() {
  return (
    <Link href="/heavy-page" prefetch={false}>
      Load on click
    </Link>
  );
}`,
  },
  {
    title: "Link scroll false",
    description: "Prevent scrolling to top on navigation.",
    code: `import Link from "next/link";

export function ShallowLink({ tab }: { tab: string }) {
  return (
    <Link href={\`?tab=\${tab}\`} scroll={false}>
      {tab}
    </Link>
  );
}`,
  },
  {
    title: "Link replace",
    description: "Replace history entry instead of pushing.",
    code: `import Link from "next/link";

export function ReplaceLink() {
  return (
    <Link href="/login" replace>
      Sign In (no back)
    </Link>
  );
}`,
  },

  // ─── next/script ─────────────────────────────────────────────────────────────
  {
    title: "Script beforeInteractive",
    description: "Load script before page becomes interactive.",
    code: `import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <Script src="/polyfills.js" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}`,
  },
  {
    title: "Script afterInteractive",
    description: "Load script after hydration (default).",
    code: `import Script from "next/script";

export default function AnalyticsPage({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=GA_ID"
        strategy="afterInteractive"
      />
    </>
  );
}`,
  },
  {
    title: "Script lazyOnload",
    description: "Defer script until browser is idle.",
    code: `import Script from "next/script";

export default function Page() {
  return (
    <>
      <h1>Content</h1>
      <Script
        src="https://cdn.example.com/widget.js"
        strategy="lazyOnload"
        onLoad={() => console.log("Widget loaded")}
      />
    </>
  );
}`,
  },

  // ─── Environment Variables ───────────────────────────────────────────────────
  {
    title: ".env.local file",
    description: "Local environment variables not committed.",
    code: `# .env.local | git-ignored, for local dev only
DATABASE_URL=postgresql://localhost/mydb
NEXTAUTH_SECRET=supersecret
NEXT_PUBLIC_API_URL=https://api.example.com`,
  },
  {
    title: "NEXT_PUBLIC_ prefix",
    description: "Expose env var to browser bundle.",
    code: `// .env.local
NEXT_PUBLIC_STRIPE_KEY=pk_test_...
DATABASE_URL=postgres://...  // server-only, never exposed

// Usage in client component
"use client";
export function StripeButton() {
  // NEXT_PUBLIC_ vars are inlined at build time
  const key = process.env.NEXT_PUBLIC_STRIPE_KEY;
  return <div data-key={key} />;
}`,
  },
  {
    title: "Server-only env vars",
    description: "Use server env vars only in server code.",
    code: `// lib/db.ts | server-only module
import "server-only"; // throws if accidentally imported by client

export const db = createClient({
  // process.env.DATABASE_URL is never sent to the browser
  connectionString: process.env.DATABASE_URL!,
});`,
  },
  {
    title: "Runtime env vars",
    description: "Read env at runtime in route handlers.",
    code: `// app/api/config/route.ts
export async function GET() {
  // These are read at runtime, not build time
  const { DATABASE_URL, API_KEY } = process.env;
  return Response.json({ configured: !!(DATABASE_URL && API_KEY) });
}`,
  },

  // ─── next.config.ts ───────────────────────────────────────────────────────────
  {
    title: "next.config redirects",
    description: "Define permanent or temporary URL redirects.",
    code: `// next.config.ts
import type { NextConfig } from "next";

const config: NextConfig = {
  async redirects() {
    return [
      {
        source: "/old-blog/:slug",
        destination: "/blog/:slug",
        permanent: true, // 308
      },
    ];
  },
};

export default config;`,
  },
  {
    title: "next.config rewrites",
    description: "Proxy requests to external URLs transparently.",
    code: `// next.config.ts
import type { NextConfig } from "next";

const config: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v2/:path*",
        destination: "https://backend.example.com/:path*",
      },
    ];
  },
};

export default config;`,
  },
  {
    title: "next.config headers",
    description: "Add security headers to responses.",
    code: `// next.config.ts
import type { NextConfig } from "next";

const config: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default config;`,
  },
  {
    title: "next.config remotePatterns",
    description: "Allowlist remote image hostnames.",
    code: `// next.config.ts
import type { NextConfig } from "next";

const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.cloudinary.com",
      },
    ],
  },
};

export default config;`,
  },
  {
    title: "next.config experimental",
    description: "Enable experimental Next.js features.",
    code: `// next.config.ts
import type { NextConfig } from "next";

const config: NextConfig = {
  experimental: {
    ppr: true, // Partial Pre-Rendering
    after: true, // after() API
  },
};

export default config;`,
  },

  // ─── TypeScript helpers ──────────────────────────────────────────────────────
  {
    title: "PageProps type",
    description: "Type-safe props for a page component.",
    code: `// app/blog/[slug]/page.tsx
type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { q } = await searchParams;
  return <h1>{slug}</h1>;
}`,
  },
  {
    title: "LayoutProps type",
    description: "Type-safe props for a layout component.",
    code: `type LayoutProps = {
  children: React.ReactNode;
  params?: Promise<{ id: string }>; // optional for root layout
};

export default async function Layout({ children, params }: LayoutProps) {
  const { id } = await (params ?? Promise.resolve({ id: "" }));
  return <div data-id={id}>{children}</div>;
}`,
  },
  {
    title: "RouteHandlerContext type",
    description: "Typed context for dynamic route handlers.",
    code: `// app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return NextResponse.json({ id });
}`,
  },

  // ─── Error handling ───────────────────────────────────────────────────────────
  {
    title: "error.tsx with reset",
    description: "Recover from errors without full reload.",
    code: `"use client";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}`,
  },
  {
    title: "global-error.tsx",
    description: "Catch errors in the root layout.",
    code: `// app/global-error.tsx
"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>Application Error</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}`,
  },
  {
    title: "notFound() trigger",
    description: "Throw a 404 from within a server component.",
    code: `// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await db.post.findUnique({ where: { slug } });
  if (!post) notFound(); // renders not-found.tsx
  return <h1>{post.title}</h1>;
}`,
  },

  // ─── Streaming ────────────────────────────────────────────────────────────────
  {
    title: "Suspense in server component",
    description: "Wrap slow components in Suspense boundaries.",
    code: `// app/dashboard/page.tsx
import { Suspense } from "react";
import { RecentOrders } from "@/components/RecentOrders";

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<p>Loading orders…</p>}>
        <RecentOrders />
      </Suspense>
    </div>
  );
}

// components/RecentOrders.tsx (Server Component)
export async function RecentOrders() {
  const orders = await fetch("https://api.example.com/orders").then((r) =>
    r.json()
  );
  return <ul>{orders.map((o: { id: string }) => <li key={o.id}>{o.id}</li>)}</ul>;
}`,
  },
  {
    title: "Multiple Suspense boundaries",
    description: "Stream independent sections independently.",
    code: `// app/page.tsx
import { Suspense } from "react";
import { Stats } from "@/components/Stats";
import { Feed } from "@/components/Feed";
import { Recommendations } from "@/components/Recommendations";

export default function HomePage() {
  return (
    <div>
      <Suspense fallback={<div>Loading stats…</div>}>
        <Stats />
      </Suspense>
      <Suspense fallback={<div>Loading feed…</div>}>
        <Feed />
      </Suspense>
      <Suspense fallback={<div>Loading suggestions…</div>}>
        <Recommendations />
      </Suspense>
    </div>
  );
}`,
  },

  // ─── Advanced ─────────────────────────────────────────────────────────────────
  {
    title: "instrumentation.ts",
    description: "Run code once when the server starts.",
    code: `// instrumentation.ts (root of project)
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Server-side only setup
    const { initTracing } = await import("./lib/tracing");
    await initTracing();
  }
}`,
  },
  {
    title: "after() API",
    description: "Run code after response is sent.",
    code: `// app/api/log/route.ts
import { after } from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const response = NextResponse.json({ ok: true });

  // Runs after the response is fully sent
  after(async () => {
    await db.log.create({ data: { payload: body } });
  });

  return response;
}`,
  },
  {
    title: "Edge runtime segment",
    description: "Run a route on the Edge runtime.",
    code: `// app/api/edge/route.ts
export const runtime = "edge";

export async function GET() {
  return new Response("Hello from the Edge!", {
    headers: { "content-type": "text/plain" },
  });
}`,
  },
  {
    title: "Prisma singleton",
    description: "Reuse Prisma client across hot reloads.",
    code: `// lib/db.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ?? new PrismaClient({ log: ["query"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;`,
  },
  {
    title: "Auth.js v5 server session",
    description: "Get session in a server component.",
    code: `// app/dashboard/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");
  return <h1>Hi, {session.user?.name}</h1>;
}

// auth.ts (project root)
// import NextAuth from "next-auth"; ...`,
  },
  {
    title: "Auth.js v5 client session",
    description: "Access session data in a client component.",
    code: `"use client";
import { useSession } from "next-auth/react";

export function UserBadge() {
  const { data: session, status } = useSession();
  if (status === "loading") return <p>Loading…</p>;
  if (!session) return <p>Not signed in</p>;
  return <p>Signed in as {session.user?.email}</p>;
}`,
  },
  {
    title: "useOptimistic updates",
    description: "Optimistically update UI before server confirms.",
    code: `"use client";
import { useOptimistic, useTransition } from "react";
import { likePost } from "@/app/actions";

export function LikeButton({
  postId,
  initialLikes,
}: {
  postId: string;
  initialLikes: number;
}) {
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    initialLikes,
    (state: number) => state + 1
  );
  const [, startTransition] = useTransition();

  function handleLike() {
    startTransition(async () => {
      addOptimisticLike(undefined);
      await likePost(postId);
    });
  }

  return (
    <button onClick={handleLike}>
      {optimisticLikes} Likes
    </button>
  );
}`,
  },

  // ─── Additional important patterns ───────────────────────────────────────────
  {
    title: "Server action inline form",
    description: "Define server action inline in a Server Component.",
    code: `// app/contact/page.tsx
export default function ContactPage() {
  async function sendMessage(formData: FormData) {
    "use server";
    const message = formData.get("message") as string;
    await db.message.create({ data: { body: message } });
  }

  return (
    <form action={sendMessage}>
      <textarea name="message" />
      <button type="submit">Send</button>
    </form>
  );
}`,
  },
  {
    title: "Fetch with cache tag",
    description: "Attach tags to a fetch for selective revalidation.",
    code: `async function getProducts() {
  const res = await fetch("https://api.example.com/products", {
    next: { tags: ["products"], revalidate: 3600 },
  });
  return res.json();
}`,
  },
  {
    title: "cookies() read server",
    description: "Read request cookies in a server component.",
    code: `import { cookies } from "next/headers";

export default async function ThemePage() {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value ?? "light";
  return <div data-theme={theme}>Content</div>;
}`,
  },
  {
    title: "headers() read server",
    description: "Read request headers in a server component.",
    code: `import { headers } from "next/headers";

export default async function Page() {
  const headersList = await headers();
  const country = headersList.get("x-vercel-ip-country") ?? "US";
  return <p>Your country: {country}</p>;
}`,
  },
  {
    title: "Route segment config",
    description: "Control caching, runtime, and fetch config.",
    code: `// app/api/data/route.ts
export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return Response.json({ ts: Date.now() });
}`,
  },
  {
    title: "Image art direction",
    description: "Serve different images at different breakpoints.",
    code: `import Image from "next/image";

export function ResponsiveHero() {
  return (
    <picture>
      <source
        media="(min-width: 768px)"
        srcSet="/hero-desktop.webp"
      />
      {/* next/image handles the mobile fallback */}
      <Image
        src="/hero-mobile.jpg"
        alt="Hero"
        width={390}
        height={844}
        priority
      />
    </picture>
  );
}`,
  },
  {
    title: "Metadata with icons",
    description: "Define favicon and app icons via metadata.",
    code: `import type { Metadata } from "next";

export const metadata: Metadata = {
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};`,
  },
  {
    title: "Dynamic segment not found",
    description: "Return 404 for unmatched generateStaticParams.",
    code: `// app/blog/[slug]/page.tsx
export const dynamicParams = false; // 404 for slugs not in generateStaticParams

export async function generateStaticParams() {
  return [{ slug: "hello" }, { slug: "world" }];
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <h1>{slug}</h1>;
}`,
  },
  {
    title: "Streaming with loading.tsx",
    description: "Automatic Suspense boundary via loading file.",
    code: `// app/feed/loading.tsx | automatically wraps page in Suspense
export default function FeedLoading() {
  return (
    <div aria-label="Loading feed">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="skeleton-card" />
      ))}
    </div>
  );
}
// app/feed/page.tsx can be an async server component that awaits data`,
  },
  {
    title: "Middleware with NextResponse.next",
    description: "Passthrough middleware with modified headers.",
    code: `// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}`,
  },
  {
    title: "Server action with validation",
    description: "Validate form data and return errors.",
    code: `"use server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

export async function createUser(
  _prevState: unknown,
  formData: FormData
) {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  await db.user.create({ data: parsed.data });
  return { success: true };
}`,
  },
  {
    title: "next/font multiple weights",
    description: "Load specific font weights from Google.",
    code: `import { Roboto } from "next/font/google";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  variable: "--font-roboto",
});`,
  },
  {
    title: "Parallel routes with modal",
    description: "Show modal on navigation with parallel slots.",
    code: `// app/layout.tsx
export default function Layout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html><body>
      {children}
      {modal}
    </body></html>
  );
}
// app/@modal/(.)login/page.tsx | intercepting route
// app/@modal/default.tsx    | returns null (slot default)`,
  },
  {
    title: "next.config env mapping",
    description: "Expose server env vars via next.config.",
    code: `// next.config.ts
import type { NextConfig } from "next";

const config: NextConfig = {
  env: {
    // Available both server and client
    APP_VERSION: process.env.npm_package_version ?? "0.0.0",
  },
};

export default config;`,
  },
  {
    title: "Draft mode",
    description: "Enable CMS preview (draft) rendering.",
    code: `// app/api/draft/route.ts
import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const draft = await draftMode();
  draft.enable();
  return NextResponse.redirect(new URL("/", "http://localhost:3000"));
}

// In a page or layout:
// const { isEnabled } = await draftMode();`,
  },
  {
    title: "Connection API",
    description: "Wait for a request before rendering.",
    code: `import { connection } from "next/server";

export default async function Page() {
  // Opt into dynamic rendering; waits for a real connection
  await connection();
  const data = await fetch("https://api.example.com/data", {
    cache: "no-store",
  }).then((r) => r.json());
  return <pre>{JSON.stringify(data)}</pre>;
}`,
  },
  {
    title: "Server component error boundary",
    description: "Wrap a server component fetch in try/catch.",
    code: `export default async function SafeWidget() {
  try {
    const data = await fetch("https://api.example.com/widget").then((r) => {
      if (!r.ok) throw new Error("Failed to fetch");
      return r.json();
    });
    return <div>{data.value}</div>;
  } catch {
    return <div>Widget unavailable</div>;
  }
}`,
  },
  {
    title: "Route handler CORS",
    description: "Add CORS headers to an API route handler.",
    code: `// app/api/data/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { data: "hello" },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    },
  });
}`,
  },
  {
    title: "next.config compiler options",
    description: "Enable SWC transforms in next.config.",
    code: `// next.config.ts
import type { NextConfig } from "next";

const config: NextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
    styledComponents: true,
  },
};

export default config;`,
  },
];
