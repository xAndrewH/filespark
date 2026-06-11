import Link from "next/link";

const TOOL_INFO: Record<string, { title: string; description: string }> = {
  "/tools/word-counter":        { title: "Word Counter",              description: "Count words, characters, sentences, and reading time." },
  "/tools/markdown":            { title: "Markdown Editor",           description: "Split-pane editor with live HTML preview." },
  "/tools/diff":                { title: "Text Diff Checker",         description: "Paste two texts and see exactly what changed." },
  "/tools/lorem":               { title: "Lorem Ipsum Generator",     description: "Generate paragraphs, sentences, or words of placeholder text." },
  "/tools/base64":              { title: "Base64 Encoder / Decoder",  description: "Encode plain text to Base64 or decode Base64 strings." },
  "/tools/url-encode":          { title: "URL Encoder / Decoder",     description: "Percent-encode URLs or decode encoded query strings." },
  "/tools/hash":                { title: "Hash Generator",            description: "Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes." },
  "/tools/json":                { title: "JSON Formatter",            description: "Validate, format with configurable indentation, and minify JSON." },
  "/tools/regex":               { title: "Regex Tester",              description: "Test regular expressions with live match highlighting." },
  "/tools/csv-json":            { title: "CSV ↔ JSON",                description: "Convert between CSV and JSON with a live table preview." },
  "/tools/case-converter":      { title: "Case Converter",            description: "Convert text between camelCase, snake_case, kebab-case, and more." },
  "/tools/grammar-checker":     { title: "Grammar & Spell Checker",   description: "Check grammar, spelling, and style instantly in your browser." },
  "/tools/html-beautifier":     { title: "HTML Beautifier",           description: "Format and indent HTML following W3C best practices." },
  "/tools/js-beautifier":       { title: "JavaScript Beautifier",     description: "Format JavaScript and TypeScript." },
  "/tools/css-beautifier":      { title: "CSS Beautifier",            description: "Format CSS, SCSS, and Sass." },
  "/tools/python-beautifier":   { title: "Python Beautifier",         description: "Format Python code with PEP 8." },
  "/tools/color-picker":        { title: "Color Picker",              description: "Pick a color and get HEX, RGB, HSL, and CMYK values instantly." },
  "/tools/palette":             { title: "Color Palette Generator",   description: "Generate complementary, triadic, and analogous palettes." },
  "/tools/gradient":            { title: "CSS Gradient Builder",      description: "Build linear and radial gradients and copy the CSS." },
  "/tools/glassmorphism":       { title: "Glassmorphism Generator",   description: "Build glass-effect UI cards with blur and opacity controls." },
  "/tools/box-shadow":          { title: "Box Shadow Builder",        description: "Build CSS box shadows with multiple layers and live preview." },
  "/tools/border-radius":       { title: "Border Radius Builder",     description: "Shape rounded corners per-side visually and copy the CSS." },
  "/tools/favicon":             { title: "Favicon Generator",         description: "Upload any image and get favicon PNGs at all standard sizes." },
  "/tools/units":               { title: "Unit Converter",            description: "Convert length, weight, temperature, area, volume, and more." },
  "/tools/aspect-ratio":        { title: "Aspect Ratio Calculator",   description: "Calculate width or height while locking an aspect ratio." },
  "/tools/timestamp":           { title: "Timestamp Converter",       description: "Convert Unix timestamps to human-readable dates and back." },
  "/tools/base-converter":      { title: "Number Base Converter",     description: "Convert numbers between binary, octal, decimal, and hex." },
  "/tools/cron":                { title: "Cron Expression Builder",   description: "Build and validate cron schedules with next-run preview." },
  "/tools/password":            { title: "Password Generator",        description: "Cryptographically secure passwords with strength scoring." },
  "/tools/calculator":          { title: "Calculator",                description: "Basic and advanced scientific calculator with history." },
  "/tools/currency-converter":  { title: "Currency Converter",        description: "Live exchange rates for 160+ currencies by country." },
  "/tools/time-calculator":     { title: "Time Calculator",           description: "Calculate durations, add/subtract time, combine intervals." },
  "/tools/percentage-calculator": { title: "Percentage Calculator",   description: "Calculate percentages, increases, decreases, and differences." },
  "/tools/average-calculator":  { title: "Average Calculator",        description: "Mean, median, mode, and range for any set of numbers." },
  "/tools/http-status":         { title: "HTTP Status Codes",         description: "Searchable reference for every HTTP status code." },
  "/tools/framework-reference": { title: "Framework Reference",       description: "Snippets for Tailwind, Bootstrap, Sass, React, and Next.js." },
  "/tools/utm-builder":         { title: "UTM Builder",               description: "Build UTM-tagged URLs for campaign tracking." },
  "/tools/image-editor":        { title: "Image Editor",              description: "Resize, rotate, flip, and adjust quality for any image." },
  "/tools/raster-to-svg":       { title: "PNG / JPG → SVG",          description: "Vectorize raster images to scalable SVG." },
  "/tools/image-compressor":    { title: "Image Compressor",          description: "Compress JPEG, PNG, and WEBP images in bulk." },
  "/tools/svg-to-png":          { title: "SVG to PNG",                description: "Convert SVG files or pasted code to PNG at up to 4× scale." },
  "/tools/background-remover":  { title: "Background Remover",        description: "Remove backgrounds instantly in your browser." },
  "/tools/exif":                { title: "EXIF Viewer",               description: "Read camera settings, GPS, and metadata from images." },
  "/tools/pdf-merge":           { title: "PDF Merge",                 description: "Combine multiple PDFs into one, reorder pages before merging." },
  "/tools/pdf-to-images":       { title: "PDF to JPG / PNG / WEBP",   description: "Convert PDF pages to JPG, PNG, or WEBP images." },
  "/tools/image-to-pdf":        { title: "Image to PDF",              description: "Combine JPG, PNG, WEBP, or GIF images into a single PDF." },
  "/tools/image-converter":     { title: "Image Converter",           description: "Convert images between PNG, JPG, and WEBP in bulk." },
  "/tools/images-to-gif":       { title: "Images to GIF",             description: "Combine a sequence of images into an animated GIF." },
  "/tools/video-to-gif":        { title: "Video to GIF",              description: "Turn a clip of any video into an optimized GIF." },
  "/tools/qr":                  { title: "QR Code Generator",         description: "Generate QR codes from any URL or text. Download as PNG." },
};

