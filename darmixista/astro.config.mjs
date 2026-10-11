// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Dominio de producción: se usa para URLs canónicas, hreflang, Open Graph y el sitemap
  site: 'https://darmixista.dev',

  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      // Español en "/", inglés en "/en/"
      prefixDefaultLocale: false,
    },
  },

  integrations: [
    react(),
    // Genera sitemap-index.xml con las versiones de idioma enlazadas entre sí (hreflang)
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: { es: 'es-MX', en: 'en-US' },
      },
      filter: (page) => !page.includes('/404'),
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
    // Three.js pesa ~700 kB minificado; se carga como isla aparte, no bloquea el HTML
    build: { chunkSizeWarningLimit: 1200 },
  },
});
