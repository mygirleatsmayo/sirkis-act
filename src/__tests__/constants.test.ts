import { describe, it, expect } from 'vitest';
import { LIMITS, DEFAULT_INPUTS } from '../constants';

describe('LIMITS', () => {
  it('has only positive numeric values', () => {
    for (const [key, value] of Object.entries(LIMITS)) {
      expect(value, `LIMITS.${key}`).toBeTypeOf('number');
      expect(value, `LIMITS.${key}`).toBeGreaterThan(0);
    }
  });
});

describe('DEFAULT_INPUTS', () => {
  const expectedKeys: string[] = [
    'currentAge',
    'startAge',
    'retirementAge',
    'lifeExpectancy',
    'currentSalary',
    'salaryGrowth',
    'expectedReturn',
    'inflationRate',
    'enable401k',
    'enableRoth',
    'enableHSA',
    'contribution401k',
    'matchPercent',
    'matchLimit',
    'rothMatch401k',
    'rothContribution',
    'hsaContribution',
    'contributionTiming',
    'enableStartingBalances',
    'starting401k',
    'startingRoth',
    'startingHSA',
  ];

  it('contains all expected keys', () => {
    for (const key of expectedKeys) {
      expect(DEFAULT_INPUTS).toHaveProperty(key);
    }
  });

  it('has no unexpected extra keys', () => {
    const actualKeys = Object.keys(DEFAULT_INPUTS);
    expect(actualKeys.sort()).toEqual(expectedKeys.sort());
  });
});
