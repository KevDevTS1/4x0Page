// Animaciones ligadas al scroll. Todo parte de contenido ya visible en el
// HTML: si este script no corre (o hay "reducir movimiento"), nada queda oculto.
import { animate, inView, scroll, stagger } from 'motion';

const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
const resorte = { type: 'spring', stiffness: 130, damping: 18 };
const todos = (sel) => [...document.querySelectorAll(sel)];
const alPasar = { offset: ['start end', 'end start'] };

function esconder(els, estilo) {
  els.forEach((el) => Object.assign(el.style, estilo));
}

// Entrada única al aparecer en pantalla, con cascada entre hermanos.
function entrar(sel, desde, opciones = {}) {
  const { grupo, cantidad = 0.2, pausa = 0.07 } = opciones;
  const contenedores = grupo ? todos(grupo) : [null];
  contenedores.forEach((cont) => {
    const els = cont ? [...cont.querySelectorAll(sel)] : todos(sel);
    if (!els.length) return;
    esconder(els, { opacity: '0' });
    const disparar = (objetivo, lista) => inView(objetivo, () => {
      animate(lista, { opacity: [0, 1], ...desde }, { delay: stagger(pausa), ...resorte });
    }, { amount: cantidad });
    if (cont) disparar(cont, els);
    else els.forEach((el) => disparar(el, [el]));
  });
}

if (!quieto) {
  // Secciones: cada una sube sobre la anterior con las esquinas redondeadas,
  // que se aplanan mientras ocupa la pantalla.
  todos('main > .lamina, .pie').forEach((sec) => {
    scroll(animate(sec, { borderTopLeftRadius: ['4rem', '0rem'], borderTopRightRadius: ['4rem', '0rem'] }, { ease: 'linear' }),
      { target: sec, offset: ['start end', 'start 0.3'] });
  });

  // Titulares: palabra por palabra desde abajo, y una deriva lateral con el scroll.
  todos('.lamina h2, .pie .cierre').forEach((titulo) => {
    const texto = titulo.textContent.trim().replace(/\s+/g, ' ');
    titulo.setAttribute('aria-label', texto);
    titulo.textContent = '';
    const letras = texto.split(' ').map((palabra) => {
      const caja = document.createElement('span');
      caja.className = 'palabra';
      caja.setAttribute('aria-hidden', 'true');
      const dentro = document.createElement('span');
      dentro.textContent = palabra;
      caja.append(dentro);
      titulo.append(caja, ' ');
      return dentro;
    });
    esconder(letras, { transform: 'translateY(115%)' });
    inView(titulo, () => {
      animate(letras, { y: ['115%', '0%'], rotate: [10, 0] }, { delay: stagger(0.09), ...resorte });
    }, { amount: 0.5 });
    scroll(animate(titulo, { x: [-30, 30] }, { ease: 'linear' }), { target: titulo, ...alPasar });
  });

  entrar('.lamina .entrada', { y: [40, 0] });

  // Portada: al salir, el texto se hunde más lento que la página.
  const hero = document.querySelector('.hero');
  if (hero) {
    scroll(animate('.hero .lema, .hero .acciones, .hero .pista', { y: [0, 90], opacity: [1, 0] }, { ease: 'linear' }),
      { target: hero, offset: ['start start', 'end 0.35'] });
  }

  // Cintas: corren de lado según el scroll, cada una en su sentido.
  todos('[data-cinta]').forEach((cinta, i) => {
    scroll(animate(cinta, { x: i % 2 ? ['-35%', '0%'] : ['0%', '-35%'] }, { ease: 'linear' }), { target: cinta.parentElement, ...alPasar });
  });

  // El pico
  entrar('.pico .bloque h3', { x: [-60, 0] });
  entrar('li', { x: [-50, 0] }, { grupo: '.senales', pausa: 0.12, cantidad: 0.4 });
  todos('.senales').forEach((lista) => inView(lista, () => {
    animate(lista.querySelectorAll('.luz'), { scale: [0, 1.5, 1] }, { delay: stagger(0.12, { startDelay: 0.2 }), duration: 0.5 });
  }, { amount: 0.4 }));

  // Ilustraciones: entran inclinadas y se enderezan mientras cruzan la pantalla.
  todos('.ilustra').forEach((img, i) => {
    const lado = i % 2 ? 1 : -1;
    scroll(animate(img, { rotate: [7 * lado, -3 * lado], y: [70, -40], scale: [0.86, 1.02] }, { ease: 'linear' }),
      { target: img, offset: ['start end', 'end 0.2'] });
  });

  // Podcast: los episodios llegan alternando de lado.
  todos('.episodios li').forEach((ep, i) => {
    esconder([ep], { opacity: '0' });
    inView(ep, () => {
      animate(ep, { opacity: [0, 1], x: [i % 2 ? 110 : -110, 0] }, resorte);
      animate(ep.querySelectorAll('.ondas i'), { scaleY: [0, 1] }, { delay: stagger(0.02, { startDelay: 0.2 }), duration: 0.4 });
    }, { amount: 0.3 });
  });

  // Video de prevención: gira en 3D hasta quedar de frente.
  todos('.video').forEach((video) => {
    scroll((avance) => {
      const falta = 1 - avance;
      video.style.transform = `perspective(900px) rotateY(${-32 * falta}deg) rotateZ(${5 * falta}deg) translateY(${80 * falta}px)`;
    }, { target: video, offset: ['start end', 'center 0.55'] });
  });

  // Interactivo, experiencias y glosario
  entrar('.carta', { y: [70, 0], rotate: [-4, 0] }, { grupo: '.eleccion', pausa: 0.15, cantidad: 0.3 });
  entrar('.tablero', { scale: [0.82, 1], rotate: [-3, 0], y: [80, 0] }, { cantidad: 0.12 });
  entrar('details', { y: [40, 0] }, { grupo: '.terminos', pausa: 0.05, cantidad: 0.15 });

  // Cierre
  entrar('li', { y: [50, 0], scale: [0.9, 1] }, { grupo: '.pie .lineas', pausa: 0.15, cantidad: 0.4 });

  // Crónica: cada párrafo aparece al llegar a él.
  entrar('.cuerpo p', { y: [30, 0] }, { cantidad: 0.15 });
}
