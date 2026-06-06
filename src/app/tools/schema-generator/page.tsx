"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Copy, Check, Plus, Trash2 } from "lucide-react";

type SchemaType =
  | "Article"
  | "FAQ"
  | "Product"
  | "LocalBusiness"
  | "BreadcrumbList"
  | "HowTo"
  | "Event"
  | "Person"
  | "Organization"
  | "WebPage";

const SCHEMA_TYPES: SchemaType[] = [
  "Article", "FAQ", "Product", "LocalBusiness", "BreadcrumbList",
  "HowTo", "Event", "Person", "Organization", "WebPage",
];

interface ArticleFields {
  headline: string; description: string; authorName: string; authorUrl: string;
  datePublished: string; dateModified: string; image: string; publisherName: string; publisherLogo: string;
}
interface FaqItem { question: string; answer: string; }
interface ProductFields {
  name: string; description: string; image: string; brand: string; sku: string;
  price: string; currency: string; availability: string; ratingValue: string; reviewCount: string;
}
interface LocalBusinessFields {
  name: string; description: string; phone: string; email: string;
  streetAddress: string; city: string; state: string; zip: string; country: string;
  openingHours: string; priceRange: string; url: string;
}
interface BreadcrumbItem { name: string; url: string; }
interface HowToStep { name: string; text: string; }
interface HowToFields { name: string; description: string; estimatedTime: string; }
interface EventFields {
  name: string; description: string; startDate: string; endDate: string;
  locationName: string; locationAddress: string; organizerName: string;
  offerPrice: string; offerCurrency: string; offerUrl: string;
}
interface PersonFields {
  name: string; url: string; email: string; jobTitle: string; orgName: string; sameAs: string;
}
interface OrganizationFields {
  name: string; url: string; logo: string; description: string; email: string; phone: string; address: string;
}
interface WebPageFields {
  name: string; description: string; url: string; inLanguage: string; datePublished: string; dateModified: string;
}

function inputCls() {
  return "w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors";
}

function labelCls() { return "text-slate-400 text-xs mb-1 block"; }

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls()}>{label}</label>
      {children}
    </div>
  );
}

function buildArticleSchema(f: ArticleFields) {
  const s: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: f.headline || undefined,
    description: f.description || undefined,
    datePublished: f.datePublished || undefined,
    dateModified: f.dateModified || undefined,
    image: f.image || undefined,
  };
  if (f.authorName) s.author = { "@type": "Person", name: f.authorName, url: f.authorUrl || undefined };
  if (f.publisherName) s.publisher = { "@type": "Organization", name: f.publisherName, logo: f.publisherLogo ? { "@type": "ImageObject", url: f.publisherLogo } : undefined };
  return s;
}

function buildFaqSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.filter(i => i.question || i.answer).map(i => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: { "@type": "Answer", text: i.answer },
    })),
  };
}

function buildProductSchema(f: ProductFields) {
  const s: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: f.name || undefined,
    description: f.description || undefined,
    image: f.image || undefined,
    sku: f.sku || undefined,
  };
  if (f.brand) s.brand = { "@type": "Brand", name: f.brand };
  if (f.price) {
    s.offers = {
      "@type": "Offer",
      price: f.price,
      priceCurrency: f.currency || "USD",
      availability: `https://schema.org/${f.availability || "InStock"}`,
    };
  }
  if (f.ratingValue) {
    s.aggregateRating = { "@type": "AggregateRating", ratingValue: f.ratingValue, reviewCount: f.reviewCount || undefined };
  }
  return s;
}

function buildLocalBusinessSchema(f: LocalBusinessFields) {
  const s: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: f.name || undefined,
    description: f.description || undefined,
    telephone: f.phone || undefined,
    email: f.email || undefined,
    openingHours: f.openingHours || undefined,
    priceRange: f.priceRange || undefined,
    url: f.url || undefined,
  };
  if (f.streetAddress || f.city) {
    s.address = {
      "@type": "PostalAddress",
      streetAddress: f.streetAddress || undefined,
      addressLocality: f.city || undefined,
      addressRegion: f.state || undefined,
      postalCode: f.zip || undefined,
      addressCountry: f.country || undefined,
    };
  }
  return s;
}

