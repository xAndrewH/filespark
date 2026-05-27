import type { Entry } from "../types";

export const sassEntries: Entry[] = [
  // 1. Variables — all types
  {
    title: "Color Variable",
    description: "Store color values in variables.",
    code: `$primary: #3498db;
$secondary: #2ecc71;
$danger: #e74c3c;

.button {
  background-color: $primary;
  border-color: $secondary;
}`,
  },
  {
    title: "Number Variable",
    description: "Store numeric values with units.",
    code: `$base-font-size: 16px;
$line-height: 1.5;
$border-radius: 4px;
$z-modal: 1000;

body {
  font-size: $base-font-size;
  line-height: $line-height;
}`,
  },
  {
    title: "String Variable",
    description: "Store quoted and unquoted strings.",
    code: `$font-stack: "Helvetica Neue", Arial, sans-serif;
$icon-prefix: "icon"; // unquoted string
$content-quote: "→";

body {
  font-family: $font-stack;
}
.icon::before {
  content: $content-quote;
}`,
  },
  {
    title: "Boolean Variable",
    description: "Store true/false for conditional logic.",
    code: `$enable-shadows: true;
$enable-gradients: false;
$debug-mode: false;

.card {
  @if $enable-shadows {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
}`,
  },
  {
    title: "Null Variable",
    description: "Null omits the property entirely.",
    code: `$border: null;
$padding: 1rem;

.box {
  border: $border;   // omitted from output
  padding: $padding;
}`,
  },
  {
    title: "List Variable",
    description: "Ordered comma or space-separated values.",
    code: `$font-sizes: 12px, 14px, 16px, 20px, 24px;
$transitions: color 0.2s ease, background-color 0.2s ease;

.animated {
  transition: $transitions;
}`,
  },
  {
    title: "Map Variable",
    description: "Key-value pairs for structured data.",
    code: `$theme-colors: (
  "primary": #3498db,
  "secondary": #2ecc71,
  "danger":   #e74c3c,
  "warning":  #f39c12,
);

.alert-primary {
  background-color: map.get($theme-colors, "primary");
}`,
  },

  // 2. Variable scoping
  {
    title: "!default Flag",
    description: "Assign only if not already defined.",
    code: `// _config.scss (consumer can override before @use)
$primary: #3498db !default;
$spacing-unit: 8px !default;

// consuming file:
// $primary: red; // this would override the !default
// @use "config";`,
  },
  {
    title: "!global Flag",
    description: "Promote local variable to global scope.",
    code: `$theme: light;

@mixin set-dark-theme {
  $theme: dark !global;
  background: #121212;
  color: #fff;
}

.dark {
  @include set-dark-theme;
}

// $theme is now "dark" at global scope after include`,
  },
  {
    title: "Local Variable Scope",
    description: "Variables inside blocks stay local.",
    code: `$color: blue; // global

.component {
  $color: red; // local — shadows global
  color: $color; // red

  .child {
    color: $color; // still red (nested scope inherits)
  }
}

.other {
  color: $color; // blue (global)
}`,
  },

  // 3. Interpolation
  {
    title: "Interpolation in Selectors",
    description: "Dynamically build selector names.",
    code: `$sizes: sm, md, lg;

@each $size in $sizes {
  .btn-#{$size} {
    font-size: if($size == sm, 0.75rem, if($size == md, 1rem, 1.25rem));
  }
}`,
  },
  {
    title: "Interpolation in Properties",
    description: "Use variables as property names.",
    code: `$side: top;
$property: color;

.element {
  border-#{$side}: 1px solid red;
  background-#{$property}: blue;
  margin-#{$side}: 1rem;
}`,
  },
  {
    title: "Interpolation in Values",
    description: "Embed expressions inside string values.",
    code: `$base: 16;
$unit: px;

.text {
  font-size: #{$base}#{$unit};           // 16px
  font-family: "Icon-#{$base}";          // "Icon-16"
  background: url("/images/#{$base}.png");
}`,
  },
  {
    title: "Interpolation in Strings",
    description: "Build dynamic string content.",
    code: `$name: "world";
$version: 3;

@debug "Hello, #{$name}!";           // Hello, world!
@debug "Sass version #{$version}";   // Sass version 3`,
  },

  // 4. Nesting
  {
    title: "Basic Nesting",
    description: "Nest selectors to mirror HTML structure.",
    code: `nav {
  background: #333;

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    display: inline-block;
  }

  a {
    color: white;
    text-decoration: none;
  }
}`,
  },
  {
    title: "Pseudo-class Nesting",
    description: "& refers to the parent selector.",
    code: `.button {
  background: $primary;
  transition: background 0.2s;

  &:hover {
    background: darken($primary, 10%);
  }

  &:focus {
    outline: 2px solid $primary;
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}`,
  },
  {
    title: "BEM with Ampersand",
    description: "Generate BEM classes using &.",
    code: `.card {
  padding: 1rem;
  border-radius: 4px;

  &__header {
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  &__body {
    color: #555;
  }

  &--featured {
    border: 2px solid $primary;
  }

  &--disabled {
    opacity: 0.4;
    pointer-events: none;
  }
}`,
  },
  {
    title: "Sibling Combinators Nested",
    description: "Nest + and ~ combinators with &.",
    code: `.list-item {
  padding: 0.5rem;

  & + & {
    border-top: 1px solid #eee; // adjacent sibling
  }

  & ~ & {
    color: #999; // general sibling
  }

  & > .icon {
    margin-right: 0.5rem; // direct child
  }
}`,
  },

  // 5. @mixin basic and variants
  {
    title: "Basic @mixin",
    description: "Reusable block of styles.",
    code: `@mixin reset-box {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.container {
  @include reset-box;
  max-width: 1200px;
}`,
  },
  {
    title: "Mixin with Arguments",
    description: "Pass values into a mixin.",
    code: `@mixin border-radius($radius) {
  -webkit-border-radius: $radius;
  -moz-border-radius: $radius;
  border-radius: $radius;
}

.pill   { @include border-radius(9999px); }
.card   { @include border-radius(8px); }
.circle { @include border-radius(50%); }`,
  },
  {
    title: "Mixin with Defaults",
    description: "Default argument values in mixins.",
    code: `@mixin shadow($x: 0, $y: 2px, $blur: 8px, $color: rgba(0,0,0,0.15)) {
  box-shadow: $x $y $blur $color;
}

.card    { @include shadow; }
.modal   { @include shadow(0, 8px, 24px, rgba(0,0,0,0.3)); }
.tooltip { @include shadow($blur: 4px, $color: rgba(0,0,0,0.2)); }`,
  },
  {
    title: "Variadic Mixin (...)",
    description: "Accept any number of arguments.",
    code: `@mixin transition($properties...) {
  transition: $properties;
}

.animated {
  @include transition(color 0.2s, background 0.3s, transform 0.2s ease-out);
}

@mixin multi-bg($backgrounds...) {
  background: $backgrounds;
}

.hero {
  @include multi-bg(
    url("/overlay.png") center / cover,
    linear-gradient(to bottom, transparent, black)
  );
}`,
  },
  {
    title: "Mixin with @content",
    description: "Pass a block of styles into a mixin.",
    code: `@mixin hover-state {
  &:hover,
  &:focus {
    @content;
  }
}

.link {
  color: $primary;

  @include hover-state {
    color: darken($primary, 15%);
    text-decoration: underline;
  }
}`,
  },

  // 6. @include calling
  {
    title: "@include Passing Block",
    description: "Use @content to inject custom styles.",
    code: `@mixin respond-to($breakpoint) {
  @if $breakpoint == mobile {
    @media (max-width: 767px) { @content; }
  } @else if $breakpoint == tablet {
    @media (min-width: 768px) and (max-width: 1023px) { @content; }
  } @else if $breakpoint == desktop {
    @media (min-width: 1024px) { @content; }
  }
}

.sidebar {
  width: 100%;

  @include respond-to(desktop) {
    width: 280px;
    float: left;
  }
}`,
  },
  {
    title: "Keyword Arguments @include",
    description: "Call mixins with named arguments.",
    code: `@mixin position($type: relative, $top: null, $right: null, $bottom: null, $left: null) {
  position: $type;
  top: $top;
  right: $right;
  bottom: $bottom;
  left: $left;
}

.overlay {
  @include position(absolute, $top: 0, $left: 0);
  width: 100%;
  height: 100%;
}`,
  },

  // 7. @extend and placeholders
  {
    title: "@extend Basic",
    description: "Share styles between selectors.",
    code: `.message {
  padding: 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.success-message {
  @extend .message;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.error-message {
  @extend .message;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}`,
  },
  {
    title: "Placeholder Selector %",
    description: "Silent classes — extend only, no output.",
    code: `%flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

%visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

.modal-backdrop { @extend %flex-center; }
.hero-section    { @extend %flex-center; }
.sr-only         { @extend %visually-hidden; }`,
  },
  {
    title: "@extend in Media Queries",
    description: "Extend limitations inside media queries.",
    code: `// Extending inside a media query only extends
// selectors defined in that same media query.

%button-base {
  display: inline-block;
  padding: 0.5rem 1rem;
  border: none;
  cursor: pointer;
}

.btn-primary {
  @extend %button-base;
  background: $primary;
  color: white;
}

.btn-secondary {
  @extend %button-base;
  background: transparent;
  border: 1px solid $primary;
}`,
  },

  // 8. @function and @return
  {
    title: "Basic @function",
    description: "Return a computed value.",
    code: `@use "sass:math";

@function rem($px, $base: 16) {
  @return math.div($px, $base) * 1rem;
}

h1 { font-size: rem(32); }  // 2rem
h2 { font-size: rem(24); }  // 1.5rem
p  { font-size: rem(16); }  // 1rem`,
  },
  {
    title: "Function Type Checking",
    description: "Validate argument types in functions.",
    code: `@use "sass:meta";

@function spacing($multiplier) {
  @if meta.type-of($multiplier) != number {
    @error "spacing() expects a number, got #{meta.type-of($multiplier)}.";
  }
  @return $multiplier * 8px;
}

.card {
  padding: spacing(2);  // 16px
  margin:  spacing(3);  // 24px
}`,
  },
  {
    title: "Function with Map Lookup",
    description: "Use a map inside a function.",
    code: `@use "sass:map";

$z-layers: (
  "below":   -1,
  "base":     0,
  "raised":  10,
  "overlay": 100,
  "modal":  1000,
  "toast":  2000,
);

@function z($layer) {
  @if not map.has-key($z-layers, $layer) {
    @error "Unknown z-layer: #{$layer}.";
  }
  @return map.get($z-layers, $layer);
}

.modal   { z-index: z("modal"); }
.tooltip { z-index: z("overlay"); }`,
  },

  // 9. Built-in math module
  {
    title: "math.div Division",
    description: "Safe division replacing / operator.",
    code: `@use "sass:math";

.grid-col {
  width: math.div(100%, 12);        // 8.3333%
}

.ratio-box {
  padding-top: math.div(9, 16) * 100%; // 56.25%
}`,
  },
  {
    title: "math.ceil / math.floor / math.round",
    description: "Round numbers up, down, or nearest.",
    code: `@use "sass:math";

$raw: 3.7px;

.a { margin: math.ceil($raw); }   // 4px
.b { margin: math.floor($raw); }  // 3px
.c { margin: math.round($raw); }  // 4px`,
  },
  {
    title: "math.abs / math.min / math.max",
    description: "Absolute value, minimum, maximum.",
    code: `@use "sass:math";

$offset: -8px;
$a: 10px;
$b: 20px;

.box {
  margin-top: math.abs($offset);  // 8px
  width: math.min($a, $b);        // 10px
  height: math.max($a, $b);       // 20px
}`,
  },
  {
    title: "math.pow / math.sqrt",
    description: "Power and square root functions.",
    code: `@use "sass:math";

$base: 2;
$exp: 8;

$result: math.pow($base, $exp); // 256

.golden {
  // golden ratio width
  width: 100px * math.sqrt(1.618);
}`,
  },

  // 10. Built-in color module
  {
    title: "color.adjust",
    description: "Adjust hue, saturation, lightness, alpha.",
    code: `@use "sass:color";

$base: #3498db;

.lighter { color: color.adjust($base, $lightness: 20%); }
.darker  { color: color.adjust($base, $lightness: -20%); }
.muted   { color: color.adjust($base, $saturation: -30%); }
.faded   { color: color.adjust($base, $alpha: -0.4); }`,
  },
  {
    title: "color.scale",
    description: "Scale color channels proportionally.",
    code: `@use "sass:color";

$brand: #3498db;

// scale is relative to current value, not absolute
.hover  { background: color.scale($brand, $lightness: -15%); }
.active { background: color.scale($brand, $lightness: -30%); }
.ghost  { background: color.scale($brand, $alpha: -50%); }`,
  },
  {
    title: "color.mix",
    description: "Blend two colors together.",
    code: `@use "sass:color";

$blue: #3498db;
$white: #ffffff;
$black: #000000;

.tint-20  { background: color.mix($white, $blue, 20%); }
.tint-60  { background: color.mix($white, $blue, 60%); }
.shade-20 { background: color.mix($black, $blue, 20%); }`,
  },
  {
    title: "color.invert / color.complement",
    description: "Invert color or get complementary hue.",
    code: `@use "sass:color";

$primary: #3498db;

.inverted    { color: color.invert($primary); }
.complementary { color: color.complement($primary); }`,
  },
  {
    title: "color.change",
    description: "Replace specific channel with exact value.",
    code: `@use "sass:color";

$base: #3498db;

// change sets absolute value (vs adjust which is relative)
.semi-transparent { color: color.change($base, $alpha: 0.5); }
.red-shifted      { color: color.change($base, $hue: 0deg); }`,
  },
  {
    title: "color.hue / saturation / lightness / alpha",
    description: "Extract individual color channels.",
    code: `@use "sass:color";

$brand: hsl(204, 70%, 53%);

$h: color.hue($brand);        // 204deg
$s: color.saturation($brand); // 70%
$l: color.lightness($brand);  // 53%
$a: color.alpha($brand);      // 1

@debug "h=#{$h} s=#{$s} l=#{$l} a=#{$a}";`,
  },

  // 11. Built-in string module
  {
    title: "string.quote / string.unquote",
    description: "Add or remove quotes from strings.",
    code: `@use "sass:string";

$unquoted: string.quote(hello);       // "hello"
$quoted:   string.unquote("world");   // world

.after::content {
  content: string.quote(open);
}`,
  },
  {
    title: "string.length / string.slice",
    description: "Get string length or extract substring.",
    code: `@use "sass:string";

$str: "Helvetica Neue";

$len: string.length($str);             // 14
$sub: string.slice($str, 1, 9);       // "Helvetica"
$end: string.slice($str, -4);         // "Neue"

@debug "Length: #{$len}, Sub: #{$sub}";`,
  },
  {
    title: "string.insert / string.index",
    description: "Insert into or find position in string.",
    code: `@use "sass:string";

$str: "Hello World";

$with-comma: string.insert($str, ",", 6);  // "Hello, World"
$pos:        string.index($str, "World");   // 7

@debug "Position of 'World': #{$pos}";`,
  },
  {
    title: "string.to-upper-case / to-lower-case",
    description: "Change string case.",
    code: `@use "sass:string";

$name: "sAsS";

$upper: string.to-upper-case($name);  // "SASS"
$lower: string.to-lower-case($name);  // "sass"

@debug "#{$upper} / #{$lower}";`,
  },

  // 12. Built-in list module
  {
    title: "list.append / list.join",
    description: "Add items or combine two lists.",
    code: `@use "sass:list";

$base:  1px solid;
$extra: red;

$border: list.append($base, $extra);    // 1px solid red

$a: 10px 20px;
$b: 30px 40px;
$combined: list.join($a, $b);           // 10px 20px 30px 40px`,
  },
  {
    title: "list.index / list.length / list.nth",
    description: "Find, count, and access list items.",
    code: `@use "sass:list";

$colors: red, green, blue, yellow;

$len:   list.length($colors);        // 4
$pos:   list.index($colors, blue);   // 3
$third: list.nth($colors, 3);        // blue

@debug "#{$len} colors; blue is ##{$pos}: #{$third}";`,
  },
  {
    title: "list.set-nth / list.zip",
    description: "Replace item or zip multiple lists.",
    code: `@use "sass:list";

$sizes: sm, md, lg;
$vals:  8px, 16px, 24px;

$updated: list.set-nth($sizes, 2, xl);  // sm, xl, lg
$zipped:  list.zip($sizes, $vals);
// ((sm, 8px), (md, 16px), (lg, 24px))

@debug $zipped;`,
  },
  {
    title: "list.separator",
    description: "Check the separator of a list.",
    code: `@use "sass:list";

$comma-list: red, green, blue;
$space-list: 10px 20px 30px;

$s1: list.separator($comma-list);  // comma
$s2: list.separator($space-list);  // space

@debug "#{$s1} / #{$s2}";`,
  },

  // 13. Built-in map module
  {
    title: "map.get / map.has-key",
    description: "Retrieve value or check key existence.",
    code: `@use "sass:map";

$palette: (
  "blue":  #3498db,
  "green": #2ecc71,
  "red":   #e74c3c,
);

$blue:    map.get($palette, "blue");      // #3498db
$has-red: map.has-key($palette, "red");  // true
$missing: map.has-key($palette, "pink"); // false

@debug $blue;`,
  },
  {
    title: "map.set / map.merge",
    description: "Add keys or merge two maps.",
    code: `@use "sass:map";

$defaults: ("size": 16px, "weight": 400);
$overrides: ("weight": 700, "style": italic);

$merged: map.merge($defaults, $overrides);
// (size: 16px, weight: 700, style: italic)

$updated: map.set($merged, "color", red);

@debug $merged;`,
  },
  {
    title: "map.keys / map.values / map.remove",
    description: "Extract keys, values, or delete a key.",
    code: `@use "sass:map";

$spacing: ("xs": 4px, "sm": 8px, "md": 16px, "lg": 32px);

$keys:    map.keys($spacing);    // xs, sm, md, lg
$values:  map.values($spacing);  // 4px, 8px, 16px, 32px
$trimmed: map.remove($spacing, "xs", "lg");

@debug $keys;
@debug $values;`,
  },
  {
    title: "map.deep-get",
    description: "Access deeply nested map values.",
    code: `@use "sass:map";

$config: (
  "colors": (
    "primary": (
      "base":  #3498db,
      "light": #5dade2,
      "dark":  #2980b9,
    ),
  ),
);

$primary-dark: map.deep-get($config, "colors", "primary", "dark");
@debug $primary-dark; // #2980b9`,
  },

  // 14. Built-in meta module
  {
    title: "meta.type-of / meta.inspect",
    description: "Check type or inspect any value.",
    code: `@use "sass:meta";

@debug meta.type-of(1px);        // number
@debug meta.type-of("hello");    // string
@debug meta.type-of(red);        // color
@debug meta.type-of(true);       // bool
@debug meta.type-of(null);       // null
@debug meta.type-of((1, 2, 3));  // list

$map: ("a": 1);
@debug meta.type-of($map);       // map
@debug meta.inspect($map);       // ("a": 1)`,
  },
  {
    title: "meta.feature-exists",
    description: "Check if a Sass feature is available.",
    code: `@use "sass:meta";

@if meta.feature-exists("at-error") {
  @debug "Supports @error";
}

@if meta.feature-exists("custom-property") {
  @debug "Supports CSS custom properties";
}`,
  },
  {
    title: "meta.mixin-exists / meta.function-exists",
    description: "Check if mixin or function is defined.",
    code: `@use "sass:meta";

@mixin my-mixin { color: red; }
@function my-fn() { @return 1; }

@debug meta.mixin-exists("my-mixin");    // true
@debug meta.mixin-exists("missing");     // false
@debug meta.function-exists("my-fn");    // true
@debug meta.function-exists("math.div"); // true (with namespace)`,
  },
  {
    title: "meta.get-function / meta.call",
    description: "Store and invoke functions dynamically.",
    code: `@use "sass:meta";
@use "sass:math";

@function double($n) { @return $n * 2; }

$fn: meta.get-function("double");
$result: meta.call($fn, 5); // 10

@function apply($fn, $value) {
  @return meta.call($fn, $value);
}

@debug apply(meta.get-function("double"), 8); // 16`,
  },

  // 15. @if / @else if / @else
  {
    title: "@if / @else Conditional",
    description: "Branch logic in mixins and functions.",
    code: `@mixin theme-colors($theme: light) {
  @if $theme == light {
    background: #fff;
    color: #333;
  } @else if $theme == dark {
    background: #1a1a2e;
    color: #eee;
  } @else {
    @error "Unknown theme: #{$theme}";
  }
}

.light { @include theme-colors(light); }
.dark  { @include theme-colors(dark); }`,
  },
  {
    title: "Comparison Operators",
    description: "Use ==, !=, <, >, <=, >= in conditionals.",
    code: `@function badge-color($count) {
  @if $count == 0 {
    @return #999;
  } @else if $count < 10 {
    @return #2ecc71;
  } @else if $count < 100 {
    @return #f39c12;
  } @else {
    @return #e74c3c;
  }
}

.badge { background: badge-color(99); }`,
  },
  {
    title: "Logical Operators and/or/not",
    description: "Combine conditions with logic operators.",
    code: `@mixin focus-visible($outline: true, $offset: 2px) {
  @if $outline and $offset > 0 {
    &:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: $offset;
    }
  }

  @if not $outline {
    &:focus { outline: none; }
  }
}`,
  },

  // 16. @for loop
  {
    title: "@for from/through Loop",
    description: "Inclusive loop generating classes.",
    code: `@for $i from 1 through 6 {
  .col-#{$i} {
    width: math.div(100%, 12) * $i;
  }
}
// Outputs .col-1 through .col-6`,
  },
  {
    title: "@for from/to Loop",
    description: "Exclusive loop (stops before end).",
    code: `@use "sass:math";

@for $i from 1 to 5 {
  .mt-#{$i} { margin-top: $i * 4px; }
}
// Outputs .mt-1, .mt-2, .mt-3, .mt-4 (not .mt-5)`,
  },

  // 17. @each loop
  {
    title: "@each over List",
    description: "Iterate over a list of values.",
    code: `$sizes: xs, sm, md, lg, xl;
$scale: 0.75rem, 0.875rem, 1rem, 1.125rem, 1.25rem;

$i: 1;
@each $name in $sizes {
  .text-#{$name} {
    font-size: list.nth($scale, $i);
  }
  $i: $i + 1;
}`,
  },
  {
    title: "@each over Map",
    description: "Iterate key-value pairs in a map.",
    code: `@use "sass:map";

$colors: (
  "primary":   #3498db,
  "secondary": #2ecc71,
  "danger":    #e74c3c,
);

@each $name, $value in $colors {
  .text-#{$name} { color: $value; }
  .bg-#{$name}   { background-color: $value; }
  .border-#{$name} { border-color: $value; }
}`,
  },
  {
    title: "@each Multiple Assignment",
    description: "Destructure list items in @each.",
    code: `$icons: (
  (home,    "\f015"),
  (user,    "\f007"),
  (search,  "\f002"),
  (heart,   "\f004"),
);

@each $name, $code in $icons {
  .icon-#{$name}::before {
    content: $code;
  }
}`,
  },

  // 18. @while loop
  {
    title: "@while Loop",
    description: "Loop while condition is true.",
    code: `$i: 1;
$max: 8;

@while $i <= $max {
  .opacity-#{$i * 10} {
    opacity: math.div($i, $max);
  }
  $i: $i + 1;
}
// .opacity-10 { opacity: 0.125 } ... .opacity-80 { opacity: 1 }`,
  },

  // 19. @use
  {
    title: "@use with Namespace",
    description: "Import module under a namespace.",
    code: `@use "sass:math";
@use "sass:color";
@use "./tokens" as t;

.box {
  width: math.div(100%, 3);
  background: color.adjust(t.$primary, $lightness: 10%);
}`,
  },
  {
    title: "@use with as *",
    description: "Import all members without namespace.",
    code: `@use "sass:math" as *;
@use "./mixins" as *;

.element {
  width: div(100%, 4);  // no math. prefix
  @include flex-center; // no namespace
}`,
  },
  {
    title: "@use with show/hide",
    description: "Expose or hide specific module members.",
    code: `@use "./tokens" show $primary, $secondary, spacing;
@use "./helpers" hide debug-only, internal-mixin;

.button {
  background: $primary;
  padding: spacing(2);
}`,
  },
  {
    title: "@use with Configuration",
    description: "Override !default variables on import.",
    code: `// _theme.scss
$primary: #3498db !default;
$radius:  4px !default;

// main.scss
@use "./theme" with (
  $primary: #9b59b6,
  $radius: 8px
);

.btn {
  background: theme.$primary;
  border-radius: theme.$radius;
}`,
  },

  // 20. @forward
  {
    title: "@forward Module",
    description: "Re-export a module through another.",
    code: `// _index.scss — barrel file
@forward "./variables";
@forward "./mixins";
@forward "./functions";

// consumer
@use "./styles" as s;

.element {
  color: s.$primary;
  @include s.flex-center;
}`,
  },
  {
    title: "@forward with show/hide",
    description: "Control which members are forwarded.",
    code: `// _public.scss
@forward "./internals" show $public-var, public-mixin;
@forward "./utilities" hide -internal-fn;`,
  },
  {
    title: "@forward with prefix",
    description: "Add a prefix to forwarded members.",
    code: `// _button.scss
@forward "./base" as btn-*;

// Now consumers access:
// btn-$color, btn-radius, btn-padding, @include btn-hover etc.

// consumer:
@use "./button";
.el { color: button.btn-$color; }`,
  },

  // 21. Partials and file structure
  {
    title: "Partial File Convention",
    description: "Underscore prefix prevents direct compilation.",
    code: `// File: src/styles/_variables.scss
// Prefix with _ → not compiled to CSS directly

$primary:    #3498db;
$secondary:  #2ecc71;
$font-base:  16px;
$line-height: 1.5;

// Import with @use (omit underscore and extension):
// @use "./variables";`,
  },
  {
    title: "Sass Project Structure",
    description: "Organize files into logical partials.",
    code: `// Recommended structure:
// styles/
// ├── main.scss           ← entry point
// ├── _variables.scss
// ├── _mixins.scss
// ├── _functions.scss
// ├── _reset.scss
// ├── _typography.scss
// ├── _layout.scss
// └── components/
//     ├── _button.scss
//     ├── _card.scss
//     └── _modal.scss

// main.scss:
@use "variables";
@use "mixins";
@use "reset";
@use "typography";
@use "components/button";`,
  },
  {
    title: "Index Barrel File",
    description: "Single entry point for a folder.",
    code: `// components/_index.scss
@forward "./button";
@forward "./card";
@forward "./modal";
@forward "./form";
@forward "./nav";

// Consumer only needs one @use:
@use "./components";

.page {
  @include components.card-shadow;
}`,
  },

  // 22. @at-root
  {
    title: "@at-root Escape",
    description: "Emit selector at document root.",
    code: `.component {
  $name: "tooltip";

  // Without @at-root: .component .component__tip
  // With @at-root:    .component__tip
  @at-root .#{$name}__tip {
    position: absolute;
    background: #333;
    color: #fff;
  }
}`,
  },
  {
    title: "@at-root with BEM",
    description: "Use @at-root for BEM modifier classes.",
    code: `.block {
  display: block;

  &__element {
    color: red;

    @at-root .block--modifier & {
      color: blue; // .block--modifier .block__element
    }
  }
}`,
  },

  // 23. @warn, @error, @debug
  {
    title: "@warn Soft Warning",
    description: "Emit warning without stopping compilation.",
    code: `@mixin deprecated-mixin($arg) {
  @warn "deprecated-mixin() is deprecated. Use new-mixin() instead.";
  color: $arg;
}

@mixin validate-color($color) {
  @if meta.type-of($color) != color {
    @warn "Expected a color value, got: #{$color}";
  }
}`,
  },
  {
    title: "@error Hard Stop",
    description: "Stop compilation with an error message.",
    code: `@function divide($a, $b) {
  @if $b == 0 {
    @error "divide(): Cannot divide by zero.";
  }
  @return math.div($a, $b);
}

@mixin require-color($value) {
  @if meta.type-of($value) != color {
    @error "Expected a color, got #{meta.type-of($value)}: #{$value}";
  }
}`,
  },
  {
    title: "@debug Inspection",
    description: "Print debug info during compilation.",
    code: `$palette: ("primary": #3498db, "secondary": #2ecc71);

@debug $palette;
@debug map.keys($palette);
@debug meta.type-of($palette);
@debug "Primary is: #{map.get($palette, 'primary')}";
// Output appears in terminal during sass compilation`,
  },

  // 24. CSS custom properties with Sass
  {
    title: "CSS Custom Props + Sass Vars",
    description: "Bridge CSS variables and Sass variables.",
    code: `$primary: #3498db;
$secondary: #2ecc71;

:root {
  --color-primary:   #{$primary};
  --color-secondary: #{$secondary};
  --font-size-base:  16px;
  --spacing-unit:    8px;
}

.button {
  // Can use either:
  background: $primary;             // Sass (static)
  background: var(--color-primary); // CSS var (dynamic)
}`,
  },
  {
    title: "Dynamic CSS Custom Props",
    description: "Generate custom properties from Sass maps.",
    code: `$colors: (
  "primary":   #3498db,
  "secondary": #2ecc71,
  "accent":    #9b59b6,
  "danger":    #e74c3c,
);

:root {
  @each $name, $value in $colors {
    --color-#{$name}: #{$value};
    --color-#{$name}-rgb: #{red($value)}, #{green($value)}, #{blue($value)};
  }
}`,
  },

  // 25. Generating utility classes
  {
    title: "Spacing Utilities Loop",
    description: "Generate margin/padding utility classes.",
    code: `$spacers: (0: 0, 1: 4px, 2: 8px, 3: 16px, 4: 24px, 5: 32px, 6: 48px);
$sides: (t: top, r: right, b: bottom, l: left);

@each $scale, $value in $spacers {
  .m-#{$scale} { margin: $value; }
  .p-#{$scale} { padding: $value; }

  @each $abbr, $side in $sides {
    .m#{$abbr}-#{$scale} { margin-#{$side}: $value; }
    .p#{$abbr}-#{$scale} { padding-#{$side}: $value; }
  }
}`,
  },
  {
    title: "Color Utility Classes",
    description: "Generate text and background color utilities.",
    code: `$colors: (
  "primary":   #3498db,
  "success":   #2ecc71,
  "danger":    #e74c3c,
  "warning":   #f39c12,
  "neutral":   #95a5a6,
);

@each $name, $color in $colors {
  .text-#{$name} {
    color: $color;
  }
  .bg-#{$name} {
    background-color: $color;
    color: if(lightness($color) > 55%, #333, #fff);
  }
}`,
  },
  {
    title: "Font Size Utilities",
    description: "Generate type scale utility classes.",
    code: `$type-scale: (
  "xs":   0.75rem,
  "sm":   0.875rem,
  "base": 1rem,
  "lg":   1.125rem,
  "xl":   1.25rem,
  "2xl":  1.5rem,
  "3xl":  1.875rem,
  "4xl":  2.25rem,
);

@each $name, $size in $type-scale {
  .text-#{$name} {
    font-size: $size;
  }
}`,
  },

  // 26. Common mixins
  {
    title: "Responsive Breakpoints Mixin",
    description: "Media query mixin for responsive design.",
    code: `$breakpoints: (
  "xs": 0,
  "sm": 576px,
  "md": 768px,
  "lg": 992px,
  "xl": 1200px,
  "xxl": 1400px,
);

@mixin respond-up($bp) {
  $min: map.get($breakpoints, $bp);
  @if $min == 0 {
    @content;
  } @else {
    @media (min-width: $min) { @content; }
  }
}

@mixin respond-down($bp) {
  $max: map.get($breakpoints, $bp) - 0.02px;
  @media (max-width: $max) { @content; }
}

.container {
  padding: 1rem;
  @include respond-up("md") { padding: 2rem; }
  @include respond-up("xl") { padding: 3rem; }
}`,
  },
  {
    title: "Flexbox Center Mixin",
    description: "Center children using flexbox.",
    code: `@mixin flex-center($direction: row) {
  display: flex;
  flex-direction: $direction;
  align-items: center;
  justify-content: center;
}

@mixin flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hero    { @include flex-center(column); }
.navbar  { @include flex-between; }
.spinner { @include flex-center; }`,
  },
  {
    title: "Truncate Text Mixin",
    description: "Single or multi-line text truncation.",
    code: `@mixin truncate($width: 100%) {
  max-width: $width;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@mixin line-clamp($lines: 2) {
  display: -webkit-box;
  -webkit-line-clamp: $lines;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-title { @include truncate; }
.card-body  { @include line-clamp(3); }`,
  },
  {
    title: "Visually Hidden Mixin",
    description: "Hide visually, keep screen-reader accessible.",
    code: `@mixin visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@mixin visually-hidden-focusable {
  @include visually-hidden;

  &:active,
  &:focus {
    position: static;
    width: auto;
    height: auto;
    overflow: visible;
    clip: auto;
    white-space: normal;
  }
}

.sr-only          { @include visually-hidden; }
.sr-only-focusable { @include visually-hidden-focusable; }`,
  },
  {
    title: "Reset List Mixin",
    description: "Strip default list styles.",
    code: `@mixin reset-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

@mixin inline-list($gap: 1rem) {
  @include reset-list;
  display: flex;
  flex-wrap: wrap;
  gap: $gap;
}

nav ul { @include inline-list; }
.tags  { @include inline-list(0.5rem); }`,
  },
  {
    title: "Clearfix Mixin",
    description: "Clear floats with ::after pseudo-element.",
    code: `@mixin clearfix {
  &::after {
    content: "";
    display: table;
    clear: both;
  }
}

.float-layout {
  @include clearfix;

  .sidebar { float: left; width: 25%; }
  .main    { float: right; width: 75%; }
}`,
  },
  {
    title: "CSS Triangle Mixin",
    description: "Generate CSS-only triangle shapes.",
    code: `@mixin triangle($direction, $size, $color) {
  width: 0;
  height: 0;
  border-style: solid;

  @if $direction == up {
    border-width: 0 $size $size $size;
    border-color: transparent transparent $color transparent;
  } @else if $direction == down {
    border-width: $size $size 0 $size;
    border-color: $color transparent transparent transparent;
  } @else if $direction == left {
    border-width: $size $size $size 0;
    border-color: transparent $color transparent transparent;
  } @else if $direction == right {
    border-width: $size 0 $size $size;
    border-color: transparent transparent transparent $color;
  }
}

.arrow-down { @include triangle(down, 8px, #333); }`,
  },
  {
    title: "Absolute Center Mixin",
    description: "Center element absolutely within parent.",
    code: `@mixin absolute-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

@mixin absolute-fill {
  position: absolute;
  inset: 0; // top: 0; right: 0; bottom: 0; left: 0;
}

.modal-inner   { @include absolute-center; }
.overlay       { @include absolute-fill; }`,
  },

  // 27. Design token maps
  {
    title: "Spacing Scale Tokens",
    description: "Centralized spacing scale as a map.",
    code: `$spacing: (
  "0":    0,
  "px":   1px,
  "0.5":  0.125rem,
  "1":    0.25rem,
  "2":    0.5rem,
  "3":    0.75rem,
  "4":    1rem,
  "6":    1.5rem,
  "8":    2rem,
  "12":   3rem,
  "16":   4rem,
  "24":   6rem,
  "32":   8rem,
);

@function spacing($key) {
  @return map.get($spacing, "#{$key}");
}

.card { padding: spacing(4); margin-bottom: spacing(6); }`,
  },
  {
    title: "Type Scale Tokens",
    description: "Typography scale as structured tokens.",
    code: `$type: (
  "xs":   (size: 0.75rem,  line: 1rem),
  "sm":   (size: 0.875rem, line: 1.25rem),
  "base": (size: 1rem,     line: 1.5rem),
  "lg":   (size: 1.125rem, line: 1.75rem),
  "xl":   (size: 1.25rem,  line: 1.75rem),
  "2xl":  (size: 1.5rem,   line: 2rem),
  "3xl":  (size: 1.875rem, line: 2.25rem),
);

@each $name, $values in $type {
  .text-#{$name} {
    font-size: map.get($values, size);
    line-height: map.get($values, line);
  }
}`,
  },
  {
    title: "Color Palette Tokens",
    description: "Full color palette with shades.",
    code: `$blue: (
  "50":  #eff6ff,
  "100": #dbeafe,
  "200": #bfdbfe,
  "300": #93c5fd,
  "400": #60a5fa,
  "500": #3b82f6,
  "600": #2563eb,
  "700": #1d4ed8,
  "800": #1e40af,
  "900": #1e3a8a,
);

@function blue($shade) {
  @return map.get($blue, "#{$shade}");
}

.btn-primary {
  background: blue(600);
  &:hover { background: blue(700); }
}`,
  },
  {
    title: "Z-Index Scale Tokens",
    description: "Named z-index layers for consistency.",
    code: `$z-index: (
  "negative":  -1,
  "base":       0,
  "raised":    10,
  "dropdown":  100,
  "sticky":    200,
  "overlay":   300,
  "modal":     400,
  "popover":   500,
  "toast":     600,
  "tooltip":   700,
);

@function z($layer) {
  @return map.get($z-index, $layer);
}

.dropdown { z-index: z("dropdown"); }
.modal    { z-index: z("modal"); }
.toast    { z-index: z("toast"); }`,
  },
  {
    title: "Breakpoint Tokens",
    description: "Centralized breakpoint map.",
    code: `$screen: (
  "sm":  576px,
  "md":  768px,
  "lg":  992px,
  "xl":  1200px,
  "xxl": 1400px,
);

@function screen($size) {
  @return map.get($screen, $size);
}

@mixin sm  { @media (min-width: screen("sm"))  { @content; } }
@mixin md  { @media (min-width: screen("md"))  { @content; } }
@mixin lg  { @media (min-width: screen("lg"))  { @content; } }
@mixin xl  { @media (min-width: screen("xl"))  { @content; } }`,
  },

  // 28. BEM methodology
  {
    title: "BEM Block Definition",
    description: "Define a complete BEM component.",
    code: `.nav {
  display: flex;
  background: #333;

  &__list {
    @include reset-list;
    display: flex;
  }

  &__item {
    position: relative;
  }

  &__link {
    display: block;
    padding: 0.75rem 1rem;
    color: #fff;
    text-decoration: none;

    &:hover { background: rgba(255,255,255,0.1); }
  }

  &--dark  { background: #000; }
  &--light { background: #f8f9fa; .nav__link { color: #333; } }
}`,
  },
  {
    title: "BEM State Modifiers",
    description: "BEM modifiers for interactive states.",
    code: `.button {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;

  &--primary   { background: $primary; color: #fff; }
  &--secondary { background: transparent; border: 1px solid $primary; }
  &--large     { padding: 0.75rem 1.5rem; font-size: 1.125rem; }
  &--small     { padding: 0.25rem 0.75rem; font-size: 0.875rem; }
  &--loading   { opacity: 0.7; pointer-events: none; }
  &--disabled  { opacity: 0.4; cursor: not-allowed; pointer-events: none; }
}`,
  },
  {
    title: "BEM Mix Pattern",
    description: "Apply multiple BEM blocks to one element.",
    code: `// BEM Mix: element belongs to two blocks
// <div class="page__sidebar sidebar sidebar--dark">

.sidebar {
  width: 280px;
  padding: 1.5rem;

  &--dark {
    background: #1a1a2e;
    color: #eee;
  }
}

.page {
  &__sidebar {
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
  }
}`,
  },

  // 29. Component architecture
  {
    title: "Component File Pattern",
    description: "Self-contained component partial example.",
    code: `// components/_card.scss
@use "../tokens" as t;
@use "../mixins" as m;

$card-padding:  t.spacing(4) !default;
$card-radius:   t.radius("md") !default;
$card-shadow:   t.$shadow-sm !default;
$card-bg:       t.$surface !default;

.card {
  padding: $card-padding;
  border-radius: $card-radius;
  box-shadow: $card-shadow;
  background: $card-bg;

  &__header  { font-weight: 600; margin-bottom: t.spacing(2); }
  &__body    { color: t.$text-secondary; }
  &__footer  { border-top: 1px solid t.$border; padding-top: t.spacing(3); }
  &--elevated { box-shadow: t.$shadow-lg; }
}`,
  },
  {
    title: "Theming with @use Config",
    description: "Configure component defaults per theme.",
    code: `// _button.scss
@use "sass:color";

$bg:     #3498db !default;
$color:  #fff !default;
$radius: 4px !default;
$padding: 0.5rem 1rem !default;

.btn {
  background: $bg;
  color: $color;
  border-radius: $radius;
  padding: $padding;
  border: none;
  cursor: pointer;

  &:hover {
    background: color.adjust($bg, $lightness: -10%);
  }
}

// consumer:
// @use "./button" with ($bg: #9b59b6, $radius: 9999px);`,
  },

  // 30. Module system migration
  {
    title: "@import Legacy Syntax",
    description: "Old @import — avoid in new code.",
    code: `// LEGACY — @import (deprecated):
@import "variables";
@import "mixins";
@import "components/button";

// Problems:
// - All members are global (namespace collisions)
// - File compiled every time it's @imported
// - No way to configure defaults`,
  },
  {
    title: "Migrating @import to @use",
    description: "Replace @import with @use and @forward.",
    code: `// BEFORE (legacy):
// @import "sass:color";
// @import "variables";
// color: darken($primary, 10%);

// AFTER (modern):
@use "sass:color";
@use "./variables" as v;

.element {
  color: color.adjust(v.$primary, $lightness: -10%);
}

// Key differences:
// - Namespace required (v.$primary)
// - darken() → color.adjust()
// - Each file compiled once`,
  },
  {
    title: "Migration Barrel Index",
    description: "Collect partials for single-import migration.",
    code: `// styles/_index.scss
// Forward everything — acts like the old main import

@forward "./tokens/colors";
@forward "./tokens/spacing";
@forward "./tokens/typography";
@forward "./mixins/layout";
@forward "./mixins/responsive";
@forward "./mixins/typography";

// consumers:
@use "./styles";

.component {
  color: styles.$primary;
  @include styles.flex-center;
}`,
  },

  // Additional commonly-used patterns
  {
    title: "Mixin with @content Args",
    description: "Pass arguments into @content block (Sass 1.15+).",
    code: `@mixin apply-to($selector) {
  @at-root #{$selector} {
    @content;
  }
}

@mixin hover-dark {
  @media (hover: hover) {
    &:hover {
      @content;
    }
  }
}

.link {
  color: $primary;
  @include hover-dark { color: darken($primary, 20%); }
}`,
  },
  {
    title: "Each with Nested Maps",
    description: "Iterate nested map structures.",
    code: `$components: (
  "button":  ("radius": 4px,   "padding": 0.5rem 1rem),
  "card":    ("radius": 8px,   "padding": 1.5rem),
  "badge":   ("radius": 9999px, "padding": 0.2rem 0.6rem),
);

@each $name, $props in $components {
  .#{$name} {
    border-radius: map.get($props, "radius");
    padding: map.get($props, "padding");
  }
}`,
  },
  {
    title: "Sass Operator Precedence",
    description: "Arithmetic operators in SCSS.",
    code: `@use "sass:math";

$a: 10px;
$b: 3;

// Addition / subtraction (same unit or compatible)
.a { margin: $a + 5px; }   // 15px
.b { margin: $a - 2px; }   // 8px

// Multiplication / division
.c { width: $a * $b; }              // 30px
.d { width: math.div($a, 2); }      // 5px

// Percentage
.e { width: math.div(6, 12) * 100%; } // 50%`,
  },
  {
    title: "Dynamic Property with Mixin",
    description: "Generate properties via mixin loop.",
    code: `@mixin generate-columns($count: 12) {
  @for $i from 1 through $count {
    .col-#{$i} {
      flex: 0 0 math.div(100%, $count) * $i;
      max-width: math.div(100%, $count) * $i;
    }
  }
}

.row {
  display: flex;
  flex-wrap: wrap;
  @include generate-columns(12);
}`,
  },
  {
    title: "Placeholder Extend Pattern",
    description: "Share button base via placeholder.",
    code: `%btn-base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.2s, color 0.2s;

  &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.btn-primary   { @extend %btn-base; background: $primary; color: #fff; }
.btn-secondary { @extend %btn-base; background: #eee; color: #333; }
.btn-danger    { @extend %btn-base; background: $danger; color: #fff; }`,
  },
  {
    title: "Responsive Typography Mixin",
    description: "Fluid font sizing with clamp().",
    code: `@use "sass:math";

@function fluid-size($min-px, $max-px, $min-vw: 375, $max-vw: 1280) {
  $slope: math.div($max-px - $min-px, $max-vw - $min-vw);
  $intercept: $min-px - ($slope * $min-vw);
  @return clamp(
    #{$min-px}px,
    #{$intercept}px + #{$slope * 100}vw,
    #{$max-px}px
  );
}

h1 { font-size: fluid-size(28, 56); }
h2 { font-size: fluid-size(22, 40); }
p  { font-size: fluid-size(16, 18); }`,
  },
  {
    title: "Color Scheme Mixin",
    description: "Dark/light mode via prefers-color-scheme.",
    code: `@mixin dark-mode {
  @media (prefers-color-scheme: dark) { @content; }
}

@mixin light-mode {
  @media (prefers-color-scheme: light) { @content; }
}

:root {
  --bg: #ffffff;
  --text: #1a1a1a;

  @include dark-mode {
    --bg: #1a1a2e;
    --text: #e8e8e8;
  }
}

body {
  background: var(--bg);
  color: var(--text);
}`,
  },
  {
    title: "Aspect Ratio Mixin",
    description: "Maintain aspect ratio with padding trick.",
    code: `@use "sass:math";

@mixin aspect-ratio($width, $height) {
  position: relative;

  &::before {
    content: "";
    display: block;
    padding-top: math.div($height, $width) * 100%;
  }

  > * {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.video-embed { @include aspect-ratio(16, 9); }
.square      { @include aspect-ratio(1, 1); }`,
  },
  {
    title: "Font-face Mixin",
    description: "Simplify @font-face declarations.",
    code: `@mixin font-face($name, $path, $weight: 400, $style: normal) {
  @font-face {
    font-family: $name;
    font-weight: $weight;
    font-style: $style;
    font-display: swap;
    src:
      url("#{$path}.woff2") format("woff2"),
      url("#{$path}.woff")  format("woff");
  }
}

@include font-face("Inter", "/fonts/inter/regular");
@include font-face("Inter", "/fonts/inter/bold", 700);
@include font-face("Inter", "/fonts/inter/italic", 400, italic);`,
  },
  {
    title: "Grid Layout Mixin",
    description: "CSS Grid shorthand mixin.",
    code: `@mixin grid($columns: 1, $gap: 1rem) {
  display: grid;
  grid-template-columns: repeat($columns, 1fr);
  gap: $gap;
}

@mixin auto-grid($min-width: 250px, $gap: 1rem) {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax($min-width, 1fr));
  gap: $gap;
}

.three-col { @include grid(3, 1.5rem); }
.card-grid { @include auto-grid(280px, 1rem); }`,
  },
  {
    title: "Scrollbar Styling Mixin",
    description: "Cross-browser custom scrollbar styles.",
    code: `@mixin custom-scrollbar($width: 8px, $track: #f1f1f1, $thumb: #888) {
  scrollbar-width: thin;
  scrollbar-color: $thumb $track;

  &::-webkit-scrollbar {
    width: $width;
  }
  &::-webkit-scrollbar-track {
    background: $track;
  }
  &::-webkit-scrollbar-thumb {
    background: $thumb;
    border-radius: math.div($width, 2);

    &:hover { background: darken($thumb, 15%); }
  }
}

.sidebar { @include custom-scrollbar; }
.code-block { @include custom-scrollbar(6px, #2d2d2d, #666); }`,
  },
  {
    title: "Focus Ring Mixin",
    description: "Accessible focus indicator mixin.",
    code: `@mixin focus-ring($color: $primary, $offset: 2px, $width: 2px) {
  &:focus-visible {
    outline: $width solid $color;
    outline-offset: $offset;
    border-radius: inherit;
  }

  &:focus:not(:focus-visible) {
    outline: none;
  }
}

button { @include focus-ring; }
a      { @include focus-ring($offset: 3px); }
input  { @include focus-ring($color: $secondary); }`,
  },
  {
    title: "Sass Maps as Config",
    description: "Use maps for component configuration.",
    code: `$button-variants: (
  "primary":   ($primary,   #fff),
  "secondary": (#eee,       #333),
  "success":   (#2ecc71,   #fff),
  "danger":    (#e74c3c,   #fff),
);

@each $variant, $values in $button-variants {
  $bg:    list.nth($values, 1);
  $color: list.nth($values, 2);

  .btn-#{$variant} {
    background: $bg;
    color: $color;

    &:hover { background: color.adjust($bg, $lightness: -8%); }
  }
}`,
  },
  {
    title: "Animation Keyframe Mixin",
    description: "Mixin generating named keyframe animations.",
    code: `@mixin keyframes($name) {
  @keyframes #{$name} {
    @content;
  }
}

@mixin animate($name, $duration: 0.3s, $easing: ease, $fill: both) {
  animation: $name $duration $easing $fill;
}

@include keyframes(fade-in) {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.modal { @include animate(fade-in, 0.25s, ease-out); }`,
  },
  {
    title: "Nested Map Merge",
    description: "Deep-merge two nested Sass maps.",
    code: `@use "sass:map";

@function deep-merge($map1, $map2) {
  $result: $map1;

  @each $key, $value in $map2 {
    @if map.has-key($result, $key) and
        meta.type-of(map.get($result, $key)) == map and
        meta.type-of($value) == map {
      $result: map.set($result, $key, deep-merge(map.get($result, $key), $value));
    } @else {
      $result: map.set($result, $key, $value);
    }
  }

  @return $result;
}`,
  },
  {
    title: "Sass List to CSS Value",
    description: "Convert Sass list to a CSS string.",
    code: `@use "sass:list";
@use "sass:string";

// Build a transition string from a list of properties
$props: color, background-color, transform;
$duration: 0.2s;
$easing: ease;

$transitions: ();
@each $prop in $props {
  $transitions: list.append(
    $transitions,
    $prop $duration $easing,
    comma
  );
}

.animated { transition: $transitions; }`,
  },
];
