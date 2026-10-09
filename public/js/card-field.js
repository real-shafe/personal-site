// The home page hero: the word "shafe" built from index cards.
// Cards near the pointer flip over, a tap sends a flip ripple through
// the word, and scrolling scatters the cards.
import * as THREE from '/vendor/three-r168.module.min.js';

const PAPER = '#FCFCF8';
const RED = '#E0353B';
const BLUE_RULE = '#A9BFE3';
const BACK = new THREE.Color(RED);

function cardTexture() {
  const c = document.createElement('canvas');
  c.width = 320; c.height = 192;
  const g = c.getContext('2d');
  g.fillStyle = PAPER; g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = BLUE_RULE;
  for (let y = 70; y < c.height - 10; y += 26) g.fillRect(0, y, c.width, 3);
  g.fillStyle = RED; g.fillRect(0, 40, c.width, 5);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

async function samplePoints(word, cols) {
  try {
    await Promise.race([
      document.fonts.load('800 200px "Bricolage Grotesque"'),
      new Promise(r => setTimeout(r, 1500)),
    ]);
  } catch (e) { /* fall back to the system face */ }
  const W = 1000, H = 360;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  g.fillStyle = '#000';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  let size = 330;
  g.font = `800 ${size}px "Bricolage Grotesque", "Arial Black", sans-serif`;
  const m = g.measureText(word).width;
  if (m > W * 0.94) { size *= (W * 0.94) / m; g.font = `800 ${size}px "Bricolage Grotesque", "Arial Black", sans-serif`; }
  // a stroke thickens the letters so every stem is several cards wide
  g.strokeStyle = '#000'; g.lineWidth = size * 0.05; g.lineJoin = 'round';
  g.strokeText(word, W / 2, H / 2 + size * 0.04);
  g.fillText(word, W / 2, H / 2 + size * 0.04);
  const data = g.getImageData(0, 0, W, H).data;
  const step = W / cols, rowStep = step * 0.66, pts = [];
  for (let y = rowStep / 2; y < H; y += rowStep) {
    for (let x = step / 2; x < W; x += step) {
      if (data[(Math.floor(y) * W + Math.floor(x)) * 4 + 3] > 120) pts.push([x / W - 0.5, (H / 2 - y) / W]);
    }
  }
  // recentre on the glyphs' real bounds
  let x0 = 1, x1 = -1, y0 = 1, y1 = -1;
  for (const [x, y] of pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, span = Math.max(1e-3, x1 - x0);
  for (const q of pts) { q[0] = (q[0] - cx) / span; q[1] = (q[1] - cy) / span; }
  return { pts, aspect: (y1 - y0) / span, step: 1 / cols / span, rowStep: rowStep / W / span };
}

export async function start(canvas, opts = {}) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = Math.min(window.innerWidth, window.innerHeight) < 600;
  const { pts, aspect, step, rowStep } = await samplePoints(opts.word || 'shafe', small ? 40 : 60);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  scene.add(new THREE.HemisphereLight('#ffffff', '#5b6aa8', 2.2));
  const sun = new THREE.DirectionalLight('#ffffff', 1.6); sun.position.set(-3, 4, 6); scene.add(sun);

  // world units: the word spans WORD_W across
  const WORD_W = 10;
  const cw = step * WORD_W * 0.93, ch = rowStep * WORD_W * 0.9;
  const geo = new THREE.BoxGeometry(cw, ch, cw * 0.025);
  const front = new THREE.MeshStandardMaterial({ map: cardTexture(), roughness: 0.85 });
  const back = new THREE.MeshStandardMaterial({ color: BACK, roughness: 0.7 });
  const edge = new THREE.MeshStandardMaterial({ color: '#E9E7DF', roughness: 0.9 });
  // BoxGeometry groups: +x, -x, +y, -y, +z (front), -z (back)
  const mesh = new THREE.InstancedMesh(geo, [edge, edge, edge, edge, front, back], pts.length);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(mesh);

  const N = pts.length;
  const base = new Float32Array(N * 3), scatter = new Float32Array(N * 3), seed = new Float32Array(N);
  const flip = new Float32Array(N), flipV = new Float32Array(N), lift = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    base[i * 3] = pts[i][0] * WORD_W;
    base[i * 3 + 1] = pts[i][1] * WORD_W;
    base[i * 3 + 2] = (Math.random() - 0.5) * 0.08;
    const a = Math.random() * Math.PI * 2, r = 4 + Math.random() * 9;
    scatter[i * 3] = Math.cos(a) * r;
    scatter[i * 3 + 1] = Math.sin(a) * r * 0.7 + 2;
    scatter[i * 3 + 2] = 2 + Math.random() * 10;
    seed[i] = Math.random() * 100;
  }

  const dummy = new THREE.Object3D();
  const pointer = new THREE.Vector2(9, 9);
  const hit = new THREE.Vector3();
  const ray = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  let pointerActive = false, ripples = [], scroll = 0, running = true, visible = true;

  let offY = 0;
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // the word takes at most 86-92% of the width and 52% of the height,
    // and sits in the upper part of the screen, clear of the intro text
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const fitW = (WORD_W / (camera.aspect < 1 ? 0.92 : 0.86)) / 2 / tan / camera.aspect;
    const fitH = (WORD_W * aspect / 0.52) / 2 / tan;
    const z = Math.max(fitW, fitH);
    camera.position.set(0, 0, z);
    camera.updateProjectionMatrix();
    const visH = 2 * z * tan;
    offY = Math.min(visH * 0.12, visH * 0.5 - WORD_W * aspect / 2 - visH * 0.1);
    mesh.position.y = offY;
  }
  resize();
  const ro = new ResizeObserver(resize); ro.observe(canvas);

  function toPointer(e) {
    const r = canvas.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(pointer, camera);
    ray.ray.intersectPlane(plane, hit); hit.y -= offY;
  }
  const target = opts.eventTarget || canvas;
  const onMove = e => { toPointer(e); pointerActive = true; };
  const onLeave = () => { pointerActive = false; };
  const onDown = e => { toPointer(e); ripples.push({ x: hit.x, y: hit.y, t: 0 }); if (ripples.length > 4) ripples.shift(); };
  target.addEventListener('pointermove', onMove);
  target.addEventListener('pointerleave', onLeave);
  target.addEventListener('pointerdown', onDown);
  const onScroll = () => { scroll = Math.min(1.4, window.scrollY / Math.max(1, window.innerHeight)); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
  io.observe(canvas);

  // an opening sweep: a ripple runs through the word once it has loaded
  if (!reduced) ripples.push({ x: -WORD_W * 0.6, y: 0, t: -0.2 });

  const clock = new THREE.Clock();
  let t = 0;
  function frame() {
    if (!running) return;
    requestAnimationFrame(frame);
    if (!visible) return;
    const dt = Math.min(0.05, clock.getDelta());
    t += dt;
    for (const rp of ripples) rp.t += dt;
    ripples = ripples.filter(rp => rp.t < 2.2);
    const s = reduced ? 0 : scroll, ease = s * s * (3 - 2 * Math.min(1, s));
    const R = 1.25;

    for (let i = 0; i < N; i++) {
      const bx = base[i * 3], by = base[i * 3 + 1];
      // what does this card want: 0 = face up, 1 = flipped
      let want = 0;
      if (pointerActive) {
        const d = Math.hypot(bx - hit.x, by - hit.y);
        if (d < R) want = 1 - (d / R) * 0.4;
      }
      for (const rp of ripples) {
        if (rp.t < 0) continue;
        const d = Math.hypot(bx - rp.x, by - rp.y), front = rp.t * 9;
        if (Math.abs(d - front) < 0.7) want = Math.max(want, 1);
      }
      // springy flip toward the goal
      if (reduced) flip[i] = want > 0.5 ? 1 : 0;
      else {
        flipV[i] += ((want > 0.5 ? 1 : 0) - flip[i]) * 120 * dt - flipV[i] * 11 * dt;
        flip[i] += flipV[i] * dt;
      }
      lift[i] += ((want > 0.5 ? 0.35 : 0) - lift[i]) * Math.min(1, dt * 10);

      const sd = seed[i];
      const idle = reduced ? 0 : 1;
      const wobX = Math.sin(t * 0.9 + bx * 0.35 + sd) * 0.07 * idle;
      const wobY = Math.cos(t * 0.7 + by * 0.5 + sd) * 0.07 * idle;

      dummy.position.set(
        bx + (scatter[i * 3] - bx) * ease,
        by + (scatter[i * 3 + 1] - by) * ease + Math.sin(t * 0.8 + sd) * 0.02 * idle,
        base[i * 3 + 2] + lift[i] + scatter[i * 3 + 2] * ease,
      );
      dummy.rotation.set(
        wobX + ease * Math.sin(sd) * 3,
        flip[i] * Math.PI + wobY + ease * Math.cos(sd) * 3,
        Math.sin(sd * 3) * 0.05 + ease * Math.sin(sd * 2) * 2,
      );
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    // the camera drifts slightly with the pointer
    const px = pointerActive && !reduced ? pointer.x : 0, py = pointerActive && !reduced ? pointer.y : 0;
    camera.position.x += (px * 0.8 - camera.position.x) * Math.min(1, dt * 2);
    camera.position.y += (py * 0.5 - camera.position.y) * Math.min(1, dt * 2);
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);

  return {
    stop() {
      running = false;
      ro.disconnect(); io.disconnect();
      target.removeEventListener('pointermove', onMove);
      target.removeEventListener('pointerleave', onLeave);
      target.removeEventListener('pointerdown', onDown);
      window.removeEventListener('scroll', onScroll);
      geo.dispose(); front.map.dispose(); front.dispose(); back.dispose(); edge.dispose();
      renderer.dispose();
    },
  };
}
