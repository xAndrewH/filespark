import type { Entry } from "../types";

export const tailwindEntries: Entry[] = [
  // ─── 1. Flexbox ───────────────────────────────────────────────────────────
  {
    title: "Flex center both",
    description: "Center children horizontally and vertically",
    code: `<div class="flex items-center justify-center min-h-screen">
  <p>Perfectly centered</p>
</div>`,
  },
  {
    title: "Flex column stack",
    description: "Stack children vertically with gap",
    code: `<div class="flex flex-col gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>`,
  },
  {
    title: "Flex space-between",
    description: "Push items to opposite ends",
    code: `<header class="flex items-center justify-between px-6 py-4">
  <span class="font-bold">Logo</span>
  <nav class="flex gap-4">
    <a href="#">Home</a>
    <a href="#">About</a>
  </nav>
</header>`,
  },
  {
    title: "Flex wrap cards",
    description: "Wrapping flex row for cards",
    code: `<div class="flex flex-wrap gap-4">
  <div class="flex-1 min-w-[200px] p-4 border rounded-xl">Card A</div>
  <div class="flex-1 min-w-[200px] p-4 border rounded-xl">Card B</div>
  <div class="flex-1 min-w-[200px] p-4 border rounded-xl">Card C</div>
</div>`,
  },
  {
    title: "Flex-1 fill space",
    description: "Child grows to fill remaining space",
    code: `<div class="flex gap-2 h-16">
  <div class="w-32 bg-slate-700 rounded">Sidebar</div>
  <div class="flex-1 bg-slate-800 rounded">Main fills rest</div>
</div>`,
  },
  {
    title: "Grow / shrink / basis",
    description: "Explicit flex grow, shrink, basis values",
    code: `<div class="flex gap-2">
  <!-- never shrink below 200px, grows to fill -->
  <div class="grow shrink-0 basis-[200px] bg-slate-700 p-3 rounded">A</div>
  <!-- fixed width, no grow -->
  <div class="grow-0 shrink basis-48 bg-slate-800 p-3 rounded">B</div>
</div>`,
  },
  {
    title: "Align items variants",
    description: "All items-* alignment options",
    code: `<!-- items-start | items-center | items-end | items-stretch | items-baseline -->
<div class="flex items-start gap-2 h-24">
  <div class="bg-blue-500 p-2">Start</div>
</div>
<div class="flex items-center gap-2 h-24">
  <div class="bg-green-500 p-2">Center</div>
</div>
<div class="flex items-end gap-2 h-24">
  <div class="bg-red-500 p-2">End</div>
</div>`,
  },
  {
    title: "Justify content variants",
    description: "All justify-* distribution options",
    code: `<!-- justify-start | justify-center | justify-end | justify-between | justify-around | justify-evenly -->
<div class="flex justify-between border p-4">
  <span>Left</span>
  <span>Center</span>
  <span>Right</span>
</div>`,
  },
  {
    title: "Flex row reverse",
    description: "Reverse the flex direction",
    code: `<div class="flex flex-row-reverse gap-3">
  <div class="bg-slate-700 p-2 rounded">Last visually</div>
  <div class="bg-slate-600 p-2 rounded">First visually</div>
</div>`,
  },
  {
    title: "Gap responsive",
    description: "Responsive gap between flex children",
    code: `<div class="flex flex-wrap gap-2 md:gap-4 lg:gap-6">
  <div class="p-4 bg-slate-700 rounded">A</div>
  <div class="p-4 bg-slate-700 rounded">B</div>
  <div class="p-4 bg-slate-700 rounded">C</div>
</div>`,
  },

  // ─── 2. Grid ──────────────────────────────────────────────────────────────
  {
    title: "Responsive grid cols",
    description: "Auto-stacking grid across breakpoints",
    code: `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  <div class="bg-slate-800 rounded-xl p-4">Card</div>
  <div class="bg-slate-800 rounded-xl p-4">Card</div>
  <div class="bg-slate-800 rounded-xl p-4">Card</div>
  <div class="bg-slate-800 rounded-xl p-4">Card</div>
</div>`,
  },
  {
    title: "Col span feature",
    description: "An item spanning multiple columns",
    code: `<div class="grid grid-cols-3 gap-4">
  <div class="col-span-2 bg-blue-700 p-4 rounded">Wide item (2 cols)</div>
  <div class="bg-slate-700 p-4 rounded">Normal</div>
  <div class="bg-slate-700 p-4 rounded">Normal</div>
  <div class="col-span-2 bg-slate-700 p-4 rounded">Wide again</div>
</div>`,
  },
  {
    title: "Grid rows explicit",
    description: "Set explicit row counts and sizes",
    code: `<div class="grid grid-rows-3 grid-flow-col gap-4 h-48">
  <div class="bg-slate-700 p-2 rounded row-span-2">Tall</div>
  <div class="bg-slate-600 p-2 rounded">A</div>
  <div class="bg-slate-600 p-2 rounded">B</div>
  <div class="bg-slate-600 p-2 rounded">C</div>
</div>`,
  },
  {
    title: "Place items center",
    description: "Center grid items on both axes",
    code: `<div class="grid grid-cols-3 place-items-center gap-4 h-32">
  <div class="bg-slate-700 p-3 rounded">A</div>
  <div class="bg-slate-700 p-3 rounded">B</div>
  <div class="bg-slate-700 p-3 rounded">C</div>
</div>`,
  },
  {
    title: "Auto columns min",
    description: "Auto-fit columns with min width",
    code: `<div class="grid auto-cols-fr grid-flow-col gap-4">
  <div class="bg-slate-700 p-4 rounded">Col 1</div>
  <div class="bg-slate-700 p-4 rounded">Col 2</div>
  <div class="bg-slate-700 p-4 rounded">Col 3</div>
</div>`,
  },
  {
    title: "Subgrid layout",
    description: "Nested grid inherits parent tracks",
    code: `<div class="grid grid-cols-4 gap-4">
  <div class="col-span-4 grid grid-cols-subgrid gap-4">
    <div class="bg-slate-700 p-4 rounded">A</div>
    <div class="bg-slate-700 p-4 rounded">B</div>
    <div class="bg-slate-700 p-4 rounded">C</div>
    <div class="bg-slate-700 p-4 rounded">D</div>
  </div>
</div>`,
  },
  {
    title: "Row span sidebar",
    description: "Sidebar spanning multiple rows",
    code: `<div class="grid grid-cols-[240px_1fr] grid-rows-[auto_1fr] gap-4 h-screen">
  <header class="col-span-2 bg-slate-800 p-4">Header</header>
  <aside class="row-span-1 bg-slate-900 p-4">Sidebar</aside>
  <main class="bg-slate-950 p-4">Main content</main>
</div>`,
  },
  {
    title: "Grid dense packing",
    description: "Fill gaps with dense auto-placement",
    code: `<div class="grid grid-cols-4 grid-flow-row-dense gap-3">
  <div class="col-span-2 bg-blue-700 p-4 rounded">Wide</div>
  <div class="bg-slate-700 p-4 rounded">A</div>
  <div class="bg-slate-700 p-4 rounded">B</div>
  <div class="col-span-3 bg-purple-700 p-4 rounded">Very wide</div>
  <div class="bg-slate-700 p-4 rounded">C (fills gap)</div>
</div>`,
  },

  // ─── 3. Typography ────────────────────────────────────────────────────────
  {
    title: "Responsive heading",
    description: "Text size scales across breakpoints",
    code: `<h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
  Big Headline
</h1>`,
  },
  {
    title: "Font weight scale",
    description: "All font-weight utility classes",
    code: `<p class="font-thin">100 Thin</p>
<p class="font-extralight">200 Extra Light</p>
<p class="font-light">300 Light</p>
<p class="font-normal">400 Normal</p>
<p class="font-medium">500 Medium</p>
<p class="font-semibold">600 Semibold</p>
<p class="font-bold">700 Bold</p>
<p class="font-extrabold">800 Extra Bold</p>
<p class="font-black">900 Black</p>`,
  },
  {
    title: "Line height leading",
    description: "Control line-height with leading-*",
    code: `<p class="leading-none">Tight: no extra space</p>
<p class="leading-tight">Tight paragraph text</p>
<p class="leading-snug">Snug body copy</p>
<p class="leading-normal">Normal default leading</p>
<p class="leading-relaxed">Relaxed, comfortable reading</p>
<p class="leading-loose">Very open, airy lines</p>`,
  },
  {
    title: "Letter spacing",
    description: "Tracking utilities for letter-spacing",
    code: `<p class="tracking-tighter">Tighter (-0.05em)</p>
<p class="tracking-tight">Tight (-0.025em)</p>
<p class="tracking-normal">Normal (0)</p>
<p class="tracking-wide">Wide (0.025em)</p>
<p class="tracking-wider">Wider (0.05em)</p>
<p class="tracking-widest">Widest (0.1em)</p>`,
  },
  {
    title: "Text transform",
    description: "uppercase, lowercase, capitalize classes",
    code: `<p class="uppercase text-xs tracking-widest text-slate-400">Label style</p>
<p class="capitalize">every word is capitalized</p>
<p class="lowercase">THIS BECOMES LOWERCASE</p>
<p class="normal-case">Normal casing preserved</p>`,
  },
  {
    title: "Font family",
    description: "Swap between sans, serif, and mono",
    code: `<p class="font-sans">Default sans-serif (Inter, system-ui, …)</p>
<p class="font-serif">Serif for editorial content</p>
<code class="font-mono text-sm">font-mono for code</code>`,
  },
  {
    title: "Text decoration",
    description: "Underline, line-through, and styles",
    code: `<a class="underline decoration-2 decoration-blue-500 underline-offset-4 hover:decoration-blue-300">
  Styled link underline
</a>
<p class="line-through text-slate-400">Deleted text</p>
<p class="no-underline">Remove underline from a link</p>`,
  },
  {
    title: "Truncate & line-clamp",
    description: "Overflow text with ellipsis",
    code: `<!-- Single line truncation -->
<p class="truncate max-w-xs">Very long text that will be cut off with ellipsis</p>

<!-- Multiline clamp (requires @tailwindcss/line-clamp or v3.3+) -->
<p class="line-clamp-3 max-w-sm">
  This paragraph will show exactly three lines of text and then fade
  off with an ellipsis no matter how long the content actually is.
</p>`,
  },
  {
    title: "Prose typography",
    description: "Rich text styles with @tailwindcss/typography",
    code: `<!-- Requires @tailwindcss/typography plugin -->
<article class="prose prose-slate dark:prose-invert lg:prose-xl max-w-none">
  <h1>Article title</h1>
  <p>Automatically styled paragraph with good vertical rhythm.</p>
  <pre><code>// code block</code></pre>
</article>`,
  },

  // ─── 4. Colors & Backgrounds ──────────────────────────────────────────────
  {
    title: "Text color scale",
    description: "Named color shades on text",
    code: `<p class="text-blue-400">400 — soft</p>
<p class="text-blue-500">500 — medium</p>
<p class="text-blue-600">600 — saturated</p>
<p class="text-blue-700">700 — dark</p>
<!-- Also: slate, gray, zinc, red, orange, yellow, green, teal, purple, pink, rose -->`,
  },
  {
    title: "Background gradient",
    description: "Linear gradient with from/via/to",
    code: `<!-- Horizontal gradient -->
<div class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8 text-white rounded-2xl">
  Gradient card
</div>

<!-- Diagonal -->
<div class="bg-gradient-to-br from-cyan-400 to-blue-600 p-8 rounded-2xl"></div>`,
  },
  {
    title: "Background image",
    description: "bg-image with size and position",
    code: `<div
  class="bg-cover bg-center bg-no-repeat min-h-[300px] rounded-2xl"
  style="background-image: url('/hero.jpg')"
>
  <div class="bg-black/50 min-h-[300px] rounded-2xl p-8 text-white">
    Overlay text
  </div>
</div>`,
  },
  {
    title: "Opacity modifier",
    description: "Color opacity with slash syntax",
    code: `<div class="bg-blue-500/20 text-blue-300 border border-blue-500/30 p-4 rounded-xl">
  20% opacity background
</div>
<div class="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
  Frosted glass effect
</div>`,
  },
  {
    title: "Background size & pos",
    description: "Control bg-size and bg-position",
    code: `<div class="bg-contain bg-center bg-no-repeat h-48 border rounded-xl"
  style="background-image: url('/logo.svg')">
</div>
<!-- bg-auto | bg-cover | bg-contain -->
<!-- bg-center | bg-top | bg-bottom | bg-left | bg-right -->`,
  },
  {
    title: "Text gradient",
    description: "Gradient applied to text via clip",
    code: `<h2 class="text-4xl font-black bg-gradient-to-r from-cyan-400 to-purple-500
  bg-clip-text text-transparent">
  Gradient Text
</h2>`,
  },

  // ─── 5. Spacing ───────────────────────────────────────────────────────────
  {
    title: "Padding all variants",
    description: "Padding on individual and combined sides",
    code: `<div class="p-4">All sides</div>
<div class="px-6 py-3">Horizontal / vertical</div>
<div class="pt-8 pb-4 pl-6 pr-2">Individual sides</div>
<div class="ps-4 pe-4">Logical start/end</div>`,
  },
  {
    title: "Margin all variants",
    description: "Margin with negative and auto values",
    code: `<div class="mx-auto max-w-xl">Centered with auto margins</div>
<div class="mt-8 mb-4">Top and bottom margin</div>
<div class="-mt-4">Negative margin (pull up 1rem)</div>
<div class="ml-auto">Push right with auto left margin</div>`,
  },
  {
    title: "Space-x / space-y",
    description: "Add spacing between flex/grid children",
    code: `<!-- Horizontal spacing between children -->
<div class="flex space-x-4">
  <button>One</button>
  <button>Two</button>
  <button>Three</button>
</div>

<!-- Vertical spacing between children -->
<div class="flex flex-col space-y-3">
  <div>Row A</div>
  <div>Row B</div>
</div>`,
  },
  {
    title: "Divide utilities",
    description: "Borders between flex/grid children",
    code: `<!-- Horizontal dividers in a stack -->
<div class="divide-y divide-slate-700">
  <div class="py-3">Item A</div>
  <div class="py-3">Item B</div>
  <div class="py-3">Item C</div>
</div>

<!-- Vertical dividers in a row -->
<div class="flex divide-x divide-slate-600">
  <span class="px-4">Tab 1</span>
  <span class="px-4">Tab 2</span>
</div>`,
  },

  // ─── 6. Sizing ────────────────────────────────────────────────────────────
  {
    title: "Width variants",
    description: "Fixed, fraction, screen, and fit widths",
    code: `<div class="w-full">100% of parent</div>
<div class="w-1/2">50% of parent</div>
<div class="w-screen">100vw</div>
<div class="w-fit">Shrinks to content</div>
<div class="w-48">12rem / 192px fixed</div>
<div class="w-[420px]">Arbitrary 420px</div>`,
  },
  {
    title: "Height variants",
    description: "Fixed, screen, dvh, and min/max heights",
    code: `<div class="h-screen">100vh</div>
<div class="h-dvh">100dvh (accounts for mobile bar)</div>
<div class="h-full">100% of parent height</div>
<div class="h-64">16rem fixed height</div>
<div class="min-h-0">Remove default min-height</div>
<div class="max-h-96 overflow-y-auto">Scrollable capped height</div>`,
  },
  {
    title: "Min / max width",
    description: "Constrain element width range",
    code: `<div class="min-w-0 truncate">Prevents flex blowout + truncates</div>
<div class="max-w-prose mx-auto">Readable line length (~65ch)</div>
<div class="max-w-screen-lg mx-auto px-4">Constrained to lg breakpoint</div>`,
  },
  {
    title: "Size shorthand",
    description: "Set width and height simultaneously",
    code: `<!-- size-* sets both w and h at once (Tailwind v3.3+) -->
<div class="size-10 rounded-full bg-blue-500"></div>
<div class="size-16 rounded-xl bg-purple-500"></div>
<div class="size-[72px] bg-green-500 rounded-full"></div>`,
  },

  // ─── 7. Borders ───────────────────────────────────────────────────────────
  {
    title: "Border width & color",
    description: "Width, color, and style utilities",
    code: `<div class="border border-slate-700 rounded-xl p-4">Default 1px border</div>
<div class="border-2 border-blue-500 rounded-xl p-4">2px blue border</div>
<div class="border-4 border-dashed border-slate-500 rounded-xl p-4">Dashed border</div>
<div class="border-0">Remove all borders</div>`,
  },
  {
    title: "Border radius",
    description: "Rounded corners from none to full",
    code: `<div class="rounded-none">No rounding</div>
<div class="rounded">4px default</div>
<div class="rounded-md">6px medium</div>
<div class="rounded-lg">8px large</div>
<div class="rounded-xl">12px extra large</div>
<div class="rounded-2xl">16px</div>
<div class="rounded-3xl">24px</div>
<div class="rounded-full">Perfect pill / circle</div>
<!-- Also per-side: rounded-t-xl rounded-bl-2xl -->`,
  },
  {
    title: "Outline & ring",
    description: "Focus rings without layout shift",
    code: `<button class="
  px-4 py-2 bg-blue-600 text-white rounded-lg
  outline-none
  focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
">
  Accessible focus ring
</button>`,
  },
  {
    title: "Ring utilities",
    description: "Box-shadow based ring system",
    code: `<!-- Colored, sized rings -->
<div class="ring-1 ring-slate-700">Subtle 1px ring</div>
<div class="ring-2 ring-blue-500">2px blue ring</div>
<div class="ring-4 ring-purple-500/50">4px semi-transparent ring</div>
<div class="ring ring-inset ring-white/10">Inset ring</div>`,
  },
  {
    title: "Border per side",
    description: "Apply border to individual sides",
    code: `<div class="border-b border-slate-700 pb-4 mb-4">Bottom divider only</div>
<div class="border-l-4 border-blue-500 pl-4">Left accent bar</div>
<div class="border-t border-r border-slate-200">Top + right</div>`,
  },

  // ─── 8. Shadows & Effects ─────────────────────────────────────────────────
  {
    title: "Box shadow scale",
    description: "Elevation with shadow utilities",
    code: `<div class="shadow-sm p-4 rounded-xl">Small shadow</div>
<div class="shadow p-4 rounded-xl">Default shadow</div>
<div class="shadow-md p-4 rounded-xl">Medium shadow</div>
<div class="shadow-lg p-4 rounded-xl">Large shadow</div>
<div class="shadow-xl p-4 rounded-xl">Extra large</div>
<div class="shadow-2xl p-4 rounded-xl">Dramatic shadow</div>
<div class="shadow-none">Remove shadow</div>`,
  },
  {
    title: "Colored shadow",
    description: "Tinted box shadows with color modifier",
    code: `<button class="shadow-lg shadow-blue-500/40 bg-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-blue-500/60 transition-shadow">
  Colored glow button
</button>`,
  },
  {
    title: "Drop shadow filter",
    description: "CSS filter drop-shadow (respects transparency)",
    code: `<img
  src="/logo.png"
  alt="Logo"
  class="drop-shadow-lg"
/>
<!-- drop-shadow-sm | drop-shadow | drop-shadow-md | drop-shadow-lg | drop-shadow-xl | drop-shadow-2xl -->`,
  },
  {
    title: "Backdrop blur glass",
    description: "Frosted glass with backdrop-blur",
    code: `<div class="relative h-64 bg-cover bg-center rounded-2xl overflow-hidden"
  style="background-image: url('/bg.jpg')">
  <div class="absolute inset-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
    <p class="text-white font-semibold">Glassmorphism card</p>
  </div>
</div>`,
  },
  {
    title: "Filter utilities",
    description: "Blur, brightness, contrast, grayscale",
    code: `<img class="blur-sm" src="/img.jpg" alt="" />
<img class="blur-none hover:blur-none blur-sm transition-[filter]" src="/img.jpg" alt="" />
<img class="grayscale hover:grayscale-0 transition-[filter] duration-500" src="/img.jpg" alt="" />
<img class="brightness-75 hover:brightness-100 transition-[filter]" src="/img.jpg" alt="" />
<img class="contrast-125" src="/img.jpg" alt="" />`,
  },

  // ─── 9. Positioning ───────────────────────────────────────────────────────
  {
    title: "Absolute positioning",
    description: "Position elements relative to parent",
    code: `<div class="relative w-48 h-48 bg-slate-700 rounded-xl">
  <span class="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
    New
  </span>
  <img class="absolute inset-0 w-full h-full object-cover rounded-xl" src="/img.jpg" alt="" />
</div>`,
  },
  {
    title: "Fixed header",
    description: "Sticky header with fixed positioning",
    code: `<header class="fixed top-0 inset-x-0 z-50 bg-slate-900/80 backdrop-blur border-b border-slate-800">
  <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
    <span class="font-bold">Brand</span>
    <nav>Nav</nav>
  </div>
</header>
<!-- Push content below header -->
<main class="pt-16">...</main>`,
  },
  {
    title: "Sticky sidebar",
    description: "Sidebar sticks while scrolling",
    code: `<div class="flex gap-8">
  <aside class="w-64 shrink-0">
    <div class="sticky top-20 space-y-2">
      <a href="#section-1">Section 1</a>
      <a href="#section-2">Section 2</a>
    </div>
  </aside>
  <main class="flex-1 min-w-0">Long scrollable content…</main>
</div>`,
  },
  {
    title: "Inset shorthand",
    description: "Set top/right/bottom/left at once",
    code: `<div class="absolute inset-0">Fills entire parent</div>
<div class="absolute inset-x-0 bottom-0">Full-width at bottom</div>
<div class="absolute inset-y-0 right-0 w-64">Full-height on right</div>`,
  },
  {
    title: "Z-index stacking",
    description: "Control stacking order with z-*",
    code: `<div class="relative z-0">Base layer</div>
<div class="relative z-10">Above base</div>
<div class="fixed z-50">Modal overlay</div>
<div class="fixed z-[100]">Even higher (arbitrary)</div>
<!-- z-0 z-10 z-20 z-30 z-40 z-50 z-auto -->`,
  },

  // ─── 10. Transforms & Transitions ─────────────────────────────────────────
  {
    title: "Hover scale button",
    description: "Scale up on hover with transition",
    code: `<button class="
  transition-transform duration-200 ease-out
  hover:scale-105 active:scale-95
  bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold
">
  Press me
</button>`,
  },
  {
    title: "Rotate on hover",
    description: "Rotate an icon or element",
    code: `<div class="group flex items-center gap-2 cursor-pointer">
  <svg class="w-5 h-5 transition-transform duration-300 group-hover:rotate-90"
    fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path d="M12 4v16M4 12h16" stroke-width="2"/>
  </svg>
  Add item
</div>`,
  },
  {
    title: "Translate slide-in",
    description: "Slide element from off-screen",
    code: `<!-- Slide up from below (combine with JS-toggled class) -->
<div class="transition-transform duration-300 ease-out translate-y-4 opacity-0
  data-[open]:translate-y-0 data-[open]:opacity-100">
  Sliding panel
</div>

<!-- Or using group -->
<div class="group relative overflow-hidden rounded-xl">
  <img src="/img.jpg" alt="" class="w-full" />
  <div class="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-black/70 p-4 text-white">
    Revealed on hover
  </div>
</div>`,
  },
  {
    title: "Transition all properties",
    description: "Smooth multi-property transitions",
    code: `<div class="
  transition-all duration-300 ease-in-out
  bg-slate-800 hover:bg-blue-600
  text-slate-300 hover:text-white
  px-4 py-2 rounded-lg
  hover:shadow-lg hover:shadow-blue-500/30
  hover:-translate-y-0.5
">
  Multi-property transition
</div>`,
  },
  {
    title: "Animate spin / pulse / bounce",
    description: "Built-in keyframe animations",
    code: `<!-- Loading spinner -->
<div class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>

<!-- Pulsing skeleton -->
<div class="animate-pulse bg-slate-700 h-4 rounded w-3/4"></div>

<!-- Bouncing indicator -->
<div class="animate-bounce w-3 h-3 bg-blue-500 rounded-full"></div>

<!-- Ping ripple effect -->
<span class="relative inline-flex">
  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
  <span class="relative inline-flex w-3 h-3 bg-green-500 rounded-full"></span>
</span>`,
  },
  {
    title: "Skew transform",
    description: "Skew for italic-style decorative elements",
    code: `<div class="skew-x-3 bg-blue-600 text-white px-8 py-2 inline-block">
  Skewed label
</div>
<!-- skew-x-1 skew-x-2 skew-x-3 skew-x-6 skew-x-12 (and negative: -skew-x-*) -->`,
  },

  // ─── 11. Responsive Design ────────────────────────────────────────────────
  {
    title: "Breakpoint prefixes",
    description: "Mobile-first responsive breakpoints",
    code: `<!-- sm: ≥640px | md: ≥768px | lg: ≥1024px | xl: ≥1280px | 2xl: ≥1536px -->
<div class="
  text-sm           // mobile
  md:text-base      // tablet
  lg:text-lg        // desktop
  px-4 md:px-8 lg:px-16
  flex-col md:flex-row
  flex
">
  Responsive element
</div>`,
  },
  {
    title: "Container center",
    description: "Centered responsive max-width container",
    code: `<!-- tailwind.config.ts — enable container centering -->
// theme: { container: { center: true, padding: '1rem' } }

<div class="container mx-auto px-4">
  Centered content at each breakpoint
</div>`,
  },
  {
    title: "Container queries",
    description: "Style based on parent container size",
    code: `<!-- Requires @tailwindcss/container-queries plugin -->
<div class="@container rounded-xl bg-slate-800 p-4">
  <div class="flex flex-col @md:flex-row gap-4">
    <img class="@md:w-48 w-full rounded-lg object-cover" src="/img.jpg" alt="" />
    <div class="flex-1">
      <h3 class="text-lg @md:text-xl font-bold">Card title</h3>
      <p class="text-slate-400 @md:mt-2">Description text</p>
    </div>
  </div>
</div>`,
  },
  {
    title: "Hide / show responsive",
    description: "Show or hide elements per breakpoint",
    code: `<!-- Hidden on mobile, visible from md up -->
<div class="hidden md:block">Desktop only</div>

<!-- Visible on mobile, hidden from md up -->
<div class="block md:hidden">Mobile only</div>

<!-- Show only on lg -->
<div class="hidden lg:block xl:hidden">Large only</div>`,
  },

  // ─── 12. Dark Mode ────────────────────────────────────────────────────────
  {
    title: "Dark mode basics",
    description: "dark: prefix for dark theme styles",
    code: `<div class="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen">
  <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Title</h1>
  <p class="text-slate-600 dark:text-slate-400">Body copy</p>
  <div class="border border-slate-200 dark:border-slate-700 rounded-xl p-4">Card</div>
</div>`,
  },
  {
    title: "Dark mode button",
    description: "Button styled for both modes",
    code: `<button class="
  bg-slate-900 hover:bg-slate-800
  dark:bg-white dark:hover:bg-slate-100
  text-white dark:text-slate-900
  border border-slate-700 dark:border-slate-300
  px-4 py-2 rounded-lg font-medium transition-colors
">
  Theme-aware button
</button>`,
  },
  {
    title: "Dark config selector",
    description: "Enable dark mode via class in config",
    code: `// tailwind.config.ts
export default {
  darkMode: 'class', // toggle with class="dark" on <html>
  // or 'media' for system preference only
  // or ['class', '[data-theme="dark"]'] for custom selector
};`,
  },

  // ─── 13. Pseudo-class Variants ────────────────────────────────────────────
  {
    title: "Hover & focus states",
    description: "Interactive state variants",
    code: `<input
  class="
    border border-slate-300 rounded-lg px-3 py-2
    hover:border-slate-400
    focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
    focus:outline-none
    transition-colors
  "
  placeholder="Email"
/>`,
  },
  {
    title: "Disabled state",
    description: "Style disabled form elements",
    code: `<button class="
  bg-blue-600 text-white px-4 py-2 rounded-lg
  disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
  hover:bg-blue-500 transition-colors
" disabled>
  Disabled
</button>`,
  },
  {
    title: "First / last child",
    description: "Style first and last list items",
    code: `<ul class="divide-y divide-slate-700">
  <li class="py-3 first:pt-0 last:pb-0 first:border-t-0">Item A</li>
  <li class="py-3 first:pt-0 last:pb-0">Item B</li>
  <li class="py-3 first:pt-0 last:pb-0">Item C</li>
</ul>`,
  },
  {
    title: "Odd / even rows",
    description: "Stripe table rows with even/odd",
    code: `<table class="w-full">
  <tbody>
    <tr class="odd:bg-slate-800 even:bg-slate-900">
      <td class="px-4 py-2">Row 1</td>
    </tr>
    <tr class="odd:bg-slate-800 even:bg-slate-900">
      <td class="px-4 py-2">Row 2</td>
    </tr>
  </tbody>
</table>`,
  },
  {
    title: "Placeholder styling",
    description: "Style input placeholder text",
    code: `<input
  class="
    bg-slate-800 text-white rounded-lg px-4 py-2
    placeholder:text-slate-500 placeholder:italic
    focus:outline-none focus:ring-2 focus:ring-blue-500
  "
  placeholder="Search…"
/>`,
  },
  {
    title: "Focus-within parent",
    description: "Style parent when child has focus",
    code: `<label class="
  flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-700
  focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20
  transition-colors
">
  <svg class="w-4 h-4 text-slate-400 focus-within:text-blue-400">…</svg>
  <input class="flex-1 bg-transparent outline-none text-white" placeholder="Search" />
</label>`,
  },

  // ─── 14. Group & Peer Variants ────────────────────────────────────────────
  {
    title: "Group hover children",
    description: "Animate child on parent hover",
    code: `<div class="group flex items-center gap-3 p-4 rounded-xl border border-slate-700 hover:border-blue-500 hover:bg-blue-500/5 cursor-pointer transition-all">
  <div class="w-10 h-10 bg-blue-500/20 group-hover:bg-blue-500 rounded-lg flex items-center justify-center transition-colors">
    <svg class="w-5 h-5 text-blue-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path d="M13 7l5 5-5 5M6 12h12" stroke-width="2"/>
    </svg>
  </div>
  <span class="font-medium group-hover:text-blue-300 transition-colors">Click here</span>
</div>`,
  },
  {
    title: "Named group variant",
    description: "Multiple nested groups with names",
    code: `<div class="group/card hover:shadow-xl transition-shadow rounded-2xl overflow-hidden">
  <div class="p-6">
    <button class="group/btn flex items-center gap-2">
      <span>Expand</span>
      <svg class="w-4 h-4 transition-transform group-hover/btn:rotate-90">…</svg>
    </button>
  </div>
  <div class="opacity-0 group-hover/card:opacity-100 transition-opacity p-6 pt-0 text-sm text-slate-400">
    Revealed on card hover
  </div>
</div>`,
  },
  {
    title: "Peer checkbox",
    description: "Style sibling based on checkbox state",
    code: `<label class="flex items-center gap-3 cursor-pointer">
  <input id="toggle" type="checkbox" class="peer sr-only" />
  <div class="w-10 h-6 rounded-full bg-slate-600 peer-checked:bg-blue-500 transition-colors relative">
    <div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
  </div>
  <span class="text-slate-400 peer-checked:text-white transition-colors">Enable feature</span>
</label>`,
  },
  {
    title: "Peer invalid validation",
    description: "Show error message on invalid input",
    code: `<div>
  <input
    type="email"
    class="peer border rounded-lg px-3 py-2 focus:outline-none invalid:[&:not(:placeholder-shown)]:border-red-500"
    placeholder=" "
    required
  />
  <p class="hidden peer-[&:not(:placeholder-shown)]:peer-invalid:block text-red-500 text-xs mt-1">
    Please enter a valid email address.
  </p>
</div>`,
  },

  // ─── 15. Arbitrary Values ─────────────────────────────────────────────────
  {
    title: "Arbitrary spacing",
    description: "One-off spacing with square brackets",
    code: `<div class="mt-[72px] px-[18px] w-[calc(100%-2rem)]">
  Custom spacing
</div>
<div class="top-[117px] left-[50%] -translate-x-1/2 absolute">
  Precisely positioned
</div>`,
  },
  {
    title: "Arbitrary colors",
    description: "Custom hex / hsl colors inline",
    code: `<div class="bg-[#1a1a2e] text-[#e94560]">Custom palette</div>
<div class="border-[hsl(220,90%,56%)]">HSL border</div>
<div class="bg-[rgb(99,102,241)] text-[rgba(255,255,255,0.9)]">RGB values</div>`,
  },
  {
    title: "CSS variable arbitrary",
    description: "Use CSS custom properties in classes",
    code: `<!-- Define variable on element or :root -->
<div style="--brand: #6366f1;" class="bg-[--brand] text-white p-4 rounded-xl">
  Uses CSS variable
</div>
<div class="text-[var(--foreground)] bg-[var(--background)]">
  Design token values
</div>`,
  },
  {
    title: "Arbitrary grid template",
    description: "Custom grid-template-columns arbitrary",
    code: `<div class="grid grid-cols-[240px_1fr_300px] gap-6 h-screen">
  <aside class="bg-slate-800">Sidebar</aside>
  <main class="bg-slate-900">Content</main>
  <aside class="bg-slate-800">Panel</aside>
</div>`,
  },
  {
    title: "Arbitrary variants",
    description: "Target arbitrary CSS selectors",
    code: `<!-- Style third child -->
<ul class="[&>li:nth-child(3)]:bg-blue-500/20 [&>li:nth-child(3)]:text-blue-300">
  <li class="py-2 px-3">Item 1</li>
  <li class="py-2 px-3">Item 2</li>
  <li class="py-2 px-3">Item 3 — highlighted</li>
  <li class="py-2 px-3">Item 4</li>
</ul>`,
  },

  // ─── 16. Config & Customization ───────────────────────────────────────────
  {
    title: "Extend colors",
    description: "Add custom brand colors to theme",
    code: `// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          500: '#6366f1',
          600: '#4f46e5',
          900: '#1e1b4b',
        },
        surface: 'hsl(var(--surface) / <alpha-value>)',
      },
    },
  },
} satisfies Config;`,
  },
  {
    title: "Extend typography",
    description: "Custom fonts and text sizes",
    code: `// tailwind.config.ts
export default {
  theme: {
    extend: {
      fontFamily: {
        display: ['Cal Sans', 'sans-serif'],
        body:    ['Inter var', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        '10xl': ['10rem', { lineHeight: '1' }],
      },
    },
  },
};`,
  },
  {
    title: "Custom keyframes",
    description: "Add custom animations via config",
    code: `// tailwind.config.ts
export default {
  theme: {
    extend: {
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        shimmer:   'shimmer 1.5s infinite',
      },
    },
  },
};

// Usage
// <div class="animate-fade-in">Fades in</div>`,
  },
  {
    title: "Custom screens",
    description: "Add or override responsive breakpoints",
    code: `// tailwind.config.ts
export default {
  theme: {
    extend: {
      screens: {
        'xs':   '480px',
        '3xl':  '1920px',
        'tall': { raw: '(min-height: 800px)' },
        'print': { raw: 'print' },
      },
    },
  },
};

// Usage: <div class="xs:block 3xl:text-xl tall:py-12">`,
  },
  {
    title: "Tailwind plugin",
    description: "Add utilities with a plugin function",
    code: `// tailwind.config.ts
import plugin from 'tailwindcss/plugin';

export default {
  plugins: [
    plugin(({ addUtilities, addComponents, theme }) => {
      addUtilities({
        '.no-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      });
      addComponents({
        '.btn-primary': {
          backgroundColor: theme('colors.blue.600'),
          color: '#fff',
          padding: \`\${theme('spacing.2')} \${theme('spacing.4')}\`,
          borderRadius: theme('borderRadius.lg'),
          '&:hover': { backgroundColor: theme('colors.blue.500') },
        },
      });
    }),
  ],
};`,
  },

  // ─── 17. @apply and CSS Layers ────────────────────────────────────────────
  {
    title: "@apply in components",
    description: "Extract repeated classes with @apply",
    code: `/* styles/components.css */
@layer components {
  .btn {
    @apply inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2;
  }

  .btn-primary {
    @apply btn bg-blue-600 text-white hover:bg-blue-500 focus-visible:ring-blue-500;
  }

  .btn-secondary {
    @apply btn bg-slate-700 text-slate-200 hover:bg-slate-600 focus-visible:ring-slate-500;
  }

  .input {
    @apply w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500;
  }
}`,
  },
  {
    title: "@layer utilities",
    description: "Custom utilities in the utilities layer",
    code: `/* global.css */
@layer utilities {
  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: theme(colors.slate.600) transparent;
  }

  .text-balance {
    text-wrap: balance;
  }

  .mask-fade-b {
    -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
    mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
  }
}`,
  },
  {
    title: "@layer base reset",
    description: "Override base styles in base layer",
    code: `/* global.css */
@layer base {
  *, *::before, *::after {
    box-sizing: border-box;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-bold tracking-tight;
  }

  a {
    @apply text-blue-400 hover:text-blue-300 underline-offset-4;
  }

  :root {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
  }
}`,
  },

  // ─── 18. Interactive States ───────────────────────────────────────────────
  {
    title: "Cursor utilities",
    description: "Control cursor appearance on hover",
    code: `<button class="cursor-pointer">Pointer cursor</button>
<div class="cursor-not-allowed opacity-50">Not allowed</div>
<div class="cursor-grab active:cursor-grabbing">Draggable item</div>
<div class="cursor-crosshair">Canvas / draw area</div>
<input class="cursor-text" type="text" />`,
  },
  {
    title: "User select",
    description: "Control text selection behavior",
    code: `<p class="select-none">Cannot be selected (UI labels)</p>
<p class="select-all">Click to select all text at once</p>
<p class="select-text">Normal text selection</p>
<pre class="select-all font-mono text-sm p-3 bg-slate-800 rounded">
  npm install tailwindcss
</pre>`,
  },
  {
    title: "Pointer events",
    description: "Enable/disable mouse interaction",
    code: `<div class="pointer-events-none fixed inset-0 z-50">
  <!-- Overlay that lets clicks through -->
  <div class="pointer-events-auto absolute bottom-4 right-4">
    <button class="bg-blue-600 text-white px-4 py-2 rounded-xl">Clickable</button>
  </div>
</div>`,
  },
  {
    title: "Scroll behavior",
    description: "Scroll snapping and smooth scroll",
    code: `<!-- Scroll snap container -->
<div class="snap-x snap-mandatory flex overflow-x-auto gap-4 pb-4">
  <div class="snap-start snap-always shrink-0 w-80 h-48 bg-slate-700 rounded-xl"></div>
  <div class="snap-start snap-always shrink-0 w-80 h-48 bg-slate-700 rounded-xl"></div>
  <div class="snap-start snap-always shrink-0 w-80 h-48 bg-slate-700 rounded-xl"></div>
</div>

<!-- Smooth scroll on page -->
<html class="scroll-smooth">`,
  },
  {
    title: "Scroll margin / padding",
    description: "Offset scroll targets for fixed headers",
    code: `<!-- Offset anchor targets so fixed header doesn't overlap -->
<section id="features" class="scroll-mt-20">
  <h2>Features</h2>
</section>

<!-- Scroll padding on the container -->
<div class="scroll-pt-16 overflow-y-auto h-screen snap-y">
  <div id="s1" class="snap-start scroll-mt-16 h-screen">Section 1</div>
</div>`,
  },

  // ─── 19. Layout Helpers ───────────────────────────────────────────────────
  {
    title: "Overflow control",
    description: "Clip, scroll, and hide overflow",
    code: `<div class="overflow-hidden rounded-2xl">Clips child overflow (good for rounded images)</div>
<div class="overflow-y-auto max-h-96">Vertical scroll only</div>
<div class="overflow-x-auto">Horizontal scroll (tables)</div>
<div class="overflow-clip">No scrollbar, just clips</div>`,
  },
  {
    title: "Aspect ratio",
    description: "Force element to maintain aspect ratio",
    code: `<div class="aspect-square bg-slate-700 rounded-xl">1:1 Square</div>
<div class="aspect-video bg-slate-700 rounded-xl">16:9 Video</div>
<div class="aspect-[4/3] bg-slate-700 rounded-xl">4:3 Classic</div>
<div class="aspect-[21/9] bg-slate-700 rounded-xl">Ultrawide</div>`,
  },
  {
    title: "Columns masonry",
    description: "CSS columns for masonry-style layout",
    code: `<div class="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
  <div class="break-inside-avoid bg-slate-700 p-4 rounded-xl">Short card</div>
  <div class="break-inside-avoid bg-slate-700 p-4 rounded-xl h-48">Tall card</div>
  <div class="break-inside-avoid bg-slate-700 p-4 rounded-xl">Normal card</div>
  <div class="break-inside-avoid bg-slate-700 p-4 rounded-xl h-32">Medium card</div>
</div>`,
  },
  {
    title: "Object fit / position",
    description: "Control image/video scaling in container",
    code: `<div class="w-64 h-48 overflow-hidden rounded-xl">
  <img class="w-full h-full object-cover object-center" src="/photo.jpg" alt="" />
</div>

<!-- object-contain | object-cover | object-fill | object-none | object-scale-down -->
<!-- object-top | object-bottom | object-left | object-right | object-[50%_25%] -->`,
  },
  {
    title: "Visibility & display",
    description: "Show, hide, and toggle display",
    code: `<div class="visible">Visible (default)</div>
<div class="invisible">Hidden but takes up space</div>
<div class="hidden">Removed from layout (display: none)</div>
<div class="block md:hidden">Block only on mobile</div>
<div class="inline-flex items-center gap-2">Inline flex</div>
<div class="contents">Children act as direct grid/flex items</div>`,
  },

  // ─── 20. Accessibility ────────────────────────────────────────────────────
  {
    title: "Screen reader only",
    description: "Visually hide but keep for screen readers",
    code: `<button class="flex items-center gap-2">
  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path d="M5 12h14M12 5l7 7-7 7" stroke-width="2"/>
  </svg>
  <span class="sr-only">Go to next page</span>
</button>

<!-- Also: not-sr-only to reverse sr-only -->`,
  },
  {
    title: "Focus visible only",
    description: "Show focus ring only for keyboard users",
    code: `<button class="
  px-4 py-2 bg-blue-600 text-white rounded-lg
  focus:outline-none
  focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2
">
  Keyboard-only focus ring
</button>`,
  },
  {
    title: "Motion reduce",
    description: "Disable animations for reduced motion",
    code: `<div class="
  animate-bounce
  motion-reduce:animate-none
  transition-transform duration-300
  motion-reduce:transition-none
">
  Respects prefers-reduced-motion
</div>

<!-- In config you can also use: -->
<!-- motion-safe:animate-spin — only animate if motion is ok -->`,
  },
  {
    title: "Print styles",
    description: "Override styles for print media",
    code: `<nav class="print:hidden">Navigation (hidden when printing)</nav>

<main class="print:text-black print:bg-white">
  <h1 class="text-white dark:text-white print:text-black">Article</h1>
  <p class="text-slate-400 print:text-slate-700">Content</p>
</main>

<footer class="print:block hidden">Print-only footer with URL</footer>`,
  },
  {
    title: "Skip to content link",
    description: "Keyboard skip link for accessibility",
    code: `<!-- Place as first element in <body> -->
<a
  href="#main-content"
  class="
    sr-only focus:not-sr-only
    focus:fixed focus:top-4 focus:left-4 focus:z-[999]
    focus:bg-white focus:text-blue-600 focus:px-4 focus:py-2 focus:rounded-lg
    focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500
  "
>
  Skip to main content
</a>

<main id="main-content" tabindex="-1">
  Page content…
</main>`,
  },
];
