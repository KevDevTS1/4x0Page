// Guion de "Te escribió un amigo". Cada turno: lo que escribe Santi, tres
// respuestas posibles y, por respuesta, cómo reacciona y qué se aprende.
// efecto: 1 = Santi se abre, 0 = se queda igual, -1 = se cierra.
// Pendiente de validar con un profesional de salud mental.
export const amigo = 'Santi';

export const turnos = [
  {
    santi: ['ey', '¿estás despierto?'],
    opciones: [
      { texto: 'Sí, aquí estoy. ¿Qué pasó?', efecto: 1, reaccion: ['nada, solo que no puedo dormir', 'llevo días así'], nota: 'Estar disponible ya es ayudar: le dices que tiene con quién hablar.' },
      { texto: 'Sí, pero ya me iba a dormir. ¿Es urgente?', efecto: 0, reaccion: ['no, tranqui', '...es que hace días no puedo dormir'], nota: 'Poner condiciones hace que el otro dude si vale la pena contarte.' },
      { texto: 'Jajaja ¿qué haces despierto a esta hora?', efecto: -1, reaccion: ['jaja nada', 'no puedo dormir, es todo'], nota: 'El chiste le avisa que no es momento de hablar en serio.' },
    ],
  },
  {
    santi: ['siento que todo me queda grande', 'la u, la casa, todo'],
    opciones: [
      { texto: 'Suena muy pesado. ¿Qué es lo que más te está pesando?', efecto: 1, reaccion: ['no sé...', 'siento que le fallo a todo el mundo'], nota: 'Preguntar y dejar hablar abre la conversación. No hace falta tener la respuesta.' },
      { texto: 'A todos nos pasa, es una etapa.', efecto: -1, reaccion: ['sí, supongo', 'perdón por molestar'], nota: 'Comparar le quita peso a lo que siente y lo empuja a callar.' },
      { texto: 'Deberías organizarte mejor, hazte un horario.', efecto: 0, reaccion: ['ya lo intenté', 'no es eso'], nota: 'Dar soluciones rápidas hace sentir que no lo escuchaste.' },
    ],
  },
  {
    santi: ['a veces pienso que todo estaría mejor si yo no estuviera'],
    opciones: [
      { texto: 'Gracias por contármelo. ¿Has pensado en hacerte daño?', efecto: 1, reaccion: ['sí... a veces', 'nunca se lo había dicho a nadie'], nota: 'Preguntar directo no le mete la idea: le muestra que contigo sí puede hablar de eso.' },
      { texto: 'No digas bobadas, tú tienes todo para estar bien.', efecto: -1, reaccion: ['sí, tienes razón', 'olvídalo'], nota: 'Regañar o minimizar cierra la puerta justo cuando se había abierto.' },
      { texto: 'Uy... ¿y sí viste el partido de hoy?', efecto: -1, reaccion: ['no', 'mejor hablamos otro día'], nota: 'Cambiar de tema le dice que esto es demasiado para ti.' },
    ],
  },
  {
    santi: ['pero no le vayas a decir a nadie, porfa'],
    opciones: [
      { texto: 'Me importas demasiado para guardar esto yo solo. Busquemos juntos a alguien que sepa ayudar.', efecto: 1, reaccion: ['me da miedo', 'pero vale... si es contigo'], nota: 'Cuando hay riesgo, pedir ayuda no es traicionarlo: es cuidarlo.' },
      { texto: 'Te lo prometo, queda entre los dos.', efecto: 0, reaccion: ['gracias', 'sabía que podía contar contigo'], nota: 'Se siente bien en el momento, pero te deja solo con algo que necesita ayuda profesional.' },
      { texto: 'Si no me cuentas todo, le digo a tu mamá.', efecto: -1, reaccion: ['no, por favor', 'ya, olvídalo'], nota: 'La amenaza rompe la confianza que lo hizo escribirte.' },
    ],
  },
  {
    santi: ['¿y ahora qué hago?'],
    opciones: [
      { texto: 'Llamemos a la Línea 106: es gratis y atienden a esta hora. Me quedo contigo en la llamada.', efecto: 1, reaccion: ['bueno', 'gracias por no dejarme solo'], nota: 'Acompañar el primer paso es la ayuda más concreta. Si hay peligro inmediato, se llama al 123.' },
      { texto: 'Duerme y mañana miramos.', efecto: 0, reaccion: ['ok...'], nota: 'Aplazar deja pasar el momento en que él sí quiso hablar.' },
      { texto: 'Tienes que ser fuerte, échale ganas.', efecto: -1, reaccion: ['sí...'], nota: 'Pedirle fuerza a quien ya no puede más lo deja más solo.' },
    ],
  },
];
