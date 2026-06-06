import { NextRequest, NextResponse } from "next/server";

export interface IpLookupResult {
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  isp: string;
  org: string;
  as: string;
  isPrivate: boolean;
}

function isPrivateIp(ip: string): boolean {
  if (ip === "::1" || ip === "localhost") return true;
  if (/^127\./.test(ip)) return true;
  if (/^10\./.test(ip)) return true;
  if (/^192\.168\./.test(ip)) return true;
  const m172 = ip.match(/^172\.(\d+)\./);
  if (m172 && parseInt(m172[1]) >= 16 && parseInt(m172[1]) <= 31) return true;
  return false;
}

export async function POST(req: NextRequest) {
  let ip: string;
  try {
    ({ ip } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!ip || typeof ip !== "string" || !ip.trim()) {
    ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      "";
  }

  ip = ip.trim();

  if (!ip) {
    return NextResponse.json({ error: "Could not determine IP address" }, { status: 400 });
  }

  if (isPrivateIp(ip)) {
    return NextResponse.json({
      ip,
      country: "",
      countryCode: "",
      region: "",
      city: "",
      zip: "",
      lat: 0,
      lon: 0,
      isp: "",
      org: "",
      as: "",
      isPrivate: true,
    } satisfies IpLookupResult);
  }

  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,countryCode,regionName,city,zip,lat,lon,isp,org,as,query`
    );
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to contact ip-api.com" }, { status: 502 });
    }
    const data = await res.json();
    if (data.status === "fail") {
      return NextResponse.json({ error: data.message ?? "Lookup failed" }, { status: 422 });
    }
    return NextResponse.json({
      ip: data.query ?? ip,
      country: data.country ?? "",
      countryCode: data.countryCode ?? "",
      region: data.regionName ?? "",
      city: data.city ?? "",
      zip: data.zip ?? "",
      lat: data.lat ?? 0,
      lon: data.lon ?? 0,
      isp: data.isp ?? "",
      org: data.org ?? "",
      as: data.as ?? "",
      isPrivate: false,
    } satisfies IpLookupResult);
  } catch {
    return NextResponse.json({ error: "Network error contacting ip-api.com" }, { status: 502 });
  }
}
