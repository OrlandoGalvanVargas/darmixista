import type { Project } from '../types';

const project: Project = {
  order: 2,
  slug: 'darmixfit',
  audience: 'personal',
  title: 'DarmixFit',
  year: '2026',
  accent: '#c8f03c',
  category: { es: 'Salud y fitness', en: 'Health & fitness' },
  summary: {
    es: 'Entrenamiento de fuerza serie por serie, con descansos automáticos y un reactor que refleja tu progreso durante la rutina.',
    en: 'Strength training set by set, with automatic rest periods and a reactor that reflects your progress through the routine.',
  },
  summaryShort: {
    es: 'Entrenamiento de fuerza serie por serie, con descansos automáticos y un reactor que refleja tu progreso.',
    en: 'Strength training set by set, with automatic rest periods and a reactor that reflects your progress.',
  },
  description: {
    es: 'Una app para entrenar fuerza serie por serie, con descansos automáticos y un reactor que se carga con cada sesión. La ruta del día muestra el ejercicio actual, soporta superseries y avanza sola. El temporizador de descanso corre en un servicio en primer plano con alarma exacta de respaldo y una campana sintetizada por código, y la serie se puede completar desde la pantalla de bloqueo. Incluye 7 programas editables, 41 ejercicios animados, semana e historial, tema claro y oscuro, configuración guiada de permisos (incluido Xiaomi / HyperOS) y actualizaciones que se descargan e instalan desde la propia app. Arquitectura MVVM con StateFlow y un repositorio único sobre Room.',
    en: 'An app for strength training set by set, with automatic rest periods and a reactor that charges with every session. Today’s route shows the current exercise, supports supersets and moves on by itself. The rest timer runs in a foreground service with an exact backup alarm and a bell synthesized in code, and sets can be completed from the lock screen. It includes 7 editable programs, 41 animated exercises, week and history views, light and dark themes, a guided permission setup (including Xiaomi / HyperOS) and updates that download and install from inside the app. MVVM architecture with StateFlow and a single repository on top of Room.',
  },
  highlights: {
    es: [
      'Descanso confiable: servicio en primer plano + alarma exacta',
      'Completar serie desde la pantalla de bloqueo',
      'Campana sintetizada con AudioTrack',
      'Actualizaciones dentro de la app desde GitHub Releases',
    ],
    en: [
      'Reliable rest: foreground service + exact alarm',
      'Complete sets from the lock screen',
      'Bell synthesized with AudioTrack',
      'In-app updates from GitHub Releases',
    ],
  },
  sheet: {
    what: {
      es: 'Te guía serie por serie en tu rutina de fuerza y cuenta los descansos por ti, aunque bloquees el teléfono. Trae 7 programas y 41 ejercicios animados.',
      en: 'Guides you set by set through your strength routine and counts your rest for you, even with the phone locked. It comes with 7 programs and 41 animated exercises.',
    },
    how: {
      es: 'Kotlin, Compose y Room con MVVM. El descanso corre en un servicio en primer plano con alarma exacta de respaldo, y la serie se marca desde la pantalla de bloqueo.',
      en: 'Kotlin, Compose and Room with MVVM. Rest runs in a foreground service with an exact backup alarm, and sets are marked from the lock screen.',
    },
  },
  tags: ['Kotlin', 'Jetpack Compose', 'Material 3', 'Room', 'MVVM + StateFlow', 'Foreground Service', 'AlarmManager', 'Coil'],
  links: {
    page: 'darmixfit',
    code: 'https://github.com/OrlandoGalvanVargas/darmixfit',
  },
  image: '/apps/darmixfit/shots/today.webp',
};

export default project;
