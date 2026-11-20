// Mientras DEMO sea true el muro no es compartido: muestra entradas de ejemplo
// y lo que cada visitante agrega en su navegador. La página lo avisa.
// Al conectar una base de datos (ver scripts/muro-datos.js) pasa a false.
export const DEMO = true;

// pesa: emociones difíciles, que al publicarse muestran el mensaje de apoyo.
export const emociones = [
  { id: 'tristeza', nombre: 'Tristeza', color: '#3ea6ff', pesa: true, frases: ['Hoy todo me pesa', 'Tengo ganas de llorar y no sé por qué', 'Extraño a alguien'] },
  { id: 'miedo', nombre: 'Miedo', color: '#b07cff', pesa: true, frases: ['Me asusta lo que viene', 'No sé qué va a pasar conmigo', 'Tengo miedo de fallar'] },
  { id: 'rabia', nombre: 'Rabia', color: '#ff5a3c', pesa: true, frases: ['Siento que nadie me entiende', 'Me cansé de aguantar en silencio', 'Me da rabia no poder decirlo'] },
  { id: 'soledad', nombre: 'Soledad', color: '#9aa7d6', pesa: true, frases: ['Hay gente cerca y aun así me siento a solas', 'Quisiera que alguien me preguntara cómo estoy', 'Me hace falta hablar con alguien'] },
  { id: 'cansancio', nombre: 'Cansancio', color: '#ff9f1c', pesa: true, frases: ['No he dormido bien', 'Estoy sin fuerzas', 'Necesito una pausa'] },
  { id: 'ansiedad', nombre: 'Ansiedad', color: '#ff2d78', pesa: true, frases: ['La cabeza no me para', 'Siento un nudo en el pecho', 'Todo me queda grande'] },
  { id: 'esperanza', nombre: 'Esperanza', color: '#ffd60a', pesa: false, frases: ['Hoy pedí ayuda', 'Un día a la vez', 'Hablarlo me alivió'] },
  { id: 'calma', nombre: 'Calma', color: '#00d4a8', pesa: false, frases: ['Hoy estoy bien', 'Respiré y pasó', 'Alguien me escuchó'] },
];

// Entradas de ejemplo, siempre las mismas (generador con semilla fija).
export function ejemplos(cantidad = 46) {
  let s = 17;
  const azar = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
  const pesos = [7, 5, 4, 8, 7, 7, 5, 3];
  const total = pesos.reduce((a, b) => a + b, 0);
  return Array.from({ length: cantidad }, () => {
    let r = azar() * total, i = 0;
    while ((r -= pesos[i]) > 0) i++;
    return { e: emociones[i].id, f: azar() < 0.7 ? Math.floor(azar() * 3) : -1 };
  });
}
