import { lookup } from "node:dns/promises";

/**
 * SSRF protection for routes that fetch user-supplied URLs.
 *
 * A naive hostname check is not enough: an attacker can register a public
 * hostname that resolves to a private/internal IP (DNS rebinding), or simply
 * pass a raw private IP. So we resolve the hostname and validate every
 * resolved address against private / reserved / link-local ranges.
 */

function ipToParts(ip: string): number[] | null {
  const m = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return null;
  const parts = m.slice(1).map((n) => parseInt(n, 10));
  if (parts.some((n) => n > 255)) return null;
  return parts;
}

/** True for loopback, private, link-local, CGNAT, and other reserved ranges. */
export function isPrivateIpv4(ip: string): boolean {
  const p = ipToParts(ip);
  if (!p) return false;
  const [a, b] = p;
  if (a === 0) return true; // 0.0.0.0/8
  if (a === 10) return true; // private
  if (a === 127) return true; // loopback
  if (a === 169 && b === 254) return true; // link-local (incl. cloud metadata 169.254.169.254)
  if (a === 172 && b >= 16 && b <= 31) return true; // private
  if (a === 192 && b === 168) return true; // private
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT 100.64.0.0/10
  if (a === 192 && b === 0) return true; // 192.0.0.0/24 + 192.0.2.0/24 (test)
  if (a === 198 && (b === 18 || b === 19)) return true; // benchmarking
  if (a >= 224) return true; // multicast + reserved
  return false;
}

export function isPrivateIpv6(ip: string): boolean {
  const v = ip.toLowerCase();
  if (v === "::1" || v === "::") return true; // loopback / unspecified
  if (v.startsWith("fe80")) return true; // link-local
  if (v.startsWith("fc") || v.startsWith("fd")) return true; // unique local fc00::/7
  // IPv4-mapped (::ffff:a.b.c.d) — validate the embedded v4 address
  const mapped = v.match(/^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (mapped) return isPrivateIpv4(mapped[1]);
  return false;
}

export function isPrivateHostname(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (h === "localhost" || h.endsWith(".localhost")) return true;
  if (h.endsWith(".local") || h.endsWith(".internal")) return true;
  if (ipToParts(h)) return isPrivateIpv4(h);
  if (h.includes(":")) return isPrivateIpv6(h);
  return false;
}

export class SsrfError extends Error {}

/**
 * Validates a user-supplied URL and returns the parsed URL if it is safe to
 * fetch. Throws SsrfError otherwise. Resolves DNS and checks every address.
 */
export async function assertPublicUrl(rawUrl: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new SsrfError("Invalid URL");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new SsrfError("Only http and https URLs are allowed");
  }

  if (isPrivateHostname(url.hostname)) {
    throw new SsrfError("That address is not allowed");
  }

  // Resolve the hostname and reject if any address is private/reserved.
  try {
    const results = await lookup(url.hostname.replace(/^\[|\]$/g, ""), { all: true });
    for (const { address, family } of results) {
      const isPrivate = family === 6 ? isPrivateIpv6(address) : isPrivateIpv4(address);
      if (isPrivate) throw new SsrfError("That address resolves to a private network");
    }
  } catch (e) {
    if (e instanceof SsrfError) throw e;
    throw new SsrfError("Could not resolve host");
  }

  return url;
}
