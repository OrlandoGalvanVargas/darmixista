import { gsap } from 'gsap';
import { STAGE_CHANGE, type RingPose, type StageChangeDetail } from '../lib/stage-events';

/* ──────────────────────────────────────────────
   Ajustes de las transiciones
   ────────────────────────────────────────────── */
const MOTION = {
  /** Hero ↔ sección: la actual se encoge hacia el centro y la nueva llega desde el fondo (los anillos se mueven) */
  stage: {
    exit: { scale: 0.86, duration: 0.75, ease: 'power2.in' },
    enter: { scale: 0.74, duration: 1.0, ease: 'power3.out', at: 0.38 },
  },
  /**
   * Entre pasos con los anillos de fondo: los anillos se quedan quietos y solo cambia el contenido.
   * Al avanzar, el actual se acerca a ti y se desvanece; el siguiente llega desde atrás (al regresar, al revés).
   */
  content: {
    exit: { scale: 1.07, duration: 0.5, ease: 'power2.in' },
    enter: { scale: 0.94, duration: 0.8, ease: 'power3.out', at: 0.3 },
  },
  /** Entre diapositivas de un carrusel: desplazamiento horizontal (el marco de la sección no se mueve) */
  slide: {
    textShift: 48,
    mediaShift: 110,
    exitDuration: 0.45,
    enterAt: 0.32,
    enterDuration: 0.75,
  },
  /** Elementos [data-reveal] (escalonados) y [data-reveal-sub] (píldoras, más rápidos) */
  reveal: { y: 18, duration: 0.9, stagger: 0.07 },
  revealSub: { y: 8, duration: 0.6, stagger: 0.012 },
  /** Líneas [data-draw="x|y"] que se dibujan al entrar */
  draw: { duration: 1.2, ease: 'power2.inOut' },
  /** Estado visual de la capa de anillos según la pose */
  rings: {
    hero: { filter: 'blur(0px) brightness(1)', opacity: 1 },
    background: { filter: 'blur(7px) brightness(0.42)', opacity: 0.9 },
  } satisfies Record<RingPose, gsap.TweenVars>,
  /** Velocidad al rebobinar o al acelerar una transición interrumpida */
  rewindSpeed: 1.6,
  hurrySpeed: 2.4,
  /** Rueda: pausa (ms) que separa un gesto de otro; la inercia del trackpad cuenta como el mismo gesto */
  wheelGestureGap: 220,
  /** Rueda: desplazamiento mínimo acumulado para contar como intención */
  wheelThreshold: 14,
  /** Touch: distancia mínima del swipe (px) */
  swipeThreshold: 42,
};

/** Desde este ancho se usan las secciones de escritorio (`data-only="desktop"`) */
const DESKTOP_QUERY = '(min-width: 768px)';

/** Un paso = una sección, o una diapositiva dentro de una sección con carrusel */
interface Step {
  id: string;
  section: HTMLElement;
  slide: HTMLElement | null;
  slideIndex: number;
  slideCount: number;
}

interface Transition {
  from: number;
  to: number;
  tl: gsap.core.Timeline;
}

export interface StageOptions {
  /** Promesa que se resuelve cuando la pantalla de carga termina (para la entrada inicial) */
  ready?: Promise<void>;
}

/**
 * Atributos que entiende el controlador en cada <section data-section>:
 *  - data-rings="hero|background"  pose de los anillos
 *  - data-nav="about"               grupo del menú (varios pasos pueden compartir uno)
 *  - data-only="desktop|mobile"     el paso solo existe en ese tamaño
 *  - data-fallback="id"             a dónde ir si el paso no existe en el tamaño actual
 * Carruseles: los hijos [data-slide] de la sección son pasos (#id, #id-2, #id-3…).
 *  - [data-slide-media]             parte visual de la diapositiva (se desplaza más)
 *  - [data-carousel-index]          número de diapositiva actual
 *  - [data-carousel-bar]            barra de progreso del carrusel
 *  - [data-carousel-prev|next]      botones; [data-carousel-goto="n"] va a la diapositiva n (0..)
 * Y dentro de cada sección o diapositiva:
 *  - [data-reveal]       aparece escalonado al entrar
 *  - [data-reveal-sub]   aparece escalonado rápido (listas largas)
 *  - [data-draw="x|y"]   línea que se dibuja al entrar
 */
