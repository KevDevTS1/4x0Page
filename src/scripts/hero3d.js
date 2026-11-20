import * as THREE from 'three';

// [lo que se dice para tapar, lo que hay detrás]. Las cinco primeras son las
// que se muestran en celular: van cortas para que quepan en una pantalla angosta.
const PARES = [
  ['estoy bien', 'no estoy bien'],
  ['no pasa nada', 'me pasa de todo'],
  ['yo puedo con todo', 'necesito ayuda'],
  ['mejor no digo nada', 'quiero hablar'],
  ['ya se me pasará', 'llevo semanas así'],
  ['no quiero preocupar', 'necesito que me escuchen'],
  ['solo es cansancio', 'estoy sin fuerzas'],
  ['no es para tanto', 'me duele de verdad'],
  ['son bobadas mías', 'esto me importa'],
  ['prefiero no ver a nadie', 'siento mucha soledad'],
  ['tengo sueño, es todo', 'no he podido dormir'],
  ['ando a mil', 'tengo miedo'],
];
const COLORES = ['#ffd60a', '#00d4a8', '#ff2d78'];
const FUENTE = '800 62px "Bricolage Grotesque Variable", system-ui, sans-serif';
const CHISPAS = 160;
const CADA = 2;    // segundos entre una frase y la siguiente
const PAUSA = 6;   // segundos con todas dichas antes de volver a empezar

function pastilla(texto, relleno, borde, color) {
  const alto = 128, margen = 46;
  const lienzo = document.createElement('canvas');
  let g = lienzo.getContext('2d');
  g.font = FUENTE;
  const ancho = Math.ceil(g.measureText(texto).width) + margen * 2;
  // Cambiar el tamaño del canvas reinicia el contexto: hay que volver a fijar la fuente.
  lienzo.width = ancho;
  lienzo.height = alto;
  g = lienzo.getContext('2d');
  g.font = FUENTE;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.beginPath();
  if (g.roundRect) g.roundRect(4, 4, ancho - 8, alto - 8, 60);
  else g.rect(4, 4, ancho - 8, alto - 8);
  g.fillStyle = relleno;
  g.fill();
  if (borde) { g.lineWidth = 5; g.strokeStyle = borde; g.stroke(); }
  g.fillStyle = color;
  g.fillText(texto, ancho / 2, alto / 2 + 4);
  const textura = new THREE.CanvasTexture(lienzo);
  textura.colorSpace = THREE.SRGBColorSpace;
  return { textura, razon: ancho / alto };
}

