import type { Lang } from '../../i18n/ui';
import type { AppMeta, CorePalette, InstallContent, PageMeta, Skin } from '../../landing/types';

type NightPalette = CorePalette & {
  raised: string;
  clay: string;
  amber: string;
  flame: string;
  bronze: string;
};

const A = '/apps/darmixnight';

export const app: AppMeta = {
  slug: 'darmixnight',
  name: 'DarmixNight',
  repo: { owner: 'OrlandoGalvanVargas', name: 'darmixnight' },
  release: { version: '2.0', apk: 'DarmixNight-v2.0.apk', sizeMb: 10.3, date: '2026-11-11' },
  minAndroid: '8.0',
  icon: `${A}/icon.webp`,
  icon192: `${A}/icon-192.png`,
  icon32: `${A}/favicon-32.png`,
  apple: `${A}/apple-touch-icon.png`,
  og: { es: `${A}/og-es.png`, en: `${A}/og-en.png` },
  schemaCategory: 'LifestyleApplication',
};

const brasa: NightPalette = {
  bg: '#0C0604',
  surface: '#150B07',
  surfaceVariant: '#1E110B',
  ink: '#2A1810',
  shadow: '#090403',
  text: '#F3E6D8',
  muted: '#B58F79',
  outline: '#3A2418',
  primary: '#FF8A4C',
  onPrimary: '#2A1006',
  primaryContainer: '#3A160A',
  onPrimaryContainer: '#FFB067',
  accent: '#FFB067',
  onAccent: '#2A1006',
  accentContainer: '#3A160A',
  onAccentContainer: '#FFD596',
  raised: '#1E110B',
  clay: '#C79A7E',
  amber: '#FFB067',
  flame: '#FFD596',
  bronze: '#5E3E2C',
};

export const skins: Skin<NightPalette>[] = [{ id: 'brasa', light: brasa, dark: brasa, image: '', imageSmall: '', glow: '255 138 76' }];

export const scene = {
  lit: `${A}/scene/night-room-lit.webp`,
  dark: `${A}/scene/night-room-dark.webp`,
  window: `${A}/scene/settings-window-lit.webp`,
  knob: `${A}/scene/emergency-knob.webp`,
  lock: `${A}/shots/bloqueo.webp`,
};

export interface DarmixNightContent {
  meta: PageMeta;
  nav: { how: string; emergency: string; help: string };
  hero: { kicker: string; title: string; lead: string; howTo: string; lampOff: string; lampOn: string };
  how: { kicker: string; title: string; lead: string; allowed: string[]; lockAlt: string };
  emergency: {
    kicker: string;
    title: string;
    steps: Array<{ value: string; text: string }>;
    night: string;
    knob: string;
    unit: string;
  };
  final: { kicker: string; title: string; lead: string; howTo: string };
  sheet: { title: string; tabs: { install: string; permissions: string; faq: string } };
  install: InstallContent;
}

const guide = 'https://github.com/OrlandoGalvanVargas/darmixnight#instalación';

