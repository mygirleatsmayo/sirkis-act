import { describe, it, expect } from 'vitest';
import { formatCurrency, formatCompact } from '../utils/format';

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
