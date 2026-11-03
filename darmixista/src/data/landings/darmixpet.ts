import type { Lang } from "../../i18n/ui";
import type {
  AppMeta,
  CorePalette,
  InstallContent,
  PageMeta,
  Skin,
} from "../../landing/types";

type SkinPalette = CorePalette & {
  available: string;
  availableContainer: string;
  onAvailableContainer: string;
  cooldown: string;
  cooldownContainer: string;
  onCooldownContainer: string;
  blocked: string;
  blockedContainer: string;
  onBlockedContainer: string;
};

const A = "/apps/darmixpet";

export const app: AppMeta = {
  slug: "darmixpet",
  name: "DarmixPet",
  repo: { owner: "OrlandoGalvanVargas", name: "darmixpet" },
  release: {
    version: "1.4.0",
    apk: "DarmixPet-v1.4.0.apk",
    sizeMb: 17.3,
    date: "2026-11-03",
  },
  minAndroid: "8.0",
  icon: `${A}/icon.webp`,
  icon192: `${A}/icon-192.png`,
  icon32: `${A}/favicon-32.png`,
  apple: `${A}/apple-touch-icon.png`,
  og: { es: `${A}/og-es.png`, en: `${A}/og-en.png` },
  schemaCategory: "LifestyleApplication",
};

const lightStatus = {
  available: "#3F8F55",
  availableContainer: "#DDEFD9",
  onAvailableContainer: "#1E4D2B",
  cooldown: "#3B7FC0",
  cooldownContainer: "#DCEBF8",
  onCooldownContainer: "#1F4A70",
  blocked: "#C8463E",
  blockedContainer: "#F9DEDA",
  onBlockedContainer: "#7A2520",
};

const darkStatus = {
  available: "#8FD19A",
  availableContainer: "#1E2E24",
  onAvailableContainer: "#CDEFD3",
  cooldown: "#8CC3F2",
  cooldownContainer: "#1A2A3D",
  onCooldownContainer: "#D3E7FA",
  blocked: "#F2897A",
  blockedContainer: "#3A1F1D",
  onBlockedContainer: "#FBD9D3",
};

const darkBase = {
  bg: "#2B2D31",
  surface: "#313338",
  surfaceVariant: "#383A40",
  ink: "#46484F",
  shadow: "#1E1F22",
  text: "#F2F3F5",
  muted: "#B5BAC1",
  outline: "#46484F",
};

const archiLight: SkinPalette = {
  bg: "#F3F7FC",
  surface: "#FFFFFF",
  surfaceVariant: "#E6EEF8",
  ink: "#12305C",
  shadow: "#12305C",
  text: "#12305C",
  muted: "#5A6B85",
  outline: "#C9D6E8",
  primary: "#1E63D6",
  onPrimary: "#FFFFFF",
  primaryContainer: "#DCEBFC",
  onPrimaryContainer: "#12305C",
  accent: "#22B8D8",
  onAccent: "#062A33",
  accentContainer: "#DDF6FB",
  onAccentContainer: "#0B4A57",
  ...lightStatus,
};

const archiDark: SkinPalette = {
  ...darkBase,
  primary: "#2F6FE0",
  onPrimary: "#FFFFFF",
  primaryContainer: "#31405D",
  onPrimaryContainer: "#D3E2FF",
  accent: "#7FD6EA",
  onAccent: "#062A33",
  accentContainer: "#2E4049",
  onAccentContainer: "#CDF3FB",
  ...darkStatus,
};

const sylvaLight: SkinPalette = {
  bg: "#F3F6EE",
  surface: "#FFFFFF",
  surfaceVariant: "#E5ECDC",
  ink: "#1F3A2A",
  shadow: "#1F3A2A",
  text: "#1F3A2A",
  muted: "#63705E",
  outline: "#CFD8C2",
  primary: "#457D22",
  onPrimary: "#FFFFFF",
  primaryContainer: "#E4F1D6",
  onPrimaryContainer: "#1F3A2A",
  accent: "#3FBF7A",
  onAccent: "#0B2E1C",
  accentContainer: "#DCF0E4",
  onAccentContainer: "#14532D",
  ...lightStatus,
};

