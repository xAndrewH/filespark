"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, Plus, Trash2, RefreshCw, Copy, Check, Download, Database } from "lucide-react";

type FieldType =
  | "uuid"
  | "autoincrement"
  | "firstName"
  | "lastName"
  | "fullName"
  | "email"
  | "username"
  | "phone"
  | "street"
  | "city"
  | "state"
  | "zip"
  | "country"
  | "company"
  | "jobTitle"
  | "number"
  | "boolean"
  | "date"
  | "datetime"
  | "loremSentence"
  | "loremParagraph"
  | "color"
  | "url"
  | "price"
  | "enum";

type Field = {
  id: string;
  name: string;
  type: FieldType;
  min: number;
  max: number;
  enumValues: string;
};

const TYPE_OPTIONS: { value: FieldType; label: string }[] = [
  { value: "uuid", label: "UUID" },
  { value: "autoincrement", label: "Auto Increment" },
  { value: "firstName", label: "First Name" },
  { value: "lastName", label: "Last Name" },
  { value: "fullName", label: "Full Name" },
  { value: "email", label: "Email" },
  { value: "username", label: "Username" },
  { value: "phone", label: "Phone" },
  { value: "street", label: "Street Address" },
  { value: "city", label: "City" },
  { value: "state", label: "State" },
  { value: "zip", label: "Zip" },
  { value: "country", label: "Country" },
  { value: "company", label: "Company" },
  { value: "jobTitle", label: "Job Title" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "date", label: "Date" },
  { value: "datetime", label: "DateTime" },
  { value: "loremSentence", label: "Lorem Sentence" },
  { value: "loremParagraph", label: "Lorem Paragraph" },
  { value: "color", label: "Color (hex)" },
  { value: "url", label: "URL" },
  { value: "price", label: "Price" },
  { value: "enum", label: "Enum" },
];

const FIRST_NAMES = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Daniel", "Nancy", "Matthew", "Lisa", "Anthony", "Margaret", "Mark", "Sandra", "Emily", "Olivia"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"];
const CITIES = ["Springfield", "Riverside", "Franklin", "Greenville", "Bristol", "Clinton", "Fairview", "Salem", "Madison", "Georgetown", "Arlington", "Ashland", "Burlington", "Manchester", "Oxford", "Auburn", "Dayton", "Lexington", "Milford", "Newport"];
const COMPANIES = ["Acme Corp", "Globex", "Initech", "Umbrella Co", "Stark Industries", "Wayne Enterprises", "Soylent", "Hooli", "Vandelay", "Wonka Inc", "Cyberdyne", "Massive Dynamic", "Pied Piper", "Aperture Labs", "Tyrell Corp"];
const JOB_TITLES = ["Software Engineer", "Product Manager", "Data Analyst", "UX Designer", "Marketing Lead", "Sales Director", "Account Manager", "DevOps Engineer", "QA Tester", "Project Coordinator", "Business Analyst", "HR Specialist", "Operations Manager", "Content Strategist", "Solutions Architect"];
const LOREM = ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "eiusmod", "tempor", "incididunt", "labore", "magna", "aliqua", "veniam", "quis", "nostrud", "ullamco", "laboris"];
const DOMAINS = ["example.com", "mail.com", "test.org", "demo.net", "inbox.io", "fastmail.com", "webmail.co", "sample.dev"];
const STATES = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];
const COUNTRIES = ["United States", "Canada", "United Kingdom", "Germany", "France", "Australia", "Japan", "Brazil", "India", "Mexico", "Spain", "Italy", "Netherlands", "Sweden", "Norway"];
const STREETS = ["Main St", "Oak Ave", "Maple Dr", "Cedar Ln", "Elm St", "Pine Rd", "Washington Ave", "Park Blvd", "Lake St", "Hill Rd", "Sunset Blvd", "Church St", "Highland Ave", "River Rd", "Spring St"];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function uuid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function loremSentence(): string {
  const len = randomInt(6, 12);
  const words: string[] = [];
  for (let i = 0; i < len; i++) words.push(randomItem(LOREM));
  const s = words.join(" ");
  return s.charAt(0).toUpperCase() + s.slice(1) + ".";
}

function loremParagraph(): string {
  const count = randomInt(3, 6);
  const sentences: string[] = [];
  for (let i = 0; i < count; i++) sentences.push(loremSentence());
  return sentences.join(" ");
}

