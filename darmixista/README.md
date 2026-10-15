# Darmixista — Portafolio

Sitio de una sola pantalla fija con transiciones entre secciones (Astro 7 + React 19 + Three.js + GSAP + Tailwind v4).

Producción: **https://darmixista.dev** (español) · **https://darmixista.dev/en/** (inglés)

## Desarrollo

```bash
npm install
cp .env.example .env   # y coloca tu clave de Web3Forms
npm run dev
```

`npm run build` genera el sitio estático en `dist/`.

## Dónde editar el contenido

| Qué | Archivo |
| --- | --- |
| Nombre, correo, redes, CV, disponibilidad | `src/config/site.ts` |
| Textos en español e inglés | `src/i18n/ui.ts` |
| Stack | `src/data/stack.ts` |
| Experiencia y formación | `src/data/trajectory.ts` |
| Proyectos (un archivo por proyecto) | `src/data/projects/web/` y `src/data/projects/mobile/` |
| Servicios | `src/data/services.ts` |
| CV en PDF | `public/cv/` |
| Capturas de proyectos | `public/projects/` |
| Landings de apps móviles (textos, paleta, versión) | `src/data/apps/` |
| Imágenes y videos de cada landing | `public/apps/<app>/` |

## Landings de apps móviles

Cada app móvil tiene su propia página con botón de descarga, fuera del portafolio:

| Ruta | Página |
| --- | --- |
| `darmixista.dev/darmixpet/` | DarmixPet (español) |
| `darmixista.dev/en/darmixpet/` | DarmixPet (inglés) |
| `darmixista.dev/darmixfit/` | DarmixFit (español) |
| `darmixista.dev/en/darmixfit/` | DarmixFit (inglés) |

En el carrusel de apps, el botón **Descargar app** lleva a esa página (`links.page` en
`src/data/projects/mobile/<app>.ts`). Los APK **no** se guardan en este proyecto: el botón descarga el
archivo directamente de las *GitHub Releases* del repositorio de la app.

### Cómo se elige la versión que se descarga

1. El botón apunta a la versión escrita en `release` de `src/data/apps/<app>.ts` (respaldo).
2. Al abrir la página, el navegador consulta `api.github.com/repos/<dueño>/<repo>/releases/latest`;
   si hay una versión más nueva con un `.apk`, actualiza el enlace, la versión y el tamaño.
3. Si GitHub no responde, el enlace de respaldo sigue funcionando.

Al publicar una release nueva no hace falta tocar el sitio. Conviene actualizar `release` de vez en cuando
para que el respaldo, los datos para buscadores y la primera carga muestren la versión correcta.
Las releases marcadas como *pre-release* o borrador se ignoran.

### Agregar la landing de otra app

1. Copia `src/data/apps/darmixpet.ts` como `src/data/apps/<app>.ts` y cambia textos, paleta, repositorio y versión.
2. Pon sus imágenes en `public/apps/<app>/` (ícono, capturas, personajes, videos `.mp4` con su imagen de portada).
3. Copia `src/pages/darmixpet/index.astro` y `src/pages/en/darmixpet/index.astro` a `src/pages/<app>/` y
   `src/pages/en/<app>/`, e importa tu archivo de datos.
4. En `src/data/projects/mobile/<app>.ts` pon `links: { page: '<app>' }`.
5. Imagen para compartir: `public/apps/<app>/og-es.png` y `og-en.png` (1200×630).

Secciones opcionales: `companions` (personajes, DarmixPet) y `programs` (catálogo, DarmixFit); si una app no
las tiene, desaparecen del menú.

**Apariencia (`look`):** cada app elige un estilo y sus fuentes.

| Estilo | Cómo se ve | Ejemplo |
| --- | --- | --- |
| `sticker` | Contornos gruesos, sombras sólidas y esquinas redondas | DarmixPet (Fredoka + Nunito) |
| `athletic` | Oscuro, líneas finas, títulos condensados en mayúsculas y acento neón | DarmixFit (Big Shoulders + Manrope) |

`defaultScheme: 'dark'` hace que la página abra en oscuro si el visitante no ha elegido tema.
Para usar otras fuentes, instala su paquete de `@fontsource-variable/…` e impórtalo en
`src/layouts/LandingLayout.astro` (el navegador solo descarga las fuentes que usa cada página).

