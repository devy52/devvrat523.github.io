// Devvrat Yadav — portfolio: scroll-driven neural network background
// PROTOTYPE SCOPE: hero -> about only. Skills/Projects layers are drawn
// dim and unconnected, as a preview of where the journey continues.
//
// Design:
// - The network stays put; scrolling translates it away from a fixed
//   camera, which reads as "diving forward through layers."
// - A single bright signal travels the hero->about edge, timed to
//   scroll progress within that zone — this is the "glide from node
//   to node" the layout is built around.
// - Falls back to nothing (existing 2D SVG root graphic stays visible)
//   if reduced-motion is set or WebGL isn't available.

import * as THREE from './vendor/three.module.min.js';

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch (e) {
    return false;
  }
}

if (!prefersReduced && hasWebGL()) {
  initNetwork();
}

function initNetwork() {
  const mount = document.getElementById('network-mount');
  if (!mount) return;

  document.body.classList.add('network-active');

  const isSmall = window.innerWidth < 760;
  const COPPER = 0xc97c3d;
  const MOSS = 0x8fbf8a;
  const DIM = 0x4a4038;

  // ---------- renderer / scene / camera ----------

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmall ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 6);

  const world = new THREE.Group();
  scene.add(world);

  // ---------- glow sprite texture (shared) ----------

  function glowTexture(hex) {
    const size = 128;
    const cnv = document.createElement('canvas');
    cnv.width = cnv.height = size;
    const ctx = cnv.getContext('2d');
    const c = new THREE.Color(hex);
    const rgb = `${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)}`;
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, `rgba(${rgb},1)`);
    grad.addColorStop(0.35, `rgba(${rgb},0.55)`);
    grad.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(cnv);
  }

  const texCopper = glowTexture(COPPER);
  const texMoss = glowTexture(MOSS);
  const texDim = glowTexture(DIM);

  function makeNode(position, tex, scale) {
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(mat);
    sprite.position.copy(position);
    sprite.scale.set(scale, scale, 1);
    world.add(sprite);
    return sprite;
  }

  function makeEdges(fromPositions, toPositions, color, opacity) {
    const points = [];
    fromPositions.forEach((a) => {
      toPositions.forEach((b) => {
        points.push(a, b);
      });
    });
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
    const lines = new THREE.LineSegments(geo, mat);
    world.add(lines);
    return lines;
  }

  // ---------- layers ----------
  // z runs from 0 (hero, nearest) to negative (further into the scroll)

  const heroPos = [new THREE.Vector3(0, 0, 0)];
  makeNode(heroPos[0], texCopper, 0.5);

  const aboutPos = [
    new THREE.Vector3(-1.6, 1.0, -3),
    new THREE.Vector3(-0.8, -0.6, -3.4),
    new THREE.Vector3(0.1, 0.9, -3),
    new THREE.Vector3(0.9, -0.4, -3.5),
    new THREE.Vector3(1.7, 0.5, -3),
  ];
  aboutPos.forEach((p) => makeNode(p, texCopper, 0.3));
  makeEdges(heroPos, aboutPos, COPPER, 0.18);

  // dim preview layers further ahead — structure only, not yet "live"
  const skillsPos = [];
  for (let i = 0; i < 6; i++) {
    skillsPos.push(new THREE.Vector3((i - 2.5) * 0.85, Math.sin(i) * 0.7, -6.5));
  }
  skillsPos.forEach((p) => makeNode(p, texDim, 0.22));
  makeEdges(aboutPos, skillsPos, DIM, 0.06);

  const projectsPos = [];
  for (let i = 0; i < 5; i++) {
    projectsPos.push(new THREE.Vector3((i - 2) * 1.0, Math.cos(i) * 0.6, -9.5));
  }
  projectsPos.forEach((p) => makeNode(p, texDim, 0.24));
  makeEdges(skillsPos, projectsPos, DIM, 0.05);

  // ---------- the traveling signal (hero -> chosen about node) ----------

  const signalTarget = aboutPos[2]; // center node
  const signal = makeNode(heroPos[0].clone(), texMoss, 0.22);
  signal.material.opacity = 0;

  // highlight the specific edge the signal rides, drawn over the dim fan
  const activeEdgeGeo = new THREE.BufferGeometry().setFromPoints([heroPos[0], signalTarget]);
  const activeEdgeMat = new THREE.LineBasicMaterial({ color: MOSS, transparent: true, opacity: 0 });
  const activeEdge = new THREE.LineSegments(activeEdgeGeo, activeEdgeMat);
  world.add(activeEdge);

  // ---------- scroll wiring ----------
  // Zone: top of page (0) through the bottom of #about (1)

  const aboutEl = document.getElementById('about');

  function scrollProgress() {
    if (!aboutEl) return 0;
    const zoneEnd = aboutEl.offsetTop + aboutEl.offsetHeight;
    const y = window.scrollY;
    return Math.min(1, Math.max(0, y / zoneEnd));
  }

  function render() {
    const t = scrollProgress();

    // dive the world forward as you scroll through the zone
    world.position.z = t * 3.4;

    // signal travels the hero->about edge across the first ~70% of the zone,
    // then holds at the about node for the rest (so arrival feels settled)
    const travel = Math.min(1, t / 0.7);
    signal.position.lerpVectors(heroPos[0], signalTarget, travel);
    const fade = Math.min(1, t / 0.12); // quick fade-in so it doesn't pop at t=0
    signal.material.opacity = fade * (1 - Math.max(0, (t - 0.85) / 0.15)); // fade out near end of zone
    activeEdgeMat.opacity = fade * 0.5 * (1 - Math.max(0, (t - 0.85) / 0.15));

    // gentle idle pulse on the hero node
    const pulse = 0.5 + Math.sin(performance.now() / 900) * 0.06;
    heroSpriteOpacity(pulse);

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  function heroSpriteOpacity(v) {
    // world.children[0] is the hero sprite (first makeNode call)
    world.children[0].material.opacity = v;
  }

  window.addEventListener('scroll', function () {
    // progress read directly in render loop; nothing needed here except
    // keeping the loop lightweight — render() already re-reads scroll each frame
  }, { passive: true });

  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  requestAnimationFrame(render);
}
