const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Lenis smooth scroll + GSAP sync */
gsap.registerPlugin(ScrollTrigger);
const lenis = new Lenis({ lerp: 0.08 });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length > 1) { e.preventDefault(); lenis.scrollTo(id, { offset: -60 }); }
  });
});

/* Hero intro: one orchestrated reveal */
if (!reduce) {
  gsap.from('.line span', { yPercent: 110, duration: 1.1, ease: 'power4.out', stagger: 0.15, delay: 0.2 });
  gsap.from('.hero-sub, .hero-cta', { opacity: 0, y: 20, duration: 0.8, stagger: 0.15, delay: 1 });

  /* Projects: horizontal scroll */
  const rail = document.querySelector('.rail');
  const mm = gsap.matchMedia();
  mm.add('(min-width: 761px)', () => {
    gsap.to(rail, {
      x: () => -(rail.scrollWidth - window.innerWidth + 64),
      ease: 'none',
      scrollTrigger: { trigger: '.pin', start: 'top top+=60', end: () => '+=' + rail.scrollWidth, pin: true, scrub: 1, invalidateOnRefresh: true }
    });
  });
}

/* Three.js background: gold wireframe + particles */
const canvas = document.getElementById('bg');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
camera.position.z = 6;

const shape = new THREE.Mesh(
  new THREE.IcosahedronGeometry(2, 1),
  new THREE.MeshBasicMaterial({ color: 0xe8c547, wireframe: true, transparent: true, opacity: 0.35 })
);
shape.position.x = 2.2;
scene.add(shape);

const N = 900, pos = new Float32Array(N * 3);
for (let i = 0; i < N * 3; i++) pos[i] = (Math.random() - 0.5) * 18;
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
const points = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xf4efe3, size: 0.03, transparent: true, opacity: 0.6 }));
scene.add(points);

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  shape.position.x = w < 760 ? 0 : 2.2;
}
addEventListener('resize', resize);
resize();

let mx = 0, my = 0;
addEventListener('mousemove', e => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });

const clock = new THREE.Clock();
(function loop() {
  const t = clock.getElapsedTime();
  if (!reduce) {
    shape.rotation.x = t * 0.12 + my * 0.6 + scrollY * 0.0006;
    shape.rotation.y = t * 0.18 + mx * 0.6;
    points.rotation.y = t * 0.02;
    shape.position.y = Math.sin(t * 0.6) * 0.2;
  }
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
})();
