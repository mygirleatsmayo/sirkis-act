import { describe, it, expect } from 'vitest';
import { runProjection } from '../utils/projection';
import { LIMITS, DEFAULT_INPUTS } from '../constants';
import type { Inputs } from '../types';

/** Helper to build inputs with overrides. */
const makeInputs = (overrides: Partial<Inputs> = {}): Inputs => ({
  ...DEFAULT_INPUTS,
  ...overrides,
});

describe('contribution clamping', () => {
  it('clamps employee 401(k) to IRS limit', () => {
    // A very high salary with 100% contribution rate should hit the cap
    const inputs = makeInputs({
      currentSalary: 500_000,
      contribution401k: 100,
      matchPercent: 0,
      enable401k: true,
      enableRoth: false,
      enableHSA: false,
    });
    const data = runProjection(inputs, inputs.startAge);
    const firstYear = data[0];
    // Employee contribution (year) should be clamped
    expect(firstYear['Employee Contribution (Year)']).toBeLessThanOrEqual(LIMITS.max401kEmployee);
  });

  it('clamps total 401(k) (employee + employer) to combined IRS limit', () => {
    const inputs = makeInputs({
      currentSalary: 500_000,
      contribution401k: 100,
      matchPercent: 100,
      matchLimit: 100,
      enable401k: true,
      enableRoth: false,
      enableHSA: false,
    });
    const data = runProjection(inputs, inputs.startAge);
    const firstYear = data[0];
    const total401k =
      firstYear['Employee Contribution (Year)'] +
      firstYear['Employer Contribution (Year)'];
    expect(total401k).toBeLessThanOrEqual(LIMITS.max401kTotal);
  });

  it('clamps Roth IRA contribution to annual limit', () => {
    const inputs = makeInputs({
      enableRoth: true,
      rothMatch401k: false,
      rothContribution: 999_999,
      enable401k: false,
      enableHSA: false,
    });
    const data = runProjection(inputs, inputs.startAge);
    // Only Roth contributes; total user contribution ≤ rothAnnual
    expect(data[0]['Employee Contribution (Year)']).toBeLessThanOrEqual(LIMITS.rothAnnual);
  });

  it('clamps HSA contribution to family limit', () => {
    const inputs = makeInputs({
      enableHSA: true,
      hsaContribution: 999_999,
      enable401k: false,
      enableRoth: false,
    });
    const data = runProjection(inputs, inputs.startAge);
    expect(data[0]['Employee Contribution (Year)']).toBeLessThanOrEqual(LIMITS.hsaFamily);
  });
});

describe('employer match calculation', () => {
  it('computes match as matchPercent × min(contribution, matchLimit × salary)', () => {
    const inputs = makeInputs({
      currentSalary: 100_000,
      contribution401k: 10, // 10% = $10,000
      matchPercent: 50,     // employer matches 50%
      matchLimit: 6,        // of first 6% of salary = $6,000
      enable401k: true,
      enableRoth: false,
      enableHSA: false,
    });
    const data = runProjection(inputs, inputs.startAge);
    // matchBase = min(10, 6) / 100 = 0.06
    // rawEmployerMatch = 100_000 * 0.06 * 0.50 = $3,000
    expect(data[0]['Employer Contribution (Year)']).toBe(3000);
  });
});

describe('projection behaviour', () => {
  it('produces $0 balance growth with 0% contribution and no accounts enabled', () => {
    const inputs = makeInputs({
      contribution401k: 0,
      enable401k: true,
      matchPercent: 0,
      enableRoth: false,
      enableHSA: false,
      expectedReturn: 7,
    });
    const data = runProjection(inputs, inputs.startAge);
    const last = data[data.length - 1];
    expect(last['Total Nominal']).toBe(0);
  });

  it('inflation adjustment reduces real value over time', () => {
    const inputs = makeInputs({
      inflationRate: 3,
      expectedReturn: 7,
      enable401k: true,
      contribution401k: 10,
      enableRoth: false,
      enableHSA: false,
    });
    const data = runProjection(inputs, inputs.startAge);
    const last = data[data.length - 1];
    // Real (today's $) should be strictly less than nominal
    expect(last['Total Real (Today\'s $)']).toBeLessThan(last['Total Nominal']);
  });

  it('delayed start produces lower final balance than immediate start', () => {
    const inputs = makeInputs({
      currentAge: 23,
      retirementAge: 67,
      enable401k: true,
      contribution401k: 10,
      enableRoth: false,
      enableHSA: false,
    });
    const dataImmediate = runProjection(inputs, 23);
    const dataDelayed = runProjection(inputs, 33);
    const nomImmediate = dataImmediate[dataImmediate.length - 1]['Total Nominal'];
    const nomDelayed = dataDelayed[dataDelayed.length - 1]['Total Nominal'];
    expect(nomDelayed).toBeLessThan(nomImmediate);
  });
});
