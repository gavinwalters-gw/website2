"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { couple, formatDate, venue } from "@/content/wedding";

type Point = [number, number];
type Bounds = [left: number, bottom: number, width: number, height: number];
type Bow = (x: number, y: number) => number;
type Draw = (ctx: CanvasRenderingContext2D, width: number, height: number) => void;

const ENVELOPE: Bounds = [-3.4, -2.125, 6.8, 4.25];
const FLAP: Bounds = [-3.4, -2.85, 6.8, 2.85];
const SHEET = 0.028; // paper thickness
const LAYER = 0.036; // spacing between stacked sheets
const PAPER_SIZE = 1024;

const smooth = (t: number) => {
  t = THREE.MathUtils.clamp(t, 0, 1);
  return t * t * (3 - 2 * t);
};

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Tileable value noise with octaves of detail; frequencies that divide 64 wrap cleanly.
function makeNoise(random: () => number, cells = 64) {
  const grid = Float32Array.from({ length: cells * cells }, random);
  const at = (i: number, j: number) => grid[(((j % cells) + cells) % cells) * cells + (((i % cells) + cells) % cells)];
  const single = (x: number, y: number) => {
    const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    return THREE.MathUtils.lerp(
      THREE.MathUtils.lerp(at(ix, iy), at(ix + 1, iy), sx),
      THREE.MathUtils.lerp(at(ix, iy + 1), at(ix + 1, iy + 1), sx),
      sy,
    );
  };
  return (x: number, y: number, octaves: number) => {
    let value = 0, amplitude = 0.5, total = 0;
    for (let o = 0; o < octaves; o++) {
      value += single(x, y) * amplitude;
      total += amplitude;
      x *= 2; y *= 2; amplitude *= 0.5;
    }
    return value / total;
  };
}

// Subdivided, solid paper: the two faces and the cut edges share one gently curved surface.
// UVs use a uniform scale (units of panel width) so the paper grain is square on every panel.
function paperPanel(points: Point[], thickness: number, bow: Bow, bounds: Bounds) {
  const vertices: number[] = [], uvs: number[] = [], indices: number[] = [];
  const triangles = THREE.ShapeUtils.triangulateShape(points.map(p => new THREE.Vector2(...p)), []);
  const [left, bottom, width] = bounds;
  const vertex = (x: number, y: number, z: number) => {
    const index = vertices.length / 3;
    vertices.push(x, y, bow(x, y) + z);
    uvs.push((x - left) / width, (y - bottom) / width);
    return index;
  };
  const geometry = new THREE.BufferGeometry();
  const n = 28;
  for (const face of [1, -1]) {
    const start = indices.length;
    for (const triangle of triangles) {
      const [a, b, c] = triangle.map(i => points[i]);
      const rows: number[][] = [];
      for (let i = 0; i <= n; i++) {
        rows[i] = [];
        for (let j = 0; j <= n - i; j++) {
          rows[i][j] = vertex(
            a[0] + (b[0] - a[0]) * i / n + (c[0] - a[0]) * j / n,
            a[1] + (b[1] - a[1]) * i / n + (c[1] - a[1]) * j / n,
            face * thickness / 2,
          );
        }
      }
      const add = (p: number, q: number, r: number) => (face === 1 ? indices.push(p, q, r) : indices.push(p, r, q));
      for (let i = 0; i < n; i++) for (let j = 0; j < n - i; j++) {
        add(rows[i][j], rows[i + 1][j], rows[i][j + 1]);
        if (j < n - i - 1) add(rows[i + 1][j], rows[i + 1][j + 1], rows[i][j + 1]);
      }
    }
    geometry.addGroup(start, indices.length - start, face === 1 ? 0 : 1);
  }
  const start = indices.length;
  points.forEach((a, i) => {
    const b = points[(i + 1) % points.length];
    for (let j = 0; j < n; j++) {
      const x = a[0] + (b[0] - a[0]) * j / n, y = a[1] + (b[1] - a[1]) * j / n;
      const nx = a[0] + (b[0] - a[0]) * (j + 1) / n, ny = a[1] + (b[1] - a[1]) * (j + 1) / n;
      const v = [vertex(x, y, thickness / 2), vertex(x, y, -thickness / 2), vertex(nx, ny, thickness / 2), vertex(nx, ny, -thickness / 2)];
      indices.push(v[0], v[1], v[2], v[2], v[1], v[3]);
    }
  });
  geometry.addGroup(start, indices.length - start, 2);
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

// Cotton paper: broad formation mottling, tangled fibers and fine grain, baked into
// color, normal and roughness maps so the sheet catches light like real stock.
function buildPaper(random: () => number) {
  const size = PAPER_SIZE;
  const noise = makeNoise(random);
  const fibers = document.createElement("canvas");
  fibers.width = fibers.height = size;
  const fc = fibers.getContext("2d")!;
  fc.fillStyle = "#000";
  fc.fillRect(0, 0, size, size);
  fc.lineCap = "round";
  for (let i = 0; i < 30000; i++) {
    const x = random() * size, y = random() * size, angle = random() * Math.PI, length = 3 + random() * 10;
    fc.strokeStyle = `rgba(255,255,255,${0.12 + random() * 0.3})`;
    fc.lineWidth = 0.7 + random() * 0.9;
    fc.beginPath();
    fc.moveTo(x, y);
    fc.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
    fc.stroke();
  }
  const fiber = fc.getImageData(0, 0, size, size).data;
  const height = new Float32Array(size * size);
  const color = new ImageData(size, size), normal = new ImageData(size, size), rough = new ImageData(size, size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = y * size + x;
    const formation = noise(x / size * 4, y / size * 4, 5);
    const f = fiber[i * 4] / 255;
    const grain = random();
    height[i] = formation * 0.5 + f * 0.35 + grain * 0.15;
    const value = 234 + (formation - 0.5) * 16 + (f - 0.5) * 7 + (grain - 0.5) * 5;
    color.data[i * 4] = value + 4; color.data[i * 4 + 1] = value + 1; color.data[i * 4 + 2] = value - 5; color.data[i * 4 + 3] = 255;
    const r = 222 + (formation - 0.5) * 30 + (grain - 0.5) * 24;
    rough.data[i * 4] = r; rough.data[i * 4 + 1] = r; rough.data[i * 4 + 2] = r; rough.data[i * 4 + 3] = 255;
  }
  const at = (x: number, y: number) => height[((y + size) % size) * size + ((x + size) % size)];
  const strength = 85;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 4;
    const dx = (at(x + 1, y) - at(x - 1, y)) / 2, dy = (at(x, y + 1) - at(x, y - 1)) / 2;
    normal.data[i] = THREE.MathUtils.clamp(128 - dx * strength, 0, 255);
    normal.data[i + 1] = THREE.MathUtils.clamp(128 + dy * strength, 0, 255);
    normal.data[i + 2] = 255; normal.data[i + 3] = 255;
  }
  const toCanvas = (data: ImageData) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    canvas.getContext("2d")!.putImageData(data, 0, 0);
    return canvas;
  };
  const colorCanvas = toCanvas(color);
  const cc = colorCanvas.getContext("2d")!;
  for (let i = 0; i < 260; i++) {
    cc.fillStyle = `rgba(118,102,84,${0.18 + random() * 0.28})`;
    cc.beginPath();
    cc.ellipse(random() * size, random() * size, 0.8 + random() * 1.8, 0.6 + random() * 1.2, random() * Math.PI, 0, Math.PI * 2);
    cc.fill();
  }
  return { color: colorCanvas, normal: toCanvas(normal), rough: toCanvas(rough) };
}