export async function iniciar(canvas, { texto, alCambiar = () => {} } = {}) {
  // Sin esto las pastillas se dibujan con la fuente de respaldo.
  await document.fonts.load(FUENTE).catch(() => {});

  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const escena = new THREE.Scene();
  const camara = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camara.position.z = 14;
  const altoMundo = 2 * Math.tan(THREE.MathUtils.degToRad(25)) * camara.position.z;
  let anchoMundo = altoMundo;

  const movil = innerWidth < 720;
  const pares = PARES.slice(0, movil ? 5 : 12);
  const plano = new THREE.PlaneGeometry(1, 1);
  const frases = pares.map(([callada, dicha], i) => {
    const frente = pastilla(callada, 'rgba(18,10,58,0.6)', '#c9c2ff', '#ffffff');
    const dorso = pastilla(dicha, COLORES[i % COLORES.length], null, '#120a3a');
    const grupo = new THREE.Group();
    const caras = [frente, dorso].map((cara, k) => {
      const malla = new THREE.Mesh(plano, new THREE.MeshBasicMaterial({ map: cara.textura, transparent: true, depthWrite: false }));
      malla.rotation.y = k * Math.PI;
      malla.userData.indice = i;
      grupo.add(malla);
      return malla;
    });
    escena.add(grupo);
    return {
      grupo, caras, razones: [frente.razon, dorso.razon],
      casa: new THREE.Vector3(), vel: new THREE.Vector3(),
      z: Math.random() * 1.2 - 0.8, fase: Math.random() * 6.28,
      dicha: false, giro: 0, desde: 0, alto: 1, tope: 1, crece: 1,
    };
  });
  const mallas = frases.flatMap((f) => f.caras);

  // Líneas entre frases ya dichas
  const posLineas = new Float32Array(frases.length * 2 * 6);
  const geoLineas = new THREE.BufferGeometry();
  geoLineas.setAttribute('position', new THREE.BufferAttribute(posLineas, 3));
  const lineas = new THREE.LineSegments(geoLineas, new THREE.LineBasicMaterial({ color: 0xffd60a, transparent: true, opacity: 0.7 }));
  lineas.renderOrder = -1;
  escena.add(lineas);

  // Chispas al decir una frase
  const posCh = new Float32Array(CHISPAS * 3).fill(999);
  const velCh = new Float32Array(CHISPAS * 3);
  const vidaCh = new Float32Array(CHISPAS);
  const geoCh = new THREE.BufferGeometry();
  geoCh.setAttribute('position', new THREE.BufferAttribute(posCh, 3));
  escena.add(new THREE.Points(geoCh, new THREE.PointsMaterial({ color: 0xffffff, size: 0.14 })));
  let sigCh = 0;
  function chispear(p) {
    if (quieto) return;
    for (let k = 0; k < 18; k++) {
      const j = (sigCh++ % CHISPAS) * 3, a = Math.random() * 6.28, v = 2 + Math.random() * 4;
      posCh[j] = p.x; posCh[j + 1] = p.y; posCh[j + 2] = p.z;
      velCh[j] = Math.cos(a) * v; velCh[j + 1] = Math.sin(a) * v; velCh[j + 2] = Math.random() * 2 - 1;
      vidaCh[j / 3] = 0.7;
    }
  }

  function ubicar() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camara.aspect = w / h;
    camara.updateProjectionMatrix();
    anchoMundo = altoMundo * camara.aspect;
    const aMundoY = (px) => (0.5 - px / h) * altoMundo;
    const n = frases.length;
    // En celular las frases ocupan la franja libre sobre el texto; en
    // escritorio, la mitad derecha, por encima del lema.
    const libre = texto ? texto.getBoundingClientRect().top - canvas.getBoundingClientRect().top : h * 0.4;
    frases.forEach((f, i) => {
      if (movil) {
        f.casa.set((i % 2 ? 1 : -1) * anchoMundo * 0.1, aMundoY(24 + ((i + 0.5) * (libre - 40)) / n), f.z);
        f.alto = (42 / h) * altoMundo;
        f.tope = anchoMundo * 0.8;
      } else {
        // Columna izquierda: 4 frases, hasta donde empieza el lema. Columna
        // derecha: las otras 8, a todo lo alto.
        const izq = i < 8 && i % 2 === 0;
        const fila = izq ? 0.08 + (i / 2) * 0.105 : 0.08 + (i < 8 ? (i - 1) / 2 : i - 4) * 0.115;
        f.casa.set(anchoMundo * (izq ? 0.135 : 0.36) + Math.sin(i * 2.4) * 0.35, aMundoY(fila * h) + Math.cos(i * 1.7) * 0.08, f.z);
        f.alto = (52 / h) * altoMundo;
        f.tope = anchoMundo * 0.215;
      }
      // La perspectiva acerca al centro lo que está más lejos: se compensa
      // para que cada frase se vea en su casilla sin importar su profundidad.
      const k = (14 - f.z) / 14;
      f.casa.x *= k;
      f.casa.y *= k;
      if (!f.grupo.userData.puesta) { f.grupo.position.copy(f.casa); f.grupo.userData.puesta = true; }
    });
  }

  function avisar() {
    alCambiar(frases.filter((f) => f.dicha).length, frases.length);
  }
  function decir(f, si) {
    if (f.dicha === si) return;
    f.dicha = si;
    f.desde = performance.now();
    reloj = 0;
    if (si) chispear(f.grupo.position);
    avisar();
    if (si && frases.every((x) => x.dicha) && !quieto) {
      frases.forEach((x) => x.vel.add(x.grupo.position.clone().setZ(0).normalize().multiplyScalar(5)));
    }
  }

  // Puntero
  const rayo = new THREE.Raycaster();
  const ndc = new THREE.Vector2(9, 9);
  const suelo = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const punto = new THREE.Vector3(), previo = new THREE.Vector3(), velPuntero = new THREE.Vector3();
  let encima = null, agarrada = null, movio = false, dentro = false;

  function leer(e) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    dentro = e.clientY < r.bottom && e.clientY > r.top;
    rayo.setFromCamera(ndc, camara);
    const toque = rayo.intersectObjects(mallas)[0];
    return toque ? frases[toque.object.userData.indice] : null;
  }
  function enPlano(z) {
    suelo.constant = -z;
    return rayo.ray.intersectPlane(suelo, new THREE.Vector3());
  }

  addEventListener('pointermove', (e) => {
    const f = leer(e);
    const p = enPlano(0);
    if (p) { velPuntero.subVectors(p, punto); punto.copy(p); }
    if (agarrada) {
      const q = enPlano(agarrada.z);
      if (q) {
        if (q.distanceTo(agarrada.grupo.position) > 0.12) movio = true;
        agarrada.vel.subVectors(q, agarrada.grupo.position).multiplyScalar(14);
        agarrada.grupo.position.copy(q);
      }
      return;
    }
    encima = dentro ? f : null;
    canvas.style.cursor = encima ? 'grab' : '';
    // Con mouse basta pasar por encima; en táctil no hay hover y se toca.
    if (encima && e.pointerType !== 'touch') decir(encima, true);
  }, { passive: true });

  canvas.addEventListener('pointerdown', (e) => {
    const f = leer(e);
    if (!f) return;
    agarrada = f;
    movio = false;
    canvas.setPointerCapture(e.pointerId);
    canvas.style.cursor = 'grabbing';
  });
  const soltar = (e) => {
    if (!agarrada) return;
    // Un toque sin arrastre alterna la frase. Con mouse se ignora el clic
    // inmediato al hover para que no la vuelva a callar por accidente.
    if (!movio && (e.pointerType === 'touch' || performance.now() - agarrada.desde > 350)) decir(agarrada, !agarrada.dicha);
    agarrada = null;
    canvas.style.cursor = '';
  };
  canvas.addEventListener('pointerup', soltar);
  canvas.addEventListener('pointercancel', () => { agarrada = null; });

  let antes = 0, reloj = 0;
  function cuadro(t) {
    const dt = Math.min(0.05, (t - antes) / 1000 || 0.016);
    antes = t;
    const s = t / 1000;

    // Las frases se dicen solas, una cada CADA segundos. Con todas dichas
    // se espera PAUSA y el ciclo vuelve a empezar.
    reloj += dt;
    const pendiente = frases.find((f) => !f.dicha);
    if (pendiente && reloj >= CADA) { decir(pendiente, true); reloj = 0; }
    else if (!pendiente && reloj >= PAUSA) { frases.forEach((f) => decir(f, false)); reloj = 0; }

    if (!quieto) {
      camara.position.x += (ndc.x * (dentro ? 0.9 : 0) - camara.position.x) * dt * 2;
      camara.position.y += (ndc.y * (dentro ? 0.5 : 0) - camara.position.y) * dt * 2;
      camara.lookAt(0, 0, 0);
    }

    for (const f of frases) {
      const p = f.grupo.position;
      if (f !== agarrada) {
        const flota = quieto ? 0 : 0.22;
        const ax = (f.casa.x + Math.sin(s * 0.5 + f.fase) * flota - p.x) * 9 - f.vel.x * 3.2;
        const ay = (f.casa.y + Math.cos(s * 0.4 + f.fase * 1.3) * flota - p.y) * 9 - f.vel.y * 3.2;
        f.vel.x += ax * dt;
        f.vel.y += ay * dt;
        // El paso del puntero arrastra un poco las frases cercanas.
        const d = Math.hypot(punto.x - p.x, punto.y - p.y);
        if (dentro && d < 3 && !quieto) f.vel.addScaledVector(velPuntero, (1 - d / 3) * 2.2);
        p.x += f.vel.x * dt;
        p.y += f.vel.y * dt;
      }
      const meta = f.dicha ? Math.PI : 0;
      f.giro = quieto ? meta : f.giro + (meta - f.giro) * Math.min(1, dt * 9);
      f.grupo.rotation.y = f.giro;
      f.grupo.rotation.z = quieto ? 0 : Math.sin(s * 0.6 + f.fase) * 0.05 + f.vel.x * 0.01;
      f.crece += ((f === encima || f === agarrada ? 1.15 : 1) - f.crece) * Math.min(1, dt * 10);
      // Cada cara tiene su propio ancho; se ve la que mira a la cámara.
      f.caras.forEach((cara, k) => {
        const ancho = Math.min(f.alto * f.razones[k], f.tope);
        cara.scale.set(ancho * f.crece, (ancho / f.razones[k]) * f.crece, 1);
        cara.visible = k === 0 ? f.giro < Math.PI / 2 : f.giro >= Math.PI / 2;
      });
    }
    velPuntero.multiplyScalar(0.8);

    const dichas = frases.filter((f) => f.dicha);
    let m = 0;
    for (const a of dichas) {
      const cerca = dichas.filter((b) => b !== a)
        .sort((b, c) => a.grupo.position.distanceTo(b.grupo.position) - a.grupo.position.distanceTo(c.grupo.position))
        .slice(0, 2);
      for (const b of cerca) {
        const pa = a.grupo.position, pb = b.grupo.position;
        posLineas.set([pa.x, pa.y, pa.z - 0.05, pb.x, pb.y, pb.z - 0.05], m * 6);
        m++;
      }
    }
    geoLineas.setDrawRange(0, m * 2);
    geoLineas.attributes.position.needsUpdate = true;

    for (let k = 0; k < CHISPAS; k++) {
      if (vidaCh[k] <= 0) continue;
      vidaCh[k] -= dt;
      const j = k * 3;
      if (vidaCh[k] <= 0) { posCh[j + 2] = 999; continue; }
      posCh[j] += velCh[j] * dt; posCh[j + 1] += velCh[j + 1] * dt; posCh[j + 2] += velCh[j + 2] * dt;
    }
    geoCh.attributes.position.needsUpdate = true;

    renderer.render(escena, camara);
  }

  ubicar();
  addEventListener('resize', ubicar);
  avisar();

  let visible = true, id = 0;
  const bucle = (t) => { cuadro(t); id = requestAnimationFrame(bucle); };
  const reanudar = () => {
    cancelAnimationFrame(id);
    if (visible && !document.hidden) id = requestAnimationFrame(bucle);
  };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; reanudar(); }).observe(canvas);
  document.addEventListener('visibilitychange', reanudar);

  return { reiniciar: () => frases.forEach((f) => decir(f, false)) };
}
