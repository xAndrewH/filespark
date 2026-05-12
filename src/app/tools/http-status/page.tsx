"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

const STATUSES = [
  // 1xx
  { code: 100, name: "Continue",                        desc: "The server has received the request headers and the client should proceed to send the request body.",         category: "1xx" },
  { code: 101, name: "Switching Protocols",             desc: "The server agrees to switch protocols as requested by the client, e.g. upgrading to WebSocket.",             category: "1xx" },
  { code: 102, name: "Processing",                      desc: "The server has received and is processing the request, but no response is available yet.",                    category: "1xx" },
  // 2xx
  { code: 200, name: "OK",                              desc: "The request succeeded. The meaning depends on the HTTP method: GET returns the resource, POST returns the result.", category: "2xx" },
  { code: 201, name: "Created",                         desc: "The request succeeded and a new resource was created. Typically returned in response to POST or PUT.",        category: "2xx" },
  { code: 202, name: "Accepted",                        desc: "The request has been accepted for processing, but the processing has not been completed.",                    category: "2xx" },
  { code: 204, name: "No Content",                      desc: "The server successfully processed the request but is not returning any content. Common for DELETE.",          category: "2xx" },
  { code: 206, name: "Partial Content",                 desc: "The server is delivering only part of the resource due to a range request from the client.",                  category: "2xx" },
  // 3xx
  { code: 301, name: "Moved Permanently",               desc: "The URL of the requested resource has changed permanently. Future requests should use the new URL.",          category: "3xx" },
  { code: 302, name: "Found",                           desc: "The target resource resides temporarily under a different URI. The client should continue using the original.", category: "3xx" },
  { code: 304, name: "Not Modified",                    desc: "The client's cached version is up-to-date. The server is telling the client to use the cached copy.",         category: "3xx" },
  { code: 307, name: "Temporary Redirect",              desc: "The target resource resides temporarily under a different URI. The request method must not change.",          category: "3xx" },
  { code: 308, name: "Permanent Redirect",              desc: "The resource is now permanently located at another URI. The request method must not change.",                 category: "3xx" },
  // 4xx
  { code: 400, name: "Bad Request",                     desc: "The server cannot process the request due to a client error (malformed syntax, invalid framing, etc.).",      category: "4xx" },
  { code: 401, name: "Unauthorized",                    desc: "The client must authenticate itself to get the requested response. The client is not authenticated.",         category: "4xx" },
  { code: 403, name: "Forbidden",                       desc: "The client does not have access rights to the content. Unlike 401, the server knows who the client is.",      category: "4xx" },
  { code: 404, name: "Not Found",                       desc: "The server cannot find the requested resource. The URL is not recognized or the resource doesn't exist.",     category: "4xx" },
  { code: 405, name: "Method Not Allowed",              desc: "The request method is known by the server but is not supported by the target resource.",                      category: "4xx" },
  { code: 408, name: "Request Timeout",                 desc: "The server would like to shut down this unused connection. It is sent on an idle connection.",                category: "4xx" },
  { code: 409, name: "Conflict",                        desc: "The request conflicts with the current state of the server, e.g. a version conflict on a PUT request.",       category: "4xx" },
  { code: 410, name: "Gone",                            desc: "The requested content has been permanently deleted from the server, with no forwarding address.",              category: "4xx" },
  { code: 413, name: "Content Too Large",               desc: "The request body is larger than limits defined by server. The server may close the connection.",              category: "4xx" },
  { code: 422, name: "Unprocessable Content",           desc: "The request is well-formed but was unable to be followed due to semantic errors.",                            category: "4xx" },
  { code: 429, name: "Too Many Requests",               desc: "The user has sent too many requests in a given amount of time (rate limiting).",                              category: "4xx" },
  // 5xx
  { code: 500, name: "Internal Server Error",           desc: "The server encountered an unexpected condition that prevented it from fulfilling the request.",               category: "5xx" },
  { code: 501, name: "Not Implemented",                 desc: "The server does not support the functionality required to fulfill the request.",                              category: "5xx" },
  { code: 502, name: "Bad Gateway",                     desc: "The server, while acting as a gateway or proxy, received an invalid response from the upstream server.",      category: "5xx" },
  { code: 503, name: "Service Unavailable",             desc: "The server is not ready to handle the request. Common causes are server overload or maintenance.",            category: "5xx" },
  { code: 504, name: "Gateway Timeout",                 desc: "The server is acting as a gateway and the upstream server did not respond in time.",                          category: "5xx" },
  { code: 505, name: "HTTP Version Not Supported",      desc: "The HTTP version used in the request is not supported by the server.",                                        category: "5xx" },
];

const CATEGORY_COLORS: Record<string, string> = {
  "1xx": "bg-slate-500/20 text-slate-300 border-slate-500/30",
  "2xx": "bg-green-500/20 text-green-300 border-green-500/30",
  "3xx": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "4xx": "bg-orange-500/20 text-orange-300 border-orange-500/30",
  "5xx": "bg-red-500/20 text-red-300 border-red-500/30",
};

const CATEGORY_LABELS: Record<string, string> = {
  "1xx": "Informational",
  "2xx": "Success",
  "3xx": "Redirection",
  "4xx": "Client Error",
  "5xx": "Server Error",
};

export default function HttpStatusPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return STATUSES.filter(s => {
      const matchesFilter = filter === "all" || s.category === filter;
      if (!q) return matchesFilter;
      return matchesFilter && (
        String(s.code).includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.desc.toLowerCase().includes(q)
      );
    });
  }, [query, filter]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof STATUSES> = {};
    for (const s of filtered) {
      if (!groups[s.category]) groups[s.category] = [];
      groups[s.category].push(s);
    }
    return groups;
  }, [filtered]);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Tools
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">HTTP Status Code Reference</h1>
        <p className="text-slate-500 text-sm mb-8">A searchable reference for every HTTP status code.</p>

        <div className="space-y-5">
          {/* Search + filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by code, name, or description…"
              className="flex-1 bg-slate-900/60 border border-slate-800/60 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-slate-600"
            />
            <div className="flex gap-1 bg-slate-900/60 border border-slate-800/60 rounded-xl p-1">
              {["all", "1xx", "2xx", "3xx", "4xx", "5xx"].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs transition-colors ${filter === f ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {Object.entries(grouped).map(([cat, statuses]) => (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[cat]}`}>{cat}</span>
                <span className="text-slate-500 text-xs">{CATEGORY_LABELS[cat]}</span>
              </div>
              <div className="space-y-2">
                {statuses.map(s => (
                  <div key={s.code} className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 flex gap-4">
                    <span className={`text-lg font-bold font-mono shrink-0 w-12 ${CATEGORY_COLORS[s.category].split(" ")[1]}`}>
                      {s.code}
                    </span>
                    <div>
                      <p className="text-white text-sm font-medium">{s.name}</p>
                      <p className="text-slate-500 text-xs mt-1 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-sm">No status codes match your search.</div>
          )}
        </div>
      </div>
    </div>
  );
}
