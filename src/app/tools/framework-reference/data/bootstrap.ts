import type { Entry } from "../types";

export const bootstrapEntries: Entry[] = [
  // ── Grid System ──────────────────────────────────────────────────────────────
  {
    title: "Container",
    description: "Fixed-width responsive container.",
    code: `<div class="container">
  <!-- content -->
</div>`,
  },
  {
    title: "Container Fluid",
    description: "Full-width container spanning the viewport.",
    code: `<div class="container-fluid">
  <!-- content -->
</div>`,
  },
  {
    title: "Responsive Container",
    description: "Container fluid up to a breakpoint.",
    code: `<div class="container-md">
  <!-- fluid below md, fixed at md and above -->
</div>`,
  },
  {
    title: "Basic Row & Cols",
    description: "Equal-width columns in a row.",
    code: `<div class="container">
  <div class="row">
    <div class="col">Column 1</div>
    <div class="col">Column 2</div>
    <div class="col">Column 3</div>
  </div>
</div>`,
  },
  {
    title: "Sized Columns",
    description: "Explicit column widths out of 12.",
    code: `<div class="container">
  <div class="row">
    <div class="col-8">Main (8)</div>
    <div class="col-4">Sidebar (4)</div>
  </div>
</div>`,
  },
  {
    title: "Responsive Columns",
    description: "Stacked on mobile, side-by-side on md+.",
    code: `<div class="container">
  <div class="row">
    <div class="col-12 col-md-6">Left</div>
    <div class="col-12 col-md-6">Right</div>
  </div>
</div>`,
  },
  {
    title: "Auto-Width Column",
    description: "Column sized to its content.",
    code: `<div class="row">
  <div class="col">Fill</div>
  <div class="col-auto">Auto</div>
  <div class="col">Fill</div>
</div>`,
  },
  {
    title: "Column Offset",
    description: "Push a column with offset-*.",
    code: `<div class="row">
  <div class="col-md-4 offset-md-4">Centered column</div>
</div>`,
  },
  {
    title: "Column Order",
    description: "Reorder columns visually.",
    code: `<div class="row">
  <div class="col order-3">First in DOM, last visually</div>
  <div class="col order-1">Second in DOM, first visually</div>
  <div class="col order-2">Third in DOM, second visually</div>
</div>`,
  },
  {
    title: "Gutter Spacing",
    description: "Control gap between columns with g-*.",
    code: `<div class="row g-3">
  <div class="col-6"><div class="p-3 bg-light border">Col</div></div>
  <div class="col-6"><div class="p-3 bg-light border">Col</div></div>
  <div class="col-6"><div class="p-3 bg-light border">Col</div></div>
  <div class="col-6"><div class="p-3 bg-light border">Col</div></div>
</div>`,
  },
  {
    title: "Horizontal Gutters",
    description: "Gutter on x-axis only with gx-*.",
    code: `<div class="row gx-5">
  <div class="col">Col 1</div>
  <div class="col">Col 2</div>
</div>`,
  },
  {
    title: "Vertical Gutters",
    description: "Gutter on y-axis only with gy-*.",
    code: `<div class="row gy-4">
  <div class="col-6">Col 1</div>
  <div class="col-6">Col 2</div>
  <div class="col-6">Col 3</div>
  <div class="col-6">Col 4</div>
</div>`,
  },

  // ── Flexbox Utilities ─────────────────────────────────────────────────────────
  {
    title: "Flex Container",
    description: "Enable flexbox on an element.",
    code: `<div class="d-flex">
  <div class="p-2">Item 1</div>
  <div class="p-2">Item 2</div>
  <div class="p-2">Item 3</div>
</div>`,
  },
  {
    title: "Flex Direction",
    description: "Row or column flex direction.",
    code: `<!-- Row (default) -->
<div class="d-flex flex-row">
  <div class="p-2">Item 1</div>
  <div class="p-2">Item 2</div>
</div>

<!-- Column -->
<div class="d-flex flex-column">
  <div class="p-2">Item 1</div>
  <div class="p-2">Item 2</div>
</div>`,
  },
  {
    title: "Flex Wrap",
    description: "Allow flex items to wrap.",
    code: `<div class="d-flex flex-wrap">
  <div class="p-2">Item 1</div>
  <div class="p-2">Item 2</div>
  <div class="p-2">Item 3</div>
</div>`,
  },
  {
    title: "Justify Content",
    description: "Align flex items along main axis.",
    code: `<div class="d-flex justify-content-between">
  <div>Left</div>
  <div>Center</div>
  <div>Right</div>
</div>

<!-- Other values: start | end | center | around | evenly -->`,
  },
  {
    title: "Align Items",
    description: "Align flex items on cross axis.",
    code: `<div class="d-flex align-items-center" style="height:100px;">
  <div>Vertically centered</div>
</div>

<!-- Other values: start | end | center | baseline | stretch -->`,
  },
  {
    title: "Align Self",
    description: "Override alignment for a single item.",
    code: `<div class="d-flex" style="height:100px;">
  <div class="align-self-start">Top</div>
  <div class="align-self-center">Middle</div>
  <div class="align-self-end">Bottom</div>
</div>`,
  },
  {
    title: "Flex Grow",
    description: "Allow an item to grow to fill space.",
    code: `<div class="d-flex">
  <div class="flex-grow-1 p-2 bg-light border">Grows to fill</div>
  <div class="p-2 bg-light border">Fixed</div>
</div>`,
  },
  {
    title: "Gap Utilities",
    description: "Add gap between flex or grid items.",
    code: `<div class="d-flex gap-3">
  <div class="p-2 bg-light border">Item 1</div>
  <div class="p-2 bg-light border">Item 2</div>
  <div class="p-2 bg-light border">Item 3</div>
</div>`,
  },

  // ── Typography ────────────────────────────────────────────────────────────────
  {
    title: "Heading Classes",
    description: "Apply heading styles without semantic tags.",
    code: `<p class="h1">h1. Bootstrap heading</p>
<p class="h2">h2. Bootstrap heading</p>
<p class="h3">h3. Bootstrap heading</p>
<p class="h4">h4. Bootstrap heading</p>
<p class="h5">h5. Bootstrap heading</p>
<p class="h6">h6. Bootstrap heading</p>`,
  },
  {
    title: "Display Headings",
    description: "Larger, attention-grabbing headings.",
    code: `<h1 class="display-1">Display 1</h1>
<h1 class="display-2">Display 2</h1>
<h1 class="display-3">Display 3</h1>
<h1 class="display-4">Display 4</h1>
<h1 class="display-5">Display 5</h1>
<h1 class="display-6">Display 6</h1>`,
  },
  {
    title: "Lead Text",
    description: "Stand-out introductory paragraph.",
    code: `<p class="lead">
  This is a lead paragraph. It stands out from regular paragraphs.
</p>`,
  },
  {
    title: "Blockquote",
    description: "Quote block with optional footer.",
    code: `<blockquote class="blockquote">
  <p>A well-known quote, contained in a blockquote element.</p>
  <footer class="blockquote-footer">
    Someone famous in <cite title="Source Title">Source Title</cite>
  </footer>
</blockquote>`,
  },
  {
    title: "Text Alignment",
    description: "Align text with responsive classes.",
    code: `<p class="text-start">Start aligned text.</p>
<p class="text-center">Center aligned text.</p>
<p class="text-end">End aligned text.</p>
<p class="text-md-center">Center on md+, start below.</p>`,
  },
  {
    title: "Font Weight & Style",
    description: "Control weight and italic styles.",
    code: `<p class="fw-bold">Bold text.</p>
<p class="fw-bolder">Bolder text.</p>
<p class="fw-semibold">Semibold text.</p>
<p class="fw-normal">Normal weight text.</p>
<p class="fw-light">Light weight text.</p>
<p class="fst-italic">Italic text.</p>
<p class="fst-normal">Normal style text.</p>`,
  },
  {
    title: "Font Size Utilities",
    description: "Scale text size with fs-* classes.",
    code: `<p class="fs-1">Font size 1 (largest)</p>
<p class="fs-2">Font size 2</p>
<p class="fs-3">Font size 3</p>
<p class="fs-4">Font size 4</p>
<p class="fs-5">Font size 5</p>
<p class="fs-6">Font size 6 (smallest)</p>`,
  },
  {
    title: "Text Truncate",
    description: "Truncate long text with an ellipsis.",
    code: `<p class="text-truncate" style="max-width:200px;">
  This text is very long and will be truncated with an ellipsis.
</p>`,
  },
  {
    title: "Text Break",
    description: "Force long words to break.",
    code: `<p class="text-break">
  Superlongwordthatwillbreakwhenneeded: mmmmmmmmmmmmmmmmmmmmmmmm
</p>`,
  },

  // ── Colors ────────────────────────────────────────────────────────────────────
  {
    title: "Text Colors",
    description: "Theme text color utilities.",
    code: `<p class="text-primary">Primary</p>
<p class="text-secondary">Secondary</p>
<p class="text-success">Success</p>
<p class="text-danger">Danger</p>
<p class="text-warning">Warning</p>
<p class="text-info">Info</p>
<p class="text-light bg-dark">Light</p>
<p class="text-dark">Dark</p>
<p class="text-muted">Muted</p>
<p class="text-body">Body (default)</p>`,
  },
  {
    title: "Background Colors",
    description: "Theme background color utilities.",
    code: `<div class="p-2 mb-1 bg-primary text-white">Primary</div>
<div class="p-2 mb-1 bg-secondary text-white">Secondary</div>
<div class="p-2 mb-1 bg-success text-white">Success</div>
<div class="p-2 mb-1 bg-danger text-white">Danger</div>
<div class="p-2 mb-1 bg-warning text-dark">Warning</div>
<div class="p-2 mb-1 bg-info text-dark">Info</div>
<div class="p-2 mb-1 bg-light text-dark">Light</div>
<div class="p-2 mb-1 bg-dark text-white">Dark</div>`,
  },
  {
    title: "Link Colors",
    description: "Colored link utilities with hover.",
    code: `<a href="#" class="link-primary">Primary link</a><br>
<a href="#" class="link-secondary">Secondary link</a><br>
<a href="#" class="link-success">Success link</a><br>
<a href="#" class="link-danger">Danger link</a><br>
<a href="#" class="link-warning">Warning link</a>`,
  },
  {
    title: "Background Subtle",
    description: "Lighter background tints (BS 5.3+).",
    code: `<div class="p-2 bg-primary-subtle text-primary-emphasis">Primary subtle</div>
<div class="p-2 bg-success-subtle text-success-emphasis">Success subtle</div>
<div class="p-2 bg-danger-subtle text-danger-emphasis">Danger subtle</div>`,
  },

  // ── Spacing Utilities ─────────────────────────────────────────────────────────
  {
    title: "Margin Utilities",
    description: "Add margin with m-* shorthand.",
    code: `<div class="m-0">No margin</div>
<div class="m-1">0.25rem margin</div>
<div class="m-2">0.5rem margin</div>
<div class="m-3">1rem margin</div>
<div class="m-4">1.5rem margin</div>
<div class="m-5">3rem margin</div>
<div class="mt-3">Margin top only</div>
<div class="mb-3">Margin bottom only</div>
<div class="ms-3">Margin start (left)</div>
<div class="me-3">Margin end (right)</div>`,
  },
  {
    title: "Padding Utilities",
    description: "Add padding with p-* shorthand.",
    code: `<div class="p-3 bg-light border">1rem padding all sides</div>
<div class="px-4 py-2 bg-light border">Axis-specific padding</div>
<div class="pt-5 bg-light border">3rem padding top</div>`,
  },
  {
    title: "Centering with mx-auto",
    description: "Horizontally center a block element.",
    code: `<div class="mx-auto bg-primary text-white p-3" style="width:200px;">
  Centered block
</div>`,
  },
  {
    title: "Negative Margin",
    description: "Pull elements with negative margin.",
    code: `<div class="mt-n3 bg-light border">Negative top margin</div>`,
  },

  // ── Navbar ────────────────────────────────────────────────────────────────────
  {
    title: "Basic Navbar",
    description: "Responsive collapsing navbar.",
    code: `<nav class="navbar navbar-expand-lg bg-body-tertiary">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">Brand</a>
    <button class="navbar-toggler" type="button"
            data-bs-toggle="collapse" data-bs-target="#navbarNav">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav">
        <li class="nav-item">
          <a class="nav-link active" href="#">Home</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">Features</a>
        </li>
        <li class="nav-item">
          <a class="nav-link disabled">Disabled</a>
        </li>
      </ul>
    </div>
  </div>
</nav>`,
  },
  {
    title: "Dark Navbar",
    description: "Navbar with dark color scheme.",
    code: `<nav class="navbar navbar-expand-lg" data-bs-theme="dark" style="background-color:#343a40;">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">Dark Nav</a>
    <div class="collapse navbar-collapse">
      <ul class="navbar-nav">
        <li class="nav-item"><a class="nav-link active" href="#">Home</a></li>
        <li class="nav-item"><a class="nav-link" href="#">About</a></li>
      </ul>
    </div>
  </div>
</nav>`,
  },
  {
    title: "Navbar with Dropdown",
    description: "Dropdown menu inside navbar.",
    code: `<nav class="navbar navbar-expand-lg bg-body-tertiary">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">Brand</a>
    <div class="collapse navbar-collapse">
      <ul class="navbar-nav">
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#"
             data-bs-toggle="dropdown">Dropdown</a>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="#">Action</a></li>
            <li><a class="dropdown-item" href="#">Another action</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#">Something else</a></li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</nav>`,
  },
  {
    title: "Fixed-Top Navbar",
    description: "Navbar fixed to top of viewport.",
    code: `<nav class="navbar navbar-expand-lg bg-dark fixed-top" data-bs-theme="dark">
  <div class="container">
    <a class="navbar-brand" href="#">Fixed Top</a>
  </div>
</nav>
<!-- Add padding-top to body to prevent content overlap -->
<div style="padding-top:56px;">Page content here.</div>`,
  },

  // ── Cards ─────────────────────────────────────────────────────────────────────
  {
    title: "Basic Card",
    description: "Card with header, body, and footer.",
    code: `<div class="card" style="width:18rem;">
  <div class="card-header">Header</div>
  <div class="card-body">
    <h5 class="card-title">Card Title</h5>
    <p class="card-text">Some quick example text for the card body.</p>
    <a href="#" class="btn btn-primary">Go somewhere</a>
  </div>
  <div class="card-footer text-muted">Footer</div>
</div>`,
  },
  {
    title: "Card with Image",
    description: "Card image on top with body below.",
    code: `<div class="card" style="width:18rem;">
  <img src="https://picsum.photos/300/150" class="card-img-top" alt="...">
  <div class="card-body">
    <h5 class="card-title">Card Title</h5>
    <p class="card-text">Some text inside the card body.</p>
    <a href="#" class="btn btn-primary">Go somewhere</a>
  </div>
</div>`,
  },
  {
    title: "Card Group",
    description: "Equal-height cards in a group.",
    code: `<div class="card-group">
  <div class="card">
    <div class="card-body">
      <h5 class="card-title">Card 1</h5>
      <p class="card-text">Content for the first card.</p>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title">Card 2</h5>
      <p class="card-text">More content here for the second card.</p>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title">Card 3</h5>
      <p class="card-text">Third card content.</p>
    </div>
  </div>
</div>`,
  },
  {
    title: "Horizontal Card",
    description: "Image beside card body.",
    code: `<div class="card mb-3" style="max-width:540px;">
  <div class="row g-0">
    <div class="col-md-4">
      <img src="https://picsum.photos/200/200" class="img-fluid rounded-start" alt="...">
    </div>
    <div class="col-md-8">
      <div class="card-body">
        <h5 class="card-title">Horizontal Card</h5>
        <p class="card-text">Content beside the image in a horizontal layout.</p>
      </div>
    </div>
  </div>
</div>`,
  },
  {
    title: "Card Overlay",
    description: "Text overlaid on card image.",
    code: `<div class="card text-bg-dark" style="max-width:400px;">
  <img src="https://picsum.photos/400/200" class="card-img" alt="...">
  <div class="card-img-overlay">
    <h5 class="card-title">Card Overlay Title</h5>
    <p class="card-text">Text overlaid on the card background image.</p>
  </div>
</div>`,
  },

  // ── Modal ─────────────────────────────────────────────────────────────────────
  {
    title: "Basic Modal",
    description: "Dialog triggered by a button.",
    code: `<!-- Trigger button -->
<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#myModal">
  Launch modal
</button>

<!-- Modal -->
<div class="modal fade" id="myModal" tabindex="-1">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Modal Title</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        Modal body text goes here.
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary">Save changes</button>
      </div>
    </div>
  </div>
</div>`,
  },
  {
    title: "Modal Sizes",
    description: "Small, large, and extra-large modals.",
    code: `<!-- Small -->
<div class="modal-dialog modal-sm"> ... </div>

<!-- Large -->
<div class="modal-dialog modal-lg"> ... </div>

<!-- Extra large -->
<div class="modal-dialog modal-xl"> ... </div>`,
  },
  {
    title: "Centered Modal",
    description: "Vertically centered modal dialog.",
    code: `<div class="modal fade" id="centeredModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Centered Modal</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">Vertically centered content.</div>
    </div>
  </div>
</div>`,
  },
  {
    title: "Scrollable Modal",
    description: "Modal with scrollable body content.",
    code: `<div class="modal fade" id="scrollModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Scrollable Modal</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <p>Long content here...</p>
        <!-- repeat as needed -->
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>`,
  },
  {
    title: "Static Backdrop Modal",
    description: "Modal that ignores backdrop clicks.",
    code: `<button type="button" class="btn btn-primary"
        data-bs-toggle="modal" data-bs-target="#staticModal">
  Static backdrop
</button>
<div class="modal fade" id="staticModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Static Modal</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">Click outside — nothing happens.</div>
    </div>
  </div>
</div>`,
  },
  {
    title: "Fullscreen Modal",
    description: "Modal that covers the full viewport.",
    code: `<div class="modal fade" id="fullscreenModal" tabindex="-1">
  <div class="modal-dialog modal-fullscreen">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Fullscreen Modal</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">Full viewport modal content.</div>
    </div>
  </div>
</div>

<!-- Responsive fullscreen: modal-fullscreen-md-down, modal-fullscreen-lg-down, etc. -->`,
  },
  {
    title: "Modal with Form",
    description: "Form elements inside a modal.",
    code: `<div class="modal fade" id="formModal" tabindex="-1">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Sign In</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <form>
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input type="email" class="form-control" id="email">
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input type="password" class="form-control" id="password">
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-primary">Sign In</button>
      </div>
    </div>
  </div>
</div>`,
  },

  // ── Forms ─────────────────────────────────────────────────────────────────────
  {
    title: "Basic Form Controls",
    description: "Standard text inputs and select.",
    code: `<form>
  <div class="mb-3">
    <label for="name" class="form-label">Name</label>
    <input type="text" class="form-control" id="name" placeholder="Your name">
  </div>
  <div class="mb-3">
    <label for="email1" class="form-label">Email address</label>
    <input type="email" class="form-control" id="email1">
    <div class="form-text">We'll never share your email.</div>
  </div>
  <button type="submit" class="btn btn-primary">Submit</button>
</form>`,
  },
  {
    title: "Form Select",
    description: "Styled select dropdown element.",
    code: `<label for="countrySelect" class="form-label">Country</label>
<select class="form-select" id="countrySelect">
  <option selected>Choose a country</option>
  <option value="us">United States</option>
  <option value="gb">United Kingdom</option>
  <option value="ca">Canada</option>
</select>`,
  },
  {
    title: "Form Check & Switch",
    description: "Checkbox, radio, and toggle switch.",
    code: `<!-- Checkbox -->
<div class="form-check">
  <input class="form-check-input" type="checkbox" id="check1">
  <label class="form-check-label" for="check1">Check this</label>
</div>

<!-- Radio -->
<div class="form-check">
  <input class="form-check-input" type="radio" name="radios" id="radio1" value="1" checked>
  <label class="form-check-label" for="radio1">Option one</label>
</div>

<!-- Switch -->
<div class="form-check form-switch">
  <input class="form-check-input" type="checkbox" role="switch" id="switch1">
  <label class="form-check-label" for="switch1">Toggle me</label>
</div>`,
  },
  {
    title: "Form Range",
    description: "Styled range slider input.",
    code: `<label for="range1" class="form-label">Example range</label>
<input type="range" class="form-range" min="0" max="100" step="5" id="range1">`,
  },
  {
    title: "Input Group",
    description: "Prepend or append to form inputs.",
    code: `<div class="input-group mb-3">
  <span class="input-group-text">@</span>
  <input type="text" class="form-control" placeholder="Username">
</div>

<div class="input-group mb-3">
  <input type="text" class="form-control" placeholder="Amount">
  <span class="input-group-text">.00</span>
</div>

<div class="input-group">
  <span class="input-group-text">$</span>
  <input type="text" class="form-control">
  <span class="input-group-text">.00</span>
</div>`,
  },
  {
    title: "Floating Labels",
    description: "Labels that float above the input.",
    code: `<div class="form-floating mb-3">
  <input type="email" class="form-control" id="floatEmail" placeholder="name@example.com">
  <label for="floatEmail">Email address</label>
</div>
<div class="form-floating">
  <input type="password" class="form-control" id="floatPassword" placeholder="Password">
  <label for="floatPassword">Password</label>
</div>`,
  },
  {
    title: "Form Validation",
    description: "Client-side validation feedback styles.",
    code: `<form class="needs-validation" novalidate>
  <div class="mb-3">
    <label for="validInput" class="form-label">Name</label>
    <input type="text" class="form-control is-valid" id="validInput" value="John">
    <div class="valid-feedback">Looks good!</div>
  </div>
  <div class="mb-3">
    <label for="invalidInput" class="form-label">Email</label>
    <input type="email" class="form-control is-invalid" id="invalidInput">
    <div class="invalid-feedback">Please provide a valid email.</div>
  </div>
  <button class="btn btn-primary" type="submit">Submit</button>
</form>`,
  },
  {
    title: "Disabled Fieldset",
    description: "Disable all inputs inside a fieldset.",
    code: `<form>
  <fieldset disabled>
    <legend>Disabled fieldset</legend>
    <div class="mb-3">
      <label for="disabledInput" class="form-label">Input</label>
      <input type="text" class="form-control" id="disabledInput" placeholder="Disabled">
    </div>
    <div class="mb-3">
      <label for="disabledSelect" class="form-label">Select</label>
      <select class="form-select" id="disabledSelect">
        <option>Disabled option</option>
      </select>
    </div>
    <button type="submit" class="btn btn-primary">Submit</button>
  </fieldset>
</form>`,
  },

  // ── Buttons ───────────────────────────────────────────────────────────────────
  {
    title: "Button Variants",
    description: "Solid themed button colors.",
    code: `<button type="button" class="btn btn-primary">Primary</button>
<button type="button" class="btn btn-secondary">Secondary</button>
<button type="button" class="btn btn-success">Success</button>
<button type="button" class="btn btn-danger">Danger</button>
<button type="button" class="btn btn-warning">Warning</button>
<button type="button" class="btn btn-info">Info</button>
<button type="button" class="btn btn-light">Light</button>
<button type="button" class="btn btn-dark">Dark</button>
<button type="button" class="btn btn-link">Link</button>`,
  },
  {
    title: "Outline Buttons",
    description: "Bordered outline button variants.",
    code: `<button type="button" class="btn btn-outline-primary">Primary</button>
<button type="button" class="btn btn-outline-secondary">Secondary</button>
<button type="button" class="btn btn-outline-success">Success</button>
<button type="button" class="btn btn-outline-danger">Danger</button>
<button type="button" class="btn btn-outline-warning">Warning</button>
<button type="button" class="btn btn-outline-info">Info</button>`,
  },
  {
    title: "Button Sizes",
    description: "Small and large button variants.",
    code: `<button type="button" class="btn btn-primary btn-lg">Large button</button>
<button type="button" class="btn btn-primary">Default button</button>
<button type="button" class="btn btn-primary btn-sm">Small button</button>`,
  },
  {
    title: "Button Group",
    description: "Group related buttons together.",
    code: `<div class="btn-group" role="group">
  <button type="button" class="btn btn-primary">Left</button>
  <button type="button" class="btn btn-primary">Middle</button>
  <button type="button" class="btn btn-primary">Right</button>
</div>`,
  },
  {
    title: "Dropdown Button",
    description: "Button that toggles a dropdown menu.",
    code: `<div class="dropdown">
  <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
    Dropdown button
  </button>
  <ul class="dropdown-menu">
    <li><a class="dropdown-item" href="#">Action</a></li>
    <li><a class="dropdown-item" href="#">Another action</a></li>
    <li><hr class="dropdown-divider"></li>
    <li><a class="dropdown-item" href="#">Something else</a></li>
  </ul>
</div>`,
  },
  {
    title: "Spinner Button",
    description: "Loading spinner inside a button.",
    code: `<button class="btn btn-primary" type="button" disabled>
  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
  Loading...
</button>

<button class="btn btn-primary" type="button" disabled>
  <span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
  Loading...
</button>`,
  },

  // ── Alerts ────────────────────────────────────────────────────────────────────
  {
    title: "Alert Variants",
    description: "Themed alert messages.",
    code: `<div class="alert alert-primary" role="alert">A primary alert!</div>
<div class="alert alert-secondary" role="alert">A secondary alert!</div>
<div class="alert alert-success" role="alert">A success alert!</div>
<div class="alert alert-danger" role="alert">A danger alert!</div>
<div class="alert alert-warning" role="alert">A warning alert!</div>
<div class="alert alert-info" role="alert">An info alert!</div>`,
  },
  {
    title: "Dismissible Alert",
    description: "Alert with a close button.",
    code: `<div class="alert alert-warning alert-dismissible fade show" role="alert">
  <strong>Warning!</strong> Something needs your attention.
  <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
</div>`,
  },
  {
    title: "Alert with Link",
    description: "Contextual link inside an alert.",
    code: `<div class="alert alert-info" role="alert">
  A simple info alert with <a href="#" class="alert-link">an example link</a>.
</div>`,
  },
  {
    title: "Alert with Icon",
    description: "Alert including a Bootstrap Icon.",
    code: `<div class="alert alert-success d-flex align-items-center" role="alert">
  <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:">
    <use xlink:href="#check-circle-fill"/>
  </svg>
  <div>An example success alert with an icon.</div>
</div>`,
  },

  // ── Badges ────────────────────────────────────────────────────────────────────
  {
    title: "Badge Variants",
    description: "Inline badge with theme colors.",
    code: `<span class="badge text-bg-primary">Primary</span>
<span class="badge text-bg-secondary">Secondary</span>
<span class="badge text-bg-success">Success</span>
<span class="badge text-bg-danger">Danger</span>
<span class="badge text-bg-warning">Warning</span>
<span class="badge text-bg-info">Info</span>`,
  },
  {
    title: "Pill Badge",
    description: "Rounded-pill badge style.",
    code: `<span class="badge rounded-pill text-bg-primary">Primary</span>
<span class="badge rounded-pill text-bg-success">Success</span>
<span class="badge rounded-pill text-bg-danger">Danger</span>`,
  },
  {
    title: "Badge on Button",
    description: "Badge count attached to a button.",
    code: `<button type="button" class="btn btn-primary">
  Inbox <span class="badge text-bg-secondary">4</span>
</button>`,
  },
  {
    title: "Positioned Badge",
    description: "Badge positioned on corner of button.",
    code: `<button type="button" class="btn btn-primary position-relative">
  Inbox
  <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
    99+
    <span class="visually-hidden">unread messages</span>
  </span>
</button>`,
  },

  // ── Accordion ─────────────────────────────────────────────────────────────────
  {
    title: "Basic Accordion",
    description: "Collapsible accordion panels.",
    code: `<div class="accordion" id="accordionExample">
  <div class="accordion-item">
    <h2 class="accordion-header">
      <button class="accordion-button" type="button"
              data-bs-toggle="collapse" data-bs-target="#collapse1">
        Accordion Item #1
      </button>
    </h2>
    <div id="collapse1" class="accordion-collapse collapse show"
         data-bs-parent="#accordionExample">
      <div class="accordion-body">
        Content for the first accordion item.
      </div>
    </div>
  </div>
  <div class="accordion-item">
    <h2 class="accordion-header">
      <button class="accordion-button collapsed" type="button"
              data-bs-toggle="collapse" data-bs-target="#collapse2">
        Accordion Item #2
      </button>
    </h2>
    <div id="collapse2" class="accordion-collapse collapse"
         data-bs-parent="#accordionExample">
      <div class="accordion-body">
        Content for the second accordion item.
      </div>
    </div>
  </div>
</div>`,
  },
  {
    title: "Flush Accordion",
    description: "Accordion without outer border.",
    code: `<div class="accordion accordion-flush" id="accordionFlush">
  <div class="accordion-item">
    <h2 class="accordion-header">
      <button class="accordion-button collapsed" type="button"
              data-bs-toggle="collapse" data-bs-target="#flush1">
        Flush Item #1
      </button>
    </h2>
    <div id="flush1" class="accordion-collapse collapse" data-bs-parent="#accordionFlush">
      <div class="accordion-body">Flush accordion body.</div>
    </div>
  </div>
</div>`,
  },
  {
    title: "Always-Open Accordion",
    description: "Multiple panels can stay open.",
    code: `<!-- Remove data-bs-parent to allow multiple open items -->
<div class="accordion" id="accordionAlways">
  <div class="accordion-item">
    <h2 class="accordion-header">
      <button class="accordion-button" type="button"
              data-bs-toggle="collapse" data-bs-target="#alwaysOne">
        Item #1
      </button>
    </h2>
    <div id="alwaysOne" class="accordion-collapse collapse show">
      <div class="accordion-body">Body one — stays open independently.</div>
    </div>
  </div>
  <div class="accordion-item">
    <h2 class="accordion-header">
      <button class="accordion-button collapsed" type="button"
              data-bs-toggle="collapse" data-bs-target="#alwaysTwo">
        Item #2
      </button>
    </h2>
    <div id="alwaysTwo" class="accordion-collapse collapse">
      <div class="accordion-body">Body two — independent.</div>
    </div>
  </div>
</div>`,
  },

  // ── Tabs & Pills ──────────────────────────────────────────────────────────────
  {
    title: "Nav Tabs",
    description: "Tab navigation with content panes.",
    code: `<ul class="nav nav-tabs" id="myTab" role="tablist">
  <li class="nav-item" role="presentation">
    <button class="nav-link active" id="home-tab" data-bs-toggle="tab"
            data-bs-target="#home-pane" type="button" role="tab">Home</button>
  </li>
  <li class="nav-item" role="presentation">
    <button class="nav-link" id="profile-tab" data-bs-toggle="tab"
            data-bs-target="#profile-pane" type="button" role="tab">Profile</button>
  </li>
</ul>
<div class="tab-content" id="myTabContent">
  <div class="tab-pane fade show active" id="home-pane" role="tabpanel">
    <p class="mt-3">Home content.</p>
  </div>
  <div class="tab-pane fade" id="profile-pane" role="tabpanel">
    <p class="mt-3">Profile content.</p>
  </div>
</div>`,
  },
  {
    title: "Nav Pills",
    description: "Pill-style nav with content panes.",
    code: `<ul class="nav nav-pills" id="pillsTab" role="tablist">
  <li class="nav-item" role="presentation">
    <button class="nav-link active" id="pills-home-tab" data-bs-toggle="pill"
            data-bs-target="#pills-home" type="button" role="tab">Home</button>
  </li>
  <li class="nav-item" role="presentation">
    <button class="nav-link" id="pills-profile-tab" data-bs-toggle="pill"
            data-bs-target="#pills-profile" type="button" role="tab">Profile</button>
  </li>
</ul>
<div class="tab-content" id="pillsTabContent">
  <div class="tab-pane fade show active" id="pills-home" role="tabpanel">
    <p class="mt-3">Home pill content.</p>
  </div>
  <div class="tab-pane fade" id="pills-profile" role="tabpanel">
    <p class="mt-3">Profile pill content.</p>
  </div>
</div>`,
  },
  {
    title: "Vertical Tabs",
    description: "Tabs displayed in a vertical layout.",
    code: `<div class="d-flex align-items-start">
  <div class="nav flex-column nav-pills me-3" id="v-pills-tab" role="tablist">
    <button class="nav-link active" id="v-pills-home-tab" data-bs-toggle="pill"
            data-bs-target="#v-pills-home" type="button" role="tab">Home</button>
    <button class="nav-link" id="v-pills-profile-tab" data-bs-toggle="pill"
            data-bs-target="#v-pills-profile" type="button" role="tab">Profile</button>
    <button class="nav-link" id="v-pills-settings-tab" data-bs-toggle="pill"
            data-bs-target="#v-pills-settings" type="button" role="tab">Settings</button>
  </div>
  <div class="tab-content" id="v-pills-tabContent">
    <div class="tab-pane fade show active" id="v-pills-home" role="tabpanel">Home content</div>
    <div class="tab-pane fade" id="v-pills-profile" role="tabpanel">Profile content</div>
    <div class="tab-pane fade" id="v-pills-settings" role="tabpanel">Settings content</div>
  </div>
</div>`,
  },

  // ── Dropdown ──────────────────────────────────────────────────────────────────
  {
    title: "Basic Dropdown",
    description: "Simple dropdown menu.",
    code: `<div class="dropdown">
  <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
    Dropdown
  </button>
  <ul class="dropdown-menu">
    <li><h6 class="dropdown-header">Header</h6></li>
    <li><a class="dropdown-item" href="#">Action</a></li>
    <li><a class="dropdown-item" href="#">Another action</a></li>
    <li><a class="dropdown-item active" href="#">Active item</a></li>
    <li><a class="dropdown-item disabled">Disabled item</a></li>
    <li><hr class="dropdown-divider"></li>
    <li><a class="dropdown-item" href="#">Separated link</a></li>
  </ul>
</div>`,
  },
  {
    title: "Split Dropdown",
    description: "Button split from its dropdown toggle.",
    code: `<div class="btn-group">
  <button type="button" class="btn btn-danger">Action</button>
  <button type="button" class="btn btn-danger dropdown-toggle dropdown-toggle-split"
          data-bs-toggle="dropdown" aria-expanded="false">
    <span class="visually-hidden">Toggle Dropdown</span>
  </button>
  <ul class="dropdown-menu">
    <li><a class="dropdown-item" href="#">Action</a></li>
    <li><a class="dropdown-item" href="#">Another action</a></li>
  </ul>
</div>`,
  },
  {
    title: "Dropup",
    description: "Dropdown that opens upward.",
    code: `<div class="dropup">
  <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
    Dropup
  </button>
  <ul class="dropdown-menu">
    <li><a class="dropdown-item" href="#">Action</a></li>
    <li><a class="dropdown-item" href="#">Another action</a></li>
  </ul>
</div>`,
  },
  {
    title: "Dropend & Dropstart",
    description: "Dropdown opening to the right or left.",
    code: `<!-- Dropend (right) -->
<div class="dropend">
  <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
    Dropend
  </button>
  <ul class="dropdown-menu">
    <li><a class="dropdown-item" href="#">Action</a></li>
  </ul>
</div>

<!-- Dropstart (left) -->
<div class="dropstart">
  <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
    Dropstart
  </button>
  <ul class="dropdown-menu">
    <li><a class="dropdown-item" href="#">Action</a></li>
  </ul>
</div>`,
  },

  // ── Offcanvas ─────────────────────────────────────────────────────────────────
  {
    title: "Offcanvas Start",
    description: "Slide-in panel from the left.",
    code: `<button class="btn btn-primary" type="button"
        data-bs-toggle="offcanvas" data-bs-target="#offcanvasStart">
  Open offcanvas
</button>

<div class="offcanvas offcanvas-start" id="offcanvasStart" tabindex="-1">
  <div class="offcanvas-header">
    <h5 class="offcanvas-title">Offcanvas</h5>
    <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
  </div>
  <div class="offcanvas-body">
    Content for the offcanvas panel.
  </div>
</div>`,
  },
  {
    title: "Offcanvas End",
    description: "Slide-in panel from the right.",
    code: `<button class="btn btn-primary" type="button"
        data-bs-toggle="offcanvas" data-bs-target="#offcanvasEnd">
  Open right panel
</button>

<div class="offcanvas offcanvas-end" id="offcanvasEnd" tabindex="-1">
  <div class="offcanvas-header">
    <h5 class="offcanvas-title">Right Panel</h5>
    <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
  </div>
  <div class="offcanvas-body">Content here.</div>
</div>`,
  },
  {
    title: "Offcanvas Top/Bottom",
    description: "Slide-in panel from top or bottom.",
    code: `<!-- Top -->
<div class="offcanvas offcanvas-top" id="offcanvasTop" tabindex="-1">
  <div class="offcanvas-header">
    <h5 class="offcanvas-title">Top panel</h5>
    <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
  </div>
  <div class="offcanvas-body">Top offcanvas content.</div>
</div>

<!-- Bottom -->
<div class="offcanvas offcanvas-bottom" id="offcanvasBottom" tabindex="-1">
  <div class="offcanvas-header">
    <h5 class="offcanvas-title">Bottom panel</h5>
    <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
  </div>
  <div class="offcanvas-body">Bottom offcanvas content.</div>
</div>`,
  },
  {
    title: "Offcanvas No Backdrop",
    description: "Offcanvas without a dark backdrop.",
    code: `<button class="btn btn-primary" type="button"
        data-bs-toggle="offcanvas" data-bs-target="#offcanvasNoBackdrop">
  No backdrop
</button>
<div class="offcanvas offcanvas-start" data-bs-backdrop="false"
     id="offcanvasNoBackdrop" tabindex="-1">
  <div class="offcanvas-header">
    <h5 class="offcanvas-title">No Backdrop</h5>
    <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
  </div>
  <div class="offcanvas-body">Page remains interactive behind this panel.</div>
</div>`,
  },

  // ── Toast ─────────────────────────────────────────────────────────────────────
  {
    title: "Live Toast",
    description: "Toast notification triggered by JS.",
    code: `<!-- Toast container -->
<div class="toast-container position-fixed bottom-0 end-0 p-3">
  <div id="liveToast" class="toast" role="alert" aria-live="assertive">
    <div class="toast-header">
      <strong class="me-auto">Bootstrap</strong>
      <small>11 mins ago</small>
      <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
    </div>
    <div class="toast-body">Hello, world! This is a toast message.</div>
  </div>
</div>

<!-- Trigger -->
<button type="button" class="btn btn-primary" id="liveToastBtn">Show toast</button>

<script>
  const toastEl = document.getElementById('liveToast');
  const toast = new bootstrap.Toast(toastEl);
  document.getElementById('liveToastBtn').addEventListener('click', () => toast.show());
</script>`,
  },
  {
    title: "Stacked Toasts",
    description: "Multiple toasts stacked in a container.",
    code: `<div class="toast-container position-fixed top-0 end-0 p-3">
  <div class="toast show" role="alert">
    <div class="toast-header">
      <strong class="me-auto">First Toast</strong>
      <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
    </div>
    <div class="toast-body">First notification.</div>
  </div>
  <div class="toast show" role="alert">
    <div class="toast-header">
      <strong class="me-auto">Second Toast</strong>
      <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
    </div>
    <div class="toast-body">Second notification.</div>
  </div>
</div>`,
  },

  // ── Progress ──────────────────────────────────────────────────────────────────
  {
    title: "Basic Progress Bar",
    description: "Simple percentage progress bar.",
    code: `<div class="progress" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">
  <div class="progress-bar" style="width:75%">75%</div>
</div>`,
  },
  {
    title: "Striped & Animated",
    description: "Animated striped progress bar.",
    code: `<div class="progress mb-2" role="progressbar">
  <div class="progress-bar progress-bar-striped" style="width:40%">40%</div>
</div>
<div class="progress" role="progressbar">
  <div class="progress-bar progress-bar-striped progress-bar-animated" style="width:60%">60%</div>
</div>`,
  },
  {
    title: "Stacked Progress",
    description: "Multiple bars in one progress track.",
    code: `<div class="progress" style="height:20px;">
  <div class="progress-bar bg-success" style="width:35%" title="Free: 35%">35%</div>
  <div class="progress-bar bg-warning" style="width:25%" title="Partial: 25%">25%</div>
  <div class="progress-bar bg-danger" style="width:20%" title="Used: 20%">20%</div>
</div>`,
  },

  // ── Spinners ──────────────────────────────────────────────────────────────────
  {
    title: "Border Spinner",
    description: "Circular border-based loading spinner.",
    code: `<div class="spinner-border" role="status">
  <span class="visually-hidden">Loading...</span>
</div>

<!-- Colored spinners -->
<div class="spinner-border text-primary" role="status"></div>
<div class="spinner-border text-success" role="status"></div>
<div class="spinner-border text-danger" role="status"></div>`,
  },
  {
    title: "Growing Spinner",
    description: "Pulsing grow-style loading spinner.",
    code: `<div class="spinner-grow" role="status">
  <span class="visually-hidden">Loading...</span>
</div>

<div class="spinner-grow text-primary" role="status"></div>
<div class="spinner-grow text-warning" role="status"></div>`,
  },
  {
    title: "Spinner Sizes",
    description: "Small spinner using spinner-*-sm.",
    code: `<div class="spinner-border spinner-border-sm text-primary" role="status">
  <span class="visually-hidden">Loading...</span>
</div>

<div class="spinner-grow spinner-grow-sm text-success" role="status">
  <span class="visually-hidden">Loading...</span>
</div>`,
  },

  // ── Tables ────────────────────────────────────────────────────────────────────
  {
    title: "Basic Table",
    description: "Standard styled table.",
    code: `<table class="table">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">First</th>
      <th scope="col">Last</th>
      <th scope="col">Handle</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">1</th>
      <td>Mark</td>
      <td>Otto</td>
      <td>@mdo</td>
    </tr>
    <tr>
      <th scope="row">2</th>
      <td>Jacob</td>
      <td>Thornton</td>
      <td>@fat</td>
    </tr>
  </tbody>
</table>`,
  },
  {
    title: "Striped & Hover Table",
    description: "Table with striped rows and hover.",
    code: `<table class="table table-striped table-hover">
  <thead>
    <tr><th>#</th><th>Name</th><th>Role</th></tr>
  </thead>
  <tbody>
    <tr><th>1</th><td>Alice</td><td>Admin</td></tr>
    <tr><th>2</th><td>Bob</td><td>User</td></tr>
    <tr><th>3</th><td>Carol</td><td>Editor</td></tr>
  </tbody>
</table>`,
  },
  {
    title: "Bordered Table",
    description: "Table with borders on all cells.",
    code: `<table class="table table-bordered">
  <thead>
    <tr><th>Product</th><th>Price</th><th>Stock</th></tr>
  </thead>
  <tbody>
    <tr><td>Widget A</td><td>$9.99</td><td>100</td></tr>
    <tr><td>Widget B</td><td>$19.99</td><td>50</td></tr>
  </tbody>
</table>`,
  },
  {
    title: "Responsive Table",
    description: "Horizontally scrollable table on small screens.",
    code: `<div class="table-responsive">
  <table class="table table-sm">
    <thead>
      <tr>
        <th>Column 1</th><th>Column 2</th><th>Column 3</th>
        <th>Column 4</th><th>Column 5</th><th>Column 6</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Cell</td><td>Cell</td><td>Cell</td>
        <td>Cell</td><td>Cell</td><td>Cell</td>
      </tr>
    </tbody>
  </table>
</div>`,
  },
  {
    title: "Table with Caption",
    description: "Table caption above or below.",
    code: `<table class="table caption-top">
  <caption>List of users</caption>
  <thead>
    <tr><th>Name</th><th>Email</th></tr>
  </thead>
  <tbody>
    <tr><td>Alice</td><td>alice@example.com</td></tr>
    <tr><td>Bob</td><td>bob@example.com</td></tr>
  </tbody>
</table>`,
  },

  // ── List Groups ───────────────────────────────────────────────────────────────
  {
    title: "Basic List Group",
    description: "Unordered vertical list of items.",
    code: `<ul class="list-group">
  <li class="list-group-item">An item</li>
  <li class="list-group-item active">Active item</li>
  <li class="list-group-item">A third item</li>
  <li class="list-group-item disabled">Disabled item</li>
</ul>`,
  },
  {
    title: "List Group with Badges",
    description: "List items with count badges.",
    code: `<ul class="list-group">
  <li class="list-group-item d-flex justify-content-between align-items-center">
    Cras justo odio
    <span class="badge bg-primary rounded-pill">14</span>
  </li>
  <li class="list-group-item d-flex justify-content-between align-items-center">
    Dapibus ac facilisis in
    <span class="badge bg-primary rounded-pill">2</span>
  </li>
  <li class="list-group-item d-flex justify-content-between align-items-center">
    Morbi leo risus
    <span class="badge bg-primary rounded-pill">1</span>
  </li>
</ul>`,
  },
  {
    title: "Linked List Group",
    description: "List group as navigation links.",
    code: `<div class="list-group">
  <a href="#" class="list-group-item list-group-item-action active">Active link</a>
  <a href="#" class="list-group-item list-group-item-action">A second link</a>
  <a href="#" class="list-group-item list-group-item-action">A third link</a>
  <a href="#" class="list-group-item list-group-item-action disabled">Disabled link</a>
</div>`,
  },
  {
    title: "Flush List Group",
    description: "List group without outer borders.",
    code: `<ul class="list-group list-group-flush">
  <li class="list-group-item">An item</li>
  <li class="list-group-item">A second item</li>
  <li class="list-group-item">A third item</li>
</ul>`,
  },
  {
    title: "Horizontal List Group",
    description: "List group displayed horizontally.",
    code: `<ul class="list-group list-group-horizontal">
  <li class="list-group-item">An item</li>
  <li class="list-group-item">A second item</li>
  <li class="list-group-item">A third item</li>
</ul>

<!-- Responsive horizontal: list-group-horizontal-md -->
<ul class="list-group list-group-horizontal-md mt-2">
  <li class="list-group-item">Item 1</li>
  <li class="list-group-item">Item 2</li>
</ul>`,
  },
  {
    title: "Checkboxes in List Group",
    description: "List group items as checkboxes.",
    code: `<ul class="list-group">
  <li class="list-group-item">
    <input class="form-check-input me-1" type="checkbox" value="" id="check-item-1">
    <label class="form-check-label" for="check-item-1">First checkbox</label>
  </li>
  <li class="list-group-item">
    <input class="form-check-input me-1" type="checkbox" value="" id="check-item-2" checked>
    <label class="form-check-label" for="check-item-2">Second checkbox</label>
  </li>
  <li class="list-group-item">
    <input class="form-check-input me-1" type="checkbox" value="" id="check-item-3">
    <label class="form-check-label" for="check-item-3">Third checkbox</label>
  </li>
</ul>`,
  },

  // ── Breadcrumb & Pagination ───────────────────────────────────────────────────
  {
    title: "Breadcrumb",
    description: "Navigation breadcrumb trail.",
    code: `<nav aria-label="breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb-item"><a href="#">Home</a></li>
    <li class="breadcrumb-item"><a href="#">Library</a></li>
    <li class="breadcrumb-item active" aria-current="page">Data</li>
  </ol>
</nav>`,
  },
  {
    title: "Custom Breadcrumb Divider",
    description: "Change divider with a CSS variable.",
    code: `<nav style="--bs-breadcrumb-divider: '>';" aria-label="breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb-item"><a href="#">Home</a></li>
    <li class="breadcrumb-item active" aria-current="page">Library</li>
  </ol>
</nav>

<!-- SVG arrow divider -->
<nav style="--bs-breadcrumb-divider: url(&#34;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpath d='M2.5 0L1 1.5 3.5 4 1 6.5 2.5 8l4-4-4-4z' fill='%236c757d'/%3E%3C/svg%3E&#34;);" aria-label="breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb-item"><a href="#">Home</a></li>
    <li class="breadcrumb-item active">Library</li>
  </ol>
</nav>`,
  },
  {
    title: "Pagination",
    description: "Page navigation with prev/next links.",
    code: `<nav aria-label="Page navigation">
  <ul class="pagination">
    <li class="page-item disabled">
      <a class="page-link" href="#" tabindex="-1">Previous</a>
    </li>
    <li class="page-item"><a class="page-link" href="#">1</a></li>
    <li class="page-item active"><a class="page-link" href="#">2</a></li>
    <li class="page-item"><a class="page-link" href="#">3</a></li>
    <li class="page-item">
      <a class="page-link" href="#">Next</a>
    </li>
  </ul>
</nav>`,
  },
  {
    title: "Pagination Sizes",
    description: "Large and small pagination variants.",
    code: `<!-- Large -->
<ul class="pagination pagination-lg">
  <li class="page-item"><a class="page-link" href="#">1</a></li>
  <li class="page-item"><a class="page-link" href="#">2</a></li>
</ul>

<!-- Small -->
<ul class="pagination pagination-sm">
  <li class="page-item"><a class="page-link" href="#">1</a></li>
  <li class="page-item"><a class="page-link" href="#">2</a></li>
</ul>`,
  },

  // ── Images & Figures ──────────────────────────────────────────────────────────
  {
    title: "Responsive Image",
    description: "Image that scales with parent width.",
    code: `<img src="https://picsum.photos/600/300" class="img-fluid" alt="Responsive image">`,
  },
  {
    title: "Image Shapes",
    description: "Rounded, circle, and thumbnail images.",
    code: `<img src="https://picsum.photos/150" class="rounded" alt="Rounded">
<img src="https://picsum.photos/150" class="rounded-circle" alt="Circle">
<img src="https://picsum.photos/150" class="img-thumbnail" alt="Thumbnail">`,
  },
  {
    title: "Figure & Caption",
    description: "Image with descriptive caption.",
    code: `<figure class="figure">
  <img src="https://picsum.photos/400/200" class="figure-img img-fluid rounded" alt="...">
  <figcaption class="figure-caption text-end">
    A caption for the above image.
  </figcaption>
</figure>`,
  },

  // ── Ratio / Embed ─────────────────────────────────────────────────────────────
  {
    title: "16:9 Ratio Embed",
    description: "Responsive 16:9 video embed.",
    code: `<div class="ratio ratio-16x9">
  <iframe src="https://www.youtube.com/embed/vlDzYIIOYmM"
          title="YouTube video" allowfullscreen></iframe>
</div>`,
  },
  {
    title: "4:3 & 1:1 Ratio",
    description: "4:3 and square ratio containers.",
    code: `<!-- 4:3 -->
<div class="ratio ratio-4x3">
  <iframe src="..." allowfullscreen></iframe>
</div>

<!-- 1:1 (square) -->
<div class="ratio ratio-1x1">
  <iframe src="..." allowfullscreen></iframe>
</div>`,
  },
  {
    title: "Custom Ratio",
    description: "Set an arbitrary aspect ratio via CSS.",
    code: `<div class="ratio" style="--bs-aspect-ratio:75%;">
  <!-- 4:3 equivalent via custom property -->
  <div class="bg-light d-flex align-items-center justify-content-center">75% ratio</div>
</div>`,
  },

  // ── Display & Visibility ──────────────────────────────────────────────────────
  {
    title: "Display Utilities",
    description: "Show/hide elements by breakpoint.",
    code: `<!-- Hidden on all screens -->
<div class="d-none">Hidden everywhere</div>

<!-- Visible only on md+ -->
<div class="d-none d-md-block">Visible md and above</div>

<!-- Hidden on lg+ -->
<div class="d-lg-none">Hidden on lg and above</div>

<!-- Flex only on sm+ -->
<div class="d-none d-sm-flex">Flex from sm up</div>`,
  },
  {
    title: "Visually Hidden",
    description: "Hide visually but keep accessible.",
    code: `<span class="visually-hidden">Screen-reader only text</span>

<!-- Focusable skip link -->
<a class="visually-hidden-focusable" href="#main-content">Skip to main content</a>`,
  },
  {
    title: "Invisible Utility",
    description: "Keep layout space but hide element.",
    code: `<div class="invisible">
  This is invisible but still takes up space in layout.
</div>`,
  },

  // ── Position Utilities ────────────────────────────────────────────────────────
  {
    title: "Position Classes",
    description: "Static, relative, absolute, fixed, sticky.",
    code: `<div class="position-relative" style="height:80px;">
  <div class="position-absolute top-0 start-0">Top-left</div>
  <div class="position-absolute top-0 end-0">Top-right</div>
  <div class="position-absolute bottom-0 start-0">Bottom-left</div>
  <div class="position-absolute bottom-0 end-0">Bottom-right</div>
</div>`,
  },
  {
    title: "Translate Middle",
    description: "Center element over an anchor point.",
    code: `<div class="position-relative" style="height:100px;background:#eee;">
  <div class="position-absolute top-50 start-50 translate-middle bg-primary text-white p-2">
    Centered
  </div>
</div>`,
  },
  {
    title: "Sticky Top",
    description: "Element sticks to top when scrolled.",
    code: `<div class="sticky-top bg-white border-bottom p-2">
  I stick to the top of the viewport when scrolled.
</div>`,
  },
  {
    title: "Fixed Bottom",
    description: "Element fixed to viewport bottom.",
    code: `<div class="fixed-bottom bg-dark text-white text-center p-2">
  Fixed to the bottom of the viewport.
</div>`,
  },

  // ── Overflow, Shadow, Opacity, Border ─────────────────────────────────────────
  {
    title: "Overflow Utilities",
    description: "Control overflow on x/y axes.",
    code: `<div class="overflow-auto" style="height:80px;">
  Long content that overflows and becomes scrollable inside this box.
  More text. More text. More text. More text. More text.
</div>

<div class="overflow-hidden" style="height:50px;background:#eee;">
  Content cut off at the edge.
</div>`,
  },
  {
    title: "Shadow Utilities",
    description: "Box-shadow utilities on elements.",
    code: `<div class="shadow-none p-3 mb-2 bg-body rounded">No shadow</div>
<div class="shadow-sm p-3 mb-2 bg-body rounded">Small shadow</div>
<div class="shadow p-3 mb-2 bg-body rounded">Regular shadow</div>
<div class="shadow-lg p-3 bg-body rounded">Large shadow</div>`,
  },
  {
    title: "Opacity Utilities",
    description: "Set element opacity from 0 to 100.",
    code: `<div class="opacity-100 p-2 bg-primary text-white mb-1">100% opacity</div>
<div class="opacity-75 p-2 bg-primary text-white mb-1">75% opacity</div>
<div class="opacity-50 p-2 bg-primary text-white mb-1">50% opacity</div>
<div class="opacity-25 p-2 bg-primary text-white">25% opacity</div>`,
  },
  {
    title: "Border Utilities",
    description: "Add, remove, and style borders.",
    code: `<!-- Add borders -->
<span class="border p-2 me-1">All</span>
<span class="border-top p-2 me-1">Top</span>
<span class="border-end p-2 me-1">End</span>
<span class="border-bottom p-2 me-1">Bottom</span>
<span class="border-start p-2">Start</span>

<!-- Border colors -->
<span class="border border-primary p-2 me-1">Primary</span>
<span class="border border-danger p-2">Danger</span>

<!-- Border width -->
<span class="border border-3 p-2 me-1">Width 3</span>

<!-- Rounded corners -->
<span class="rounded p-2 me-1 border">Rounded</span>
<span class="rounded-pill p-2 me-1 border">Pill</span>
<span class="rounded-circle p-2 border">Circle</span>`,
  },

  // ── Scrollspy ─────────────────────────────────────────────────────────────────
  {
    title: "Scrollspy",
    description: "Auto-highlight nav as user scrolls.",
    code: `<nav id="navbar-scrollspy" class="navbar bg-body-tertiary px-3 mb-3">
  <a class="navbar-brand" href="#">Navbar</a>
  <ul class="nav nav-pills">
    <li class="nav-item"><a class="nav-link" href="#scrollspy-item-1">Item 1</a></li>
    <li class="nav-item"><a class="nav-link" href="#scrollspy-item-2">Item 2</a></li>
    <li class="nav-item"><a class="nav-link" href="#scrollspy-item-3">Item 3</a></li>
  </ul>
</nav>

<div data-bs-spy="scroll" data-bs-target="#navbar-scrollspy"
     data-bs-smooth-scroll="true" style="height:200px;overflow-y:scroll;">
  <h4 id="scrollspy-item-1">Item 1</h4>
  <p>Content for item 1...</p>
  <h4 id="scrollspy-item-2">Item 2</h4>
  <p>Content for item 2...</p>
  <h4 id="scrollspy-item-3">Item 3</h4>
  <p>Content for item 3...</p>
</div>`,
  },

  // ── Tooltip & Popover ─────────────────────────────────────────────────────────
  {
    title: "Tooltip",
    description: "Tooltip initialized via JavaScript.",
    code: `<!-- HTML -->
<button type="button" class="btn btn-secondary"
        data-bs-toggle="tooltip" data-bs-placement="top"
        data-bs-title="Tooltip on top">
  Tooltip on top
</button>

<!-- Initialize all tooltips -->
<script>
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  [...tooltipTriggerList].forEach(el => new bootstrap.Tooltip(el));
</script>`,
  },
  {
    title: "Tooltip Placements",
    description: "Top, bottom, left, and right tooltips.",
    code: `<button class="btn btn-secondary" data-bs-toggle="tooltip"
        data-bs-placement="top" data-bs-title="Top">Top</button>

<button class="btn btn-secondary" data-bs-toggle="tooltip"
        data-bs-placement="right" data-bs-title="Right">Right</button>

<button class="btn btn-secondary" data-bs-toggle="tooltip"
        data-bs-placement="bottom" data-bs-title="Bottom">Bottom</button>

<button class="btn btn-secondary" data-bs-toggle="tooltip"
        data-bs-placement="left" data-bs-title="Left">Left</button>

<script>
  document.querySelectorAll('[data-bs-toggle="tooltip"]')
    .forEach(el => new bootstrap.Tooltip(el));
</script>`,
  },
  {
    title: "Popover",
    description: "Popover with title and HTML content.",
    code: `<button type="button" class="btn btn-lg btn-danger"
        data-bs-toggle="popover" data-bs-title="Popover title"
        data-bs-content="And here's some amazing content. It's very engaging. Right?">
  Click to toggle popover
</button>

<script>
  const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
  [...popoverTriggerList].forEach(el => new bootstrap.Popover(el));
</script>`,
  },
  {
    title: "HTML Popover",
    description: "Popover with HTML content inside.",
    code: `<button type="button" class="btn btn-primary"
        data-bs-toggle="popover"
        data-bs-html="true"
        data-bs-title="<strong>Rich Title</strong>"
        data-bs-content="<em>Italic</em> and <strong>bold</strong> content inside.">
  HTML Popover
</button>

<script>
  new bootstrap.Popover(document.querySelector('[data-bs-toggle="popover"]'));
</script>`,
  },

  // ── Sass Variable Overrides ────────────────────────────────────────────────────
  {
    title: "Sass Variable Overrides",
    description: "Customize Bootstrap before importing.",
    code: `// custom.scss

// 1. Override Bootstrap default variables BEFORE import
$primary:       #0d6efd;
$secondary:     #6c757d;
$success:       #198754;
$font-family-base: 'Inter', sans-serif;
$font-size-base: 1rem;
$border-radius: 0.5rem;
$spacer: 1rem;

// 2. Import Bootstrap source
@import "bootstrap/scss/bootstrap";

// 3. Add custom styles after
.btn {
  letter-spacing: 0.05em;
}`,
  },
  {
    title: "Sass Color Map Override",
    description: "Add custom colors to Bootstrap's map.",
    code: `// custom.scss

// Add custom color to theme-colors map
$custom-colors: (
  "brand": #5c3d99,
  "accent": #ff6b35,
);

// Merge with Bootstrap's default map
@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/variables-dark";
@import "bootstrap/scss/maps";

$theme-colors: map-merge($theme-colors, $custom-colors);

@import "bootstrap/scss/bootstrap";`,
  },
  {
    title: "Sass Grid Customization",
    description: "Change grid columns, gutter, and breakpoints.",
    code: `// custom.scss

$grid-columns: 12;
$grid-gutter-width: 1.5rem;
$grid-row-columns: 6;

$grid-breakpoints: (
  xs: 0,
  sm: 576px,
  md: 768px,
  lg: 992px,
  xl: 1200px,
  xxl: 1400px,
);

$container-max-widths: (
  sm: 540px,
  md: 720px,
  lg: 960px,
  xl: 1140px,
  xxl: 1320px,
);

@import "bootstrap/scss/bootstrap";`,
  },

  // ── Additional Utilities ──────────────────────────────────────────────────────
  {
    title: "Text Decoration",
    description: "Underline, line-through, and none.",
    code: `<p class="text-decoration-underline">Underlined text</p>
<p class="text-decoration-line-through">Strikethrough text</p>
<a href="#" class="text-decoration-none">Link without underline</a>`,
  },
  {
    title: "Line Height",
    description: "Control line-height with lh-* classes.",
    code: `<p class="lh-1">Tight line height (1)</p>
<p class="lh-sm">Small line height</p>
<p class="lh-base">Base line height (default)</p>
<p class="lh-lg">Larger line height</p>`,
  },
  {
    title: "Word Break",
    description: "Prevent long words from overflowing.",
    code: `<p class="text-wrap" style="width:100px;">
  Wrapped text that flows to multiple lines.
</p>
<p class="text-nowrap bg-light">
  This text will not wrap no matter how long.
</p>`,
  },
  {
    title: "Vertical Alignment",
    description: "Align inline/table elements vertically.",
    code: `<table class="table">
  <tbody>
    <tr>
      <td class="align-baseline">Baseline</td>
      <td class="align-top">Top</td>
      <td class="align-middle">Middle</td>
      <td class="align-bottom">Bottom</td>
    </tr>
  </tbody>
</table>`,
  },
  {
    title: "Background Gradient",
    description: "Add gradient to a background color.",
    code: `<div class="p-3 mb-2 bg-primary bg-gradient text-white rounded">
  Primary with gradient overlay
</div>
<div class="p-3 bg-success bg-gradient text-white rounded">
  Success with gradient overlay
</div>`,
  },
  {
    title: "Stretched Link",
    description: "Make a card or container fully clickable.",
    code: `<div class="card" style="width:18rem;">
  <img src="https://picsum.photos/300/150" class="card-img-top" alt="...">
  <div class="card-body">
    <h5 class="card-title">Card with stretched link</h5>
    <p class="card-text">The entire card is clickable via the stretched link.</p>
    <a href="#" class="btn btn-primary stretched-link">Go somewhere</a>
  </div>
</div>`,
  },
  {
    title: "Ratio 21:9",
    description: "Cinematic widescreen ratio container.",
    code: `<div class="ratio ratio-21x9">
  <iframe src="https://www.youtube.com/embed/vlDzYIIOYmM"
          title="YouTube video" allowfullscreen></iframe>
</div>`,
  },
  {
    title: "Color Mode Dark",
    description: "Enable dark mode on any element.",
    code: `<!-- Page-level dark mode -->
<html data-bs-theme="dark">
  ...
</html>

<!-- Component-level dark mode -->
<div class="card" data-bs-theme="dark">
  <div class="card-body">
    <h5 class="card-title">Dark card</h5>
    <p class="card-text">This card uses the dark color scheme.</p>
    <a href="#" class="btn btn-primary">Button</a>
  </div>
</div>`,
  },
  {
    title: "Close Button",
    description: "Generic dismissal close button.",
    code: `<button type="button" class="btn-close" aria-label="Close"></button>

<!-- Disabled state -->
<button type="button" class="btn-close" disabled aria-label="Close"></button>

<!-- White variant for dark backgrounds -->
<div class="bg-dark p-2 d-inline-block">
  <button type="button" class="btn-close btn-close-white" aria-label="Close"></button>
</div>`,
  },
  {
    title: "Clearfix",
    description: "Clear floated children in a container.",
    code: `<div class="clearfix">
  <img src="https://picsum.photos/200/100" class="float-start me-3" alt="...">
  <p>Text wraps around the floated image. Add clearfix to the parent so it expands to contain the float.</p>
</div>`,
  },
  {
    title: "Float Utilities",
    description: "Float elements left, right, or none.",
    code: `<div class="float-start me-3 p-2 bg-primary text-white">Float start (left)</div>
<div class="clearfix"></div>

<div class="float-end ms-3 p-2 bg-success text-white">Float end (right)</div>
<div class="clearfix"></div>

<!-- Responsive float -->
<div class="float-md-end p-2 bg-warning">Float right on md+</div>
<div class="clearfix"></div>`,
  },
  {
    title: "Object Fit",
    description: "Control how images fill their container.",
    code: `<img src="https://picsum.photos/400/200" class="object-fit-cover"
     style="width:200px;height:200px;" alt="Cover">

<img src="https://picsum.photos/400/200" class="object-fit-contain"
     style="width:200px;height:200px;background:#eee;" alt="Contain">

<!-- Other values: fill | scale-down | none -->`,
  },
  {
    title: "Z-Index Utilities",
    description: "Control stacking order with z-* classes.",
    code: `<div class="position-relative z-3 bg-primary text-white p-2">z-3 (top)</div>
<div class="position-relative z-2 bg-success text-white p-2" style="margin-top:-10px;">z-2</div>
<div class="position-relative z-1 bg-danger text-white p-2" style="margin-top:-10px;">z-1</div>

<!-- Available: z-0, z-1, z-2, z-3, z-n1 -->`,
  },
  {
    title: "Columns Layout",
    description: "CSS multi-column text layout.",
    code: `<div class="columns-2">
  <p>First paragraph in column layout. Text flows across the two columns automatically.</p>
  <p>Second paragraph continues in the multi-column flow created by Bootstrap's column utility.</p>
</div>`,
  },
  {
    title: "Navbar with Search",
    description: "Navbar including an inline search form.",
    code: `<nav class="navbar navbar-expand-lg bg-body-tertiary">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">Brand</a>
    <div class="collapse navbar-collapse" id="navbarSearch">
      <ul class="navbar-nav me-auto">
        <li class="nav-item"><a class="nav-link active" href="#">Home</a></li>
      </ul>
      <form class="d-flex" role="search">
        <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
        <button class="btn btn-outline-success" type="submit">Search</button>
      </form>
    </div>
  </div>
</nav>`,
  },
  {
    title: "Cards in Grid",
    description: "Responsive card grid using row-cols.",
    code: `<div class="row row-cols-1 row-cols-md-3 g-4">
  <div class="col">
    <div class="card h-100">
      <img src="https://picsum.photos/300/150?random=1" class="card-img-top" alt="...">
      <div class="card-body">
        <h5 class="card-title">Card 1</h5>
        <p class="card-text">Content for card one.</p>
      </div>
    </div>
  </div>
  <div class="col">
    <div class="card h-100">
      <img src="https://picsum.photos/300/150?random=2" class="card-img-top" alt="...">
      <div class="card-body">
        <h5 class="card-title">Card 2</h5>
        <p class="card-text">Content for card two with more text to show equal height.</p>
      </div>
    </div>
  </div>
  <div class="col">
    <div class="card h-100">
      <img src="https://picsum.photos/300/150?random=3" class="card-img-top" alt="...">
      <div class="card-body">
        <h5 class="card-title">Card 3</h5>
        <p class="card-text">Card three content.</p>
      </div>
    </div>
  </div>
</div>`,
  },
];
