// End-to-end test with the official MCP SDK client.
//   node scripts/test-stdio.mjs                 -> stdio server (dist/stdio.js), downloads from the catalogue's base_url
//   node scripts/test-stdio.mjs --remote <url>  -> remote streamable-HTTP endpoint (e.g. https://.../mcp)
// Env: VUENA_ASSETS_BASE_URL overrides the download host for the stdio server (local testing before deploy).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import gltfValidator from 'gltf-validator';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const remoteIdx = process.argv.indexOf('--remote');
const remote = remoteIdx > 0 ? process.argv[remoteIdx + 1] : null;
const log = [];
const ok = (name, detail = '') => { log.push(`PASS ${name}${detail ? ' - ' + detail : ''}`); console.log(`PASS ${name}${detail ? ' - ' + detail : ''}`); };
const json = (r) => { assert.ok(!r.isError, 'tool error: ' + JSON.stringify(r.content)); return JSON.parse(r.content[0].text); };

const client = new Client({ name: 'vuena-test', version: '1.0.0' });
if (remote) await client.connect(new StreamableHTTPClientTransport(new URL(remote)));
else await client.connect(new StdioClientTransport({ command: process.execPath, args: [path.join(root, 'dist/stdio.js')], env: { ...process.env } }));
ok('connect', remote ? 'remote ' + remote : 'stdio');
const sv = client.getServerVersion();
assert.equal(sv.name, 'vuena-assets'); ok('server info', `${sv.name} ${sv.version}`);

const tools = (await client.listTools()).tools.map((t) => t.name).sort();
const expected = remote ? ['get_asset', 'list_packs', 'search_assets'] : ['download_asset', 'get_asset', 'list_packs', 'search_assets'];
assert.deepEqual(tools, expected); ok('tools/list', tools.join(', '));

const tree = json(await client.callTool({ name: 'search_assets', arguments: { query: 'tree' } }));
assert.ok(tree.count >= 2); assert.ok(tree.results.some((r) => r.id === 'prop_pine_snow_small')); assert.ok(tree.results.every((r) => r.license === 'CC0-1.0'));
ok('search "tree"', tree.results.map((r) => r.id).join(', '));

const fox = json(await client.callTool({ name: 'search_assets', arguments: { query: 'rigged fox walk', rigged: true } }));
assert.equal(fox.results[0].id, 'animal_fox'); assert.ok(fox.results[0].animations.includes('walk'));
ok('search "rigged fox walk" rigged=true', fox.results[0].id);

const tagged = json(await client.callTool({ name: 'search_assets', arguments: { query: '', tags: ['winter'], limit: 20 } }));
assert.ok(tagged.count >= 10 && tagged.results.every((r) => r.tags.includes('winter')));
ok('search tags=["winter"]', tagged.count + ' results');

const none = json(await client.callTool({ name: 'search_assets', arguments: { query: 'spaceship dreadnought' } }));
assert.equal(none.count, 0); ok('search no-match returns hint');

const a = json(await client.callTool({ name: 'get_asset', arguments: { id: 'prop_snowman_classic' } }));
assert.equal(a.id, 'prop_snowman_classic'); assert.match(a.formats.glb, /\/models\/prop_snowman_classic\.glb$/); assert.equal(a.license, 'CC0-1.0'); assert.ok(a.full_pack_url);
ok('get_asset', a.name + ' -> ' + a.formats.glb);

const bad = await client.callTool({ name: 'get_asset', arguments: { id: 'nope' } });
assert.equal(bad.isError, true); ok('get_asset unknown id -> isError');

const packs = json(await client.callTool({ name: 'list_packs', arguments: {} }));
assert.ok(packs.packs.length >= 10 && packs.packs.every((p) => p.name && p.contents)); assert.ok(packs.packs.filter((p) => p.url).every((p) => p.url.startsWith('https://vuena.itch.io/')));
ok('list_packs', packs.packs.length + ' packs, ' + packs.packs.filter((p) => p.url).length + ' with itch URL');

if (!remote) {
  const dest = fs.mkdtempSync(path.join(os.tmpdir(), 'vuena-dl-'));
  const d = json(await client.callTool({ name: 'download_asset', arguments: { id: 'blocky_03_knight', format: 'glb', dest_dir: path.join(dest, 'assets', 'models') } }));
  assert.ok(fs.existsSync(d.saved_to)); assert.equal(d.sha256_verified, true);
  const buf = fs.readFileSync(d.saved_to);
  assert.equal(buf.readUInt32LE(0), 0x46546c67, 'glTF magic');
  const rep = await gltfValidator.validateBytes(new Uint8Array(buf));
  assert.equal(rep.issues.numErrors, 0, JSON.stringify(rep.issues.messages.slice(0, 3)));
  assert.equal(rep.info.version, '2.0');
  ok('download_asset GLB', `${d.saved_to} ${d.bytes} bytes, glTF ${rep.info.version}, validator errors=${rep.issues.numErrors} warnings=${rep.issues.numWarnings}, animations=${rep.info.animationCount}`);
  const again = json(await client.callTool({ name: 'download_asset', arguments: { id: 'blocky_03_knight', format: 'glb', dest_dir: path.join(dest, 'assets', 'models') } }));
  assert.match(again.status, /already present/); ok('download_asset idempotent', again.status);
  const png = json(await client.callTool({ name: 'download_asset', arguments: { id: 'blocky_03_knight', format: 'png', dest_dir: path.join(dest, 'previews') } }));
  assert.equal(fs.readFileSync(png.saved_to).subarray(1, 4).toString(), 'PNG'); ok('download_asset PNG preview', png.bytes + ' bytes');
  const nf = await client.callTool({ name: 'download_asset', arguments: { id: '../../etc/passwd', format: 'glb', dest_dir: dest } });
  assert.equal(nf.isError, true); ok('download_asset rejects path-traversal id');
  fs.rmSync(dest, { recursive: true, force: true });
}
await client.close();
console.log(`\nALL ${log.length} CHECKS PASSED`);