// A scalloped cotton border lace: a sewn band, open diamond net and round medallions.
function drawLace(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.clearRect(0, 0, W, H);
  const ink = "#fffdf6";
  ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineCap = "round"; ctx.lineJoin = "round";
  const line = (x1: number, y1: number, x2: number, y2: number) => { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); };
  const dot = (x: number, y: number, r: number) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); };
  const cx = W / 2, cy = 176, r = 96;
  // Sewn band with small loops along its outer edge.
  ctx.lineWidth = 2.4;
  for (let x = 0; x < W; x += 12) { ctx.beginPath(); ctx.arc(x + 6, 5, 3.4, 0, Math.PI * 2); ctx.stroke(); }
  ctx.lineWidth = 5; line(0, 13, W, 13); line(0, 29, W, 29);
  ctx.lineWidth = 2.8;
  for (let x = 0; x < W; x += 12) { ctx.beginPath(); ctx.moveTo(x, 15); ctx.lineTo(x + 6, 27); ctx.lineTo(x + 12, 15); ctx.stroke(); }
  // Diamond net with knotted intersections, running down into the scallop.
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 29, W, cy - 29); ctx.arc(cx, cy, r - 3, 0, Math.PI * 2); ctx.clip();
  ctx.lineWidth = 3.6;
  for (let x = -H; x < W + H; x += 12) { line(x, 0, x + H, H); line(x, H, x + H, 0); }
  for (let y = 36; y < cy; y += 12) for (let x = (y / 12) % 2 ? 6 : 0; x < W; x += 12) dot(x, y, 2.8);
  ctx.restore();
  ctx.lineWidth = 3; line(0, cy - 2, W, cy - 2);
  // Medallion: a densely worked round with a floral centre, its lower half forming the scallop hem.
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r - 6, 0, Math.PI * 2); ctx.clip();
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "rgba(255,253,246,.14)"; ctx.fillRect(0, 0, W, H); ctx.fillStyle = ink;
  ctx.lineWidth = 1.5;
  for (let x = -H; x < W + H; x += 10) { line(x, 0, x + H, H); line(x, H, x + H, 0); }
  ctx.restore();
  ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(cx, cy, r - 4, 0.02 * Math.PI, 0.98 * Math.PI); ctx.stroke();
  ctx.lineWidth = 3.4; ctx.beginPath(); ctx.arc(cx, cy, r - 17, 0, Math.PI * 2); ctx.stroke();
  for (let k = 0; k < 8; k++) {
    const angle = k / 8 * Math.PI * 2;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle);
    ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(47, 0, 28, 13, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 2.4; line(24, 0, 70, 0);
    ctx.restore();
  }
  ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2); ctx.stroke();
  dot(cx, cy, 7);
  // Picots along the hem.
  for (let a = 0.05 * Math.PI; a <= 0.95 * Math.PI; a += 0.0409 * Math.PI) dot(cx + Math.cos(a) * (r + 5), cy + Math.sin(a) * (r + 5), 3.4);
}

