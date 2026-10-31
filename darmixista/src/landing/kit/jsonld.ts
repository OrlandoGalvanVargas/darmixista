import { getAbsoluteLocaleUrl } from 'astro:i18n';
import { SITE } from '../../config/site';
import type { Lang } from '../../i18n/ui';
import type { AppMeta, PageMeta } from '../types';

interface Options {
  app: AppMeta;
  lang: Lang;
  meta: PageMeta;
  site: URL;
  screenshot?: string;
}

export function appJsonLd({ app, lang, meta, site, screenshot }: Options): Record<string, unknown> {
  const pageUrl = getAbsoluteLocaleUrl(lang, `${app.slug}/`);
  const appId = `${getAbsoluteLocaleUrl('es', `${app.slug}/`)}#app`;
  const home = getAbsoluteLocaleUrl('es', '');
  const personId = `${home}#person`;
  const repo = `https://github.com/${app.repo.owner}/${app.repo.name}`;
  const { release } = app;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': appId,
        name: app.name,
        description: meta.description,
        url: pageUrl,
        operatingSystem: `Android ${app.minAndroid}+`,
        applicationCategory: app.schemaCategory,
        applicationSubCategory: meta.category,
        softwareVersion: release.version,
        datePublished: release.date,
        ...(release.sizeMb ? { fileSize: `${release.sizeMb}MB` } : {}),
        downloadUrl: release.apk ? `${repo}/releases/download/v${release.version}/${release.apk}` : `${repo}/releases/latest`,
        installUrl: pageUrl,
        image: new URL(app.icon192, site).href,
        ...(screenshot ? { screenshot: new URL(screenshot, site).href } : {}),
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        author: { '@id': personId },
      },
      {
        '@type': 'Person',
        '@id': personId,
        name: `${SITE.person.firstName} ${SITE.person.lastName}`,
        alternateName: SITE.brand,
        url: home,
        sameAs: SITE.socials.map((s) => s.href),
      },
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#page`,
        url: pageUrl,
        name: meta.title,
        inLanguage: lang === 'es' ? 'es-MX' : 'en-US',
        about: { '@id': appId },
        isPartOf: { '@type': 'WebSite', name: SITE.brand, url: home },
      },
    ],
  };
}
