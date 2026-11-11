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

| Qué                                                | Archivo                                                |
| -------------------------------------------------- | ------------------------------------------------------ |
| Nombre, correo, redes, CV, disponibilidad          | `src/config/site.ts`                                   |
| Textos en español e inglés                         | `src/i18n/ui.ts`                                       |
| Stack                                              | `src/data/stack.ts`                                    |
| Experiencia y formación                            | `src/data/trajectory.ts`                               |
| Proyectos (un archivo por proyecto)                | `src/data/projects/web/` y `src/data/projects/mobile/` |
| Servicios                                          | `src/data/services.ts`                                 |
| CV en PDF                                          | `public/cv/`                                           |
| Capturas de proyectos                              | `public/projects/`                                     |
| Landings de apps móviles (textos, paleta, versión) | `src/data/landings/`                                   |
| Imágenes y videos de cada landing                  | `public/apps/<app>/`                                   |

## Landings de apps móviles

Cada app móvil tiene su propia página con botón de descarga, fuera del portafolio:

| Ruta                             | Página                |
| -------------------------------- | --------------------- |
| `darmixista.dev/darmixpet/`      | DarmixPet (español)   |
| `darmixista.dev/en/darmixpet/`   | DarmixPet (inglés)    |
| `darmixista.dev/darmixfit/`      | DarmixFit (español)   |
| `darmixista.dev/en/darmixfit/`   | DarmixFit (inglés)    |
| `darmixista.dev/darmixnight/`    | DarmixNight (español) |
| `darmixista.dev/en/darmixnight/` | DarmixNight (inglés)  |

En el carrusel de apps, el botón **Descargar app** lleva a esa página (`links.page` en
`src/data/projects/mobile/<app>.ts`). Los APK **no** se guardan en este proyecto: el botón descarga el
archivo directamente de las _GitHub Releases_ del repositorio de la app.

### Cómo se elige la versión que se descarga

1. El botón apunta a la versión escrita en `release` de `src/data/landings/<app>.ts` (respaldo).
2. Al abrir la página, el navegador consulta `api.github.com/repos/<dueño>/<repo>/releases/latest`;
   si hay una versión más nueva con un `.apk`, actualiza el enlace, la versión y el tamaño.
3. Si GitHub no responde, el enlace de respaldo sigue funcionando.

Al publicar una release nueva no hace falta tocar el sitio. Conviene actualizar `release` de vez en cuando
para que el respaldo, los datos para buscadores y la primera carga muestren la versión correcta.
Las releases marcadas como _pre-release_ o borrador se ignoran.

### Estructura de las landings

Cada app tiene su propio diseño sobre un kit compartido. Crear o cambiar una landing solo toca su carpeta y su archivo de datos.

| Carpeta                                        | Contenido                                                                                                                                                                                                              |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/landing/kit/`                             | Piezas compartidas: base y SEO (`Shell`), datos estructurados (`jsonld.ts`), íconos, botón de descarga, QR, panel «Antes de instalar», pie, cambio de paleta (`skins.ts`) y comportamiento común (`kit.ts`, `kit.css`) |
| `src/landing/types.ts` y `src/landing/i18n.ts` | Tipos y textos comunes del kit                                                                                                                                                                                         |
| `src/landing/<app>/`                           | Diseño propio de cada app: secciones, estilos (`<app>.css`), scripts y su página (`<App>Page.astro`)                                                                                                                   |
| `src/data/landings/<app>.ts`                   | Textos, paletas, versión y contenido del panel de cada app                                                                                                                                                             |
| `src/pages/<app>/` y `src/pages/en/<app>/`     | Rutas: solo renderizan `<App>Page` con su idioma                                                                                                                                                                       |
| `public/apps/<app>/`                           | Íconos, imágenes, videos e imágenes para compartir (`og-es.png` y `og-en.png`, 1200×630)                                                                                                                               |

| App         | Estilo                                                                              | Fuentes                        |
| ----------- | ----------------------------------------------------------------------------------- | ------------------------------ |
| DarmixPet   | Claro y juguetón, bordes gruesos; la página toma los colores del personaje elegido  | Fredoka + Nunito               |
| DarmixFit   | Oscuro tipo panel de control; un reactor se carga al bajar; cuatro colores          | Big Shoulders + Manrope        |
| DarmixNight | Nocturno y editorial; la lámpara se apaga al tocarla; reloj real y perilla que gira | Instrument Serif + Inter Tight |

Reglas para agregar o cambiar una landing:

- Lo propio de una app vive en su carpeta y en su archivo de datos; no se agrega nada de una app al kit.
- La paleta de cada app comparte los colores base (`CorePalette`); los colores extra se declaran en su archivo de datos y se mapean en su `<app>.css`.
- Las fuentes se instalan con `@fontsource` y se importan en la página de la app, así cada página solo descarga las suyas.
- `defaultScheme: 'dark'` en `Shell` hace que la página abra en oscuro.
- El panel «Antes de instalar» muestra la pestaña de permisos solo si la app tiene permisos en sus datos.
- En `src/data/projects/mobile/<app>.ts`, `links: { page: '<app>' }` conecta la tarjeta del portafolio con su landing.

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
3. **Variables de entorno de build** (Settings → Variables and secrets, tipo _build_):
   `PUBLIC_WEB3FORMS_KEY` = tu clave. Se inserta al compilar, por eso debe estar en el build.
4. **Dominio:** en el Worker → Settings → Domains & Routes → Add → _Custom domain_:
   `darmixista.dev` y `www.darmixista.dev`. DNS y certificado se crean solos (el dominio ya está en tu cuenta).
5. **www → sin www:** Rules → Redirect Rules → plantilla _Redirect from WWW to root_ (301).
6. Cada `git push` a la rama principal vuelve a publicar el sitio automáticamente.

Archivos relacionados: `wrangler.jsonc` (despliegue y página 404), `public/_headers` (seguridad y caché),
`public/robots.txt`, `.node-version` (Node 22 para el build).

## Buscadores (SEO)

Ya incluido: título y descripción por idioma, URL canónica, `hreflang` (es/en), sitemap
(`/sitemap-index.xml`), `robots.txt`, imagen para compartir (`public/og/`), datos estructurados
(Person + WebSite + ProfilePage con tus perfiles de GitHub y LinkedIn) y página 404 sin indexar.
Los buscadores no reciben la redirección automática de idioma.

Después de publicar:

1. **Google Search Console** → añade la propiedad de tipo _Dominio_ `darmixista.dev` (verificación por DNS,
   Cloudflare puede crear el registro TXT automáticamente) → _Sitemaps_ → envía `sitemap-index.xml` →
   _Inspección de URL_ → solicita indexación de `/` y `/en/`.
2. **Bing Webmaster Tools** → _Importar desde Google Search Console_ (cubre también DuckDuckGo y Yahoo).
3. **Enlaces hacia el sitio:** campo _Website_ y README de tu perfil de GitHub, _Información de contacto_ y
   _Destacados_ en LinkedIn, READMEs de tus proyectos y tu CV.
4. **Comprobar:** vista previa al compartir con el _Post Inspector_ de LinkedIn y datos estructurados con la
   _Prueba de resultados enriquecidos_ de Google.

Las secciones (`#about`, `#projects-3`…) son anclas de la misma página: Google indexa una página por idioma
con todo su contenido, lo cual es lo esperado para un portafolio de una sola página.

Si cambias tu nombre, rol o stack, regenera las imágenes de `public/og/` para que coincidan.
