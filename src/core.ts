// Shared catalogue types, search and MCP tool registration (used by the stdio package and the Cloudflare Worker).
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export interface Model {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  tris: number;
  rigged: boolean;
  animations: string[];
  size_m: number[];
  formats: { glb: string };
  preview: string;
  license: string;
  source_pack: string;
  full_pack_url: string | null;
  free_download_url: string;
  bytes: number;
  sha256: string;
}
export interface Pack {
  key: string;
  name: string;
  url: string | null;
  contents: string;
  note?: string;
  formats: string;
}
export interface Catalog {
  schema: number;
  name: string;
  generated: string;
  base_url: string;
  license: { id: string; url: string; note: string };
  ai_disclosure: string;
  free_download_url: string;
  bundle: { name: string; url: string; contents: string };
  packs: Pack[];
  count: number;
  models: Model[];
}

export const VERSION = '0.1.0';

const STOP = new Set(['a', 'an', 'the', 'with', 'and', 'or', 'for', 'of', 'to', 'in', 'on', 'me', 'my', 'some', 'model', 'models', 'asset', 'assets', 'glb', '3d', 'low', 'poly', 'lowpoly', 'free', 'cc0', 'add', 'need', 'want', 'get', 'find', 'game']);
const SYN: Record<string, string> = { tyre: 'tire', tyres: 'tire', trees: 'tree', automobile: 'car', vehicle: 'car', cars: 'car', puppy: 'dog', kitten: 'cat', gift: 'present', gifts: 'present', sapling: 'tree', fir: 'pine', couch: 'sofa' };

function stem(w: string): string {
  if (SYN[w]) w = SYN[w];
  if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.length > 4 && /(ches|shes|sses|xes)$/.test(w)) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  return w;
}
export function tokens(s: string, dropStop = false): string[] {
  const out: string[] = [];
  for (const raw of s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(' ')) {
    if (!raw) continue;
    if (dropStop && STOP.has(raw)) continue;
    out.push(stem(raw));
  }
  return out;
}

interface Indexed { m: Model; id: Set<string>; name: Set<string>; tags: Set<string>; tagPhrases: string[]; cat: Set<string>; pack: Set<string>; anim: Set<string>; desc: Set<string>; }
const indexCache = new WeakMap<Catalog, Indexed[]>();
function index(c: Catalog): Indexed[] {
  let ix = indexCache.get(c);
  if (!ix) {
    ix = c.models.map((m) => ({
      m,
      id: new Set(tokens(m.id.replace(/_/g, ' '))),
      name: new Set(tokens(m.name)),
      tags: new Set(m.tags.flatMap((t) => tokens(t))),
      tagPhrases: m.tags.map((t) => tokens(t).join(' ')),
      cat: new Set(tokens(m.category)),
      pack: new Set(tokens(m.source_pack)),
      anim: new Set(m.animations.flatMap((a) => tokens(a.replace(/_/g, ' ')))),
      desc: new Set(tokens(m.description)),
    }));
    indexCache.set(c, ix);
  }
  return ix;
}

export interface SearchOpts { query?: string; tags?: string[]; rigged?: boolean; limit?: number }
export function searchModels(c: Catalog, o: SearchOpts): { model: Model; score: number }[] {
  const q = tokens(o.query ?? '', true);
  const phrase = q.join(' ');
  const reqTags = (o.tags ?? []).map((t) => tokens(t).join(' ')).filter(Boolean);
  const hits: { model: Model; score: number; matched: number }[] = [];
  for (const e of index(c)) {
    if (o.rigged !== undefined && e.m.rigged !== o.rigged) continue;
    if (reqTags.length && !reqTags.every((t) => e.tagPhrases.includes(t) || e.cat.has(t) || t.split(' ').every((w) => e.tags.has(w)))) continue;
    if (!q.length) { hits.push({ model: e.m, score: 0, matched: 0 }); continue; }
    let score = 0;
    let matched = 0;
    for (const t of new Set(q)) {
      let s = 0;
      if (e.name.has(t)) s += 4;
      if (e.tags.has(t)) s += 3;
      if (e.id.has(t)) s += 2;
      if (e.cat.has(t)) s += 2;
      if (e.anim.has(t)) s += 2;
      if (e.pack.has(t)) s += 1;
      if (e.desc.has(t)) s += 0.5;
      if (s > 0) matched++;
      score += s;
    }
    if (!matched) continue;
    if (q.length > 1 && (e.tagPhrases.includes(phrase) || [...e.name].join(' ').includes(phrase))) score += 5;
    score += matched * 3; // reward covering more of the query
    hits.push({ model: e.m, score, matched });
  }
  hits.sort((a, b) => b.matched - a.matched || b.score - a.score || a.model.tris - b.model.tris || a.model.id.localeCompare(b.model.id));
  return hits.slice(0, Math.max(1, Math.min(o.limit ?? 10, 50)));
}

