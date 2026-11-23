// Generates worker/public/{catalog.json,manifest.json,llms.txt,index.html,_headers} from data/catalog.json.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'worker/public');
const cat = JSON.parse(fs.readFileSync(path.join(root, 'data/catalog.json'), 'utf8'));
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const B = cat.base_url;
const REPO = 'https://github.com/Vuena/vuena-assets-mcp';
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

fs.copyFileSync(path.join(root, 'data/catalog.json'), path.join(pub, 'catalog.json'));

const cats = {};
for (const m of cat.models) cats[m.category] = (cats[m.category] || 0) + 1;

const manifest = {
  name: 'vuena-assets',
  title: 'Vuena Assets (free CC0 3D models for AI coding assistants)',
  version: pkg.version,
  description: pkg.description,
  license: { assets: 'CC0-1.0', code: 'MIT' },
  ai_disclosure: cat.ai_disclosure,
  models: cat.count,
  rigged_models: cat.models.filter((m) => m.rigged).length,
  categories: cats,
  endpoints: { mcp: `${B}/mcp`, transport: 'streamable-http (stateless, JSON responses)', catalog: `${B}/catalog.json`, llms: `${B}/llms.txt`, model_url_pattern: `${B}/models/{id}.glb`, preview_url_pattern: `${B}/previews/{id}.png` },
  tools: { remote: ['search_assets', 'get_asset', 'list_packs'], stdio: ['search_assets', 'get_asset', 'download_asset', 'list_packs'] },
  install: {
    claude_code_remote: `claude mcp add --transport http vuena-assets ${B}/mcp`,
    claude_code_local: 'claude mcp add vuena-assets -- npx -y vuena-assets-mcp',
    cursor_remote: { mcpServers: { 'vuena-assets': { url: `${B}/mcp` } } },
    stdio: { command: 'npx', args: ['-y', 'vuena-assets-mcp'] },
  },
  repository: REPO,
  free_download: cat.free_download_url,
  packs: cat.packs.map((p) => ({ name: p.name, url: p.url, contents: p.contents })),
};
fs.writeFileSync(path.join(pub, 'manifest.json'), JSON.stringify(manifest, null, 1) + '\n');

const lines = cat.models.map((m) => `- ${m.id} | ${m.name} | ${m.category} | ${m.tris} tris | ${m.rigged ? 'rigged (' + m.animations.length + ' clips)' : 'static'} | ${m.formats.glb}`);
const llms = `# Vuena Assets

> Free CC0 low-poly / blocky 3D models (GLB) for game projects, served as an MCP server so AI coding assistants can search them and drop them into a project. ${cat.count} models: ${Object.entries(cats).map(([k, v]) => `${v} ${k}`).join(', ')}. No account, no key.

All models are CC0 1.0 (public domain): commercial use, no credit needed. ${cat.ai_disclosure}

## Use it

- Remote MCP (streamable HTTP, no auth): ${B}/mcp
  - Claude Code: \`claude mcp add --transport http vuena-assets ${B}/mcp\`
  - Cursor / others: \`{"mcpServers":{"vuena-assets":{"url":"${B}/mcp"}}}\`
- Local stdio MCP (adds download_asset, which saves files into your project): \`npx -y vuena-assets-mcp\`
- Tools: search_assets(query, tags?, rigged?, limit?), get_asset(id), list_packs(), download_asset(id, format, dest_dir) [stdio only]
- No MCP? Fetch directly: ${B}/models/{id}.glb and ${B}/previews/{id}.png ; full catalogue: ${B}/catalog.json ; manifest: ${B}/manifest.json
- GLB files are self-contained (textures and animations embedded), glTF 2.0, metres, Y-up.

## Optional paid packs

The free models are samples of larger paid packs on itch.io (list_packs shows them). Nothing is required to use the free models. Free download of all models with FBX + textures: ${cat.free_download_url}

## Models (id | name | category | triangles | rig | glb)

${lines.join('\n')}

## Source

Code (MIT): ${REPO}
`;
fs.writeFileSync(path.join(pub, 'llms.txt'), llms);

