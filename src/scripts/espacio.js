import { animate } from 'motion';
import { amigo, turnos } from '../data/chat.js';
import { empezarPeso } from './peso.js';

const raiz = document.querySelector('.espacio');
const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
const eleccion = raiz.querySelector('[data-eleccion]');
const escenas = Object.fromEntries([...raiz.querySelectorAll('[data-escena]')].map((e) => [e.dataset.escena, e]));
const espera = (ms) => new Promise((r) => setTimeout(r, quieto ? ms / 4 : ms));
const crear = (etiqueta, clase, texto) => {
  const el = document.createElement(etiqueta);
  if (clase) el.className = clase;
  if (texto) el.textContent = texto;
  return el;
};

function abrir(nombre) {
  eleccion.hidden = Boolean(nombre);
  Object.entries(escenas).forEach(([k, e]) => (e.hidden = k !== nombre));
  if (nombre === 'chat') empezarChat();
  // La arena mide 0 mientras está oculta: el juego arranca ya visible.
  if (nombre === 'peso') empezarPeso(escenas.peso);
  const visible = nombre ? escenas[nombre] : eleccion;
  if (!quieto) animate(visible, { opacity: [0, 1], y: [30, 0] }, { duration: 0.4 });
  // Con una experiencia abierta se baja hasta ella, no al título de la sección.
  (nombre ? visible : raiz).scrollIntoView({ block: 'start' });
}
raiz.addEventListener('click', (e) => {
  const boton = e.target.closest('[data-abrir], [data-volver]');
  if (boton) abrir(boton.dataset.abrir || null);
});

// ---- Te escribió un amigo ----
const mensajes = raiz.querySelector('[data-mensajes]');
const respuestas = raiz.querySelector('[data-respuestas]');
const medidor = raiz.querySelector('[data-medidor]');
const estado = raiz.querySelector('[data-estado]');
const resumen = raiz.querySelector('[data-resumen]');
const telefono = raiz.querySelector('.telefono');
let partida = 0;   // cambia en cada inicio para cortar una conversación a medias
let elegidas = [];
let apertura = 1;

function globo(clase, texto) {
  const g = crear('p', `globo ${clase}`, texto);
  mensajes.append(g);
  if (!quieto) animate(g, { opacity: [0, 1], scale: [0.8, 1], y: [10, 0] }, { duration: 0.25 });
  mensajes.scrollTop = mensajes.scrollHeight;
  return g;
}
function pintarMedidor() {
  const pct = 12 + (apertura / (turnos.length + 1)) * 88;
  medidor.style.width = `${pct}%`;
  medidor.style.background = apertura >= 4 ? 'var(--menta)' : apertura >= 2 ? 'var(--sol)' : 'var(--rosa)';
}
async function escribeSanti(lineas, id) {
  for (const linea of lineas) {
    estado.textContent = 'escribiendo...';
    const puntos = crear('p', 'globo el escribe');
    puntos.append(crear('i'), crear('i'), crear('i'));
    mensajes.append(puntos);
    mensajes.scrollTop = mensajes.scrollHeight;
    await espera(700 + linea.length * 28);
    puntos.remove();
    if (id !== partida) return false;
    globo('el', linea);
    estado.textContent = 'en línea';
    await espera(350);
  }
  return id === partida;
}
async function turno(i, id) {
  if (i === turnos.length) return terminar();
  const t = turnos[i];
  if (!(await escribeSanti(t.santi, id))) return;
  // Mismo orden siempre delataría cuál es "la buena": se barajan.
  const orden = [...t.opciones].sort(() => Math.random() - 0.5);
  respuestas.replaceChildren(...orden.map((op) => {
    const b = crear('button', '', op.texto);
    b.type = 'button';
    b.addEventListener('click', async () => {
      respuestas.replaceChildren();
      globo('yo', op.texto);
      elegidas.push(op);
      apertura = Math.max(0, Math.min(turnos.length + 1, apertura + op.efecto));
      pintarMedidor();
      await espera(500);
      if (!(await escribeSanti(op.reaccion, id))) return;
      if (op.efecto < 0 && i < turnos.length - 1) {
        await espera(500);
        globo('nota', `Pasan unos minutos. ${amigo} vuelve a escribir.`);
      }
      await espera(600);
      turno(i + 1, id);
    });
    return b;
  }));
  if (!quieto) animate(respuestas.children, { opacity: [0, 1], x: [-16, 0] }, { duration: 0.25 });
}
function terminar() {
  const abrio = elegidas.filter((o) => o.efecto > 0).length;
  const titulo = crear('h3', '', abrio >= 4 ? `${amigo} se sintió escuchado` : abrio >= 2 ? `${amigo} se abrió a ratos` : `${amigo} se quedó con casi todo guardado`);
  const intro = crear('p', '', abrio >= 4
    ? 'No le resolviste la vida: le diste espacio, preguntaste directo y lo acompañaste a pedir ayuda. Eso es lo que más protege.'
    : 'No hay respuestas perfectas, pero algunas abren y otras cierran. Mira qué pasó en cada momento.');
  const lista = crear('ol');
  elegidas.forEach((op, i) => {
    const li = crear('li', op.efecto > 0 ? 'abre' : op.efecto < 0 ? 'cierra' : 'igual');
    li.append(crear('q', '', op.texto), crear('small', '', op.nota));
    if (op.efecto <= 0) {
      const buena = turnos[i].opciones.find((o) => o.efecto > 0);
      li.append(crear('small', 'mejor', `Habría abierto más: «${buena.texto}»`));
    }
    lista.append(li);
  });
  const acciones = crear('p', 'acciones');
  const otra = crear('button', 'boton', 'Repetir la conversación');
  otra.type = 'button';
  otra.addEventListener('click', empezarChat);
  const llamar = crear('a', 'boton rosa', 'Llamar a la Línea 106');
  llamar.href = 'tel:106';
  acciones.append(otra, llamar);
  resumen.replaceChildren(titulo, intro, lista, acciones);
  telefono.hidden = true;
  resumen.hidden = false;
  if (!quieto) animate(resumen, { opacity: [0, 1], y: [40, 0] }, { duration: 0.4 });
  resumen.focus({ preventScroll: true });
  raiz.scrollIntoView({ block: 'start' });
}
function empezarChat() {
  partida++;
  elegidas = [];
  apertura = 1;
  pintarMedidor();
  mensajes.replaceChildren();
  respuestas.replaceChildren();
  resumen.hidden = true;
  telefono.hidden = false;
  globo('nota', `11:20 p. m. Te escribe ${amigo}, tu amigo del colegio.`);
  turno(0, partida);
}
