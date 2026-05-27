"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const CURRENCY_NAMES: Record<string, string> = {
  AED: "UAE Dirham — United Arab Emirates",
  AFN: "Afghan Afghani — Afghanistan",
  ALL: "Albanian Lek — Albania",
  AMD: "Armenian Dram — Armenia",
  ANG: "Netherlands Antillean Guilder — Curaçao / Sint Maarten",
  AOA: "Angolan Kwanza — Angola",
  ARS: "Argentine Peso — Argentina",
  AUD: "Australian Dollar — Australia",
  AWG: "Aruban Florin — Aruba",
  AZN: "Azerbaijani Manat — Azerbaijan",
  BAM: "Bosnia-Herzegovina Convertible Mark — Bosnia & Herzegovina",
  BBD: "Barbadian Dollar — Barbados",
  BDT: "Bangladeshi Taka — Bangladesh",
  BGN: "Bulgarian Lev — Bulgaria",
  BHD: "Bahraini Dinar — Bahrain",
  BIF: "Burundian Franc — Burundi",
  BMD: "Bermudian Dollar — Bermuda",
  BND: "Brunei Dollar — Brunei",
  BOB: "Bolivian Boliviano — Bolivia",
  BRL: "Brazilian Real — Brazil",
  BSD: "Bahamian Dollar — Bahamas",
  BTN: "Bhutanese Ngultrum — Bhutan",
  BWP: "Botswanan Pula — Botswana",
  BYN: "Belarusian Ruble — Belarus",
  BZD: "Belize Dollar — Belize",
  CAD: "Canadian Dollar — Canada",
  CDF: "Congolese Franc — DR Congo",
  CHF: "Swiss Franc — Switzerland",
  CLP: "Chilean Peso — Chile",
  CNY: "Chinese Yuan — China",
  COP: "Colombian Peso — Colombia",
  CRC: "Costa Rican Colón — Costa Rica",
  CUP: "Cuban Peso — Cuba",
  CVE: "Cape Verdean Escudo — Cape Verde",
  CZK: "Czech Koruna — Czech Republic",
  DJF: "Djiboutian Franc — Djibouti",
  DKK: "Danish Krone — Denmark",
  DOP: "Dominican Peso — Dominican Republic",
  DZD: "Algerian Dinar — Algeria",
  EGP: "Egyptian Pound — Egypt",
  ERN: "Eritrean Nakfa — Eritrea",
  ETB: "Ethiopian Birr — Ethiopia",
  EUR: "Euro — Eurozone",
  FJD: "Fijian Dollar — Fiji",
  FKP: "Falkland Islands Pound — Falkland Islands",
  FOK: "Faroese Króna — Faroe Islands",
  GBP: "British Pound Sterling — United Kingdom",
  GEL: "Georgian Lari — Georgia",
  GGP: "Guernsey Pound — Guernsey",
  GHS: "Ghanaian Cedi — Ghana",
  GIP: "Gibraltar Pound — Gibraltar",
  GMD: "Gambian Dalasi — Gambia",
  GNF: "Guinean Franc — Guinea",
  GTQ: "Guatemalan Quetzal — Guatemala",
  GYD: "Guyanese Dollar — Guyana",
  HKD: "Hong Kong Dollar — Hong Kong",
  HNL: "Honduran Lempira — Honduras",
  HRK: "Croatian Kuna — Croatia",
  HTG: "Haitian Gourde — Haiti",
  HUF: "Hungarian Forint — Hungary",
  IDR: "Indonesian Rupiah — Indonesia",
  ILS: "Israeli New Shekel — Israel",
  IMP: "Isle of Man Pound — Isle of Man",
  INR: "Indian Rupee — India",
  IQD: "Iraqi Dinar — Iraq",
  IRR: "Iranian Rial — Iran",
  ISK: "Icelandic Króna — Iceland",
  JEP: "Jersey Pound — Jersey",
  JMD: "Jamaican Dollar — Jamaica",
  JOD: "Jordanian Dinar — Jordan",
  JPY: "Japanese Yen — Japan",
  KES: "Kenyan Shilling — Kenya",
  KGS: "Kyrgyzstani Som — Kyrgyzstan",
  KHR: "Cambodian Riel — Cambodia",
  KID: "Kiribati Dollar — Kiribati",
  KMF: "Comorian Franc — Comoros",
  KRW: "South Korean Won — South Korea",
  KWD: "Kuwaiti Dinar — Kuwait",
  KYD: "Cayman Islands Dollar — Cayman Islands",
  KZT: "Kazakhstani Tenge — Kazakhstan",
  LAK: "Laotian Kip — Laos",
  LBP: "Lebanese Pound — Lebanon",
  LKR: "Sri Lankan Rupee — Sri Lanka",
  LRD: "Liberian Dollar — Liberia",
  LSL: "Lesotho Loti — Lesotho",
  LYD: "Libyan Dinar — Libya",
  MAD: "Moroccan Dirham — Morocco",
  MDL: "Moldovan Leu — Moldova",
  MGA: "Malagasy Ariary — Madagascar",
  MKD: "Macedonian Denar — North Macedonia",
  MMK: "Myanmar Kyat — Myanmar",
  MNT: "Mongolian Tögrög — Mongolia",
  MOP: "Macanese Pataca — Macao",
  MRU: "Mauritanian Ouguiya — Mauritania",
  MUR: "Mauritian Rupee — Mauritius",
  MVR: "Maldivian Rufiyaa — Maldives",
  MWK: "Malawian Kwacha — Malawi",
  MXN: "Mexican Peso — Mexico",
  MYR: "Malaysian Ringgit — Malaysia",
  MZN: "Mozambican Metical — Mozambique",
  NAD: "Namibian Dollar — Namibia",
  NGN: "Nigerian Naira — Nigeria",
  NIO: "Nicaraguan Córdoba — Nicaragua",
  NOK: "Norwegian Krone — Norway",
  NPR: "Nepalese Rupee — Nepal",
  NZD: "New Zealand Dollar — New Zealand",
  OMR: "Omani Rial — Oman",
  PAB: "Panamanian Balboa — Panama",
  PEN: "Peruvian Sol — Peru",
  PGK: "Papua New Guinean Kina — Papua New Guinea",
  PHP: "Philippine Peso — Philippines",
  PKR: "Pakistani Rupee — Pakistan",
  PLN: "Polish Złoty — Poland",
  PYG: "Paraguayan Guaraní — Paraguay",
  QAR: "Qatari Riyal — Qatar",
  RON: "Romanian Leu — Romania",
  RSD: "Serbian Dinar — Serbia",
  RUB: "Russian Ruble — Russia",
  RWF: "Rwandan Franc — Rwanda",
  SAR: "Saudi Riyal — Saudi Arabia",
  SBD: "Solomon Islands Dollar — Solomon Islands",
  SCR: "Seychellois Rupee — Seychelles",
  SDG: "Sudanese Pound — Sudan",
  SEK: "Swedish Krona — Sweden",
  SGD: "Singapore Dollar — Singapore",
  SHP: "Saint Helena Pound — Saint Helena",
  SLE: "Sierra Leonean Leone — Sierra Leone",
  SLL: "Sierra Leonean Leone (old) — Sierra Leone",
  SOS: "Somali Shilling — Somalia",
  SRD: "Surinamese Dollar — Suriname",
  SSP: "South Sudanese Pound — South Sudan",
  STN: "São Tomé & Príncipe Dobra — São Tomé & Príncipe",
  SYP: "Syrian Pound — Syria",
  SZL: "Swazi Lilangeni — Eswatini",
  THB: "Thai Baht — Thailand",
  TJS: "Tajikistani Somoni — Tajikistan",
  TMT: "Turkmenistan Manat — Turkmenistan",
  TND: "Tunisian Dinar — Tunisia",
  TOP: "Tongan Paʻanga — Tonga",
  TRY: "Turkish Lira — Turkey",
  TTD: "Trinidad & Tobago Dollar — Trinidad & Tobago",
  TVD: "Tuvaluan Dollar — Tuvalu",
  TWD: "New Taiwan Dollar — Taiwan",
  TZS: "Tanzanian Shilling — Tanzania",
  UAH: "Ukrainian Hryvnia — Ukraine",
  UGX: "Ugandan Shilling — Uganda",
  USD: "US Dollar — United States",
  UYU: "Uruguayan Peso — Uruguay",
  UZS: "Uzbekistani Som — Uzbekistan",
  VES: "Venezuelan Bolívar — Venezuela",
  VND: "Vietnamese Đồng — Vietnam",
  VUV: "Vanuatu Vatu — Vanuatu",
  WST: "Samoan Tālā — Samoa",
  XAF: "Central African CFA Franc — Central Africa",
  XCD: "East Caribbean Dollar — Eastern Caribbean",
  XDR: "Special Drawing Rights — IMF",
  XOF: "West African CFA Franc — West Africa",
  XPF: "CFP Franc — French Polynesia",
  YER: "Yemeni Rial — Yemen",
  ZAR: "South African Rand — South Africa",
  ZMW: "Zambian Kwacha — Zambia",
  ZWL: "Zimbabwean Dollar — Zimbabwe",
};

