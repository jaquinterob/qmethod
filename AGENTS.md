# AGENTS.md

Contexto para agentes de IA que trabajan en `qmethod`. Léelo antes de tocar código.

## Qué es

Juego de rachas: avanzas 10 pasos sin romper la racha (5 inocentes + 5 de riesgo).
Stack: **Angular 17.3** (standalone + signals), RxJS, zone.js, Karma/Jasmine.
UI en español, tema oscuro/claro, tipografía Inter self-hosted, motion por tokens.

- Selector prefix: `q` (`q-home`, `q-feedback`).
- Deploy: `npm run build` genera `dist/qmethod` con `base-href /qmethod/` y el
  pipeline (Jenkinsfile) lo copia a `/var/www/html`.

## Comandos

| Comando                                     | Qué hace                                  |
| ------------------------------------------- | ----------------------------------------- |
| `npm start`                                 | Dev server en `http://localhost:4200/`     |
| `npm run build`                             | Build prod (**correrlo**: tiene budgets)   |
| `npx ng test --watch=false --browsers=ChromeHeadless` | Tests unitarios en CI-style        |
| `npm run lint`                              | ESLint (TS + plantillas Angular)          |
| `npm run format` / `npm run format:check`   | Prettier escribir / verificar             |

**Verificación mínima antes de decir "listo":** `npm run lint` +
`npx ng test --watch=false --browsers=ChromeHeadless` + `npm run build`.

## Estructura

```
src/
  index.html                     # viewport meta, lang="es"
  styles.css                     # :root (tokens), reset, tema .light
  app/
    app.routes.ts                # sólo la ruta '' -> HomeComponent
    app.config.ts                # provideRouter + provideAnimations
    core/
      constants/game-config.ts   # tuning (pasos, tiempos)
      services/game.service.ts   # estado con signals + persistencia
      services/motion-preference.service.ts
      services/sound.service.ts
    models/step.ts               # Step, StepType, ButtonPressed, GameStats
    shared/motion-tokens.ts      # DUR, EASE, T (duraciones/easings TS)
    components/
      home/                      # pantalla principal (tablero, acciones, resumen)
      feedback/                  # overlay de reacción (GIF)
```

## Convenciones

- **Estado**: todo vive en `GameService` (signals + `computed`), no en el
  componente. Persistencia en `localStorage`: clave `qmethod:game` (partida) y
  `qmethod:theme` (tema).
- **Estilos**: CSS por componente (encapsulado). Clases en estilo BEM-ish:
  `.board__header`, `.action--good`, `.step--done`, `.icon-button--reset`.
- **Tokens**: espacios/radios/colores/duraciones salen de `:root` en
  `src/styles.css` (`--space-*`, `--radius-*`, `--color-*`, `--dur-*`, `--ease-*`).
  Las animaciones TS usan `src/app/shared/motion-tokens.ts`.
- **Motion**: respetar `prefers-reduced-motion` (el home ya pasa
  `[@.disabled]="motion.reduced()"`). No introducir transiciones fuera de tokens.
- **Accesibilidad**: botones reales, `aria-label` en español, `aria-live` en el
  feedback, objetivos táctiles ≥ 44 px.
- **Sin dependencias nuevas** sin avisar primero.
- **No hacer commit** (ni push, ni amend, ni force) salvo petición explícita.

## Estilos / layout responsive (importante)

El bug histórico era scroll horizontal en móvil: el header (marca + subtítulo +
3 botones + valor) superaba el ancho de la tarjeta y, como `.board` es un grid
item con `min-width: auto`, empujaba el recuadro fuera de la pantalla.

Reglas que mantienen eso resuelto:

- `.board { min-width: 0 }` y `max-width: 560px` (nunca crecer por contenido).
- `.board__header` es **grid de dos filas** con `grid-template-areas`:
  `brand | reset | theme | sound` arriba, `progress… | value` abajo.
- Toda columna de texto usa `minmax(0, 1fr)` + `min-width: 0` +
  `text-overflow: ellipsis` (`.brand`, `.brand__text`, `.brand__title`,
  `.brand__subtitle`).
- `.actions` usa `repeat(2, minmax(0, 1fr))` (y `minmax(0, 1fr)` en móvil).
- Breakpoints: `≤700px` oculta `.brand__subtitle`; `≤480px` reduce padding del
  board a `--space-lg`, gap del header a `--space-xs` y botones a 36 px.
- **Nunca** fijar anchos mayores al viewport ni `width` rígido sin `minmax(0,…)`.
  El elemento más ancho en móvil es `.action__icon` (84 px).

Cómo verificar un cambio de layout: en DevTools emular
`320 / 360 / 390 / 414 / 480 / 550 / 768 / 1440` y comprobar que no hay
overflow:

```js
document.documentElement.scrollWidth <= document.documentElement.clientWidth
```

Estados a revisar además del inicial: feedback (`bad`/`good`), modo fuego y
resumen completado.

## Tests / warnings preexistentes

- **2 tests rojos que ya existían** (no los "arregles" cambiando el producto sin
  confirmar): `src/app/components/home/home.component.spec.ts:73` y `:85`
  esperan `'Perfección'`/`'perfección'`, pero `summaryLine()` se reescribió en el
  commit `de0ba4d`. El texto real es `¡Perfecto! ¡Te superaste a ti mismo! 🌟`.
- **Warning de budget**: `home.component.css` está sobre el warning de 9 kB
  (9.71 kB con el header en grid; el límite de error es 12 kB). Preexistente.
- **Prettier**: `npm run format:check` ya falla en `home.component.html` por
  `<svg>` en una sola línea (preexistente). No reformatees archivos ajenos al
  cambio sólo para "dejar en verde".

## Deploy (GitHub Pages)

La app publicada vive en `https://jaquinterob.github.io/qmethod/`. Pages usa
build **legacy**: rama `gh-pages`, root `/`. El build ya sale con
`base-href /qmethod/`, igual que la ruta del sitio.

Sólo después de cerrar una funcionalidad y con la verificación en verde:

```bash
npm run build # -> dist/qmethod (base-href /qmethod/)

TMP="$(mktemp -d)"
git clone --branch gh-pages --depth 1 https://github.com/jaquinterob/qmethod.git "$TMP"
git -C "$TMP" rm -rq .
cp -R "$(pwd)/dist/qmethod/." "$TMP"/
touch "$TMP/.nojekyll" # evita que Jekyll procese los assets
git -C "$TMP" add -A
git -C "$TMP" commit -m "deploy: <qué se publica>"
git -C "$TMP" push origin gh-pages

# verificación
gh api repos/jaquinterob/qmethod/pages --jq '.status, .html_url'
curl -s https://jaquinterob.github.io/qmethod/ | grep -o 'main-[A-Z0-9]*\.js'
```

- Se actualiza `gh-pages` encima (historial limpio); no hace falta recrearla
  con `--orphan` ni hacer `push --force`.
- Cambio sólo de docs → no redesplegar: el artefacto de `dist` no cambia.
- Si `status` no pasa a `built`, revisa
  `gh api repos/jaquinterob/qmethod/pages/builds`.

## Commits

Convención Conventional Commits, en inglés, minúsculas:
`fix: ...`, `feat: ...`, `refactor: ...`, `style: ...`, `test: ...`.

Orden recomendado al cerrar una funcionalidad:
**verificar → commit → push a `main` → deploy en `gh-pages` → comprobar la URL**.
