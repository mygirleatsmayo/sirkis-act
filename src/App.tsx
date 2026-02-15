import { useState, useMemo, useEffect, useRef, type ComponentType, type ReactNode } from 'react';
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
Coins,
Clock,
ChevronDown,
ChevronUp,
Info
} from 'lucide-react';
// --- CONSTANTS ---
const DEFAULT_INPUTS = {
currentAge: 23,
startAge: 23,
retirementAge: 67,
lifeExpectancy: 83,
currentSalary: 68870,
salaryGrowth: 3,
expectedReturn: 7,
inflationRate: 2.5,
enable401k: true,
enableRoth: false,
enableHSA: false,
contribution401k: 10,
matchPercent: 50,
matchLimit: 6,
rothMatch401k: true,
rothContribution: 7000,
hsaContribution: 4150,
contributionTiming: 'start',
};
const LIMITS = {
max401kEmployee: 23000,
max401kTotal: 69000,
rothAnnual: 7500,
hsaIndividual: 4150,
hsaFamily: 8300,
};
// --- HELPER COMPONENTS ---
type CardProps = { children: ReactNode; className?: string };
const GlassCard = ({ children, className = "" }: CardProps) => (
<div className={`bg-gradient-to-br from-white/95 via-white/80 to-slate-50/80 backdrop-blur-2xl border border-white/80 shadow-[0_22px_55px_-38px_rgba(15,23,42,0.55)] rounded-[28px] ${className}`}>
{children}
</div>
);
const Card = ({ children, className = "" }: CardProps) => (
<div className={`bg-white/90 backdrop-blur-md rounded-[22px] border border-slate-200/70 shadow-[0_16px_32px_-24px_rgba(15,23,42,0.55)] ring-1 ring-slate-100/80 transition-shadow hover:shadow-[0_24px_50px_-36px_rgba(15,23,42,0.6)] ${className}`}>
{children}
</div>
);
type LogoProps = { className?: string };
const CrownLogo = ({ className = "" }: LogoProps) => (
<svg className={className} viewBox="0 0 2823 2906" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" xmlSpace="preserve" style={{ fillRule: 'evenodd', clipRule: 'evenodd', strokeLinejoin: 'round', strokeMiterlimit: 2 }}>
<g>
<path fill="currentColor" d="M2658.782,595.366c90.141,1.653 163.393,76.261 163.393,166.417c0,90.197 -73.318,164.824 -163.501,166.419c-7.079,0 -12.267,-1.189 -19.13,-2.054l-493.229,1690.987c-166.121,387.688 -1273.739,380.771 -1398.357,0l-546.135,-1637.271c-11.623,2.528 -23.483,3.803 -35.377,3.803c-91.309,0 -166.445,-75.136 -166.445,-166.445c0,-91.309 75.136,-166.445 166.445,-166.445c91.309,0 166.445,75.136 166.445,166.445c0,51.095 -23.527,99.444 -63.733,130.974l651.893,1163.658l-193.466,-1599.28c-2.324,0.108 -4.918,0.324 -7.295,0.324c-91.309,0 -166.445,-75.136 -166.445,-166.445c0,-91.309 75.136,-166.445 166.445,-166.445c91.309,0 166.445,75.136 166.445,166.445c0.031,61.621 -34.417,118.339 -89.113,146.72l448.862,1528.595l154.448,-1692.77c-79.602,-12.483 -140.884,-79.494 -140.884,-162.554c0,-91.309 75.136,-166.445 166.445,-166.445c91.309,0 166.445,75.136 166.445,166.445c0.162,74.617 -50.498,140.43 -122.672,159.366l191.628,1737.516l387.364,-1575.07c-64.579,-22.967 -110.729,-83.331 -110.729,-155.691c0,-91.309 75.136,-166.445 166.445,-166.445c91.365,0.005 166.545,75.188 166.545,166.553c0,86.075 -66.726,158.693 -152.494,165.959l-117.917,1613.169l564.455,-1211.43c-44.854,-29.83 -73.225,-80.629 -73.225,-138.56c0,-91.309 75.136,-166.445 166.445,-166.445Zm-1225.319,2196.862c282.2,0 481.07,-85.06 481.07,-190.007c0,-104.947 -198.816,-154.232 -481.07,-154.232c-282.255,0 -511.063,49.285 -511.063,154.232c0,104.947 228.808,190.007 511.063,190.007Z"/>
</g>
</svg>
);
type BadgeColor = 'indigo' | 'emerald' | 'rose' | 'amber' | 'slate';
type BadgeProps = { children: ReactNode; color?: BadgeColor };
const Badge = ({ children, color = "indigo" }: BadgeProps) => {
const styles = {
indigo: "bg-purple-600/10 text-purple-900 border-purple-200/30",
emerald: "bg-amber-500/10 text-amber-800 border-amber-200/30",
rose: "bg-rose-500/10 text-rose-800 border-rose-200/20",
amber: "bg-amber-600/10 text-amber-900 border-amber-200/30",
slate: "bg-slate-500/10 text-slate-600 border-slate-200/20",
};
return (
<span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${styles[color] || styles.indigo}`}>
{children}
</span>
);
};
type ComparisonRowProps = { label: string; value: string; subLabel?: ReactNode; isPrimary?: boolean };
const ComparisonRow = ({ label, value, subLabel, isPrimary = false }: ComparisonRowProps) => (
<div className={`flex justify-between items-baseline ${isPrimary ? 'text-slate-900' : 'text-slate-500'}`}>
<span className="text-xs font-bold uppercase tracking-wide opacity-80">{label}</span>
<div className="text-right">
<div className={`font-black tracking-tight ${isPrimary ? 'text-lg sm:text-2xl font-serif' : 'text-sm'}`}>
{value}
</div>
{subLabel && <div className="text-[10px] font-medium opacity-60">{subLabel}</div>}
</div>
</div>
);
type IconType = ComponentType<{ size?: number; className?: string }>;
type InputFieldProps = {
label: string;
value: number;
onChange: (value: number) => void;
min: number;
max: number;
step?: number;
icon?: IconType;
unit?: string;
error?: string | null;
helper?: string;
tooltip?: string;
disabled?: boolean;
};
type TooltipIconProps = {
content: string;
className?: string;
align?: 'left' | 'center' | 'right';
placement?: 'top' | 'bottom';
};
const TooltipIcon = ({ content, className = "", align = 'center', placement = 'top' }: TooltipIconProps) => {
const [isTouch, setIsTouch] = useState(false);
const [isOpen, setIsOpen] = useState(false);
useEffect(() => {
if (typeof window === 'undefined') return;
const media = window.matchMedia('(hover: none) and (pointer: coarse)');
const updateTouch = () => setIsTouch(media.matches);
updateTouch();
media.addEventListener('change', updateTouch);
return () => media.removeEventListener('change', updateTouch);
}, []);
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
<div className={`relative flex items-center overflow-visible ${className}`}>
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
className="group inline-flex items-center text-slate-400 hover:text-purple-600 focus:outline-none"
>
<Info size={12} />
<span className="sr-only">Info</span>
<span className={`pointer-events-none absolute w-64 max-w-[70vw] ${alignClass} ${placementClass} rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-[11px] font-medium text-slate-600 shadow-lg transition-opacity duration-200 z-50 ${visibilityClass}`}>
{content}
</span>
</button>
</div>
);
};
const InputField = ({ label, value, onChange, min, max, step = 1, icon: Icon, unit = "", error, helper, tooltip, disabled = false }: InputFieldProps) => {
const [draftValue, setDraftValue] = useState(Number.isFinite(value) ? String(value) : "");
useEffect(() => {
setDraftValue(Number.isFinite(value) ? String(value) : "");
}, [value]);
const commitDraft = () => {
const next = draftValue.trim() === "" ? NaN : parseFloat(draftValue);
onChange(next);
};
const hasError = Boolean(error);
return (
<div className="mb-8 group">
<div className="flex justify-between items-center mb-3">
<label className={`text-sm font-semibold flex items-center gap-2 transition-colors ${hasError ? 'text-rose-600' : 'text-slate-700 group-hover:text-purple-700'}`}>
{Icon && <Icon size={16} className="text-slate-400 group-hover:text-purple-500 transition-colors" />}
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
className={`flex-grow h-1.5 bg-slate-200/60 rounded-lg appearance-none transition-all ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer accent-purple-700 hover:accent-purple-600'}`}
/>
<div className="relative flex items-center group-focus-within:scale-105 transition-transform flex-shrink-0 shadow-sm rounded-xl">
{unit === "$" && (
<span className="absolute left-3 text-slate-500 text-xs font-bold pointer-events-none">$</span>
)}
<input
type="text"
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
className={`text-right py-2 text-[16px] sm:text-sm font-bold border bg-white/50 focus:bg-white focus:ring-2 outline-none transition-all rounded-xl text-slate-800
${hasError ? 'border-rose-300 focus:ring-rose-300/40 focus:border-rose-500' : 'border-white/60 focus:ring-purple-500/20 focus:border-purple-600'}
${unit === "$" ? "w-36 pl-6 pr-3" : "w-24 pr-8 pl-3"}
${unit === "%" ? "pr-8 pl-3" : "pr-3"}`}
/>
{unit === "%" && (
<span className="absolute right-3 text-slate-500 text-xs font-bold pointer-events-none">%</span>
)}
</div>
</div>
{(helper || error) && (
<div className={`mt-2 text-[11px] font-medium ${hasError ? 'text-rose-600' : 'text-slate-500'}`}>
{error || helper}
</div>
)}
</div>
);
};
type ToggleSectionProps = { label: string; enabled: boolean; onToggle: (value: boolean) => void; children: ReactNode };
const ToggleSection = ({ label, enabled, onToggle, children }: ToggleSectionProps) => (
<div className={`p-1 rounded-3xl transition-all duration-300 ${enabled ? 'bg-gradient-to-br from-white/60 to-white/30 shadow-sm border border-white/50' : 'bg-white/20 border border-transparent opacity-80'}`}>
<div
className={`flex items-center justify-between p-4 cursor-pointer rounded-2xl transition-colors ${enabled ? 'bg-purple-50/60' : 'hover:bg-white/30'}`}
onClick={() => onToggle(!enabled)}
>
<span className={`font-bold text-sm ${enabled ? 'text-purple-900' : 'text-slate-500'}`}>{label}</span>
<div className={`w-12 h-7 flex items-center rounded-full p-1 transition-all duration-300 ${enabled ? 'bg-purple-700' : 'bg-slate-300'}`}>
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
const clampNumber = (value: number, min: number | undefined, max: number | undefined, fallback: number) => {
if (!Number.isFinite(value)) {
return fallback;
}
let next = value;
if (typeof min === 'number') {
next = Math.max(min, next);
}
if (typeof max === 'number') {
next = Math.min(max, next);
}
return next;
};
// --- SETTINGS PANEL ---
type Inputs = typeof DEFAULT_INPUTS;
type SettingsPanelProps = {
inputs: Inputs;
handleInputChange: (key: keyof Inputs | 'RESET', value: number | string | boolean) => void;
formatCurrency: (value: number) => string;
isMobile?: boolean;
};
const SettingsPanel = ({ inputs, handleInputChange, formatCurrency, isMobile = false }: SettingsPanelProps) => {
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
<div className="flex items-center gap-2.5 text-purple-900">
<CrownLogo className="h-9 w-9 text-purple-700" />
<div>
<div className="font-serif font-black text-xl tracking-tight leading-tight">Sirkis Act</div>
<div className="text-[10px] font-medium text-slate-500 leading-tight">Old-Fashioned Financial Planning</div>
</div>
</div>
</div>
)}
{/* Timeline Section */}
<section>
<h3 className="flex items-center gap-2 text-[11px] font-black text-purple-500 uppercase tracking-widest mb-6 ml-1">
<Clock size={14} /> Timeline
</h3>
<InputField label="Current Age" value={inputs.currentAge} onChange={v => handleInputChange('currentAge', v)} min={18} max={80} icon={User} />
<div className={`relative rounded-2xl mb-6 transition-all duration-300 ${inputs.startAge > inputs.currentAge ? 'bg-amber-50/50 ring-1 ring-amber-200/70' : 'bg-transparent'}`}>
<button
type="button"
onClick={() => handleInputChange('startAge', inputs.currentAge)}
className="absolute right-4 top-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-purple-700 transition-colors"
>
Reset to current age
</button>
<div className="p-4 pb-2">
<InputField
label="Start Investing At"
value={inputs.startAge}
onChange={v => handleInputChange('startAge', v)}
min={inputs.currentAge}
max={inputs.retirementAge - 1}
icon={Clock}
/>
</div>
{inputs.startAge > inputs.currentAge && (
<div className="px-4 pb-4 -mt-3">
<div className="flex items-center gap-2 text-[11px] text-amber-800 font-semibold bg-amber-100/60 p-2.5 rounded-lg">
<div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
{inputs.startAge - inputs.currentAge} year delay active
</div>
</div>
)}
</div>
<InputField label="Retirement Age" value={inputs.retirementAge} onChange={v => handleInputChange('retirementAge', v)} min={inputs.currentAge + 1} max={100} icon={Briefcase} tooltip="Typical retirement ages are in the low-to-mid 60s; full Social Security age is about 66-67." />
<InputField label="Life Expectancy" value={inputs.lifeExpectancy} onChange={v => handleInputChange('lifeExpectancy', v)} min={inputs.retirementAge + 1} max={120} icon={Clock} error={inputs.lifeExpectancy <= inputs.retirementAge ? 'Life expectancy must be greater than retirement age.' : null} tooltip="SSA actuarial tables suggest an 18-year-old in 2026 expects to live to ~80.3–80.8 on average; male ~75.5–78.0, female ~80.8–82.8." />
<InputField label="Current Salary" value={inputs.currentSalary} onChange={v => handleInputChange('currentSalary', v)} min={0} max={1000000} step={1000} unit="$" icon={DollarSign} />
<div className="-mt-3 mb-6">
<div className="flex items-center gap-2 mb-2">
<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Average Starting Salary by Major</label>
<TooltipIcon className="text-[10px]" align="right" placement="top" content="Average starting salaries sourced from the National Association of Colleges and Employers (NACE) 2025 and 2026 reports." />
</div>
<div className="relative">
<select
value=""
onChange={(e) => {
const next = parseFloat(e.target.value);
if (Number.isFinite(next)) {
handleInputChange('currentSalary', next);
}
}}
className="w-full appearance-none text-[16px] sm:text-sm font-bold p-3 pr-10 rounded-xl border border-white/60 bg-white/60 text-slate-700 shadow-sm"
>
<option value="" disabled>Select a major</option>
<option value="81535">Computer Science - $81,535</option>
<option value="78731">Engineering - $78,731</option>
<option value="68870">Business - $68,870</option>
<option value="69709">Math and Sciences - $69,709</option>
<option value="67316">Social Sciences - $67,316</option>
<option value="63122">Agriculture/Natural Resources - $63,122</option>
<option value="60353">Communications - $60,353</option>
<option value="59410">Humanities/Liberal Arts - $59,410</option>
</select>
<ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
</div>
</div>
<div className="mt-6">
<div className="flex items-center gap-2 mb-2">
<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contribution Timing</label>
<TooltipIcon placement="top" content="When contributions hit the account. Start of year assumes earlier compounding; mid-year is more conservative." />
</div>
<div className="flex bg-white/60 rounded-xl p-1 shadow-inner border border-white/70">
{['start', 'mid'].map((option) => (
<button
key={option}
onClick={() => handleInputChange('contributionTiming', option)}
className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${inputs.contributionTiming === option ? 'bg-purple-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'}`}
>
{option === 'start' ? 'Start of Year' : 'Mid Year'}
</button>
))}
</div>
</div>
</section>
{/* Economics Section */}
<section>
<h3 className="flex items-center gap-2 text-[11px] font-black text-purple-500 uppercase tracking-widest mb-6 ml-1">
<TrendingUp size={14} /> Market
</h3>
<InputField label="Expected Return" value={inputs.expectedReturn} onChange={v => handleInputChange('expectedReturn', v)} min={0} max={15} step={0.5} unit="%" icon={TrendingUp} tooltip="Long-term stock-heavy portfolios often assume 6-8% nominal returns." />
<InputField label="Salary Growth" value={inputs.salaryGrowth} onChange={v => handleInputChange('salaryGrowth', v)} min={0} max={10} step={0.1} unit="%" icon={TrendingUp} tooltip="Typical wage growth is often around 2-4% per year." />
<InputField label="Inflation Rate" value={inputs.inflationRate} onChange={v => handleInputChange('inflationRate', v)} min={0} max={10} step={0.1} unit="%" icon={TrendingUp} tooltip="Long-run inflation is often around 2-3% per year." />
</section>
{/* Accounts Section */}
<section className="space-y-4">
<h3 className="flex items-center gap-2 text-[11px] font-black text-purple-500 uppercase tracking-widest mb-6 ml-1">
<PiggyBank size={14} /> Strategy
</h3>
<ToggleSection label="401(k) / 403(b)" enabled={inputs.enable401k} onToggle={(v) => handleInputChange('enable401k', v)}>
<InputField label="Contribution %" value={inputs.contribution401k} onChange={v => handleInputChange('contribution401k', v)} min={0} max={100} unit="%" error={employeeOverCap ? 'Employee contribution exceeds IRS cap.' : null} />
<div className="grid grid-cols-2 gap-4 border-t border-purple-100/60 pt-6 mt-2">
<div>
<label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Match %</label>
<input type="number" min={0} max={100} step={1} value={inputs.matchPercent} onChange={(e) => handleInputChange('matchPercent', parseFloat(e.target.value))} className="w-full text-[16px] sm:text-sm font-bold p-2.5 rounded-xl border border-white/60 bg-white/50 text-slate-700" />
</div>
<div>
<label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Limit %</label>
<input type="number" min={0} max={100} step={1} value={inputs.matchLimit} onChange={(e) => handleInputChange('matchLimit', parseFloat(e.target.value))} className="w-full text-[16px] sm:text-sm font-bold p-2.5 rounded-xl border border-white/60 bg-white/50 text-slate-700" />
</div>
</div>
<div className="mt-4 text-[11px]">
<div className={`flex items-start gap-2 ${employeeOverCap || totalOverCap ? 'text-rose-600' : 'text-slate-500'}`}>
<Info size={14} className={employeeOverCap || totalOverCap ? 'text-rose-500' : 'text-purple-500'} />
<div className="space-y-2">
<div className={employeeOverCap ? 'text-rose-600' : 'text-slate-500'}>
Employee est: <span className="font-semibold">{formatCurrency(annualEmployee401k)}</span> (cap {formatCurrency(LIMITS.max401kEmployee)}).
</div>
<div className={totalOverCap ? 'text-rose-600' : 'text-slate-500'}>
Employer est: <span className="font-semibold">{formatCurrency(annualEmployer401k)}</span>.
</div>
<div className={`pt-2 border-t ${totalOverCap ? 'border-rose-200/70 text-rose-600' : 'border-slate-200/70 text-slate-500'}`}>
<div className="text-[10px] font-bold uppercase tracking-widest">Total</div>
<div className="font-semibold">
{formatCurrency(annualTotal401k)} (cap {formatCurrency(LIMITS.max401kTotal)}).
</div>
</div>
</div>
</div>
{(employeeOverCap || totalOverCap) && (
<div className="text-rose-600">Over IRS caps. Lower contribution % or match inputs.</div>
)}
</div>
</ToggleSection>
<ToggleSection label="Roth IRA" enabled={inputs.enableRoth} onToggle={(v) => handleInputChange('enableRoth', v)}>
<div className="flex items-center justify-between mb-3">
<div className="flex items-center gap-2">
<span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Match 401(k) / 403(b)</span>
<TooltipIcon placement="top" content="Matches your 401(k) or 403(b) employee contribution up to the Roth IRA cap." />
</div>
<button
type="button"
onClick={() => handleInputChange('rothMatch401k', !inputs.rothMatch401k)}
className={`w-12 h-7 flex items-center rounded-full p-1 transition-all duration-300 ${inputs.rothMatch401k ? 'bg-purple-700' : 'bg-slate-300'}`}
>
<div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${inputs.rothMatch401k ? 'translate-x-5' : ''}`} />
</button>
</div>
<InputField label="Annual Amount" value={rothEffectiveContribution} onChange={v => handleInputChange('rothContribution', v)} min={0} max={LIMITS.rothAnnual} step={100} unit="$" error={rothOverCap ? 'Roth IRA contribution exceeds IRS cap.' : null} disabled={inputs.rothMatch401k} />
<div className={`mt-2 text-[11px] ${rothOverCap ? 'text-rose-600' : 'text-slate-500'}`}>IRS cap: {formatCurrency(LIMITS.rothAnnual)}.</div>
</ToggleSection>
<ToggleSection label="HSA / Other" enabled={inputs.enableHSA} onToggle={(v) => handleInputChange('enableHSA', v)}>
<InputField label="Annual Amount" value={inputs.hsaContribution} onChange={v => handleInputChange('hsaContribution', v)} min={0} max={LIMITS.hsaFamily} step={100} unit="$" error={hsaOverCap ? 'HSA contribution exceeds family cap.' : null} />
<div className={`mt-2 text-[11px] ${hsaOverCap ? 'text-rose-600' : 'text-slate-500'}`}>Common caps: {formatCurrency(LIMITS.hsaIndividual)} individual, {formatCurrency(LIMITS.hsaFamily)} family.</div>
</ToggleSection>
</section>
<div className="pt-8 text-center">
<button
onClick={() => handleInputChange('RESET', true)}
className="text-xs font-bold text-slate-400 hover:text-purple-700 flex items-center justify-center gap-2 transition-colors mx-auto"
>
<RotateCcw size={12} /> Reset to Defaults
</button>
</div>
</div>
</div>
);
};
const SIRKISMS = [
  "I am a capitalist. I love money. No shame.",
  "You don't lose the money from the early years. You lose all the money from the later years.",
  "Drive the truck yourself.",
  "How did most American millionaires achieve their wealth? They saved it. That's it.",
  "Dollar sign goes in FRONT!",
  "This is one of the most important things I could possibly pass on to you.",
  "Careers on TV are fake. Fake. Fake.",
  "I'm old-fashioned.",
  "The secret to wealth is… compound interest.",
  "If you don't find a career, a career will find you.",
  "You look like a jackass if you refer to yourself with lowercase i.",
];

