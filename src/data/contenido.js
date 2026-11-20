// Línea 106: nacional, gratuita, confidencial y 24/7 según Minsalud
// (minsalud.gov.co/salud/publica/salud-mental/Paginas/linea-106.aspx, nov. 2026).
export const lineas = [
  { numero: '106', nombre: 'Línea 106', detalle: 'Orientación en salud mental. Gratis, confidencial, 24 horas.' },
  { numero: '123', nombre: 'Línea 123', detalle: 'Emergencias: si tú o alguien corre peligro ahora mismo.' },
];

export const episodios = [
  {
    archivo: 'episodio-1.mp3',
    titulo: 'El silencio que pesa',
    resumen: 'Cómo ponerle palabras al dolor emocional antes de que escale. Dos jóvenes cuentan qué sintieron antes de pedir ayuda.',
  },
  {
    archivo: 'episodio-2.mp3',
    titulo: 'Ellas lo dicen, ellos lo callan',
    resumen: 'Por qué las mujeres reportan casi el doble de intentos (118,9 frente a 71,6) y cómo romper el silencio masculino.',
  },
  {
    archivo: 'episodio-3.mp3',
    titulo: 'Cómo acompañar a un amigo',
    resumen: 'Guía paso a paso para estar con alguien en crisis sin juzgarlo.',
  },
];

export const senales = [
  { id: 'aislamiento', corta: 'Aislamiento repentino', pregunta: '¿Te has alejado de tu gente o de lo que antes te gustaba hacer?' },
  { id: 'animo', corta: 'Cambios bruscos de ánimo', pregunta: '¿Tu ánimo cambia de golpe o pasas casi todo el día triste o irritable?' },
  { id: 'sueno', corta: 'Insomnio', pregunta: '¿Te está costando dormir, o el sueño ya no te descansa?' },
  { id: 'pertenencias', corta: 'Regalar pertenencias', pregunta: '¿Has regalado o pensado en regalar cosas que son importantes para ti?', urgente: true },
  { id: 'despedidas', corta: 'Frases de despedida', pregunta: '¿Has dicho o escrito cosas que suenan a despedida?', urgente: true },
];

export const frases = [
  'No estoy bien y necesito hablar con alguien. ¿Tienes un rato hoy?',
  'Llevo días sintiéndome mal y no sé cómo explicarlo. ¿Me escuchas?',
  'Me está costando cargar con esto. ¿Me acompañas a pedir ayuda?',
];

export const apoyo = [
  { titulo: 'Pregunta directo', texto: 'Decir "¿has pensado en hacerte daño?" no le mete la idea: le abre la puerta para hablar.' },
  { titulo: 'Escucha sin arreglar', texto: 'No necesitas tener la solución. Evita el "eso no es nada" y el sermón. Quédate y escucha.' },
  { titulo: 'No prometas guardar el secreto', texto: 'Si su vida está en riesgo, contarle a un adulto de confianza es cuidarlo, no traicionarlo.' },
  { titulo: 'Acompaña la llamada', texto: 'Ofrécete a marcar la 106 a su lado. Dar el primer paso con alguien cuesta menos.' },
  { titulo: 'Si hay peligro ahora', texto: 'No lo dejes solo y llama al 123.' },
];

export const glosario = [
  ['Intento de suicidio', 'Acción que una persona hace con la intención de quitarse la vida, pero que no termina en la muerte. Es una señal de alerta enorme: quien lo intentó necesita atención y acompañamiento.'],
  ['Tasa', 'Forma de medir qué tanto pasa algo en relación con el tamaño de la población, normalmente por cada 100.000 habitantes. Permite comparar grupos de distinto tamaño de forma justa.'],
  ['Tasa general (promedio)', 'La tasa de toda la población, sin dividir por edad, sexo o zona. Es el punto de comparación: en 2021 fue 95,7.'],
  ['Grupo de edad (rango etario)', 'Forma de agrupar a la población por edades, por ejemplo 17 a 21 años. Ayuda a ver qué edades están más en riesgo.'],
  ['Cabecera municipal', 'La zona urbana de un municipio, donde está el casco urbano: la "ciudad" o el pueblo central.'],
  ['Centros poblados y rural disperso', 'Las zonas rurales: veredas, caseríos y casas lejos del casco urbano, donde el acceso a servicios de salud suele ser más difícil.'],
  ['Salud mental', 'Estado de bienestar en el que una persona puede manejar el estrés, relacionarse con otros, estudiar o trabajar y tomar decisiones. Se cuida igual que la salud física.'],
  ['Factor de riesgo', 'Situación que aumenta la probabilidad de un intento de suicidio, como el aislamiento, la depresión, el consumo de sustancias, la violencia o la falta de oportunidades.'],
  ['Factor protector', 'Lo que ayuda a reducir el riesgo: tener redes de apoyo, alguien de confianza con quien hablar, acceso a atención psicológica y proyectos de vida.'],
  ['Ruta de atención', 'Camino o pasos que una persona puede seguir para recibir ayuda: líneas telefónicas de salud mental, EPS, hospitales y servicios de urgencias.'],
];