const cards = cat.models.map((m) => `<a class="card" href="${esc(m.formats.glb)}" data-q="${esc((m.id + ' ' + m.name + ' ' + m.tags.join(' ')).toLowerCase())}"><img loading="lazy" width="256" height="256" src="previews/${esc(m.id)}.png" alt="${esc(m.name)} preview"><b>${esc(m.name)}</b><span>${esc(m.category)} &middot; ${m.tris.toLocaleString('en-US')} tris${m.rigged ? ' &middot; rigged' : ''}</span></a>`).join('\n');
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Vuena Assets - free CC0 3D models for AI coding assistants</title>
<meta name="description" content="Free MCP server with ${cat.count} CC0 low-poly 3D models (GLB). Search and drop them into your game from Claude Code, Cursor or Claude Desktop.">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%23151d2b'/%3E%3Cpath d='M16 6l9 5v10l-9 5-9-5V11z' fill='%23f2b431'/%3E%3C/svg%3E">
<style>
:root{--bg:#f6f8fb;--fg:#162033;--mut:#5b6679;--card:#fff;--line:#dde3ec;--acc:#b9770e;--code:#eef2f7}
@media(prefers-color-scheme:dark){:root{--bg:#0f1520;--fg:#e6ebf3;--mut:#9aa6ba;--card:#172033;--line:#27324a;--acc:#f2b431;--code:#101827}}
*{box-sizing:border-box}body{margin:0;font:16px/1.55 system-ui,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--fg)}
main{max-width:1080px;margin:0 auto;padding:32px 16px 64px}h1{font-size:2rem;margin:0 0 6px}h2{margin:36px 0 10px;font-size:1.25rem}
p{margin:8px 0}a{color:var(--acc)}.mut{color:var(--mut)}
pre{background:var(--code);border:1px solid var(--line);border-radius:8px;padding:12px;overflow:auto;font-size:.88rem}code{font-family:ui-monospace,Consolas,monospace}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}
.card{display:block;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:8px;text-decoration:none;color:inherit}
.card img{width:100%;height:auto;border-radius:6px;display:block}.card b{display:block;font-size:.88rem;margin-top:6px}.card span{font-size:.75rem;color:var(--mut)}
input{width:100%;max-width:360px;padding:10px 12px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--fg);font:inherit}
.pill{display:inline-block;background:var(--code);border:1px solid var(--line);border-radius:99px;padding:2px 10px;font-size:.8rem;margin-right:6px}
</style></head><body><main>
<h1>Vuena Assets</h1>
<p><span class="pill">${cat.count} models</span><span class="pill">CC0</span><span class="pill">GLB</span><span class="pill">MCP</span></p>
<p>Free low-poly and blocky 3D models for game projects, served over MCP so Claude Code, Cursor and other AI coding assistants can search them and drop them into your project. No account, no key. All models are CC0: commercial use, no credit needed.</p>
<h2>Install</h2>
<p>Remote (no install):</p>
<pre><code>claude mcp add --transport http vuena-assets ${B}/mcp</code></pre>
<p>Local (adds <code>download_asset</code>, saves files into your project):</p>
<pre><code>claude mcp add vuena-assets -- npx -y vuena-assets-mcp</code></pre>
<p class="mut">Cursor, Claude Desktop and other clients: see the <a href="${REPO}">README</a>. Plain-text summary for agents: <a href="llms.txt">llms.txt</a>, <a href="manifest.json">manifest.json</a>, <a href="catalog.json">catalog.json</a>.</p>
<h2>Browse</h2>
<p><input id="q" type="search" placeholder="Filter: tree, fox, rigged, winter..." aria-label="Filter models"></p>
<div class="grid" id="grid">
${cards}
</div>
<h2>About</h2>
<p class="mut">${esc(cat.ai_disclosure)}</p>
<p class="mut">The free models are samples of larger paid packs on itch.io; the packs are optional and the free models stay free. All free models with FBX files and textures: <a href="${cat.free_download_url}">Vuena Free Mega Starter</a>. Code: <a href="${REPO}">${REPO.replace('https://', '')}</a> (MIT).</p>
</main>
<script>
const q=document.getElementById('q'),cards=[...document.querySelectorAll('.card')];
q.addEventListener('input',()=>{const t=q.value.trim().toLowerCase().split(/\\s+/).filter(Boolean);for(const c of cards){c.style.display=t.every(w=>c.dataset.q.includes(w))?'':'none'}});
</script></body></html>
`;
fs.writeFileSync(path.join(pub, 'index.html'), html);

fs.writeFileSync(path.join(pub, '_headers'), `/*
  Access-Control-Allow-Origin: *
  X-Content-Type-Options: nosniff
/models/*
  Cache-Control: public, max-age=86400
/previews/*
  Cache-Control: public, max-age=86400
`);
console.log('site built:', fs.readdirSync(pub).filter((f) => !fs.statSync(path.join(pub, f)).isDirectory()).join(', '));
