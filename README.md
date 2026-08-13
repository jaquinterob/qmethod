# Método Q

Un juego de rachas y constancia: avanza 10 pasos sin romper la racha. Cada paso
superado suma a tu racha; un paso fallado la reinicia y, en la zona de riesgo,
añade un bloqueo más.

Construido con **Angular 17** (standalone + signals), **RxJS** y diseño
tocado por tokens (tema oscuro, tipografía Inter self-hosted y motion con
`prefers-reduced-motion`).

## Comandos

| Comando                | Qué hace                                           |
| ---------------------- | -------------------------------------------------- |
| `npm start`            | Servidor de desarrollo en `http://localhost:4200/` |
| `npm run build`        | Build de producción en `dist/qmethod`              |
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

## Reglas del juego

- Empiezas con **10 pasos**: 5 inocentes y 5 de riesgo (marcados con ⚠).
- **Avancé**: completa el paso actual y suma 1 a la racha.
- **Fallé**: reinicia la racha; si estás en la zona de riesgo, añade un paso y
  cuenta un bloqueo.
- Al llegar a 5 pasos se enciende el modo fuego.
- Al completar los 10 pasos ves tu resumen y tu mejor racha.