// A wax seal pressed with a round stamp, in units of the stamped face radius: a broad flat face
// with a fine ring near its edge, a crease and a narrow rounded rim where the stamp squeezed the wax,
// then a wide, thick skirt of spread wax with a few lobes and a rounded edge.
function sealGeometry(radius: number, depth: number, drop: (y: number) => number) {
  const bump = (x: number, width: number) => Math.exp(-(x * x) / (width * width));
  const lobe = (a: number, at: number, width: number) => bump(Math.atan2(Math.sin(a - at), Math.cos(a - at)), width);
  const outline = (a: number) => 1.42 + 0.08 * Math.sin(2 * a + 0.5) + 0.05 * Math.sin(3 * a + 1.7) + 0.03 * Math.sin(5 * a + 0.3)
    + 0.2 * lobe(a, 0.9, 0.3) + 0.14 * lobe(a, 3.8, 0.36) + 0.1 * lobe(a, 5.6, 0.22);
  const extent = 1.8;
  const rings = 160, segments = 224;
  const positions: number[] = [], indices: number[] = [];
  for (let i = 0; i <= rings; i++) {
    for (let j = 0; j < segments; j++) {
      const a = j / segments * Math.PI * 2;
      const R = outline(a);
      const rr = Math.min(i / rings * extent, R);
      const ring = 0.07 * bump(rr - 0.9, 0.025);
      const crease = -0.12 * bump(rr - 1.0, 0.03);
      const t = (rr - 1.1) / 0.11;
      const rim = Math.abs(t) < 1 ? 0.32 * Math.sqrt(1 - t * t) : 0;
      const edge = THREE.MathUtils.clamp((rr - (R - 0.3)) / 0.3, 0, 1);
      const body = 0.5 * Math.sqrt(Math.max(0, 1 - edge * edge));
      const h = body + ring + crease + rim;
      const x = rr * Math.cos(a) * radius, y = rr * Math.sin(a) * radius;
      positions.push(x, y, h * depth - drop(y));
    }
  }
  for (let i = 0; i < rings; i++) for (let j = 0; j < segments; j++) {
    const a = i * segments + j, b = i * segments + (j + 1) % segments, c = a + segments, d = b + segments;
    indices.push(a, c, b, b, c, d);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

// A surface sampled from a parametric function over u in [0, 1] and v in [-1, 1], optionally
// tinted per vertex.
function sheet(point: (u: number, v: number, out: THREE.Vector3) => void, nu: number, nv: number, tint?: (u: number, v: number, out: THREE.Color) => void) {
  const positions: number[] = [], colors: number[] = [], indices: number[] = [];
  const p = new THREE.Vector3(), c = new THREE.Color();
  for (let i = 0; i <= nu; i++) for (let j = 0; j <= nv; j++) {
    const u = i / nu, v = j / nv * 2 - 1;
    point(u, v, p);
    positions.push(p.x, p.y, p.z);
    if (tint) { tint(u, v, c); colors.push(c.r, c.g, c.b); }
  }
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const a = i * (nv + 1) + j, b = a + nv + 1;
    indices.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  if (tint) geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

type RoseMaterials = { petal: THREE.Material; core: THREE.Material; green: THREE.Material };

// A rose bloom about `size` in radius with its axis along +y and its base at the origin. Petals
// sit on a golden-angle spiral: the innermost furled tight and upright around a bud, each one
// after it longer, wider and bent further back, with edges that curl outward and ripple; a ring
// of sepals and a receptacle sit under them.
function roseBloom(size: number, materials: RoseMaterials) {
  const bloom = new THREE.Group();
  const count = 34, golden = Math.PI * (3 - Math.sqrt(5));
  const deep = new THREE.Color("#4e0810"), red = new THREE.Color("#c81e34"), blush = new THREE.Color("#ef7f90");
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1), phi0 = i * golden;
    const length = size * (0.6 + 0.7 * t), width = size * (0.3 + 0.55 * t);
    const r0 = size * (0.05 + 0.2 * t), y0 = size * 0.12 * (1 - t);
    const open = 0.45 + 2.3 * Math.pow(t, 1.5);
    const geometry = sheet((u, v, out) => {
      const th = open * u;
      const rad = r0 + length / open * (1 - Math.cos(th));
      const height = y0 + length / open * Math.sin(th);
      const half = width * (0.12 + 0.88 * Math.sin(Math.PI * Math.pow(u, 0.7)));
      const phi = phi0 + v * Math.min(half / Math.max(rad, 1e-4), 1.55);
      const curl = size * 0.16 * t * v * v * u * u;
      const ripple = size * 0.025 * t * u * u * Math.sin(v * 5.5 + i * 1.7);
      const R = rad + curl + ripple;
      out.set(R * Math.cos(phi), height - size * 0.08 * t * v * v * u * u, R * Math.sin(phi));
    }, 28, 14, (u, v, out) => {
      out.copy(deep).lerp(red, smooth(u * 1.3 - 0.1)).lerp(blush, 0.4 * t * u * smooth((Math.abs(v) - 0.4) / 0.6));
    });
    const petal = new THREE.Mesh(geometry, materials.petal);
    petal.castShadow = petal.receiveShadow = true;
    bloom.add(petal);
  }
  const core = new THREE.Mesh(new THREE.SphereGeometry(size * 0.13, 16, 12), materials.core);
  core.position.y = size * 0.4;
  bloom.add(core);
  for (let k = 0; k < 5; k++) {
    const phi0 = k / 5 * Math.PI * 2 + 0.3;
    const sepal = new THREE.Mesh(sheet((u, v, out) => {
      const rad = size * 0.14 + u * size * 0.7;
      const half = size * 0.13 * Math.sin(Math.PI * Math.pow(u, 0.6));
      const phi = phi0 + v * half / rad;
      out.set(rad * Math.cos(phi), size * (0.1 - 0.22 * u * u - 0.03 * v * v), rad * Math.sin(phi));
    }, 12, 6), materials.green);
    sepal.castShadow = sepal.receiveShadow = true;
    bloom.add(sepal);
  }
  const receptacle = new THREE.Mesh(new THREE.SphereGeometry(size * 0.16, 16, 12), materials.green);
  receptacle.position.y = size * 0.04;
  receptacle.scale.y = 0.7;
  bloom.add(receptacle);
  return bloom;
}

// A compound rose leaf lying in the xy-plane, growing from the origin along +x: a short petiole,
// a pair of lateral leaflets and a terminal one, each serrated, folded along its midrib and arched.
function roseLeaf(length: number, materials: RoseMaterials) {
  const leaf = new THREE.Group();
  const leaflet = (size: number) => sheet((u, v, out) => {
    const w = size * 0.42 * Math.sin(Math.PI * Math.pow(u, 0.8)) * (1 + 0.05 * Math.sin(u * 46));
    out.set(u * size, v * w, Math.abs(v) * w * 0.35 + Math.sin(Math.PI * u) * size * 0.06);
  }, 20, 8);
  const petiole = new THREE.Mesh(new THREE.CylinderGeometry(length * 0.03, length * 0.035, length * 0.4, 6), materials.green);
  petiole.rotation.z = -Math.PI / 2;
  petiole.position.x = length * 0.2;
  leaf.add(petiole);
  for (const [at, angle, size] of [[0.35, 0.95, 0.5], [0.35, -0.95, 0.5], [0.4, 0, 0.6]] as const) {
    const blade = new THREE.Mesh(leaflet(length * size), materials.green);
    blade.position.x = length * at;
    blade.rotation.z = angle;
    blade.castShadow = blade.receiveShadow = true;
    leaf.add(blade);
  }
  return leaf;
}


// The first screen of the site. It sits sticky inside a tall `.envelope-scroll` section and
// scrolling through that section opens it: the seal melts away, the flap folds back and the
// invitation card slides out and comes forward, before the rest of the page scrolls up over it.
export default function WeddingLetter() {
  const host = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    if (!host.current || !stage.current) return;
    const container = host.current;
    const scene_ = stage.current;
    const section = scene_.closest<HTMLElement>(".envelope-scroll") ?? scene_;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      const frame = requestAnimationFrame(() => setUnavailable(true));
      return () => cancelAnimationFrame(frame);
    }
    // Phones get a lighter shadow map so scrolling the envelope open stays fluid.
    const small = Math.min(window.innerWidth, window.innerHeight) < 700;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.86;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const studio = new RoomEnvironment();
    const environment = pmrem.fromScene(studio, 0.04);
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.55;
    studio.dispose(); pmrem.dispose();

    // A soft studio key from the upper left, a cool fill from the right, and gentle ambient.
    scene.add(new THREE.HemisphereLight(0xfff9ef, 0x5f5b50, 0.22));
    const key = new THREE.SpotLight(0xfff3e2, 300, 0, 0.46, 0.85, 2);
    key.position.set(-4.2, 6.2, 10);
    key.target.position.set(0, -0.4, 0);
    key.castShadow = true;
    key.shadow.mapSize.setScalar(small ? 1024 : 2048);
    key.shadow.camera.near = 4; key.shadow.camera.far = 24;
    key.shadow.bias = -0.0003; key.shadow.normalBias = 0.012;
    scene.add(key, key.target);
    const fill = new THREE.DirectionalLight(0xe6ecf6, 0.35);
    fill.position.set(6, 1.5, 5);
    scene.add(fill);

    const maps: THREE.Texture[] = [];
    const register = (map: THREE.Texture, color: boolean) => {
      map.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      map.anisotropy = renderer.capabilities.getMaxAnisotropy();
      maps.push(map);
      return map;
    };
    // Canvas textures remember how they were drawn so the lettering can be redrawn once the web fonts arrive.
    const redraws: (() => void)[] = [];
    const texture = (w: number, h: number, draw: Draw, color = true) => {
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      draw(ctx, w, h);
      const map = register(new THREE.CanvasTexture(canvas), color);
      redraws.push(() => { draw(ctx, w, h); map.needsUpdate = true; });
      return map;
    };
    const fonts = getComputedStyle(document.documentElement);
    const script = fonts.getPropertyValue("--font-script").trim() || '"Snell Roundhand", "Apple Chancery", cursive';
    const serif = fonts.getPropertyValue("--font-serif").trim() || "Georgia, serif";
    const random = seeded(41);
    const stock = buildPaper(random);
    const paperColor = register(new THREE.CanvasTexture(stock.color), true);
    const paperNormal = register(new THREE.CanvasTexture(stock.normal), false);
    const paperRough = register(new THREE.CanvasTexture(stock.rough), false);
    // Printed faces: the paper's own mottling underneath, drawn at a uniform scale. The lettering is
    // laid out in `w`×`h` units but rasterised at twice that so it stays crisp up close on phones.
    const printScale = Math.min(2, renderer.capabilities.maxTextureSize / 1536);
    const printed = (w: number, h: number, bounds: Bounds, draw: Draw) => {
      const map = texture(Math.round(w * printScale), Math.round(h * printScale), (ctx, W, H) => {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(stock.color, 0, 0, PAPER_SIZE, PAPER_SIZE * H / W, 0, 0, W, H);
        ctx.setTransform(printScale, 0, 0, printScale, 0, 0);
        draw(ctx, w, h);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      });
      map.repeat.set(1, bounds[2] / bounds[3]);
      return map;
    };
    const paper = (color: string, extra: THREE.MeshPhysicalMaterialParameters = {}) => new THREE.MeshPhysicalMaterial({
      color, map: paperColor, normalMap: paperNormal, normalScale: new THREE.Vector2(0.7, 0.7),
      roughnessMap: paperRough, roughness: 1, sheen: 0.35, sheenRoughness: 0.85, sheenColor: new THREE.Color("#fffaf0"),
      envMapIntensity: 0.9, ...extra,
    });
    const ivory = paper("#f3ede2"), foldedIvory = paper("#ece5d8"), cutEdge = paper("#d8cfbe", { sheen: 0 });

    const envelope = new THREE.Group();
    scene.add(envelope);
    const addPanel = (points: Point[], z: number, front: THREE.Material, back: THREE.Material, bow: Bow, parent = envelope, bounds = ENVELOPE, thickness = SHEET) => {
      const mesh = new THREE.Mesh(paperPanel(points, thickness, bow, bounds), [front, back, cutEdge]);
      mesh.position.z = z;
      mesh.castShadow = mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    };
    // The card inside swells the envelope; every front sheet follows the same bulge so they stack cleanly.
    const bulge: Bow = (x, y) => 0.13 * Math.pow(Math.max(0, Math.cos(x / 3.4 * Math.PI / 2)), 0.8) * Math.pow(Math.max(0, Math.cos(y / 2.125 * Math.PI / 2)), 0.8);
    const rect: Point[] = [[-3.4, -2.125], [3.4, -2.125], [3.4, 2.125], [-3.4, 2.125]];
    addPanel(rect, -0.11, ivory, ivory, (x, y) => -0.45 * bulge(x, y));

    const cardBounds: Bounds = [-3.08, -1.86, 6.16, 3.72];
    // The invitation card that slides out: names, date and place, inside a fine double rule.
    const drawInvitation: Draw = ctx => {
      ctx.strokeStyle = "#cdbfa6";
      ctx.lineWidth = 2; ctx.strokeRect(30, 30, 964, 560);
      ctx.lineWidth = 1; ctx.strokeRect(42, 42, 940, 536);
      ctx.textAlign = "center";
      ctx.fillStyle = "#6f6456"; ctx.font = `600 31px ${serif}`; ctx.letterSpacing = "9px";
      ctx.fillText("WE’RE GETTING MARRIED", 512, 145);
      ctx.fillStyle = "#4a4137"; ctx.font = `150px ${script}`; ctx.letterSpacing = "0px";
      ctx.fillText(`${couple.first} & ${couple.second}`, 512, 318);
      ctx.fillStyle = "#b9ab93"; ctx.fillRect(462, 372, 100, 1.5);
      ctx.fillStyle = "#4f473c"; ctx.font = `600 36px ${serif}`; ctx.letterSpacing = "7px";
      ctx.fillText(formatDate("short").toUpperCase(), 512, 442);
      ctx.font = `italic 40px ${serif}`; ctx.letterSpacing = "1px";
      ctx.fillText(venue.city, 512, 510);
      ctx.letterSpacing = "0px";
    };
    const card = addPanel([[-3.08, -1.86], [3.08, -1.86], [3.08, 1.86], [-3.08, 1.86]], -0.04, paper("#fbf8f1", { map: printed(1024, 620, cardBounds, drawInvitation) }), ivory, (x, y) => 0.25 * bulge(x, y), envelope, cardBounds, 0.04);
    card.position.y = -0.08;

    // Side folds, then the bottom pocket over them: separate sheets so they shade one another.
    addPanel([[-3.4, -2.125], [0.42, -0.22], [-3.4, 2.125]], 0, ivory, foldedIvory, bulge);
    addPanel([[-0.42, -0.22], [3.4, -2.125], [3.4, 2.125]], 0.004, ivory, foldedIvory, bulge);
    const pocketMap = printed(1024, 640, ENVELOPE, ctx => {
      ctx.textAlign = "center"; ctx.fillStyle = "#5b5246"; ctx.font = `italic 36px ${serif}`;
      ctx.fillText("Scroll to Open", 512, 572);
    });
    const plainMap = printed(1024, 640, ENVELOPE, () => {});
    const pocketMaterial = paper("#f7f2e8", { map: pocketMap });
    addPanel([[-3.4, -2.125], [3.4, -2.125], [0, -0.3]], LAYER, pocketMaterial, ivory, bulge);

    const flapMap = printed(1536, 640, FLAP, ctx => {
      ctx.textAlign = "center"; ctx.fillStyle = "#5b5246"; ctx.font = `italic 46px ${serif}`;
      ctx.fillText("The Wedding of", 768, 93);
      ctx.fillStyle = "#4f463c"; ctx.font = `140px ${script}`;
      ctx.fillText(`${couple.first} & ${couple.second}`, 768, 240);
    });
    const hinge = new THREE.Group();
    const hingeZ = LAYER * 2;
    hinge.position.set(0, 2.125, hingeZ);
    envelope.add(hinge);
    const flapBow: Bow = (x, y) => bulge(x, y + 2.125);
    addPanel([[-3.4, 0], [0, -2.85], [3.4, 0]], 0, paper("#f8f4ea", { map: flapMap }), foldedIvory, flapBow, hinge, FLAP);

    // Lace trim along both flap edges: the sewn band sits on the flap, scallops drape past its edge.
    const laceMap = texture(192, 320, drawLace);
    laceMap.wrapS = THREE.RepeatWrapping;
    const cotton = new THREE.MeshPhysicalMaterial({
      color: "#ffffff", emissive: new THREE.Color("#fff8ea"), emissiveIntensity: 0.18, map: laceMap, bumpMap: laceMap, bumpScale: 0.01, transparent: true, depthWrite: false, alphaTest: 0.04,
      side: THREE.DoubleSide, roughness: 0.92, sheen: 0.5, sheenRoughness: 0.7, sheenColor: new THREE.Color("#ffffff"),
    });
    const cottonDepth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: laceMap, alphaTest: 0.45 });
    for (const side of [-1, 1]) {
      const a = new THREE.Vector2(side * 3.4, 0), b = new THREE.Vector2(0, -2.85);
      const direction = b.clone().sub(a).normalize();
      const inward = new THREE.Vector2(direction.y * side, -direction.x * side);
      const length = a.distanceTo(b), repeats = 18;
      const point = (t: number, v: number) => {
        const distance = t * length;
        const taper = smooth(distance / 0.4);
        const inset = THREE.MathUtils.lerp(0.1, -0.3, v) * taper;
        const p = a.clone().addScaledVector(direction, distance).addScaledVector(inward, inset);
        const z = flapBow(p.x, p.y) + SHEET / 2 + 0.004 - Math.max(0, -inset) * 0.09 + (side === 1 ? 0.002 : 0);
        return new THREE.Vector3(p.x, p.y, z);
      };
      const positions: number[] = [], uv: number[] = [], indices: number[] = [];
      const rows = repeats * 12, columns = 12;
      for (let i = 0; i <= rows; i++) for (let j = 0; j <= columns; j++) {
        const p = point(i / rows, j / columns);
        positions.push(p.x, p.y, p.z);
        uv.push(i / rows * repeats, 1 - j / columns);
      }
      for (let i = 0; i < rows; i++) for (let j = 0; j < columns; j++) {
        const p = i * (columns + 1) + j, q = p + columns + 1;
        if (side === 1) indices.push(p, q, p + 1, q, q + 1, p + 1);
        else indices.push(p, p + 1, q, q, p + 1, q + 1);
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      const lace = new THREE.Mesh(geometry, cotton);
      lace.customDepthMaterial = cottonDepth;
      lace.castShadow = lace.receiveShadow = true;
      hinge.add(lace);
    }

    // The wax seal straddles the flap tip; the part past the tip settles onto the pocket below.
    const sealY = -2.72;
    const sealDrop = (y: number) => LAYER * smooth((-2.85 - (sealY + y)) / 0.12);
    const seal = new THREE.Mesh(
      sealGeometry(0.28, 0.15, sealDrop),
      new THREE.MeshPhysicalMaterial({ color: "#e4dccb", roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.15, ior: 1.5, envMapIntensity: 1.1, transparent: true }),
    );
    const wax = seal.material;
    seal.position.set(0, sealY, flapBow(0, sealY) + SHEET / 2 - 0.004);
    seal.rotation.z = -0.03;
    seal.castShadow = seal.receiveShadow = true;
    hinge.add(seal);

    // A miniature rose laid across the seal's face: the bloom up and to the left, tilted so it is
    // seen from slightly above, its stem trailing down to the right with a leaf either side.
    const roseMaterials: RoseMaterials = {
      petal: new THREE.MeshPhysicalMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.62, sheen: 0.8, sheenColor: 0xff9aa8, sheenRoughness: 0.6, side: THREE.DoubleSide, transparent: true }),
      core: new THREE.MeshPhysicalMaterial({ color: "#3e0810", roughness: 0.7, transparent: true }),
      green: new THREE.MeshPhysicalMaterial({ color: "#3a6329", roughness: 0.58, sheen: 0.35, sheenColor: 0x9ad07a, side: THREE.DoubleSide, transparent: true }),
    };
    const faceZ = (y: number) => 0.075 - sealDrop(y); // top of the stamped face in seal space
    const bloomAt = new THREE.Vector3(-0.06, 0.07, faceZ(0.07) + 0.004);
    const bloomAxis = new THREE.Vector3(-0.3, 0.3, 1).normalize();
    const bloom = roseBloom(0.1, roseMaterials);
    bloom.position.copy(bloomAt);
    bloom.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), bloomAxis);
    seal.add(bloom);
    const stemRadius = 0.011;
    const stemPath = new THREE.CatmullRomCurve3([
      bloomAt.clone(),
      new THREE.Vector3(-0.01, 0.02, faceZ(0.02) + stemRadius),
      new THREE.Vector3(0.05, -0.06, faceZ(-0.06) + stemRadius),
      new THREE.Vector3(0.16, -0.17, faceZ(-0.17) + stemRadius),
    ]);
    const stem = new THREE.Mesh(new THREE.TubeGeometry(stemPath, 28, stemRadius, 8, false), roseMaterials.green);
    stem.castShadow = stem.receiveShadow = true;
    seal.add(stem);
    for (const [at, side] of [[0.45, 1], [0.7, -1]] as const) {
      const thorn = new THREE.Mesh(new THREE.ConeGeometry(stemRadius * 0.8, 0.028, 6), roseMaterials.green);
      const point = stemPath.getPointAt(at), tangent = stemPath.getTangentAt(at);
      const normal = new THREE.Vector3(-tangent.y, tangent.x, 0).multiplyScalar(side);
      thorn.position.copy(point).addScaledVector(normal, stemRadius * 0.6);
      thorn.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal.clone().addScaledVector(tangent, -0.5).normalize());
      thorn.position.addScaledVector(normal.clone().addScaledVector(tangent, -0.5).normalize(), 0.012);
      seal.add(thorn);
    }
    for (const [at, angle] of [[0.4, -2.35], [0.68, 0.35]] as const) {
      const point = stemPath.getPointAt(at);
      const leaf = roseLeaf(0.15, roseMaterials);
      leaf.position.set(point.x, point.y, faceZ(point.y) + 0.003);
      leaf.rotation.z = angle;
      seal.add(leaf);
    }

    // A soft contact shadow behind the envelope instead of a hard projected one.
    const shadowMap = texture(512, 360, (ctx, W, H) => {
      ctx.clearRect(0, 0, W, H);
      ctx.filter = "blur(22px)";
      ctx.fillStyle = "#1e1a14";
      ctx.beginPath(); ctx.roundRect(54, 54, W - 108, H - 108, 4); ctx.fill();
    });
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(8.6, 6.05), new THREE.MeshBasicMaterial({ map: shadowMap, transparent: true, opacity: 0.55, depthWrite: false }));
    shadow.position.set(0.14, -0.3, -0.5);
    envelope.add(shadow);

    let frame = 0, last = 0, progress = 0, clock = 0, printedHint = true;
    let hidden = document.hidden, contextLost = false, inView = true, disposed = false;
    const pointer = new THREE.Vector2(), smoothPointer = new THREE.Vector2();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const render = () => renderer.render(scene, camera);
    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      camera.aspect = width / Math.max(height, 1);
      camera.position.z = Math.max(13.4, 8.2 / camera.aspect / (2 * Math.tan(THREE.MathUtils.degToRad(16))));
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      render();
    };
    // How far the reader has scrolled through the envelope's section, 0 (sealed) to 1 (card presented).
    const scrolled = () => {
      const box = section.getBoundingClientRect();
      const run = box.height - window.innerHeight;
      return run > 0 ? THREE.MathUtils.clamp(-box.top / run, 0, 1) : 0;
    };
    const animate = (now: number) => {
      if (hidden || contextLost || !inView) return;
      frame = requestAnimationFrame(animate);
      const target = scrolled();
      const settling = Math.abs(target - progress) > 0.0004;
      // Follow the scroll every frame while it moves; idle floating only needs 30fps.
      if (!settling && now - last < 1000 / 30) return;
      const delta = Math.min((now - last) / 1000, 0.06);
      last = now;
      const still = reducedMotion.matches;
      if (!still) clock += delta;
      // Tracks the scroll closely (only smoothing out touch jitter), so a fast flick opens it fast
      // and a slow scroll unfolds it slowly.
      progress = still ? target : THREE.MathUtils.lerp(progress, target, 1 - Math.exp(-delta * 32));
      if (!settling) progress = target;
      scene_.style.setProperty("--open", progress.toFixed(4));

      smoothPointer.lerp(pointer, 0.055);
      const flap = smooth((progress - 0.04) / 0.34);
      const rise = smooth((progress - 0.34) / 0.42);
      const present = smooth((progress - 0.7) / 0.3);
      const motion = (still ? 0 : 1) * (1 - 0.85 * present);
      // The envelope sinks as the card rises, so the card ends centred with the envelope below it.
      envelope.position.y = -4.1 * smooth((progress - 0.34) / 0.5) + Math.sin(clock * 0.8) * 0.1 * motion;
      envelope.rotation.set(
        (0.16 - 0.12 * present) + Math.sin(clock * 0.55) * 0.04 * motion - smoothPointer.y * 0.08 * motion,
        (-0.16 + 0.16 * present) + Math.sin(clock * 0.65) * 0.08 * motion + smoothPointer.x * 0.12 * motion,
        (-0.06 + 0.06 * present) + Math.sin(clock * 0.45) * 0.02 * motion,
      );
      // The flap travels over the hinge and settles behind the card.
      hinge.rotation.x = -Math.PI * 1.045 * flap;
      hinge.position.z = hingeZ - 0.4 * smooth((progress - 0.2) / 0.3);
      card.position.y = -0.08 + rise * 4.2;
      card.position.z = -0.04 + present * 1.7;
      const dissolve = smooth(progress / 0.1);
      wax.opacity = 1 - dissolve;
      for (const material of Object.values(roseMaterials)) material.opacity = wax.opacity;
      seal.visible = dissolve < 1;
      if (printedHint !== progress < 0.02) {
        printedHint = progress < 0.02;
        pocketMaterial.map = printedHint ? pocketMap : plainMap; pocketMaterial.needsUpdate = true;
      }
      render();
    };
    const resume = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(animate); };
    const move = (event: PointerEvent) => { pointer.set(event.clientX / window.innerWidth * 2 - 1, event.clientY / window.innerHeight * 2 - 1); };
    const leave = () => pointer.set(0, 0);
    const visibility = () => { hidden = document.hidden; if (hidden) cancelAnimationFrame(frame); else resume(); };
    const lost = (event: Event) => { event.preventDefault(); contextLost = true; cancelAnimationFrame(frame); setUnavailable(true); };
    const restored = () => { contextLost = false; setUnavailable(false); resume(); };
    // Stop drawing entirely once the envelope has scrolled out of sight.
    const sighting = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; if (inView) resume(); else cancelAnimationFrame(frame); });
    sighting.observe(section);
    // Letter the flap and card in the site's own script once it has loaded.
    Promise.all([`140px ${script}`, `italic 46px ${serif}`, `600 30px ${serif}`].map(font => document.fonts.load(font)))
      .catch(() => {})
      .then(() => { if (!disposed) { redraws.forEach(redraw => redraw()); render(); } });
    const observer = new ResizeObserver(resize);
    observer.observe(container); resize(); progress = scrolled(); resume();
    const readyFrame = requestAnimationFrame(() => setReady(true));
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", visibility);
    reducedMotion.addEventListener("change", resume);
    renderer.domElement.addEventListener("webglcontextlost", lost);
    renderer.domElement.addEventListener("webglcontextrestored", restored);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame); cancelAnimationFrame(readyFrame); observer.disconnect(); sighting.disconnect();
      window.removeEventListener("pointermove", move); document.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", visibility); reducedMotion.removeEventListener("change", resume);
      renderer.domElement.removeEventListener("webglcontextlost", lost); renderer.domElement.removeEventListener("webglcontextrestored", restored);
      const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>();
      scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
          geometries.add(object.geometry);
          (Array.isArray(object.material) ? object.material : [object.material]).forEach(m => materials.add(m));
        }
      });
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); maps.forEach(m => m.dispose()); cottonDepth.dispose();
      environment.dispose(); key.shadow.dispose(); renderer.dispose(); renderer.domElement.remove();
    };
  }, []);

  // Tapping the envelope scrolls it open, for anyone who doesn't think to scroll.
  function open() {
    const section = stage.current?.closest<HTMLElement>(".envelope-scroll");
    if (!section) return;
    const smoothly = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: section.offsetTop + section.offsetHeight - window.innerHeight, behavior: smoothly ? "smooth" : "auto" });
  }

  return (
    <div ref={stage} className="envelope-layer">
      <div ref={host} className="canvas-host" aria-hidden="true" />
      {unavailable ? (
        <div className="envelope-fallback">
          <p className="caps">We’re getting married</p>
          <p className="script">{couple.first} &amp; {couple.second}</p>
          <p className="caps">{formatDate("short")} · {venue.city}</p>
        </div>
      ) : (
        <button className="letter-control" onClick={open} disabled={!ready} aria-label="Open Gavin and Ally’s wedding invitation">
          <span className="interaction-hint">{ready ? "SCROLL TO OPEN" : "PREPARING YOUR INVITATION"}<span className="hint-line" /></span>
        </button>
      )}
    </div>
  );
}
