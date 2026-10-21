// Prueba de concepto de gráficos para el juego espacial (Opción B del diseño): PixiJS (WebGL).
// Todo se dibuja por código, sin archivos de terceros. Parámetros: ?bloom=0 sin brillo, ?particles=0 sin partículas, ?stars=0 sin estrellas.
import { Application, Container, Graphics, Sprite, Texture, TilingSprite, BlurFilter, FillGradient } from 'pixi.js';

const q = new URLSearchParams(location.search);
const BLOOM = q.get('bloom') !== '0';
const PARTICLES = q.get('particles') !== '0';
const STARS = q.get('stars') !== '0';

const app = new Application();
await app.init({ resizeTo: window, background: '#05060f', antialias: true, resolution: Math.min(devicePixelRatio, 2), autoDensity: true });
document.body.appendChild(app.canvas);
const W = () => app.screen.width;
const H = () => app.screen.height;

/** Textura de un punto con brillo suave (para estrellas, luces y partículas). */
function glowTexture(size, stops) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, col]) => grad.addColorStop(o, col));
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return Texture.from(c);
}
const dot = glowTexture(64, [[0, 'rgba(255,255,255,1)'], [0.25, 'rgba(255,255,255,0.8)'], [1, 'rgba(255,255,255,0)']]);

// --- Fondo: degradado, capas de estrellas con paralaje y nebulosas ---
const bg = new Graphics();
const sky = new FillGradient({ type: 'linear', start: { x: 0, y: 0 }, end: { x: 0, y: 1 }, colorStops: [{ offset: 0, color: '#05060f' }, { offset: 1, color: '#10173a' }] });
bg.rect(0, 0, 2000, 2000).fill(sky);
app.stage.addChild(bg);

function starLayer(count, size, alpha) {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d');
  for (let i = 0; i < count; i++) {
    g.fillStyle = `rgba(${200 + Math.random() * 55},${210 + Math.random() * 45},255,${alpha * (0.4 + Math.random() * 0.6)})`;
    g.beginPath();
    g.arc(Math.random() * 512, Math.random() * 512, size * (0.5 + Math.random()), 0, 7);
    g.fill();
  }
  const t = new TilingSprite({ texture: Texture.from(c), width: 4000, height: 4000 });
  return t;
}
const layers = STARS ? [starLayer(90, 0.8, 0.6), starLayer(60, 1.3, 0.8), starLayer(30, 2, 1)] : [];
layers.forEach((l) => app.stage.addChild(l));

const nebulae = [
  ['rgba(120,60,200,0.55)', 520, 0.2, 0.25],
  ['rgba(40,140,220,0.5)', 640, 0.85, 0.55],
].map(([col, size, fx, fy]) => {
  const s = new Sprite(glowTexture(256, [[0, col], [1, 'rgba(0,0,0,0)']]));
  s.anchor.set(0.5);
  s.width = s.height = size;
  s.blendMode = 'add';
  s.alpha = 0.55;
  s.fx = fx;
  s.fy = fy;
  app.stage.addChild(s);
  return s;
});

// --- Planeta con atmósfera ---
const planet = new Container();
const body = new Graphics();
body.circle(0, 0, 260).fill(new FillGradient({ type: 'radial', center: { x: 0.35, y: 0.3 }, innerRadius: 0, outerCenter: { x: 0.5, y: 0.5 }, outerRadius: 0.75, colorStops: [{ offset: 0, color: '#5fb3ff' }, { offset: 0.5, color: '#2a5fa8' }, { offset: 1, color: '#0b1a3a' }], textureSpace: 'local' }));
const atmo = new Sprite(glowTexture(256, [[0.7, 'rgba(120,200,255,0)'], [0.86, 'rgba(120,200,255,0.55)'], [1, 'rgba(120,200,255,0)']]));
atmo.anchor.set(0.5);
atmo.width = atmo.height = 640;
atmo.blendMode = 'add';
const clouds = new Graphics();
for (let i = 0; i < 14; i++) clouds.ellipse((Math.random() - 0.5) * 380, (Math.random() - 0.5) * 380, 40 + Math.random() * 90, 8 + Math.random() * 14).fill({ color: '#ffffff', alpha: 0.16 });
const cloudMask = new Graphics().circle(0, 0, 258).fill('#fff');
clouds.mask = cloudMask;
planet.addChild(body, clouds, cloudMask, atmo);
app.stage.addChild(planet);

