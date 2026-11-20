import { animate } from 'motion';
import { DEMO, emociones } from '../data/muro.js';
import { leer, guardar } from './muro-datos.js';

const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
const porId = Object.fromEntries(emociones.map((e) => [e.id, e]));
let listo = false;

export async function empezarMuro(raiz) {
  const pasos = Object.fromEntries([...raiz.querySelectorAll('[data-muro-paso]')].map((p) => [p.dataset.muroPaso, p]));
  const ver = (nombre) => {
    Object.entries(pasos).forEach(([k, p]) => (p.hidden = k !== nombre));
    if (!quieto) animate(pasos[nombre], { opacity: [0, 1], x: [24, 0] }, { duration: 0.3 });
  };
  if (listo) return ver('emocion');
  listo = true;

  const lienzo = raiz.querySelector('[data-muro-lienzo]');
  const globo = raiz.querySelector('[data-muro-globo]');
  const leyenda = raiz.querySelector('[data-muro-leyenda]');
  const cajaFrases = raiz.querySelector('[data-muro-frases]');
  const entradas = await leer();
  const ocupados = [];
  let elegida = null, frase = -1, filtro = null;

  // Busca un sitio libre: prueba posiciones al azar y se queda con la más
  // alejada de los puntos ya puestos.
  function sitio() {
    let mejor = null, lejos = -1;
    for (let k = 0; k < 24; k++) {
      const p = { x: 6 + Math.random() * 88, y: 8 + Math.random() * 84 };
      const d = Math.min(99, ...ocupados.map((o) => Math.hypot(o.x - p.x, o.y - p.y)));
      if (d > lejos) { lejos = d; mejor = p; }
    }
    ocupados.push(mejor);
    return mejor;
  }

  function punto(entrada, nueva) {
    const em = porId[entrada.e];
    const p = sitio();
    const el = document.createElement('span');
    el.className = `punto${entrada.mia ? ' mia' : ''}`;
    el.dataset.e = em.id;
    el.dataset.texto = entrada.f >= 0 ? `${em.nombre}: «${em.frases[entrada.f]}»` : em.nombre;
    el.style.cssText = `left:${p.x}%;top:${p.y}%;--c:${em.color};--t:${5 + Math.random() * 5}s;--r:${-Math.random() * 6}s;--d:${entrada.f >= 0 ? 1.5 : 1.05}rem`;
    lienzo.append(el);
    if (nueva && !quieto) animate(el, { scale: [0, 2.2, 1] }, { duration: 0.9, ease: 'easeOut' });
    return el;
  }

  function pintarLeyenda() {
    const cuenta = Object.fromEntries(emociones.map((e) => [e.id, 0]));
    entradas.forEach((x) => cuenta[x.e]++);
    leyenda.replaceChildren(...emociones.map((e) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.style.setProperty('--c', e.color);
      b.setAttribute('aria-pressed', String(filtro === e.id));
      b.textContent = `${e.nombre} ${cuenta[e.id]}`;
      b.addEventListener('click', () => {
        filtro = filtro === e.id ? null : e.id;
        lienzo.querySelectorAll('.punto').forEach((p) => p.classList.toggle('apagado', Boolean(filtro) && p.dataset.e !== filtro));
        pintarLeyenda();
      });
      return b;
    }));
    return cuenta;
  }

  entradas.forEach((x) => punto(x, false));
  pintarLeyenda();

  // Globo con la frase del punto bajo el cursor o el dedo
  function mostrar(el) {
    if (!el) return void (globo.hidden = true);
    globo.textContent = el.dataset.texto;
    globo.style.setProperty('--c', porId[el.dataset.e].color);
    const izq = parseFloat(el.style.left), arriba = parseFloat(el.style.top);
    globo.style.left = `${Math.max(22, Math.min(78, izq))}%`;
    globo.style.top = `${arriba}%`;
    globo.classList.toggle('abajo', arriba < 28);
    globo.hidden = false;
  }
  lienzo.addEventListener('pointermove', (e) => mostrar(e.target.closest('.punto')));
  lienzo.addEventListener('pointerdown', (e) => mostrar(e.target.closest('.punto')));
  lienzo.addEventListener('pointerleave', () => mostrar(null));

  // Formulario
  raiz.querySelectorAll('[data-emocion]').forEach((chip) => chip.addEventListener('click', () => {
    elegida = porId[chip.dataset.emocion];
    frase = -1;
    raiz.querySelector('[data-muro-titulo]').textContent = `${elegida.nombre}. ¿Alguna de estas frases se parece?`;
    cajaFrases.replaceChildren(...[...elegida.frases, 'Sin frase, solo la emoción'].map((texto, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = texto;
      const valor = i < elegida.frases.length ? i : -1;
      b.setAttribute('aria-pressed', String(valor === -1));
      b.addEventListener('click', () => {
        frase = valor;
        cajaFrases.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      });
      return b;
    }));
    cajaFrases.style.setProperty('--c', elegida.color);
    ver('frase');
  }));
  raiz.querySelector('[data-muro-atras]').addEventListener('click', () => ver('emocion'));
  raiz.querySelector('[data-muro-otra]').addEventListener('click', () => ver('emocion'));

  raiz.querySelector('[data-muro-poner]').addEventListener('click', async () => {
    const entrada = { e: elegida.id, f: frase, mia: true };
    entradas.push(entrada);
    await guardar(entrada);
    filtro = null;
    lienzo.querySelectorAll('.punto').forEach((p) => p.classList.remove('apagado'));
    const el = punto(entrada, true);
    mostrar(el);
    const veces = pintarLeyenda()[elegida.id];
    const nombre = elegida.nombre.toLowerCase();
    raiz.querySelector('[data-muro-eco]').textContent = DEMO
      ? `Tu ${nombre} ya está en el muro. Aparece ${veces} veces.`
      : `Otras ${veces - 1} personas también pusieron ${nombre}. No estás solo.`;
    raiz.querySelector('[data-muro-apoyo]').textContent = elegida.pesa
      ? 'Ponerle nombre a lo que sientes ya es empezar a hablarlo. Si pesa mucho, cuéntaselo hoy a alguien de confianza o llama a la Línea 106.'
      : 'Guarda este momento. Y si conoces a alguien que no está bien, pregúntale cómo está.';
    raiz.querySelector('[data-muro-llamar]').hidden = !elegida.pesa;
    ver('listo');
    pasos.listo.focus({ preventScroll: true });
  });

  ver('emocion');
}
