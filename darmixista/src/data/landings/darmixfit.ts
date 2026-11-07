import type { Lang } from '../../i18n/ui';
import type { AppMeta, CorePalette, InstallContent, PageMeta, Skin } from '../../landing/types';

type FitPalette = CorePalette & {
  bright: string;
  mid: string;
  deep: string;
  dim: string;
};

const A = '/apps/darmixfit';

export const app: AppMeta = {
  slug: 'darmixfit',
  name: 'DarmixFit',
  repo: { owner: 'OrlandoGalvanVargas', name: 'darmixfit' },
  release: { version: '2.0', apk: 'DarmixFit-v2.0.apk', sizeMb: 23.4, date: '2026-11-07' },
  minAndroid: '8.0',
  icon: `${A}/icon.webp`,
  icon192: `${A}/icon-192.png`,
  icon32: `${A}/favicon-32.png`,
  apple: `${A}/apple-touch-icon.png`,
  og: { es: `${A}/og-es.png`, en: `${A}/og-en.png` },
  schemaCategory: 'HealthApplication',
};

interface Tones {
  main: string;
  bright: string;
  mid: string;
  deep: string;
  ink: string;
  dim: string;
  mist: string;
  glow: string;
}

const dark = (t: Tones): FitPalette => ({
  bg: '#0E100D',
  surface: '#141612',
  surfaceVariant: '#1A1D17',
  ink: '#2A2F26',
  shadow: '#090A08',
  text: '#F4F6F1',
  muted: '#9AA095',
  outline: '#3A4035',
  primary: t.main,
  onPrimary: t.ink,
  primaryContainer: t.dim,
  onPrimaryContainer: t.main,
  accent: t.main,
  onAccent: t.ink,
  accentContainer: t.dim,
  onAccentContainer: t.bright,
  bright: t.bright,
  mid: t.mid,
  deep: t.deep,
  dim: t.dim,
});

const light = (t: Tones): FitPalette => ({
  bg: '#F3F2EC',
  surface: '#FFFFFF',
  surfaceVariant: '#EAE9E1',
  ink: '#D5D4CA',
  shadow: '#E0DFD6',
  text: '#151713',
  muted: '#51554C',
  outline: '#BEBDB2',
  primary: t.deep,
  onPrimary: '#FFFFFF',
  primaryContainer: t.mist,
  onPrimaryContainer: t.deep,
  accent: t.main,
  onAccent: t.ink,
  accentContainer: t.mist,
  onAccentContainer: t.deep,
  bright: t.bright,
  mid: t.mid,
  deep: t.deep,
  dim: t.dim,
});

const tones: Record<string, Tones> = {
  volt: { main: '#C6FF3D', bright: '#DBFF7A', mid: '#7FB51A', deep: '#4E7A00', ink: '#223400', dim: '#1C2408', mist: '#E6FBB8', glow: '198 255 61' },
  plasma: { main: '#3DD9FF', bright: '#7AE8FF', mid: '#1A8EB5', deep: '#005A7A', ink: '#002734', dim: '#081F24', mist: '#B8EDFB', glow: '61 217 255' },
  magma: { main: '#FF9D3D', bright: '#FFB97A', mid: '#B56F1A', deep: '#7A4400', ink: '#341C00', dim: '#241608', mist: '#FBDAB8', glow: '255 157 61' },
  ion: { main: '#BA6EFF', bright: '#CE9BFF', mid: '#9B38E2', deep: '#48007A', ink: '#1E0034', dim: '#170824', mist: '#E5CAFC', glow: '186 110 255' },
};

export const skins: Skin<FitPalette>[] = Object.entries(tones).map(([id, t]) => ({
  id,
  light: light(t),
  dark: dark(t),
  image: '',
  imageSmall: '',
  glow: t.glow,
}));

export const swatches: Record<string, string> = Object.fromEntries(Object.entries(tones).map(([id, t]) => [id, t.main]));

export interface Row {
  title: string;
  body: string;
}

export interface Stat {
  value: number;
  label: string;
  body: string;
}

export interface DarmixFitContent {
  meta: PageMeta;
  nav: { how: string; programs: string; help: string };
  reactor: { of: string; done: string; charge: string; tiltTouch: string; tiltMouse: string };
  hero: { kicker: string; title: string; lead: string; howTo: string; next: string };
  how: { kicker: string; title: string; rows: Row[]; video: string; resting: string; set: string };
  programs: {
    kicker: string;
    title: string;
    stats: Stat[];
    color: { title: string; body: string; names: Record<string, string> };
    list: string[];
  };
  final: { kicker: string; title: string; lead: string; howTo: string };
  rail: string[];
  sheet: { title: string; tabs: { install: string; permissions: string; faq: string } };
  install: InstallContent;
}

const guide = 'https://github.com/OrlandoGalvanVargas/darmixfit#-permisos';