function randomDate(withTime: boolean): string {
  const now = Date.now();
  const fiveYears = 5 * 365 * 24 * 60 * 60 * 1000;
  const ts = now - Math.floor(Math.random() * fiveYears);
  const d = new Date(ts);
  return withTime ? d.toISOString() : d.toISOString().slice(0, 10);
}

function generateValue(field: Field, index: number): string | number | boolean {
  switch (field.type) {
    case "uuid":
      return uuid();
    case "autoincrement":
      return index + 1;
    case "firstName":
      return randomItem(FIRST_NAMES);
    case "lastName":
      return randomItem(LAST_NAMES);
    case "fullName":
      return `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`;
    case "email": {
      const first = randomItem(FIRST_NAMES).toLowerCase();
      const last = randomItem(LAST_NAMES).toLowerCase();
      return `${first}.${last}@${randomItem(DOMAINS)}`;
    }
    case "username": {
      const first = randomItem(FIRST_NAMES).toLowerCase();
      const last = randomItem(LAST_NAMES).toLowerCase();
      return `${first}_${last}${randomInt(1, 999)}`;
    }
    case "phone":
      return `(${randomInt(200, 999)}) ${randomInt(200, 999)}-${String(randomInt(0, 9999)).padStart(4, "0")}`;
    case "street":
      return `${randomInt(1, 9999)} ${randomItem(STREETS)}`;
    case "city":
      return randomItem(CITIES);
    case "state":
      return randomItem(STATES);
    case "zip":
      return String(randomInt(10000, 99999));
    case "country":
      return randomItem(COUNTRIES);
    case "company":
      return randomItem(COMPANIES);
    case "jobTitle":
      return randomItem(JOB_TITLES);
    case "number": {
      const lo = Number.isFinite(field.min) ? field.min : 0;
      const hi = Number.isFinite(field.max) ? field.max : 100;
      return randomInt(Math.min(lo, hi), Math.max(lo, hi));
    }
    case "boolean":
      return Math.random() < 0.5;
    case "date":
      return randomDate(false);
    case "datetime":
      return randomDate(true);
    case "loremSentence":
      return loremSentence();
    case "loremParagraph":
      return loremParagraph();
    case "color":
      return "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");
    case "url":
      return `https://${randomItem(["www", "app", "shop", "blog"])}.${randomItem(COMPANIES).toLowerCase().replace(/[^a-z]/g, "")}.com`;
    case "price":
      return parseFloat((randomInt(1, 999) + Math.random()).toFixed(2));
    case "enum": {
      const opts = field.enumValues.split(",").map((v) => v.trim()).filter(Boolean);
      return opts.length ? randomItem(opts) : "";
    }
    default:
      return "";
  }
}

