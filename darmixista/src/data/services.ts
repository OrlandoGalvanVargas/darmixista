import type { Lang } from '../i18n/ui';

export type ServiceIconName = 'web' | 'backend' | 'mobile' | 'automation';

export interface Service {
  id: string;
  icon: ServiceIconName;
  title: Record<Lang, string>;
  description: Record<Lang, string>;
  medium: Record<Lang, string>;
  short: Record<Lang, string>;
}

export const SERVICES: Service[] = [
  {
    id: 'web',
    icon: 'web',
    title: { es: 'Aplicaciones web', en: 'Web applications' },
    description: {
      es: 'Diseño y desarrollo de sitios web, paneles de administración, plataformas y sistemas con funciones específicas para cada proyecto.',
      en: 'Design and development of websites, admin panels, platforms and systems with functions specific to each project.',
    },
    medium: {
      es: 'Sitios web, paneles de administración, plataformas y sistemas con funciones específicas para cada proyecto.',
      en: 'Websites, admin panels, platforms and systems with functions specific to each project.',
    },
    short: { es: 'Sitios, paneles y plataformas web', en: 'Websites, panels and platforms' },
  },
  {
    id: 'backend',
    icon: 'backend',
    title: { es: 'Backend y APIs', en: 'Backend and APIs' },
    description: {
      es: 'Desarrollo de servicios, APIs y bases de datos para gestionar información, conectar aplicaciones y procesar solicitudes.',
      en: 'Development of services, APIs and databases to manage information, connect applications and process requests.',
    },
    medium: {
      es: 'Servicios, APIs y bases de datos para gestionar información, conectar aplicaciones y procesar solicitudes.',
      en: 'Services, APIs and databases to manage information, connect applications and process requests.',
    },
    short: { es: 'Servicios, APIs y bases de datos', en: 'Services, APIs and databases' },
  },
  {
    id: 'mobile',
    icon: 'mobile',
    title: { es: 'Apps Android', en: 'Android apps' },
    description: {
      es: 'Desarrollo de aplicaciones nativas para Android con funciones, interfaces e integraciones adaptadas a las características de cada proyecto.',
      en: 'Development of native Android applications with functions, interfaces and integrations adapted to the characteristics of each project.',
    },
    medium: {
      es: 'Aplicaciones nativas para Android con funciones, interfaces e integraciones adaptadas a cada proyecto.',
      en: 'Native Android applications with functions, interfaces and integrations adapted to each project.',
    },
    short: { es: 'Apps nativas para Android', en: 'Native Android apps' },
  },
  {
    id: 'automation',
    icon: 'automation',
    title: { es: 'Automatización de procesos', en: 'Process automation' },
    description: {
      es: 'Desarrollo de procesos automatizados para realizar tareas repetitivas, procesar información, generar reportes y conectar distintas herramientas.',
      en: 'Development of automated processes to carry out repetitive tasks, process information, generate reports and connect different tools.',
    },
    medium: {
      es: 'Procesos automatizados para realizar tareas repetitivas, procesar información, generar reportes y conectar herramientas.',
      en: 'Automated processes to carry out repetitive tasks, process information, generate reports and connect tools.',
    },
    short: { es: 'Tareas repetitivas que se ejecutan solas', en: 'Repetitive tasks that run on their own' },
  },
];