export function initStage({ ready = Promise.resolve() }: StageOptions = {}): void {
  const stage = document.querySelector<HTMLElement>('[data-stage]');
  if (!stage || stage.dataset.ready) return;
  stage.dataset.ready = 'true';

  const allSections = Array.from(stage.querySelectorAll<HTMLElement>('[data-section]'));
  if (!allSections.length) return;

  const root = document.documentElement;
  const ringsLayer = document.querySelector<HTMLElement>('[data-rings-layer]');
  const counter = document.querySelector<HTMLElement>('[data-stage-counter]');
  const total = document.querySelector<HTMLElement>('[data-stage-total]');
  const progress = document.querySelector<HTMLElement>('[data-stage-progress]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia(DESKTOP_QUERY);

  const slidesOf = (section: HTMLElement) =>
    Array.from(section.querySelectorAll<HTMLElement>('[data-slide]'));
  const allSlides = allSections.flatMap(slidesOf);

  /** gsap.set que ignora listas vacías (evita avisos "GSAP target not found") */
  const set = (targets: Element[], vars: gsap.TweenVars) => {
    if (targets.length) gsap.set(targets, vars);
  };

  /** Pasos activos para el tamaño de pantalla actual */
  let steps: Step[] = [];
  const buildSteps = () => {
    const skip = desktop.matches ? 'mobile' : 'desktop';
    steps = [];
    allSections
      .filter((s) => s.dataset.only !== skip)
      .forEach((section) => {
        const slides = slidesOf(section);
        if (!slides.length) {
          steps.push({ id: section.id, section, slide: null, slideIndex: 0, slideCount: 0 });
          return;
        }
        slides.forEach((slide, n) =>
          steps.push({
            id: n === 0 ? section.id : `${section.id}-${n + 1}`,
            section,
            slide,
            slideIndex: n,
            slideCount: slides.length,
          }),
        );
      });
  };
  buildSteps();

  /** Resuelve un id (o su sustituto si no existe en este tamaño) a un índice; -1 si no hay */
  const resolve = (id: string): number => {
    const i = steps.findIndex((s) => s.id === id);
    if (i >= 0) return i;
    const fallback = allSections.find((s) => s.id === id)?.dataset.fallback;
    return fallback ? steps.findIndex((s) => s.id === fallback) : -1;
  };
  const indexFromHash = () => Math.max(0, resolve(decodeURIComponent(location.hash.slice(1))));
  const poseOf = (i: number): RingPose =>
    steps[i].section.dataset.rings === 'background' ? 'background' : 'hero';
  const groupOf = (i: number) => steps[i].section.dataset.nav ?? steps[i].section.id;
  const groups = () => [...new Set(steps.map((_, i) => groupOf(i)))];

  /** Nodos de entrada del paso: los de su sección, excepto los que viven en otras diapositivas */
  const nodes = (i: number, sel: string) => {
    const { section, slide } = steps[i];
    return Array.from(section.querySelectorAll<HTMLElement>(sel)).filter((el) => {
      const owner = el.closest<HTMLElement>('[data-slide]');
      return !owner || owner === slide;
    });
  };
  /** Nodos de entrada que pertenecen solo a la diapositiva (para la transición horizontal) */
  const slideNodes = (i: number, sel: string) =>
    steps[i].slide ? Array.from(steps[i].slide!.querySelectorAll<HTMLElement>(sel)) : [];

  /** Paso "destino" actual (durante una transición ya apunta al que entra) */
  let current = indexFromHash();
  let transition: Transition | null = null;
  /** Una sola petición en espera: la última intención del usuario */
  let pending: number | null = null;
  let inputEnabled = false;

  /* ── Estado inicial (el contenido espera a la pantalla de carga) ── */
  showOnly(current);
  hideEntrance(current);
  if (ringsLayer) gsap.set(ringsLayer, MOTION.rings[poseOf(current)]);
  announce(current, current, false);

  ready.then(() => {
    inputEnabled = true;
    addEntrance(gsap.timeline(), current, 0.1);
  });

  /* ──────────────────────────────────────────────
     Visibilidad y elementos de entrada
     ────────────────────────────────────────────── */
  function hideEntrance(i: number) {
    set(nodes(i, '[data-reveal]'), { autoAlpha: 0, x: 0, y: MOTION.reveal.y });
    set(nodes(i, '[data-reveal-sub]'), { autoAlpha: 0, y: MOTION.revealSub.y });
    set(slideNodes(i, '[data-slide-media]'), { autoAlpha: 0 });
    nodes(i, '[data-draw]').forEach((el) =>
      gsap.set(el, el.dataset.draw === 'x' ? { scaleX: 0 } : { scaleY: 0 }),
    );
  }

  function showEntrance(i: number) {
    const items = nodes(i, '[data-reveal], [data-reveal-sub]');
    gsap.killTweensOf(items);
    set(items, { autoAlpha: 1, x: 0, y: 0 });
    set(slideNodes(i, '[data-slide-media]'), { autoAlpha: 1, x: 0, scale: 1 });
    set(nodes(i, '[data-draw]'), { scaleX: 1, scaleY: 1 });
  }

  /** Agrega la aparición de los elementos del paso `i` a una línea de tiempo */
  function addEntrance(tl: gsap.core.Timeline, i: number, at: number) {
    const reveal = nodes(i, '[data-reveal]');
    const sub = nodes(i, '[data-reveal-sub]');
    const media = slideNodes(i, '[data-slide-media]');
    const draws = nodes(i, '[data-draw]');
    if (reduceMotion.matches) {
      tl.call(() => showEntrance(i), undefined, at);
      return;
    }
    if (reveal.length) {
      tl.fromTo(
        reveal,
        { autoAlpha: 0, x: 0, y: MOTION.reveal.y },
        { autoAlpha: 1, y: 0, duration: MOTION.reveal.duration, stagger: MOTION.reveal.stagger, ease: 'power3.out' },
        at,
      );
    }
    if (sub.length) {
      tl.fromTo(
        sub,
        { autoAlpha: 0, y: MOTION.revealSub.y },
        { autoAlpha: 1, y: 0, duration: MOTION.revealSub.duration, stagger: MOTION.revealSub.stagger, ease: 'power2.out' },
        at + 0.15,
      );
    }
    if (media.length) {
      tl.fromTo(
        media,
        { autoAlpha: 0, x: 0, scale: 0.94 },
        { autoAlpha: 1, scale: 1, duration: 1, ease: 'power3.out' },
        at + 0.1,
      );
    }
    draws.forEach((el) => {
      const axis = el.dataset.draw === 'x' ? 'scaleX' : 'scaleY';
      tl.fromTo(el, { [axis]: 0 }, { [axis]: 1, duration: MOTION.draw.duration, ease: MOTION.draw.ease }, at + 0.1);
    });
  }

  /** Muestra solo la diapositiva del paso `i` dentro de su sección */
  function showSlideOf(i: number) {
    const { section, slide } = steps[i];
    slidesOf(section).forEach((s) => {
      gsap.set(s, { autoAlpha: s === slide ? 1 : 0 });
      s.inert = s !== slide;
    });
  }

  /**
   * "Asienta" el escenario en el paso `i`: detiene cualquier animación sobre secciones y
   * diapositivas y deja visible solo ese paso. Se ejecuta antes de cada transición y al
   * terminar cada una, así ningún estado intermedio (por cambios muy rápidos) puede quedar
   * visible: la visibilidad nunca depende del historial de animaciones.
   */
  function settle(i: number) {
    const { section, slide } = steps[i];
    gsap.killTweensOf(allSections);
    gsap.killTweensOf(allSlides);
    allSections.forEach((s) => {
      const active = s === section;
      gsap.set(s, { autoAlpha: active ? 1 : 0, clearProps: 'transform' });
      s.inert = !active;
    });
    allSlides.forEach((s) => {
      const active = s === slide;
      // Las diapositivas de otras secciones quedan listas en "1": su sección ya las oculta
      const visible = s.closest('[data-section]') === section ? active : true;
      gsap.set(s, { autoAlpha: visible ? 1 : 0 });
      s.inert = !active;
      if (!active) {
        // Elementos de diapositivas ocultas en su posición neutra (listos para la próxima entrada)
        const items = Array.from(s.querySelectorAll<HTMLElement>('[data-reveal], [data-reveal-sub], [data-slide-media]'));
        gsap.killTweensOf(items);
        set(items, { autoAlpha: 1, x: 0, y: 0, scale: 1 });
      }
    });
  }

  /** Solo el paso `i` visible (estado inicial y cambio de tamaño) */
  function showOnly(i: number) {
    settle(i);
  }

  /* ──────────────────────────────────────────────
     Navegación interrumpible
     ────────────────────────────────────────────── */
  function go(target: number) {
    if (target < 0 || target >= steps.length) return;

    if (transition) {
      const { from, to, tl } = transition;
      // Regreso a mitad de camino → se rebobina la misma animación (respuesta inmediata)
      if (target === from && !tl.reversed()) {
        announce(from, to, true);
        pending = null;
        if (tl.time() === 0) {
          // Aún no se pintaba ningún frame: no hay nada que rebobinar
          tl.kill();
          transition = null;
          settle(from);
          showEntrance(from);
          return;
        }
        tl.timeScale(MOTION.rewindSpeed).reverse();
        return;
      }
      // Cambio de opinión otra vez → vuelve a avanzar
      if (target === to && tl.reversed()) {
        announce(to, from, true);
        tl.timeScale(MOTION.rewindSpeed).play();
        pending = null;
        return;
      }
      // Otro paso distinto → se acelera el actual y se encadena al terminar
      if (target !== current) {
        pending = target;
        tl.timeScale(MOTION.hurrySpeed);
      }
      return;
    }

    if (target === current) return;
    start(current, target);
  }

  function start(from: number, to: number) {
    const sameSection = steps[from].section === steps[to].section;
    settle(from);
    gsap.killTweensOf(nodes(to, '[data-reveal], [data-reveal-sub], [data-draw], [data-slide-media]'));
    announce(to, from, true);

    const tl = gsap.timeline({
      onComplete: () => finish(from, to),
      onReverseComplete: () => finish(to, from),
    });

    if (sameSection) buildSlideTransition(tl, from, to);
    else buildSectionTransition(tl, from, to);

    transition = { from, to, tl };
  }

  /** Cambio entre secciones distintas (zoom de escenario o de contenido) */
  function buildSectionTransition(tl: gsap.core.Timeline, from: number, to: number) {
    const fromEl = steps[from].section;
    const toEl = steps[to].section;
    const forward = to > from;
    const contentOnly = poseOf(from) === 'background' && poseOf(to) === 'background';

    // La sección que entra muestra la diapositiva correcta antes de aparecer
    if (steps[to].slide) showSlideOf(to);

    if (reduceMotion.matches) {
      tl.to(fromEl, { autoAlpha: 0, duration: 0.3 }).fromTo(toEl, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0.1);
      addEntrance(tl, to, 0.1);
      return;
    }
    const m = contentOnly ? MOTION.content : MOTION.stage;
    // En la transición de contenido, la dirección invierte el sentido del zoom
    const exitScale = contentOnly && !forward ? 2 - m.exit.scale : m.exit.scale;
    const enterScale = contentOnly && !forward ? 2 - m.enter.scale : m.enter.scale;
    // Solo transform + opacity: se resuelven en la GPU, sin repintar
    tl.to(fromEl, { scale: exitScale, autoAlpha: 0, duration: m.exit.duration, ease: m.exit.ease, force3D: true }).fromTo(
      toEl,
      { scale: enterScale, autoAlpha: 0 },
      { scale: 1, autoAlpha: 1, duration: m.enter.duration, ease: m.enter.ease, force3D: true },
      m.enter.at,
    );
    addEntrance(tl, to, m.enter.at + 0.12);
  }

  /** Cambio entre diapositivas del mismo carrusel: horizontal, el marco se queda quieto */
  function buildSlideTransition(tl: gsap.core.Timeline, from: number, to: number) {
    const dir = to > from ? 1 : -1;
    const fromSlide = steps[from].slide!;
    const toSlide = steps[to].slide!;
    const s = MOTION.slide;
    toSlide.inert = false;
    fromSlide.inert = true;

    if (reduceMotion.matches) {
      tl.to(fromSlide, { autoAlpha: 0, duration: 0.25 }).fromTo(toSlide, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 });
      tl.call(() => showEntrance(to));
      return;
    }

    const fromText = slideNodes(from, '[data-reveal]');
    const fromMedia = slideNodes(from, '[data-slide-media]');
    const toText = slideNodes(to, '[data-reveal]');
    const toMedia = slideNodes(to, '[data-slide-media]');
    const toSub = slideNodes(to, '[data-reveal-sub]');

    tl.to(fromText, { x: -s.textShift * dir, autoAlpha: 0, duration: s.exitDuration, stagger: 0.03, ease: 'power2.in' }, 0)
      .to(fromMedia, { x: -s.mediaShift * dir, scale: 0.96, autoAlpha: 0, duration: s.exitDuration + 0.1, ease: 'power2.in' }, 0)
      .set(toSlide, { autoAlpha: 1 }, s.enterAt - 0.05)
      .fromTo(
        toText,
        { x: s.textShift * dir, y: 0, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, duration: s.enterDuration, stagger: 0.05, ease: 'power3.out' },
        s.enterAt,
      )
      .fromTo(
        toMedia,
        { x: s.mediaShift * dir, scale: 0.96, autoAlpha: 0 },
        { x: 0, scale: 1, autoAlpha: 1, duration: s.enterDuration + 0.15, ease: 'power3.out' },
        s.enterAt - 0.05,
      )
      .set(fromSlide, { autoAlpha: 0 }, s.exitDuration + 0.12);
    if (toSub.length) {
      tl.fromTo(
        toSub,
        { autoAlpha: 0, y: MOTION.revealSub.y },
        { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.03, ease: 'power2.out' },
        s.enterAt + 0.15,
      );
    }
  }

  /** `shown` es el paso que quedó visible al terminar (avance o rebobinado) */
  function finish(_hidden: number, shown: number) {
    transition?.tl.kill();
    transition = null;
    settle(shown);
    showEntrance(shown);

    const next = pending;
    pending = null;
    if (next !== null && next !== current) start(current, next);
  }

  /** Actualiza estado, menú, contadores, hash, accesibilidad y la escena 3D */
  function announce(i: number, prev: number, animate: boolean) {
    current = i;
    const step = steps[i];
    const group = groupOf(i);
    const groupList = groups();
    root.dataset.currentSection = step.id;
    root.dataset.rings = poseOf(i);
    allSections.forEach((s) => {
      s.inert = s !== step.section;
    });

    document.querySelectorAll<HTMLElement>('[data-nav-item]').forEach((el) => {
      if (el.dataset.navItem === group) el.setAttribute('aria-current', 'true');
      else el.removeAttribute('aria-current');
    });
    // El contador cuenta secciones del menú; la barra avanza paso a paso
    if (counter) counter.textContent = String(groupList.indexOf(group) + 1).padStart(2, '0');
    if (total) total.textContent = String(groupList.length).padStart(2, '0');
    if (progress) {
      gsap.to(progress, {
        scaleX: (i + 1) / steps.length,
        duration: animate ? 0.9 : 0,
        ease: 'power3.inOut',
        overwrite: true,
      });
    }

    // Carrusel: número, barra, flechas y puntos de la sección
    if (step.slide) syncCarousel(step, animate);

    if (ringsLayer && poseOf(i) !== poseOf(prev)) {
      gsap.to(ringsLayer, {
        ...MOTION.rings[poseOf(i)],
        duration: animate ? (reduceMotion.matches ? 0.3 : 1.2) : 0,
        ease: 'power3.inOut',
        overwrite: true,
      });
    }
    if (animate) {
      const url = i === 0 ? location.pathname + location.search : `#${step.id}`;
      history.replaceState(null, '', url);
    }

    const detail: StageChangeDetail = {
      index: i,
      id: step.id,
      previousId: steps[prev].id,
      direction: i === prev ? 0 : i > prev ? 1 : -1,
      pose: poseOf(i),
    };
    window.dispatchEvent(new CustomEvent(STAGE_CHANGE, { detail }));
  }

  function syncCarousel(step: Step, animate: boolean) {
    const { section, slideIndex: n, slideCount } = step;
    section.querySelectorAll<HTMLElement>('[data-carousel-index]').forEach((el) => {
      el.textContent = String(n + 1).padStart(2, '0');
    });
    section.querySelectorAll<HTMLElement>('[data-carousel-bar]').forEach((el) => {
      gsap.to(el, { scaleX: (n + 1) / slideCount, duration: animate ? 0.7 : 0, ease: 'power3.inOut', overwrite: true });
    });
    section.querySelectorAll<HTMLButtonElement>('[data-carousel-prev]').forEach((b) => (b.disabled = n === 0));
    section.querySelectorAll<HTMLButtonElement>('[data-carousel-next]').forEach((b) => (b.disabled = n === slideCount - 1));
    section.querySelectorAll<HTMLElement>('[data-carousel-goto]').forEach((d) => {
      if (Number(d.dataset.carouselGoto) === n) d.setAttribute('aria-current', 'true');
      else d.removeAttribute('aria-current');
    });
  }

  /** Paso relativo dentro del carrusel actual (no sale de la sección) */
  function slideBy(dir: 1 | -1) {
    const step = steps[current];
    if (!step.slide) return;
    const target = step.slideIndex + dir;
    if (target < 0 || target >= step.slideCount) return;
    go(current + dir);
  }

  /* ── Cambio de tamaño (p. ej. girar el teléfono): se reorganizan los pasos sin perder el lugar ── */
  desktop.addEventListener('change', () => {
    pending = null;
    if (transition) {
      const { tl } = transition;
      if (tl.reversed()) tl.progress(0);
      else tl.progress(1);
      tl.kill();
      transition = null;
    }
    const currentId = steps[current].id;
    const prevPose = poseOf(current);
    buildSteps();
    const i = Math.max(0, resolve(currentId));
    current = i;
    showOnly(i);
    showEntrance(i);
    if (ringsLayer && poseOf(i) !== prevPose) gsap.set(ringsLayer, MOTION.rings[poseOf(i)]);
    announce(i, i, false);
    history.replaceState(null, '', i === 0 ? location.pathname + location.search : `#${steps[i].id}`);
  });

  /* ──────────────────────────────────────────────
     Entradas
     Cada gesto (un movimiento de rueda, un swipe, una tecla) produce como máximo
     un paso por dirección. Así la inercia no se salta pasos, pero un gesto
     nuevo responde al instante, aunque haya una animación en curso.
     ────────────────────────────────────────────── */
  let gesture = 0;
  let usedGesture = -1;
  let usedDir = 0;

  const canInteract = () =>
    inputEnabled &&
    root.dataset.menu !== 'open' &&
    root.dataset.ringsDrag !== 'true' &&
    root.dataset.dialog !== 'open' &&
    root.dataset.typing !== 'true';

  /** `within`: el gesto es horizontal (solo mueve el carrusel, nunca cambia de sección) */
  function request(dir: 1 | -1, gestureId: number, within = false) {
    if (!canInteract()) return;
    const key = within ? dir * 2 : dir;
    if (gestureId === usedGesture && key === usedDir) return; // mismo gesto, misma dirección
    usedGesture = gestureId;
    usedDir = key;
    if (within) slideBy(dir);
    else go(current + dir);
  }

  // Rueda / trackpad (el desplazamiento horizontal del trackpad mueve el carrusel)
  let lastWheel = 0;
  let wheelAccumY = 0;
  let wheelAccumX = 0;
  /** Un textarea que todavía puede desplazarse en esa dirección se queda con la rueda */
  const textareaCanScroll = (target: EventTarget | null, dy: number) => {
    const area = (target as Element | null)?.closest?.('textarea');
    if (!area || area.scrollHeight <= area.clientHeight) return false;
    return dy > 0 ? area.scrollTop + area.clientHeight < area.scrollHeight - 1 : area.scrollTop > 0;
  };

  window.addEventListener(
    'wheel',
    (e) => {
      if (textareaCanScroll(e.target, e.deltaY)) return;
      const now = performance.now();
      if (now - lastWheel > MOTION.wheelGestureGap) {
        gesture++;
        wheelAccumY = 0;
        wheelAccumX = 0;
      }
      lastWheel = now;
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
      wheelAccumY += e.deltaY * unit;
      wheelAccumX += e.deltaX * unit;
      const horizontal = Math.abs(wheelAccumX) > Math.abs(wheelAccumY) && !e.shiftKey;
      const value = horizontal ? wheelAccumX : wheelAccumY;
      if (Math.abs(value) < MOTION.wheelThreshold) return;
      wheelAccumX = 0;
      wheelAccumY = 0;
      request(value > 0 ? 1 : -1, gesture, horizontal && !!steps[current].slide);
    },
    { passive: true },
  );

  // Touch (swipe vertical = pasos; swipe horizontal en un carrusel = diapositivas)
  let touchY = 0;
  let touchX = 0;
  let touchIgnored = false;
  window.addEventListener(
    'touchstart',
    (e) => {
      gesture++;
      touchY = e.touches[0].clientY;
      touchX = e.touches[0].clientX;
      const target = e.target as Element | null;
      touchIgnored = e.touches.length > 1 || !!target?.closest('[data-mobile-menu], dialog');
    },
    { passive: true },
  );
  window.addEventListener(
    'touchmove',
    (e) => {
      if (touchIgnored) return;
      const dy = touchY - e.touches[0].clientY;
      const dx = touchX - e.touches[0].clientX;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) >= MOTION.swipeThreshold && steps[current].slide) request(dx > 0 ? 1 : -1, gesture, true);
        return;
      }
      if (Math.abs(dy) >= MOTION.swipeThreshold) request(dy > 0 ? 1 : -1, gesture);
    },
    { passive: true },
  );

  // Teclado (↑↓ pasos; ←→ dentro del carrusel)
  window.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const el = e.target as HTMLElement | null;
    if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
    if (root.dataset.dialog === 'open') return;

    const map: Record<string, () => void> = {
      ArrowDown: () => request(1, ++gesture),
      PageDown: () => request(1, ++gesture),
      ArrowUp: () => request(-1, ++gesture),
      PageUp: () => request(-1, ++gesture),
      ArrowRight: () => request(1, ++gesture, true),
      ArrowLeft: () => request(-1, ++gesture, true),
      Home: () => canInteract() && go(0),
      End: () => canInteract() && go(steps.length - 1),
    };
    const action = map[e.key];
    if (!action) return;
    e.preventDefault();
    if (!e.repeat) action(); // mantener la tecla presionada no dispara una ráfaga
  });

  // Clics: enlaces internos (menú, botones) y controles de carrusel
  document.addEventListener('click', (e) => {
    const target = e.target as Element | null;
    if (!target || !inputEnabled) return;

    const link = target.closest<HTMLElement>('[data-goto]');
    if (link) {
      e.preventDefault();
      const i = resolve(link.dataset.goto ?? '');
      if (i >= 0) go(i);
      return;
    }
    if (target.closest('[data-carousel-prev]')) return slideBy(-1);
    if (target.closest('[data-carousel-next]')) return slideBy(1);
    const dot = target.closest<HTMLElement>('[data-carousel-goto]');
    if (dot) {
      const step = steps[current];
      const n = Number(dot.dataset.carouselGoto);
      if (step.slide && n >= 0 && n < step.slideCount) go(current - step.slideIndex + n);
    }
  });

  window.addEventListener('hashchange', () => go(indexFromHash()));
}
