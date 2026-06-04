import { NextRequest, NextResponse } from "next/server";
import * as dns from "dns/promises";

export interface DnsRecord {
  type: string;
  value: string;
  extra?: string;
}

export interface DnsLookupResult {
  domain: string;
  records: { [type: string]: DnsRecord[] };
  ttl?: number;
}

async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  let domain: string;
  try {
    ({ domain } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!domain || typeof domain !== "string") {
    return NextResponse.json({ error: "Missing domain" }, { status: 400 });
  }

  domain = domain.replace(/^https?:\/\//i, "").split("/")[0].split("?")[0].trim().toLowerCase();
  if (!domain) return NextResponse.json({ error: "Invalid domain" }, { status: 400 });

  const records: { [type: string]: DnsRecord[] } = {};

  const [aRecords, aaaaRecords, mxRecords, nsRecords, txtRecords, cnameRecord, soaRecord] =
    await Promise.all([
      safe(() => dns.resolve4(domain)),
      safe(() => dns.resolve6(domain)),
      safe(() => dns.resolveMx(domain)),
      safe(() => dns.resolveNs(domain)),
      safe(() => dns.resolveTxt(domain)),
      safe(() => dns.resolveCname(domain)),
      safe(() => dns.resolveSoa(domain)),
    ]);

  if (aRecords?.length) {
    records["A"] = aRecords.map(v => ({ type: "A", value: v }));
  }
  if (aaaaRecords?.length) {
    records["AAAA"] = aaaaRecords.map(v => ({ type: "AAAA", value: v }));
  }
  if (mxRecords?.length) {
    records["MX"] = mxRecords
      .sort((a, b) => a.priority - b.priority)
      .map(r => ({ type: "MX", value: r.exchange, extra: `priority ${r.priority}` }));
  }
  if (nsRecords?.length) {
    records["NS"] = nsRecords.map(v => ({ type: "NS", value: v }));
  }
  if (txtRecords?.length) {
    records["TXT"] = txtRecords.map(parts => ({ type: "TXT", value: parts.join("") }));
  }
  if (cnameRecord?.length) {
    records["CNAME"] = cnameRecord.map(v => ({ type: "CNAME", value: v }));
  }
  if (soaRecord) {
    records["SOA"] = [{
      type: "SOA",
      value: soaRecord.nsname,
      extra: `hostmaster: ${soaRecord.hostmaster}, serial: ${soaRecord.serial}`,
    }];
  }

  if (Object.keys(records).length === 0) {
    return NextResponse.json({ error: `No DNS records found for ${domain}` }, { status: 404 });
  }

  return NextResponse.json({ domain, records } satisfies DnsLookupResult);
}
