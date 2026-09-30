// Rebuild docs.json from GitHub files and push site files so Pages lists docs/
// Usage: node scripts/push-site.mjs ghp_YOUR_TOKEN
import fs from "node:fs";

const token = process.argv[2] || process.env.GH_TOKEN;
const owner = "M-Alaa-Shanwani";
const repo = "docs-al7osam";
const branch = "main";
const CATS = ["backend", "frontend", "third-party"];

if (!token) {
  console.error("Usage: node scripts/push-site.mjs <github_token>");
  process.exit(1);
}

const headers = {
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "docs-hub-sync",
};

async function api(path, opts = {}) {
  const res = await fetch(`https://api.github.com${path}`, { ...opts, headers: { ...headers, ...(opts.headers || {}) } });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) throw new Error(`${res.status} ${path}: ${data?.message || text}`);
  return data;
}

function b64(str) {
  return Buffer.from(str, "utf8").toString("base64");
}

async function putFile(path, content, message) {
  let sha;
  try {
    const cur = await api(`/repos/${owner}/${repo}/contents/${path}?ref=${branch}`);
    sha = cur.sha;
  } catch {}
  const body = { message, content: b64(content), branch };
  if (sha) body.sha = sha;
  await api(`/repos/${owner}/${repo}/contents/${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  console.log("updated", path);
}

async function buildManifest() {
  const out = [], seen = {};
  for (const cat of CATS) {
    let files = [];
    try {
      files = await api(`/repos/${owner}/${repo}/contents/docs/${cat}?ref=${branch}`);
    } catch { continue; }
    if (!Array.isArray(files)) continue;
    const htmls = files.filter(f => f.type === "file" && f.name.endsWith(".html"))
      .sort((a, b) => a.name.localeCompare(b.name));
    for (const f of htmls) {
      const raw = await fetch(f.download_url).then(r => r.text());
      let meta = {};
      const m = raw.match(/<!--\s*docs-hub\s*(\{[\s\S]*?\})\s*-->/);
      if (m) { try { meta = JSON.parse(m[1]); } catch {} }
      const base = String(meta.base || f.name.replace(/\.html?$/i, "").replace(/-\d{10,}$/, "").replace(/[-_]+/g, " ")).trim();
      const key = cat + "|" + base;
      const n = seen[key] = (seen[key] ?? -1) + 1;
      const row = {
        id: `${cat}/${f.name}`,
        name: n ? `${base} v${n}` : base,
        cat,
        url: `docs/${cat}/${encodeURI(f.name)}`,
        added: new Date().toISOString(),
      };
      if (meta.createdBy) row.createdBy = String(meta.createdBy);
      if (meta.base) row.base = String(meta.base);
      out.push(row);
    }
  }
  return out;
}

const list = await buildManifest();
const json = JSON.stringify(list, null, 2) + "\n";
fs.writeFileSync("docs.json", json);
console.log(`docs.json: ${list.length} docs`);
await putFile("docs.json", json, "docs: rebuild manifest from docs/ folder");
await putFile(".nojekyll", "", "docs: disable Jekyll for Pages");
await putFile("index.html", fs.readFileSync("index.html", "utf8"), "docs: sync hub app (list from docs/)");
if (fs.existsSync("scripts/build-manifest.mjs")) {
  await putFile("scripts/build-manifest.mjs", fs.readFileSync("scripts/build-manifest.mjs", "utf8"), "docs: update build-manifest");
}
console.log("Done. Hard-refresh the site on every device.");
