// Renders a 512x512 preview PNG for every model in worker/public/models with three.js in headless Chrome.
// Usage: node scripts/render-previews.mjs [id ...]   (no ids = all)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CDP = process.env.CDP_LIB; // path to a small headless-Chrome CDP helper exporting chrome(), killChromes(), sleep()
if (!CDP) throw new Error('set CDP_LIB to the CDP helper module');
const { chrome, killChromes, sleep } = await import(pathToFileURL(CDP).href);

const catalog = JSON.parse(fs.readFileSync(path.join(root, 'data/catalog.json'), 'utf8'));
const only = process.argv.slice(2);
const ids = catalog.models.map((m) => m.id).filter((id) => !only.length || only.includes(id));
fs.mkdirSync(path.join(root, 'worker/public/previews'), { recursive: true });

const PAGE = `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#dfe7ee}canvas{display:block}</style>
<script type="importmap">{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script>
<script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const W = 512;
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(W, W); renderer.setPixelRatio(1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
// soft vertical gradient backdrop
const c = document.createElement('canvas'); c.width = 4; c.height = 256;
const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#eef3f8'); gr.addColorStop(1, '#c9d4df'); g.fillStyle = gr; g.fillRect(0, 0, 4, 256);
const bg = new THREE.CanvasTexture(c); bg.colorSpace = THREE.SRGBColorSpace; scene.background = bg;
scene.add(new THREE.HemisphereLight(0xffffff, 0x8a96a3, 1.6));
const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(3, 5, 4); scene.add(key);
const fill = new THREE.DirectionalLight(0xbfd4ff, 0.9); fill.position.set(-4, 2, -3); scene.add(fill);
const cam = new THREE.PerspectiveCamera(30, 1, 0.01, 100);
const loader = new GLTFLoader();
let current = null;
window.renderModel = (url) => new Promise((resolve, reject) => {
  loader.load(url, (gltf) => {
    if (current) scene.remove(current);
    const obj = gltf.scene; scene.add(obj); current = obj;
    obj.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(obj);
    const size = box.getSize(new THREE.Vector3()); const ctr = box.getCenter(new THREE.Vector3());
    const r = size.length() / 2;
    const dist = r / Math.sin(THREE.MathUtils.degToRad(cam.fov / 2)) * 1.02;
    const dir = new THREE.Vector3(0.75, 0.5, 1.0).normalize();
    cam.position.copy(ctr).addScaledVector(dir, dist); cam.near = dist / 100; cam.far = dist * 10; cam.updateProjectionMatrix(); cam.lookAt(ctr);
    renderer.render(scene, cam);
    requestAnimationFrame(() => { renderer.render(scene, cam); resolve({ size: size.toArray(), tris: 0 }); });
  }, undefined, (e) => reject(new Error(String(e && e.message || e))));
});
window.ready = true;
</script>`;

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.glb': 'model/gltf-binary' };
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  let f;
  if (u === '/') { res.setHeader('content-type', 'text/html'); return res.end(PAGE); }
  if (u.startsWith('/three/')) f = path.join(root, 'node_modules/three', u.slice(7));
  else if (u.startsWith('/models/')) f = path.join(root, 'worker/public', u);
  if (!f || !fs.existsSync(f)) { res.statusCode = 404; return res.end('nf'); }
  res.setHeader('content-type', MIME[path.extname(f)] || 'application/octet-stream');
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const profile = path.join(os.tmpdir(), 'vuena-render-profile-' + process.pid);
const tab = await chrome('render', 9411 + (process.pid % 300), profile, { args: ['--mute-audio', '--window-size=512,512', '--hide-scrollbars'] });
try {
  await tab.size(512, 512, false);
  await tab.go(`http://127.0.0.1:${port}/`);
  for (let i = 0; i < 40 && !(await tab.ev('window.ready === true')); i++) await sleep(150);
  if (!(await tab.ev('window.ready === true'))) throw new Error('page not ready: ' + tab.errs.join(' | '));
  let n = 0;
  for (const id of ids) {
    try {
      await tab.ev(`window.renderModel('/models/${id}.glb')`);
      await sleep(60);
      await tab.shot(path.join(root, 'worker/public/previews', id + '.png'));
      n++;
    } catch (e) { console.error('FAIL', id, e.message); process.exitCode = 1; }
  }
  console.log('rendered', n, '/', ids.length, tab.errs.length ? 'page errors: ' + tab.errs.slice(0, 3).join(' | ') : '');
} finally {
  killChromes();
  server.close();
}
