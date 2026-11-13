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
  release: { version: '2.0.1', apk: 'DarmixNight-v2.0.1.apk', sizeMb: 10.8, date: '2026-11-12' },
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

export interface Moment {
  when: string;
  text: string;
}

export interface DarmixNightContent {
  meta: PageMeta;
  nav: { how: string; emergency: string; help: string };
  hero: { title: string; lead: string; howTo: string };
  how: {
    title: string;
    sleep: { label: string; time: string; ampm: string };
    wake: { label: string; time: string; ampm: string };
    example: string;
    moments: Moment[];
    lockAlt: string;
  };
  emergency: {
    title: string;
    lead: string;
    steps: string[];
    rule: string;
    knob: string;
    unit: string;
  };
  final: { title: string; lead: string; howTo: string };
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
      title: 'Apaga la pantalla<br> <em>Enciende el descanso</em>',
      lead: 'Eliges a qué hora te duermes y a qué hora despiertas. Si en ese horario abres una app, DarmixNight la tapa hasta la mañana.',
      howTo: '¿Cómo se instala?',
    },
    how: {
      title: 'Tú eliges <em>el horario</em>',
      sleep: { label: 'Te duermes', time: '11:30', ampm: 'pm' },
      wake: { label: 'Despiertas', time: '5:00', ampm: 'am' },
      example: 'Es el horario que trae de inicio. Lo cambias cuando quieras.',
      moments: [
        { when: 'Antes', text: 'Usas tu teléfono como siempre. La app solo espera.' },
        { when: 'Durante', text: 'Cualquier app que abras queda tapada por una pantalla que te dice cuánto falta para despertar.' },
        { when: 'Siempre', text: 'Llamadas, mensajes, contactos, cámara y ajustes funcionan sin bloqueo.' },
      ],
      lockAlt: 'Pantalla de descanso de DarmixNight: la habitación a oscuras, la hora y el tiempo que falta para despertar',
    },
    emergency: {
      title: '¿Y si de verdad <em>lo necesitas?</em>',
      lead: 'Puedes desbloquearlo un rato, pero cuesta trabajo a propósito, para que no lo hagas por impulso.',
      steps: ['Mantienes presionado el botón 20 segundos', 'Escribes una frase para confirmar', 'Eliges con la perilla de 1 a 30 minutos'],
      rule: 'Entre las 11 de la noche y las 5 de la mañana no se puede desbloquear. Las llamadas y los mensajes siguen funcionando.',
      knob: 'Minutos de desbloqueo',
      unit: 'min',
    },
    final: {
      title: '<em>Buenas noches</em>',
      lead: 'Gratis, sin anuncios y sin crear cuenta. Tu horario se guarda solo en tu teléfono.',
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
          a: 'Puedes desbloquearlo de 1 a 30 minutos: mantienes presionado 20 segundos y escribes una frase. Entre las 11 pm y las 5 am no se puede, pero llamadas y mensajes siguen funcionando.',
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
      title: 'Turn off the screen<br> <em>Turn on your rest</em>',
      lead: 'You choose when you go to sleep and when you wake up. If you open an app during that time, DarmixNight covers it until morning.',
      howTo: 'How do I install it?',
    },
    how: {
      title: 'You choose <em>the schedule</em>',
      sleep: { label: 'You sleep', time: '11:30', ampm: 'pm' },
      wake: { label: 'You wake up', time: '5:00', ampm: 'am' },
      example: 'That’s the schedule it starts with. Change it whenever you want.',
      moments: [
        { when: 'Before', text: 'You use your phone as usual. The app just waits.' },
        { when: 'During', text: 'Any app you open is covered by a screen that tells you how long until you wake up.' },
        { when: 'Always', text: 'Calls, messages, contacts, camera and settings work without being locked.' },
      ],
      lockAlt: 'DarmixNight rest screen: the dark room, the time and how long until you wake up',
    },
    emergency: {
      title: 'What if you <em>really need it?</em>',
      lead: 'You can unlock it for a while, but it takes effort on purpose, so you don’t do it on impulse.',
      steps: ['You hold the button for 20 seconds', 'You type a phrase to confirm', 'You pick 1 to 30 minutes with the knob'],
      rule: 'Between 11 at night and 5 in the morning you can’t unlock it. Calls and messages keep working.',
      knob: 'Unlock minutes',
      unit: 'min',
    },
    final: {
      title: '<em>Good night</em>',
      lead: 'Free, no ads and no sign-up. Your schedule is saved only on your phone.',
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
          a: 'You can unlock it for 1 to 30 minutes: hold for 20 seconds and type a phrase. Between 11 pm and 5 am you can’t, but calls and messages keep working.',
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
