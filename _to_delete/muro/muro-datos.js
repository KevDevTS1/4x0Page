// Única puerta de datos del muro. Para volverlo compartido basta con cambiar
// leer() y guardar() por llamadas a una base de datos (p. ej. una tabla
// "muro" con columnas e, f) y poner DEMO en false en data/muro.js.
import { emociones, ejemplos } from '../data/muro.js';

const CLAVE = 'cuatroporcero-muro';
const MAXIMO = 20;

// Lo guardado en el navegador puede venir alterado: solo pasan entradas cuya
// emoción y frase existen en las listas.
function valida(x) {
  const emocion = x && emociones.find((e) => e.id === x.e);
  return Boolean(emocion) && Number.isInteger(x.f) && x.f >= -1 && x.f < emocion.frases.length;
}

function propias() {
  try {
    const crudo = JSON.parse(localStorage.getItem(CLAVE) || '[]');
    return Array.isArray(crudo) ? crudo.filter(valida).slice(-MAXIMO).map(({ e, f }) => ({ e, f })) : [];
  } catch {
    return [];
  }
}

export async function leer() {
  return [...ejemplos(), ...propias().map((x) => ({ ...x, mia: true }))];
}

export async function guardar(entrada) {
  if (!valida(entrada)) return;
  try {
    localStorage.setItem(CLAVE, JSON.stringify([...propias(), { e: entrada.e, f: entrada.f }].slice(-MAXIMO)));
  } catch {
    // Navegación privada o almacenamiento lleno: el punto queda solo en pantalla.
  }
}
