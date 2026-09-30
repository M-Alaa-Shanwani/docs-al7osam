// Scans docs/<backend|frontend|third-party>/*.html and writes docs.json
// Same title => first stays plain, then "v1", "v2", ...
import fs from "node:fs"; import path from "node:path";
const CATS = ["backend", "frontend", "third-party"], out = [], seen = {};
for (const cat of CATS) {
  const dir = path.join("docs", cat); if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".html"))
    .map(f => ({ f, t: fs.statSync(path.join(dir, f)).mtimeMs })).sort((a, b) => a.t - b.t);
  for (const { f, t } of files) {
    const base = f.replace(/\.html$/, "").replace(/[-_]+/g, " ");
    const key = cat + "|" + base;
    const n = seen[key] = (seen[key] ?? -1) + 1;
    out.push({ id: `${cat}/${f}`, name: n ? `${base} v${n}` : base, cat, url: `docs/${cat}/${encodeURI(f)}`, added: new Date(t).toISOString() });
  }
}
fs.writeFileSync("docs.json", JSON.stringify(out, null, 2)); console.log(`docs.json: ${out.length} docs`);