const sylvaDark: SkinPalette = {
  ...darkBase,
  primary: "#2A7F50",
  onPrimary: "#FFFFFF",
  primaryContainer: "#2F443D",
  onPrimaryContainer: "#CFEFD9",
  accent: "#7FD3A4",
  onAccent: "#0B2E1C",
  accentContainer: "#2E3F3D",
  onAccentContainer: "#CFF2DE",
  ...darkStatus,
};

const galahadLight: SkinPalette = {
  bg: "#F7F2EA",
  surface: "#FFFDF9",
  surfaceVariant: "#EEE6D8",
  ink: "#3A3631",
  shadow: "#3A3631",
  text: "#2E2B27",
  muted: "#6F675C",
  outline: "#DDD3C2",
  primary: "#D8B67E",
  onPrimary: "#2B1E0E",
  primaryContainer: "#F4E8D2",
  onPrimaryContainer: "#4A3412",
  accent: "#6B6F78",
  onAccent: "#FFFFFF",
  accentContainer: "#E7E4DE",
  onAccentContainer: "#3A3D44",
  ...lightStatus,
};

const galahadDark: SkinPalette = {
  ...darkBase,
  primary: "#9C6B47",
  onPrimary: "#FFFFFF",
  primaryContainer: "#483F3B",
  onPrimaryContainer: "#F2DCC9",
  accent: "#B8BEC8",
  onAccent: "#1E232A",
  accentContainer: "#2C3036",
  onAccentContainer: "#E3E6EA",
  ...darkStatus,
};

export const skins: Skin[] = [
  {
    id: "archi",
    light: archiLight,
    dark: archiDark,
    image: `${A}/chars/archi.webp`,
    imageSmall: `${A}/chars/archi-sm.webp`,
    glow: "34 211 238",
  },
  {
    id: "sylva",
    light: sylvaLight,
    dark: sylvaDark,
    image: `${A}/chars/sylva.webp`,
    imageSmall: `${A}/chars/sylva-sm.webp`,
    glow: "74 222 128",
  },
  {
    id: "galahad",
    light: galahadLight,
    dark: galahadDark,
    image: `${A}/chars/galahad.webp`,
    imageSmall: `${A}/chars/galahad-sm.webp`,
    glow: "216 182 126",
  },
];

export interface Character {
  id: string;
  name: string;
  short: string;
  element: string;
  quote: string;
  forYou: string;
}

export interface Step {
  title: string;
  body: string;
  media: { video?: string; poster: string; alt: string };
}

export interface DarmixPetContent {
  meta: PageMeta;
  nav: { how: string; companions: string; help: string };
  hero: { title: string; lead: string; howTo: string };
  how: {
    title: string;
    prev: string;
    next: string;
    step: string;
    steps: Step[];
  };
  companions: {
    title: string;
    lead: string;
    chosen: string;
    choose: string;
    characters: Character[];
  };
  final: { title: string; lead: string; howTo: string };
  sheet: {
    title: string;
    tabs: { install: string; permissions: string; faq: string };
  };
  install: InstallContent;
}

const guide =
  "https://github.com/OrlandoGalvanVargas/darmixpet#-permisos-paso-a-paso";

