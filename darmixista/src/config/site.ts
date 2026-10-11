import type { Lang } from '../i18n/ui';

/**
 * Datos personales y enlaces. Edita aquí; ningún componente tiene estos valores escritos a mano.
 */
export const SITE = {
  brand: 'Darmixista',
  person: {
    firstName: 'Orlando',
    lastName: 'Galvan Vargas',
  },
  socials: [
    { id: 'github', label: 'GitHub', handle: 'OrlandoGalvanVargas', href: 'https://github.com/OrlandoGalvanVargas' },
    { id: 'linkedin', label: 'LinkedIn', handle: 'in/orlandogalvan-dev', href: 'https://www.linkedin.com/in/orlandogalvan-dev' },
  ],
  contact: {
    // Se muestra en el sitio y es el respaldo del formulario
    email: 'orlando.gal.var.05@gmail.com',
    /** Muestra el indicador "Disponible para proyectos" */
    available: true,
    /** Zona horaria del reloj en vivo de la sección Contacto */
    timeZone: 'America/Mexico_City',
    city: { es: 'Ciudad de México', en: 'Mexico City' } satisfies Record<Lang, string>,
  },
  // Coloca los PDF en /public/cv/ con estos nombres
  cv: {
    es: '/cv/orlando-galvan-cv-es.pdf',
    en: '/cv/orlando-galvan-cv-en.pdf',
  } satisfies Record<Lang, string>,
} as const;

/**
 * Clave pública de Web3Forms (https://web3forms.com). Va en el archivo .env:
 *   PUBLIC_WEB3FORMS_KEY=tu-clave
 * Si no está configurada, el formulario abre el correo del visitante con el mensaje redactado.
 */
export const WEB3FORMS_KEY: string = import.meta.env.PUBLIC_WEB3FORMS_KEY ?? '';