const App = () => {
const [inputs, setInputs] = useState(DEFAULT_INPUTS);
const [activeTab, setActiveTab] = useState('chart');
const [isSettingsOpen, setIsSettingsOpen] = useState(false);
const [isNarrowScreen, setIsNarrowScreen] = useState(false);
const [isMediumScreen, setIsMediumScreen] = useState(false);
const [isScrolled, setIsScrolled] = useState(false);
const [showImmediateLine, setShowImmediateLine] = useState(true);
const [quoteIndex, setQuoteIndex] = useState(0);
const [chartSize, setChartSize] = useState({ width: 0, height: 0 });
const [drawerHeight, setDrawerHeight] = useState(0);
const [drawerTranslate, setDrawerTranslate] = useState<number | null>(null);
const [isDraggingDrawer, setIsDraggingDrawer] = useState(false);
const dragStartY = useRef(0);
const dragStartTranslate = useRef(0);
const didDrag = useRef(false);
const mainScrollRef = useRef<HTMLDivElement | null>(null);
const drawerRef = useRef<HTMLDivElement | null>(null);
const drawerContentRef = useRef<HTMLDivElement | null>(null);
const chartContainerRef = useRef<HTMLDivElement | null>(null);
const lockedMainScrollTop = useRef(0);
const HANDLE_HEIGHT = 76;
useEffect(() => {
if (inputs.startAge > inputs.currentAge) {
setShowImmediateLine(false);
}
}, [inputs.startAge, inputs.currentAge]);
useEffect(() => {
const updateViewport = () => {
setDrawerHeight(Math.round(window.innerHeight * 0.85));
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
setIsScrolled(scrollY > 20);
};
window.addEventListener('scroll', handleScroll, { passive: true });
return () => window.removeEventListener('scroll', handleScroll);
}, []);
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
useEffect(() => {
const mainScroll = mainScrollRef.current;
const drawerContent = drawerContentRef.current;
if (!mainScroll) return;
const handleFocusIn = (event: FocusEvent) => {
if (!isSettingsOpen) return;
 const focusTarget = event.target;
 if (!(focusTarget instanceof HTMLElement)) return;
 if (!drawerContent || !drawerContent.contains(focusTarget)) return;
requestAnimationFrame(() => {
 const targetRect = focusTarget.getBoundingClientRect();
const contentRect = drawerContent.getBoundingClientRect();
 const targetTopInContent = targetRect.top - contentRect.top + drawerContent.scrollTop;
const desiredScrollTop = Math.max(0, targetTopInContent - drawerContent.clientHeight * 0.35);
drawerContent.scrollTo({ top: desiredScrollTop, behavior: 'smooth' });
mainScroll.scrollTop = lockedMainScrollTop.current;
});
};
if (isSettingsOpen) {
lockedMainScrollTop.current = window.scrollY;
document.body.style.position = 'fixed';
document.body.style.top = `-${lockedMainScrollTop.current}px`;
document.body.style.left = '0';
document.body.style.right = '0';
document.body.style.overflow = 'hidden';
document.addEventListener('focusin', handleFocusIn);
} else {
const savedY = Math.abs(parseInt(document.body.style.top || '0', 10));
document.body.style.position = '';
document.body.style.top = '';
document.body.style.left = '';
document.body.style.right = '';
document.body.style.overflow = '';
window.scrollTo(0, savedY);
}
return () => {
document.body.style.position = '';
document.body.style.top = '';
document.body.style.left = '';
document.body.style.right = '';
document.body.style.overflow = '';
document.removeEventListener('focusin', handleFocusIn);
};
}, [isSettingsOpen]);

const summarySalary = `$${Math.round(inputs.currentSalary / 1000)}k`;
const summaryContribution = inputs.enable401k ? `${inputs.contribution401k}%` : 'Off';
// --- CALCULATIONS ---
const { results, chartData, comparisonData, finalData } = useMemo(() => {
// Helper to run a projection
const runProjection = (startAgeOverride: number) => {
const data = [];
let balance401k = 0;
let balanceRoth = 0;
let balanceHSA = 0;
let cumUserCont = 0;
let cumEmployerCont = 0;
let cumReturns = 0;
let currentSalary = inputs.currentSalary;
const retirementYears = Math.max(0, inputs.retirementAge - inputs.currentAge);
const projectionYears = Math.max(0, retirementYears - 1);
const returnRate = inputs.expectedReturn / 100;
const inflationRate = inputs.inflationRate / 100;
const salaryGrowthRate = inputs.salaryGrowth / 100;
const timingFactor = inputs.contributionTiming === 'mid' ? 0.5 : 1;
for (let i = 0; i <= projectionYears; i++) {
const age = inputs.currentAge + i;
const isContributing = age >= startAgeOverride;
let my401kCont = 0;
let employerMatch = 0;
if (isContributing) {
if (inputs.enable401k) {
my401kCont = currentSalary * (inputs.contribution401k / 100);
const matchBase = Math.min(inputs.contribution401k, inputs.matchLimit) / 100;
employerMatch = currentSalary * matchBase * (inputs.matchPercent / 100);
}
}
const rothMatchBase = inputs.enable401k ? currentSalary * (inputs.contribution401k / 100) : 0;
const rothMatchedAmount = Math.min(rothMatchBase, LIMITS.rothAnnual);
const myRothCont = (isContributing && inputs.enableRoth)
? (inputs.rothMatch401k ? rothMatchedAmount : inputs.rothContribution)
: 0;
const myHSACont = (isContributing && inputs.enableHSA) ? inputs.hsaContribution : 0;
const totalNewUserCont = my401kCont + myRothCont + myHSACont;
const totalNewEmployerCont = employerMatch;
const startBalance = balance401k + balanceRoth + balanceHSA;
const yearGrowth = (startBalance * returnRate) + ((totalNewUserCont + totalNewEmployerCont) * returnRate * timingFactor);
balance401k = (balance401k * (1 + returnRate)) + ((my401kCont + employerMatch) * (1 + returnRate * timingFactor));
balanceRoth = (balanceRoth * (1 + returnRate)) + (myRothCont * (1 + returnRate * timingFactor));
balanceHSA = (balanceHSA * (1 + returnRate)) + (myHSACont * (1 + returnRate * timingFactor));
cumUserCont += totalNewUserCont;
cumEmployerCont += totalNewEmployerCont;
cumReturns += yearGrowth;
const totalNominal = balance401k + balanceRoth + balanceHSA;
const totalReal = totalNominal / Math.pow(1 + inflationRate, i);
const totalRealAtRetirement = totalNominal * Math.pow(1 + inflationRate, retirementYears - i);
data.push({
age,
isContributing,
'Your Contributions': Math.round(cumUserCont),
'Employer Match': Math.round(cumEmployerCont),
'Employee Contribution (Year)': Math.round(totalNewUserCont),
'Employer Contribution (Year)': Math.round(totalNewEmployerCont),
'Total Contribution (Year)': Math.round(totalNewUserCont + totalNewEmployerCont),
'Year Growth': Math.round(yearGrowth),
'Investment Returns': Math.round(cumReturns),
'Total Nominal': Math.round(totalNominal),
'Total Real (Today\'s $)': Math.round(totalReal),
'Total Real (Retirement $)': Math.round(totalRealAtRetirement),
salary: Math.round(currentSalary)
});
currentSalary *= (1 + salaryGrowthRate);
}
return data;
};
const mainResults = runProjection(inputs.startAge);
const immediateResults = runProjection(inputs.currentAge); // Potential scenario (Start Now)
const mergedResults = mainResults.map((row, index) => ({
...row,
'Immediate Total Nominal': immediateResults[index] ? immediateResults[index]['Total Nominal'] : null,
}));
return {
results: mainResults,
chartData: mergedResults,
comparisonData: immediateResults[immediateResults.length - 1], // Final data point for immediate start
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
const legendItems = [
{ label: 'Your Contributions', color: '#6d28d9', visible: true },
{ label: 'Employer Match (OPM)', color: '#a855f7', visible: true },
{ label: 'Investment Returns', color: '#f59e0b', visible: true },
{ label: 'Start Now Total', color: '#b45309', visible: isDelayed && showImmediateLine }
];
const currencyFormatter = useMemo(() => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }), []);
const formatCurrency = (val: number) => currencyFormatter.format(val || 0);
const formatCompact = (val: number) => {
  const abs = Math.abs(val || 0);
  if (abs >= 1_000_000) return `$${(val / 1_000_000).toPrecision(4)}M`;
  if (abs >= 1_000) return `$${(val / 1_000).toPrecision(4)}K`;
  return formatCurrency(val);
};
type InputKey = keyof Inputs;
type NumericInputKey =
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
type BooleanInputKey = 'enable401k' | 'enableRoth' | 'enableHSA' | 'rothMatch401k';
type InputBounds = Record<NumericInputKey, { min: number; max: number }>;
const INPUT_BOUNDS: InputBounds = {
currentAge: { min: 18, max: 80 },
startAge: { min: 18, max: 100 },
retirementAge: { min: 19, max: 100 },
lifeExpectancy: { min: 40, max: 120 },
currentSalary: { min: 0, max: 1000000 },
salaryGrowth: { min: 0, max: 10 },
expectedReturn: { min: 0, max: 15 },
inflationRate: { min: 0, max: 10 },
contribution401k: { min: 0, max: 100 },
matchPercent: { min: 0, max: 100 },
matchLimit: { min: 0, max: 100 },
rothContribution: { min: 0, max: LIMITS.rothAnnual },
hsaContribution: { min: 0, max: LIMITS.hsaFamily },
};
type InputValue = Inputs[InputKey] | number | string | boolean;
const handleInputChange = (key: InputKey | 'RESET', value: InputValue) => {
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
};
return (
<div className="min-h-[100dvh] w-full max-w-[100vw] flex flex-col lg:flex-row bg-slate-100 font-sans overflow-x-clip relative">
{/* VIBRANT BACKGROUND */}
<div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
<div className="absolute inset-0 bg-gradient-to-br from-[#ede6ff] via-[#fff3cf] to-[#f6e5ff]" />
<div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#c7a6ff]/40 rounded-full blur-3xl" />
<div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#ffd48a]/40 rounded-full blur-3xl" />
</div>
{/* DESKTOP SIDEBAR (GLASS PANEL) */}
<div className="hidden lg:flex flex-col w-[420px] bg-white/30 backdrop-blur-2xl border-r border-white/50 z-20 relative shadow-2xl shadow-purple-100/50">
<div className="flex-1 overflow-hidden p-8 hover:overflow-y-auto custom-scrollbar">
<SettingsPanel inputs={inputs} handleInputChange={handleInputChange} formatCurrency={formatCurrency} />
</div>
</div>
{/* MAIN CONTENT AREA */}
<div className="min-w-0 flex flex-col relative z-10 lg:flex-1 lg:min-h-0">
{/* MOBILE HEADER */}
<div className={`lg:hidden flex justify-between items-center px-4 bg-white/80 backdrop-blur-md border-b border-white/50 sticky top-0 z-30 shadow-sm transition-all duration-300 ${isScrolled ? 'py-1.5' : 'py-3'}`}>
<div className="flex items-center gap-2 text-purple-900">
<CrownLogo className={`text-purple-700 transition-all duration-300 ${isScrolled ? 'h-6 w-6' : 'h-9 w-9'}`} />
<div className={`flex items-baseline gap-1.5 transition-all duration-300 ${isScrolled ? '' : 'flex-col !gap-0'}`}>
<div className={`font-serif font-black tracking-tight leading-tight transition-all duration-300 ${isScrolled ? 'text-base' : 'text-xl'}`}>Sirkis Act</div>
<div className={`font-medium text-slate-500 leading-tight transition-all duration-300 ${isScrolled ? 'text-[9px]' : 'text-[10px]'}`}>Old-Fashioned Financial Planning</div>
</div>
</div>
</div>
{/* SCROLLABLE DASHBOARD */}
<div ref={mainScrollRef} className="overflow-x-clip custom-scrollbar main-scroll lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
<div className="max-w-[1180px] mx-auto px-4 py-4 pb-20 lg:pb-8 lg:px-10 lg:py-8 space-y-4">
{/* BRANDING HERO SECTION */}
<div className="text-left space-y-3 pt-2 pb-1 animate-in slide-in-from-bottom duration-700 fade-in">
<h1 className="text-[2.6rem] sm:text-5xl lg:text-6xl font-serif font-black text-slate-900 tracking-tight leading-[0.92]">
Dr. Sirkis's<br />
<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-amber-500">High-Wire Act</span>
</h1>
<p className="text-base sm:text-lg text-slate-500 font-medium max-w-2xl lg:ml-1">
Fall into a <span className="font-bold text-slate-700">Million-Dollar Safety Net</span> with{' '}<span className="inline-block">tax-advantaged compounding.</span>
</p>
{/* SIRKISM QUOTE CAROUSEL */}
<div
  onClick={() => setQuoteIndex(i => (i + 1) % SIRKISMS.length)}
  className="group cursor-pointer select-none max-w-2xl lg:ml-1"
  role="button"
  tabIndex={0}
  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setQuoteIndex(i => (i + 1) % SIRKISMS.length); } }}
