// Sample the local avatar once; the vertex shader animates every dot in parallel.
import * as THREE from '/vendor/three-r168.module.min.js';

const TRAIL_LENGTH = 16;

export async function start(canvas, { imageUrl, eventTarget = canvas } = {}) {
  const image = new Image();
  image.src = imageUrl;
  await image.decode();
  const sample = document.createElement('canvas');
  const count = window.matchMedia('(max-width: 640px)').matches ? 160 : 220;
  sample.width = sample.height = count;
  const context = sample.getContext('2d', { willReadFrequently: true });
  context.drawImage(image, 0, 0, count, count);
  const pixels = context.getImageData(0, 0, count, count).data;
  const positions = [], shades = [], seeds = [];
  for (let y = 0; y < count; y++) {
    for (let x = 0; x < count; x++) {
      const px = (x + 0.5) / count - 0.5;
      const py = 0.5 - (y + 0.5) / count;
      const offset = (y * count + x) * 4;
      const light = (pixels[offset] * 0.2126 + pixels[offset + 1] * 0.7152 + pixels[offset + 2] * 0.0722) / 255;
      if (px * px + py * py > 0.25 || light < 0.28 || pixels[offset + 3] < 128) continue;
      positions.push(px, py, 0);
      shades.push(light);
      seeds.push(Math.random());
    }
  }

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('aShade', new THREE.Float32BufferAttribute(shades, 1));
  geometry.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1));
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const trail = Array.from({ length: TRAIL_LENGTH }, () => new THREE.Vector4(10, 10, -100, 0));
  const uniforms = {
    uTime: { value: 0 }, uIntro: { value: motion.matches ? 1 : 0 },
    uMotion: { value: motion.matches ? 0 : 1 }, uSize: { value: 2 },
    uTrail: { value: trail }, uBurst: { value: new THREE.Vector3(0, 0, -100) },
    uColor: { value: new THREE.Color('#fcfcf8') },
  };
  const material = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthTest: false, depthWrite: false,
    vertexShader: `
      attribute float aShade;
      attribute float aSeed;
      uniform float uTime, uIntro, uMotion, uSize;
      uniform vec4 uTrail[${TRAIL_LENGTH}];
      uniform vec3 uBurst;
      varying float vShade;
      void main() {
        vec3 p = position;
        vec2 displacement = vec2(0.0);
        for (int i = 0; i < ${TRAIL_LENGTH}; i++) {
          vec2 delta = position.xy - uTrail[i].xy;
          float d = length(delta);
          float age = max(0.0, uTime - uTrail[i].z);
          float life = exp(-age * 3.5) * uTrail[i].w;
          float influence = exp(-d * d / 0.0045) * life;
          vec2 direction = delta / max(d, 0.002);
          displacement += (direction + vec2(-direction.y, direction.x) * 0.35) * influence * 0.032;
        }
        vec2 burstDelta = position.xy - uBurst.xy;
        float burstDistance = length(burstDelta);
        float burstAge = max(0.0, uTime - uBurst.z);
        float ring = exp(-pow((burstDistance - burstAge * 0.7) * 22.0, 2.0)) * exp(-burstAge * 1.6);
        displacement += burstDelta / max(burstDistance, 0.002) * ring * 0.12;
        float angle = aSeed * 62.83185;
        vec2 scattered = vec2(cos(angle), sin(angle)) * (0.3 + aSeed * 0.6);
        float formation = 1.0 - smoothstep(0.0, 1.0, uIntro);
        p.xy += uMotion * (displacement + scattered * formation);
        p.z += uMotion * sin(uTime * 1.2 + aSeed * 30.0) * 0.003;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = uSize * (0.85 + aShade * 0.15);
        vShade = aShade;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vShade;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float alpha = 1.0 - smoothstep(0.35, 0.5, d);
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(uColor, alpha * vShade);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  const scene = new THREE.Scene(); scene.add(points);
  const camera = new THREE.OrthographicCamera(-0.6, 0.6, 0.6, -0.6, 0.1, 10);
  camera.position.z = 2;
  let running = true, visible = true, frameId = 0, time = 0, lastFrame = 0;
  let diameter = 1, centerX = 0, centerY = 0, trailIndex = 0, lastPointerTime = -1;

  function render() { renderer.render(scene, camera); }
  function resize() {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    // Keep the portrait above the intro on both tall phones and short laptops.
    const intro = eventTarget.querySelector('.intro');
    const introTop = intro ? intro.getBoundingClientRect().top - canvas.getBoundingClientRect().top : height - 180;
    const top = Math.min(86, height * 0.13);
    const available = Math.max(120, introTop - top - 24);
    diameter = Math.min(width * 0.78, available, 620);
    centerX = width / 2;
    centerY = top + available / 2;
    camera.left = -width / diameter / 2;
    camera.right = width / diameter / 2;
    camera.top = height / diameter / 2;
    camera.bottom = -height / diameter / 2;
    points.position.y = (height / 2 - centerY) / diameter;
    camera.updateProjectionMatrix();
    uniforms.uSize.value = Math.max(1, diameter / count * 1.17) * ratio;
    render();
  }
  function location(e) {
    const rect = canvas.getBoundingClientRect();
    return [(e.clientX - rect.left - centerX) / diameter, (centerY - e.clientY + rect.top) / diameter];
  }
  function onMove(e) {
    if (motion.matches || time - lastPointerTime < 0.025 || e.target.closest?.('a, button')) return;
    const [x, y] = location(e);
    trail[trailIndex].set(x, y, time, 1);
    trailIndex = (trailIndex + 1) % TRAIL_LENGTH;
    lastPointerTime = time;
  }
  function onDown(e) {
    if (motion.matches || e.target.closest?.('a, button')) return;
    const [x, y] = location(e);
    if (Math.hypot(x, y) < 0.65) uniforms.uBurst.value.set(x, y, time);
  }
  function frame(now) {
    frameId = 0;
    if (!running || !visible || document.hidden || motion.matches) return;
    const dt = lastFrame ? Math.min((now - lastFrame) / 1000, 0.05) : 0;
    lastFrame = now; time += dt;
    uniforms.uTime.value = time;
    uniforms.uIntro.value = Math.min(1, time / 1.4);
    render();
    frameId = requestAnimationFrame(frame);
  }
  function resume() {
    cancelAnimationFrame(frameId); frameId = 0; lastFrame = 0;
    if (running && visible && !document.hidden && !motion.matches) frameId = requestAnimationFrame(frame);
  }
  function onMotion() {
    uniforms.uMotion.value = motion.matches ? 0 : 1;
    uniforms.uIntro.value = 1;
    time = Math.max(time, 1.4);
    render(); resume();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  const intro = eventTarget.querySelector('.intro');
  if (intro) ro.observe(intro);
  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; resume(); });
  io.observe(canvas);
  eventTarget.addEventListener('pointermove', onMove, { passive: true });
  eventTarget.addEventListener('pointerdown', onDown, { passive: true });
  document.addEventListener('visibilitychange', resume);
  motion.addEventListener('change', onMotion);
  resize(); resume();
  return {
    stop() {
      running = false; cancelAnimationFrame(frameId);
      ro.disconnect(); io.disconnect();
      eventTarget.removeEventListener('pointermove', onMove);
      eventTarget.removeEventListener('pointerdown', onDown);
      document.removeEventListener('visibilitychange', resume);
      motion.removeEventListener('change', onMotion);
      geometry.dispose(); material.dispose(); renderer.dispose();
    },
  };
}