function csvEscape(value: string | number | boolean): string {
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function sqlValue(value: string | number | boolean): string {
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  return `'${String(value).replace(/'/g, "''")}'`;
}

let fieldCounter = 0;
function newField(partial: Partial<Field>): Field {
  fieldCounter += 1;
  return {
    id: `f${Date.now()}_${fieldCounter}`,
    name: "field",
    type: "firstName",
    min: 0,
    max: 100,
    enumValues: "",
    ...partial,
  };
}

const DEFAULT_FIELDS: Field[] = [
  newField({ name: "id", type: "uuid" }),
  newField({ name: "firstName", type: "firstName" }),
  newField({ name: "lastName", type: "lastName" }),
  newField({ name: "email", type: "email" }),
  newField({ name: "age", type: "number", min: 18, max: 80 }),
  newField({ name: "createdAt", type: "datetime" }),
];

type Format = "json" | "csv" | "sql";

export default function MockDataPage() {
  const [fields, setFields] = useState<Field[]>(DEFAULT_FIELDS);
  const [rowCount, setRowCount] = useState(10);
  const [format, setFormat] = useState<Format>("json");
  const [tableName, setTableName] = useState("users");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    const count = Math.max(1, Math.min(1000, rowCount || 1));
    const active = fields.filter((f) => f.name.trim());
    if (!active.length) {
      setOutput("");
      return;
    }
    const records: Record<string, string | number | boolean>[] = [];
    for (let i = 0; i < count; i++) {
      const row: Record<string, string | number | boolean> = {};
      for (const f of active) {
        row[f.name] = generateValue(f, i);
      }
      records.push(row);
    }

    if (format === "json") {
      setOutput(JSON.stringify(records, null, 2));
      return;
    }

    const cols = active.map((f) => f.name);

    if (format === "csv") {
      const lines = [cols.map(csvEscape).join(",")];
      for (const rec of records) {
        lines.push(cols.map((c) => csvEscape(rec[c])).join(","));
      }
      setOutput(lines.join("\n"));
      return;
    }

    const table = tableName.trim() || "users";
    const colList = cols.join(", ");
    const valueRows = records.map((rec) => `(${cols.map((c) => sqlValue(rec[c])).join(", ")})`);
    setOutput(`INSERT INTO \`${table}\` (${colList}) VALUES\n${valueRows.join(",\n")};`);
  }, [fields, rowCount, format, tableName]);

  useEffect(() => {
    generate();
  }, [generate]);

  const updateField = (id: string, patch: Partial<Field>) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const removeField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const addField = () => {
    setFields((prev) => [...prev, newField({ name: `field${prev.length + 1}`, type: "firstName" })]);
  };

  const copy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    if (!output) return;
    const ext = format === "json" ? "json" : format === "csv" ? "csv" : "sql";
    const mime = format === "json" ? "application/json" : format === "csv" ? "text/csv" : "text/plain";
    const blob = new Blob([output], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mock-data.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const rowLines = format === "json" ? Math.min(1000, Math.max(1, rowCount || 1)) : output ? output.split("\n").length : 0;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors group">
          <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          All tools
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Database className="w-6 h-6 text-blue-500" />
          <h1 className="text-2xl font-semibold text-slate-100">Mock Data Generator</h1>
        </div>
        <p className="text-slate-400 text-sm mb-8">Build a schema and generate fake records as JSON, CSV, or SQL.</p>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-slate-200">Schema</h2>
                <button onClick={addField} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors border border-slate-700/60">
                  <Plus className="w-3.5 h-3.5" />
                  Add Field
                </button>
              </div>

              <div className="space-y-3">
                {fields.map((field) => (
                  <div key={field.id} className="space-y-2 pb-3 border-b border-slate-800/60 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <input
                        value={field.name}
                        onChange={(e) => updateField(field.id, { name: e.target.value })}
                        placeholder="field name"
                        className="flex-1 bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors"
                      />
                      <select
                        value={field.type}
                        onChange={(e) => updateField(field.id, { type: e.target.value as FieldType })}
                        className="flex-1 bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors"
                      >
                        {TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeField(field.id)}
                        className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                        aria-label="Remove field"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {field.type === "number" && (
                      <div className="flex items-center gap-2 pl-1">
                        <input
                          type="number"
                          value={field.min}
                          onChange={(e) => updateField(field.id, { min: Number(e.target.value) })}
                          placeholder="min"
                          className="w-24 bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors"
                        />
                        <span className="text-slate-500 text-xs">to</span>
                        <input
                          type="number"
                          value={field.max}
                          onChange={(e) => updateField(field.id, { max: Number(e.target.value) })}
                          placeholder="max"
                          className="w-24 bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors"
                        />
                      </div>
                    )}

                    {field.type === "enum" && (
                      <input
                        value={field.enumValues}
                        onChange={(e) => updateField(field.id, { enumValues: e.target.value })}
                        placeholder="comma,separated,values"
                        className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors"
                      />
                    )}
                  </div>
                ))}
                {!fields.length && <p className="text-slate-500 text-sm">No fields. Add one to start.</p>}
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Rows</label>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={rowCount}
                  onChange={(e) => setRowCount(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Format</label>
                <div className="inline-flex rounded-lg border border-slate-700/60 overflow-hidden">
                  {(["json", "csv", "sql"] as Format[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFormat(f)}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${format === f ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-400 hover:text-slate-200"}`}
                    >
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {format === "sql" && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Table name</label>
                  <input
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    placeholder="users"
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors"
                  />
                </div>
              )}

              <button onClick={generate} className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
                Generate
              </button>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-slate-200">Output</h2>
              <div className="flex items-center gap-2">
                <button onClick={copy} className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors border border-slate-700/60">
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button onClick={download} className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors border border-slate-700/60">
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>
            </div>

            <textarea
              readOnly
              value={output}
              rows={18}
              className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500/60 transition-colors resize-none"
            />

            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
              <span>{rowLines} {format === "json" ? "rows" : "lines"}</span>
              <span>{output.length} chars</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