const RELATED: Record<string, string[]> = {
  "/tools/utm-builder":         ["/tools/qr", "/tools/url-encode", "/tools/grammar-checker"],
  "/tools/qr":                  ["/tools/utm-builder", "/tools/url-encode", "/tools/image-editor"],
  "/tools/password":            ["/tools/hash", "/tools/base64", "/tools/url-encode"],
  "/tools/markdown":            ["/tools/word-counter", "/tools/grammar-checker", "/tools/diff"],
  "/tools/word-counter":        ["/tools/markdown", "/tools/grammar-checker", "/tools/diff"],
  "/tools/grammar-checker":     ["/tools/word-counter", "/tools/markdown", "/tools/diff"],
  "/tools/diff":                ["/tools/markdown", "/tools/word-counter", "/tools/case-converter"],
  "/tools/color-picker":        ["/tools/palette", "/tools/gradient", "/tools/glassmorphism"],
  "/tools/palette":             ["/tools/color-picker", "/tools/gradient", "/tools/box-shadow"],
  "/tools/gradient":            ["/tools/color-picker", "/tools/glassmorphism", "/tools/box-shadow"],
  "/tools/glassmorphism":       ["/tools/gradient", "/tools/box-shadow", "/tools/border-radius"],
  "/tools/box-shadow":          ["/tools/glassmorphism", "/tools/border-radius", "/tools/gradient"],
  "/tools/border-radius":       ["/tools/box-shadow", "/tools/glassmorphism", "/tools/gradient"],
  "/tools/json":                ["/tools/csv-json", "/tools/base64", "/tools/hash"],
  "/tools/csv-json":            ["/tools/json", "/tools/base64", "/tools/word-counter"],
  "/tools/regex":               ["/tools/case-converter", "/tools/json", "/tools/hash"],
  "/tools/hash":                ["/tools/base64", "/tools/url-encode", "/tools/password"],
  "/tools/base64":              ["/tools/url-encode", "/tools/hash", "/tools/json"],
  "/tools/url-encode":          ["/tools/base64", "/tools/utm-builder", "/tools/hash"],
  "/tools/image-editor":        ["/tools/image-converter", "/tools/image-compressor", "/tools/background-remover"],
  "/tools/image-converter":     ["/tools/image-compressor", "/tools/image-editor", "/tools/svg-to-png"],
  "/tools/image-compressor":    ["/tools/image-converter", "/tools/image-editor", "/tools/background-remover"],
  "/tools/background-remover":  ["/tools/image-editor", "/tools/image-compressor", "/tools/raster-to-svg"],
  "/tools/favicon":             ["/tools/image-editor", "/tools/svg-to-png", "/tools/image-compressor"],
  "/tools/svg-to-png":          ["/tools/favicon", "/tools/raster-to-svg", "/tools/image-converter"],
  "/tools/raster-to-svg":       ["/tools/svg-to-png", "/tools/image-editor", "/tools/background-remover"],
  "/tools/pdf-merge":           ["/tools/image-to-pdf", "/tools/pdf-to-images", "/tools/image-editor"],
  "/tools/pdf-to-images":       ["/tools/image-to-pdf", "/tools/pdf-merge", "/tools/image-converter"],
  "/tools/image-to-pdf":        ["/tools/pdf-merge", "/tools/pdf-to-images", "/tools/image-converter"],
  "/tools/video-to-gif":        ["/tools/images-to-gif", "/tools/image-compressor", "/tools/image-editor"],
  "/tools/images-to-gif":       ["/tools/video-to-gif", "/tools/image-converter", "/tools/image-compressor"],
  "/tools/exif":                ["/tools/image-editor", "/tools/image-compressor", "/tools/raster-to-svg"],
  "/tools/units":               ["/tools/aspect-ratio", "/tools/percentage-calculator", "/tools/calculator"],
  "/tools/aspect-ratio":        ["/tools/units", "/tools/image-editor", "/tools/percentage-calculator"],
  "/tools/timestamp":           ["/tools/time-calculator", "/tools/cron", "/tools/base-converter"],
  "/tools/time-calculator":     ["/tools/timestamp", "/tools/calculator", "/tools/percentage-calculator"],
  "/tools/cron":                ["/tools/timestamp", "/tools/time-calculator", "/tools/regex"],
  "/tools/calculator":          ["/tools/percentage-calculator", "/tools/average-calculator", "/tools/units"],
  "/tools/percentage-calculator": ["/tools/calculator", "/tools/average-calculator", "/tools/currency-converter"],
  "/tools/average-calculator":  ["/tools/calculator", "/tools/percentage-calculator", "/tools/units"],
  "/tools/currency-converter":  ["/tools/percentage-calculator", "/tools/calculator", "/tools/units"],
  "/tools/base-converter":      ["/tools/hash", "/tools/base64", "/tools/timestamp"],
  "/tools/lorem":               ["/tools/word-counter", "/tools/markdown", "/tools/grammar-checker"],
  "/tools/case-converter":      ["/tools/word-counter", "/tools/regex", "/tools/url-encode"],
  "/tools/http-status":         ["/tools/framework-reference", "/tools/utm-builder", "/tools/url-encode"],
  "/tools/framework-reference": ["/tools/http-status", "/tools/css-beautifier", "/tools/html-beautifier"],
  "/tools/html-beautifier":     ["/tools/css-beautifier", "/tools/js-beautifier", "/tools/framework-reference"],
  "/tools/js-beautifier":       ["/tools/html-beautifier", "/tools/css-beautifier", "/tools/regex"],
  "/tools/css-beautifier":      ["/tools/html-beautifier", "/tools/gradient", "/tools/glassmorphism"],
  "/tools/python-beautifier":   ["/tools/js-beautifier", "/tools/regex", "/tools/hash"],
};

export function RelatedTools({ current }: { current: string }) {
  const related = (RELATED[current] ?? []).filter(h => TOOL_INFO[h]).slice(0, 3);
  if (related.length === 0) return null;
  return (
    <div className="border-t border-slate-800/60 mt-10 pt-8">
      <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-4">Related tools</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {related.map(href => {
          const tool = TOOL_INFO[href]!;
          return (
            <Link key={href} href={href}
              className="group flex flex-col gap-1 p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 hover:border-slate-700/80 hover:bg-slate-900/70 transition-all">
              <p className="text-white text-sm font-medium group-hover:text-blue-300 transition-colors leading-snug">{tool.title}</p>
              <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{tool.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