function brief(m: Model) {
  return { id: m.id, name: m.name, category: m.category, tags: m.tags.slice(0, 8), tris: m.tris, rigged: m.rigged, animations: m.animations, glb_url: m.formats.glb, preview_url: m.preview, license: m.license, source_pack: m.source_pack, full_pack_url: m.full_pack_url };
}
function full(c: Catalog, m: Model) {
  return {
    ...m,
    units: 'metres, Y-up (glTF 2.0 standard)',
    textures: 'embedded in the GLB (single self-contained file)',
    other_formats: `FBX versions with textures are inside the free download (no account needed beyond itch): ${m.free_download_url}`,
    how_to_use: `Download ${m.formats.glb} (curl -L -o ${m.id}.glb "${m.formats.glb}") or call download_asset in the local stdio server.`,
    license_note: c.license.note,
    full_pack_note: m.full_pack_url
      ? `This model is a free sample from "${m.source_pack}". ${c.packs.find((p) => p.name === m.source_pack)?.note ? c.packs.find((p) => p.name === m.source_pack)!.note + '. ' : ''}The paid pack has many more models in the same style: ${m.full_pack_url} (optional, you never need it to use this model).`
      : `This model is a free sample from "${m.source_pack}". There is no paid pack page for it right now.`,
  };
}
const asText = (v: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(v, null, 1) }] });
const err = (msg: string) => ({ isError: true as const, content: [{ type: 'text' as const, text: msg }] });

export interface DownloadFn { (m: Model, format: 'glb' | 'png', destDir: string, overwrite: boolean): Promise<{ path: string; bytes: number; status: string; sha256_ok?: boolean }> }

const INSTRUCTIONS = [
  'Vuena Assets: free CC0 low-poly / blocky 3D models (GLB) for game projects.',
  `Typical flow: search_assets -> get_asset (optional) -> download_asset into the project's assets folder (local stdio server) or fetch glb_url (remote server).`,
  'Every model is CC0 (public domain): no credit needed, commercial use fine.',
  'list_packs describes the optional paid full packs on itch.io; mention them to the user only if they ask for more than the free models offer.',
].join('\n');