function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.filter(i => i.name || i.url).map((i, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: i.name,
      item: i.url || undefined,
    })),
  };
}

function buildHowToSchema(f: HowToFields, steps: HowToStep[]) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: f.name || undefined,
    description: f.description || undefined,
    totalTime: f.estimatedTime || undefined,
    step: steps.filter(s => s.name || s.text).map(s => ({
      "@type": "HowToStep",
      name: s.name || undefined,
      text: s.text || undefined,
    })),
  };
}

function buildEventSchema(f: EventFields) {
  const s: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: f.name || undefined,
    description: f.description || undefined,
    startDate: f.startDate || undefined,
    endDate: f.endDate || undefined,
  };
  if (f.locationName || f.locationAddress) {
    s.location = { "@type": "Place", name: f.locationName || undefined, address: f.locationAddress || undefined };
  }
  if (f.organizerName) s.organizer = { "@type": "Organization", name: f.organizerName };
  if (f.offerPrice) {
    s.offers = {
      "@type": "Offer",
      price: f.offerPrice,
      priceCurrency: f.offerCurrency || "USD",
      url: f.offerUrl || undefined,
    };
  }
  return s;
}

function buildPersonSchema(f: PersonFields) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: f.name || undefined,
    url: f.url || undefined,
    email: f.email || undefined,
    jobTitle: f.jobTitle || undefined,
    worksFor: f.orgName ? { "@type": "Organization", name: f.orgName } : undefined,
    sameAs: f.sameAs ? f.sameAs.split(",").map(s => s.trim()).filter(Boolean) : undefined,
  };
}

function buildOrganizationSchema(f: OrganizationFields) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: f.name || undefined,
    url: f.url || undefined,
    logo: f.logo || undefined,
    description: f.description || undefined,
    email: f.email || undefined,
    telephone: f.phone || undefined,
    address: f.address ? { "@type": "PostalAddress", streetAddress: f.address } : undefined,
  };
}

function buildWebPageSchema(f: WebPageFields) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: f.name || undefined,
    description: f.description || undefined,
    url: f.url || undefined,
    inLanguage: f.inLanguage || "en",
    datePublished: f.datePublished || undefined,
    dateModified: f.dateModified || undefined,
  };
}

function DynList<T>({
  items,
  setItems,
  renderItem,
  emptyItem,
  addLabel,
}: {
  items: T[];
  setItems: (items: T[]) => void;
  renderItem: (item: T, idx: number, update: (val: T) => void) => React.ReactNode;
  emptyItem: T;
  addLabel: string;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-2 items-start">
          <div className="flex-1">{renderItem(item, idx, (val) => {
            const next = [...items];
            next[idx] = val;
            setItems(next);
          })}</div>
          <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="mt-1 p-1.5 text-slate-600 hover:text-red-400 transition-colors flex-shrink-0">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        onClick={() => setItems([...items, emptyItem])}
        className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm transition-colors"
      >
        <Plus className="w-4 h-4" />
        {addLabel}
      </button>
    </div>
  );
}

