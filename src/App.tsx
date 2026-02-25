import { useState, useMemo, useEffect, useRef, memo, useCallback, useId } from 'react';
import type { ReactNode } from 'react';
import {
XAxis,
YAxis,
CartesianGrid,
Tooltip,
AreaChart,
Area,
Line
} from 'recharts';
import {
TrendingUp,
Briefcase,
PiggyBank,
DollarSign,
RotateCcw,
User,
Building2,
Clock,
ChevronDown,
ChevronUp,
Info,
Settings as SettingsIcon
} from 'lucide-react';
import { Drawer } from 'vaul';
import { DEFAULT_INPUTS, LIMITS, SIRKISMS, INPUT_BOUNDS, SALARY_PRESETS } from './constants';
import type {
  CardProps,
  BadgeProps,
  BadgeColor,
  InputFieldProps,
  TooltipIconProps,
  ToggleSectionProps,
  SettingsPanelProps,
  InputKey,
  NumericInputKey,
  BooleanInputKey,
  InputValue,
} from './types';
import { getLossFractionLabel, clampNumber, formatCurrency, formatCompact, hexAlpha } from './utils/format';
import { runProjection } from './utils/projection';
import { useTheme } from './themes/useTheme';
// --- HELPER COMPONENTS ---
const GlassCard = ({ children, className = "" }: CardProps) => (
<div className={`bg-surface-glass border border-subtle shadow-[0_22px_55px_-38px_rgba(0,0,0,0.8)] rounded-[28px] ${className}`}>
{children}
</div>
);
const Card = ({ children, className = "" }: CardProps) => (
<div className={`bg-surface-card rounded-[22px] border border-subtle shadow-[0_16px_32px_-24px_rgba(0,0,0,0.7)] transition-shadow hover:shadow-[0_24px_50px_-36px_rgba(0,0,0,0.85)] ${className}`}>
{children}
</div>
);
const Badge = ({ children, color = "brand" }: BadgeProps) => {
const { theme } = useTheme();
const c = theme.colors;
const palette: Record<BadgeColor, { bg: string; text: string; border: string }> = {
brand: { bg: hexAlpha(c.brand, 0.10), text: c.brand, border: hexAlpha(c.brand, 0.20) },
returns: { bg: hexAlpha(c.returns, 0.10), text: c.returns, border: hexAlpha(c.returns, 0.20) },
loss: { bg: hexAlpha(c.loss, 0.15), text: c.loss, border: hexAlpha(c.loss, 0.20) },
neutral: { bg: c.neutral, text: c.textMuted, border: c.borderSubtle },
};
// BODGE: asymmetric padding compensates for Recursive's high vertical metrics — revisit on font/theme change
const s = palette[color] || palette.brand;
return (
<span
className="px-2.5 pt-[5px] pb-[3px] rounded-lg text-[10px] font-bold uppercase tracking-wider border"
style={{ backgroundColor: s.bg, color: s.text, borderColor: s.border }}
>
{children}
</span>
);
};
interface MetricCardProps {
badgeLabel: string;
badgeColor: BadgeColor;
value: string;
label: string;
isHero?: boolean;
isDelayed: boolean;
useThreeColumnPanels: boolean;
comparisonValue?: string;
twoColumnDelayedContent?: ReactNode;
}
const MetricCard = memo(({ badgeLabel, badgeColor, value, label, isHero = false, isDelayed, useThreeColumnPanels, comparisonValue, twoColumnDelayedContent }: MetricCardProps) => {
const { theme } = useTheme();
const cardClassName = isHero
? `${useThreeColumnPanels ? 'p-4' : 'col-span-2 p-4'} flex flex-col justify-center`
: `${useThreeColumnPanels ? 'p-4' : 'p-3'} flex flex-col justify-center`;
const valueClassName = isHero
? 'text-[clamp(1.5rem,2.5vw,2.8rem)] leading-tight font-black font-mono text-white tracking-tight mb-1'
: `${useThreeColumnPanels ? 'text-[clamp(1.5rem,2.5vw,2.8rem)]' : 'text-[clamp(1.2rem,5vw,1.6rem)]'} leading-tight font-black font-mono text-white tracking-tight mb-1`;
const labelClassName = isHero
? 'text-xs font-bold text-content-subtle uppercase tracking-wider'
: `${useThreeColumnPanels ? 'text-xs' : 'text-[10px]'} font-bold text-content-subtle uppercase tracking-wider`;
return (
<Card className={cardClassName}>
<div className="flex items-center justify-center gap-2 mb-2">
<Badge color={badgeColor}>{badgeLabel}</Badge>
</div>
{isDelayed ? (
<div className="text-center">
<div className={valueClassName}>{value}</div>
<p className={labelClassName}>{label}</p>
{useThreeColumnPanels ? (
comparisonValue != null && (
<div className="rounded-xl bg-surface/60 p-2.5 border border-accent-brand/25 mt-3 text-center">
<div className="text-[clamp(0.625rem,2.5vw,0.75rem)] font-black uppercase tracking-widest" style={{ color: theme.colors.startNow }}>Start Early</div>
<div className="text-[clamp(0.9rem,1.8vw,1.25rem)] font-black font-mono text-white tracking-tight">
{comparisonValue}
</div>
</div>
)
) : twoColumnDelayedContent != null ? (
twoColumnDelayedContent
) : comparisonValue != null ? (
<>
<div className="w-full h-px bg-white/15 mt-2 mb-1" />
<div className="text-[clamp(0.9rem,4vw,1.15rem)] font-black font-mono tracking-tight" style={{ color: theme.colors.startNow }}>
{comparisonValue}
</div>
<p className="text-[9px] font-bold text-content-subtle uppercase tracking-wider">Start Early</p>
</>
) : null}
</div>
) : (
<div className="text-center">
<div className={valueClassName}>{value}</div>
<p className={labelClassName}>{label}</p>
</div>
)}
</Card>
);
});
const TooltipIcon = ({ content, className = "", align = 'center', placement = 'top' }: TooltipIconProps) => {
const [isTouch, setIsTouch] = useState(false);
const [isOpen, setIsOpen] = useState(false);
const containerRef = useRef<HTMLDivElement>(null);
useEffect(() => {
if (typeof window === 'undefined') return;
const media = window.matchMedia('(hover: none) and (pointer: coarse)');
const updateTouch = () => setIsTouch(media.matches);
updateTouch();
media.addEventListener('change', updateTouch);
return () => media.removeEventListener('change', updateTouch);
}, []);
useEffect(() => {
if (!isOpen || !isTouch) return;
const handleOutside = (e: Event) => {
if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
setIsOpen(false);
}
};
document.addEventListener('pointerdown', handleOutside);
return () => document.removeEventListener('pointerdown', handleOutside);
}, [isOpen, isTouch]);
const alignClass = align === 'left'
? 'left-0 translate-x-0'
: align === 'right'
? 'right-0 translate-x-0'
: 'left-1/2 -translate-x-1/2';
const placementClass = placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2';
const visibilityClass = isTouch
? (isOpen ? 'opacity-100' : 'opacity-0')
: 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100';
return (
<div ref={containerRef} className={`relative flex items-center overflow-visible ${className}`}>
<button
type="button"
aria-expanded={isTouch ? isOpen : undefined}
onClick={() => {
if (isTouch) {
setIsOpen((open) => !open);
}
}}
onBlur={() => {
if (isTouch) {
setIsOpen(false);
}
}}
className="group inline-flex items-center text-content-subtle hover:text-accent-brand focus:outline-none"
>
<Info size={12} />
<span className="sr-only">Info</span>
<span className={`pointer-events-none absolute w-64 max-w-[70vw] ${alignClass} ${placementClass} rounded-lg border border-white/15 bg-surface-glass px-3 py-2 text-[11px] font-medium text-content-muted text-left shadow-lg transition-opacity duration-200 z-50 ${visibilityClass}`}>
{content}
</span>
</button>
</div>
);
};
const InputField = ({ label, value, onChange, min, max, step = 1, icon: Icon, unit = "", error, errorState = false, helper, tooltip, disabled = false }: InputFieldProps) => {
const fieldId = useId();
const [draftValue, setDraftValue] = useState(Number.isFinite(value) ? String(value) : "");
useEffect(() => {
setDraftValue(Number.isFinite(value) ? String(value) : "");
}, [value]);
const commitDraft = () => {
const next = draftValue.trim() === "" ? NaN : parseFloat(draftValue);
onChange(next);
};
const hasError = Boolean(error) || errorState;
return (
<div className="mb-8 group">
<div className="flex justify-between items-center mb-3">
<label htmlFor={fieldId} className={`text-sm flex items-center gap-2 transition-colors ${hasError ? 'text-accent-loss font-bold' : 'text-content-secondary font-semibold group-hover:text-accent-brand'}`}>
{Icon && <Icon size={16} className="text-content-subtle group-hover:text-accent-opm transition-colors" />}
{label}
{tooltip && <TooltipIcon content={tooltip} />}
</label>
</div>
<div className="flex items-center gap-4">
<input
type="range"
min={min}
max={max}
step={step}
value={isNaN(value) ? min : value}
onChange={(e) => {
if (disabled) return;
const next = parseFloat(e.target.value);
setDraftValue(String(next));
onChange(next);
}}
disabled={disabled}
aria-label={`${label} slider`}
className={`flex-grow h-1.5 bg-white/15 rounded-lg appearance-none transition-all ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer accent-interactive-slider hover:accent-interactive-slider-hover'}`}
/>
<div className="relative flex items-center group-focus-within:scale-105 transition-transform flex-shrink-0 shadow-sm rounded-xl">
{unit === "$" && (
<span className="absolute left-3 text-content-subtle text-xs font-bold pointer-events-none">$</span>
)}
<input
type="text"
id={fieldId}
inputMode="decimal"
value={draftValue}
placeholder="0"
onChange={(e) => {
if (disabled) return;
setDraftValue(e.target.value);
}}
onBlur={commitDraft}
onKeyDown={(e) => {
if (e.key === 'Enter') {
e.currentTarget.blur();
}
}}
disabled={disabled}
className={`text-right py-2 text-[16px] sm:text-sm font-bold border bg-surface-input focus:bg-surface-input focus:ring-2 outline-none transition-all rounded-xl text-white
${hasError ? 'border-accent-loss/50 focus:ring-accent-loss/20 focus:border-accent-loss' : 'border-theme/50 focus:ring-accent-brand/20 focus:border-accent-brand/60'}
${unit === "$" ? "w-36 pl-6 pr-3" : "w-24 pr-8 pl-3"}
${unit === "%" ? "pr-8 pl-3" : "pr-3"}`}
/>
{unit === "%" && (
<span className="absolute right-3 text-content-subtle text-xs font-bold pointer-events-none">%</span>
)}
</div>
</div>
{(helper || error) && (
<div className={`mt-2 text-[11px] font-medium ${hasError ? 'text-accent-loss' : 'text-content-subtle'}`} aria-live="polite" role={hasError ? 'alert' : undefined}>
{error || helper}
</div>
)}
</div>
);
};
const ToggleSection = ({ label, enabled, onToggle, children }: ToggleSectionProps) => {
const { theme } = useTheme();
return (
<div className={`p-1 rounded-3xl transition-all duration-300 ${enabled ? 'bg-surface/40 border border-subtle' : 'bg-surface/30 border border-transparent opacity-80'}`}>
<div
className={`flex items-center justify-between p-4 cursor-pointer rounded-2xl transition-colors ${enabled ? '' : 'hover:bg-white/[0.05]'}`} style={enabled ? { background: theme.colors.brandBg } : undefined}
onClick={() => onToggle(!enabled)}
role="switch"
aria-checked={enabled}
tabIndex={0}
onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(!enabled); } }}
>
<span className={`font-bold text-sm ${enabled ? '' : 'text-content-subtle'}`} style={enabled ? { color: theme.colors.brand } : undefined}>{label}</span>
<div className={`w-12 h-7 flex items-center rounded-full p-1 transition-all duration-300 ${!enabled ? 'bg-interactive-toggle-off' : ''}`} style={enabled ? { background: theme.colors.brand } : undefined} aria-hidden="true">
<div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${enabled ? 'translate-x-5' : ''}`} />
</div>
</div>
<div className={`transition-all duration-500 ease-in-out ${enabled ? 'max-h-[500px] opacity-100 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'}`}>
<div className="p-5 pt-2">
{children}
</div>
</div>
</div>
);
};
// --- SETTINGS PANEL ---
const SettingsPanel = ({ inputs, handleInputChange, formatCurrency, isMobile = false, onOpenSettings }: SettingsPanelProps) => {
const { theme } = useTheme();
const Logo = theme.branding.logo;
const annualEmployee401k = inputs.enable401k ? inputs.currentSalary * (inputs.contribution401k / 100) : 0;
const matchBase = Math.min(inputs.contribution401k, inputs.matchLimit) / 100;
const annualEmployer401k = inputs.enable401k ? inputs.currentSalary * matchBase * (inputs.matchPercent / 100) : 0;
const annualTotal401k = annualEmployee401k + annualEmployer401k;
const employeeOverCap = annualEmployee401k > LIMITS.max401kEmployee;
const totalOverCap = annualTotal401k > LIMITS.max401kTotal;
const rothMatchedAmount = Math.min(annualEmployee401k, LIMITS.rothAnnual);
const rothEffectiveContribution = inputs.rothMatch401k ? rothMatchedAmount : inputs.rothContribution;
const rothOverCap = inputs.enableRoth && rothEffectiveContribution > LIMITS.rothAnnual;
const hsaOverCap = inputs.enableHSA && inputs.hsaContribution > LIMITS.hsaFamily;
return (
<div className={`${isMobile ? 'pb-32' : 'h-full custom-scrollbar overflow-y-auto pr-4 pl-1'}`}>
<div className="space-y-10 pb-10">
{/* Branding in Sidebar (Desktop) */}
{!isMobile && (
<div className="mb-8 pt-2">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2.5" style={{ color: theme.colors.brand }}>
<Logo className="h-9 w-9" />
<div>
<div className="font-display font-black text-xl tracking-tight leading-tight">{theme.branding.appName}</div>
<div className="text-[10px] font-medium text-content-subtle leading-tight">{theme.branding.tagline}</div>
</div>
</div>
{onOpenSettings && (
  <button
    type="button"
    onClick={onOpenSettings}
    aria-label="Open settings"
    className="p-2 rounded-xl text-content-subtle hover:text-white hover:bg-white/10 transition-colors"
  >
    <SettingsIcon size={18} />
  </button>
)}
</div>
</div>
)}
{/* Timeline Section */}
<section>
<h3 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest mb-6 ml-1" style={{ color: theme.colors.returns }}>
<Clock size={14} /> Timeline
</h3>
<InputField label="Current Age" value={inputs.currentAge} onChange={v => handleInputChange('currentAge', v)} min={18} max={80} icon={User} />
<div className={`relative rounded-2xl mb-6 transition-all duration-300 ${inputs.startAge > inputs.currentAge ? 'bg-accent-returns/8 ring-1 ring-accent-returns/25' : 'bg-transparent'}`}>
<div className="p-4 pb-2">
<InputField
label="Start Investing At"
value={inputs.startAge}
onChange={v => handleInputChange('startAge', v)}
min={inputs.currentAge}
max={inputs.retirementAge - 1}
icon={Clock}
tooltip="Dr. Sirkis started saving at 22. Can you do even better?"
/>
</div>
{inputs.startAge > inputs.currentAge && (
<div className="px-4 pb-4 -mt-3">
<div className="flex items-center justify-between gap-2 text-[11px] font-semibold bg-accent-loss/10 p-2.5 rounded-lg">
<div className="flex items-center gap-2 text-accent-loss/80">
<div className="w-1.5 h-1.5 rounded-full bg-accent-loss animate-pulse" />
{inputs.startAge - inputs.currentAge} year delay active
</div>
<button
type="button"
onClick={() => handleInputChange('startAge', inputs.currentAge)}
className="text-accent-loss/60 hover:text-accent-loss transition-colors font-bold uppercase tracking-widest"
>
Reset
</button>
</div>
</div>
)}
</div>
<InputField label="Retirement Age" value={inputs.retirementAge} onChange={v => handleInputChange('retirementAge', v)} min={inputs.currentAge + 1} max={100} icon={Briefcase} tooltip="Typical retirement ages are in the low-to-mid 60s; full Social Security age is about 66-67." />
<InputField label="Life Expectancy" value={inputs.lifeExpectancy} onChange={v => handleInputChange('lifeExpectancy', v)} min={inputs.retirementAge + 1} max={120} icon={Clock} error={inputs.lifeExpectancy <= inputs.retirementAge ? 'Life expectancy must be greater than retirement age.' : null} tooltip="SSA actuarial tables suggest an 18-year-old in 2026 expects to live to ~80.3–80.8 on average; male ~75.5–78.0, female ~80.8–82.8." />
<InputField label="Current Salary" value={inputs.currentSalary} onChange={v => handleInputChange('currentSalary', v)} min={0} max={1000000} step={1000} unit="$" icon={DollarSign} />
<div className="-mt-3 mb-6">
<div className="flex items-center gap-2 mb-2">
<label htmlFor="salary-major-select" className="text-[10px] font-black text-content-subtle uppercase tracking-widest">Average Starting Salary by Major</label>
<TooltipIcon className="text-[10px]" align="right" placement="top" content="Average starting salaries sourced from the National Association of Colleges and Employers (NACE) 2025 and 2026 reports." />
</div>
<div className="relative">
<select
id="salary-major-select"
value=""
onChange={(e) => {
const next = parseFloat(e.target.value);
if (Number.isFinite(next)) {
handleInputChange('currentSalary', next);
}
}}
className="w-full appearance-none text-[16px] sm:text-sm font-bold p-3 pr-10 rounded-xl border border-theme/50 bg-surface-input text-white shadow-sm"
>
<option value="" disabled>Select a major</option>
{SALARY_PRESETS.map(p => (
<option key={p.salary} value={p.salary}>{p.label} - ${p.salary.toLocaleString()}</option>
))}
</select>
<ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-content-subtle" size={16} />
</div>
</div>
<div className="mt-6">
<div className="flex items-center gap-2 mb-2">
<label className="text-[10px] font-black text-content-subtle uppercase tracking-widest">Contribution Timing</label>
<TooltipIcon placement="top" content="When contributions hit the account. Start of year assumes earlier compounding; mid-year is more conservative." />
</div>
<div className="flex bg-black/20 rounded-xl p-1 shadow-inner border border-subtle">
{['start', 'mid'].map((option) => (
<button
key={option}
onClick={() => handleInputChange('contributionTiming', option)}
aria-pressed={inputs.contributionTiming === option}
className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${inputs.contributionTiming === option ? 'text-white shadow-sm' : 'text-content-subtle hover:text-white hover:bg-white/10'}`} style={inputs.contributionTiming === option ? { background: theme.colors.brand } : undefined}
>
{option === 'start' ? 'Start of Year' : 'Mid Year'}
</button>
))}
</div>
</div>
</section>
{/* Economics Section */}
<section>
<h3 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest mb-6 ml-1" style={{ color: theme.colors.returns }}>
<TrendingUp size={14} /> Market
</h3>
<InputField label="Expected Return" value={inputs.expectedReturn} onChange={v => handleInputChange('expectedReturn', v)} min={0} max={15} step={0.5} unit="%" icon={TrendingUp} tooltip="Long-term stock-heavy portfolios often assume 6-8% nominal returns." />
<InputField label="Salary Growth" value={inputs.salaryGrowth} onChange={v => handleInputChange('salaryGrowth', v)} min={0} max={10} step={0.1} unit="%" icon={TrendingUp} tooltip="Typical wage growth is often around 2-4% per year." />
<InputField label="Inflation Rate" value={inputs.inflationRate} onChange={v => handleInputChange('inflationRate', v)} min={0} max={10} step={0.1} unit="%" icon={TrendingUp} tooltip="Long-run inflation is often around 2-3% per year." />
</section>
{/* Accounts Section */}
<section className="space-y-4">
<h3 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest mb-6 ml-1" style={{ color: theme.colors.returns }}>
<PiggyBank size={14} /> Strategy
</h3>
<ToggleSection label="401(k) / 403(b)" enabled={inputs.enable401k} onToggle={(v) => handleInputChange('enable401k', v)}>
<InputField label="Contribution %" value={inputs.contribution401k} onChange={v => handleInputChange('contribution401k', v)} min={0} max={100} unit="%" errorState={employeeOverCap} tooltip="Percentage of your salary (pre-tax) contributed each pay period." />
<div className="grid grid-cols-2 gap-4 border-t border-subtle pt-6 mt-2">
<div>
<label htmlFor="match-percent" className="text-[10px] font-bold text-content-subtle uppercase mb-2 flex items-center gap-1">Match % <TooltipIcon placement="top" align="left" content="Your employer's match rate, e.g., 50% means they contribute $0.50 for every $1.00 you put in." /></label>
<input id="match-percent" type="number" min={0} max={100} step={1} value={inputs.matchPercent} onChange={(e) => handleInputChange('matchPercent', parseFloat(e.target.value))} className="w-full text-[16px] sm:text-sm font-bold p-2.5 rounded-xl border border-theme/50 bg-surface-input text-white" />
</div>
<div>
<label htmlFor="match-limit" className="text-[10px] font-bold text-content-subtle uppercase mb-2 flex items-center gap-1">Limit % <TooltipIcon placement="top" align="right" content="Employer matches up to this percentage of your salary. Contributions above this threshold get no additional match." /></label>
<input id="match-limit" type="number" min={0} max={100} step={1} value={inputs.matchLimit} onChange={(e) => handleInputChange('matchLimit', parseFloat(e.target.value))} className="w-full text-[16px] sm:text-sm font-bold p-2.5 rounded-xl border border-theme/50 bg-surface-input text-white" />
</div>
</div>
<div className="mt-4 text-[11px]">
<div className={`flex items-start gap-2 ${employeeOverCap || totalOverCap ? 'text-accent-loss' : 'text-content-subtle'}`}>
<Info size={14} className={employeeOverCap || totalOverCap ? 'text-accent-loss' : 'text-accent-opm'} />
<div className="space-y-1">
<div className={employeeOverCap ? 'text-accent-loss' : 'text-content-subtle'}>
Employee est: <span className="font-semibold">{formatCurrency(annualEmployee401k)}</span> (cap <span className="font-bold">{formatCurrency(LIMITS.max401kEmployee)}</span>).
</div>
<div className={totalOverCap ? 'text-accent-loss' : 'text-content-subtle'}>
Employer est: <span className="font-semibold">{formatCurrency(annualEmployer401k)}</span>.
</div>
<div className={`pt-2 border-t ${totalOverCap ? 'border-accent-loss/70 text-accent-loss' : 'border-content-secondary/70 text-content-subtle'}`}>
<div className="text-[10px] font-bold uppercase tracking-widest">Total</div>
<div className="font-semibold">
{formatCurrency(annualTotal401k)} (cap {formatCurrency(LIMITS.max401kTotal)}).
</div>
</div>
</div>
</div>
{(employeeOverCap || totalOverCap) && (
<div className="text-accent-loss font-bold mt-3 text-center" role="alert">Over IRS caps. Projections use capped values.</div>
)}
</div>
</ToggleSection>
<ToggleSection label="Roth IRA" enabled={inputs.enableRoth} onToggle={(v) => handleInputChange('enableRoth', v)}>
<div className="flex items-center justify-between mb-3">
<div className="flex items-center gap-2">
<span className="text-[10px] font-bold text-content-subtle uppercase tracking-widest">Match 401(k) / 403(b)</span>
<TooltipIcon placement="top" content="Matches your 401(k) or 403(b) employee contribution up to the Roth IRA cap." />
</div>
<button
type="button"
role="switch"
aria-checked={inputs.rothMatch401k}
aria-label="Match 401(k) / 403(b)"
onClick={() => handleInputChange('rothMatch401k', !inputs.rothMatch401k)}
className={`w-12 h-7 flex items-center rounded-full p-1 transition-all duration-300 ${!inputs.rothMatch401k ? 'bg-interactive-toggle-off' : ''}`} style={inputs.rothMatch401k ? { background: theme.colors.brand } : undefined}
>
<div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${inputs.rothMatch401k ? 'translate-x-5' : ''}`} aria-hidden="true" />
</button>
</div>
<InputField label="Annual Amount" value={rothEffectiveContribution} onChange={v => handleInputChange('rothContribution', v)} min={0} max={LIMITS.rothAnnual} step={100} unit="$" error={rothOverCap ? 'Exceeds IRS cap. Projections use cap.' : null} disabled={inputs.rothMatch401k} tooltip="After-tax contributions that grow and withdraw tax-free in retirement." />
<div className={`mt-2 text-[11px] ${rothOverCap ? 'text-accent-loss' : 'text-content-subtle'}`}>IRS cap: {formatCurrency(LIMITS.rothAnnual)}.</div>
</ToggleSection>
<ToggleSection label="HSA / Other" enabled={inputs.enableHSA} onToggle={(v) => handleInputChange('enableHSA', v)}>
<InputField label="Annual Amount" value={inputs.hsaContribution} onChange={v => handleInputChange('hsaContribution', v)} min={0} max={LIMITS.hsaFamily} step={100} unit="$" error={hsaOverCap ? 'Exceeds family cap. Projections use cap.' : null} tooltip="Triple-tax-advantaged: contributions, growth, and qualified medical withdrawals are all tax-free." />
<div className={`mt-2 text-[11px] ${hsaOverCap ? 'text-accent-loss' : 'text-content-subtle'}`}>Common caps: {formatCurrency(LIMITS.hsaIndividual)} individual, {formatCurrency(LIMITS.hsaFamily)} family.</div>
</ToggleSection>
</section>
<div className="pt-8 text-center">
<button
onClick={() => handleInputChange('RESET', true)}
className="text-xs font-bold text-content-subtle hover:text-accent-brand flex items-center justify-center gap-2 transition-colors mx-auto"
>
<RotateCcw size={12} /> Reset to Defaults
</button>
</div>
</div>
</div>
);
};

// --- MODULE-SCOPE STYLE OBJECTS (stable references for Recharts shallow-compare) ---
const TOOLTIP_ITEM_STYLE = { padding: 0 };
const BLOB_POSITIONS: Record<string, string> = {
'top-right': 'top-[-15%] right-[-45%] w-[520px] h-[600px]',
'bottom-right': 'bottom-[-15%] right-[-15%] w-[600px] h-[520px]',
'bottom-left': 'bottom-[-15%] left-[-15%] w-[600px] h-[520px]',
'top-left': 'top-[-15%] left-[-45%] w-[520px] h-[600px]',
};

const App = ({ onOpenSettings }: { onOpenSettings?: () => void }) => {
const { theme } = useTheme();
const Logo = theme.branding.logo;
const [inputs, setInputs] = useState(DEFAULT_INPUTS);
const [activeTab, setActiveTab] = useState('chart');
const [isSettingsOpen, setIsSettingsOpen] = useState(false);
const [isNarrowScreen, setIsNarrowScreen] = useState(false);
const [isMediumScreen, setIsMediumScreen] = useState(false);
const [isScrolled, setIsScrolled] = useState(false);
const [showImmediateLine, setShowImmediateLine] = useState(true);
const [quoteIndex, setQuoteIndex] = useState(0);
const [chartSize, setChartSize] = useState({ width: 0, height: 0 });
const peekDragStartY = useRef(0);
const chartContainerRef = useRef<HTMLDivElement | null>(null);
useEffect(() => {
if (inputs.startAge > inputs.currentAge) {
setShowImmediateLine(false);
}
}, [inputs.startAge, inputs.currentAge]);
useEffect(() => {
const updateViewport = () => {
setIsNarrowScreen(window.innerWidth < 640);
setIsMediumScreen(window.innerWidth >= 640 && window.innerWidth < 1024);
};
updateViewport();
window.addEventListener('resize', updateViewport);
return () => window.removeEventListener('resize', updateViewport);
}, []);
useEffect(() => {
const handleScroll = () => {
const scrollY = window.scrollY;
setIsScrolled(scrollY > 60);
};
window.addEventListener('scroll', handleScroll, { passive: true });
return () => window.removeEventListener('scroll', handleScroll);
}, []);
const tooltipContentStyle = useMemo(() => ({
borderRadius: '16px',
border: `1px solid ${theme.colors.borderSubtle}`,
background: theme.colors.bgGlass,
boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
padding: '16px',
color: theme.colors.textPrimary,
}), [theme]);
const tooltipLabelStyle = useMemo(() => ({
color: theme.colors.textPrimary,
marginBottom: '8px',
fontWeight: '900',
fontFamily: theme.fonts.display,
fontSize: '18px',
}), [theme]);
useEffect(() => {
const container = chartContainerRef.current;
if (!container) return;
let frame = 0;
const updateChartReady = () => {
cancelAnimationFrame(frame);
frame = requestAnimationFrame(() => {
const rect = container.getBoundingClientRect();
setChartSize({ width: Math.max(0, Math.floor(rect.width)), height: Math.max(0, Math.floor(rect.height)) });
});
};
updateChartReady();
const resizeObserver = new ResizeObserver(updateChartReady);
resizeObserver.observe(container);
window.addEventListener('orientationchange', updateChartReady);
return () => {
cancelAnimationFrame(frame);
resizeObserver.disconnect();
window.removeEventListener('orientationchange', updateChartReady);
};
}, [activeTab]);

const summarySalary = inputs.currentSalary >= 999500 ? `$${(Math.round(inputs.currentSalary / 100000) / 10).toFixed(1)}M` : `$${Math.round(inputs.currentSalary / 1000)}k`;
const summaryContribution = inputs.enable401k ? `${inputs.contribution401k}%` : 'Off';
// --- CALCULATIONS ---
const { results, chartData, comparisonData, finalData } = useMemo(() => {
const mainResults = runProjection(inputs, inputs.startAge);
const immediateResults = runProjection(inputs, inputs.currentAge);
const mergedResults = mainResults.map((row, index) => ({
...row,
'Immediate Total Nominal': immediateResults[index] ? immediateResults[index]['Total Nominal'] : null,
}));
return {
results: mainResults,
chartData: mergedResults,
comparisonData: immediateResults[immediateResults.length - 1],
finalData: mainResults[mainResults.length - 1]
};
}, [inputs]);
const isDelayed = inputs.startAge > inputs.currentAge;
const nominalAtRetirement = finalData ? finalData['Total Nominal'] : 0;
const startWithdrawAge = inputs.retirementAge + 1;
const withdrawalYears = Math.max(1, inputs.lifeExpectancy - startWithdrawAge + 1);
const yearsToRetirement = Math.max(0, inputs.retirementAge - inputs.currentAge);
const annualReturn = inputs.expectedReturn / 100;
const annualInflation = inputs.inflationRate / 100;
const monthlyReturn = Math.pow(1 + annualReturn, 1 / 12) - 1;
const realMonthlyReturn = Math.pow((1 + annualReturn) / (1 + annualInflation), 1 / 12) - 1;
const monthsInRetirement = withdrawalYears * 12;
const nominalToRealToday = (value: number, age: number) => value / Math.pow(1 + annualInflation, Math.max(0, age - inputs.currentAge));
const realTodayToNominalAtRetirement = (value: number) => value * Math.pow(1 + annualInflation, yearsToRetirement);
const retirementBalanceToday = nominalToRealToday(nominalAtRetirement, inputs.retirementAge);
const monthlyRealWithdrawal = realMonthlyReturn > 0
? (retirementBalanceToday * realMonthlyReturn) / (1 - Math.pow(1 + realMonthlyReturn, -monthsInRetirement))
: retirementBalanceToday / monthsInRetirement;
const monthlyNominalWithdrawal = monthlyReturn > 0
? (nominalAtRetirement * monthlyReturn) / (1 - Math.pow(1 + monthlyReturn, -monthsInRetirement))
: nominalAtRetirement / monthsInRetirement;
const annualNominalWithdrawal = annualReturn > 0
? (nominalAtRetirement * annualReturn) / (1 - Math.pow(1 + annualReturn, -withdrawalYears))
: nominalAtRetirement / withdrawalYears;
const monthlyRealWithdrawalAtRetirement = realTodayToNominalAtRetirement(monthlyRealWithdrawal);
const useThreeColumnPanels = chartSize.width >= 550;
const legendItems = useMemo(() => [
{ label: 'Your Contributions', color: theme.colors.brand, visible: true },
{ label: 'Employer Match (OPM)', color: theme.colors.opm, visible: true },
{ label: 'Investment Returns', color: theme.colors.returns, visible: true },
{ label: 'Start Now Total', color: theme.colors.startNow, visible: isDelayed && showImmediateLine }
], [theme, isDelayed, showImmediateLine]);
const chartMargin = useMemo(() =>
isNarrowScreen
  ? { top: 6, right: 0, left: -2, bottom: 0 }
  : isMediumScreen
    ? { top: 10, right: 0, left: -10, bottom: 0 }
    : { top: 10, right: 12, left: -5, bottom: 0 },
[isNarrowScreen, isMediumScreen]);
const delayYears = inputs.startAge - inputs.currentAge;
const lossAmount = comparisonData && finalData
  ? comparisonData['Total Nominal'] - finalData['Total Nominal']
  : 0;
const lossFraction = comparisonData && comparisonData['Total Nominal'] > 0
  ? lossAmount / comparisonData['Total Nominal']
  : 0;
const missedContributions = useMemo(() => {
  if (!inputs.enable401k || delayYears <= 0) return 0;
  const growthRate = 1 + inputs.salaryGrowth / 100;
  let total = 0;
  for (let i = 0; i < delayYears; i++) {
    total += Math.min(inputs.currentSalary * Math.pow(growthRate, i) * (inputs.contribution401k / 100), LIMITS.max401kEmployee);
  }
  return total;
}, [inputs.enable401k, inputs.salaryGrowth, inputs.currentSalary, inputs.contribution401k, delayYears]);
const lossYearLabel = delayYears === 1 ? 'year' : 'years';
const quickStats = useMemo(() => [
{ label: "Market Funded", value: finalData['Investment Returns'], colorStyle: { color: theme.colors.returns }, bgStyle: { background: theme.colors.returnsBg }, icon: TrendingUp },
{ label: "Self Funded", value: finalData['Your Contributions'], colorStyle: { color: theme.colors.brand }, bgStyle: { background: theme.colors.brandBg }, icon: PiggyBank },
{ label: "Employer (OPM)", value: finalData['Employer Match'], colorStyle: { color: theme.colors.opm }, bgStyle: { background: theme.colors.brandBg }, icon: Building2 },
], [theme, finalData]);
const handleInputChange = useCallback((key: InputKey | 'RESET', value: InputValue) => {
if (key === 'RESET') {
setInputs(DEFAULT_INPUTS);
} else {
setInputs(prev => {
const next = { ...prev };
if (key in INPUT_BOUNDS) {
const bounds = INPUT_BOUNDS[key as NumericInputKey];
const fallback = prev[key as NumericInputKey] as number;
next[key as NumericInputKey] = clampNumber(Number(value), bounds.min, bounds.max, fallback);
} else if (key === 'contributionTiming') {
next.contributionTiming = String(value);
} else {
next[key as BooleanInputKey] = Boolean(value);
}
if (key === 'currentAge') {
next.startAge = Math.max(next.startAge, next.currentAge);
next.retirementAge = Math.max(next.retirementAge, next.currentAge + 1);
}
if (key === 'retirementAge') {
next.startAge = Math.min(next.startAge, next.retirementAge - 1);
next.lifeExpectancy = Math.max(next.lifeExpectancy, next.retirementAge + 1);
}
if (key === 'startAge') {
next.retirementAge = Math.max(next.retirementAge, next.startAge + 1);
}
if (key === 'lifeExpectancy') {
next.retirementAge = Math.min(next.retirementAge, next.lifeExpectancy - 1);
}
next.lifeExpectancy = Math.max(next.lifeExpectancy, next.retirementAge + 1);
return next;
});
}
}, []);
return (
<div className="min-h-[100dvh] w-full max-w-[100vw] flex flex-col lg:flex-row bg-surface font-sans overflow-x-clip relative">
<a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-surface-glass focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-interactive-focus">Skip to content</a>
{/* VIBRANT BACKGROUND */}
<div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
{theme.effects.blobs.map((blob, i) => (
<div
key={i}
className={`absolute ${BLOB_POSITIONS[blob.position] ?? ''} rounded-full blur-3xl hidden lg:block`}
style={{ backgroundColor: blob.color, opacity: blob.opacity }}
/>
))}
</div>
{/* DESKTOP SIDEBAR (GLASS PANEL) */}
<div role="complementary" aria-label="Settings" className="hidden lg:flex flex-col w-[420px] bg-surface-glass border-r border-black/30 z-20 relative shadow-[inset_-1px_0_0_rgba(255,255,255,0.05)]">
<div className="flex-1 overflow-hidden p-8 hover:overflow-y-auto custom-scrollbar">
<SettingsPanel inputs={inputs} handleInputChange={handleInputChange} formatCurrency={formatCurrency} onOpenSettings={onOpenSettings} />
</div>
</div>
{/* MAIN CONTENT AREA */}
<div role="main" id="main-content" className="min-w-0 flex flex-col relative z-10 lg:flex-1 lg:min-h-0">
{/* MOBILE HEADER */}
<div role="banner" className={`lg:hidden flex justify-between items-center px-4 bg-surface border-b border-white/10 sticky top-0 z-30 shadow-sm will-change-transform transition-[padding] duration-300 ease-in-out ${isScrolled ? 'py-1.5' : 'py-3'}`}>
<div className="flex items-center gap-2" style={{ color: theme.colors.brand }}>
<div
  className="transition-transform duration-300 ease-in-out"
  style={{ transform: isScrolled ? 'scale(0.67)' : 'scale(1)', transformOrigin: 'left center' }}
>
  <Logo className="h-9 w-9" />
</div>
<div className="flex flex-col">
<div className="font-display font-black tracking-tight leading-tight text-2xl">{theme.branding.appName}</div>
<div className={`font-medium text-content-subtle leading-tight text-[11px] overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${isScrolled ? 'max-h-0 opacity-0' : 'max-h-6 opacity-100'}`}>{theme.branding.tagline}</div>
</div>
</div>
{onOpenSettings && (
  <button
    type="button"
    onClick={onOpenSettings}
    aria-label="Open settings"
    className="p-2 rounded-xl text-content-subtle hover:text-white hover:bg-white/10 transition-colors"
  >
    <SettingsIcon size={20} />
  </button>
)}
</div>
{/* SCROLLABLE DASHBOARD */}
<div className="overflow-x-clip custom-scrollbar main-scroll lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
<div className="max-w-[1180px] mx-auto px-4 py-4 pb-20 lg:pb-8 lg:px-10 lg:py-8 space-y-4">
{/* BRANDING HERO SECTION */}
<div className="text-left space-y-3 pt-2 pb-1 animate-in slide-in-from-bottom duration-700 fade-in">
<h1 className="text-[2.6rem] sm:text-5xl lg:text-6xl font-display font-black tracking-tight leading-[0.92]">
<span style={{ color: theme.branding.heroLine1Color, textShadow: '0px 1px 0px rgba(255,255,255,0.12), 0px -1px 0px rgba(0,0,0,0.7)' }}>{theme.branding.heroLine1}</span><br />
<span style={{ color: theme.branding.heroLine2Color, textShadow: '0px 1px 0px rgba(255,255,255,0.2), 0px -1px 0px rgba(0,0,0,0.8)' }}>{theme.branding.heroLine2}</span>
</h1>
<p className="text-base sm:text-lg text-content-muted font-medium max-w-2xl lg:ml-1 text-pretty">
{theme.branding.heroSubheadParts ? (
<>{theme.branding.heroSubheadParts.leading}<span className="font-bold text-content-secondary">{theme.branding.heroSubheadParts.emphasis}</span>{theme.branding.heroSubheadParts.trailing}</>
) : theme.branding.heroSubhead}
</p>
{/* SIRKISM QUOTE CAROUSEL */}
<div
  onClick={() => setQuoteIndex(i => (i + 1) % SIRKISMS.length)}
  className="group cursor-pointer select-none max-w-2xl lg:ml-1"
  role="button"
  aria-label="Show next quote"
  tabIndex={0}
  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setQuoteIndex(i => (i + 1) % SIRKISMS.length); } }}
>
  <p className="text-sm sm:text-base font-display italic text-content-subtle transition-opacity duration-300">
    &ldquo;{SIRKISMS[quoteIndex]}&rdquo;
  </p>
  <p className="text-[10px] text-content-subtle/60 mt-1 font-medium tracking-wide uppercase group-hover:text-content-subtle transition-colors">
    <span className="hidden sm:inline">Click</span><span className="sm:hidden">Tap</span> for a new Sirkism
  </p>
</div>
</div>
{/* TOP METRICS GRID (COMPARISON AWARE) */}
<div className={`grid ${useThreeColumnPanels ? 'grid-cols-3 gap-5' : 'grid-cols-2 gap-3'} min-w-0`} aria-live="polite">
{/* TARGET CARD */}
<MetricCard
badgeLabel="Target"
badgeColor="brand"
value={formatCurrency(finalData['Total Nominal'])}
label="Projected Nest Egg"
isHero
isDelayed={isDelayed}
useThreeColumnPanels={useThreeColumnPanels}
comparisonValue={isDelayed ? formatCurrency(comparisonData['Total Nominal']) : undefined}
twoColumnDelayedContent={isDelayed ? (
<>
<div className="grid grid-cols-2 gap-2 mt-3">
<div className="rounded-xl bg-surface/60 p-2.5 border border-accent-brand/25">
<div className="text-[clamp(0.625rem,2.5vw,0.75rem)] font-black uppercase tracking-widest" style={{ color: theme.colors.startNow }}>Start Early</div>
<div className="text-[clamp(0.9rem,4vw,1.15rem)] font-black font-mono text-white">{formatCurrency(comparisonData['Total Nominal'])}</div>
</div>
<div className="rounded-xl bg-surface/60 p-2.5 border border-accent-loss/50">
<div className="text-[clamp(0.625rem,2.5vw,0.75rem)] font-black uppercase tracking-widest" style={{ color: theme.colors.loss }}>Potential Loss</div>
<div className="text-[clamp(0.9rem,4vw,1.15rem)] font-black font-mono text-accent-loss">-{formatCurrency(lossAmount)}</div>
</div>
</div>
<p className="font-display italic font-semibold leading-snug mt-3 text-center tracking-wide"
  style={{ fontSize: 'clamp(0.7rem, 3.75vw, 1rem)', color: theme.colors.loss, textShadow: '0px 1px 0.7px rgba(255,255,255,0.04), 0px -1px 0.7px rgba(0,0,0,0.25)' }}>
{missedContributions > 0
  ? `The cost of waiting ${delayYears} ${lossYearLabel} isn't ${formatCurrency(missedContributions)}…`
  : `The cost of waiting ${delayYears} ${lossYearLabel}…`
}<br />it's {getLossFractionLabel(lossFraction)} <span className="whitespace-nowrap">your retirement.</span>
</p>
</>
) : undefined}
/>
{/* GROWTH CARD */}
<MetricCard
badgeLabel="Growth"
badgeColor="returns"
value={formatCurrency(finalData['Investment Returns'])}
label="Compound Interest"
isDelayed={isDelayed}
useThreeColumnPanels={useThreeColumnPanels}
comparisonValue={isDelayed ? formatCurrency(comparisonData['Investment Returns']) : undefined}
/>
{/* REAL VALUE CARD */}
<MetricCard
badgeLabel="Real Value"
badgeColor="neutral"
value={formatCurrency(finalData['Total Real (Today\'s $)'])}
label="Purchasing Power"
isDelayed={isDelayed}
useThreeColumnPanels={useThreeColumnPanels}
comparisonValue={isDelayed ? formatCurrency(comparisonData['Total Real (Today\'s $)']) : undefined}
/>
</div>
{isDelayed && useThreeColumnPanels && (
<div className="px-4 py-3 grid grid-cols-3 items-center gap-4 rounded-[22px] shadow-[0_16px_32px_-24px_rgba(0,0,0,0.7)]" style={{ background: hexAlpha(theme.colors.loss, 0.10), border: `1px solid ${hexAlpha(theme.colors.loss, 0.50)}` }}>
<div className="col-span-1 text-center">
<div className="text-center text-[clamp(0.65rem,1.1vw,0.85rem)] font-black uppercase tracking-widest" style={{ color: theme.colors.loss }}>Potential Loss</div>
<div className="text-center text-[clamp(1.2rem,2vw,1.7rem)] leading-none font-black font-mono text-accent-loss">-{formatCurrency(lossAmount)}</div>
</div>
<div className="col-span-2 flex items-center justify-center">
<p className="font-display italic font-semibold leading-snug text-center tracking-wide"
  style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.15rem)', color: theme.colors.loss, textShadow: '0px 1px 0.7px rgba(255,255,255,0.04), 0px -1px 0.7px rgba(0,0,0,0.25)' }}>
  {missedContributions > 0
    ? `The cost of waiting ${delayYears} ${lossYearLabel} isn't ${formatCurrency(missedContributions)}…`
    : `The cost of waiting ${delayYears} ${lossYearLabel}…`
  }<br />it's {getLossFractionLabel(lossFraction)} <span className="whitespace-nowrap">your retirement.</span>
</p>
</div>
</div>
)}
{/* MAIN CHART CARD */}
<GlassCard className="p-4 sm:p-5 lg:p-6 !rounded-[26px]">
<div className={`flex mb-4 gap-2 ${chartSize.width <= 500 ? 'flex-col' : 'flex-wrap justify-between items-end gap-3'}`}>
<h2 className="font-display font-black text-[1.9rem] text-white">The Trajectory</h2>
<div className={`flex items-center gap-2 ${chartSize.width <= 500 ? 'justify-between w-full' : 'justify-between ml-auto flex-1 min-w-[200px] max-w-full sm:flex-none sm:justify-end'}`}>
{isDelayed && (
<button
onClick={() => setShowImmediateLine(prev => !prev)}
aria-pressed={showImmediateLine}
className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${showImmediateLine ? 'bg-transparent border border-accent-brand/40 text-accent-brand hover:bg-accent-brand/10' : 'text-white shadow-lg'}`} style={!showImmediateLine ? { background: theme.colors.returns, boxShadow: `0 4px 6px ${theme.colors.returnsBg}` } : undefined}
>
{showImmediateLine ? 'Remove Start-Now' : 'Add Start-Now'}
</button>
)}
<div role="tablist" aria-label="View toggle" className="bg-black/25 p-1 rounded-xl flex text-xs font-bold shadow-inner">
<button
role="tab"
aria-selected={activeTab === 'chart'}
aria-controls="projection-tabpanel"
onClick={() => setActiveTab('chart')}
className={`px-3.5 py-1.5 rounded-lg transition-all shadow-sm ${activeTab === 'chart' ? 'shadow-sm' : 'text-content-subtle hover:text-white hover:bg-white/10 shadow-none'}`} style={activeTab === 'chart' ? { backgroundColor: theme.colors.borderDefault, color: theme.colors.brand } : undefined}
>
Chart
</button>
<button
role="tab"
aria-selected={activeTab === 'table'}
aria-controls="projection-tabpanel"
onClick={() => setActiveTab('table')}
className={`px-3.5 py-1.5 rounded-lg transition-all shadow-sm ${activeTab === 'table' ? 'shadow-sm' : 'text-content-subtle hover:text-white hover:bg-white/10 shadow-none'}`} style={activeTab === 'table' ? { backgroundColor: theme.colors.borderDefault, color: theme.colors.brand } : undefined}
>
Table
</button>
</div>
</div>
</div>
<div className="mt-2 mb-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold text-content-subtle">
{legendItems.filter((item) => item.visible).map((item) => (
<div key={item.label} className="flex items-center gap-2">
<span className="inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
<span>{item.label}</span>
</div>
))}
</div>
<div
ref={chartContainerRef}
id="projection-tabpanel"
role="tabpanel"
aria-label={activeTab === 'chart' ? 'Chart view' : 'Table view'}
className="h-[320px] sm:h-[360px] min-h-[320px] min-w-0 w-full overflow-visible"
>
{activeTab === 'chart' ? (
chartSize.width > 0 && chartSize.height > 0 ? (
<AreaChart width={chartSize.width} height={chartSize.height} data={chartData} margin={chartMargin}>
<defs>
<linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
<stop offset="5%" stopColor={theme.colors.returns} stopOpacity={0.6}/>
<stop offset="95%" stopColor={theme.colors.returns} stopOpacity={0}/>
</linearGradient>
<linearGradient id="colorUser" x1="0" y1="0" x2="0" y2="1">
<stop offset="5%" stopColor={theme.colors.brand} stopOpacity={0.6}/>
<stop offset="95%" stopColor={theme.colors.brand} stopOpacity={0}/>
</linearGradient>
<linearGradient id="colorEmployer" x1="0" y1="0" x2="0" y2="1">
<stop offset="5%" stopColor={theme.colors.opm} stopOpacity={0.6}/>
<stop offset="95%" stopColor={theme.colors.opm} stopOpacity={0}/>
</linearGradient>
</defs>
<CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.colors.textSecondary} strokeOpacity={0.5} />
<XAxis
dataKey="age"
axisLine={false}
tickLine={false}
tick={{fill: theme.colors.textSubtle, fontSize: isNarrowScreen ? 10 : 12, fontWeight: 600}}
dy={isNarrowScreen ? 6 : 10}
/>
<YAxis
width={isNarrowScreen ? 52 : isMediumScreen ? 64 : 68}
axisLine={false}
tickLine={false}
tick={{fill: theme.colors.textSubtle, fontSize: isNarrowScreen ? 10 : 12, fontWeight: 600}}
tickFormatter={(val) => {
const numericVal = typeof val === 'number' ? val : Number(val);
return `$${(numericVal / 1000).toFixed(0)}k`;
}}
/>
<Tooltip
contentStyle={tooltipContentStyle}
formatter={(value) => {
const numericValue = typeof value === 'number' ? value : Number(value || 0);
return [formatCurrency(numericValue), ""];
}}
itemSorter={(item) => -(typeof item.value === 'number' ? item.value : Number(item.value || 0))}
labelStyle={tooltipLabelStyle}
itemStyle={TOOLTIP_ITEM_STYLE}
separator=""
/>
<Area name="Your Contributions" type="monotone" dataKey="Your Contributions" stroke={theme.colors.brand} strokeWidth={3} fill="url(#colorUser)" stackId="1" />
<Area name="Employer Match" type="monotone" dataKey="Employer Match" stroke={theme.colors.opm} strokeWidth={3} fill="url(#colorEmployer)" stackId="1" />
<Area name="Investment Returns" type="monotone" dataKey="Investment Returns" stroke={theme.colors.returns} strokeWidth={3} fill="url(#colorReturns)" stackId="1" />
{isDelayed && showImmediateLine && (
<Line name="Start Now Total" type="monotone" dataKey="Immediate Total Nominal" stroke={theme.colors.startNow} strokeDasharray="6 6" strokeWidth={2.5} dot={false} />
)}
</AreaChart>
) : (
<div className="h-full w-full rounded-xl bg-white/5" />
)
): (
<div className="h-full overflow-y-auto overflow-x-auto custom-scrollbar border border-subtle rounded-xl bg-surface-card/80">
<table className="w-full text-left text-[11px] sm:text-sm" aria-label="Projection data">
<thead className="bg-surface/80 sticky top-0 font-bold text-content-subtle backdrop-blur z-10">
<tr className="text-[12px] text-center">
<th className="p-2 align-middle text-center" rowSpan={2}>Age</th>
<th className="p-2 text-center" colSpan={3}>Contributions</th>
<th className="p-2 text-center" style={{ color: theme.colors.returns }} colSpan={2}>Growth</th>
<th className="p-2 text-center" colSpan={2}>Totals</th>
</tr>
<tr className="text-[11px] uppercase tracking-wider text-content-subtle text-center">
<th className="p-2 text-center">You</th>
<th className="p-2 text-center">Employer</th>
<th className="p-2 text-center">Total</th>
<th className="p-2 text-center" style={{ color: theme.colors.returns }}>Year</th>
<th className="p-2 text-center" style={{ color: theme.colors.returns }}>Returns</th>
<th className="p-2 text-center">Nominal</th>
<th className="p-2 text-center">Real (Today)</th>
</tr>
</thead>
<tbody className="divide-y divide-white/[0.06] font-mono">
{results.flatMap((row, idx) => {
const isStartYear = row.age === inputs.startAge && isDelayed;
const isWaiting = row.age < inputs.startAge;
const waitingCount = inputs.startAge - inputs.currentAge;
if (isWaiting && waitingCount >= 3) {
if (row.age === inputs.currentAge) {
return [(
<tr key="waiting-summary" className="opacity-40">
<td className="px-2.5 py-3 font-bold text-content-subtle text-center">
<div className="flex flex-col items-center justify-center gap-0.5">
<span>{inputs.currentAge}</span>
<span className="text-[8px] tracking-[0.2em]">•••</span>
<span>{inputs.startAge - 1}</span>
</div>
</td>
<td className="p-2.5 font-medium text-content-secondary text-center">{formatCurrency(0)}</td>
<td className="p-2.5 font-medium text-content-secondary text-center">{formatCurrency(0)}</td>
<td className="p-2.5 font-medium text-content-secondary text-center">{formatCurrency(0)}</td>
<td className="p-2.5 font-bold text-center" style={{ color: theme.colors.returns }}>{formatCurrency(0)}</td>
<td className="p-2.5 font-bold text-center" style={{ color: theme.colors.returns }}>{formatCurrency(0)}</td>
<td className="p-2.5 font-black text-white/90 text-center">{formatCurrency(0)}</td>
<td className="p-2.5 font-semibold text-content-muted text-center">{formatCurrency(0)}</td>
</tr>
)];
}
return [];
}
return [(
<tr key={idx} className={`transition-colors ${isStartYear ? '' : 'hover:bg-white/[0.05]'} ${isWaiting ? 'opacity-50 grayscale' : ''}`} style={isStartYear ? { background: theme.colors.brandBg } : undefined}>
<td className="p-2.5 font-bold text-content-subtle text-center">
{row.age}
</td>
<td className="p-2.5 font-medium text-content-secondary text-center">{formatCurrency(row['Employee Contribution (Year)'])}</td>
<td className="p-2.5 font-medium text-content-secondary text-center">{formatCurrency(row['Employer Contribution (Year)'])}</td>
<td className="p-2.5 font-medium text-content-secondary text-center">{formatCurrency(row['Total Contribution (Year)'])}</td>
<td className="p-2.5 font-bold text-center" style={{ color: theme.colors.returns }}>{formatCurrency(row['Year Growth'])}</td>
<td className="p-2.5 font-bold text-center" style={{ color: theme.colors.returns }}>{formatCurrency(row['Investment Returns'])}</td>
<td className="p-2.5 font-black text-white/90 text-center">{formatCurrency(row['Total Nominal'])}</td>
<td className="p-2.5 font-semibold text-content-muted text-center">{formatCurrency(row['Total Real (Today\'s $)'])}</td>
</tr>
)];
})}
</tbody>
</table>
</div>
)}
</div>
<div className="mt-2 text-[11px] text-content-subtle">
Assumes contributions through the year selected, no contribution at retirement age, and returns compounded annually.
</div>
</GlassCard>
{/* QUICK STATS FOOTER */}
<div className={`grid ${useThreeColumnPanels ? 'grid-cols-3' : 'grid-cols-2'} ${chartSize.width >= 750 ? 'gap-5' : 'gap-3'} min-w-0`} aria-live="polite">
{quickStats.map((stat, i) => {
const isHero = !useThreeColumnPanels && i === 0;
return (
<GlassCard key={i} className={`${isHero ? 'col-span-2' : ''} ${chartSize.width >= 750 ? 'p-4' : 'p-3'} group hover:scale-[1.02] transition-transform duration-300 flex flex-row items-center justify-center ${chartSize.width >= 750 ? 'gap-5' : 'gap-3'}`}>
<div className={`${isHero ? 'p-3.5' : chartSize.width >= 750 ? 'p-2.5' : 'p-2'} rounded-[27%] group-hover:scale-110 transition-transform`} style={{ ...stat.bgStyle, ...stat.colorStyle }}>
<stat.icon size={isHero ? 36 : chartSize.width >= 750 ? 22 : 20} />
</div>
<div className="min-w-0">
<div className={`${isHero ? 'text-[clamp(2rem,6vw,2.8rem)]' : !useThreeColumnPanels ? 'text-[clamp(0.95rem,4vw,1.35rem)]' : 'text-[clamp(1.1rem,2.1vw,1.55rem)]'} leading-tight font-black font-mono tabular-nums`} style={stat.colorStyle}>{!useThreeColumnPanels && !isHero && stat.value >= 1_000_000 ? formatCompact(stat.value) : (useThreeColumnPanels && chartSize.width < 750 && stat.value >= 100_000 ? formatCompact(stat.value) : formatCurrency(stat.value))}</div>
{isHero ? (
<div className="text-xs font-bold text-content-subtle uppercase tracking-wider leading-tight whitespace-nowrap">
{stat.label} · {finalData['Total Nominal'] > 0 ? Math.round((stat.value / finalData['Total Nominal']) * 100) : 0}%
</div>
) : (
<div className={`text-[10px] font-bold text-content-subtle uppercase ${chartSize.width >= 750 ? 'tracking-widest' : !useThreeColumnPanels ? 'tracking-wide' : 'tracking-wider'} leading-tight whitespace-nowrap`}>
<div>{stat.label}</div>
<div>{finalData['Total Nominal'] > 0 ? Math.round((stat.value / finalData['Total Nominal']) * 100) : 0}%</div>
</div>
)}
</div>
</GlassCard>
);
})}
</div>
<GlassCard className="p-5 lg:p-7">
<div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-5">
<div>
<h3 className="font-display font-black text-[1.7rem] text-white">Withdrawals</h3>
<p className="text-[11px] text-content-subtle mt-1">Growth-aware estimates from retirement through <span className="whitespace-nowrap">life expectancy.</span></p>
</div>
<div className="text-[11px] font-bold uppercase tracking-widest text-content-subtle leading-tight md:text-right">
<div>{withdrawalYears} years</div>
<div>Age {startWithdrawAge} to {inputs.lifeExpectancy}</div>
</div>
</div>
<div className={`grid ${useThreeColumnPanels ? 'grid-cols-3 gap-3' : 'grid-cols-2 gap-3'} items-stretch min-w-0`} aria-live="polite">
<div className={`rounded-2xl bg-surface/60 border border-subtle ${useThreeColumnPanels ? 'p-4' : 'col-span-2 p-3'} shadow-sm h-full flex flex-col min-w-0`}>
<div className="text-[10px] font-black uppercase tracking-widest text-content-subtle">Fixed Purchasing Power</div>
<div className="text-[clamp(1.4rem,2.2vw,1.95rem)] leading-none font-black font-mono text-white mt-2 tabular-nums min-w-0">{formatCurrency(monthlyRealWithdrawalAtRetirement)}</div>
<div className="text-[11px] text-content-subtle mt-1">Starts at age {startWithdrawAge} and grows {inputs.inflationRate}% yearly. Equivalent to {formatCurrency(monthlyRealWithdrawal)} <span className="whitespace-nowrap">today (real $ estimate).</span></div>
</div>
<div className={`rounded-2xl bg-surface/60 border border-subtle ${useThreeColumnPanels ? 'p-4' : 'p-3'} shadow-sm h-full flex flex-col min-w-0`}>
<div className="text-[10px] font-black uppercase tracking-widest text-content-subtle">Fixed Monthly</div>
<div className="text-[clamp(1.4rem,2.2vw,1.95rem)] leading-none font-black font-mono text-white mt-2 tabular-nums min-w-0">{formatCurrency(monthlyNominalWithdrawal)}</div>
<div className="text-[11px] text-content-subtle mt-1">At {startWithdrawAge}: {formatCurrency(nominalToRealToday(monthlyNominalWithdrawal, startWithdrawAge))} (real)<br />At {inputs.lifeExpectancy}: {formatCurrency(nominalToRealToday(monthlyNominalWithdrawal, inputs.lifeExpectancy))} (real)</div>
</div>
<div className={`rounded-2xl bg-surface/60 border border-subtle ${useThreeColumnPanels ? 'p-4' : 'p-3'} shadow-sm h-full flex flex-col min-w-0`}>
<div className="text-[10px] font-black uppercase tracking-widest text-content-subtle">Fixed Annual</div>
<div className="text-[clamp(1.4rem,2.2vw,1.95rem)] leading-none font-black font-mono text-white mt-2 tabular-nums min-w-0">{formatCurrency(annualNominalWithdrawal)}</div>
<div className="text-[11px] text-content-subtle mt-1">At {inputs.retirementAge}: {formatCurrency(nominalToRealToday(annualNominalWithdrawal, inputs.retirementAge))} (real)<br />At {inputs.lifeExpectancy}: {formatCurrency(nominalToRealToday(annualNominalWithdrawal, inputs.lifeExpectancy))} (real)</div>
</div>
</div>
<div className="mt-4 text-[11px] text-content-subtle">
Assumes constant returns during retirement and no taxes; for planning only.
</div>
</GlassCard>
<footer className="mt-4 text-center text-[11px] text-content-subtle">
Rolex is a registered trademark. Sirkis Act is not affiliated with, sponsored by, or endorsed by Rolex{' '}
<span className="whitespace-nowrap">(but IS open to sponsorship inquiries).</span>
</footer>
</div>
</div>
{/* MOBILE SETTINGS DRAWER */}
<div className="lg:hidden">
{!isSettingsOpen && (
<div
className="fixed inset-x-0 bottom-0 z-40 cursor-pointer select-none touch-none"
onClick={() => setIsSettingsOpen(true)}
role="button"
aria-label="Open settings"
aria-expanded={false}
aria-controls="settings-drawer"
tabIndex={0}
onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsSettingsOpen(true); }}
onPointerDown={(e) => { peekDragStartY.current = e.clientY; }}
onPointerMove={(e) => {
if (!peekDragStartY.current) return;
if (peekDragStartY.current - e.clientY > 20) {
setIsSettingsOpen(true);
peekDragStartY.current = 0;
}
}}
onPointerUp={() => { peekDragStartY.current = 0; }}
onPointerCancel={() => { peekDragStartY.current = 0; }}
>
<div className="pulse-glow bg-surface border-t border-white/10 shadow-2xl rounded-t-3xl px-4 pt-2 pb-2">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-content-subtle">
<span className="h-1 w-6 rounded-full bg-white/25" />
Inputs
</div>
<ChevronUp size={18} className="text-accent-brand" />
</div>
<div className="mt-1 text-sm font-semibold text-content-secondary">
Age {inputs.currentAge}{isDelayed && <> · <span style={{ color: theme.colors.loss, fontWeight: 900, fontSize: '0.925rem' }}>Start {inputs.startAge}</span></>} · Retire {inputs.retirementAge}
</div>
<div className="text-[11px] text-content-subtle font-medium">
Salary {summarySalary} · 401(k) {summaryContribution}{inputs.enableRoth && ` · Roth $${(Math.round((inputs.rothMatch401k ? Math.min(inputs.currentSalary * (inputs.contribution401k / 100), LIMITS.rothAnnual) : inputs.rothContribution) / 100) / 10).toFixed(1)}k`}
</div>
</div>
<div style={{ height: 'env(safe-area-inset-bottom)' }} />
</div>
)}
<Drawer.Root open={isSettingsOpen} onOpenChange={setIsSettingsOpen} repositionInputs={false}>
<Drawer.Portal>
<Drawer.Overlay className="fixed inset-0 bg-surface-overlay backdrop-blur-sm z-40" />
<Drawer.Content
id="settings-drawer"
className="bg-surface-glass rounded-t-3xl border-t border-white/10 shadow-2xl fixed inset-x-0 bottom-0 z-50 flex flex-col outline-none"
style={{ height: '85dvh' }}
>
<Drawer.Title className="sr-only">Settings</Drawer.Title>
<div className="flex justify-center pt-3 pb-1 flex-shrink-0">
<span className="h-1.5 w-10 rounded-full bg-interactive-toggle-off/80" />
</div>
<div
className="flex-1 overflow-y-auto custom-scrollbar drawer-scroll px-6"
style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 24px)' }}
onFocus={(e) => {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
    setTimeout(() => e.target.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 300);
  }
}}
>
<SettingsPanel inputs={inputs} handleInputChange={handleInputChange} formatCurrency={formatCurrency} isMobile={true} onOpenSettings={onOpenSettings} />
</div>
</Drawer.Content>
</Drawer.Portal>
</Drawer.Root>
</div>
</div>
</div>
);
};
export default App;
