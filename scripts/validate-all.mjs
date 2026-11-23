// Validates every hosted GLB with the Khronos glTF validator and checks the catalogue hashes.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import gltfValidator from 'gltf-validator';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cat = JSON.parse(fs.readFileSync(path.join(root, 'data/catalog.json'), 'utf8'));
let errs = 0, warns = 0, bad = 0;
for (const m of cat.models) {
  const b = fs.readFileSync(path.join(root, 'worker/public/models', m.id + '.glb'));
  if (crypto.createHash('sha256').update(b).digest('hex') !== m.sha256) { console.log('HASH MISMATCH', m.id); bad++; }
  const r = await gltfValidator.validateBytes(new Uint8Array(b));
  errs += r.issues.numErrors; warns += r.issues.numWarnings;
  if (r.issues.numErrors) { console.log('ERR', m.id, JSON.stringify(r.issues.messages.slice(0, 2))); bad++; }
  if (!fs.existsSync(path.join(root, 'worker/public/previews', m.id + '.png'))) { console.log('NO PREVIEW', m.id); bad++; }
}
console.log(`validated ${cat.models.length} GLB: errors=${errs} warnings=${warns} problems=${bad}`);
process.exit(bad ? 1 : 0);
