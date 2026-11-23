#!/usr/bin/env node
// Local stdio MCP server: search the bundled catalogue, download GLB files into a project folder.
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer, type Catalog, type DownloadFn } from './core.js';

const here = dirname(fileURLToPath(import.meta.url));
const catalog: Catalog = JSON.parse(readFileSync(join(here, '..', 'data', 'catalog.json'), 'utf8'));

// Optional override for tests / mirrors: VUENA_ASSETS_BASE_URL replaces the catalogue's base_url.
const base = (process.env.VUENA_ASSETS_BASE_URL || '').replace(/\/$/, '');
if (base) {
  for (const m of catalog.models) {
    m.formats.glb = m.formats.glb.replace(catalog.base_url, base);
    m.preview = m.preview.replace(catalog.base_url, base);
  }
  catalog.base_url = base;
}

const download: DownloadFn = async (m, format, destDir, overwrite) => {
  const url = format === 'glb' ? m.formats.glb : m.preview;
  const dir = resolve(process.cwd(), destDir);
  const file = join(dir, `${m.id}.${format}`);
  if (existsSync(file) && !overwrite) {
    const have = createHash('sha256').update(readFileSync(file)).digest('hex');
    if (format === 'glb' && have === m.sha256) return { path: file, bytes: readFileSync(file).length, status: 'already present (identical)', sha256_ok: true };
    if (format === 'png') return { path: file, bytes: readFileSync(file).length, status: 'already present (kept)' };
    throw new Error(`${file} exists and differs; pass overwrite=true to replace it.`);
  }
  const res = await fetch(url, { headers: { 'user-agent': 'vuena-assets-mcp/stdio' } });
  if (!res.ok) throw new Error(`${url} returned HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  let ok: boolean | undefined;
  if (format === 'glb') {
    if (buf.length < 12 || buf.readUInt32LE(0) !== 0x46546c67) throw new Error('downloaded file is not a binary glTF (glTF magic missing)');
    ok = createHash('sha256').update(buf).digest('hex') === m.sha256;
    if (!ok) throw new Error('SHA-256 mismatch against the catalogue; file not saved. Update the package (npx vuena-assets-mcp@latest).');
  }
  mkdirSync(dir, { recursive: true });
  writeFileSync(file, buf);
  return { path: file, bytes: buf.length, status: 'downloaded', sha256_ok: ok };
};

const server = createServer(catalog, { download, transport: 'stdio' });
await server.connect(new StdioServerTransport());
