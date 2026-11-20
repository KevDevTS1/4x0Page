// "Suelta el peso": piedras con física propia (círculos, gravedad, choques)
// sobre una tabla que sostiene un personaje. La tabla baja con cada piedra
// encima; entregarlas a un destino la deja subir.
import { animate } from 'motion';
import { piedras as NOMBRES, destinos as DESTINOS } from '../data/peso.js';

const G = 2200, REBOTE = 0.22, ROCE = 0.9;
const VUELVE = 1.2;   // segundos en el suelo antes de regresar a la tabla
const COLORES = ['#ffd60a', '#ff2d78', '#00d4a8', '#c9c2ff', '#ff9f1c'];
const NS = 'http://www.w3.org/2000/svg';
const TINTA = '#120a3a';
const entre = (v, a, b) => Math.max(a, Math.min(b, v));
let reiniciar = null;

export function empezarPeso(raiz) {
  if (reiniciar) return reiniciar();

  const arena = raiz.querySelector('[data-arena]');
  const svg = raiz.querySelector('[data-figura]');
  const guia = raiz.querySelector('[data-peso-guia]');
  const fin = raiz.querySelector('[data-peso-fin]');
  const destinos = DESTINOS.map((d) => ({ ...d, el: raiz.querySelector(`[data-destino="${d.id}"]`), cuenta: 0, x: 0, y: 0, r: 0 }));
  let W = 0, H = 0, u = 1, suelo = 0, piedras = [], agarrada = null, avisado = false, turno = 0;
  const tabla = { x1: 0, x2: 0, cx: 0, y: 0, alto: 0, bajo: 0 };
  const puntero = { x: 0, y: 0 };

  // Personaje: se crean las piezas una vez y en cada cuadro solo cambian atributos.
  const pieza = (tipo, attrs) => {
    const el = document.createElementNS(NS, tipo);
    Object.entries({ stroke: TINTA, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...attrs }).forEach(([k, v]) => el.setAttribute(k, v));
    svg.append(el);
    return el;
  };
  const fig = {
    piernas: [pieza('path', { fill: 'none' }), pieza('path', { fill: 'none' })],
    brazos: [pieza('path', { fill: 'none' }), pieza('path', { fill: 'none' })],
    torso: pieza('rect', { fill: '#00d4a8' }),
    cabeza: pieza('circle', { fill: '#ffffff' }),
    ojos: [pieza('circle', { fill: TINTA, stroke: 'none' }), pieza('circle', { fill: TINTA, stroke: 'none' })],
    boca: pieza('path', { fill: 'none' }),
    tabla: pieza('rect', { fill: '#ffd60a' }),
  };

  function medir() {
    const caja = arena.getBoundingClientRect();
    W = caja.width; H = caja.height;
    if (!W) return;
    const movil = W < 560;
    u = entre(W / (movil ? 520 : 700), 0.62, 1.1);
    suelo = H - 16;
    const ancho = movil ? W * 0.72 : Math.min(W * 0.44, 340 * u);
    tabla.cx = movil ? W / 2 : W * 0.34;
    tabla.x1 = tabla.cx - ancho / 2;
    tabla.x2 = tabla.cx + ancho / 2;
    // Alturas de la tabla con el personaje de pie y agachado (ver dibujar()).
    tabla.alto = suelo - 332 * u;
    tabla.bajo = suelo - 236 * u;
    if (!tabla.y) tabla.y = tabla.alto;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    destinos.forEach((d) => {
      const r = d.el.querySelector('.cara').getBoundingClientRect();
      d.x = r.left - caja.left + r.width / 2;
      d.y = r.top - caja.top + r.height / 2;
      d.r = r.width / 2;
    });
  }

  function dibujar() {
    const { cx, x1, x2, y } = tabla;
    const g = 14 * u, hombro = y + g + 78 * u, cadera = hombro + 80 * u, cy = y + g + 40 * u;
    const h = Math.max(20 * u, suelo - cadera), L = 82 * u;
    // Muslo y pierna miden L: la rodilla se abre lo que haga falta para que
    // la cadera quede a la altura h.
    const rodilla = Math.sqrt(Math.max(0, L * L - (h / 2) ** 2));
    const animo = entre((tabla.bajo - y) / (tabla.bajo - tabla.alto), 0, 1);
    [-1, 1].forEach((lado, i) => {
      fig.piernas[i].setAttribute('d', `M${cx + lado * 18 * u},${cadera} L${cx + lado * (18 * u + rodilla)},${cadera + h / 2} L${cx + lado * 30 * u},${suelo}`);
      fig.piernas[i].setAttribute('stroke-width', 11 * u);
      fig.brazos[i].setAttribute('d', `M${cx + lado * 30 * u},${hombro} L${cx + lado * 66 * u},${y + g + 40 * u} L${cx + lado * 58 * u},${y + g}`);
      fig.brazos[i].setAttribute('stroke-width', 10 * u);
      fig.ojos[i].setAttribute('cx', cx + lado * 9 * u);
      fig.ojos[i].setAttribute('cy', cy - 3 * u);
      fig.ojos[i].setAttribute('r', 3.2 * u);
    });
    const pon = (el, attrs) => Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    pon(fig.torso, { x: cx - 34 * u, y: hombro - 6 * u, width: 68 * u, height: 92 * u, rx: 26 * u, 'stroke-width': 5 * u });
    pon(fig.cabeza, { cx, cy, r: 27 * u, 'stroke-width': 5 * u });
    pon(fig.boca, { d: `M${cx - 10 * u},${cy + 11 * u} Q${cx},${cy + (11 + animo * 16 - 7) * u} ${cx + 10 * u},${cy + 11 * u}`, 'stroke-width': 3.5 * u });
    pon(fig.tabla, { x: x1, y, width: x2 - x1, height: g, rx: g / 2, 'stroke-width': 5 * u });
  }

  function decir(texto) {
    if (guia.textContent !== texto) guia.textContent = texto;
  }
  const quedan = () => piedras.filter((p) => !p.entregada).length;

  function entregar(p, d) {
    p.entregada = true;
    if (agarrada === p) agarrada = null;
    d.cuenta++;
    d.el.querySelector('[data-cuenta]').textContent = d.cuenta === 1 ? 'Recibió 1' : `Recibió ${d.cuenta}`;
    const dice = d.el.querySelector('[data-dice]');
    dice.hidden = false;
    clearTimeout(d.reloj);
    d.reloj = setTimeout(() => (dice.hidden = true), 2200);
    animate(d.el.querySelector('.cara'), { scale: [1, 1.35, 1] }, { duration: 0.45 });
    animate(p.el, { scale: [1, 0], opacity: [1, 0] }, { duration: 0.3 }).then(() => p.el.remove());
    const n = quedan();
    if (n) decir(n === 1 ? 'Queda una. ¿A quién se la entregas?' : `Quedan ${n}. Ya se siente más liviano.`);
    else terminar();
  }

  function terminar() {
    decir('Ya no lo cargas a solas.');
    const lista = fin.querySelector('[data-peso-quien]');
    lista.replaceChildren(...destinos.filter((d) => d.cuenta).map((d) => {
      const li = document.createElement('li');
      li.textContent = `${d.nombre} ahora sostiene ${d.cuenta === 1 ? 'una parte' : `${d.cuenta} partes`}.`;
      li.style.setProperty('--c', d.color);
      return li;
    }));
    fin.hidden = false;
    animate(fin, { opacity: [0, 1], y: [30, 0] }, { duration: 0.4 });
    fin.focus({ preventScroll: true });
  }

  function cercano(p, margen) {
    return destinos.find((d) => Math.hypot(d.x - p.x, d.y - p.y) < d.r + p.r * margen);
  }

  function paso(dt) {
    let encima = 0;
    for (const p of piedras) {
      if (p.entregada) continue;
      if (p === agarrada) {
        const nx = p.x + (puntero.x - p.x) * 0.45, ny = p.y + (puntero.y - p.y) * 0.45;
        p.vx = entre((nx - p.x) / dt, -2600, 2600);
        p.vy = entre((ny - p.y) / dt, -2600, 2600);
        p.x = nx; p.y = ny;
        continue;
      }
      p.vy += G * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.x < p.r) { p.x = p.r; p.vx = -p.vx * REBOTE; }
      if (p.x > W - p.r) { p.x = W - p.r; p.vx = -p.vx * REBOTE; }
      let apoyada = false;
      if (p.y + p.r >= suelo) {
        p.y = suelo - p.r;
        p.vy = Math.abs(p.vy) < 90 ? 0 : -p.vy * REBOTE;
        p.vx *= ROCE;
        p.enSuelo += dt;
        apoyada = true;
      } else {
        p.enSuelo = 0;
      }
      // La tabla solo detiene lo que cae desde arriba: una piedra que regresa
      // desde el suelo la atraviesa al subir.
      const fondo = p.y + p.r;
      if (p.vy >= 0 && p.x > tabla.x1 - p.r * 0.3 && p.x < tabla.x2 + p.r * 0.3 && fondo > tabla.y && fondo < tabla.y + 30 + p.vy * dt) {
        p.y = tabla.y - p.r;
        p.vy = Math.abs(p.vy) < 90 ? 0 : -p.vy * REBOTE;
        p.vx *= ROCE;
        apoyada = true;
        encima++;
      }
      if (apoyada) p.lanzada = false;
      else if (p.lanzada) {
        const d = cercano(p, 0.5);
        if (d) entregar(p, d);
      }
      if (p.enSuelo > VUELVE) {
        // Tiro parabólico de vuelta: cae sobre la tabla desde arriba.
        const sube = Math.sqrt(2 * G * (suelo - (tabla.y - 190 * u)));
        const vuelo = (sube / G) * 1.75;
        p.vy = -sube;
        p.vx = (tabla.cx + (Math.random() - 0.5) * (tabla.x2 - tabla.x1) * 0.5 - p.x) / vuelo;
        p.enSuelo = 0;
        // Las que se caen solas al cargar también vuelven, pero sin aviso.
        if (!avisado && p.tocada) { avisado = true; decir('Si solo la sueltas, vuelve. Entrégasela a alguien.'); }
      }
    }
    // Choques entre piedras
    for (let k = 0; k < 2; k++) {
      for (let i = 0; i < piedras.length; i++) {
        for (let j = i + 1; j < piedras.length; j++) {
          const a = piedras[i], b = piedras[j];
          if (a.entregada || b.entregada) continue;
          const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.01, falta = a.r + b.r - d;
          if (falta <= 0) continue;
          const nx = dx / d, ny = dy / d;
          const pa = a === agarrada ? 0 : b === agarrada ? 1 : 0.5;
          a.x -= nx * falta * pa; a.y -= ny * falta * pa;
          b.x += nx * falta * (1 - pa); b.y += ny * falta * (1 - pa);
          const rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (rel < 0) {
            const imp = rel * (1 + REBOTE) * 0.5;
            if (a !== agarrada) { a.vx += imp * nx; a.vy += imp * ny; }
            if (b !== agarrada) { b.vx -= imp * nx; b.vy -= imp * ny; }
          }
        }
      }
    }
    const meta = tabla.alto + (tabla.bajo - tabla.alto) * Math.min(1, encima / NOMBRES.length);
    tabla.y += (meta - tabla.y) * Math.min(1, dt * 5);
    return encima;
  }

  function pintar(dt) {
    for (const p of piedras) {
      if (p.entregada) continue;
      // Se ladea con la velocidad en vez de rodar: el nombre debe poder leerse.
      p.giro += (entre(p.vx / 1100, -0.45, 0.45) - p.giro) * Math.min(1, dt * 8);
      p.el.style.transform = `translate(${p.x - p.r}px, ${p.y - p.r}px) rotate(${p.giro}rad)`;
    }
    const d = agarrada && cercano(agarrada, 0.6);
    destinos.forEach((x) => x.el.classList.toggle('cerca', x === d));
    dibujar();
  }

  function cargar() {
    piedras.forEach((p) => p.el.remove());
    medir();
    tabla.y = tabla.alto;
    avisado = false;
    turno = 0;
    fin.hidden = true;
    destinos.forEach((d) => { d.cuenta = 0; d.el.querySelector('[data-cuenta]').textContent = ''; d.el.querySelector('[data-dice]').hidden = true; });
    piedras = NOMBRES.map((nombre, i) => {
      const r = (30 + nombre.length * 1.3) * u;
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'piedra';
      el.textContent = nombre;
      el.style.cssText = `width:${r * 2}px;height:${r * 2}px;font-size:${Math.max(10, r * 0.3)}px;background:${COLORES[i % COLORES.length]}`;
      arena.append(el);
      const p = {
        el, r, nombre, x: tabla.cx + (Math.random() - 0.5) * (tabla.x2 - tabla.x1) * 0.55, y: -r - i * 130,
        vx: 0, vy: 0, giro: 0, enSuelo: 0, lanzada: false, entregada: false, tocada: false,
      };
      el.addEventListener('pointerdown', (e) => {
        agarrada = p;
        p.tocada = true;
        p.enSuelo = 0;
        el.setPointerCapture(e.pointerId);
        el.classList.add('agarrada');
        apuntar(e);
      });
      const soltar = () => {
        if (agarrada !== p) return;
        agarrada = null;
        el.classList.remove('agarrada');
        p.lanzada = true;
        const d = cercano(p, 0.6);
        if (d) entregar(p, d);
      };
      el.addEventListener('pointerup', soltar);
      el.addEventListener('pointercancel', soltar);
      el.addEventListener('pointermove', apuntar);
      // Con teclado no se arrastra: Enter entrega la piedra al siguiente destino.
      el.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        entregar(p, destinos[turno++ % destinos.length]);
      });
      return p;
    });
    decir('Arrastra una piedra y entrégasela a alguien. También puedes lanzarla.');
    antes = 0;
  }
  function apuntar(e) {
    const caja = arena.getBoundingClientRect();
    puntero.x = e.clientX - caja.left;
    puntero.y = e.clientY - caja.top;
  }

  let antes = 0, id = 0, visible = false;
  const bucle = (t) => {
    const dt = Math.min(0.032, (t - antes) / 1000 || 0.016);
    antes = t;
    paso(dt / 2);
    paso(dt / 2);
    pintar(dt);
    id = requestAnimationFrame(bucle);
  };
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    cancelAnimationFrame(id);
    if (visible) { antes = 0; id = requestAnimationFrame(bucle); }
  }).observe(arena);
  addEventListener('resize', medir);
  fin.querySelector('[data-peso-otra]').addEventListener('click', cargar);

  reiniciar = cargar;
  cargar();
}
