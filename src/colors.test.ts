import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { Colors } from './colors';

/** WCAG 2.2 relative luminance, then the contrast ratio between two colours. */
function channel(value: number): number {
  const srgb = value / 255;
  return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const red = channel(parseInt(hex.slice(1, 3), 16));
  const green = channel(parseInt(hex.slice(3, 5), 16));
  const blue = channel(parseInt(hex.slice(5, 7), 16));
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrast(foreground: string, background: string): number {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (lighter! + 0.05) / (darker! + 0.05);
}

const { light } = Colors;

/**
 * Every pair the design puts text on, with the ratio it actually measures.
 *
 * These are measured, not copied off the design file, which rounds a few of
 * them up — the Match tag is 4.72, where the sheet says 5.1. It still clears
 * AA, so the colours stand; only the quoted number was optimistic.
 */
const textPairs = [
  { name: 'ink on bg', fg: light.ink, bg: light.bg, ratio: 16.19 },
  { name: 'ink2 on bg', fg: light.ink2, bg: light.bg, ratio: 8.29 },
  { name: 'ink3 on bg', fg: light.ink3, bg: light.bg, ratio: 5.06 },
  { name: 'brandText on surface', fg: light.brandText, bg: light.surface, ratio: 5.75 },
  { name: 'matchFg on matchBg', fg: light.matchFg, bg: light.matchBg, ratio: 4.72 },
  { name: 'subFg on subBg', fg: light.subFg, bg: light.subBg, ratio: 6.83 },
  { name: 'differsFg on differsBg', fg: light.differsFg, bg: light.differsBg, ratio: 5.49 },
  { name: 'unsureFg on unsureBg', fg: light.unsureFg, bg: light.unsureBg, ratio: 7.51 },
  { name: 'ink on glow', fg: light.ink, bg: light.glow, ratio: 9.75 },
  { name: 'ink on glowTint', fg: light.ink, bg: light.glowTint, ratio: 15.25 },
];

describe('light palette', () => {
  for (const { name, fg, bg, ratio } of textPairs) {
    test(`${name} clears WCAG AA for body text`, () => {
      const measured = contrast(fg, bg);
      assert.ok(measured >= 4.5, `${name} is ${measured.toFixed(2)}:1, below the 4.5 AA floor`);
    });

    test(`${name} still measures ${ratio}:1`, () => {
      const measured = contrast(fg, bg);
      assert.ok(
        Math.abs(measured - ratio) < 0.05,
        `${name} moved to ${measured.toFixed(2)}:1 from ${ratio}:1`,
      );
    });
  }

  /**
   * The one documented exception, pinned so a palette edit has to look at it.
   * White on brand is 4.35:1 — fine for large text (3:1), under AA for normal
   * text, and a primary button label is 16/700, which WCAG counts as normal.
   * Darkening brand toward brandPressed would clear it; that is a design call.
   */
  test('white on brand sits just under AA for normal text', () => {
    const measured = contrast(light.onBrand, light.brand);
    assert.ok(Math.abs(measured - 4.35) < 0.05, `white on brand moved to ${measured.toFixed(2)}:1`);
    assert.ok(measured < 4.5, 'white on brand now clears AA — update this test and the note above');
  });
});
