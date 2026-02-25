import { describe, it, expect } from 'vitest';
import { formatCurrency, formatCompact, hexAlpha } from '../utils/format';
import { hexToChannels } from '../themes/syncCssVars';

describe('formatCurrency', () => {
  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0');
  });

  it('formats a small integer', () => {
    expect(formatCurrency(42)).toBe('$42');
  });

  it('formats thousands with commas', () => {
    expect(formatCurrency(1234)).toBe('$1,234');
  });

  it('formats large numbers', () => {
    expect(formatCurrency(1234567)).toBe('$1,234,567');
  });

  it('rounds fractional values to zero decimals', () => {
    expect(formatCurrency(1234.56)).toBe('$1,235');
  });

  it('handles negative values', () => {
    expect(formatCurrency(-500)).toBe('-$500');
  });
});

describe('formatCompact', () => {
  it('formats millions with M suffix', () => {
    expect(formatCompact(1234567)).toBe('$1.235M');
  });

  it('formats hundred-thousands with K suffix', () => {
    expect(formatCompact(123456)).toBe('$123.5K');
  });

  it('formats thousands with K suffix', () => {
    expect(formatCompact(1234)).toBe('$1.234K');
  });

  it('formats exactly 1,000 with K suffix', () => {
    expect(formatCompact(1000)).toBe('$1.000K');
  });

  it('falls back to currency format for values under 1,000', () => {
    expect(formatCompact(999)).toBe('$999');
  });

  it('formats zero', () => {
    expect(formatCompact(0)).toBe('$0');
  });

  it('handles negative millions', () => {
    expect(formatCompact(-2500000)).toBe('$-2.500M');
  });
});

describe('hexAlpha', () => {
  it('converts hex to rgba with alpha', () => {
    expect(hexAlpha('#ff8800', 0.5)).toBe('rgba(255,136,0,0.5)');
  });

  it('handles black', () => {
    expect(hexAlpha('#000000', 1)).toBe('rgba(0,0,0,1)');
  });

  it('handles white', () => {
    expect(hexAlpha('#ffffff', 0)).toBe('rgba(255,255,255,0)');
  });

  it('passes through non-hex input unchanged', () => {
    expect(hexAlpha('rgba(10, 20, 30, 0.5)', 0.8)).toBe('rgba(10, 20, 30, 0.5)');
  });

  it('passes through named colors unchanged', () => {
    expect(hexAlpha('red', 0.5)).toBe('red');
  });
});

describe('hexToChannels', () => {
  it('converts hex to space-separated RGB channels', () => {
    expect(hexToChannels('#ff8800')).toBe('255 136 0');
  });

  it('handles black', () => {
    expect(hexToChannels('#000000')).toBe('0 0 0');
  });

  it('handles white', () => {
    expect(hexToChannels('#ffffff')).toBe('255 255 255');
  });

  it('handles lowercase hex', () => {
    expect(hexToChannels('#1a2b3c')).toBe('26 43 60');
  });
});
