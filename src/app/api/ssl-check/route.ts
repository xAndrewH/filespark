import { NextRequest, NextResponse } from "next/server";
import * as tls from "tls";

export interface SslCheckResult {
  subject: { CN?: string; O?: string };
  issuer: { CN?: string; O?: string };
  validFrom: string;
  validTo: string;
  daysUntil: number;
  fingerprint256: string;
  sans: string[];
  isExpired: boolean;
  isExpiringSoon: boolean;
}


export async function POST(req: NextRequest) {
  let hostname: string;
  try {
    ({ hostname } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!hostname || typeof hostname !== "string") {
    return NextResponse.json({ error: "Missing hostname" }, { status: 400 });
  }

  // Strip protocol and path — extract just the hostname
  hostname = hostname.replace(/^https?:\/\//i, "").split("/")[0].split("?")[0].trim();

  if (!hostname) {
    return NextResponse.json({ error: "Invalid hostname" }, { status: 400 });
  }

  return new Promise<NextResponse>(resolve => {
    const timeout = setTimeout(() => {
      resolve(NextResponse.json({ error: "Connection timed out after 10 seconds" }, { status: 504 }));
    }, 10000);

    const socket = tls.connect(
      { host: hostname, port: 443, servername: hostname, rejectUnauthorized: false },
      () => {
        clearTimeout(timeout);
        try {
          const cert = socket.getPeerCertificate(true);
          socket.destroy();

          if (!cert || !cert.subject) {
            resolve(NextResponse.json({ error: "No certificate returned" }, { status: 502 }));
            return;
          }

          // cert.subject and cert.issuer are already objects like { CN: '...', O: '...' }
          const subjectObj = cert.subject as unknown as Record<string, string>;
          const issuerObj  = cert.issuer  as unknown as Record<string, string>;

          const validFrom = cert.valid_from ?? "";
          const validTo   = cert.valid_to   ?? "";

          const now      = Date.now();
          const expiry   = new Date(validTo).getTime();
          const daysUntil     = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));
          const isExpired     = daysUntil < 0;
          const isExpiringSoon = !isExpired && daysUntil < 30;

          const sanRaw = (cert as unknown as { subjectaltname?: string }).subjectaltname ?? "";
          const sans = sanRaw
            ? sanRaw.split(",").map(s => s.replace(/^DNS:/, "").trim()).filter(Boolean)
            : [];

          const result: SslCheckResult = {
            subject: { CN: subjectObj.CN, O: subjectObj.O },
            issuer:  { CN: issuerObj.CN,  O: issuerObj.O  },
            validFrom,
            validTo,
            daysUntil,
            fingerprint256: cert.fingerprint256 ?? cert.fingerprint ?? "",
            sans,
            isExpired,
            isExpiringSoon,
          };

          resolve(NextResponse.json(result));
        } catch (err) {
          resolve(NextResponse.json({ error: `Failed to parse certificate: ${String(err)}` }, { status: 500 }));
        }
      }
    );

    socket.on("error", err => {
      clearTimeout(timeout);
      socket.destroy();
      const msg = err.message ?? String(err);
      if (msg.includes("ENOTFOUND") || msg.includes("getaddrinfo")) {
        resolve(NextResponse.json({ error: `Domain not found: ${hostname}` }, { status: 404 }));
      } else if (msg.includes("ECONNREFUSED")) {
        resolve(NextResponse.json({ error: "Port 443 refused — server may not support HTTPS" }, { status: 502 }));
      } else {
        resolve(NextResponse.json({ error: msg }, { status: 502 }));
      }
    });
  });
}