>
  <p className="text-sm sm:text-base italic text-slate-400 transition-opacity duration-300">
    &ldquo;{SIRKISMS[quoteIndex]}&rdquo;
  </p>
  <p className="text-[10px] text-slate-400/60 mt-1 font-medium tracking-wide uppercase group-hover:text-slate-400 transition-colors">
    <span className="hidden sm:inline">Click</span><span className="sm:hidden">Tap</span> for a new Sirkism
  </p>
</div>
</div>
{/* TOP METRICS GRID (COMPARISON AWARE) */}
<div className={`grid ${useThreeColumnPanels ? 'grid-cols-3' : 'grid-cols-1'} gap-5 min-w-0`}>
{/* TARGET CARD */}
<Card className="p-4 flex flex-col justify-center">
<div className="flex items-center justify-center gap-2 mb-2">
<Badge color="indigo">Target</Badge>
</div>
{isDelayed ? (
<div className="space-y-4">
<ComparisonRow
label={`Start at ${inputs.startAge}`}
value={formatCurrency(finalData['Total Nominal'])}
isPrimary={true}
/>
<div className="w-full h-px bg-slate-100" />
<ComparisonRow
label={`If Started at ${inputs.currentAge}`}
value={formatCurrency(comparisonData['Total Nominal'])}
subLabel={(
<span className="text-rose-600 font-bold">Potential Loss: {formatCurrency(comparisonData['Total Nominal'] - finalData['Total Nominal'])}</span>
)}
/>
</div>
) : (
<div className="text-center">
<div className="text-[clamp(1.5rem,2.5vw,2.8rem)] leading-tight font-black text-slate-900 tracking-tight mb-1">
{formatCurrency(finalData['Total Nominal'])}
</div>
<p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Projected Nest Egg</p>
</div>
)}
</Card>
{/* GROWTH CARD */}
<Card className="p-4 flex flex-col justify-center">
<div className="flex items-center justify-center gap-2 mb-2">
<Badge color="emerald">Growth</Badge>
</div>
{isDelayed ? (
<div className="space-y-4">
<ComparisonRow
label={`Start at ${inputs.startAge}`}
value={formatCurrency(finalData['Investment Returns'])}
isPrimary={true}
/>
<div className="w-full h-px bg-slate-100" />
<ComparisonRow
label={`If Started at ${inputs.currentAge}`}
value={formatCurrency(comparisonData['Investment Returns'])}
/>
</div>
) : (
<div className="text-center">
<div className="text-[clamp(1.5rem,2.5vw,2.8rem)] leading-tight font-black text-slate-900 tracking-tight mb-1">
{formatCurrency(finalData['Investment Returns'])}
</div>
<p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Compound Interest</p>
</div>
)}
</Card>
{/* REAL VALUE CARD */}
<Card className="p-4 flex flex-col justify-center bg-white/80">
<div className="flex items-center justify-center gap-2 mb-2">
<Badge color="rose">Real Value</Badge>
</div>
{isDelayed ? (
<div className="space-y-4">
<ComparisonRow
label={`Start at ${inputs.startAge}`}
value={formatCurrency(finalData['Total Real (Today\'s $)'])}
isPrimary={true}
/>
<div className="w-full h-px bg-slate-100" />
<ComparisonRow
label={`If Started at ${inputs.currentAge}`}
value={formatCurrency(comparisonData['Total Real (Today\'s $)'])}
/>
</div>
) : (
<div className="text-center">
<div className="text-[clamp(1.5rem,2.5vw,2.8rem)] leading-tight font-black text-slate-900 tracking-tight mb-1">
{formatCurrency(finalData['Total Real (Today\'s $)'])}
</div>
<p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Purchasing Power</p>
</div>
)}
</Card>
</div>
{isDelayed && (
<GlassCard className="p-4 border-rose-200/80 bg-gradient-to-br from-rose-100/90 via-rose-50/80 to-rose-50/60">
<div className="grid gap-3 md:grid-cols-[1.1fr_1fr] items-center">
<div>
<div className="text-[11px] font-black text-rose-500 uppercase tracking-widest">Potential Loss</div>
<div className="text-3xl sm:text-[2.4rem] font-black text-rose-600 tracking-tight">
{formatCurrency(comparisonData['Total Nominal'] - finalData['Total Nominal'])}
</div>
<div className="text-[11px] text-slate-500 mt-1">Starting at {inputs.startAge} vs {inputs.currentAge}</div>
</div>
<div className="flex flex-col sm:flex-row gap-2">
<div className="flex-1 rounded-xl bg-amber-50/70 p-3 border border-amber-200/70 shadow-sm">
<div className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Start Now</div>
<div className="text-lg font-black text-slate-900">{formatCurrency(comparisonData['Total Nominal'])}</div>
</div>
<div className="flex-1 rounded-xl bg-rose-50/70 p-3 border border-rose-200/60 shadow-sm">
<div className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Delayed</div>
<div className="text-lg font-black text-slate-900">{formatCurrency(finalData['Total Nominal'])}</div>
</div>
</div>
</div>
</GlassCard>
)}
{/* MAIN CHART CARD */}
<GlassCard className="p-4 sm:p-5 lg:p-6 !rounded-[26px]">
<div className="flex flex-wrap justify-between items-end mb-4 gap-3">
<h2 className="font-serif font-black text-[1.9rem] text-slate-900">The Trajectory</h2>
<div className="flex items-center justify-between gap-2 ml-auto flex-1 min-w-[200px] max-w-full sm:flex-none sm:justify-end">
{isDelayed && (
<button
onClick={() => setShowImmediateLine(prev => !prev)}
className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${showImmediateLine ? 'bg-white/70 text-slate-500 hover:text-slate-700' : 'bg-amber-500 text-white shadow-lg shadow-amber-200/50'}`}
>
{showImmediateLine ? 'Remove Start-Now' : 'Add Start-Now'}
</button>
)}
<div className="bg-slate-100/50 p-1 rounded-xl flex text-xs font-bold shadow-inner">
<button
onClick={() => setActiveTab('chart')}
className={`px-3.5 py-1.5 rounded-lg transition-all shadow-sm ${activeTab === 'chart' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50 shadow-none'}`}
>
Chart
</button>
<button
onClick={() => setActiveTab('table')}
className={`px-3.5 py-1.5 rounded-lg transition-all shadow-sm ${activeTab === 'table' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50 shadow-none'}`}
>
Table
</button>
</div>
</div>
</div>
<div className="mt-4 flex flex-wrap gap-3 text-[11px] font-semibold text-slate-500">
{legendItems.filter((item) => item.visible).map((item) => (
<div key={item.label} className="flex items-center gap-2">
<span className="inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
<span>{item.label}</span>
</div>
))}
</div>
<div
ref={chartContainerRef}
className="h-[320px] sm:h-[360px] min-h-[320px] min-w-0 w-full overflow-visible"
>
{activeTab === 'chart' ? (
chartSize.width > 0 && chartSize.height > 0 ? (
<AreaChart width={chartSize.width} height={chartSize.height} data={chartData} margin={isNarrowScreen ? { top: 6, right: 0, left: -2, bottom: 0 } : isMediumScreen ? { top: 10, right: 0, left: -10, bottom: 0 } : { top: 10, right: 12, left: -5, bottom: 0 }}>
<defs>
<linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
<stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6}/>
<stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
</linearGradient>
<linearGradient id="colorUser" x1="0" y1="0" x2="0" y2="1">
<stop offset="5%" stopColor="#6d28d9" stopOpacity={0.6}/>
<stop offset="95%" stopColor="#6d28d9" stopOpacity={0}/>
</linearGradient>
<linearGradient id="colorEmployer" x1="0" y1="0" x2="0" y2="1">
<stop offset="5%" stopColor="#a855f7" stopOpacity={0.6}/>
<stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
</linearGradient>
</defs>
<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
<XAxis
dataKey="age"
axisLine={false}
tickLine={false}
tick={{fill: '#94a3b8', fontSize: isNarrowScreen ? 10 : 12, fontWeight: 600}}
dy={isNarrowScreen ? 6 : 10}
/>
<YAxis
width={isNarrowScreen ? 52 : isMediumScreen ? 64 : 68}
axisLine={false}
tickLine={false}
tick={{fill: '#94a3b8', fontSize: isNarrowScreen ? 10 : 12, fontWeight: 600}}
tickFormatter={(val) => {
const numericVal = typeof val === 'number' ? val : Number(val);
return `$${(numericVal / 1000).toFixed(0)}k`;
}}
/>
<Tooltip
contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.9)', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', padding: '16px' }}
formatter={(value) => {
const numericValue = typeof value === 'number' ? value : Number(value || 0);
return [formatCurrency(numericValue), ""];
}}
itemSorter={(item) => -(typeof item.value === 'number' ? item.value : Number(item.value || 0))}
labelStyle={{ color: '#0f172a', marginBottom: '8px', fontWeight: '900', fontFamily: 'serif', fontSize: '18px' }}
itemStyle={{ padding: 0 }}
separator=""
/>
<Area name="Your Contributions" type="monotone" dataKey="Your Contributions" stroke="#6d28d9" strokeWidth={3} fill="url(#colorUser)" stackId="1" />
<Area name="Employer Match" type="monotone" dataKey="Employer Match" stroke="#a855f7" strokeWidth={3} fill="url(#colorEmployer)" stackId="1" />
<Area name="Investment Returns" type="monotone" dataKey="Investment Returns" stroke="#f59e0b" strokeWidth={3} fill="url(#colorReturns)" stackId="1" />
{isDelayed && showImmediateLine && (
<Line name="Start Now Total" type="monotone" dataKey="Immediate Total Nominal" stroke="#b45309" strokeDasharray="6 6" strokeWidth={2.5} dot={false} />
)}
</AreaChart>
) : (
<div className="h-full w-full rounded-xl bg-white/20" />
)
): (
<div className="h-full overflow-y-auto overflow-x-auto custom-scrollbar border border-slate-100 rounded-xl bg-white/50">
<table className="w-full text-left text-[11px] sm:text-sm">
<thead className="bg-slate-50/80 sticky top-0 font-bold text-slate-600 backdrop-blur z-10">
<tr className="text-[12px] text-center">
<th className="p-2 align-middle text-center" rowSpan={2}>Age</th>
<th className="p-2 text-center" colSpan={3}>Contributions</th>
<th className="p-2 text-center text-amber-600" colSpan={2}>Growth</th>
<th className="p-2 text-center" colSpan={2}>Totals</th>
</tr>
<tr className="text-[11px] uppercase tracking-wider text-slate-400 text-center">
<th className="p-2 text-center">You</th>
<th className="p-2 text-center">Employer</th>
<th className="p-2 text-center">Total</th>
<th className="p-2 text-center text-amber-600">Year</th>
<th className="p-2 text-center text-amber-600">Returns</th>
<th className="p-2 text-center">Nominal</th>
<th className="p-2 text-center">Real (Today)</th>
</tr>
</thead>
<tbody className="divide-y divide-slate-100/50">
{results.map((row, idx) => {
const isStartYear = row.age === inputs.startAge && isDelayed;
const isWaiting = row.age < inputs.startAge;
return (
<tr key={idx} className={`transition-colors ${isStartYear ? 'bg-purple-50/80' : 'hover:bg-white/60'} ${isWaiting ? 'opacity-50 grayscale' : ''}`}>
<td className="p-2.5 font-bold text-slate-500 text-center">
{row.age}
{isStartYear && <Badge color="indigo">Start</Badge>}
</td>
<td className="p-2.5 font-medium text-center">{formatCurrency(row['Employee Contribution (Year)'])}</td>
<td className="p-2.5 font-medium text-center">{formatCurrency(row['Employer Contribution (Year)'])}</td>
<td className="p-2.5 font-medium text-center">{formatCurrency(row['Total Contribution (Year)'])}</td>
<td className="p-2.5 text-amber-600 font-bold text-center">{formatCurrency(row['Year Growth'])}</td>
<td className="p-2.5 text-amber-600 font-bold text-center">{formatCurrency(row['Investment Returns'])}</td>
<td className="p-2.5 font-black text-slate-800 text-center">{formatCurrency(row['Total Nominal'])}</td>
<td className="p-2.5 font-semibold text-slate-600 text-center">{formatCurrency(row['Total Real (Today\'s $)'])}</td>
</tr>
);
})}
</tbody>
</table>
</div>
)}
</div>
<div className="mt-2 text-[11px] text-slate-500">
Assumes contributions through the year selected, no contribution at retirement age, and returns compounded annually.
</div>
</GlassCard>
{/* QUICK STATS FOOTER */}
{(() => {
const stats = [
{ label: "Self Funded", value: finalData['Your Contributions'], color: "text-purple-700", bg: "bg-purple-50", icon: User },
{ label: "Employer (OPM)", value: finalData['Employer Match'], color: "text-purple-600", bg: "bg-purple-50", icon: Building2 },
{ label: "Market Funded", value: finalData['Investment Returns'], color: "text-amber-700", bg: "bg-amber-50", icon: Coins },
];
return (
<div className={`grid ${useThreeColumnPanels ? 'grid-cols-3' : 'grid-cols-1'} ${chartSize.width >= 900 ? 'gap-5' : 'gap-3'} min-w-0`}>
{stats.map((stat, i) => (
<GlassCard key={i} className={`${chartSize.width >= 900 ? 'p-5' : 'p-3'} group hover:scale-[1.02] transition-transform duration-300 flex flex-row items-center ${chartSize.width >= 900 ? 'justify-center gap-7' : 'gap-3'}`}>
<div className={`${chartSize.width >= 900 ? 'p-3.5' : 'p-2'} rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
<stat.icon size={chartSize.width >= 900 ? 24 : 20} />
</div>
<div className="min-w-0">
<div className={`text-[clamp(1.1rem,2.1vw,1.55rem)] leading-tight font-black tabular-nums ${stat.color}`}>{useThreeColumnPanels && chartSize.width < 900 && stat.value >= 100_000 ? formatCompact(stat.value) : formatCurrency(stat.value)}</div>
<div className={`text-[10px] font-bold text-slate-500 uppercase ${chartSize.width >= 900 ? 'tracking-widest' : 'tracking-wider'} leading-tight whitespace-nowrap`}>
<div>{stat.label}</div>
<div>{finalData['Total Nominal'] > 0 ? Math.round((stat.value / finalData['Total Nominal']) * 100) : 0}%</div>
</div>
</div>
</GlassCard>
))}
</div>
);
})()}
<GlassCard className="p-5 lg:p-7">
<div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-5">
<div>
<h3 className="font-serif font-black text-[1.7rem] text-slate-900">Withdrawals</h3>
<p className="text-[11px] text-slate-500 mt-1">Growth-aware estimates from retirement through life expectancy.</p>
</div>
<div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 leading-tight md:text-right">
<div>{withdrawalYears} years</div>
<div>Age {startWithdrawAge} to {inputs.lifeExpectancy}</div>
</div>
</div>
<div className={`grid ${useThreeColumnPanels ? 'grid-cols-3' : 'grid-cols-1'} gap-3 items-stretch min-w-0`}>
<div className="rounded-2xl bg-white/70 border border-white/80 p-4 shadow-sm h-full flex flex-col min-w-0">
<div className="text-[10px] font-black uppercase tracking-widest text-purple-600">Fixed Purchasing Power</div>
<div className="text-[clamp(1.4rem,2.2vw,1.95rem)] leading-none font-black text-slate-900 mt-2 tabular-nums min-w-0">{formatCurrency(monthlyRealWithdrawalAtRetirement)}</div>
<div className="text-[11px] text-slate-500 mt-1">Starts at age {startWithdrawAge} and grows {inputs.inflationRate}% yearly. Equivalent to {formatCurrency(monthlyRealWithdrawal)} today.</div>
</div>
<div className="rounded-2xl bg-white/70 border border-white/80 p-4 shadow-sm h-full flex flex-col min-w-0">
<div className="text-[10px] font-black uppercase tracking-widest text-amber-600">Fixed Monthly</div>
<div className="text-[clamp(1.4rem,2.2vw,1.95rem)] leading-none font-black text-slate-900 mt-2 tabular-nums min-w-0">{formatCurrency(monthlyNominalWithdrawal)}</div>
<div className="text-[11px] text-slate-500 mt-1">At {startWithdrawAge}: {formatCurrency(nominalToRealToday(monthlyNominalWithdrawal, startWithdrawAge))} today. At {inputs.lifeExpectancy}: {formatCurrency(nominalToRealToday(monthlyNominalWithdrawal, inputs.lifeExpectancy))}.</div>
</div>
<div className="rounded-2xl bg-white/70 border border-white/80 p-4 shadow-sm h-full flex flex-col min-w-0">
<div className="text-[10px] font-black uppercase tracking-widest text-rose-500">Fixed Annual</div>
<div className="text-[clamp(1.4rem,2.2vw,1.95rem)] leading-none font-black text-slate-900 mt-2 tabular-nums min-w-0">{formatCurrency(annualNominalWithdrawal)}</div>
<div className="text-[11px] text-slate-500 mt-1">At {inputs.retirementAge}: {formatCurrency(nominalToRealToday(annualNominalWithdrawal, inputs.retirementAge))} today. At {inputs.lifeExpectancy}: {formatCurrency(nominalToRealToday(annualNominalWithdrawal, inputs.lifeExpectancy))}.</div>
</div>
</div>
<div className="mt-4 text-[11px] text-slate-500">
Assumes constant returns during retirement and no taxes; for planning only.
</div>
</GlassCard>
<footer className="mt-4 text-center text-[11px] text-slate-500">
Rolex is a registered trademark. Sirkis Act is not affiliated with, sponsored by, or endorsed by Rolex (but IS open to sponsorship inquiries).
</footer>
</div>
</div>
{/* MOBILE SETTINGS DRAWER */}
<div className="lg:hidden fixed inset-0 z-50 pointer-events-none">
{isSettingsOpen && (
<div
className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-auto"
onClick={() => setIsSettingsOpen(false)}
/>
)}
<div
ref={drawerRef}
className="bg-white/90 backdrop-blur-xl w-full rounded-t-3xl shadow-2xl border-t border-white/50 transition-transform duration-300 pointer-events-auto absolute inset-x-0 bottom-0"
style={{
height: '85vh',
transform: `translateY(${drawerTranslate ?? (isSettingsOpen ? 0 : Math.max(0, drawerHeight - HANDLE_HEIGHT))}px)`
}}
>
<div
role="button"
tabIndex={0}
onClick={() => {
if (didDrag.current) {
didDrag.current = false;
return;
}
setIsSettingsOpen((open) => !open);
}}
onKeyDown={(event) => {
if (event.key === 'Enter' || event.key === ' ') {
setIsSettingsOpen((open) => !open);
}
}}
onPointerDown={(event) => {
event.preventDefault();
event.currentTarget.setPointerCapture(event.pointerId);
const closedTranslate = Math.max(0, drawerHeight - HANDLE_HEIGHT);
dragStartY.current = event.clientY;
dragStartTranslate.current = drawerTranslate ?? (isSettingsOpen ? 0 : closedTranslate);
didDrag.current = false;
setIsDraggingDrawer(true);
}}
onPointerMove={(event) => {
if (!isDraggingDrawer) return;
const closedTranslate = Math.max(0, drawerHeight - HANDLE_HEIGHT);
const delta = event.clientY - dragStartY.current;
const nextTranslate = Math.min(closedTranslate, Math.max(0, dragStartTranslate.current + delta));
if (Math.abs(delta) > 6) {
didDrag.current = true;
}
setDrawerTranslate(nextTranslate);
}}
onPointerUp={(event) => {
if (!isDraggingDrawer) return;
event.currentTarget.releasePointerCapture(event.pointerId);
const closedTranslate = Math.max(0, drawerHeight - HANDLE_HEIGHT);
const currentTranslate = drawerTranslate ?? (isSettingsOpen ? 0 : closedTranslate);
const shouldOpen = currentTranslate < closedTranslate * 0.5;
setIsDraggingDrawer(false);
setIsSettingsOpen(shouldOpen);
setDrawerTranslate(null);
}}
onPointerCancel={() => {
setIsDraggingDrawer(false);
setDrawerTranslate(null);
}}
className={`w-full px-4 pt-2 pb-4 text-left select-none cursor-pointer touch-none ${isSettingsOpen ? '' : 'pulse-glow'} ${isDraggingDrawer ? '' : 'transition-transform duration-300'}`}
>
{isSettingsOpen && (
<div className="flex justify-center mb-1">
<span className="h-1.5 w-10 rounded-full bg-slate-300/80" />
</div>
)}
<div className="flex items-center justify-between">
<div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
<span className="h-1 w-6 rounded-full bg-slate-300/70" />
Inputs
</div>
{isSettingsOpen ? null : (
<ChevronUp size={18} className="text-purple-700" />
)}
</div>
<div className="mt-1 text-sm font-semibold text-slate-700">
Age {inputs.currentAge} · Start {inputs.startAge} · Retire {inputs.retirementAge}
</div>
<div className="text-[11px] text-slate-500 font-medium">
Salary {summarySalary} · 401(k) {summaryContribution}
</div>
</div>
{isSettingsOpen && (
<div ref={drawerContentRef} className="px-6 pb-6 overflow-y-auto custom-scrollbar drawer-scroll h-[calc(85vh-76px)]">
<SettingsPanel inputs={inputs} handleInputChange={handleInputChange} formatCurrency={formatCurrency} isMobile={true} />
</div>
)}
</div>
</div>
</div>
<style>{`
.recharts-surface { overflow: visible; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.3); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(148, 163, 184, 0.5); }
.pulse-glow {
	position: relative;
}
.pulse-glow::after {
	content: '';
	position: absolute;
	inset: 4px 10px 10px 10px;
	border-radius: 18px;
	box-shadow: 0 0 22px 6px rgba(245, 158, 11, 0.38);
	animation: glowPulse 2.6s ease-out infinite;
	pointer-events: none;
}
@keyframes glowPulse {
	0% {
		box-shadow: 0 0 22px 6px rgba(245, 158, 11, 0.38);
	}
	70% {
		box-shadow: 0 0 34px 12px rgba(245, 158, 11, 0.2);
	}
	100% {
		box-shadow: 0 0 22px 6px rgba(245, 158, 11, 0.3);
	}
}
@media (max-width: 1023px) {
	html, body, #root {
		overflow-x: clip;
		max-width: 100vw;
		width: 100%;
	}
	input,
	select,
	textarea {
		font-size: 16px !important;
	}
}
html,
body {
	-webkit-text-size-adjust: 100%;
}
.main-scroll {
	overflow-x: clip;
	max-width: 100vw;
}
.drawer-scroll {
	overscroll-behavior: contain;
	touch-action: pan-y;
}
`}</style>
</div>
);
};
export default App;
