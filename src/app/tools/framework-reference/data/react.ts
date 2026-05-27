import type { Entry } from "../types";

export const reactEntries: Entry[] = [
  // ─── 1. Components ───────────────────────────────────────────────────────────
  {
    title: "Function Component",
    description: "Basic function component with JSX return.",
    code: `function Greeting() {
  return <h1>Hello, world!</h1>;
}

export default Greeting;`,
  },
  {
    title: "Arrow Component",
    description: "Arrow-function component with explicit return.",
    code: `const Badge = () => (
  <span className="badge">New</span>
);

export default Badge;`,
  },
  {
    title: "Component With Children",
    description: "Accept and render arbitrary child elements.",
    code: `import type { ReactNode } from "react";

function Card({ children }: { children: ReactNode }) {
  return <div className="card">{children}</div>;
}

export default Card;`,
  },
  {
    title: "Named Exports",
    description: "Export multiple components from one file.",
    code: `export function Primary() {
  return <button className="btn-primary">Primary</button>;
}

export function Secondary() {
  return <button className="btn-secondary">Secondary</button>;
}`,
  },

  // ─── 2. Props ────────────────────────────────────────────────────────────────
  {
    title: "Basic Prop Types",
    description: "Inline type annotation for component props.",
    code: `function UserCard({
  name,
  age,
  active,
}: {
  name: string;
  age: number;
  active: boolean;
}) {
  return (
    <div>
      {name} ({age}) {active ? "✓" : "✗"}
    </div>
  );
}`,
  },
  {
    title: "Optional Props",
    description: "Mark props optional with ? and provide fallback.",
    code: `function Avatar({
  src,
  alt = "avatar",
  size = 40,
}: {
  src: string;
  alt?: string;
  size?: number;
}) {
  return <img src={src} alt={alt} width={size} height={size} />;
}`,
  },
  {
    title: "Default Prop Values",
    description: "Destructuring defaults avoid undefined at runtime.",
    code: `type ButtonProps = {
  label: string;
  variant?: "primary" | "ghost";
  disabled?: boolean;
};

function Button({
  label,
  variant = "primary",
  disabled = false,
}: ButtonProps) {
  return (
    <button className={\`btn-\${variant}\`} disabled={disabled}>
      {label}
    </button>
  );
}`,
  },
  {
    title: "Spreading Props",
    description: "Forward all props to an underlying element.",
    code: `import type { ComponentPropsWithoutRef } from "react";

function Input(props: ComponentPropsWithoutRef<"input">) {
  return <input className="custom-input" {...props} />;
}`,
  },
  {
    title: "Rest Props Pattern",
    description: "Extract own props, forward the rest.",
    code: `import type { ComponentPropsWithoutRef } from "react";

type Props = ComponentPropsWithoutRef<"button"> & {
  loading?: boolean;
};

function Button({ loading = false, children, ...rest }: Props) {
  return (
    <button disabled={loading || rest.disabled} {...rest}>
      {loading ? "Loading…" : children}
    </button>
  );
}`,
  },
  {
    title: "ReactNode Children",
    description: "Type children as ReactNode for maximum flexibility.",
    code: `import type { ReactNode } from "react";

type LayoutProps = {
  header: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

function Layout({ header, children, footer }: LayoutProps) {
  return (
    <>
      <header>{header}</header>
      <main>{children}</main>
      {footer && <footer>{footer}</footer>}
    </>
  );
}`,
  },
  {
    title: "PropsWithChildren",
    description: "Utility type that adds children to any props object.",
    code: `import type { PropsWithChildren } from "react";

type PanelProps = PropsWithChildren<{
  title: string;
}>;

function Panel({ title, children }: PanelProps) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}`,
  },

  // ─── 3. useState ─────────────────────────────────────────────────────────────
  {
    title: "useState Boolean",
    description: "Toggle a boolean flag with useState.",
    code: `import { useState } from "react";

function Toggle() {
  const [on, setOn] = useState(false);
  return (
    <button onClick={() => setOn((prev) => !prev)}>
      {on ? "ON" : "OFF"}
    </button>
  );
}`,
  },
  {
    title: "useState Number",
    description: "Increment and decrement a numeric counter.",
    code: `import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <button onClick={() => setCount((c) => c - 1)}>-</button>
      <span>{count}</span>
      <button onClick={() => setCount((c) => c + 1)}>+</button>
    </div>
  );
}`,
  },
  {
    title: "useState String",
    description: "Bind an input to a string state value.",
    code: `import { useState } from "react";

function NameInput() {
  const [name, setName] = useState("");
  return (
    <input
      value={name}
      onChange={(e) => setName(e.target.value)}
      placeholder="Your name"
    />
  );
}`,
  },
  {
    title: "useState Array",
    description: "Add and remove items from a state array.",
    code: `import { useState } from "react";

function TagList() {
  const [tags, setTags] = useState<string[]>([]);

  const addTag = (tag: string) =>
    setTags((prev) => [...prev, tag]);

  const removeTag = (tag: string) =>
    setTags((prev) => prev.filter((t) => t !== tag));

  return (
    <ul>
      {tags.map((tag) => (
        <li key={tag} onClick={() => removeTag(tag)}>
          {tag}
        </li>
      ))}
    </ul>
  );
}`,
  },
  {
    title: "useState Object",
    description: "Merge partial updates into an object state.",
    code: `import { useState } from "react";

type Form = { name: string; email: string };

function ProfileForm() {
  const [form, setForm] = useState<Form>({ name: "", email: "" });

  const update = (patch: Partial<Form>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  return (
    <>
      <input value={form.name} onChange={(e) => update({ name: e.target.value })} />
      <input value={form.email} onChange={(e) => update({ email: e.target.value })} />
    </>
  );
}`,
  },
  {
    title: "useState Lazy Init",
    description: "Pass a function to compute expensive initial state once.",
    code: `import { useState } from "react";

function parseInitial(): number[] {
  // expensive computation runs only once
  return JSON.parse(localStorage.getItem("items") ?? "[]");
}

function ItemList() {
  const [items, setItems] = useState<number[]>(parseInitial);
  return <span>{items.length} items</span>;
}`,
  },
  {
    title: "Functional State Update",
    description: "Use updater function to read latest state.",
    code: `import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  // Always uses the latest count, safe in closures
  const increment = () => setCount((prev) => prev + 1);

  return <button onClick={increment}>{count}</button>;
}`,
  },
  {
    title: "Previous State Pattern",
    description: "Capture previous render's value via useRef.",
    code: `import { useEffect, useRef, useState } from "react";

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

function Counter() {
  const [count, setCount] = useState(0);
  const prev = usePrevious(count);
  return <p>now {count}, was {prev}</p>;
}`,
  },

  // ─── 4. useEffect ────────────────────────────────────────────────────────────
  {
    title: "useEffect On Mount",
    description: "Run a side-effect once after first render.",
    code: `import { useEffect } from "react";

function Analytics() {
  useEffect(() => {
    console.log("component mounted");
  }, []); // empty deps → runs once

  return null;
}`,
  },
  {
    title: "useEffect With Deps",
    description: "Re-run effect whenever a dependency changes.",
    code: `import { useEffect, useState } from "react";

function Title({ id }: { id: number }) {
  const [title, setTitle] = useState("");

  useEffect(() => {
    fetch(\`/api/posts/\${id}\`)
      .then((r) => r.json())
      .then((d) => setTitle(d.title));
  }, [id]); // re-runs when id changes

  return <h1>{title}</h1>;
}`,
  },
  {
    title: "useEffect Cleanup",
    description: "Return a cleanup function to avoid leaks.",
    code: `import { useEffect } from "react";

function Clock() {
  useEffect(() => {
    const id = setInterval(() => console.log(Date.now()), 1000);
    return () => clearInterval(id); // cleanup on unmount
  }, []);

  return <span>ticking…</span>;
}`,
  },
  {
    title: "useEffect Async Pattern",
    description: "Fetch with AbortController to cancel stale requests.",
    code: `import { useEffect, useState } from "react";

function Post({ id }: { id: number }) {
  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(\`/api/posts/\${id}\`, { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => setData(d.body))
      .catch(() => {/* ignore abort errors */});

    return () => controller.abort();
  }, [id]);

  return <p>{data}</p>;
}`,
  },
  {
    title: "Skip Mount Effect",
    description: "Skip effect on first render using a mounted ref.",
    code: `import { useEffect, useRef } from "react";

function Logger({ value }: { value: string }) {
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    console.log("value changed:", value);
  }, [value]);

  return null;
}`,
  },

  // ─── 5. useRef ───────────────────────────────────────────────────────────────
  {
    title: "DOM Element Ref",
    description: "Access a DOM node directly via ref.",
    code: `import { useRef } from "react";

function FocusInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input ref={inputRef} />
      <button onClick={() => inputRef.current?.focus()}>
        Focus
      </button>
    </>
  );
}`,
  },
  {
    title: "Mutable Ref Value",
    description: "Store a mutable value without triggering re-renders.",
    code: `import { useRef } from "react";

function RenderCount() {
  const renders = useRef(0);
  renders.current += 1;
  return <span>Rendered {renders.current} times</span>;
}`,
  },
  {
    title: "Interval Ref",
    description: "Hold an interval ID so cleanup can clear it.",
    code: `import { useEffect, useRef } from "react";

function Ticker({ onTick }: { onTick: () => void }) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(onTick, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [onTick]);

  return null;
}`,
  },
  {
    title: "Previous Value Ref",
    description: "Capture the previous render's prop value.",
    code: `import { useEffect, useRef } from "react";

function usePrevious<T>(value: T) {
  const ref = useRef<T>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}`,
  },
  {
    title: "Merging Refs",
    description: "Attach multiple refs to one element.",
    code: `import { type Ref, useCallback } from "react";

function useMergedRef<T>(...refs: Ref<T>[]) {
  return useCallback(
    (node: T | null) => {
      for (const ref of refs) {
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<T | null>).current = node;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs,
  );
}`,
  },

  // ─── 6. useCallback ──────────────────────────────────────────────────────────
  {
    title: "useCallback Basic",
    description: "Memoize a callback to stabilize its reference.",
    code: `import { useCallback, useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  const increment = useCallback(() => {
    setCount((c) => c + 1);
  }, []); // stable reference

  return <button onClick={increment}>{count}</button>;
}`,
  },
  {
    title: "Prevent Child Re-renders",
    description: "Pass stable callback to memoized child component.",
    code: `import { memo, useCallback, useState } from "react";

const Child = memo(function Child({ onClick }: { onClick: () => void }) {
  console.log("child rendered");
  return <button onClick={onClick}>Click</button>;
});

function Parent() {
  const [count, setCount] = useState(0);
  const handleClick = useCallback(() => setCount((c) => c + 1), []);
  return <Child onClick={handleClick} />;
}`,
  },
  {
    title: "Stable Event Handlers",
    description: "Avoid recreating event handlers on every render.",
    code: `import { useCallback } from "react";

function SearchBar({ onSearch }: { onSearch: (q: string) => void }) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearch(e.target.value);
    },
    [onSearch],
  );

  return <input onChange={handleChange} placeholder="Search…" />;
}`,
  },

  // ─── 7. useMemo ──────────────────────────────────────────────────────────────
  {
    title: "useMemo Expensive Computation",
    description: "Cache a heavy calculation between renders.",
    code: `import { useMemo } from "react";

function PrimeList({ limit }: { limit: number }) {
  const primes = useMemo(() => {
    const result: number[] = [];
    for (let n = 2; n <= limit; n++) {
      if (result.every((p) => n % p !== 0)) result.push(n);
    }
    return result;
  }, [limit]);

  return <span>{primes.length} primes up to {limit}</span>;
}`,
  },
  {
    title: "Memoized Object",
    description: "Stabilize an object reference to prevent downstream effects.",
    code: `import { useMemo } from "react";

function useConfig(theme: string, locale: string) {
  return useMemo(
    () => ({ theme, locale, rtl: locale === "ar" }),
    [theme, locale],
  );
}`,
  },
  {
    title: "Derived State",
    description: "Compute derived values without extra state.",
    code: `import { useMemo, useState } from "react";

function FilteredList({ items }: { items: string[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => items.filter((i) => i.toLowerCase().includes(query.toLowerCase())),
    [items, query],
  );

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ul>{filtered.map((i) => <li key={i}>{i}</li>)}</ul>
    </>
  );
}`,
  },

  // ─── 8. useReducer ───────────────────────────────────────────────────────────
  {
    title: "useReducer Basic",
    description: "Manage state transitions with a reducer function.",
    code: `import { useReducer } from "react";

type State = { count: number };
type Action = { type: "inc" } | { type: "dec" } | { type: "reset" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "inc":   return { count: state.count + 1 };
    case "dec":   return { count: state.count - 1 };
    case "reset": return { count: 0 };
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  return (
    <>
      <span>{state.count}</span>
      <button onClick={() => dispatch({ type: "inc" })}>+</button>
      <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
    </>
  );
}`,
  },
  {
    title: "Discriminated Union Actions",
    description: "Type-safe actions with discriminated unions.",
    code: `type Item = { id: number; text: string; done: boolean };

type Action =
  | { type: "add"; text: string }
  | { type: "toggle"; id: number }
  | { type: "remove"; id: number };

function todosReducer(state: Item[], action: Action): Item[] {
  switch (action.type) {
    case "add":
      return [...state, { id: Date.now(), text: action.text, done: false }];
    case "toggle":
      return state.map((i) =>
        i.id === action.id ? { ...i, done: !i.done } : i,
      );
    case "remove":
      return state.filter((i) => i.id !== action.id);
  }
}`,
  },
  {
    title: "Reducer As Store",
    description: "Combine useReducer + useContext as a mini store.",
    code: `import { createContext, useContext, useReducer, type ReactNode } from "react";

type State = { count: number };
type Action = { type: "inc" } | { type: "dec" };

const Ctx = createContext<[State, React.Dispatch<Action>] | null>(null);

function reducer(s: State, a: Action): State {
  return a.type === "inc" ? { count: s.count + 1 } : { count: s.count - 1 };
}

export function CounterProvider({ children }: { children: ReactNode }) {
  const value = useReducer(reducer, { count: 0 });
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCounter() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCounter must be inside CounterProvider");
  return ctx;
}`,
  },

  // ─── 9. useContext + createContext ───────────────────────────────────────────
  {
    title: "createContext Basic",
    description: "Share data through the component tree.",
    code: `import { createContext, useContext } from "react";

const ThemeContext = createContext<"light" | "dark">("light");

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button data-theme={theme}>Click me</button>;
}

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <ThemedButton />
    </ThemeContext.Provider>
  );
}`,
  },
  {
    title: "Typed Context Hook",
    description: "Wrap useContext in a typed custom hook.",
    code: `import { createContext, useContext, type ReactNode } from "react";

type User = { id: string; name: string };
const UserContext = createContext<User | null>(null);

export function useUser(): User {
  const user = useContext(UserContext);
  if (!user) throw new Error("useUser must be inside UserProvider");
  return user;
}

export function UserProvider({
  user,
  children,
}: {
  user: User;
  children: ReactNode;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}`,
  },
  {
    title: "Context Default Value",
    description: "Provide a sensible default so the provider is optional.",
    code: `import { createContext, useContext } from "react";

type Locale = "en" | "fr" | "de";

const LocaleContext = createContext<Locale>("en"); // safe default

function Greeting() {
  const locale = useContext(LocaleContext);
  const greetings: Record<Locale, string> = {
    en: "Hello",
    fr: "Bonjour",
    de: "Hallo",
  };
  return <p>{greetings[locale]}</p>;
}`,
  },

  // ─── 10. Custom Hooks ─────────────────────────────────────────────────────────
  {
    title: "useToggle Hook",
    description: "Boolean toggle with optional force-set.",
    code: `import { useCallback, useState } from "react";

function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue((v) => !v), []);
  const setTrue  = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  return [value, toggle, setTrue, setFalse] as const;
}`,
  },
  {
    title: "useLocalStorage Hook",
    description: "Persist state to localStorage with JSON serialization.",
    code: `import { useEffect, useState } from "react";

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}`,
  },
  {
    title: "useDebounce Hook",
    description: "Delay updating a value until input settles.",
    code: `import { useEffect, useState } from "react";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}`,
  },
  {
    title: "useFetch Hook",
    description: "Generic fetch with loading and error state.",
    code: `import { useEffect, useState } from "react";

type FetchState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
};

function useFetch<T>(url: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    setState({ data: null, loading: true, error: null });
    fetch(url, { signal: controller.signal })
      .then((r) => r.json())
      .then((data: T) => setState({ data, loading: false, error: null }))
      .catch((error: Error) => {
        if (error.name !== "AbortError")
          setState({ data: null, loading: false, error });
      });
    return () => controller.abort();
  }, [url]);

  return state;
}`,
  },
  {
    title: "useMediaQuery Hook",
    description: "Reactively match a CSS media query.",
    code: `import { useEffect, useState } from "react";

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}`,
  },
  {
    title: "useClickOutside Hook",
    description: "Detect clicks outside a given element.",
    code: `import { type RefObject, useEffect } from "react";

function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: () => void,
) {
  useEffect(() => {
    function listener(e: MouseEvent) {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    }
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}`,
  },
  {
    title: "useWindowSize Hook",
    description: "Track browser window dimensions reactively.",
    code: `import { useEffect, useState } from "react";

function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const update = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return size;
}`,
  },
  {
    title: "useKeyPress Hook",
    description: "Detect whether a specific key is currently pressed.",
    code: `import { useEffect, useState } from "react";

function useKeyPress(targetKey: string): boolean {
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === targetKey) setPressed(true);
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === targetKey) setPressed(false);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [targetKey]);

  return pressed;
}`,
  },
  {
    title: "usePrevious Hook",
    description: "Return the value from the previous render.",
    code: `import { useEffect, useRef } from "react";

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}`,
  },
  {
    title: "useAsync Hook",
    description: "Run an async function and track its state.",
    code: `import { useCallback, useEffect, useState } from "react";

type AsyncState<T> =
  | { status: "idle" }
  | { status: "pending" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };

function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<AsyncState<T>>({ status: "idle" });

  const run = useCallback(() => {
    setState({ status: "pending" });
    fn()
      .then((data) => setState({ status: "success", data }))
      .catch((error: Error) => setState({ status: "error", error }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { run(); }, [run]);

  return state;
}`,
  },
  {
    title: "useInterval Hook",
    description: "Declarative setInterval that respects React lifecycle.",
    code: `import { useEffect, useRef } from "react";

function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);
  useEffect(() => { savedCallback.current = callback; }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}`,
  },
  {
    title: "useScrollPosition Hook",
    description: "Track page scroll position with throttling.",
    code: `import { useEffect, useState } from "react";

function useScrollPosition() {
  const [pos, setPos] = useState({ x: window.scrollX, y: window.scrollY });

  useEffect(() => {
    let ticking = false;
    const handler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setPos({ x: window.scrollX, y: window.scrollY });
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return pos;
}`,
  },
  {
    title: "useIntersectionObserver Hook",
    description: "Observe when an element enters the viewport.",
    code: `import { type RefObject, useEffect, useState } from "react";

function useIntersectionObserver<T extends Element>(
  ref: RefObject<T>,
  options?: IntersectionObserverInit,
): IntersectionObserverEntry | null {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([e]) => setEntry(e),
      options,
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, options]);

  return entry;
}`,
  },
  {
    title: "useEventListener Hook",
    description: "Attach typed event listeners declaratively.",
    code: `import { type RefObject, useEffect, useRef } from "react";

function useEventListener<
  K extends keyof HTMLElementEventMap,
  T extends HTMLElement = HTMLDivElement,
>(
  eventName: K,
  handler: (e: HTMLElementEventMap[K]) => void,
  element?: RefObject<T>,
) {
  const savedHandler = useRef(handler);
  useEffect(() => { savedHandler.current = handler; }, [handler]);

  useEffect(() => {
    const target = element?.current ?? window;
    const listener = (e: Event) =>
      savedHandler.current(e as HTMLElementEventMap[K]);
    target.addEventListener(eventName, listener);
    return () => target.removeEventListener(eventName, listener);
  }, [eventName, element]);
}`,
  },

  // ─── 11. Event Handlers ──────────────────────────────────────────────────────
  {
    title: "Click Handler",
    description: "Handle button clicks with a typed event.",
    code: `function ClickDemo() {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("clicked", e.currentTarget.id);
  };

  return <button id="demo" onClick={handleClick}>Click me</button>;
}`,
  },
  {
    title: "Change Handler",
    description: "Read input value from a change event.",
    code: `import { useState } from "react";

function InputDemo() {
  const [value, setValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return <input value={value} onChange={handleChange} />;
}`,
  },
  {
    title: "Submit Handler",
    description: "Prevent default and read form data on submit.",
    code: `function FormDemo() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    console.log(data.get("email"));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" />
      <button type="submit">Send</button>
    </form>
  );
}`,
  },
  {
    title: "Keyboard Handler",
    description: "Respond to specific key presses in an input.",
    code: `function KeyDemo() {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") console.log("submitted:", e.currentTarget.value);
    if (e.key === "Escape") e.currentTarget.blur();
  };

  return <input onKeyDown={handleKeyDown} placeholder="Press Enter" />;
}`,
  },
  {
    title: "Focus Blur Handlers",
    description: "Track focus state of a form element.",
    code: `import { useState } from "react";

function FocusDemo() {
  const [focused, setFocused] = useState(false);

  return (
    <input
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ outline: focused ? "2px solid blue" : "none" }}
    />
  );
}`,
  },
  {
    title: "Mouse Events",
    description: "Track mouse enter and leave on an element.",
    code: `import { useState } from "react";

function HoverBox() {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? "lightblue" : "white", padding: 16 }}
    >
      {hovered ? "Inside!" : "Hover me"}
    </div>
  );
}`,
  },
  {
    title: "Drag Events",
    description: "Implement a simple drag-and-drop region.",
    code: `import { useState } from "react";

function DropZone() {
  const [over, setOver] = useState(false);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const file = e.dataTransfer.files[0];
        console.log("dropped:", file?.name);
      }}
      style={{ border: \`2px dashed \${over ? "blue" : "gray"}\`, padding: 32 }}
    >
      Drop file here
    </div>
  );
}`,
  },
  {
    title: "Clipboard Handler",
    description: "Read text from paste events.",
    code: `function PasteBox() {
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData("text/plain");
    console.log("pasted:", text);
  };

  return <textarea onPaste={handlePaste} placeholder="Paste here" />;
}`,
  },

  // ─── 12. Forms ───────────────────────────────────────────────────────────────
  {
    title: "Controlled Input",
    description: "React owns the input value via state.",
    code: `import { useState } from "react";

function ControlledInput() {
  const [value, setValue] = useState("");
  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}`,
  },
  {
    title: "Controlled Select",
    description: "Manage a select element with React state.",
    code: `import { useState } from "react";

function ControlledSelect() {
  const [color, setColor] = useState("red");
  return (
    <select value={color} onChange={(e) => setColor(e.target.value)}>
      <option value="red">Red</option>
      <option value="green">Green</option>
      <option value="blue">Blue</option>
    </select>
  );
}`,
  },
  {
    title: "Controlled Checkbox",
    description: "Bind a checkbox to a boolean state value.",
    code: `import { useState } from "react";

function ControlledCheckbox() {
  const [checked, setChecked] = useState(false);
  return (
    <label>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
      />
      Accept terms
    </label>
  );
}`,
  },
  {
    title: "Controlled Radio",
    description: "Group radio buttons with shared state.",
    code: `import { useState } from "react";

const sizes = ["S", "M", "L", "XL"] as const;
type Size = (typeof sizes)[number];

function SizePicker() {
  const [size, setSize] = useState<Size>("M");
  return (
    <div>
      {sizes.map((s) => (
        <label key={s}>
          <input
            type="radio"
            value={s}
            checked={size === s}
            onChange={() => setSize(s)}
          />
          {s}
        </label>
      ))}
    </div>
  );
}`,
  },
  {
    title: "Controlled Textarea",
    description: "Textarea with character limit indicator.",
    code: `import { useState } from "react";

const MAX = 280;

function TweetBox() {
  const [text, setText] = useState("");
  return (
    <>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, MAX))}
        rows={4}
      />
      <small>{MAX - text.length} remaining</small>
    </>
  );
}`,
  },
  {
    title: "Uncontrolled With Ref",
    description: "Read form values imperatively on submit.",
    code: `import { useRef } from "react";

function UncontrolledForm() {
  const nameRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(nameRef.current?.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={nameRef} defaultValue="" />
      <button type="submit">Submit</button>
    </form>
  );
}`,
  },
  {
    title: "FormData On Submit",
    description: "Extract all fields via the FormData API.",
    code: `function DataForm() {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const values = Object.fromEntries(fd.entries());
    console.log(values); // { name: "…", email: "…" }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" />
      <input name="email" type="email" placeholder="Email" />
      <button type="submit">Submit</button>
    </form>
  );
}`,
  },
  {
    title: "Validation Pattern",
    description: "Show inline errors after attempted submit.",
    code: `import { useState } from "react";

function ValidatedForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const validate = () => {
    if (!email.includes("@")) {
      setError("Enter a valid email");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) console.log("submitted", email);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      {error && <p role="alert" style={{ color: "red" }}>{error}</p>}
      <button type="submit">Submit</button>
    </form>
  );
}`,
  },
  {
    title: "Form Reset",
    description: "Reset controlled form state to initial values.",
    code: `import { useState } from "react";

const INITIAL = { name: "", message: "" };

function ResetForm() {
  const [form, setForm] = useState(INITIAL);

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); console.log(form); }}
      onReset={() => setForm(INITIAL)}
    >
      <input
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
      />
      <textarea
        value={form.message}
        onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
      />
      <button type="submit">Send</button>
      <button type="reset">Clear</button>
    </form>
  );
}`,
  },

  // ─── 13. Lists ───────────────────────────────────────────────────────────────
  {
    title: "Key From Id",
    description: "Use stable unique IDs as list keys.",
    code: `type User = { id: string; name: string };

function UserList({ users }: { users: User[] }) {
  return (
    <ul>
      {users.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}`,
  },
  {
    title: "Index Key Pitfall",
    description: "Avoid index keys when list items can reorder.",
    code: `// ❌ Avoid — index keys break reconciliation when items reorder or insert
const bad = items.map((item, i) => <li key={i}>{item}</li>);

// ✅ Prefer stable, unique identifiers
const good = items.map((item) => <li key={item.id}>{item.name}</li>);

// Index key is acceptable ONLY for static, never-reordered lists`,
  },
  {
    title: "Nested Lists",
    description: "Render a hierarchy of lists with unique keys.",
    code: `type Category = { id: string; name: string; items: { id: string; label: string }[] };

function NestedList({ categories }: { categories: Category[] }) {
  return (
    <ul>
      {categories.map((cat) => (
        <li key={cat.id}>
          <strong>{cat.name}</strong>
          <ul>
            {cat.items.map((item) => (
              <li key={item.id}>{item.label}</li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}`,
  },
  {
    title: "Virtualization Note",
    description: "Use a windowing library for very long lists.",
    code: `// For large lists (1000+ items), render only visible rows.
// Popular libraries: react-window, @tanstack/react-virtual

import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

function VirtualList({ items }: { items: string[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
  });

  return (
    <div ref={parentRef} style={{ height: 400, overflow: "auto" }}>
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {virtualizer.getVirtualItems().map((row) => (
          <div
            key={row.key}
            style={{ position: "absolute", top: row.start, width: "100%" }}
          >
            {items[row.index]}
          </div>
        ))}
      </div>
    </div>
  );
}`,
  },

  // ─── 14. Conditional Rendering ───────────────────────────────────────────────
  {
    title: "Ternary Rendering",
    description: "Render one of two elements based on a condition.",
    code: `function Status({ online }: { online: boolean }) {
  return (
    <span style={{ color: online ? "green" : "gray" }}>
      {online ? "Online" : "Offline"}
    </span>
  );
}`,
  },
  {
    title: "Short-circuit &&",
    description: "Render a node only when a condition is truthy.",
    code: `function Notification({ message }: { message?: string }) {
  return (
    <div>
      {/* Guard with !! when value might be 0 to avoid rendering "0" */}
      {!!message && <p className="alert">{message}</p>}
    </div>
  );
}`,
  },
  {
    title: "Switch Rendering",
    description: "Select a component based on a status value.",
    code: `type Status = "idle" | "loading" | "success" | "error";

function StatusView({ status }: { status: Status }) {
  switch (status) {
    case "loading": return <p>Loading…</p>;
    case "success": return <p>Done!</p>;
    case "error":   return <p style={{ color: "red" }}>Failed</p>;
    default:        return null;
  }
}`,
  },
  {
    title: "Early Return",
    description: "Return null early instead of deep nesting.",
    code: `function UserGreeting({ user }: { user: { name: string } | null }) {
  if (!user) return null;

  return <p>Welcome back, {user.name}!</p>;
}`,
  },
  {
    title: "Nullish Rendering",
    description: "Use ?? to render a fallback element.",
    code: `function Avatar({ name }: { name?: string }) {
  return (
    <span>{name ?? "Anonymous"}</span>
  );
}`,
  },

  // ─── 15. Fragments ────────────────────────────────────────────────────────────
  {
    title: "Fragment Shorthand",
    description: "Group elements without adding a DOM node.",
    code: `function TableRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
}`,
  },
  {
    title: "Keyed Fragment",
    description: "Use Fragment with a key prop inside lists.",
    code: `import { Fragment } from "react";

type Pair = { id: string; label: string; value: string };

function DefinitionList({ pairs }: { pairs: Pair[] }) {
  return (
    <dl>
      {pairs.map(({ id, label, value }) => (
        <Fragment key={id}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </Fragment>
      ))}
    </dl>
  );
}`,
  },

  // ─── 16. Portals ─────────────────────────────────────────────────────────────
  {
    title: "createPortal Modal",
    description: "Render a modal outside the component tree.",
    code: `import { createPortal } from "react-dom";
import type { ReactNode } from "react";

function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>,
    document.body,
  );
}`,
  },
  {
    title: "createPortal Tooltip",
    description: "Mount a tooltip in document.body to escape overflow.",
    code: `import { createPortal } from "react-dom";
import { useRef, useState } from "react";

function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [visible, setVisible] = useState(false);

  const show = (e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPos({ top: r.bottom + 4, left: r.left });
    setVisible(true);
  };

  return (
    <>
      <span onMouseEnter={show} onMouseLeave={() => setVisible(false)}>
        {children}
      </span>
      {visible &&
        createPortal(
          <div style={{ position: "fixed", ...pos, background: "#333", color: "#fff", padding: "4px 8px", borderRadius: 4 }}>
            {label}
          </div>,
          document.body,
        )}
    </>
  );
}`,
  },

  // ─── 17. Error Boundaries ────────────────────────────────────────────────────
  {
    title: "Class Error Boundary",
    description: "Catch render errors with a class component.",
    code: `import { Component, type ReactNode } from "react";

type Props = { fallback: ReactNode; children: ReactNode };
type State = { hasError: boolean };

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

export default ErrorBoundary;`,
  },
  {
    title: "react-error-boundary Library",
    description: "Use ErrorBoundary component from the library.",
    code: `import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div role="alert">
      <p>Something went wrong: {error.message}</p>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <SomeComponentThatMightThrow />
    </ErrorBoundary>
  );
}`,
  },

  // ─── 18. Suspense + lazy ─────────────────────────────────────────────────────
  {
    title: "React.lazy Import",
    description: "Lazy-load a component with dynamic import.",
    code: `import { lazy, Suspense } from "react";

const HeavyChart = lazy(() => import("./HeavyChart"));

function Dashboard() {
  return (
    <Suspense fallback={<p>Loading chart…</p>}>
      <HeavyChart />
    </Suspense>
  );
}`,
  },
  {
    title: "Suspense Fallback",
    description: "Show a skeleton while async content loads.",
    code: `import { Suspense } from "react";

function Skeleton() {
  return <div className="skeleton" aria-busy="true" aria-label="Loading" />;
}

function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <AsyncUserProfile />
    </Suspense>
  );
}`,
  },
  {
    title: "Nested Suspense",
    description: "Granular loading states with nested Suspense.",
    code: `import { lazy, Suspense } from "react";

const Sidebar = lazy(() => import("./Sidebar"));
const Feed    = lazy(() => import("./Feed"));

function App() {
  return (
    <Suspense fallback={<p>Loading layout…</p>}>
      <Sidebar />
      <Suspense fallback={<p>Loading feed…</p>}>
        <Feed />
      </Suspense>
    </Suspense>
  );
}`,
  },

  // ─── 19. forwardRef ───────────────────────────────────────────────────────────
  {
    title: "forwardRef Basic",
    description: "Forward a ref from parent to a DOM element.",
    code: `import { forwardRef } from "react";

const FancyInput = forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<"input">
>(function FancyInput(props, ref) {
  return <input ref={ref} className="fancy" {...props} />;
});

export default FancyInput;`,
  },
  {
    title: "forwardRef TypeScript",
    description: "Fully typed forwardRef with custom props.",
    code: `import { forwardRef } from "react";

type InputProps = {
  label: string;
  error?: string;
} & React.ComponentPropsWithoutRef<"input">;

const LabeledInput = forwardRef<HTMLInputElement, InputProps>(
  function LabeledInput({ label, error, ...rest }, ref) {
    return (
      <div>
        <label>{label}</label>
        <input ref={ref} aria-invalid={!!error} {...rest} />
        {error && <span role="alert">{error}</span>}
      </div>
    );
  },
);`,
  },

  // ─── 20. useImperativeHandle ─────────────────────────────────────────────────
  {
    title: "useImperativeHandle",
    description: "Expose a custom imperative API from a component.",
    code: `import { forwardRef, useImperativeHandle, useRef } from "react";

type VideoHandle = { play: () => void; pause: () => void };

const VideoPlayer = forwardRef<VideoHandle>(function VideoPlayer(_, ref) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useImperativeHandle(ref, () => ({
    play:  () => videoRef.current?.play(),
    pause: () => videoRef.current?.pause(),
  }));

  return <video ref={videoRef} src="/demo.mp4" />;
});

function Page() {
  const playerRef = useRef<VideoHandle>(null);
  return (
    <>
      <VideoPlayer ref={playerRef} />
      <button onClick={() => playerRef.current?.play()}>Play</button>
    </>
  );
}`,
  },

  // ─── 21. Performance ─────────────────────────────────────────────────────────
  {
    title: "React.memo",
    description: "Skip re-rendering when props haven't changed.",
    code: `import { memo } from "react";

type ItemProps = { text: string; done: boolean };

const TodoItem = memo(function TodoItem({ text, done }: ItemProps) {
  return <li style={{ textDecoration: done ? "line-through" : "none" }}>{text}</li>;
});`,
  },
  {
    title: "React.memo Comparator",
    description: "Custom equality check for memo.",
    code: `import { memo } from "react";

type Row = { id: number; name: string; score: number };

const LeaderboardRow = memo(
  function LeaderboardRow({ row }: { row: Row }) {
    return <tr><td>{row.name}</td><td>{row.score}</td></tr>;
  },
  (prev, next) => prev.row.id === next.row.id && prev.row.score === next.row.score,
);`,
  },
  {
    title: "useDeferredValue",
    description: "Defer a non-urgent value to keep UI responsive.",
    code: `import { useDeferredValue, useState } from "react";

function SearchPage() {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      {/* Results re-render with deferred value, keeping input snappy */}
      <SearchResults query={deferred} />
    </>
  );
}`,
  },
  {
    title: "useTransition",
    description: "Mark a state update as non-urgent with a pending flag.",
    code: `import { useTransition, useState } from "react";

function TabContainer() {
  const [tab, setTab] = useState("home");
  const [isPending, startTransition] = useTransition();

  const switchTab = (next: string) => {
    startTransition(() => setTab(next));
  };

  return (
    <>
      <button onClick={() => switchTab("settings")} disabled={isPending}>
        {isPending ? "Switching…" : "Settings"}
      </button>
      <TabContent tab={tab} />
    </>
  );
}`,
  },
  {
    title: "startTransition",
    description: "Wrap non-urgent updates outside a component.",
    code: `import { startTransition } from "react";

function handleRouteChange(path: string, setPage: (p: string) => void) {
  // The setPage update won't block urgent interactions
  startTransition(() => {
    setPage(path);
  });
}`,
  },
  {
    title: "useId Hook",
    description: "Generate stable unique IDs for accessibility attributes.",
    code: `import { useId } from "react";

function FormField({ label }: { label: string }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} />
    </div>
  );
}`,
  },

  // ─── 22. TypeScript Patterns ─────────────────────────────────────────────────
  {
    title: "Generic Component",
    description: "Create a type-safe list component with generics.",
    code: `type ListProps<T> = {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
};

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item) => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// Usage:
// <List items={users} keyExtractor={(u) => u.id} renderItem={(u) => u.name} />`,
  },
  {
    title: "Discriminated Union Props",
    description: "Mutually exclusive prop shapes with type narrowing.",
    code: `type AlertProps =
  | { kind: "info";    message: string }
  | { kind: "success"; message: string }
  | { kind: "error";   message: string; code: number };

function Alert(props: AlertProps) {
  if (props.kind === "error") {
    return <div className="error">Error {props.code}: {props.message}</div>;
  }
  return <div className={props.kind}>{props.message}</div>;
}`,
  },
  {
    title: "Polymorphic Component",
    description: "Render as any element via an 'as' prop.",
    code: `import type { ComponentPropsWithoutRef, ElementType } from "react";

type PolymorphicProps<T extends ElementType> = {
  as?: T;
  children?: React.ReactNode;
} & ComponentPropsWithoutRef<T>;

function Box<T extends ElementType = "div">({
  as,
  children,
  ...rest
}: PolymorphicProps<T>) {
  const Tag = as ?? "div";
  return <Tag {...rest}>{children}</Tag>;
}

// <Box as="section" id="main">…</Box>
// <Box as="a" href="/home">…</Box>`,
  },
  {
    title: "Event Types Cheatsheet",
    description: "Quick reference for common React event types.",
    code: `// Common React event types (TypeScript)
type OnClick   = React.MouseEvent<HTMLButtonElement>;
type OnChange  = React.ChangeEvent<HTMLInputElement>;
type OnSubmit  = React.FormEvent<HTMLFormElement>;
type OnKeyDown = React.KeyboardEvent<HTMLInputElement>;
type OnFocus   = React.FocusEvent<HTMLInputElement>;
type OnScroll  = React.UIEvent<HTMLDivElement>;
type OnDrop    = React.DragEvent<HTMLDivElement>;
type OnPaste   = React.ClipboardEvent<HTMLTextAreaElement>;
type OnWheel   = React.WheelEvent<HTMLDivElement>;`,
  },
  {
    title: "Ref Types",
    description: "Typing refs for DOM elements and custom handles.",
    code: `import { useRef } from "react";

// DOM element ref (nullable — may not be attached yet)
const divRef   = useRef<HTMLDivElement>(null);
const inputRef = useRef<HTMLInputElement>(null);
const btnRef   = useRef<HTMLButtonElement>(null);

// Mutable container — does NOT trigger re-renders
const countRef = useRef<number>(0);

// For forwardRef typing:
// React.ForwardedRef<HTMLInputElement>
// React.MutableRefObject<number>`,
  },
  {
    title: "Children Types",
    description: "All ways to type React children.",
    code: `import type {
  ReactNode,       // most permissive: elements, strings, null, arrays, portals
  ReactElement,    // only React elements (JSX), no primitives
  PropsWithChildren, // wraps any Props type, adds children?: ReactNode
  FC,              // FunctionComponent — includes children in React 18, opt-in in 19
} from "react";

// Prefer ReactNode for slot-style children:
type CardProps = { children: ReactNode };

// Use ReactElement when you need to clone/inspect children:
type CloneProps = { child: ReactElement };`,
  },

  // ─── 23. Patterns ────────────────────────────────────────────────────────────
  {
    title: "Compound Component",
    description: "Related components share state via context.",
    code: `import { createContext, useContext, useState, type ReactNode } from "react";

const Ctx = createContext<{ open: boolean; toggle: () => void } | null>(null);
const useAccordion = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("Must be inside Accordion");
  return c;
};

function Accordion({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Ctx.Provider value={{ open, toggle: () => setOpen((o) => !o) }}>
      <div>{children}</div>
    </Ctx.Provider>
  );
}

Accordion.Trigger = function Trigger({ children }: { children: ReactNode }) {
  const { toggle } = useAccordion();
  return <button onClick={toggle}>{children}</button>;
};

Accordion.Panel = function Panel({ children }: { children: ReactNode }) {
  const { open } = useAccordion();
  return open ? <div>{children}</div> : null;
};

// Usage: <Accordion><Accordion.Trigger>…</Accordion.Trigger><Accordion.Panel>…</Accordion.Panel></Accordion>`,
  },
  {
    title: "Render Prop",
    description: "Pass a render function as a prop for flexibility.",
    code: `import { useState } from "react";

type MousePosition = { x: number; y: number };

function MouseTracker({
  render,
}: {
  render: (pos: MousePosition) => React.ReactNode;
}) {
  const [pos, setPos] = useState<MousePosition>({ x: 0, y: 0 });
  return (
    <div
      style={{ width: "100%", height: 300 }}
      onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
    >
      {render(pos)}
    </div>
  );
}

// <MouseTracker render={({ x, y }) => <p>{x}, {y}</p>} />`,
  },
  {
    title: "Higher-Order Component",
    description: "Wrap a component to inject additional props.",
    code: `import type { ComponentType } from "react";

type WithLoadingProps = { loading: boolean };

function withLoading<P extends object>(
  WrappedComponent: ComponentType<P>,
) {
  return function WithLoadingWrapper({
    loading,
    ...props
  }: P & WithLoadingProps) {
    if (loading) return <p>Loading…</p>;
    return <WrappedComponent {...(props as P)} />;
  };
}

// const LoadingButton = withLoading(Button);
// <LoadingButton loading={isPending} label="Save" />`,
  },
  {
    title: "Slot With Children",
    description: "Named slots via named props for flexible layouts.",
    code: `import type { ReactNode } from "react";

type PageProps = {
  header: ReactNode;
  sidebar?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

function Page({ header, sidebar, children, footer }: PageProps) {
  return (
    <div className="page">
      <header className="page-header">{header}</header>
      <div className="page-body">
        {sidebar && <aside>{sidebar}</aside>}
        <main>{children}</main>
      </div>
      {footer && <footer>{footer}</footer>}
    </div>
  );
}`,
  },
  {
    title: "Provider Consumer Pattern",
    description: "Encapsulate context provider with typed consumer hook.",
    code: `import { createContext, useContext, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<[Theme, () => void] | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  return (
    <ThemeContext.Provider value={[theme, toggle]}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
}`,
  },

  // ─── 24. Accessibility ────────────────────────────────────────────────────────
  {
    title: "aria-label Usage",
    description: "Label icon buttons for screen readers.",
    code: `function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      aria-label="Close dialog"
      onClick={onClose}
      type="button"
    >
      {/* Icon — no visible text */}
      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
        <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" />
      </svg>
    </button>
  );
}`,
  },
  {
    title: "aria-describedby",
    description: "Associate an input with its helper text.",
    code: `import { useId } from "react";

function PasswordField() {
  const hintId = useId();
  return (
    <div>
      <label htmlFor="pwd">Password</label>
      <input
        id="pwd"
        type="password"
        aria-describedby={hintId}
        autoComplete="new-password"
      />
      <p id={hintId}>Must be at least 8 characters.</p>
    </div>
  );
}`,
  },
  {
    title: "Role Attribute",
    description: "Use role to convey element semantics to assistive tech.",
    code: `function Tabs() {
  return (
    <div role="tablist" aria-label="Content sections">
      <button role="tab" aria-selected={true}  aria-controls="panel-1">Overview</button>
      <button role="tab" aria-selected={false} aria-controls="panel-2">Details</button>
      <div id="panel-1" role="tabpanel">Overview content</div>
      <div id="panel-2" role="tabpanel" hidden>Details content</div>
    </div>
  );
}`,
  },
  {
    title: "tabIndex Usage",
    description: "Make non-interactive elements focusable.",
    code: `function FocusableCard({ onClick }: { onClick: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
      style={{ cursor: "pointer" }}
    >
      Press Enter or Space to activate
    </div>
  );
}`,
  },
  {
    title: "Keyboard Navigation",
    description: "Handle arrow keys in a custom listbox.",
    code: `import { useRef, useState } from "react";

function Listbox({ options }: { options: string[] }) {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") setActive((a) => Math.min(a + 1, options.length - 1));
    if (e.key === "ArrowUp")   setActive((a) => Math.max(a - 1, 0));
  };

  return (
    <ul role="listbox" ref={listRef} tabIndex={0} onKeyDown={handleKeyDown}>
      {options.map((opt, i) => (
        <li
          key={opt}
          role="option"
          aria-selected={i === active}
          onClick={() => setActive(i)}
        >
          {opt}
        </li>
      ))}
    </ul>
  );
}`,
  },
  {
    title: "ARIA Live Regions",
    description: "Announce dynamic updates to screen readers.",
    code: `import { useState } from "react";

function SaveStatus() {
  const [status, setStatus] = useState("");

  const save = async () => {
    setStatus("Saving…");
    await new Promise((r) => setTimeout(r, 1000));
    setStatus("Saved successfully!");
  };

  return (
    <>
      <button onClick={save}>Save</button>
      {/* aria-live="polite" announces after current speech finishes */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {status}
      </div>
    </>
  );
}`,
  },

  // ─── 25. Miscellaneous ────────────────────────────────────────────────────────
  {
    title: "StrictMode",
    description: "Enable extra development checks across the tree.",
    code: `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
// StrictMode double-invokes effects and renders in dev to expose side effects.`,
  },
  {
    title: "Key Reset Trick",
    description: "Force-remount a component by changing its key.",
    code: `import { useState } from "react";

function App() {
  const [key, setKey] = useState(0);

  return (
    <>
      {/* Changing key completely remounts <Form />, resetting all state */}
      <Form key={key} />
      <button onClick={() => setKey((k) => k + 1)}>Reset form</button>
    </>
  );
}`,
  },
  {
    title: "cloneElement",
    description: "Clone a React element with extra props injected.",
    code: `import { cloneElement, type ReactElement } from "react";

function RadioGroup({
  name,
  children,
}: {
  name: string;
  children: ReactElement[];
}) {
  return (
    <div role="radiogroup">
      {children.map((child, i) =>
        cloneElement(child, { key: i, name }),
      )}
    </div>
  );
}`,
  },
  {
    title: "Children.map",
    description: "Iterate and transform component children safely.",
    code: `import { Children, cloneElement, isValidElement } from "react";
import type { ReactNode } from "react";

function SpacedList({ children }: { children: ReactNode }) {
  return (
    <ul>
      {Children.map(children, (child, i) => {
        if (!isValidElement(child)) return null;
        return (
          <li key={i} style={{ marginBottom: 8 }}>
            {child}
          </li>
        );
      })}
    </ul>
  );
}`,
  },
  {
    title: "isValidElement",
    description: "Type-guard to check if a value is a React element.",
    code: `import { isValidElement } from "react";
import type { ReactNode } from "react";

function Wrapper({ children }: { children: ReactNode }) {
  if (!isValidElement(children)) {
    return <p>{String(children)}</p>;
  }
  // children is ReactElement here — safe to clone
  return <div className="wrapped">{children}</div>;
}`,
  },
  {
    title: "displayName",
    description: "Set displayName for better DevTools component names.",
    code: `import { forwardRef, memo } from "react";

const Input = memo(
  forwardRef<HTMLInputElement, React.ComponentPropsWithoutRef<"input">>(
    function Input(props, ref) {
      return <input ref={ref} {...props} />;
    },
  ),
);

// Explicit displayName for HOC-wrapped components
Input.displayName = "Input";`,
  },
  {
    title: "defaultProps Alternative",
    description: "Use destructuring defaults instead of defaultProps.",
    code: `// defaultProps is deprecated in React 19 for function components.
// Use destructuring defaults instead:

type ButtonProps = {
  label?: string;
  variant?: "primary" | "ghost";
  size?: "sm" | "md" | "lg";
};

function Button({
  label = "Click me",
  variant = "primary",
  size = "md",
}: ButtonProps) {
  return (
    <button className={\`btn btn--\${variant} btn--\${size}\`}>
      {label}
    </button>
  );
}`,
  },
];