const POPULAR = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR", "MXN", "BRL", "SGD", "HKD", "NOK", "KRW", "AED", "ZAR", "NZD", "SEK", "DKK"];

function currencyLabel(code: string) {
  const name = CURRENCY_NAMES[code];
  if (!name) return code;
  const [currencyName] = name.split(" — ");
  return `${code} — ${currencyName}`;
}

export default function CurrencyConverterPage() {
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const [amount, setAmount] = useState("1");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/USD")
      .then(r => r.json())
      .then(data => {
        if (data.result === "success") {
          setRates(data.rates);
          setLastUpdated(new Date(data.time_last_update_unix * 1000).toLocaleDateString());
        } else {
          setError("Failed to load exchange rates.");
        }
      })
      .catch(() => setError("Network error: could not load rates."))
      .finally(() => setLoading(false));
  }, []);

  const swap = useCallback(() => { setFrom(to); setTo(from); }, [from, to]);

  const convert = (amt: string, f: string, t: string) => {
    if (!rates || !amt || isNaN(+amt)) return "";
    const inUsd = +amt / rates[f];
    return (inUsd * rates[t]).toLocaleString("en-US", { maximumFractionDigits: 4 });
  };

  const result = convert(amount, from, to);
  const currencies = rates ? Object.keys(rates).sort() : POPULAR;

  const fromName = CURRENCY_NAMES[from]?.split(" — ")[1] ?? from;
  const toName = CURRENCY_NAMES[to]?.split(" — ")[1] ?? to;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Currency Converter</h1>
        <p className="text-slate-500 text-sm mb-8">
          Live exchange rates.{lastUpdated && <span className="text-slate-600"> Updated {lastUpdated}.</span>}
        </p>

        {loading && <div className="text-center py-12 text-slate-500 text-sm">Loading exchange rates…</div>}
        {error && <div className="bg-red-950/40 border border-red-800/60 rounded-xl p-4 text-red-400 text-sm">{error}</div>}

        {!loading && !error && rates && (
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 space-y-4">
              {/* Amount */}
              <div>
                <label className="text-slate-400 text-xs mb-1.5 block">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-lg font-mono focus:outline-none focus:border-blue-500"
                  min="0"
                />
              </div>

              {/* From / Swap / To */}
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="text-slate-400 text-xs mb-1.5 block">From</label>
                  <select
                    value={from}
                    onChange={e => setFrom(e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500">
                    {currencies.map(c => (
                      <option key={c} value={c}>{currencyLabel(c)}</option>
                    ))}
                  </select>
                </div>
                <button onClick={swap}
                  className="mb-0.5 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg transition-colors text-sm">
                  ⇄
                </button>
                <div className="flex-1">
                  <label className="text-slate-400 text-xs mb-1.5 block">To</label>
                  <select
                    value={to}
                    onChange={e => setTo(e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500">
                    {currencies.map(c => (
                      <option key={c} value={c}>{currencyLabel(c)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Result */}
              {result && (
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 text-center">
                  <p className="text-slate-400 text-sm mb-1">{amount} {from} ({fromName}) =</p>
                  <p className="text-white text-3xl font-bold">{result}</p>
                  <p className="text-slate-400 text-base mt-1">{to}: {toName}</p>
                  <p className="text-slate-500 text-xs mt-2">
                    1 {from} = {(rates[to] / rates[from]).toLocaleString("en-US", { maximumFractionDigits: 6 })} {to}
                  </p>
                </div>
              )}
            </div>

            {/* Quick conversions */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
              <p className="text-white text-sm font-medium mb-3">Quick conversions from {from}</p>
              <div className="space-y-1">
                {POPULAR.filter(c => c !== from).slice(0, 12).map(c => {
                  const name = CURRENCY_NAMES[c];
                  const [cName, country] = name ? name.split(" — ") : [c, ""];
                  return (
                    <button
                      key={c}
                      onClick={() => setTo(c)}
                      className={`w-full flex justify-between items-center px-3 py-2 rounded-lg text-xs transition-colors ${to === c ? "bg-blue-600/30 border border-blue-500/40 text-blue-300" : "bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-white"}`}>
                      <span className="flex items-center gap-2">
                        <span className="font-mono font-bold w-10 text-left">{c}</span>
                        <span className="text-slate-500">{cName}{country ? ` · ${country}` : ""}</span>
                      </span>
                      <span className="font-mono">{convert("1", from, c)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
