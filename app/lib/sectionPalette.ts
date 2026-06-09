import type { Site } from '@/app/lib/types';

export type SectionPalette = {
  bgTop: string;
  bgBottom: string;
  orbBase: string;
  orbGlow: string;
  particle: string;
  spark: string;
  sparkHighlight: string;
  ambientLight: string;
  text: string;
  subtext: string;
  primaryButton: string;
  textOnDark: string;
};

function parseHex(hex: string): [number, number, number] | null {
  const c = hex.replace('#', '').trim();
  if (c.length !== 3 && c.length !== 6) return null;
  const full = c.length === 3 ? c.split('').map((ch) => ch + ch).join('') : c;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return null;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${[clamp(r), clamp(g), clamp(b)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function mixHex(a: string, b: string, t: number): string {
  const ca = parseHex(a);
  const cb = parseHex(b);
  if (!ca || !cb) return a;
  return toHex(
    ca[0] + (cb[0] - ca[0]) * t,
    ca[1] + (cb[1] - ca[1]) * t,
    ca[2] + (cb[2] - ca[2]) * t
  );
}

function lightenHex(hex: string, amount: number): string {
  return mixHex(hex, '#ffffff', amount);
}

function darkenHex(hex: string, amount: number): string {
  return mixHex(hex, '#000000', amount);
}

function resolveThemeHex(...candidates: (string | undefined)[]): string {
  for (const c of candidates) {
    if (c?.trim() && !c.trim().startsWith('var(')) return c.trim();
  }
  return '#888888';
}

/** Theme-derived palette for hero-style gradient sections */
export function buildSectionPalette(site?: Site | null): SectionPalette {
  const theme = site?.theme;

  const pageBg = resolveThemeHex(theme?.pageBackgroundColor, theme?.sectionBackgroundColorLight);
  const sectionBg = resolveThemeHex(theme?.sectionBackgroundColorLight, theme?.pageBackgroundColor);
  const primary = resolveThemeHex(
    theme?.primaryButtonColorLight,
    theme?.primaryButtonColorDark,
    theme?.darkPrimaryColor
  );
  const hover = resolveThemeHex(
    theme?.hoverActiveColorLight,
    theme?.hoverActiveColorDark,
    theme?.primaryButtonColorLight
  );
  const mainText = resolveThemeHex(
    theme?.lightPrimaryColor,
    theme?.mainTextColor,
    theme?.darkPrimaryColor
  );
  const secondaryText = resolveThemeHex(
    theme?.lightSecondaryColor,
    theme?.secondaryTextColor,
    theme?.darkSecondaryColor
  );
  const textOnDark = resolveThemeHex(theme?.textOnDarkColor, '#ffffff');

  const bgTop = lightenHex(pageBg, 0.08);
  const bgBottom = mixHex(sectionBg, primary, 0.4);
  const orbPeach = mixHex(lightenHex(primary, 0.25), lightenHex(sectionBg, 0.1), 0.35);

  return {
    bgTop,
    bgBottom,
    orbBase: lightenHex(orbPeach, 0.12),
    orbGlow: lightenHex(mixHex(primary, orbPeach, 0.5), 0.28),
    particle: darkenHex(mixHex(hover, primary, 0.55), 0.08),
    spark: lightenHex(mixHex(primary, '#ffd54f', 0.35), 0.3),
    sparkHighlight: lightenHex(mixHex(textOnDark, '#fff9c4', 0.4), 0.1),
    ambientLight: lightenHex(pageBg, 0.2),
    text: mainText,
    subtext: secondaryText,
    primaryButton: primary,
    textOnDark,
  };
}