export const content: Record<Lang, DarmixPetContent> = {
  es: {
    meta: {
      title: "DarmixPet — Tu compañero de tiempo de pantalla para Android",
      description:
        "App gratis para Android con una mascota que vive sobre tus apps, limita el tiempo que pasas en ellas y te enseña tus notificaciones. Sin anuncios y sin crear cuenta.",
      ogAlt: "DarmixPet: Archi, Sylva y Sir Galahad junto al nombre de la app",
      category: "Bienestar digital",
    },
    nav: {
      how: "Cómo funciona",
      companions: "Compañeros",
      help: "Antes de instalar",
    },
    hero: {
      title:
        'Tu compañero de<br class="max-lg:hidden"> <em>tiempo de pantalla</em>',
      lead: "Una mascota que vive sobre tus apps y te avisa cuando ya es hora de soltar el teléfono.",
      howTo: "¿Cómo se instala?",
    },
    how: {
      title: "Así te cuida",
      prev: "Anterior",
      next: "Siguiente",
      step: "Paso",
      steps: [
        {
          title: "Elige tus apps",
          body: "Solo las que más tiempo te quitan. Las demás siguen igual.",
          media: {
            poster: `${A}/shots/home.webp`,
            alt: "Lista de apps con un interruptor para vigilar cada una",
          },
        },
        {
          title: "Ponles límite",
          body: "Tú decides cuántos minutos por sesión, cuánto descanso y cuántas veces al día.",
          media: {
            video: `${A}/clips/limits.mp4`,
            poster: `${A}/clips/limits.webp`,
            alt: "Configuración del tiempo por sesión, el descanso y las sesiones al día",
          },
        },
        {
          title: "Te avisa a tiempo",
          body: "A la mitad te habla. Al terminar, te saca de la app y empieza el descanso.",
          media: {
            poster: `${A}/shots/block.webp`,
            alt: "Apps vigiladas con su tiempo y su estado",
          },
        },
        {
          title: "Te enseña tus notificaciones",
          body: "Lo tocas y te las muestra una por una, sin bajar la barra.",
          media: {
            video: `${A}/clips/notifications.mp4`,
            poster: `${A}/clips/notifications.webp`,
            alt: "La mascota muestra una notificación encima de otra app",
          },
        },
      ],
    },
    companions: {
      title: "Elige a tu compañero",
      lead: "Cada uno te cuida a su manera y le pone sus colores a la app.",
      chosen: "Elegido",
      choose: "Elegir",
      characters: [
        {
          id: "archi",
          name: "Archi el Archimago",
          short: "Archi",
          element: "Éter · Magia arcana",
          quote: "Tú enfócate, yo vigilo.",
          forYou: "Para ti, si te distraes fácil",
        },
        {
          id: "sylva",
          name: "Sylva el Sabio",
          short: "Sylva",
          element: "Naturaleza · Vitalidad",
          quote: "Despacio también se llega.",
          forYou: "Para ti, si se te olvida descansar",
        },
        {
          id: "galahad",
          name: "Sir Galahad el Guardián",
          short: "Galahad",
          element: "Tierra · Disciplina",
          quote: "Tu tiempo no se negocia.",
          forYou: "Para ti, si necesitas límites firmes",
        },
      ],
    },
    final: {
      title: "Descárgala gratis",
      lead: "Sin anuncios y sin crear cuenta. Lo que haces se queda en tu teléfono.",
      howTo: "¿Cómo se instala?",
    },
    sheet: {
      title: "Antes de instalar",
      tabs: { install: "Instalar", permissions: "Permisos", faq: "Preguntas" },
    },
    install: {
      steps: [
        { title: "Descarga el APK", body: "Hazlo desde tu teléfono Android." },
        {
          title: "Ábrelo",
          body: "Desde la notificación de la descarga o tu carpeta de descargas. Si Android te pregunta, permite instalar desde esta fuente.",
        },
        {
          title: "Dale los permisos",
          body: "Te los pide uno a la vez y te dice qué tocar.",
        },
        { title: "Elige a tu compañero", body: "Y listo." },
      ],
      permissionsIntro:
        "La primera vez que abras DarmixPet te pide 7 permisos, uno a la vez y en orden. En cada paso te dice qué tocar según la marca de tu teléfono.",
      permissions: [
        {
          icon: "accessibility",
          title: "Detección instantánea",
          why: "Para saber al momento qué app abres, sin leer lo que escribes",
        },
        {
          icon: "bell",
          title: "Leer notificaciones",
          why: "Para enseñarte tus notificaciones y avisarte de tus mensajes",
        },
        {
          icon: "hourglass",
          title: "Acceso a datos de uso",
          why: "Para medir cuánto tiempo pasas en cada app",
        },
        {
          icon: "layers",
          title: "Mostrar sobre otras apps",
          why: "Para que tu mascota flote encima de tus apps",
        },
        {
          icon: "bell",
          title: "Notificaciones",
          why: "Para avisarte de los descansos y mantener despierta a tu mascota",
        },
        {
          icon: "battery",
          title: "Ignorar optimización de batería",
          why: "Para que Android no cierre a tu mascota",
        },
        {
          icon: "sun",
          title: "Modificar ajustes del sistema",
          why: "Solo para cambiar el brillo desde el menú rápido",
        },
      ],
      permissionsNote:
        "En Android 13 o superior, Android puede mostrar el aviso de ajuste restringido. Se desbloquea una sola vez y la app te enseña cómo en ese mismo paso.",
      permissionsGuide: { label: "Ver la guía paso a paso", href: guide },
      faq: [
        {
          q: "¿Cuesta algo?",
          a: "No. Es gratis, sin anuncios y sin compras dentro de la app.",
        },
        {
          q: "¿Por qué no está en Google Play?",
          a: "Es un proyecto personal y se publica directo como APK. Por eso Android pide un paso extra en algunos permisos. Las actualizaciones te llegan desde la misma app.",
        },
        {
          q: "¿Es seguro instalar un APK?",
          a: "Sí, si lo descargas de aquí. El botón baja el archivo directo de las versiones oficiales en GitHub.",
        },
        {
          q: "¿Lee mis mensajes?",
          a: "Solo para enseñártelos cuando tocas a tu mascota y para avisarte que llegó uno. No guarda nada ni lo manda a ningún lado.",
        },
        {
          q: "¿Gasta mucha batería?",
          a: "No. Solo revisa qué app está abierta mientras la pantalla está encendida. Si quieres un descanso total, puedes dormir a tu mascota desde su menú rápido.",
        },
        {
          q: "¿Cómo se actualiza?",
          a: "La app te avisa cuando hay una versión nueva, la descarga y la instala. No pierdes tus apps ni tus ajustes.",
        },
        {
          q: "¿La descarga se quedó en 100%?",
          a: "Entra a Chrome, toca ⋮ y luego Descargas. Muchas veces el APK ya está ahí completo y solo tienes que abrirlo. Si no aparece, toca Descargar de nuevo.",
        },
        { q: "¿Funciona en iPhone?", a: "No, solo en Android 8.0 o superior." },
      ],
    },
  },

  en: {
    meta: {
      title: "DarmixPet — Your screen-time companion for Android",
      description:
        "A free Android app with a pet that lives on top of your apps, limits the time you spend in them and shows you your notifications. No ads and no sign-up.",
      ogAlt: "DarmixPet: Archi, Sylva and Sir Galahad next to the app name",
      category: "Digital wellbeing",
    },
    nav: {
      how: "How it works",
      companions: "Companions",
      help: "Before installing",
    },
    hero: {
      title:
        'Your <em><span class="whitespace-nowrap">screen-time</span></em><br class="max-lg:hidden"> companion',
      lead: "A pet that lives on top of your apps and lets you know when it’s time to put the phone down.",
      howTo: "How do I install it?",
    },
    how: {
      title: "How it looks after you",
      prev: "Previous",
      next: "Next",
      step: "Step",
      steps: [
        {
          title: "Pick your apps",
          body: "Only the ones that eat up your time. Everything else stays the same.",
          media: {
            poster: `${A}/shots/home.webp`,
            alt: "App list with a switch to watch each one",
          },
        },
        {
          title: "Give them a limit",
          body: "You decide the minutes per session, the break and how many times a day.",
          media: {
            video: `${A}/clips/limits.mp4`,
            poster: `${A}/clips/limits.webp`,
            alt: "Settings for session time, breaks and sessions per day",
          },
        },
        {
          title: "It warns you in time",
          body: "Halfway through it talks to you. When time is up, it takes you out of the app and the break starts.",
          media: {
            poster: `${A}/shots/block.webp`,
            alt: "Watched apps with their time and status",
          },
        },
        {
          title: "It shows you your notifications",
          body: "Tap it and it shows them one by one, without pulling down the bar.",
          media: {
            video: `${A}/clips/notifications.mp4`,
            poster: `${A}/clips/notifications.webp`,
            alt: "The pet shows a notification on top of another app",
          },
        },
      ],
    },
    companions: {
      title: "Choose your companion",
      lead: "Each one looks after you in its own way and gives the app its colors.",
      chosen: "Chosen",
      choose: "Choose",
      characters: [
        {
          id: "archi",
          name: "Archi the Archmage",
          short: "Archi",
          element: "Ether · Arcane magic",
          quote: "You focus, I’ll keep watch.",
          forYou: "For you if you get distracted easily",
        },
        {
          id: "sylva",
          name: "Sylva the Sage",
          short: "Sylva",
          element: "Nature · Vitality",
          quote: "Slow still gets you there.",
          forYou: "For you if you forget to rest",
        },
        {
          id: "galahad",
          name: "Sir Galahad the Guardian",
          short: "Galahad",
          element: "Earth · Discipline",
          quote: "Your time is non-negotiable.",
          forYou: "For you if you need firm limits",
        },
      ],
    },
    final: {
      title: "Get it for free",
      lead: "No ads and no sign-up. What you do stays on your phone.",
      howTo: "How do I install it?",
    },
    sheet: {
      title: "Before installing",
      tabs: { install: "Install", permissions: "Permissions", faq: "FAQ" },
    },
    install: {
      steps: [
        { title: "Download the APK", body: "Do it from your Android phone." },
        {
          title: "Open it",
          body: "From the download notification or your downloads folder. If Android asks, allow installs from this source.",
        },
        {
          title: "Grant the permissions",
          body: "It asks for them one at a time and tells you what to tap.",
        },
        { title: "Pick your companion", body: "And you’re done." },
      ],
      permissionsIntro:
        "The first time you open DarmixPet it asks for 7 permissions, one at a time and in order. Each step tells you what to tap for your phone’s brand.",
      permissions: [
        {
          icon: "accessibility",
          title: "Instant detection",
          why: "To know right away which app you open, without reading what you type",
        },
        {
          icon: "bell",
          title: "Read notifications",
          why: "To show you your notifications and let you know about messages",
        },
        {
          icon: "hourglass",
          title: "Usage access",
          why: "To measure how long you spend in each app",
        },
        {
          icon: "layers",
          title: "Display over other apps",
          why: "So your pet can float on top of your apps",
        },
        {
          icon: "bell",
          title: "Notifications",
          why: "To tell you about breaks and keep your pet awake",
        },
        {
          icon: "battery",
          title: "Ignore battery optimization",
          why: "So Android doesn’t close your pet",
        },
        {
          icon: "sun",
          title: "Modify system settings",
          why: "Only to change brightness from the quick menu",
        },
      ],
      permissionsNote:
        "On Android 13 or later, Android may show a restricted setting notice. You unlock it only once, and the app shows you how in that same step.",
      permissionsGuide: { label: "See the step-by-step guide", href: guide },
      faq: [
        {
          q: "Does it cost anything?",
          a: "No. It’s free, with no ads and no in-app purchases.",
        },
        {
          q: "Why isn’t it on Google Play?",
          a: "It’s a personal project published directly as an APK. That’s why Android asks for an extra step on some permissions. Updates come from the app itself.",
        },
        {
          q: "Is it safe to install an APK?",
          a: "Yes, if you download it here. The button gets the file straight from the official releases on GitHub.",
        },
        {
          q: "Does it read my messages?",
          a: "Only to show them when you tap your pet and to let you know one arrived. It doesn’t store anything or send it anywhere.",
        },
        {
          q: "Does it drain the battery?",
          a: "No. It only checks which app is open while the screen is on. If you want a full break, you can put your pet to sleep from its quick menu.",
        },
        {
          q: "How does it update?",
          a: "The app lets you know when there’s a new version, downloads it and installs it. You keep your apps and settings.",
        },
        {
          q: "Did the download get stuck at 100%?",
          a: "Open Chrome, tap ⋮ and then Downloads. Most of the time the APK is already there and you just need to open it. If it’s not, tap Download again.",
        },
        {
          q: "Does it work on iPhone?",
          a: "No, only on Android 8.0 or later.",
        },
      ],
    },
  },
};
