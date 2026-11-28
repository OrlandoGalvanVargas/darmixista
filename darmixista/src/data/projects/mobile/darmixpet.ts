import type { Project } from "../types";

const project: Project = {
  order: 1,
  slug: "darmixpet",
  audience: 'personal',
  title: "DarmixPet",
  year: "2026",
  accent: "#4f8bff",
  category: { es: "Bienestar digital", en: "Digital wellbeing" },
  summary: {
    es: 'Una mascota flotante que te ayuda a controlar el tiempo de uso de tus apps y te avisa cuando ya es hora de soltar el teléfono.',
    en: 'A floating pet that helps you keep track of how long you use your apps and lets you know when it’s time to put the phone down.',
  },
  summaryShort: {
    es: 'Una mascota flotante que controla el tiempo de uso de tus apps y te avisa cuando es hora de soltar el teléfono.',
    en: 'A floating pet that tracks your app usage and lets you know when it’s time to put the phone down.',
  },
  description: {
    es: "App Android de bienestar digital que limita las apps que elijas por sesiones: tiempo máximo por sesión, enfriamiento entre sesiones y número de sesiones al día. Una mascota flotante (overlay) arrastrable reacciona a gestos, habla con voz, ofrece un menú rápido de brillo, volumen y temporizador, y bloquea la app al agotarse el tiempo. Detecta al instante la app abierta con AccessibilityService, funciona 100 % en el teléfono y avisa de nuevas versiones consultando las releases de GitHub. Tres personajes con estilo visual propio sobre una arquitectura extensible de skins.",
    en: "A digital wellbeing Android app that limits the apps you choose by sessions: max time per session, cooldown between sessions and a daily session cap. A draggable floating pet (overlay) reacts to gestures, speaks, offers a quick menu for brightness, volume and timer, and blocks the app when time runs out. It detects the open app instantly with AccessibilityService, works 100% on the phone and checks GitHub releases for new versions. Three characters with their own visual style on an extensible skin architecture.",
  },
  highlights: {
    es: [
      "Overlay flotante con gestos y menú rápido",
      "Bloqueo por sesiones con enfriamiento",
      "Detección instantánea con AccessibilityService",
      "Avisos de actualización desde GitHub Releases",
    ],
    en: [
      "Floating overlay with gestures and quick menu",
      "Session-based blocking with cooldown",
      "Instant detection with AccessibilityService",
      "Update alerts from GitHub Releases",
    ],
  },
  sheet: {
    what: {
      es: 'Pones límites de tiempo a las apps que te distraen y una mascota flotante te avisa cuando se acaba. Al llegar al límite, la app se bloquea.',
      en: 'You set time limits on the apps that distract you and a floating pet lets you know when time is up. When you hit the limit, the app locks.',
    },
    how: {
      es: 'Kotlin y Jetpack Compose. Detecta la app abierta con AccessibilityService y la mascota vive en una ventana superpuesta. Todo corre en el teléfono, sin cuentas ni servidor.',
      en: 'Kotlin and Jetpack Compose. It detects the open app with AccessibilityService and the pet lives in an overlay window. Everything runs on the phone, with no account or server.',
    },
  },
  tags: [
    "Kotlin",
    "Jetpack Compose",
    "Material 3",
    "Room",
    "Coroutines + Flow",
    "Foreground Service",
    "AccessibilityService",
    "TextToSpeech",
  ],
  links: {
    page: "darmixpet",
    code: "https://github.com/OrlandoGalvanVargas/darmixpet",
  },
  image: "/apps/darmixpet/shots/home.webp",
};

export default project;
