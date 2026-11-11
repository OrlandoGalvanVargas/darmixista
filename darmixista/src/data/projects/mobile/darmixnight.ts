import type { Project } from '../types';

const project: Project = {
  order: 3,
  slug: 'darmixnight',
  title: 'DarmixNight',
  year: '2026',
  category: { es: 'Sueño y bienestar digital', en: 'Sleep and digital wellbeing' },
  summary: {
    es: 'Bloquea tu teléfono durante tu horario de descanso: cualquier app queda cubierta hasta la mañana, dentro de una habitación nocturna ilustrada.',
    en: 'Locks your phone during your sleep schedule: any app is covered until morning, inside an illustrated night room.',
  },
  description: {
    es: 'App Android que cubre cualquier app con una pantalla de descanso durante el horario que elijas. Un AccessibilityService detecta la app en primer plano y una ventana superpuesta en Compose dibuja el bloqueo; un servicio en primer plano con alarmas exactas mantiene el horario al minuto y se reactiva tras reinicios o si el sistema lo detiene. Llamadas, mensajes, cámara y ajustes nunca se bloquean, y el desbloqueo de emergencia solo existe de día, con fricción y registro semanal. Toda la app vive en una habitación ilustrada que cambia con el estado del servicio, con controles de latón y cobre, sonidos mecánicos propios, permisos guiados y actualizaciones desde GitHub Releases con PackageInstaller. Código abierto bajo licencia MIT.',
    en: 'An Android app that covers any app with a rest screen during the schedule you choose. An AccessibilityService detects the foreground app and a Compose overlay window draws the lock; a foreground service with exact alarms keeps the schedule to the minute and comes back after restarts or if the system stops it. Calls, messages, camera and settings are never blocked, and the emergency unlock only exists during the day, with friction and a weekly log. The whole app lives in an illustrated room that changes with the service state, with brass and copper controls, its own mechanical sounds, guided permissions and updates from GitHub Releases with PackageInstaller. Open source under the MIT license.',
  },
  highlights: {
    es: [
      'Bloqueo con AccessibilityService y overlay en Compose',
      'Horario exacto que sobrevive reinicios',
      'Emergencias con fricción, solo de día',
      'Actualizaciones con PackageInstaller desde GitHub',
    ],
    en: [
      'Lock with AccessibilityService and a Compose overlay',
      'Exact schedule that survives restarts',
      'Emergencies with friction, daytime only',
      'Updates with PackageInstaller from GitHub',
    ],
  },
  tags: ['Kotlin', 'Jetpack Compose', 'Material 3', 'AccessibilityService', 'Foreground Service', 'AlarmManager', 'DataStore', 'PackageInstaller'],
  links: {
    page: 'darmixnight',
    code: 'https://github.com/OrlandoGalvanVargas/darmixnight',
  },
  image: '/apps/darmixnight/shots/noche.webp',
};

export default project;
