"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type Unit = { label: string; factor: number };
type Category = { name: string; base: string; units: Unit[]; special?: string };

const CATEGORIES: Category[] = [
  {
    name: "Length", base: "m",
    units: [
      { label: "Millimeter (mm)", factor: 0.001 },
      { label: "Centimeter (cm)", factor: 0.01 },
      { label: "Meter (m)", factor: 1 },
      { label: "Kilometer (km)", factor: 1000 },
      { label: "Inch (in)", factor: 0.0254 },
      { label: "Foot (ft)", factor: 0.3048 },
      { label: "Yard (yd)", factor: 0.9144 },
      { label: "Mile (mi)", factor: 1609.344 },
      { label: "Nautical mile (nmi)", factor: 1852 },
    ],
  },
  {
    name: "Weight", base: "kg",
    units: [
      { label: "Milligram (mg)", factor: 0.000001 },
      { label: "Gram (g)", factor: 0.001 },
      { label: "Kilogram (kg)", factor: 1 },
      { label: "Metric ton (t)", factor: 1000 },
      { label: "Ounce (oz)", factor: 0.0283495 },
      { label: "Pound (lb)", factor: 0.453592 },
      { label: "Stone (st)", factor: 6.35029 },
    ],
  },
  {
    name: "Temperature", base: "c",
    units: [
      { label: "Celsius (°C)", factor: 1 },
      { label: "Fahrenheit (°F)", factor: 1 },
      { label: "Kelvin (K)", factor: 1 },
    ],
  },
  {
    name: "Area", base: "m²",
    units: [
      { label: "Square mm", factor: 0.000001 },
      { label: "Square cm", factor: 0.0001 },
      { label: "Square meter", factor: 1 },
      { label: "Hectare", factor: 10000 },
      { label: "Square km", factor: 1000000 },
      { label: "Square inch", factor: 0.00064516 },
      { label: "Square foot", factor: 0.092903 },
      { label: "Acre", factor: 4046.86 },
      { label: "Square mile", factor: 2589988 },
    ],
  },
  {
    name: "Volume", base: "L",
    units: [
      { label: "Milliliter (mL)", factor: 0.001 },
      { label: "Liter (L)", factor: 1 },
      { label: "Cubic meter (m³)", factor: 1000 },
      { label: "Teaspoon (US)", factor: 0.00492892 },
      { label: "Tablespoon (US)", factor: 0.0147868 },
      { label: "Fluid ounce (US)", factor: 0.0295735 },
      { label: "Cup (US)", factor: 0.236588 },
      { label: "Pint (US)", factor: 0.473176 },
      { label: "Quart (US)", factor: 0.946353 },
      { label: "Gallon (US)", factor: 3.78541 },
    ],
  },
  {
    name: "Speed", base: "m/s",
    units: [
      { label: "Meter/second (m/s)", factor: 1 },
      { label: "Kilometer/hour (km/h)", factor: 0.277778 },
      { label: "Mile/hour (mph)", factor: 0.44704 },
      { label: "Foot/second (ft/s)", factor: 0.3048 },
      { label: "Knot (kn)", factor: 0.514444 },
    ],
  },
  {
    name: "Data", base: "B",
    units: [
      { label: "Bit (b)", factor: 0.125 },
      { label: "Byte (B)", factor: 1 },
      { label: "Kilobyte (KB)", factor: 1024 },
      { label: "Megabyte (MB)", factor: 1048576 },
      { label: "Gigabyte (GB)", factor: 1073741824 },
      { label: "Terabyte (TB)", factor: 1099511627776 },
    ],
  },
  {
    name: "Energy", base: "J",
    units: [
      { label: "Joule (J)", factor: 1 },
      { label: "Kilojoule (kJ)", factor: 1000 },
      { label: "Calorie (cal)", factor: 4.184 },
      { label: "Kilocalorie (kcal)", factor: 4184 },
      { label: "Watt-hour (Wh)", factor: 3600 },
      { label: "Kilowatt-hour (kWh)", factor: 3600000 },
      { label: "BTU", factor: 1055.06 },
      { label: "Electronvolt (eV)", factor: 1.60218e-19 },
    ],
  },
  {
    name: "Pressure", base: "Pa",
    units: [
      { label: "Pascal (Pa)", factor: 1 },
      { label: "Kilopascal (kPa)", factor: 1000 },
      { label: "Megapascal (MPa)", factor: 1000000 },
      { label: "Bar", factor: 100000 },
      { label: "Millibar (mbar)", factor: 100 },
      { label: "PSI", factor: 6894.76 },
      { label: "Atmosphere (atm)", factor: 101325 },
      { label: "mmHg / Torr", factor: 133.322 },
    ],
  },
  {
    name: "Angle", base: "°",
    units: [
      { label: "Degree (°)", factor: 1 },
      { label: "Radian (rad)", factor: 180 / Math.PI },
      { label: "Gradian (grad)", factor: 0.9 },
      { label: "Arcminute (')", factor: 1 / 60 },
      { label: "Arcsecond (\")", factor: 1 / 3600 },
      { label: "Turn / Revolution", factor: 360 },
    ],
  },
  {
    name: "Fuel", base: "L/100km", special: "fuel",
    units: [
      { label: "L/100km", factor: 1 },
      { label: "km/L", factor: 1 },
      { label: "MPG (US)", factor: 1 },
      { label: "MPG (UK)", factor: 1 },
    ],
  },
];

