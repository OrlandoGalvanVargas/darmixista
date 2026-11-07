import { revealFrom, syncThemeColor } from './kit';

export interface SkinEntry {
  bgLight: string;
  bgDark: string;
}

export function initSkinChoice<T extends SkinEntry>(onApply?: (id: string, skin: T) => void): void {
  const node = document.getElementById('k-skin-data');
  if (!node) return;
  const skins = JSON.parse(node.textContent ?? '{}') as Record<string, T>;
  const root = document.documentElement;
  let current = root.dataset.skin ?? Object.keys(skins)[0];

  const apply = (id: string, x: number, y: number) => {
    const s = skins[id];
    if (!s || id === current) return;
    current = id;
    revealFrom(x, y, () => {
      root.dataset.skin = id;
      root.dataset.bgLight = s.bgLight;
      root.dataset.bgDark = s.bgDark;
      onApply?.(id, s);
      document.querySelectorAll<HTMLElement>('[data-skin-choice]').forEach((b) => {
        b.setAttribute('aria-checked', String(b.dataset.skinChoice === id));
        b.tabIndex = b.dataset.skinChoice === id ? 0 : -1;
      });
      syncThemeColor();
    });
  };

  const choices = [...document.querySelectorAll<HTMLElement>('[data-skin-choice]')];
  choices.forEach((b, i) => {
    b.addEventListener('click', (e) => {
      const r = b.getBoundingClientRect();
      const me = e as MouseEvent;
      apply(b.dataset.skinChoice!, me.clientX || r.left + r.width / 2, me.clientY || r.top + r.height / 2);
    });
    b.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      const next = choices[(i + d + choices.length) % choices.length];
      next.focus();
      next.click();
    });
  });
}
