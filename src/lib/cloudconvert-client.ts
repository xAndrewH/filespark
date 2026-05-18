const API_BASE = "https://api.cloudconvert.com/v2";
const KEY_STORAGE = "cloudconvert_api_key";

export function getCloudConvertKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY_STORAGE);
}

export function setCloudConvertKey(key: string) {
  if (key.trim()) localStorage.setItem(KEY_STORAGE, key.trim());
  else localStorage.removeItem(KEY_STORAGE);
}

export async function convertWithCloudConvert(
  file: File,
  inputFormat: string,
  outputFormat: string,
  onProgress?: (msg: string) => void
): Promise<Blob> {
  const key = getCloudConvertKey();
  if (!key) throw new Error("CloudConvert API key not configured. Click the key icon in the toolbar to add it.");

  const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

  onProgress?.("Creating job…");

  const jobRes = await fetch(`${API_BASE}/jobs`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      tasks: {
        "upload":  { operation: "import/upload" },
        "convert": { operation: "convert", input: "upload", input_format: inputFormat, output_format: outputFormat },
        "export":  { operation: "export/url", input: "convert" },
      },
    }),
  });

  if (!jobRes.ok) {
    const body = await jobRes.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? `CloudConvert error ${jobRes.status}`);
  }

  const job = (await jobRes.json()) as { data: { id: string; tasks: { name: string; operation: string; status: string; result?: { form?: { url: string; parameters: Record<string,string> }; files?: { url: string }[] } }[] } };
  const jobId = job.data.id;
  const uploadTask = job.data.tasks.find(t => t.operation === "import/upload");
  if (!uploadTask?.result?.form) throw new Error("No upload form in CloudConvert response");

  onProgress?.("Uploading file…");

  const form = new FormData();
  for (const [k, v] of Object.entries(uploadTask.result.form.parameters)) form.append(k, v);
  form.append("file", file);
  const upRes = await fetch(uploadTask.result.form.url, { method: "POST", body: form });
  if (!upRes.ok) throw new Error(`Upload failed (${upRes.status})`);

  onProgress?.("Converting…");

  for (let i = 0; i < 90; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const statusRes = await fetch(`${API_BASE}/jobs/${jobId}`, { headers });
    if (!statusRes.ok) throw new Error("Status check failed");
    const status = (await statusRes.json()) as typeof job;
    const s = status.data;

    if (s.tasks.some(t => t.status === "error")) {
      const errTask = s.tasks.find(t => t.status === "error");
      throw new Error((errTask as unknown as { message?: string }).message ?? "CloudConvert conversion failed");
    }

    if (s.tasks.every(t => t.status === "finished" || t.status === "error")) {
      const exportTask = s.tasks.find(t => t.operation === "export/url");
      const url = exportTask?.result?.files?.[0]?.url;
      if (!url) throw new Error("No download URL in CloudConvert response");
      onProgress?.("Downloading…");
      const dl = await fetch(url);
      if (!dl.ok) throw new Error(`Download failed (${dl.status})`);
      return dl.blob();
    }
  }

  throw new Error("CloudConvert timed out after 3 minutes");
}
