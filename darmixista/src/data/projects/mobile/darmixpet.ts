import type { Project } from '../types';

const project: Project = {
  order: 1,
  slug: 'darmixpet',
  title: 'DarmixPet',
  year: '2026',
  category: { es: 'Bienestar digital', en: 'Digital wellbeing' },
  summary: {
    es: 'Control de tiempo de pantalla con una mascota flotante que vive sobre tus apps y te avisa cuándo parar.',
    en: 'Screen-time control with a floating pet that lives on top of your apps and tells you when to stop.',
  },
  description: {
    es: 'App Android de bienestar digital que limita las apps que elijas por sesiones: tiempo máximo por sesión, enfriamiento entre sesiones y número de sesiones al día. Una mascota flotante (overlay) arrastrable reacciona a gestos, habla con voz, ofrece un menú rápido de brillo, volumen y temporizador, y bloquea la app al agotarse el tiempo. Detecta al instante la app abierta con AccessibilityService, funciona 100 % en el teléfono y avisa de nuevas versiones consultando las releases de GitHub. Tres personajes con estilo visual propio sobre una arquitectura extensible de skins.',
    en: 'A digital wellbeing Android app that limits the apps you choose by sessions: max time per session, cooldown between sessions and a daily session cap. A draggable floating pet (overlay) reacts to gestures, speaks, offers a quick menu for brightness, volume and timer, and blocks the app when time runs out. It detects the open app instantly with AccessibilityService, works 100% on the phone and checks GitHub releases for new versions. Three characters with their own visual style on an extensible skin architecture.',
  },
  highlights: {
    es: [
      'Overlay flotante con gestos y menú rápido',
      'Bloqueo por sesiones con enfriamiento',
      'Detección instantánea con AccessibilityService',
      'Avisos de actualización desde GitHub Releases',
    ],
    en: [
      'Floating overlay with gestures and quick menu',
      'Session-based blocking with cooldown',
      'Instant detection with AccessibilityService',
      'Update alerts from GitHub Releases',
    ],
  },
  tags: ['Kotlin', 'Jetpack Compose', 'Material 3', 'Room', 'Coroutines + Flow', 'Foreground Service', 'AccessibilityService', 'TextToSpeech'],
  links: {
    // Landing propia con el botón de descarga: darmixista.dev/darmixpet/
    page: 'darmixpet',
    code: 'https://github.com/OrlandoGalvanVargas/DarmixPet',
  },
  image: '/apps/darmixpet/shots/home.webp',
};

export default project;
