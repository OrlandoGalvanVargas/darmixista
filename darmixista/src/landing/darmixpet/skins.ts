import { initSkinChoice, type SkinEntry } from '../kit/skins';

interface PetSkin extends SkinEntry {
  img: string;
  sm: string;
}

export function initSkins(): void {
  initSkinChoice<PetSkin>((_, s) => {
    document.querySelectorAll<HTMLImageElement>('[data-skin-img]').forEach((img) => (img.src = s.img));
    document.querySelectorAll<HTMLImageElement>('[data-skin-img-sm]').forEach((img) => (img.src = s.sm));
  });
}
