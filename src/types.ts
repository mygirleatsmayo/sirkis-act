import type { ComponentType, ReactNode, RefObject } from 'react';

export interface Inputs {
  currentAge: number;
  startAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  currentSalary: number;
  salaryGrowth: number;
  expectedReturn: number;
  inflationRate: number;
  enable401k: boolean;
  enableRoth: boolean;
  enableHSA: boolean;
  contribution401k: number;
  matchPercent: number;
  matchLimit: number;
  rothMatch401k: boolean;
  rothContribution: number;
  hsaContribution: number;
  contributionTiming: string;
}

export interface ProjectionRow {
  age: number;
  isContributing: boolean;
  'Your Contributions': number;
  'Employer Match': number;
  'Employee Contribution (Year)': number;
  'Employer Contribution (Year)': number;
  'Total Contribution (Year)': number;
  'Year Growth': number;
  'Investment Returns': number;
  'Total Nominal': number;
  'Total Real (Today\'s $)': number;
  'Total Real (Retirement $)': number;
  salary: number;
}

export type CardProps = { children: ReactNode; className?: string };
export type BadgeColor = 'brand' | 'returns' | 'loss' | 'neutral' | 'target';
export type BadgeProps = { children: ReactNode; color?: BadgeColor };
export type IconType = ComponentType<{ size?: number; className?: string }>;
export type InputFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  icon?: IconType;
  unit?: string;
  error?: string | null;
  errorState?: boolean;
  helper?: string;
  tooltip?: string;
  disabled?: boolean;
};
export type TooltipIconProps = {
  content: string;
  className?: string;
  align?: 'left' | 'center' | 'right';
  placement?: 'top' | 'bottom';
  width?: string;
};
export type ToggleSectionProps = {
  label: string;
  enabled: boolean;
  onToggle: (value: boolean) => void;
  children: ReactNode;
};
export type SettingsPanelProps = {
  inputs: Inputs;
  handleInputChange: (key: keyof Inputs | 'RESET', value: number | string | boolean) => void;
  formatCurrency: (value: number) => string;
  isMobile?: boolean;
  onOpenSettings?: () => void;
  showDisclosure?: boolean;
  onToggleDisclosure?: () => void;
  disclosureContainerRef?: RefObject<HTMLDivElement | null>;
};
export type InputKey = keyof Inputs;
export type NumericInputKey =
  | 'currentAge'
  | 'startAge'
  | 'retirementAge'
  | 'lifeExpectancy'
  | 'currentSalary'
  | 'salaryGrowth'
  | 'expectedReturn'
  | 'inflationRate'
  | 'contribution401k'
  | 'matchPercent'
  | 'matchLimit'
  | 'rothContribution'
  | 'hsaContribution';
export type BooleanInputKey = 'enable401k' | 'enableRoth' | 'enableHSA' | 'rothMatch401k';
export type SalaryPreset = { label: string; salary: number };
export type InputBounds = Record<NumericInputKey, { min: number; max: number }>;
export type InputValue = Inputs[InputKey] | number | string | boolean;