// --- Estación: módulos dibujados por código con degradados y luces ---
const world = new Container();
app.stage.addChild(world);
const station = new Container();
const emissive = new Container(); // lo que brilla; se duplica con desenfoque para el bloom
world.addChild(station);

function metalGradient(c1, c2) {
  return new FillGradient({ type: 'linear', start: { x: 0, y: 0 }, end: { x: 0, y: 1 }, colorStops: [{ offset: 0, color: c1 }, { offset: 1, color: c2 }] });
}
function module(x, y, w, h, c1, c2, glow, windows) {
  const g = new Graphics();
  g.roundRect(x, y, w, h, 14).fill(metalGradient(c1, c2)).stroke({ color: '#0a0d1c', width: 3 });
  g.roundRect(x + 6, y + 5, w - 12, 8, 4).fill({ color: '#ffffff', alpha: 0.22 }); // reflejo
  g.rect(x + 12, y + h - 12, w - 24, 4).fill({ color: '#000', alpha: 0.25 });
  station.addChild(g);
  const lights = [];
  for (let i = 0; i < windows; i++) {
    const wx = x + 18 + i * ((w - 36) / Math.max(1, windows - 1 || 1));
    const s = new Sprite(dot);
    s.anchor.set(0.5);
    s.tint = glow;
    s.width = s.height = 18;
    s.x = windows === 1 ? x + w / 2 : wx;
    s.y = y + h / 2;
    s.phase = Math.random() * 6;
    emissive.addChild(s);
    lights.push(s);
  }
  return lights;
}
const trussG = new Graphics();
trussG.rect(-260, -10, 520, 20).fill(metalGradient('#aab4c8', '#4b556e')).stroke({ color: '#0a0d1c', width: 3 });
for (let i = -250; i < 260; i += 26) trussG.moveTo(i, -10).lineTo(i + 13, 10).stroke({ color: '#0a0d1c', width: 2, alpha: 0.6 });
station.addChild(trussG);
let allLights = [];
allLights = allLights.concat(module(-70, -120, 140, 90, '#7fb6ff', '#2b4f9c', 0x9fe8ff, 4)); // laboratorio
allLights = allLights.concat(module(-250, -75, 150, 60, '#9be39a', '#2d7a3c', 0xe18bff, 5)); // invernadero con luz de cultivo
allLights = allLights.concat(module(100, -75, 150, 60, '#ffb36b', '#9c4a1c', 0xffd27a, 3)); // reactor
allLights = allLights.concat(module(-60, 30, 120, 70, '#c3c9d8', '#5b6482', 0xffffff, 3)); // mando
for (const [px, side] of [[-230, -1], [230, 1]]) {
  const panel = new Graphics();
  panel.rect(px - 38, -190, 76, 150).fill(metalGradient('#1d3a8a', '#0c1a4a')).stroke({ color: '#0a0d1c', width: 3 });
  for (let i = 1; i < 4; i++) panel.moveTo(px - 38, -190 + i * 37.5).lineTo(px + 38, -190 + i * 37.5).stroke({ color: '#6aa8ff', width: 1.5, alpha: 0.5 });
  panel.moveTo(px, -190).lineTo(px, -40).stroke({ color: '#6aa8ff', width: 1.5, alpha: 0.5 });
  panel.poly([px - 38, -190, px - 10, -190, px - 38, -120]).fill({ color: '#fff', alpha: 0.18 });
  station.addChild(panel);
  const strut = new Graphics().rect(px - 3, -40, 6, 30).fill('#6b7490');
  station.addChild(strut);
}
world.addChild(emissive);
emissive.blendMode = 'add';

// Bloom barato: copia del brillo desenfocada, en modo aditivo.
let bloom = null;
if (BLOOM) {
  bloom = new Container();
  bloom.blendMode = 'add';
  bloom.filters = [new BlurFilter({ strength: 10, quality: 2 })];
  bloom.filterArea = undefined;
  world.addChild(bloom);
}

