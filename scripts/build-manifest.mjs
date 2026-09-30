// Scans docs/<backend|frontend|third-party>/*.html and writes docs.json
// Meta comment (optional): <!-- docs-hub {"base":"my doc","createdBy":"Ali"} -->
// Same base => first stays plain, then "v1", "v2", ...
import fs from "node:fs"; import path from "node:path";
const CATS = ["backend", "frontend", "third-party"], out = [], seen = {};
for (const cat of CATS) {
  const dir = path.join("docs", cat); if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".html"))
    .map(f => ({ f, t: fs.statSync(path.join(dir, f)).mtimeMs })).sort((a, b) => a.t - b.t);
  for (const { f, t } of files) {
    const raw = fs.readFileSync(path.join(dir, f), "utf8");
    let meta = {};
    const m = raw.match(/<!--\s*docs-hub\s*(\{[\s\S]*?\})\s*-->/);
    if (m) { try { meta = JSON.parse(m[1]); } catch {} }
    const base = String(meta.base || f.replace(/\.html?$/i, "").replace(/-\d{10,}$/, "").replace(/[-_]+/g, " ")).trim();
    const key = cat + "|" + base;
    const n = seen[key] = (seen[key] ?? -1) + 1;
    const row = { id: `${cat}/${f}`, name: n ? `${base} v${n}` : base, cat, url: `docs/${cat}/${encodeURI(f)}`, added: new Date(t).toISOString() };
    if (meta.createdBy) row.createdBy = String(meta.createdBy);
    if (meta.base) row.base = String(meta.base);
    out.push(row);
  }
}
fs.writeFileSync("docs.json", JSON.stringify(out, null, 2) + "\n"); console.log(`docs.json: ${out.length} docs`);