export const content: Record<Lang, DarmixNightContent> = {
  es: {
    meta: {
      title: 'DarmixNight — Bloquea tu teléfono a la hora de dormir, para Android',
      description:
        'App gratis para Android que bloquea tu teléfono durante tu horario de descanso: cualquier app que abras queda cubierta hasta la mañana. Llamadas y mensajes siguen funcionando. Sin cuentas ni anuncios.',
      ogAlt: 'DarmixNight: una habitación de noche con la lámpara encendida y el lema Apaga la pantalla, enciende el descanso',
      category: 'Sueño y bienestar digital',
    },
    nav: { how: 'Cómo funciona', emergency: 'Emergencias', help: 'Antes de instalar' },
    hero: {
      kicker: 'Android · Bloqueo nocturno',
      title: 'Apaga la pantalla<br> <em>Enciende el descanso</em>',
      lead: 'A la hora que elijas, cualquier app que abras queda cubierta hasta la mañana. Para que el «solo un video más» deje de robarte horas de sueño.',
      howTo: '¿Cómo se instala?',
      lampOff: 'Apagar la lámpara',
      lampOn: 'Encender la lámpara',
    },
    how: {
      kicker: 'Cómo funciona',
      title: 'La habitación <em>ya duerme</em>',
      lead: 'Si abres una app durante tu horario, una pantalla de descanso la cubre. Se activa sola, aunque reinicies el teléfono.',
      allowed: ['Llamadas', 'Mensajes', 'Contactos', 'Cámara', 'Ajustes'],
      lockAlt: 'Pantalla de descanso de DarmixNight: la habitación a oscuras, la hora y el tiempo que falta para despertar',
    },
    emergency: {
      kicker: 'Emergencias',
      title: 'Una salida,<br> <em>pero no fácil</em>',
      steps: [
        { value: '20 s', text: 'Mantienes presionado el botón' },
        { value: '1 frase', text: 'La escribes para confirmar' },
        { value: '1–30', text: 'Minutos que eliges con la perilla' },
      ],
      night: 'De noche, no hay salida.',
      knob: 'Minutos de salida',
      unit: 'min',
    },
    final: {
      kicker: 'Gratis · Sin cuentas · Sin anuncios',
      title: '<em>Buenas noches</em>',
      lead: 'Tu horario y tu uso nunca salen del teléfono.',
      howTo: '¿Cómo se instala?',
    },
    sheet: { title: 'Antes de instalar', tabs: { install: 'Instalar', permissions: 'Permisos', faq: 'Preguntas' } },
    install: {
      steps: [
        { title: 'Descarga el APK', body: 'Hazlo desde tu teléfono Android.' },
        {
          title: 'Ábrelo',
          body: 'Desde la notificación de la descarga o tu carpeta de descargas. Si Android te pregunta, permite instalar desde esta fuente.',
        },
        { title: 'Activa los permisos', body: 'La app te muestra uno a la vez y avanza sola cuando lo activas.' },
        { title: 'Elige tu horario', body: 'En la pestaña Noche. Y listo.' },
      ],
      permissionsIntro: 'Cada permiso aparece como un objeto sobre el buró, con su explicación. La app solo te pide los que tu teléfono necesita.',
      permissions: [
        { icon: 'accessibility', title: 'Servicio de accesibilidad', why: 'Para saber qué app se abre en tu horario. No lee lo que escribes ni lo que hay en pantalla' },
        { icon: 'layers', title: 'Mostrar sobre otras apps', why: 'Para dibujar la pantalla de descanso encima de cualquier app' },
        { icon: 'bell', title: 'Notificaciones', why: 'Para el aviso que mantiene el servicio activo toda la noche' },
        { icon: 'battery', title: 'Sin restricciones de batería', why: 'Para que Android no detenga la app de madrugada' },
        { icon: 'alarm', title: 'Alarmas exactas', why: 'Para empezar y terminar el bloqueo en el minuto que elegiste' },
        { icon: 'refresh', title: 'Inicio al arrancar', why: 'Para volver a activarse sola después de reiniciar' },
        { icon: 'download', title: 'Internet e instalar apps', why: 'Solo para buscar y descargar actualizaciones' },
      ],
      permissionsNote:
        'En Android 13 o superior, Android pide autorizar los ajustes restringidos antes de activar la accesibilidad. La app te guía en los dos pasos.',
      permissionsGuide: { label: 'Ver la guía completa', href: guide },
      faq: [
        { q: '¿Cuesta algo?', a: 'No. Es gratis, sin anuncios y sin compras dentro de la app.' },
        { q: '¿Puedo recibir llamadas y mensajes?', a: 'Sí. Llamadas, mensajes, contactos, cámara y ajustes nunca se bloquean.' },
        {
          q: '¿Y si tengo una emergencia?',
          a: 'De día puedes salir de 1 a 30 minutos: mantienes presionado 20 segundos y escribes una frase. De noche no hay salida.',
        },
        {
          q: '¿Puedo tomarme una noche libre?',
          a: 'Sí. Pausa el servicio desde Ajustes con la palanca. Solo que no se puede pausar en pleno descanso.',
        },
        { q: '¿Funciona si reinicio el teléfono?', a: 'Sí. Vuelve a activarse sola, incluso con la pantalla apagada.' },
        {
          q: '¿Tengo un Xiaomi, Redmi o POCO?',
          a: 'Activa el inicio automático para DarmixNight (la app te abre la pantalla correcta) y fíjala con el candado en Recientes, para que «Cerrar todo» no la detenga.',
        },
        {
          q: '¿Por qué no está en Google Play?',
          a: 'Es un proyecto personal y se publica directo como APK. Las actualizaciones te llegan desde la misma app.',
        },
        {
          q: '¿Es seguro instalar un APK?',
          a: 'Sí, si lo descargas de aquí. El botón baja el archivo directo de las versiones oficiales en GitHub.',
        },
        {
          q: '¿La descarga se quedó en 100%?',
          a: 'Entra a Chrome, toca ⋮ y luego Descargas. Muchas veces el APK ya está ahí completo y solo tienes que abrirlo. Si no aparece, toca Descargar de nuevo.',
        },
        { q: '¿Funciona en iPhone?', a: 'No, solo en Android 8.0 o superior.' },
      ],
    },
  },

  en: {
    meta: {
      title: 'DarmixNight — Lock your phone at bedtime, for Android',
      description:
        'A free Android app that locks your phone during your sleep schedule: any app you open stays covered until morning. Calls and messages keep working. No accounts and no ads.',
      ogAlt: 'DarmixNight: a room at night with the lamp on and the tagline Turn off the screen, turn on your rest',
      category: 'Sleep and digital wellbeing',
    },
    nav: { how: 'How it works', emergency: 'Emergencies', help: 'Before installing' },
    hero: {
      kicker: 'Android · Bedtime lock',
      title: 'Turn off the screen<br> <em>Turn on your rest</em>',
      lead: 'At the time you choose, any app you open stays covered until morning. So “just one more video” stops stealing your sleep.',
      howTo: 'How do I install it?',
      lampOff: 'Turn off the lamp',
      lampOn: 'Turn on the lamp',
    },
    how: {
      kicker: 'How it works',
      title: 'The room is <em>already asleep</em>',
      lead: 'If you open an app during your schedule, a rest screen covers it. It turns on by itself, even after a restart.',
      allowed: ['Calls', 'Messages', 'Contacts', 'Camera', 'Settings'],
      lockAlt: 'DarmixNight rest screen: the dark room, the time and how long until you wake up',
    },
    emergency: {
      kicker: 'Emergencies',
      title: 'A way out,<br> <em>but not an easy one</em>',
      steps: [
        { value: '20 s', text: 'You hold the button down' },
        { value: '1 phrase', text: 'You type it to confirm' },
        { value: '1–30', text: 'Minutes you pick with the knob' },
      ],
      night: 'At night, there’s no way out.',
      knob: 'Minutes out',
      unit: 'min',
    },
    final: {
      kicker: 'Free · No accounts · No ads',
      title: '<em>Good night</em>',
      lead: 'Your schedule and your usage never leave your phone.',
      howTo: 'How do I install it?',
    },
    sheet: { title: 'Before installing', tabs: { install: 'Install', permissions: 'Permissions', faq: 'FAQ' } },
    install: {
      steps: [
        { title: 'Download the APK', body: 'Do it from your Android phone.' },
        {
          title: 'Open it',
          body: 'From the download notification or your downloads folder. If Android asks, allow installs from this source.',
        },
        { title: 'Turn on the permissions', body: 'The app shows them one at a time and moves on by itself when you turn one on.' },
        { title: 'Pick your schedule', body: 'In the Night tab. And you’re done.' },
      ],
      permissionsIntro: 'Each permission shows up as an object on the nightstand, with its explanation. The app only asks for the ones your phone needs.',
      permissions: [
        { icon: 'accessibility', title: 'Accessibility service', why: 'To know which app opens during your schedule. It doesn’t read what you type or what’s on screen' },
        { icon: 'layers', title: 'Display over other apps', why: 'To draw the rest screen on top of any app' },
        { icon: 'bell', title: 'Notifications', why: 'For the notice that keeps the service running all night' },
        { icon: 'battery', title: 'Unrestricted battery', why: 'So Android doesn’t stop the app in the middle of the night' },
        { icon: 'alarm', title: 'Exact alarms', why: 'To start and end the lock at the exact minute you chose' },
        { icon: 'refresh', title: 'Start on boot', why: 'To turn itself back on after a restart' },
        { icon: 'download', title: 'Internet and install apps', why: 'Only to check for and download updates' },
      ],
      permissionsNote:
        'On Android 13 or later, Android asks you to allow restricted settings before turning on accessibility. The app guides you through both steps.',
      permissionsGuide: { label: 'See the full guide', href: guide },
      faq: [
        { q: 'Does it cost anything?', a: 'No. It’s free, with no ads and no in-app purchases.' },
        { q: 'Can I still get calls and messages?', a: 'Yes. Calls, messages, contacts, camera and settings are never blocked.' },
        {
          q: 'What if I have an emergency?',
          a: 'During the day you can get out for 1 to 30 minutes: hold for 20 seconds and type a phrase. At night there’s no way out.',
        },
        {
          q: 'Can I take a night off?',
          a: 'Yes. Pause the service from Settings with the lever. You just can’t pause it in the middle of your rest.',
        },
        { q: 'Does it work after a restart?', a: 'Yes. It turns itself back on, even with the screen off.' },
        {
          q: 'Do I have a Xiaomi, Redmi or POCO?',
          a: 'Turn on autostart for DarmixNight (the app opens the right screen) and lock it in Recents, so “Clear all” doesn’t stop it.',
        },
        {
          q: 'Why isn’t it on Google Play?',
          a: 'It’s a personal project published directly as an APK. Updates come from the app itself.',
        },
        {
          q: 'Is it safe to install an APK?',
          a: 'Yes, if you download it here. The button gets the file straight from the official releases on GitHub.',
        },
        {
          q: 'Did the download get stuck at 100%?',
          a: 'Open Chrome, tap ⋮ and then Downloads. Most of the time the APK is already there and you just need to open it. If it’s not, tap Download again.',
        },
        { q: 'Does it work on iPhone?', a: 'No, only on Android 8.0 or later.' },
      ],
    },
  },
};