// Motores de una nave de carga con estela de partículas.
const ship = new Container();
const hull = new Graphics();
hull.roundRect(-40, -12, 80, 24, 10).fill(metalGradient('#e6ebf5', '#7b86a3')).stroke({ color: '#0a0d1c', width: 3 });
hull.poly([40, -12, 62, 0, 40, 12]).fill('#c0392b').stroke({ color: '#0a0d1c', width: 3 });
ship.addChild(hull);
world.addChild(ship);
const parts = [];
const pc = new Container();
pc.blendMode = 'add';
world.addChild(pc);
if (PARTICLES) {
  for (let i = 0; i < 160; i++) {
    const s = new Sprite(dot);
    s.anchor.set(0.5);
    s.life = Math.random();
    pc.addChild(s);
    parts.push(s);
  }
}

// --- Cámara: se arrastra con el dedo o el ratón y respira suavemente ---
const cam = { x: 0, y: 0 };
let drag = null;
app.stage.eventMode = 'static';
app.stage.hitArea = app.screen;
app.stage.on('pointerdown', (e) => (drag = { x: e.global.x, y: e.global.y, cx: cam.x, cy: cam.y }));
app.stage.on('pointermove', (e) => drag && ((cam.x = drag.cx + (e.global.x - drag.x)), (cam.y = drag.cy + (e.global.y - drag.y))));
app.stage.on('pointerup', () => (drag = null));
app.stage.on('pointerupoutside', () => (drag = null));

const fpsEl = document.getElementById('fps');
let frames = 0;
let acc = 0;
app.ticker.add((tk) => {
  const dt = tk.deltaMS / 1000;
  const t = performance.now() / 1000;
  acc += dt;
  frames++;
  if (acc >= 1) {
    fpsEl.textContent = `${frames} fps · peor ${Math.round(tk.deltaMS)} ms${BLOOM ? '' : ' · sin bloom'}${PARTICLES ? '' : ' · sin partículas'}`;
    frames = 0;
    acc = 0;
  }
  const cx = W() / 2;
  const cy = H() * 0.5;
  const s = Math.min(1, W() / 620);
  bg.scale.set(1);
  // paralaje: cada capa se mueve una fracción de la cámara
  layers.forEach((l, i) => {
    l.position.set(-1000 + cam.x * (0.1 + i * 0.12) + t * (3 + i * 4), -1000 + cam.y * (0.1 + i * 0.12));
  });
  nebulae.forEach((n, i) => n.position.set(W() * n.fx + cam.x * 0.06 + Math.sin(t * 0.05 + i) * 20, H() * n.fy + cam.y * 0.06));
  planet.position.set(W() * 0.8 + cam.x * 0.2, H() * 0.88 + cam.y * 0.2);
  clouds.rotation = t * 0.01;
  world.scale.set(s);
  world.position.set(cx + cam.x, cy + cam.y + Math.sin(t * 0.6) * 4);
  // luces de las ventanas
  for (const l of allLights) l.alpha = 0.65 + 0.35 * Math.sin(t * 2 + l.phase);
  // bloom: se copian los destellos (posiciones y brillos) a la capa desenfocada
  if (bloom) {
    if (bloom.children.length !== emissive.children.length) {
      bloom.removeChildren();
      for (const e of emissive.children) {
        const c = new Sprite(dot);
        c.anchor.set(0.5);
        c.tint = e.tint;
        c.width = c.height = 54;
        c.x = e.x;
        c.y = e.y;
        bloom.addChild(c);
      }
    }
    bloom.children.forEach((c, i) => (c.alpha = emissive.children[i].alpha * 0.9));
  }
  // nave de carga que cruza y su estela
  const sx = -520 + ((t * 40) % 1100);
  ship.position.set(sx, 160);
  parts.forEach((p, i) => {
    p.life += dt * 0.9;
    if (p.life > 1) {
      p.life = 0;
      p.x = sx - 42;
      p.y = 160 + (Math.random() - 0.5) * 8;
      p.vx = -40 - Math.random() * 60;
      p.vy = (Math.random() - 0.5) * 20;
    }
    p.x += (p.vx ?? 0) * dt;
    p.y += (p.vy ?? 0) * dt;
    const k = 1 - p.life;
    p.alpha = k * 0.8;
    p.width = p.height = 8 + k * 26;
    p.tint = k > 0.5 ? 0xffe6a0 : 0x6fb8ff;
  });
});