function convertFuel(value: number, from: string, to: string): number {
  const toL100: Record<string, (v: number) => number> = {
    "L/100km": v => v,
    "km/L": v => 100 / v,
    "MPG (US)": v => 235.214 / v,
    "MPG (UK)": v => 282.481 / v,
  };
  const fromL100: Record<string, (v: number) => number> = {
    "L/100km": v => v,
    "km/L": v => 100 / v,
    "MPG (US)": v => 235.214 / v,
    "MPG (UK)": v => 282.481 / v,
  };
  const base = (toL100[from] ?? (v => v))(value);
  return (fromL100[to] ?? (v => v))(base);
}

function convertTemp(value: number, from: string, to: string): number {
  const toC: Record<string, (v: number) => number> = {
    "Celsius (°C)": v => v,
    "Fahrenheit (°F)": v => (v - 32) * 5 / 9,
    "Kelvin (K)": v => v - 273.15,
  };
  const fromC: Record<string, (v: number) => number> = {
    "Celsius (°C)": v => v,
    "Fahrenheit (°F)": v => v * 9 / 5 + 32,
    "Kelvin (K)": v => v + 273.15,
  };
  return fromC[to](toC[from](value));
}

export default function UnitsPage() {
  const [catIdx, setCatIdx] = useState(0);
  const [fromUnit, setFromUnit] = useState(0);
  const [toUnit, setToUnit] = useState(1);
  const [value, setValue] = useState("1");

  const cat = CATEGORIES[catIdx];

  const result = useMemo(() => {
    const num = parseFloat(value);
    if (isNaN(num)) return "";
    const from = cat.units[fromUnit];
    const to = cat.units[toUnit];
    if (!from || !to) return "";
    let converted: number;
    if (cat.name === "Temperature") {
      converted = convertTemp(num, from.label, to.label);
    } else if (cat.special === "fuel") {
      converted = convertFuel(num, from.label, to.label);
    } else {
      converted = (num * from.factor) / to.factor;
    }
    return converted.toPrecision(8).replace(/\.?0+$/, "");
  }, [value, catIdx, fromUnit, toUnit, cat]);

  const swap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const switchCat = (i: number) => {
    setCatIdx(i);
    setFromUnit(0);
    setToUnit(1);
    setValue("1");
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">Unit Converter</h1>
        <p className="text-slate-500 text-sm mb-8">Convert between common units of measurement.</p>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((c, i) => (
            <button key={c.name} onClick={() => switchCat(i)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${catIdx === i ? "bg-blue-600 text-white" : "bg-slate-900/60 border border-slate-800/60 text-slate-400 hover:text-white"}`}>
              {c.name}
            </button>
          ))}
        </div>

        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
            <div className="space-y-2">
              <select value={fromUnit} onChange={e => setFromUnit(+e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                {cat.units.map((u, i) => <option key={u.label} value={i}>{u.label}</option>)}
              </select>
              <input
                type="number"
                value={value}
                onChange={e => setValue(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-lg font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
            <button onClick={swap}
              className="pb-1 text-slate-400 hover:text-blue-400 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
            <div className="space-y-2">
              <select value={toUnit} onChange={e => setToUnit(+e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                {cat.units.map((u, i) => <option key={u.label} value={i}>{u.label}</option>)}
              </select>
              <div className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-blue-400 text-lg font-mono min-h-[3rem] flex items-center">
                {result || <span className="text-slate-600">|</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
