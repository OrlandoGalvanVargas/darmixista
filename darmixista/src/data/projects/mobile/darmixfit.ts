import type { Project } from "../types";

const project: Project = {
  order: 2,
  slug: "darmixfit",
  title: "DarmixFit",
  year: "2026",
  category: { es: "Salud y fitness", en: "Health & fitness" },
  summary: {
    es: "Entrenamiento de fuerza serie por serie: completas la serie y el descanso arranca solo, aunque el teléfono esté bloqueado.",
    en: "Strength training set by set: complete the set and rest starts on its own, even with the phone locked.",
  },
  description: {
    es: "App Android para entrenar fuerza sin perder progreso: la ruta del día muestra el ejercicio actual, soporta superseries y avanza sola. El temporizador de descanso corre en un servicio en primer plano con alarma exacta de respaldo y una campana sintetizada por código, y la serie se puede completar desde la pantalla de bloqueo. Incluye 7 programas editables, 41 ejercicios animados, semana e historial, tema claro y oscuro, configuración guiada de permisos (incluido Xiaomi / HyperOS) y actualizaciones que se descargan e instalan desde la propia app. Arquitectura MVVM con StateFlow y un repositorio único sobre Room.",
    en: "An Android app to train strength without losing the thread: today’s route shows the current exercise, supports supersets and moves on by itself. The rest timer runs in a foreground service with an exact backup alarm and a bell synthesized in code, and sets can be completed from the lock screen. It includes 7 editable programs, 41 animated exercises, week and history views, light and dark themes, a guided permission setup (including Xiaomi / HyperOS) and updates that download and install from inside the app. MVVM architecture with StateFlow and a single repository on top of Room.",
  },
  highlights: {
    es: [
      "Descanso confiable: servicio en primer plano + alarma exacta",
      "Completar serie desde la pantalla de bloqueo",
      "Campana sintetizada con AudioTrack",
      "Actualizaciones dentro de la app desde GitHub Releases",
    ],
    en: [
      "Reliable rest: foreground service + exact alarm",
      "Complete sets from the lock screen",
      "Bell synthesized with AudioTrack",
      "In-app updates from GitHub Releases",
    ],
  },
  tags: [
    "Kotlin",
    "Jetpack Compose",
    "Material 3",
    "Room",
    "MVVM + StateFlow",
    "Foreground Service",
    "AlarmManager",
    "Coil",
  ],
  links: {
    // Landing propia con el botón de descarga: darmixista.dev/darmixfit/
    page: "darmixfit",
    code: "https://github.com/OrlandoGalvanVargas/darmixfit",
  },
  image: "/apps/darmixfit/shots/today.webp",
};

export default project;
