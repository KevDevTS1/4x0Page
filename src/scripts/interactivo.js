import { animate, stagger } from 'motion';

const raiz = document.querySelector('[data-interactivo]');
const tasas = JSON.parse(raiz.dataset.tasas);
const pasos = [...raiz.querySelectorAll('[data-paso]')];
const avance = raiz.querySelector('.avance');
const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt = (n) => n.toFixed(1).replace('.', ',');

// Las respuestas viven solo en esta variable: nada se guarda ni se envía.
let estado;
let actual = 0;

function mostrar(i) {
  pasos[actual].hidden = true;
  actual = i;
  const paso = pasos[i];
  paso.hidden = false;
  const hechas = Math.max(0, i - 1);
  avance.setAttribute('aria-valuenow', String(Math.min(hechas, pasos.length - 2)));
  avance.firstElementChild.style.width = `${(hechas / (pasos.length - 2)) * 100}%`;
  if (!quieto) animate(paso, { opacity: [0, 1], x: [30, 0] }, { duration: 0.35 });
  // El foco pasa al paso nuevo para que el lector de pantalla lo anuncie.
  const foco = paso.querySelector('.opcion') || paso;
  foco.focus({ preventScroll: true });
}

function fila(etiqueta, valor, maximo, base) {
  const f = document.createElement('div');
  f.className = base ? 'fila base' : 'fila';
  const nombre = document.createElement('span');
  nombre.textContent = etiqueta;
  const pista = document.createElement('span');
  const barra = document.createElement('span');
  barra.className = 'barra';
  barra.style.width = `${(valor / maximo) * 100}%`;
  pista.append(barra);
  const num = document.createElement('span');
  num.className = 'num';
  num.textContent = fmt(valor);
  f.append(nombre, pista, num);
  return f;
}

function resultado() {
  const { perfil, senales, urgente } = estado;
  const titular = raiz.querySelector('[data-titular]');
  const mensaje = raiz.querySelector('[data-mensaje]');
  titular.textContent = 'No estás solo. Haces parte del 4×0.';
  if (urgente) {
    mensaje.textContent = 'Lo que marcaste merece atención hoy. No tienes que cargarlo en silencio: llama ahora a la Línea 106, es gratis y te atiende un profesional a cualquier hora.';
  } else if (senales > 0) {
    mensaje.textContent = `Marcaste ${senales} de 5 señales. Es una buena razón para hablar hoy con alguien de confianza o con la Línea 106.`;
  } else {
    mensaje.textContent = 'Hoy no marcaste señales de alerta. Si algo cambia, o si te preocupa otra persona, aquí queda tu kit.';
  }
  raiz.querySelector('[data-emergencia]').hidden = !urgente;

  const filas = [['Promedio del país', tasas.general, true]];
  if (tasas.edad[perfil.edad]) filas.push([`${perfil.edad} años`, tasas.edad[perfil.edad]]);
  if (tasas.sexo[perfil.sexo]) filas.push([perfil.sexo === 'Mujer' ? 'Mujeres' : 'Hombres', tasas.sexo[perfil.sexo]]);
  if (tasas.zona[perfil.zona]) filas.push([perfil.zona, tasas.zona[perfil.zona]]);
  const maximo = Math.max(...filas.map((f) => f[1]));
  const caja = raiz.querySelector('[data-comparas]');
  caja.replaceChildren(...filas.map(([e, v, base]) => fila(e, v, maximo, base)));
  if (!quieto) animate(caja.querySelectorAll('.barra'), { scaleX: [0, 1] }, { delay: stagger(0.12, { startDelay: 0.3 }), duration: 0.7 });
}

function reiniciar() {
  estado = { perfil: {}, senales: 0, urgente: false };
  mostrar(0);
}

raiz.addEventListener('click', (e) => {
  const boton = e.target.closest('button');
  if (!boton) return;

  if (boton.matches('[data-siguiente]')) return mostrar(1);

  if (boton.matches('[data-reiniciar]')) {
    reiniciar();
    return raiz.scrollIntoView({ block: 'start' });
  }

  if (boton.matches('[data-copiar]')) {
    navigator.clipboard?.writeText(boton.dataset.copiar).then(
      () => { boton.textContent = 'Copiada'; setTimeout(() => (boton.textContent = 'Copiar'), 2000); },
      () => { boton.textContent = 'No se pudo copiar'; },
    );
    return;
  }

  if (boton.matches('.opcion')) {
    const paso = pasos[actual];
    const valor = boton.dataset.valor;
    if (paso.dataset.paso === 'perfil') estado.perfil[paso.dataset.clave] = valor;
    else if (valor !== 'No') {
      estado.senales++;
      if ('urgente' in paso.dataset) estado.urgente = true;
    }
    if (pasos[actual + 1].dataset.paso === 'resultado') resultado();
    mostrar(actual + 1);
  }
});

estado = { perfil: {}, senales: 0, urgente: false };