export default function SchemaGeneratorPage() {
  const [schemaType, setSchemaType] = useState<SchemaType>("Article");
  const [copied, setCopied] = useState(false);

  const [article, setArticle] = useState<ArticleFields>({ headline: "", description: "", authorName: "", authorUrl: "", datePublished: "", dateModified: "", image: "", publisherName: "", publisherLogo: "" });
  const [faqItems, setFaqItems] = useState<FaqItem[]>([{ question: "", answer: "" }, { question: "", answer: "" }]);
  const [product, setProduct] = useState<ProductFields>({ name: "", description: "", image: "", brand: "", sku: "", price: "", currency: "USD", availability: "InStock", ratingValue: "", reviewCount: "" });
  const [localBiz, setLocalBiz] = useState<LocalBusinessFields>({ name: "", description: "", phone: "", email: "", streetAddress: "", city: "", state: "", zip: "", country: "", openingHours: "", priceRange: "", url: "" });
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ name: "", url: "" }, { name: "", url: "" }]);
  const [howTo, setHowTo] = useState<HowToFields>({ name: "", description: "", estimatedTime: "" });
  const [howToSteps, setHowToSteps] = useState<HowToStep[]>([{ name: "", text: "" }, { name: "", text: "" }]);
  const [event, setEvent] = useState<EventFields>({ name: "", description: "", startDate: "", endDate: "", locationName: "", locationAddress: "", organizerName: "", offerPrice: "", offerCurrency: "USD", offerUrl: "" });
  const [person, setPerson] = useState<PersonFields>({ name: "", url: "", email: "", jobTitle: "", orgName: "", sameAs: "" });
  const [org, setOrg] = useState<OrganizationFields>({ name: "", url: "", logo: "", description: "", email: "", phone: "", address: "" });
  const [webpage, setWebpage] = useState<WebPageFields>({ name: "", description: "", url: "", inLanguage: "en", datePublished: "", dateModified: "" });

  function getSchema() {
    switch (schemaType) {
      case "Article": return buildArticleSchema(article);
      case "FAQ": return buildFaqSchema(faqItems);
      case "Product": return buildProductSchema(product);
      case "LocalBusiness": return buildLocalBusinessSchema(localBiz);
      case "BreadcrumbList": return buildBreadcrumbSchema(breadcrumbs);
      case "HowTo": return buildHowToSchema(howTo, howToSteps);
      case "Event": return buildEventSchema(event);
      case "Person": return buildPersonSchema(person);
      case "Organization": return buildOrganizationSchema(org);
      case "WebPage": return buildWebPageSchema(webpage);
    }
  }

  const schema = getSchema();
  const json = JSON.stringify(schema, null, 2);

  const copy = async () => {
    try { await navigator.clipboard.writeText(json); } catch { return; }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const ic = inputCls();

  function setA(key: keyof ArticleFields) { return (e: React.ChangeEvent<HTMLInputElement>) => setArticle(a => ({ ...a, [key]: e.target.value })); }
  function setP(key: keyof ProductFields) { return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setProduct(p => ({ ...p, [key]: e.target.value })); }
  function setL(key: keyof LocalBusinessFields) { return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setLocalBiz(l => ({ ...l, [key]: e.target.value })); }
  function setE(key: keyof EventFields) { return (e: React.ChangeEvent<HTMLInputElement>) => setEvent(ev => ({ ...ev, [key]: e.target.value })); }
  function setPer(key: keyof PersonFields) { return (e: React.ChangeEvent<HTMLInputElement>) => setPerson(p => ({ ...p, [key]: e.target.value })); }
  function setO(key: keyof OrganizationFields) { return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setOrg(o => ({ ...o, [key]: e.target.value })); }
  function setW(key: keyof WebPageFields) { return (e: React.ChangeEvent<HTMLInputElement>) => setWebpage(w => ({ ...w, [key]: e.target.value })); }

  function renderForm() {
    switch (schemaType) {
      case "Article":
        return (
          <div className="space-y-3">
            <Field label="Headline / Name"><input className={ic} value={article.headline} onChange={setA("headline")} placeholder="Article headline" /></Field>
            <Field label="Description"><input className={ic} value={article.description} onChange={setA("description")} placeholder="Brief description" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Author Name"><input className={ic} value={article.authorName} onChange={setA("authorName")} placeholder="Jane Doe" /></Field>
              <Field label="Author URL"><input className={ic} value={article.authorUrl} onChange={setA("authorUrl")} placeholder="https://..." /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date Published"><input type="date" className={ic} value={article.datePublished} onChange={setA("datePublished")} /></Field>
              <Field label="Date Modified"><input type="date" className={ic} value={article.dateModified} onChange={setA("dateModified")} /></Field>
            </div>
            <Field label="Image URL"><input className={ic} value={article.image} onChange={setA("image")} placeholder="https://..." /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Publisher Name"><input className={ic} value={article.publisherName} onChange={setA("publisherName")} placeholder="Acme Inc" /></Field>
              <Field label="Publisher Logo URL"><input className={ic} value={article.publisherLogo} onChange={setA("publisherLogo")} placeholder="https://..." /></Field>
            </div>
          </div>
        );
      case "FAQ":
        return (
          <DynList
            items={faqItems}
            setItems={setFaqItems}
            emptyItem={{ question: "", answer: "" }}
            addLabel="Add question"
            renderItem={(item, _idx, update) => (
              <div className="space-y-1.5 bg-slate-800/40 border border-slate-700/40 rounded-lg p-3">
                <input className={ic} value={item.question} onChange={e => update({ ...item, question: e.target.value })} placeholder="Question" />
                <textarea className={ic + " resize-none"} rows={2} value={item.answer} onChange={e => update({ ...item, answer: e.target.value })} placeholder="Answer" />
              </div>
            )}
          />
        );
      case "Product":
        return (
          <div className="space-y-3">
            <Field label="Name"><input className={ic} value={product.name} onChange={setP("name")} placeholder="Product name" /></Field>
            <Field label="Description"><input className={ic} value={product.description} onChange={setP("description")} placeholder="Description" /></Field>
            <Field label="Image URL"><input className={ic} value={product.image} onChange={setP("image")} placeholder="https://..." /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Brand"><input className={ic} value={product.brand} onChange={setP("brand")} placeholder="Brand name" /></Field>
              <Field label="SKU"><input className={ic} value={product.sku} onChange={setP("sku")} placeholder="SKU-001" /></Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Price"><input className={ic} value={product.price} onChange={setP("price")} placeholder="29.99" type="number" /></Field>
              <Field label="Currency"><input className={ic} value={product.currency} onChange={setP("currency")} placeholder="USD" maxLength={3} /></Field>
              <Field label="Availability">
                <select className={ic} value={product.availability} onChange={setP("availability")}>
                  <option value="InStock">InStock</option>
                  <option value="OutOfStock">OutOfStock</option>
                  <option value="PreOrder">PreOrder</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Rating (1–5)"><input className={ic} value={product.ratingValue} onChange={setP("ratingValue")} placeholder="4.5" type="number" min="1" max="5" step="0.1" /></Field>
              <Field label="Review Count"><input className={ic} value={product.reviewCount} onChange={setP("reviewCount")} placeholder="42" type="number" /></Field>
            </div>
          </div>
        );
      case "LocalBusiness":
        return (
          <div className="space-y-3">
            <Field label="Business Name"><input className={ic} value={localBiz.name} onChange={setL("name")} placeholder="Acme Store" /></Field>
            <Field label="Description"><input className={ic} value={localBiz.description} onChange={setL("description")} placeholder="Description" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone"><input className={ic} value={localBiz.phone} onChange={setL("phone")} placeholder="+1-555-0100" /></Field>
              <Field label="Email"><input className={ic} value={localBiz.email} onChange={setL("email")} placeholder="hello@acme.com" /></Field>
            </div>
            <Field label="Street Address"><input className={ic} value={localBiz.streetAddress} onChange={setL("streetAddress")} placeholder="123 Main St" /></Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="City"><input className={ic} value={localBiz.city} onChange={setL("city")} placeholder="New York" /></Field>
              <Field label="State"><input className={ic} value={localBiz.state} onChange={setL("state")} placeholder="NY" /></Field>
              <Field label="ZIP"><input className={ic} value={localBiz.zip} onChange={setL("zip")} placeholder="10001" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Country"><input className={ic} value={localBiz.country} onChange={setL("country")} placeholder="US" /></Field>
              <Field label="Price Range"><input className={ic} value={localBiz.priceRange} onChange={setL("priceRange")} placeholder="$$" /></Field>
            </div>
            <Field label="Opening Hours"><input className={ic} value={localBiz.openingHours} onChange={setL("openingHours")} placeholder="Mo-Fr 09:00-17:00" /></Field>
            <Field label="Website URL"><input className={ic} value={localBiz.url} onChange={setL("url")} placeholder="https://acme.com" /></Field>
          </div>
        );
      case "BreadcrumbList":
        return (
          <DynList
            items={breadcrumbs}
            setItems={setBreadcrumbs}
            emptyItem={{ name: "", url: "" }}
            addLabel="Add breadcrumb"
            renderItem={(item, _idx, update) => (
              <div className="grid grid-cols-2 gap-2">
                <input className={ic} value={item.name} onChange={e => update({ ...item, name: e.target.value })} placeholder="Name" />
                <input className={ic} value={item.url} onChange={e => update({ ...item, url: e.target.value })} placeholder="https://..." />
              </div>
            )}
          />
        );
      case "HowTo":
        return (
          <div className="space-y-3">
            <Field label="Name"><input className={ic} value={howTo.name} onChange={e => setHowTo(h => ({ ...h, name: e.target.value }))} placeholder="How to bake bread" /></Field>
            <Field label="Description"><input className={ic} value={howTo.description} onChange={e => setHowTo(h => ({ ...h, description: e.target.value }))} placeholder="Description" /></Field>
            <Field label="Estimated Time (ISO 8601)"><input className={ic} value={howTo.estimatedTime} onChange={e => setHowTo(h => ({ ...h, estimatedTime: e.target.value }))} placeholder="PT30M" /></Field>
            <div>
              <label className={labelCls()}>Steps</label>
              <DynList
                items={howToSteps}
                setItems={setHowToSteps}
                emptyItem={{ name: "", text: "" }}
                addLabel="Add step"
                renderItem={(item, _idx, update) => (
                  <div className="space-y-1.5 bg-slate-800/40 border border-slate-700/40 rounded-lg p-3">
                    <input className={ic} value={item.name} onChange={e => update({ ...item, name: e.target.value })} placeholder="Step name" />
                    <textarea className={ic + " resize-none"} rows={2} value={item.text} onChange={e => update({ ...item, text: e.target.value })} placeholder="Step instructions" />
                  </div>
                )}
              />
            </div>
          </div>
        );
      case "Event":
        return (
          <div className="space-y-3">
            <Field label="Event Name"><input className={ic} value={event.name} onChange={setE("name")} placeholder="Annual Conference" /></Field>
            <Field label="Description"><input className={ic} value={event.description} onChange={setE("description")} placeholder="Description" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Date & Time"><input type="datetime-local" className={ic} value={event.startDate} onChange={setE("startDate")} /></Field>
              <Field label="End Date & Time"><input type="datetime-local" className={ic} value={event.endDate} onChange={setE("endDate")} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Location Name"><input className={ic} value={event.locationName} onChange={setE("locationName")} placeholder="Convention Center" /></Field>
              <Field label="Location Address"><input className={ic} value={event.locationAddress} onChange={setE("locationAddress")} placeholder="123 Main St" /></Field>
            </div>
            <Field label="Organizer Name"><input className={ic} value={event.organizerName} onChange={setE("organizerName")} placeholder="Acme Inc" /></Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Offer Price"><input className={ic} value={event.offerPrice} onChange={setE("offerPrice")} placeholder="49.00" type="number" /></Field>
              <Field label="Currency"><input className={ic} value={event.offerCurrency} onChange={setE("offerCurrency")} placeholder="USD" maxLength={3} /></Field>
              <Field label="Offer URL"><input className={ic} value={event.offerUrl} onChange={setE("offerUrl")} placeholder="https://..." /></Field>
            </div>
          </div>
        );
      case "Person":
        return (
          <div className="space-y-3">
            <Field label="Full Name"><input className={ic} value={person.name} onChange={setPer("name")} placeholder="Jane Doe" /></Field>
            <Field label="Profile URL"><input className={ic} value={person.url} onChange={setPer("url")} placeholder="https://janedoe.com" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email"><input className={ic} value={person.email} onChange={setPer("email")} placeholder="jane@example.com" /></Field>
              <Field label="Job Title"><input className={ic} value={person.jobTitle} onChange={setPer("jobTitle")} placeholder="Software Engineer" /></Field>
            </div>
            <Field label="Organization Name"><input className={ic} value={person.orgName} onChange={setPer("orgName")} placeholder="Acme Inc" /></Field>
            <Field label="sameAs URLs (comma separated)"><input className={ic} value={person.sameAs} onChange={setPer("sameAs")} placeholder="https://twitter.com/jane, https://linkedin.com/in/jane" /></Field>
          </div>
        );
      case "Organization":
        return (
          <div className="space-y-3">
            <Field label="Name"><input className={ic} value={org.name} onChange={setO("name")} placeholder="Acme Inc" /></Field>
            <Field label="URL"><input className={ic} value={org.url} onChange={setO("url")} placeholder="https://acme.com" /></Field>
            <Field label="Logo URL"><input className={ic} value={org.logo} onChange={setO("logo")} placeholder="https://acme.com/logo.png" /></Field>
            <Field label="Description"><input className={ic} value={org.description} onChange={setO("description")} placeholder="What your organization does" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email"><input className={ic} value={org.email} onChange={setO("email")} placeholder="hello@acme.com" /></Field>
              <Field label="Phone"><input className={ic} value={org.phone} onChange={setO("phone")} placeholder="+1-555-0100" /></Field>
            </div>
            <Field label="Address">
              <textarea className={ic + " resize-none"} rows={2} value={org.address} onChange={setO("address")} placeholder="123 Main St, New York, NY 10001" />
            </Field>
          </div>
        );
      case "WebPage":
        return (
          <div className="space-y-3">
            <Field label="Page Name"><input className={ic} value={webpage.name} onChange={setW("name")} placeholder="Home — Acme" /></Field>
            <Field label="Description"><input className={ic} value={webpage.description} onChange={setW("description")} placeholder="Description" /></Field>
            <Field label="URL"><input className={ic} value={webpage.url} onChange={setW("url")} placeholder="https://acme.com" /></Field>
            <Field label="Language"><input className={ic} value={webpage.inLanguage} onChange={setW("inLanguage")} placeholder="en" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date Published"><input type="date" className={ic} value={webpage.datePublished} onChange={setW("datePublished")} /></Field>
              <Field label="Date Modified"><input type="date" className={ic} value={webpage.dateModified} onChange={setW("dateModified")} /></Field>
            </div>
          </div>
        );
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors group">
          <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          All tools
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Schema Markup Generator</h1>
          <p className="text-slate-500 text-sm">Generate valid JSON-LD structured data for your pages.</p>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {SCHEMA_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setSchemaType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${schemaType === t ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700"}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
            <h2 className="text-white text-sm font-semibold mb-4">{schemaType} Fields</h2>
            {renderForm()}
          </div>

          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white text-sm font-semibold">Generated JSON-LD</h2>
                <button
                  onClick={copy}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${copied ? "bg-green-600/20 border border-green-500/40 text-green-400" : "bg-blue-600 hover:bg-blue-500 text-white"}`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <textarea
                readOnly
                value={json}
                rows={16}
                className="w-full bg-slate-950/80 border border-slate-800/60 rounded-lg px-3 py-2.5 text-xs text-slate-300 font-mono focus:outline-none resize-none"
              />
            </div>

            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
              <h3 className="text-white text-sm font-semibold mb-2">How to use</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Paste the generated JSON-LD inside a{" "}
                <code className="bg-slate-800 px-1 rounded text-blue-300">{`<script>`}</code>{" "}
                tag in the{" "}
                <code className="bg-slate-800 px-1 rounded text-blue-300">{`<head>`}</code>{" "}
                of your page:
              </p>
              <pre className="mt-2 text-xs text-slate-400 font-mono bg-slate-950/60 border border-slate-800/40 rounded-lg p-3 overflow-x-auto">{`<script type="application/ld+json">\n${json.slice(0, 60)}…\n</script>`}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
