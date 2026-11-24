# Método Q (qmethod)

Sesión de **memorización con racha**: eliges algo concreto y solo avanzas si lo
haces **sin mirar**. No es una app de piano ni de flashcards: es un ritual corto
y honesto que sirve para texto, discursos, idiomas, secuencias, música, temario
o lo que estés memorizando.

Cada paso sumado mantiene la racha; un fallo la reinicia y, en la zona de
riesgo, añade bloqueos. Hay 4 modos (Boceto, Ejercicio, Estudio, Concierto).

Construido con **Angular 17** (standalone + signals), **RxJS** y diseño
tocado por tokens (tema oscuro, tipografía Inter self-hosted y motion con
`prefers-reduced-motion`).

Sitio canónico (cuando el DNS esté listo):
[https://qmethod.jaquinterob.com/](https://qmethod.jaquinterob.com/).  
Monetización / DNS / AdSense: [`docs/monetizacion.md`](docs/monetizacion.md).

## Comandos

| Comando                | Qué hace                                           |
| ---------------------- | -------------------------------------------------- |
| `npm start`            | Servidor de desarrollo en `http://localhost:4200/` |
| `npm run build`        | Build de producción en `dist/qmethod` (`base-href /`) |
| `npm test`             | Tests unitarios (Karma + Jasmine)                  |
| `npm run lint`         | ESLint (TypeScript + plantillas Angular)           |
| `npm run format`       | Formatea con Prettier                              |
| `npm run format:check` | Verifica el formato sin tocar archivos             |

## Arquitectura

```
src/app/
  core/
    constants/game-config.ts        # Tuning del juego (pasos, tiempos)
    services/game.service.ts        # Estado del juego con signals + persistencia
    services/motion-preference.service.ts
  models/step.ts                    # Step, StepType, ButtonPressed, GameStats
  shared/motion-tokens.ts           # Tokens de duración/easing para animaciones
  components/
    home/                           # Pantalla principal (tablero, acciones, resumen)
    feedback/                       # Overlay de reacción (GIF + texto)
```

- **Estado centralizado en `GameService`** con `signal`/`computed`. La lógica
  está fuera del componente y es 100 % testeable.
- **Persistencia en `localStorage`**: si recargas o cierras a mitad de partida,
  la retomas donde ibas (no se restaura una partida ya terminada).
- **Sin temporizadores fugados**: los retrasos de feedback y del modo fuego usan
  `timer` + `takeUntilDestroyed`.
- **Accesible**: botones reales, objetivos ≥ 44 px, `aria-live` en feedback,
  `lang="es"` y contraste AA (Lighthouse: 100).
- **Motion por tokens**: entradas con stagger, rebote del chip al completarse,
  y colapso de todo el movimiento con `prefers-reduced-motion`.

## Cómo se usa

1. Elige qué memorizar (tú pones el contenido; la app no lo guarda aún).
2. Escoge un modo según cuánto quieras exigirte.
3. **Avancé** solo si lo hiciste sin mirar; **Fallé** si no.
4. En la zona de riesgo, fallar duele más (reinicia racha y suma bloqueos).
5. Al completar ves tu resumen y tu mejor racha.

## Reglas (modo Ejercicio, por defecto)

- **10 pasos**: 5 inocentes y 5 de riesgo (marcados con ⚠).
- **Avancé**: completa el paso actual y suma 1 a la racha.
- **Fallé**: reinicia la racha; si estás en la zona de riesgo, añade un paso y
  cuenta un bloqueo.
- Al llegar al umbral del modo se enciende el modo fuego.
- Al completar ves tu resumen y tu mejor racha.