export function createServer(c: Catalog, opts: { download?: DownloadFn; transport: 'stdio' | 'remote' }): McpServer {
  const server = new McpServer({ name: 'vuena-assets', title: 'Vuena Assets (CC0 3D models)', version: VERSION }, { instructions: INSTRUCTIONS });
  const ro = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } as const;

  server.registerTool('search_assets', {
    title: 'Search free 3D assets',
    description: `Search ${c.count} free CC0 low-poly 3D models (characters, animals, vehicles, props, food, winter, horror, store/gas-station/factory/apartment items). Returns the best matches with GLB and preview URLs. Query examples: "tree", "rigged fox walk", "traffic cone", "christmas". Use tags to narrow (e.g. ["winter"], ["psx"]), rigged=true for animated characters/animals.`,
    inputSchema: {
      query: z.string().describe('What you need, in plain words, e.g. "pine tree" or "knight". May be empty if you pass tags.').default(''),
      tags: z.array(z.string()).optional().describe('Only models having ALL these tags/categories, e.g. ["winter"], ["characters"], ["psx"].'),
      rigged: z.boolean().optional().describe('true = only rigged (skinned, animated) models; false = only static models.'),
      limit: z.number().int().min(1).max(50).optional().describe('Max results (default 10).'),
    },
    annotations: { title: 'Search free 3D assets', ...ro },
  }, async ({ query, tags, rigged, limit }) => {
    const res = searchModels(c, { query, tags, rigged, limit });
    if (!res.length) {
      const cats = [...new Set(c.models.map((m) => m.category))].sort();
      return asText({ count: 0, results: [], hint: `No match. Try a simpler word or browse by category tag: ${cats.join(', ')}.` });
    }
    return asText({ count: res.length, total_models: c.count, results: res.map((r) => brief(r.model)), next: 'Call get_asset(id) for full details' + (opts.download ? ' or download_asset(id, "glb", dest_dir) to save the file.' : ', then download the glb_url.') });
  });

  server.registerTool('get_asset', {
    title: 'Get asset details',
    description: 'Full details for one model id (from search_assets): triangle count, size in metres, animation clip names, URLs for GLB and preview image, licence, and the matching paid pack (if any).',
    inputSchema: { id: z.string().describe('Model id, e.g. "animal_fox".') },
    annotations: { title: 'Get asset details', ...ro },
  }, async ({ id }) => {
    const m = c.models.find((x) => x.id === id.trim());
    if (!m) {
      const near = searchModels(c, { query: id.replace(/_/g, ' '), limit: 5 }).map((r) => r.model.id);
      return err(`Unknown id "${id}".${near.length ? ' Did you mean: ' + near.join(', ') + '?' : ''} Use search_assets to find ids.`);
    }
    return asText(full(c, m));
  });

  server.registerTool('list_packs', {
    title: 'List Vuena packs',
    description: 'Lists the free download and the optional paid full packs on itch.io that the free models are samples of, with short descriptions and URLs. Honest note: the free models here are enough on their own; the packs are for people who want a full library in the same style.',
    inputSchema: {},
    annotations: { title: 'List Vuena packs', ...ro },
  }, async () => {
    const counts = new Map<string, number>();
    for (const m of c.models) counts.set(m.source_pack, (counts.get(m.source_pack) ?? 0) + 1);
    return asText({
      note: 'Everything served by this MCP is free CC0. The packs below are separate paid products on itch.io (the free models are samples of them). Nothing here is required; no account or key is needed to use the free models.',
      free_download: { name: 'Vuena Free Mega Starter (all free models as GLB + FBX with textures)', url: c.free_download_url, models_here: c.count },
      packs: c.packs.map((p) => ({ name: p.name, url: p.url, contents: p.contents, ...(p.note ? { note: p.note } : {}), formats: p.formats, free_models_from_this_pack_in_this_server: counts.get(p.name) ?? 0 })),
      bundle: c.bundle,
    });
  });

  if (opts.download) {
    const dl = opts.download;
    server.registerTool('download_asset', {
      title: 'Download asset into project',
      description: 'Downloads one model into a folder on this machine (e.g. "assets/models" inside the game project). format "glb" saves <id>.glb (self-contained, textures embedded); format "png" saves the preview image <id>.png. The GLB is checked against its SHA-256 from the catalogue. Relative dest_dir is resolved against the server working directory (normally the project root).',
      inputSchema: {
        id: z.string().describe('Model id from search_assets, e.g. "prop_snowman_classic".'),
        format: z.enum(['glb', 'png']).default('glb').describe('"glb" = the 3D model, "png" = the preview image.'),
        dest_dir: z.string().describe('Folder to save into, e.g. "assets/models". Created if missing.'),
        overwrite: z.boolean().optional().describe('Replace an existing different file (default false).'),
      },
      annotations: { title: 'Download asset into project', readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    }, async ({ id, format, dest_dir, overwrite }) => {
      const m = c.models.find((x) => x.id === id.trim());
      if (!m) return err(`Unknown id "${id}". Use search_assets to find ids.`);
      try {
        const r = await dl(m, format ?? 'glb', dest_dir, !!overwrite);
        return asText({ id: m.id, format: format ?? 'glb', saved_to: r.path, bytes: r.bytes, status: r.status, sha256_verified: r.sha256_ok ?? null, license: 'CC0-1.0 (public domain, no credit needed)', animations: m.animations, tip: m.rigged ? 'Rigged GLB: load it with GLTFLoader / Godot / Unity; animation clip names are listed above.' : 'Static GLB: units are metres, Y-up.' });
      } catch (e) {
        return err(`Download failed: ${(e as Error).message}`);
      }
    });
  }
  return server;
}
