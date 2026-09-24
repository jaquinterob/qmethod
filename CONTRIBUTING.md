# CONTRIBUTING.md

Cómo contribuir a `qmethod` trabajando juntas/os: **persona (product owner /
dev)** + **agente de IA**. El detalle técnico vive en [AGENTS.md](./AGENTS.md);
esto es el acuerdo de trabajo.

## Idioma

Todo en **español**: issues, mensajes de commit no, los commits van en inglés
(Conventional Commits), pero la conversación y los reportes en español.

## Roles

**Persona**

- Define el qué: qué se ve mal, qué se espera, en qué dispositivo/pantalla.
- Revisa el diff y decide si se commitea.
- Aprueba cambios de diseño (textos, layout, colores) y dependencias nuevas.

**Agente**

- Investiga antes de tocar código (lee, reproduce, mide).
- Aplica el cambio mínimo que resuelve la causa raíz.
- **Verifica siempre**: `npm run lint`, tests headless y `npm run build`.
- Reporta qué cambió, qué se verificó y qué quedó pendiente.
- No commitea, no pushea, no agrega dependencias sin pedirlo.

## Flujo de trabajo

1. **Contexto**: la persona describe el síntoma con lo mínimo necesario
   (qué pantalla, qué viewport, qué esperabas, si es en dev o en producción).
2. **Diagnóstico**: el agente reproduce el problema (dev server + emulación de
   dispositivo en DevTools) y encuentra la causa antes de proponer la solución.
3. **Cambio**: edits mínimos y localizados; seguir el estilo existente
   (BEM-ish, tokens, sin dependencias nuevas).
4. **Verificación**: lint + tests + build + revisión visual en los viewports
   clave (320/360/390/414/480/550/768/1440) y en los estados de la app
   (inicial, feedback, fuego, resumen).
5. **Reporte**: resumen de 3-5 líneas con archivos tocados, comandos corridos y
   resultado. La persona decide el commit.

## Pasos recomendados al cerrar una funcionalidad

Cuando una funcionalidad queda terminada y verificada, el cierre habitual es:

1. **Verificación final**: `npm run lint`,
   `npx ng test --watch=false --browsers=ChromeHeadless`, `npm run build` y
   revisión visual en los viewports clave.
2. **Commit de la funcionalidad**: un tema por commit, en inglés y con
   Conventional Commits (`fix: ...`, `feat: ...`, `docs: ...`).
3. **Push a `main`**: `git push origin main`.
4. **Publicar en GitHub Pages**: regenerar el build y subirlo a la rama
   `gh-pages` (pasos exactos en [AGENTS.md](./AGENTS.md)).
5. **Comprobar la publicación**:
   `gh api repos/jaquinterob/qmethod/pages --jq '.status, .html_url'` debe
   responder `built` y abrir `https://jaquinterob.github.io/qmethod/`.
6. **Reporte**: qué cambió, qué se verificó, URL publicada y pendientes.

Si el cambio es sólo de docs (`AGENTS.md`, `CONTRIBUTING.md`, `README.md`),
el paso 4 se salta: el artefacto de `dist` no cambia.

## Cómo pedir un cambio

Ejemplos que funcionan:

- "En iPhone el tablero se sale y aparece scroll a la derecha. Repáralo."
- "El botón de 'Fallé' en 360 px queda cortado."
- "Revisa el estado de resumen en tablet."

Si puedes, adjunta: viewport, estado de la app (inicial/completado/fuego),
tema (claro/oscuro) y si ocurre en dev o en `/qmethod/`.

## Plantilla de reporte de bug

```
Pantalla: home / feedback / resumen
Viewport: 390x844 (móvil)
Estado: inicial / feedback / fuego / resumen
Tema: oscuro / claro
Esperado: ...
Observado: ...
```

## Checklist antes de dar por terminado un cambio

- [ ] `npm run lint` pasa.
- [ ] `npx ng test --watch=false --browsers=ChromeHeadless` (ver los 2 fallos
      preexistentes documentados en AGENTS.md).
- [ ] `npm run build` pasa (revisar warnings de budgets).
- [ ] Sin scroll horizontal en 320/360/390/414/480/550.
- [ ] Visual correcto en desktop (1440) y en tema claro.
- [ ] `prefers-reduced-motion` sigue respetado.
- [ ] Diff acotado: sólo archivos necesarios.

## Commits y ramas

- La persona pide explícitamente "commitea"; el agente nunca lo hace solo.
- Antes de commitear: `git status`, `git diff` y `git log --oneline -10`.
- Mensaje en inglés, estilo `fix: ...` / `feat: ...`, un tema por commit.
- Orden recomendado tras cerrar una funcionalidad: **commit → push → deploy
  en GitHub Pages** (ver arriba).
- Sin `--force`, sin amend sobre commits ya push-eados, sin saltarse hooks.

## Cuando algo queda a medias

Decirlo claramente en el reporte (ej: "los 2 tests rojos son preexistentes",
"el warning de budget de `home.component.css` sigue"). Mejor un pendiente
explícito que un "queda listo" incompleto.
