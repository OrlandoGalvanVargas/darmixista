import { gsap } from 'gsap';
import { STAGE_CHANGE } from '../lib/stage-events';

const SHOW = {
  slide: 3.6,
  fly: 1.1,
  reveal: 1.35,
  open: 0.95,
  shut: 0.55,
  back: 0.85,
  spin: 3.2,
};

export function initProjects(): void {
  const section = document.getElementById('projects');
  const modal = document.querySelector<HTMLElement>('[data-vinyl-modal]');
  if (!section || !modal || section.dataset.projectsReady) return;
  section.dataset.projectsReady = 'true';
  document.body.appendChild(modal);

  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');

  const tabs = Array.from(section.querySelectorAll<HTMLButtonElement>('[data-crate-tab]'));
  const pill = section.querySelector<HTMLElement>('.crate-tab-pill');
  const panels = Array.from(section.querySelectorAll<HTMLElement>('[data-crate]'));
  const prev = section.querySelector<HTMLButtonElement>('[data-crate-prev]');
  const next = section.querySelector<HTMLButtonElement>('[data-crate-next]');
  const progress = section.querySelector<HTMLElement>('[data-crate-progress]');
  const bar = progress?.querySelector<HTMLElement>('i') ?? null;

  const activePanel = () => panels.find((p) => !p.hidden) ?? panels[0];
  const activeTrack = () => activePanel()?.querySelector<HTMLElement>('[data-crate-track]') ?? null;

  const movePill = (instant = false) => {
    const tab = tabs.find((t) => t.getAttribute('aria-selected') === 'true');
    if (!tab || !pill) return;
    const vars = { x: tab.offsetLeft, width: tab.offsetWidth };
    if (instant) gsap.set(pill, vars);
    else gsap.to(pill, { ...vars, duration: 0.6, ease: 'expo.out' });
  };

  const syncScroll = () => {
    const track = activeTrack();
    if (!track) return;
    const items = track.querySelectorAll<HTMLElement>('.record');
    const last = items[items.length - 1];
    const edge = last ? last.getBoundingClientRect().right - track.getBoundingClientRect().left + track.scrollLeft : 0;
    const overflow = edge > track.clientWidth + 4;
    const max = track.scrollWidth - track.clientWidth;
    if (prev && next) {
      prev.hidden = !overflow || !fine.matches;
      next.hidden = !overflow || !fine.matches;
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = track.scrollLeft + track.clientWidth >= edge - 4;
    }
    if (progress && bar) {
      progress.hidden = !overflow || fine.matches;
      const w = progress.clientWidth;
      const pw = (track.clientWidth / track.scrollWidth) * w;
      bar.style.setProperty('--pw', `${pw}px`);
      bar.style.setProperty('--px', `${max > 0 ? (track.scrollLeft / max) * (w - pw) : 0}px`);
    }
  };

  panels.forEach((p) => {
    p.querySelector('[data-crate-track]')?.addEventListener('scroll', syncScroll, { passive: true });
  });
  const step = (dir: 1 | -1) => {
    const track = activeTrack();
    const item = track?.querySelector<HTMLElement>('.record');
    if (!track || !item) return;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({ left: dir * (item.offsetWidth + gap), behavior: reduce ? 'auto' : 'smooth' });
  };
  prev?.addEventListener('click', () => step(-1));
  next?.addEventListener('click', () => step(1));

  const select = (key: string) => {
    const tab = tabs.find((t) => t.dataset.crateTab === key);
    const to = panels.find((p) => p.dataset.crate === key);
    const from = activePanel();
    if (!tab || tab.disabled || !to || to === from) return;
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    movePill();
    const outItems = from ? Array.from(from.querySelectorAll<HTMLElement>('.record')) : [];
    const inItems = Array.from(to.querySelectorAll<HTMLElement>('.record'));
    const swap = () => {
      if (from) from.hidden = true;
      to.hidden = false;
      const track = to.querySelector<HTMLElement>('[data-crate-track]');
      if (track) track.scrollLeft = 0;
      syncScroll();
    };
    if (reduce) {
      swap();
      return;
    }
    gsap
      .timeline()
      .to(outItems, { x: -50, autoAlpha: 0, duration: 0.35, stagger: 0.05, ease: 'power2.in' })
      .call(swap)
      .fromTo(
        inItems,
        { x: 70, autoAlpha: 0, rotation: 2 },
        { x: 0, autoAlpha: 1, rotation: 0, duration: 0.8, stagger: 0.08, ease: 'expo.out', clearProps: 'transform,opacity,visibility' },
      )
      .fromTo(
        inItems.map((r) => r.querySelector('.disc')),
        { rotation: -120 },
        { rotation: 0, duration: 1.1, stagger: 0.08, ease: 'expo.out', clearProps: 'transform' },
        '<',
      )
      .set(outItems, { clearProps: 'transform,opacity,visibility' });
  };

  tabs.forEach((tab, n) => {
    tab.addEventListener('click', () => select(tab.dataset.crateTab ?? ''));
    tab.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const enabled = tabs.filter((t) => !t.disabled);
      const i = enabled.indexOf(tab);
      const target = enabled[(i + (e.key === 'ArrowRight' ? 1 : -1) + enabled.length) % enabled.length];
      target.focus();
      select(target.dataset.crateTab ?? '');
      void n;
    });
  });

  const refresh = () => {
    movePill(true);
    syncScroll();
  };
  window.addEventListener('resize', refresh);
  document.fonts?.ready.then(refresh);
  window.addEventListener(STAGE_CHANGE, (e) => {
    if (e.detail.id === 'projects') requestAnimationFrame(refresh);
  });
  requestAnimationFrame(refresh);

  const slot = modal.querySelector<HTMLElement>('[data-vm-slot]');
  const backdrop = modal.querySelector<HTMLElement>('.vm-backdrop');
  const closeBtn = modal.querySelector<HTMLElement>('.vm-close');
  let record: HTMLElement | null = null;
  let fly: HTMLElement | null = null;
  let spin: gsap.core.Tween | null = null;
  let playing: { stop: () => void; reset?: () => void } | null = null;
  let busy = false;

  const discBox = (rec: HTMLElement) => {
    const art = rec.querySelector<HTMLElement>('.record-art')!;
    const disc = rec.querySelector<HTMLElement>('[data-disc]')!;
    const a = art.getBoundingClientRect();
    const m = new DOMMatrixReadOnly(getComputedStyle(disc).transform === 'none' ? undefined : getComputedStyle(disc).transform);
    const size = a.width * 0.94;
    return {
      left: a.left + a.width * 0.03 + m.m41,
      top: a.top + a.height * 0.03 + m.m42,
      size,
      rotation: (Math.atan2(m.m12, m.m11) * 180) / Math.PI,
    };
  };

  const stage = modal.querySelector<HTMLElement>('[data-vm-stage]');
  let reveal: gsap.core.Timeline | null = null;

  const player = (slug: string) => {
    const screen = modal.querySelector<HTMLElement>(`[data-vm-screen][data-vm-for="${slug}"]`);
    const barsWrap = modal.querySelector<HTMLElement>(`[data-vm-bars][data-vm-for="${slug}"]`);
    if (!screen || !barsWrap) return { stop() {} };
    const shots = Array.from(screen.querySelectorAll<HTMLElement>('[data-vm-shot]'));
    const bars = Array.from(barsWrap.querySelectorAll<HTMLElement>('.vm-bar i'));
    const counter = barsWrap.querySelector<HTMLElement>('[data-vm-index]');
    let index = -1;
    let timer: gsap.core.Tween | null = null;
    let paused = false;
    const show = (n: number) => {
      const from = shots[index];
      index = (n + shots.length) % shots.length;
      const to = shots[index];
      if (counter) counter.textContent = String(index + 1).padStart(2, '0');
      if (from && from !== to) gsap.to(from, { autoAlpha: 0, scale: 0.97, duration: 0.7, ease: 'power2.inOut' });
      gsap.fromTo(
        to,
        { autoAlpha: 0, scale: 1.05, filter: 'blur(8px)' },
        { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out' },
      );
      bars.forEach((b, i) => gsap.set(b, { scaleX: i < index ? 1 : 0 }));
      timer?.kill();
      timer = gsap.to(bars[index], {
        scaleX: 1,
        duration: SHOW.slide,
        ease: 'none',
        paused: paused || reduce,
        onComplete: () => show(index + 1),
      });
    };
    const pause = () => {
      paused = true;
      timer?.pause();
    };
    const resume = () => {
      paused = false;
      if (!reduce) timer?.resume();
    };
    const jump = (e: Event) => {
      const b = (e.target as Element).closest<HTMLElement>('[data-vm-bar]');
      if (b) show(Number(b.dataset.vmBar));
    };
    screen.addEventListener('pointerenter', pause);
    screen.addEventListener('pointerleave', resume);
    screen.addEventListener('pointerdown', pause);
    screen.addEventListener('pointerup', resume);
    screen.addEventListener('pointercancel', resume);
    barsWrap.addEventListener('click', jump);
    show(0);
    return {
      stop() {
        timer?.kill();
        screen.removeEventListener('pointerenter', pause);
        screen.removeEventListener('pointerleave', resume);
        screen.removeEventListener('pointerdown', pause);
        screen.removeEventListener('pointerup', resume);
        screen.removeEventListener('pointercancel', resume);
        barsWrap.removeEventListener('click', jump);
      },
      reset() {
        gsap.set(shots, { autoAlpha: 0, clearProps: 'transform,filter' });
        gsap.set(bars, { scaleX: 0 });
      },
    };
  };

  const loadShots = (slug: string) => {
    modal.querySelectorAll<HTMLElement>(`[data-vm-screen][data-vm-for="${slug}"] [data-vm-shot]`).forEach((shot) => {
      const img = shot.querySelector('img');
      if (!img) return;
      const mark = () => {
        shot.style.setProperty('--bg', `url("${img.currentSrc || img.src}")`);
        if (img.naturalHeight > img.naturalWidth) shot.classList.add('is-tall');
      };
      if (!img.src && img.dataset.src) {
        img.addEventListener('load', mark, { once: true });
        img.src = img.dataset.src;
      } else if (img.complete) mark();
    });
  };

  const circles = () => {
    const r = stage?.getBoundingClientRect();
    const h = slot?.offsetHeight ?? 0;
    return {
      small: `circle(${h * 0.17}px at 50% ${h / 2}px)`,
      big: `circle(${r ? Math.hypot(r.width, r.height) : 2000}px at 50% ${h / 2}px)`,
    };
  };

  const open = (rec: HTMLElement) => {
    if (busy || !slot) return;
    const slug = rec.dataset.record ?? '';
    busy = true;
    record = rec;
    root.dataset.dialog = 'open';
    modal.hidden = false;
    modal.querySelectorAll<HTMLElement>('[data-vm-for]').forEach((el) => (el.hidden = el.dataset.vmFor !== slug));
    const info = modal.querySelector<HTMLElement>(`.vm-info[data-vm-for="${slug}"]`)!;
    const screen = modal.querySelector<HTMLElement>(`[data-vm-screen][data-vm-for="${slug}"]`);
    const barsWrap = modal.querySelector<HTMLElement>(`[data-vm-bars][data-vm-for="${slug}"]`);
    modal.setAttribute('aria-labelledby', `vm-title-${slug}`);
    modal.querySelector<HTMLElement>('.vm-scroll')!.scrollTop = 0;
    loadShots(slug);
    if (screen) gsap.set(screen, { clipPath: circles().small, autoAlpha: 0 });
    if (barsWrap) gsap.set(barsWrap, { autoAlpha: 0 });

    const from = discBox(rec);
    const original = rec.querySelector<HTMLElement>('[data-disc]')!;
    fly = original.cloneNode(true) as HTMLElement;
    fly.removeAttribute('data-disc');
    fly.classList.add('vm-fly');
    modal.appendChild(fly);
    const target = slot.getBoundingClientRect();
    fly.style.setProperty('--disc-size', `${target.width}px`);
    gsap.set(fly, { left: from.left, top: from.top, width: from.size, height: from.size, x: 0, y: 0, rotation: from.rotation, transformOrigin: '50% 50%' });
    rec.classList.add('is-playing');

    const anims = Array.from(info.querySelectorAll<HTMLElement>('[data-vm-anim]'));
    const lis = Array.from(info.querySelectorAll<HTMLElement>('.vm-tracks li'));
    const startShow = () => {
      if (!screen || !fly) return;
      const c = circles();
      reveal = gsap
        .timeline()
        .set(screen, { autoAlpha: 1, clipPath: c.small })
        .call(() => {
          playing = player(slug);
        })
        .to(screen, { clipPath: c.big, duration: SHOW.open, ease: 'expo.inOut' })
        .to(fly, { scale: 0.9, autoAlpha: 0, duration: SHOW.open * 0.8, ease: 'power2.in' }, '<0.1')
        .to(barsWrap, { autoAlpha: 1, duration: 0.5, ease: 'power2.out' }, '-=0.35')
        .set(screen, { clipPath: 'none' });
    };
    const land = () => {
      if (!fly) return;
      gsap.set(fly, { clearProps: 'left,top,width,height' });
      slot.appendChild(fly);
      spin = gsap.to(fly, { rotation: '+=360', duration: SHOW.spin, ease: 'none', repeat: -1 });
      spin.timeScale(0);
      gsap.to(spin, { timeScale: 1, duration: 1.2, ease: 'power2.in' });
      busy = false;
      closeBtn?.focus({ preventScroll: true });
      if (reduce) startShow();
      else reveal = gsap.timeline().call(startShow, undefined, SHOW.reveal);
    };

    if (reduce) {
      gsap.set([backdrop, closeBtn, ...anims, ...lis], { autoAlpha: 1, y: 0 });
      land();
      return;
    }
    gsap
      .timeline({ onComplete: land })
      .fromTo(backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: 'power2.out' }, 0)
      .fromTo(closeBtn, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'back.out(2)' }, 0.5)
      .to(
        fly,
        {
          keyframes: {
            left: [from.left, target.left],
            top: [from.top, Math.min(from.top, target.top) - 40, target.top],
            width: [from.size, target.width],
            height: [from.size, target.height],
            easeEach: 'none',
          },
          duration: SHOW.fly,
          ease: 'power3.inOut',
        },
        0,
      )
      .to(fly, { rotation: from.rotation + 900, duration: SHOW.fly, ease: 'power3.inOut' }, 0)
      .fromTo(anims, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' }, 0.45)
      .fromTo(lis, { autoAlpha: 0, x: -14 }, { autoAlpha: 1, x: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out' }, 0.8);
  };

  const close = () => {
    if (busy || modal.hidden || !fly || !record || !slot) return;
    busy = true;
    reveal?.kill();
    reveal = null;
    const current = playing as ({ stop: () => void; reset?: () => void } | null);
    current?.stop();
    playing = null;
    const rec = record;
    const disc = fly;
    const slug = rec.dataset.record ?? '';
    const screen = modal.querySelector<HTMLElement>(`[data-vm-screen][data-vm-for="${slug}"]`);
    const barsWrap = modal.querySelector<HTMLElement>(`[data-vm-bars][data-vm-for="${slug}"]`);
    const anims = Array.from(modal.querySelectorAll<HTMLElement>('.vm-info:not([hidden]) [data-vm-anim], .vm-info:not([hidden]) li'));
    const screenOpen = !!screen && (gsap.getProperty(screen, 'autoAlpha') as number) > 0;

    const flyBack = () => {
      const box = slot.getBoundingClientRect();
      const rotation = gsap.getProperty(disc, 'rotation') as number;
      spin?.kill();
      spin = null;
      modal.appendChild(disc);
      gsap.set(disc, { left: box.left, top: box.top, width: box.width, height: box.height, rotation, scale: 1, autoAlpha: 1 });
      const to = discBox(rec);
      const finish = () => {
        rec.classList.remove('is-playing');
        disc.remove();
        fly = null;
        modal.hidden = true;
        current?.reset?.();
        gsap.set([backdrop, closeBtn, ...anims], { clearProps: 'all' });
        if (screen) gsap.set(screen, { clearProps: 'all' });
        if (barsWrap) gsap.set(barsWrap, { clearProps: 'all' });
        delete root.dataset.dialog;
        record = null;
        busy = false;
        rec.focus({ preventScroll: true });
      };
      if (reduce) {
        finish();
        return;
      }
      gsap
        .timeline({ onComplete: finish })
        .to(closeBtn, { autoAlpha: 0, scale: 0.6, duration: 0.25 }, 0)
        .to(
          disc,
          {
            left: to.left,
            top: to.top,
            width: to.size,
            height: to.size,
            rotation: Math.round((rotation - 540) / 360) * 360 + to.rotation,
            duration: SHOW.back,
            ease: 'power3.inOut',
          },
          0.05,
        )
        .to(backdrop, { autoAlpha: 0, duration: 0.5, ease: 'power2.inOut' }, 0.3);
    };

    if (reduce) {
      flyBack();
      return;
    }
    const c = circles();
    const tl = gsap.timeline({ onComplete: flyBack });
    tl.to(anims, { autoAlpha: 0, y: 14, duration: 0.25, stagger: 0.015, ease: 'power2.in' }, 0);
    if (barsWrap) tl.to(barsWrap, { autoAlpha: 0, duration: 0.2 }, 0);
    if (screenOpen && screen) {
      tl.fromTo(screen, { clipPath: c.big }, { clipPath: c.small, duration: SHOW.shut, ease: 'expo.in' }, 0)
        .to(disc, { scale: 1, autoAlpha: 1, duration: SHOW.shut * 0.8, ease: 'power2.out' }, SHOW.shut * 0.45)
        .set(screen, { autoAlpha: 0 })
        .to({}, { duration: 0.35 });
    } else {
      tl.to(disc, { scale: 1, autoAlpha: 1, duration: 0.2 }, 0);
    }
  };

  section.addEventListener('click', (e) => {
    const rec = (e.target as Element).closest<HTMLElement>('[data-record]');
    if (rec) open(rec);
  });
  modal.addEventListener('click', (e) => {
    if ((e.target as Element).closest('[data-vm-close]')) close();
  });
  window.addEventListener('keydown', (e) => {
    if (modal.hidden) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== 'Tab') return;
    const focusables = Array.from(
      modal.querySelectorAll<HTMLElement>('button, a[href]'),
    ).filter((el) => !el.closest('[hidden]') && el.offsetParent !== null);
    if (!focusables.length) return;
    const firstEl = focusables[0];
    const lastEl = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === firstEl) {
      e.preventDefault();
      lastEl.focus();
    } else if (!e.shiftKey && document.activeElement === lastEl) {
      e.preventDefault();
      firstEl.focus();
    }
  });
}
