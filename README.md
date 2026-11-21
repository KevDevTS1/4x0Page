# Cuatro por Cero (4×0)

Especial transmedia de prevención del suicidio juvenil. Astro + Motion + three.js.

## Arrancar

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # genera dist/ para publicar
```

Requiere Node 22.12 o superior.

## Dónde va cada cosa

| Qué | Dónde |
|---|---|
| Audios del podcast | `public/audio/episodio-1.mp3`, `episodio-2.mp3`, `episodio-3.mp3` |
| Video de prevención | `public/video/lejos-de-todo.mp4` |
| Imágenes | `public/img/` |
| Cifras | `src/data/tasas.json` |
| Textos (líneas, episodios, señales, frases, glosario) | `src/data/contenido.js` |
| Crónica | `src/data/cronica.js` |
| Colores y tipografía | `src/styles/global.css` |

Mientras un audio o el video no esté en su carpeta, la página muestra
"estará disponible pronto" al intentar reproducirlo.

## Cifras

`tasas.json` sale de la hoja BASE DE DATOS del guion: edad, sexo y área
divididos por 10; general dividido por 100. El segundo valor de cada categoría
de 2017 se tomó como 2018. El general de 2018 (1004) se leyó como 100,4.
