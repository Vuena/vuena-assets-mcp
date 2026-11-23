// Builds data/catalog.json and copies the GLB files into worker/public/models.
// Usage: SRC=<dir holding Vuena-Free-Mega-Starter + Vuena-Free-Drop-2026-11-Market-Fresh> node scripts/build-catalog.mjs
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { META, PACKS, BUNDLE, FREE_DOWNLOAD } from './meta.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = process.env.SRC;
const SALES = process.env.SALES || path.resolve(root, '..');
const BASE = (process.env.BASE_URL || 'https://vuena-assets.test-games.workers.dev').replace(/\/$/, '');
if (!SRC) throw new Error('set SRC');

const assets = JSON.parse(fs.readFileSync(path.join(SALES, 'mega-starter/assets.json'), 'utf8'));
const drop = JSON.parse(fs.readFileSync(path.join(SALES, 'mega-starter/drop-2026-11/drop_assets.json'), 'utf8'));

function readGlb(file) {
  const b = fs.readFileSync(file);
  if (b.readUInt32LE(0) !== 0x46546c67) throw new Error('not a GLB: ' + file);
  const jlen = b.readUInt32LE(12);
  const json = JSON.parse(b.subarray(20, 20 + jlen).toString('utf8'));
  let tris = 0;
  for (const m of json.meshes || []) for (const p of m.primitives || []) {
    const mode = p.mode ?? 4;
    if (mode !== 4) continue;
    tris += (p.indices !== undefined ? json.accessors[p.indices].count : json.accessors[p.attributes.POSITION].count) / 3;
  }
  return { buf: b, json, tris: Math.round(tris) };
}

const packByKey = Object.fromEntries(PACKS.map((p) => [p.key, p]));
fs.mkdirSync(path.join(root, 'worker/public/models'), { recursive: true });
fs.mkdirSync(path.join(root, 'data'), { recursive: true });

const rows = [];
for (const a of assets) rows.push({ stem: a.stem, name: a.name, packKey: a.pack, ext: a.ext, glb: path.join(SRC, 'Vuena-Free-Mega-Starter', a.glb), drop: false });
for (const d of drop) rows.push({ stem: d.stem, name: d.name, packKey: 'Store Simulator Kit', ext: d.ext, glb: path.join(SRC, 'Vuena-Free-Drop-2026-11-Market-Fresh/GLB', d.mod, d.stem + '.glb'), drop: true, desc: d.desc });

const models = [];
for (const r of rows) {
  const meta = META[r.stem];
  if (!meta) throw new Error('no META for ' + r.stem);
  const pack = packByKey[r.packKey];
  if (!pack) throw new Error('no PACK for ' + r.packKey);
  const g = readGlb(r.glb);
  const clips = (g.json.animations || []).map((x, i) => x.name || 'clip_' + i);
  const rigged = (g.json.skins || []).length > 0;
  const dest = path.join(root, 'worker/public/models', r.stem + '.glb');
  fs.copyFileSync(r.glb, dest);
  const sha = crypto.createHash('sha256').update(g.buf).digest('hex');
  const [category, extra] = meta;
  const tags = [...new Set([category, ...extra].map((t) => t.toLowerCase()))];
  const bits = [];
  if (rigged) bits.push(`Rigged${clips.length ? ` with ${clips.length} animation clips` : ''}.`);
  bits.push(`${g.tris.toLocaleString('en-US')} triangles, about ${r.ext.map((v) => v.toFixed(2)).join(' x ')} m (x, y, z).`);
  if (r.desc) bits.push(r.desc[0].toUpperCase() + r.desc.slice(1) + '.');
  models.push({
    id: r.stem,
    name: r.name,
    description: `${r.name}. ${bits.join(' ')}`,
    category,
    tags,
    tris: g.tris,
    rigged,
    animations: clips,
    size_m: r.ext.map((v) => +v.toFixed(3)),
    formats: { glb: `${BASE}/models/${r.stem}.glb` },
    preview: `${BASE}/previews/${r.stem}.png`,
    license: 'CC0-1.0',
    source_pack: pack.name,
    full_pack_url: pack.url,
    free_download_url: FREE_DOWNLOAD,
    bytes: g.buf.length,
    sha256: sha,
  });
  if (Math.abs(g.tris - assets.concat(drop).find((x) => x.stem === r.stem).tris) > 0) console.warn('tri mismatch', r.stem, g.tris);
}
models.sort((a, b) => a.category.localeCompare(b.category) || a.id.localeCompare(b.id));

const catalog = {
  schema: 1,
  name: 'vuena-assets',
  generated: new Date().toISOString().slice(0, 10),
  base_url: BASE,
  license: { id: 'CC0-1.0', url: 'https://creativecommons.org/publicdomain/zero/1.0/', note: 'All listed models are CC0 1.0 (public domain). Use freely, including commercially, no credit needed.' },
  ai_disclosure: 'The models are generated procedurally by code written with AI assistance. No AI image or 3D generators were used for the meshes.',
  free_download_url: FREE_DOWNLOAD,
  bundle: BUNDLE,
  packs: PACKS,
  count: models.length,
  models,
};
fs.writeFileSync(path.join(root, 'data/catalog.json'), JSON.stringify(catalog, null, 1) + '\n');
console.log('models', models.length, 'rigged', models.filter((m) => m.rigged).length, 'bytes', models.reduce((s, m) => s + m.bytes, 0));