export const content: Record<Lang, DarmixFitContent> = {
  es: {
    meta: {
      title: 'DarmixFit — Tu rutina de fuerza, serie por serie, para Android',
      description:
        'App gratis para Android para entrenar fuerza: ves qué toca, completas la serie y el descanso arranca solo, aunque el teléfono esté bloqueado. 7 programas, 41 ejercicios animados y sin anuncios.',
      ogAlt: 'DarmixFit: tu rutina, serie por serie, junto al reactor cargado',
      category: 'Entrenamiento de fuerza',
    },
    nav: { how: 'Cómo funciona', programs: 'Programas', help: 'Antes de instalar' },
    reactor: { of: 'de 3 series', done: 'Completo', charge: 'Carga', tiltTouch: 'Inclina tu teléfono', tiltMouse: 'Mueve el cursor' },
    hero: {
      kicker: 'Android · Entrenamiento de fuerza',
      title: 'Tu rutina,<br> <em>serie por serie</em>',
      lead: 'Ves qué toca, completas la serie y el descanso arranca solo. Cuando suena la campana, ya sabes qué sigue.',
      howTo: '¿Cómo se instala?',
      next: 'Siguiente serie',
    },
    how: {
      kicker: 'Serie 02 · Cómo funciona',
      title: 'El descanso<br> <em>no falla</em>',
      rows: [
        { title: 'Completas la serie', body: 'Con un toque, incluso desde la pantalla de bloqueo' },
        { title: 'El descanso arranca solo', body: 'Con alarma exacta de respaldo, aunque estés en otra app' },
        { title: 'Suena la campana', body: 'Un sonido propio. Si usas audífonos, solo suena en ellos' },
      ],
      video: 'Completar una serie en DarmixFit y ver el descanso corriendo',
      resting: 'Recuperando',
      set: 'Serie 3/3',
    },
    programs: {
      kicker: 'Serie 03 · Programas',
      title: 'Hazla <em>tuya</em>',
      stats: [
        { value: 7, label: 'Programas', body: 'De 2 a 5 días, todos editables' },
        { value: 41, label: 'Ejercicios animados', body: 'O pon tu propia foto o GIF' },
        { value: 0, label: 'Cuentas y anuncios', body: 'Todo se queda en tu teléfono' },
      ],
      color: {
        title: 'Elige tu color',
        body: 'Toca uno y la página cambia, igual que en la app',
        names: { volt: 'Volt', plasma: 'Plasma', magma: 'Magma', ion: 'Ion' },
      },
      list: ['Hipertrofia 5 días', 'Cuerpo completo 3 días', 'Torso · Pierna 4 días', 'Fuerza 3 días', 'Calistenia 4 días', 'Circuitos 4 días', 'Express 2 días'],
    },
    final: {
      kicker: 'Día completo',
      title: 'Enciende <em>el reactor</em>',
      lead: 'Gratis, sin cuentas ni anuncios. Tus entrenamientos se quedan en tu teléfono.',
      howTo: '¿Cómo se instala?',
    },
    rail: ['Inicio', 'Cómo funciona', 'Programas', 'Descargar'],
    sheet: { title: 'Antes de instalar', tabs: { install: 'Instalar', permissions: 'Permisos', faq: 'Preguntas' } },
    install: {
      steps: [
        { title: 'Descarga el APK', body: 'Hazlo desde tu teléfono Android.' },
        {
          title: 'Ábrelo',
          body: 'Desde la notificación de la descarga o tu carpeta de descargas. Si Android te pregunta, permite instalar desde esta fuente.',
        },
        { title: 'Sigue la configuración guiada', body: 'Detecta lo que ya activaste y te dice qué tocar. Toma menos de un minuto.' },
        { title: 'Elige tu programa', body: 'Y a entrenar.' },
      ],
      permissionsIntro:
        'Todos sirven para lo mismo: que el descanso suene a tiempo. La app te guía en cada uno y detecta sola cuáles ya están activos.',
      permissions: [
        { icon: 'bell', title: 'Notificaciones', why: 'Para la cuenta regresiva, el aviso de fin de descanso y la serie en la pantalla de bloqueo', badge: 'Necesario' },
        { icon: 'alarm', title: 'Alarmas exactas', why: 'Para que el aviso llegue justo en 0:00, aunque el teléfono esté en reposo', badge: 'Necesario' },
        { icon: 'battery', title: 'Batería sin restricciones', why: 'Para que Android no pause el temporizador' },
        { icon: 'bolt', title: 'Segundo plano de tu marca', why: 'Solo en marcas que cierran apps por su cuenta, como Xiaomi, Samsung, Huawei, OPPO o vivo' },
        { icon: 'download', title: 'Instalar apps', why: 'Solo se pide cuando instalas una actualización' },
      ],
      permissionsNote: 'Si tu marca cierra apps por su cuenta, el botón de ese paso te lleva directo al ajuste correcto.',
      permissionsGuide: { label: 'Ver la guía por marca', href: guide },
      faq: [
        { q: '¿Cuesta algo?', a: 'No. Es gratis, sin anuncios y sin compras dentro de la app.' },
        { q: '¿Necesito crear una cuenta?', a: 'No. Todo se guarda en tu teléfono, sin cuentas ni servidores.' },
        {
          q: '¿Funciona con el teléfono bloqueado?',
          a: 'Sí. El descanso sigue corriendo y la serie aparece en la pantalla de bloqueo, así que la completas sin desbloquear.',
        },
        { q: '¿Necesito internet?', a: 'Solo para buscar actualizaciones. Para entrenar, no.' },
        { q: '¿Pierdo mi historial si cambio de programa?', a: 'No. Cambiar de programa no borra nada.' },
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
      title: 'DarmixFit — Your strength routine, set by set, for Android',
      description:
        'A free Android app for strength training: see what’s next, finish the set and rest starts on its own, even with the phone locked. 7 programs, 41 animated exercises and no ads.',
      ogAlt: 'DarmixFit: your routine, set by set, next to the charged reactor',
      category: 'Strength training',
    },
    nav: { how: 'How it works', programs: 'Programs', help: 'Before installing' },
    reactor: { of: 'of 3 sets', done: 'Complete', charge: 'Charge', tiltTouch: 'Tilt your phone', tiltMouse: 'Move your cursor' },
    hero: {
      kicker: 'Android · Strength training',
      title: 'Your routine,<br> <em>set by set</em>',
      lead: 'See what’s up, finish the set and the rest timer starts by itself. When the bell rings, you know what comes next.',
      howTo: 'How do I install it?',
      next: 'Next set',
    },
    how: {
      kicker: 'Set 02 · How it works',
      title: 'Rest that<br> <em>never misses</em>',
      rows: [
        { title: 'You finish the set', body: 'One tap, even from the lock screen' },
        { title: 'Rest starts on its own', body: 'With an exact backup alarm, even if you’re in another app' },
        { title: 'The bell rings', body: 'A sound of its own. With headphones, it only plays in them' },
      ],
      video: 'Finishing a set in DarmixFit and watching the rest timer run',
      resting: 'Recovering',
      set: 'Set 3/3',
    },
    programs: {
      kicker: 'Set 03 · Programs',
      title: 'Make it <em>yours</em>',
      stats: [
        { value: 7, label: 'Programs', body: 'From 2 to 5 days, all editable' },
        { value: 41, label: 'Animated exercises', body: 'Or add your own photo or GIF' },
        { value: 0, label: 'Accounts and ads', body: 'Everything stays on your phone' },
      ],
      color: {
        title: 'Pick your color',
        body: 'Tap one and the page changes, just like in the app',
        names: { volt: 'Volt', plasma: 'Plasma', magma: 'Magma', ion: 'Ion' },
      },
      list: ['Hypertrophy 5 days', 'Full body 3 days', 'Upper · Lower 4 days', 'Strength 3 days', 'Calisthenics 4 days', 'Circuits 4 days', 'Express 2 days'],
    },
    final: {
      kicker: 'Day complete',
      title: 'Power up <em>the reactor</em>',
      lead: 'Free, no accounts and no ads. Your workouts stay on your phone.',
      howTo: 'How do I install it?',
    },
    rail: ['Start', 'How it works', 'Programs', 'Download'],
    sheet: { title: 'Before installing', tabs: { install: 'Install', permissions: 'Permissions', faq: 'FAQ' } },
    install: {
      steps: [
        { title: 'Download the APK', body: 'Do it from your Android phone.' },
        {
          title: 'Open it',
          body: 'From the download notification or your downloads folder. If Android asks, allow installs from this source.',
        },
        { title: 'Follow the guided setup', body: 'It detects what you already turned on and tells you what to tap. It takes less than a minute.' },
        { title: 'Pick your program', body: 'And start training.' },
      ],
      permissionsIntro:
        'They all do the same job: making sure rest ends on time. The app guides you through each one and detects which ones are already on.',
      permissions: [
        { icon: 'bell', title: 'Notifications', why: 'For the countdown, the end-of-rest alert and the set on the lock screen', badge: 'Required' },
        { icon: 'alarm', title: 'Exact alarms', why: 'So the alert arrives right at 0:00, even when the phone is idle', badge: 'Required' },
        { icon: 'battery', title: 'Unrestricted battery', why: 'So Android doesn’t pause the timer' },
        { icon: 'bolt', title: 'Your brand’s background setting', why: 'Only on brands that close apps on their own, like Xiaomi, Samsung, Huawei, OPPO or vivo' },
        { icon: 'download', title: 'Install apps', why: 'Only asked when you install an update' },
      ],
      permissionsNote: 'If your brand closes apps on its own, that step’s button takes you straight to the right setting.',
      permissionsGuide: { label: 'See the guide by brand', href: guide },
      faq: [
        { q: 'Does it cost anything?', a: 'No. It’s free, with no ads and no in-app purchases.' },
        { q: 'Do I need an account?', a: 'No. Everything is saved on your phone, with no accounts or servers.' },
        {
          q: 'Does it work with the phone locked?',
          a: 'Yes. Rest keeps running and the set shows up on the lock screen, so you can finish it without unlocking.',
        },
        { q: 'Do I need internet?', a: 'Only to check for updates. Not to train.' },
        { q: 'Do I lose my history if I change programs?', a: 'No. Changing programs doesn’t delete anything.' },
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
