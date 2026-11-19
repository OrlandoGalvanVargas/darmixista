export function logoMark({ id = 'dx', sw = 11, bg = '#080a09', glow = false, anim = false } = {}): string {
  const h = sw / 2;
  const P1 = `M5 ${6 + h}H31Q41 ${6 + h} 48 ${13 + h}L104 ${69 + h}`;
  const P2 = `M5 ${64 - h}H29Q39 ${64 - h} 46 ${57 - h}L102 ${1 - h}`;
  const stem = `5,${6 + h} ${5 + sw},${6 + h} ${5 + sw},${64 - sw - 9} ${5 + sw - 5},${64 - sw - 4} 5,${64 - sw - 4}`;
  const cls = anim ? ' class="logo-green" pathLength="1"' : '';
  return `<defs><clipPath id="${id}-c"><rect x="0" y="6" width="104" height="58"/></clipPath><linearGradient id="${id}-w" x1="0" y1="6" x2="0" y2="64" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fbfbfb"/><stop offset="1" stop-color="#c9cdcb"/></linearGradient><linearGradient id="${id}-g" x1="8" y1="64" x2="96" y2="4" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#15803d"/><stop offset=".5" stop-color="#22c55e"/><stop offset="1" stop-color="#86efac"/></linearGradient>${glow ? `<filter id="${id}-f" x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation="3.2"/></filter>` : ''}</defs>${glow ? `<g filter="url(#${id}-f)" opacity=".45"><path d="${P2}" clip-path="url(#${id}-c)" stroke="#22c55e" stroke-width="${sw}"/></g>` : ''}<g clip-path="url(#${id}-c)" stroke-linejoin="miter" stroke-miterlimit="8"><path d="${P1}" stroke="url(#${id}-w)" stroke-width="${sw}"/><polygon points="${stem}" fill="url(#${id}-w)"/><path d="${P2}" stroke="${bg}" stroke-width="${sw + 5}"/><path d="${P2}" stroke="url(#${id}-g)" stroke-width="${sw}"${cls}/></g>`;
}
