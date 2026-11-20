import * as THREE from 'three';

// Esfera de puntos que respira. `leer()` devuelve { fase, calma } entre 0 y 1:
// fase es cuánto aire hay; calma, cuánto avanza la ronda (apaga el temblor).
export function iniciar(canvas, leer) {
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const escena = new THREE.Scene();
  const camara = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
  camara.position.z = 9;

  const n = 1400;
  const dir = new Float32Array(n * 3), pos = new Float32Array(n * 3), fase = new Float32Array(n);
  const aureo = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), a = i * aureo;
    dir.set([Math.cos(a) * r, y, Math.sin(a) * r], i * 3);
    fase[i] = Math.random() * 6.28;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const material = new THREE.PointsMaterial({ size: 0.1, color: 0xff2d78 });
  const nube = new THREE.Points(geo, material);
  escena.add(nube);

  const agitado = new THREE.Color(0xff2d78), sereno = new THREE.Color(0x00d4a8);

  function medir() {
    const lado = canvas.clientWidth;
    if (lado) renderer.setSize(lado, lado, false);
  }

  function cuadro(t) {
    const s = t / 1000, { fase: aire, calma } = leer();
    const radio = 1.5 + aire * 1.5;
    const temblor = quieto ? 0 : (1 - calma) * 0.22;
    for (let i = 0; i < n; i++) {
      const j = i * 3, k = radio * (1 + Math.sin(s * 3.2 + fase[i]) * temblor);
      pos[j] = dir[j] * k; pos[j + 1] = dir[j + 1] * k; pos[j + 2] = dir[j + 2] * k;
    }
    geo.attributes.position.needsUpdate = true;
    material.color.lerpColors(agitado, sereno, calma);
    if (!quieto) { nube.rotation.y = s * 0.15; nube.rotation.x = Math.sin(s * 0.1) * 0.3; }
    renderer.render(escena, camara);
  }

  medir();
  addEventListener('resize', medir);
  let visible = false, id = 0;
  const bucle = (t) => { cuadro(t); id = requestAnimationFrame(bucle); };
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    cancelAnimationFrame(id);
    // El lienzo mide 0 mientras su escena está oculta: se vuelve a medir al mostrarse.
    if (visible) { medir(); id = requestAnimationFrame(bucle); }
  }).observe(canvas);
}
