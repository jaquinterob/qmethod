# Monetización qmethod — checklist

URL canónica: **https://qmethod.jaquinterob.com/**  
Hosting: GitHub Pages (rama `gh-pages`). Tu VPS con `jaquinterob.com` **no se toca**.

## Lo que hace el código (ya en el repo)

- Build con `base-href /` + `404.html` (rutas SPA como `/privacidad`)
- Archivo `CNAME` → `qmethod.jaquinterob.com`
- Banner `q-ad-banner` (placeholder hasta que pegues IDs de AdSense)
- Página `/privacidad`
- Meta / Open Graph orientados a memorización
- GA4 listo si pegas `gaMeasurementId` en `src/app/core/constants/site-config.ts`
- `robots.txt` + `sitemap.xml`

## Tu parte (obligatoria)

### 1. DNS (5 minutos) — sin quitar el dominio del VPS

En el panel DNS de `jaquinterob.com` (cPanel, Cloudflare, etc.):

| Tipo  | Nombre / host | Destino / valor           |
| ----- | ------------- | ------------------------- |
| CNAME | `qmethod`     | `jaquinterob.github.io` |

- Deja los registros A/`www` del sitio principal como están.
- Si usas Cloudflare: el CNAME de `qmethod` en **DNS only** (nube gris), no proxy naranja, hasta que HTTPS de Pages funcione.

Comprueba (puede tardar minutos u horas):

```bash
dig qmethod.jaquinterob.com +nostats +nocomments +nocmd
```

Debes ver un CNAME hacia `jaquinterob.github.io`.

### 2. GitHub Pages — dominio personalizado

1. Repo → **Settings → Pages**
2. Custom domain: `qmethod.jaquinterob.com` → Save
3. Cuando aparezca: marca **Enforce HTTPS**
4. (Opcional) Verifica el dominio en Settings → Pages → Verify para evitar takeovers

### 3. Redesplegar la app

Cuando el código esté en `main` y quieras publicar:

```bash
npm run build
# luego el flujo de deploy a gh-pages (ver AGENTS.md)
```

Comprueba: `https://qmethod.jaquinterob.com/` y `/privacidad`.

### 4. Google AdSense

1. Crea / entra en [Google AdSense](https://www.google.com/adsense/)
2. Añade el sitio `qmethod.jaquinterob.com`
3. Cuando aprueben, crea un **bloque de anuncio** display horizontal/pequeño
4. Copia `ca-pub-…` y el id del slot
5. Pégalos en `src/app/core/constants/site-config.ts`:

```ts
adsenseClient: 'ca-pub-xxxxxxxx',
adsenseSlot: 'xxxxxxxxxx',
```

6. Commit, build, redeploy

Hasta que esos campos estén vacíos, se muestra el placeholder “Espacio reservado…”.

### 5. Analytics (opcional pero recomendado)

1. Crea una propiedad GA4
2. Pega el Measurement ID (`G-…`) en `gaMeasurementId` del mismo `site-config.ts`
3. Redesplegar

### 6. Enviar a AdSense / Search Console (después del DNS)

- Google Search Console: propiedad del subdominio + sitemap `https://qmethod.jaquinterob.com/sitemap.xml`
- Revisa AdSense hasta “Listo” / anuncios activos

## Después de un buen producto — redes (tu parte creativa)

1. Elige **una** red primaria (TikTok o Instagram Reels).
2. Landing = la propia app; CTA: “Probar” / link en bio con UTM, ej.  
   `https://qmethod.jaquinterob.com/?utm_source=tiktok&utm_medium=social&utm_campaign=lanzamiento`
3. Cadencia: 5–7 shorts/semana; hook 0–2s → demo del tablero → link.
4. Mide en GA4: clics → sesión (alguien pulsa Avancé), no solo vistas.
5. **No** compres ads hasta saber qué creativo trae sesiones.

### Hooks listos para grabar

1. “Fallar en la zona de riesgo te resetea la racha — así se memoriza en serio.”
2. “3 minutos. Sin mirar. ¿Aguantas la racha?”
3. “No es Anki: es honestidad al memorizar.”
4. POV: “Día 7 / se me rompió en Concierto.”
5. “Texto, idiomas, música, temario: el método es el mismo.”

## Ganancias (expectativa)

Con un banner pequeño, orden de magnitud: **~0,50–3 USD por 1.000 visitas** (varía por país). Los primeros meses con poco tráfico suelen ser **~0 USD**. El cuello de botella es la audiencia, no el banner.
