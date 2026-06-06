"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, FileText, Plus, Trash2, Printer, Copy, Check } from "lucide-react";

interface LineItem {
  description: string;
  qty: string;
  unitPrice: string;
}

interface InvoiceForm {
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
  logoUrl: string;
  clientName: string;
  clientCompany: string;
  clientAddress: string;
  clientEmail: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  taxRate: string;
  discount: string;
  notes: string;
  paymentTerms: string;
}

const EMPTY: InvoiceForm = {
  companyName: "", companyAddress: "", companyEmail: "", companyPhone: "", logoUrl: "",
  clientName: "", clientCompany: "", clientAddress: "", clientEmail: "",
  invoiceNumber: "INV-001", issueDate: "", dueDate: "",
  currency: "USD", taxRate: "0", discount: "0",
  notes: "", paymentTerms: "Net 30",
};

const CURRENCIES: { code: string; symbol: string }[] = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "CAD", symbol: "CA$" },
  { code: "AUD", symbol: "A$" },
];

function fmt(val: number, symbol: string) {
  return `${symbol}${val.toFixed(2)}`;
}

function calcLine(item: LineItem) {
  const qty = parseFloat(item.qty) || 0;
  const price = parseFloat(item.unitPrice) || 0;
  return qty * price;
}

function buildInvoiceHtml(form: InvoiceForm, items: LineItem[]): string {
  const currencyObj = CURRENCIES.find(c => c.code === form.currency) ?? CURRENCIES[0];
  const sym = currencyObj.symbol;
  const subtotal = items.reduce((sum, it) => sum + calcLine(it), 0);
  const taxRate = parseFloat(form.taxRate) || 0;
  const discount = parseFloat(form.discount) || 0;
  const taxAmt = subtotal * (taxRate / 100);
  const total = subtotal + taxAmt - discount;

  const logoHtml = form.logoUrl
    ? `<img src="${form.logoUrl}" alt="Logo" style="max-height:60px;max-width:160px;object-fit:contain;" />`
    : "";

  const lineRows = items
    .filter(it => it.description || it.qty || it.unitPrice)
    .map(it => {
      const amt = calcLine(it);
      return `<tr>
        <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;">${it.description}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:center;">${it.qty}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:right;">${fmt(parseFloat(it.unitPrice) || 0, sym)}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:right;">${fmt(amt, sym)}</td>
      </tr>`;
    }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Invoice ${form.invoiceNumber}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; color: #111827; background: #fff; padding: 48px; max-width: 800px; margin: 0 auto; }
  @media print { body { padding: 24px; } .no-print { display: none !important; } }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
  .company-info p { margin-bottom: 2px; color: #374151; line-height: 1.5; white-space: pre-wrap; }
  .invoice-title { text-align: right; }
  .invoice-title h1 { font-size: 36px; font-weight: 700; letter-spacing: 2px; color: #1f2937; }
  .invoice-title .inv-num { font-size: 16px; color: #6b7280; margin-top: 4px; }
  .invoice-title .dates { margin-top: 12px; font-size: 13px; color: #6b7280; }
  .invoice-title .dates p { margin-bottom: 2px; }
  .bill-section { display: flex; gap: 40px; margin-bottom: 36px; }
  .bill-section .bill-to { flex: 1; }
  .bill-section h3 { font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #6b7280; margin-bottom: 8px; }
  .bill-section p { color: #374151; line-height: 1.6; white-space: pre-wrap; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  thead th { background: #f3f4f6; padding: 10px 8px; text-align: left; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; }
  thead th:not(:first-child) { text-align: right; }
  thead th:nth-child(3) { text-align: right; }
  .totals-section { display: flex; justify-content: flex-end; margin-bottom: 36px; }
  .totals-table { min-width: 240px; }
  .totals-table .row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; color: #4b5563; border-bottom: 1px solid #f3f4f6; }
  .totals-table .row.total { font-size: 16px; font-weight: 700; color: #111827; border-bottom: none; border-top: 2px solid #1f2937; padding-top: 10px; margin-top: 4px; }
  .footer-section p { font-size: 13px; color: #6b7280; line-height: 1.6; white-space: pre-wrap; }
  .footer-section h4 { font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #9ca3af; margin-bottom: 4px; }
  .footer-section { margin-bottom: 24px; }
  .print-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: #2563eb; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 32px; }
  .print-btn:hover { background: #1d4ed8; }
  hr.divider { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
</style>
</head>
<body>
<button class="no-print print-btn" onclick="window.print()">🖨 Print Invoice</button>

<div class="header">
  <div class="company-info">
    ${logoHtml ? `<div style="margin-bottom:12px;">${logoHtml}</div>` : ""}
    <p style="font-weight:700;font-size:16px;color:#111827;">${form.companyName}</p>
    <p>${form.companyAddress.replace(/\n/g, "<br>")}</p>
    ${form.companyEmail ? `<p>${form.companyEmail}</p>` : ""}
    ${form.companyPhone ? `<p>${form.companyPhone}</p>` : ""}
  </div>
  <div class="invoice-title">
    <h1>INVOICE</h1>
    <p class="inv-num">${form.invoiceNumber}</p>
    <div class="dates">
      ${form.issueDate ? `<p>Issue Date: <strong>${form.issueDate}</strong></p>` : ""}
      ${form.dueDate ? `<p>Due Date: <strong>${form.dueDate}</strong></p>` : ""}
    </div>
  </div>
</div>

<div class="bill-section">
  <div class="bill-to">
    <h3>Bill To</h3>
    <p style="font-weight:600;">${form.clientName}</p>
    ${form.clientCompany ? `<p>${form.clientCompany}</p>` : ""}
    <p>${form.clientAddress.replace(/\n/g, "<br>")}</p>
    ${form.clientEmail ? `<p>${form.clientEmail}</p>` : ""}
  </div>
</div>

<hr class="divider" />

<table>
  <thead>
    <tr>
      <th style="text-align:left;">Description</th>
      <th style="text-align:right;width:80px;">Qty</th>
      <th style="text-align:right;width:120px;">Unit Price</th>
      <th style="text-align:right;width:120px;">Amount</th>
    </tr>
  </thead>
  <tbody>${lineRows}</tbody>
</table>

<div class="totals-section">
  <div class="totals-table">
    <div class="row"><span>Subtotal</span><span>${fmt(subtotal, sym)}</span></div>
    ${taxRate > 0 ? `<div class="row"><span>Tax (${taxRate}%)</span><span>${fmt(taxAmt, sym)}</span></div>` : ""}
    ${discount > 0 ? `<div class="row"><span>Discount</span><span>-${fmt(discount, sym)}</span></div>` : ""}
    <div class="row total"><span>Total (${form.currency})</span><span>${fmt(total, sym)}</span></div>
  </div>
</div>

${form.notes ? `<div class="footer-section"><h4>Notes</h4><p>${form.notes}</p></div>` : ""}
${form.paymentTerms ? `<div class="footer-section"><h4>Payment Terms</h4><p>${form.paymentTerms}</p></div>` : ""}
</body>
</html>`;
}

export default function InvoiceGeneratorPage() {
  const [form, setForm] = useState<InvoiceForm>(EMPTY);
  const [items, setItems] = useState<LineItem[]>([
    { description: "", qty: "1", unitPrice: "" },
    { description: "", qty: "1", unitPrice: "" },
    { description: "", qty: "1", unitPrice: "" },
  ]);
  const [htmlCopied, setHtmlCopied] = useState(false);

  const set = (key: keyof InvoiceForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));

  const updateItem = (idx: number, key: keyof LineItem, val: string) => {
    const next = [...items];
    next[idx] = { ...next[idx], [key]: val };
    setItems(next);
  };

  const addItem = () => setItems([...items, { description: "", qty: "1", unitPrice: "" }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  const currencyObj = CURRENCIES.find(c => c.code === form.currency) ?? CURRENCIES[0];
  const sym = currencyObj.symbol;
  const subtotal = items.reduce((sum, it) => sum + calcLine(it), 0);
  const taxRate = parseFloat(form.taxRate) || 0;
  const discount = parseFloat(form.discount) || 0;
  const taxAmt = subtotal * (taxRate / 100);
  const total = subtotal + taxAmt - discount;

  const preview = () => {
    const html = buildInvoiceHtml(form, items);
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); }
  };

  const copyHtml = async () => {
    const html = buildInvoiceHtml(form, items);
    try { await navigator.clipboard.writeText(html); } catch { return; }
    setHtmlCopied(true);
    setTimeout(() => setHtmlCopied(false), 1500);
  };

  const ic = "w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors";
  const lc = "text-slate-400 text-xs mb-1 block";

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors group">
          <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          All tools
        </Link>

        <div className="mb-8 flex items-center gap-3">
          <FileText className="w-7 h-7 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Invoice Generator</h1>
            <p className="text-slate-500 text-sm">Create and print professional invoices instantly.</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 space-y-3">
              <h2 className="text-white text-sm font-semibold">Your Business</h2>
              <div>
                <label className={lc}>Company Name</label>
                <input className={ic} value={form.companyName} onChange={set("companyName")} placeholder="Acme Inc" />
              </div>
              <div>
                <label className={lc}>Address</label>
                <textarea className={ic + " resize-none"} rows={3} value={form.companyAddress} onChange={set("companyAddress")} placeholder={"123 Main St\nNew York, NY 10001"} />
              </div>
              <div>
                <label className={lc}>Email</label>
                <input className={ic} value={form.companyEmail} onChange={set("companyEmail")} placeholder="hello@acme.com" />
              </div>
              <div>
                <label className={lc}>Phone</label>
                <input className={ic} value={form.companyPhone} onChange={set("companyPhone")} placeholder="+1 555 0100" />
              </div>
              <div>
                <label className={lc}>Logo URL <span className="text-slate-600">(optional)</span></label>
                <input className={ic} value={form.logoUrl} onChange={set("logoUrl")} placeholder="https://acme.com/logo.png" />
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 space-y-3">
              <h2 className="text-white text-sm font-semibold">Bill To</h2>
              <div>
                <label className={lc}>Client Name</label>
                <input className={ic} value={form.clientName} onChange={set("clientName")} placeholder="Jane Smith" />
              </div>
              <div>
                <label className={lc}>Client Company</label>
                <input className={ic} value={form.clientCompany} onChange={set("clientCompany")} placeholder="Widget Co" />
              </div>
              <div>
                <label className={lc}>Address</label>
                <textarea className={ic + " resize-none"} rows={3} value={form.clientAddress} onChange={set("clientAddress")} placeholder={"456 Oak Ave\nBoston, MA 02101"} />
              </div>
              <div>
                <label className={lc}>Email</label>
                <input className={ic} value={form.clientEmail} onChange={set("clientEmail")} placeholder="jane@widget.co" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
            <h2 className="text-white text-sm font-semibold mb-3">Invoice Details</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className={lc}>Invoice #</label>
                <input className={ic} value={form.invoiceNumber} onChange={set("invoiceNumber")} placeholder="INV-001" />
              </div>
              <div>
                <label className={lc}>Issue Date</label>
                <input type="date" className={ic} value={form.issueDate} onChange={set("issueDate")} />
              </div>
              <div>
                <label className={lc}>Due Date</label>
                <input type="date" className={ic} value={form.dueDate} onChange={set("dueDate")} />
              </div>
              <div>
                <label className={lc}>Currency</label>
                <select className={ic} value={form.currency} onChange={set("currency")}>
                  {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
            <h2 className="text-white text-sm font-semibold mb-3">Line Items</h2>
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs text-slate-500 font-medium px-1">
                <div className="col-span-5">Description</div>
                <div className="col-span-2 text-right">Qty</div>
                <div className="col-span-3 text-right">Unit Price</div>
                <div className="col-span-2 text-right">Amount</div>
              </div>
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <input
                      className={ic}
                      value={item.description}
                      onChange={e => updateItem(idx, "description", e.target.value)}
                      placeholder="Service or product"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      className={ic + " text-right"}
                      type="number"
                      value={item.qty}
                      onChange={e => updateItem(idx, "qty", e.target.value)}
                      placeholder="1"
                      min="0"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      className={ic + " text-right"}
                      type="number"
                      value={item.unitPrice}
                      onChange={e => updateItem(idx, "unitPrice", e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="col-span-1 text-right text-sm text-slate-300 font-mono">
                    {sym}{calcLine(item).toFixed(2)}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => removeItem(idx)}
                      className="p-1 text-slate-600 hover:text-red-400 transition-colors"
                      disabled={items.length <= 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={addItem}
                className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm transition-colors mt-1"
              >
                <Plus className="w-4 h-4" />
                Add line item
              </button>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800/60 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className={lc}>Tax Rate (%)</label>
                <input type="number" className={ic} value={form.taxRate} onChange={set("taxRate")} placeholder="0" min="0" max="100" step="0.1" />
              </div>
              <div>
                <label className={lc}>Discount ({sym})</label>
                <input type="number" className={ic} value={form.discount} onChange={set("discount")} placeholder="0" min="0" step="0.01" />
              </div>
              <div className="col-span-2 flex flex-col justify-end items-end gap-1 text-sm">
                <div className="flex justify-between w-full text-slate-400">
                  <span>Subtotal</span><span className="font-mono">{fmt(subtotal, sym)}</span>
                </div>
                {taxRate > 0 && (
                  <div className="flex justify-between w-full text-slate-400">
                    <span>Tax ({taxRate}%)</span><span className="font-mono">{fmt(taxAmt, sym)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between w-full text-slate-400">
                    <span>Discount</span><span className="font-mono">-{fmt(discount, sym)}</span>
                  </div>
                )}
                <div className="flex justify-between w-full text-white font-semibold text-base border-t border-slate-700 pt-1 mt-0.5">
                  <span>Total</span><span className="font-mono">{fmt(total, sym)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 space-y-3">
            <h2 className="text-white text-sm font-semibold">Additional Info</h2>
            <div>
              <label className={lc}>Notes <span className="text-slate-600">(optional)</span></label>
              <textarea className={ic + " resize-none"} rows={3} value={form.notes} onChange={set("notes")} placeholder="Thank you for your business!" />
            </div>
            <div>
              <label className={lc}>Payment Terms</label>
              <textarea className={ic + " resize-none"} rows={2} value={form.paymentTerms} onChange={set("paymentTerms")} placeholder="Net 30" />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={preview}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              Preview Invoice
            </button>
            <button
              onClick={copyHtml}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${htmlCopied ? "bg-green-600/20 border border-green-500/40 text-green-400" : "bg-slate-800 hover:bg-slate-700 text-slate-300"}`}
            >
              {htmlCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {htmlCopied ? "Copied!" : "Copy as HTML"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