## Formulario de contacto (Web3Forms)

La clave va en `.env` como `PUBLIC_WEB3FORMS_KEY`. Al publicar, agrega la misma variable en el panel del
hosting (el archivo `.env` no se sube al repositorio).

### Protecciones incluidas

- Campo trampa para bots y detección de envíos imposiblemente rápidos (menos de 3 s): se finge éxito sin enviar.
- Validación: nombre 2–80 caracteres sin enlaces, correo válido (máx. 120), mensaje 10–2000 caracteres con máximo 3 enlaces.
- Limpieza de caracteres de control e invisibles.
- Límites por navegador: 3 envíos cada 24 h, 60 s entre envíos y bloqueo de mensajes duplicados.
- Web3Forms aplica además su propio filtro de spam en el servidor.

Los límites ajustables están en `LIMITS`, en `src/scripts/contact.ts`.

### Importante sobre los límites

En un sitio estático, los límites viven en el navegador: frenan el uso abusivo normal y a los bots simples,
pero alguien decidido puede borrarlos o llamar a la API de Web3Forms directamente (la clave es pública por diseño).
Un límite real **por IP** requiere un servidor. Opciones si algún día recibes spam:

1. **hCaptcha de Web3Forms** (gratis): agrega un desafío al formulario.
2. **Función serverless como intermediario** (p. ej. Cloudflare Pages Functions o Vercel Functions):
   recibe el formulario, aplica un límite por IP y reenvía a Web3Forms con la clave guardada en el servidor.

## Publicación en Cloudflare (darmixista.dev)

El sitio es 100 % estático: se despliega como Worker con archivos estáticos (`wrangler.jsonc`, carpeta `dist/`).

1. **Sube el proyecto a GitHub.** Revisa que `.gitignore` incluya `node_modules/`, `dist/`, `.astro/` y `.env`.
2. En Cloudflare: **Workers & Pages → Create → Import a repository** y elige el repositorio.
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy` (el que viene por defecto)
3. **Variables de entorno de build** (Settings → Variables and secrets, tipo *build*):
   `PUBLIC_WEB3FORMS_KEY` = tu clave. Se inserta al compilar, por eso debe estar en el build.
4. **Dominio:** en el Worker → Settings → Domains & Routes → Add → *Custom domain*:
   `darmixista.dev` y `www.darmixista.dev`. DNS y certificado se crean solos (el dominio ya está en tu cuenta).
5. **www → sin www:** Rules → Redirect Rules → plantilla *Redirect from WWW to root* (301).
6. Cada `git push` a la rama principal vuelve a publicar el sitio automáticamente.

Archivos relacionados: `wrangler.jsonc` (despliegue y página 404), `public/_headers` (seguridad y caché),
`public/robots.txt`, `.node-version` (Node 22 para el build).

## Buscadores (SEO)

Ya incluido: título y descripción por idioma, URL canónica, `hreflang` (es/en), sitemap
(`/sitemap-index.xml`), `robots.txt`, imagen para compartir (`public/og/`), datos estructurados
(Person + WebSite + ProfilePage con tus perfiles de GitHub y LinkedIn) y página 404 sin indexar.
Los buscadores no reciben la redirección automática de idioma.

Después de publicar:

1. **Google Search Console** → añade la propiedad de tipo *Dominio* `darmixista.dev` (verificación por DNS,
   Cloudflare puede crear el registro TXT automáticamente) → *Sitemaps* → envía `sitemap-index.xml` →
   *Inspección de URL* → solicita indexación de `/` y `/en/`.
2. **Bing Webmaster Tools** → *Importar desde Google Search Console* (cubre también DuckDuckGo y Yahoo).
3. **Enlaces hacia el sitio:** campo *Website* y README de tu perfil de GitHub, *Información de contacto* y
   *Destacados* en LinkedIn, READMEs de tus proyectos y tu CV.
4. **Comprobar:** vista previa al compartir con el *Post Inspector* de LinkedIn y datos estructurados con la
   *Prueba de resultados enriquecidos* de Google.

Las secciones (`#about`, `#projects-3`…) son anclas de la misma página: Google indexa una página por idioma
con todo su contenido, lo cual es lo esperado para un portafolio de una sola página.

Si cambias tu nombre, rol o stack, regenera las imágenes de `public/og/` para que coincidan.
