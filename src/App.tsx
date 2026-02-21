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
Clock,
ChevronDown,
ChevronUp,
Info
} from 'lucide-react';
import { Drawer } from 'vaul';
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
const THEME = {
bg:        '#003D3A',  // App background (cyprus)
brand:     '#00A499',  // Your Contributions (persian green)
opm:       '#A8A8A8',  // Employer Match (boulder grey — lightened for dark bg)
returns:   '#E6C300',  // Investment Returns (corn gold)
startNow:  '#0D9488',  // Start Now / Early Start (aqua teal — close to brand, watch)
loss:      '#D32F2F',  // Delayed start / financial loss (persian red)
brandBg:   'rgba(0,164,153,0.06)',
returnsBg: 'rgba(230,195,0,0.08)',
startNowBg:'rgba(13,148,136,0.08)',
lossBg:    'rgba(211,47,47,0.07)',
} as const;
const getLossFractionLabel = (f: number): string => {
  const tol = 0.008;
  if (f >= 0.90 - tol) return 'nearly all of';
  if (f > 0.81) return 'nearly 90% of';
  const levels: { v: number; label: string; neverOver?: boolean; noOf?: boolean }[] = [
    { v: 0.15, label: '15%',           neverOver: true },
    { v: 0.20, label: '20%',           neverOver: true },
    { v: 0.25, label: 'a quarter' },
    { v: 1/3,  label: 'a third' },
    { v: 0.40, label: '40%' },
    { v: 0.50, label: 'half',          noOf: true },
    { v: 0.60, label: '60%' },
    { v: 2/3,  label: 'two thirds' },
    { v: 0.75, label: 'three quarters' },
  ];
  const of = (l: { noOf?: boolean }) => l.noOf ? '' : ' of';
  if (f < levels[0].v - tol) return f < 0.11 ? 'a portion of' : `nearly ${levels[0].label} of`;
  for (let i = 0; i < levels.length; i++) {
    const cur = levels[i];
    const nxt = levels[i + 1];
    if (Math.abs(f - cur.v) <= tol) return `${cur.label}${of(cur)}`;
    if (!nxt) return `over ${cur.label}${of(cur)}`;
    if (f > cur.v + tol && f < nxt.v - tol) {
      if (cur.neverOver) return `nearly ${nxt.label}${of(nxt)}`;
      return f < (cur.v + nxt.v) / 2 ? `over ${cur.label}${of(cur)}` : `nearly ${nxt.label}${of(nxt)}`;
    }
  }
  return 'a portion of';
};
// --- HELPER COMPONENTS ---
type CardProps = { children: ReactNode; className?: string };
const GlassCard = ({ children, className = "" }: CardProps) => (
<div className={`bg-[#004745] border border-white/[0.07] shadow-[0_22px_55px_-38px_rgba(0,0,0,0.8)] rounded-[28px] ${className}`}>
{children}
</div>
);
const Card = ({ children, className = "" }: CardProps) => (
<div className={`bg-[#004240] rounded-[22px] border border-white/[0.06] shadow-[0_16px_32px_-24px_rgba(0,0,0,0.7)] transition-shadow hover:shadow-[0_24px_50px_-36px_rgba(0,0,0,0.85)] ${className}`}>
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
type BadgeColor = 'brand' | 'returns' | 'loss' | 'neutral';
type BadgeProps = { children: ReactNode; color?: BadgeColor };
const Badge = ({ children, color = "brand" }: BadgeProps) => {
const styles = {
brand: "bg-[#00A499]/10 text-[#00A499] border-[#00A499]/20",
returns: "bg-[#E6C300]/10 text-[#E6C300] border-[#E6C300]/20",
loss: "bg-[#D32F2F]/15 text-[#D32F2F] border-[#D32F2F]/20",
neutral: "bg-white/10 text-slate-300 border-white/15",
};
// BODGE: asymmetric padding compensates for Recursive's high vertical metrics — revisit on font/theme change
return (
<span className={`px-2.5 pt-[5px] pb-[3px] rounded-lg text-[10px] font-bold uppercase tracking-wider border ${styles[color] || styles.brand}`}>
{children}
</span>
);
};
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
errorState?: boolean;
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
className="group inline-flex items-center text-slate-400 hover:text-[#00A499] focus:outline-none"
>
<Info size={12} />
<span className="sr-only">Info</span>
<span className={`pointer-events-none absolute w-64 max-w-[70vw] ${alignClass} ${placementClass} rounded-lg border border-white/15 bg-[#004745] px-3 py-2 text-[11px] font-medium text-slate-300 text-left shadow-lg transition-opacity duration-200 z-50 ${visibilityClass}`}>
{content}
</span>
</button>
</div>
);
};
const InputField = ({ label, value, onChange, min, max, step = 1, icon: Icon, unit = "", error, errorState = false, helper, tooltip, disabled = false }: InputFieldProps) => {
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
<label className={`text-sm flex items-center gap-2 transition-colors ${hasError ? 'text-rose-600 font-bold' : 'text-slate-200 font-semibold group-hover:text-[#00A499]'}`}>
{Icon && <Icon size={16} className="text-slate-400 group-hover:text-[#A8A8A8] transition-colors" />}
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
className={`flex-grow h-1.5 bg-white/15 rounded-lg appearance-none transition-all ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer accent-[#00A499] hover:accent-[#0D9488]'}`}
/>
<div className="relative flex items-center group-focus-within:scale-105 transition-transform flex-shrink-0 shadow-sm rounded-xl">
{unit === "$" && (
<span className="absolute left-3 text-slate-400 text-xs font-bold pointer-events-none">$</span>
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
className={`text-right py-2 text-[16px] sm:text-sm font-bold border bg-[#002E2B] focus:bg-[#002E2B] focus:ring-2 outline-none transition-all rounded-xl text-white
${hasError ? 'border-rose-500/50 focus:ring-rose-500/20 focus:border-rose-500' : 'border-[#006560]/50 focus:ring-[#00A499]/20 focus:border-[#00A499]/60'}
${unit === "$" ? "w-36 pl-6 pr-3" : "w-24 pr-8 pl-3"}
${unit === "%" ? "pr-8 pl-3" : "pr-3"}`}
/>
{unit === "%" && (
<span className="absolute right-3 text-slate-400 text-xs font-bold pointer-events-none">%</span>
)}
</div>
</div>
{(helper || error) && (
<div className={`mt-2 text-[11px] font-medium ${hasError ? 'text-rose-600' : 'text-slate-400'}`}>
{error || helper}
</div>
)}
</div>
);
};
type ToggleSectionProps = { label: string; enabled: boolean; onToggle: (value: boolean) => void; children: ReactNode };
const ToggleSection = ({ label, enabled, onToggle, children }: ToggleSectionProps) => (
<div className={`p-1 rounded-3xl transition-all duration-300 ${enabled ? 'bg-[#003D3A]/40 border border-white/[0.06]' : 'bg-[#003D3A]/30 border border-transparent opacity-80'}`}>
<div
className={`flex items-center justify-between p-4 cursor-pointer rounded-2xl transition-colors ${enabled ? '' : 'hover:bg-white/[0.05]'}`} style={enabled ? { background: THEME.brandBg } : undefined}
onClick={() => onToggle(!enabled)}
>
<span className={`font-bold text-sm ${enabled ? '' : 'text-slate-400'}`} style={enabled ? { color: THEME.brand } : undefined}>{label}</span>
<div className={`w-12 h-7 flex items-center rounded-full p-1 transition-all duration-300 ${!enabled ? 'bg-slate-300' : ''}`} style={enabled ? { background: THEME.brand } : undefined}>
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
<div className="flex items-center gap-2.5" style={{ color: THEME.brand }}>
<CrownLogo className="h-9 w-9" />
<div>
<div className="font-display font-black text-xl tracking-tight leading-tight">Sirkis Act</div>
<div className="text-[10px] font-medium text-slate-400 leading-tight">Old-Fashioned Financial Planning</div>
</div>
</div>
</div>
)}
{/* Timeline Section */}
<section>
<h3 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest mb-6 ml-1" style={{ color: THEME.returns }}>
<Clock size={14} /> Timeline
</h3>
<InputField label="Current Age" value={inputs.currentAge} onChange={v => handleInputChange('currentAge', v)} min={18} max={80} icon={User} />
<div className={`relative rounded-2xl mb-6 transition-all duration-300 ${inputs.startAge > inputs.currentAge ? 'bg-[#E6C300]/8 ring-1 ring-[#E6C300]/25' : 'bg-transparent'}`}>
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
<div className="flex items-center justify-between gap-2 text-[11px] font-semibold bg-[#D32F2F]/10 p-2.5 rounded-lg">
<div className="flex items-center gap-2 text-[#D32F2F]/80">
<div className="w-1.5 h-1.5 rounded-full bg-[#D32F2F] animate-pulse" />
{inputs.startAge - inputs.currentAge} year delay active
</div>
<button
type="button"
onClick={() => handleInputChange('startAge', inputs.currentAge)}
className="text-[#D32F2F]/60 hover:text-[#D32F2F] transition-colors font-bold uppercase tracking-widest"
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
className="w-full appearance-none text-[16px] sm:text-sm font-bold p-3 pr-10 rounded-xl border border-[#006560]/50 bg-[#002E2B] text-white shadow-sm"
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
<div className="flex bg-black/20 rounded-xl p-1 shadow-inner border border-white/[0.06]">
{['start', 'mid'].map((option) => (
<button
key={option}
onClick={() => handleInputChange('contributionTiming', option)}
className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${inputs.contributionTiming === option ? 'text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/10'}`} style={inputs.contributionTiming === option ? { background: THEME.brand } : undefined}
>
{option === 'start' ? 'Start of Year' : 'Mid Year'}
</button>
))}
</div>
</div>
</section>
{/* Economics Section */}
<section>
<h3 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest mb-6 ml-1" style={{ color: THEME.returns }}>
<TrendingUp size={14} /> Market
</h3>
<InputField label="Expected Return" value={inputs.expectedReturn} onChange={v => handleInputChange('expectedReturn', v)} min={0} max={15} step={0.5} unit="%" icon={TrendingUp} tooltip="Long-term stock-heavy portfolios often assume 6-8% nominal returns." />
<InputField label="Salary Growth" value={inputs.salaryGrowth} onChange={v => handleInputChange('salaryGrowth', v)} min={0} max={10} step={0.1} unit="%" icon={TrendingUp} tooltip="Typical wage growth is often around 2-4% per year." />
<InputField label="Inflation Rate" value={inputs.inflationRate} onChange={v => handleInputChange('inflationRate', v)} min={0} max={10} step={0.1} unit="%" icon={TrendingUp} tooltip="Long-run inflation is often around 2-3% per year." />
</section>
{/* Accounts Section */}
<section className="space-y-4">
<h3 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest mb-6 ml-1" style={{ color: THEME.returns }}>
<PiggyBank size={14} /> Strategy
</h3>
<ToggleSection label="401(k) / 403(b)" enabled={inputs.enable401k} onToggle={(v) => handleInputChange('enable401k', v)}>
<InputField label="Contribution %" value={inputs.contribution401k} onChange={v => handleInputChange('contribution401k', v)} min={0} max={100} unit="%" errorState={employeeOverCap} />
<div className="grid grid-cols-2 gap-4 border-t border-white/[0.07] pt-6 mt-2">
<div>
<label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Match %</label>
<input type="number" min={0} max={100} step={1} value={inputs.matchPercent} onChange={(e) => handleInputChange('matchPercent', parseFloat(e.target.value))} className="w-full text-[16px] sm:text-sm font-bold p-2.5 rounded-xl border border-[#006560]/50 bg-[#002E2B] text-white" />
</div>
<div>
<label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Limit %</label>
<input type="number" min={0} max={100} step={1} value={inputs.matchLimit} onChange={(e) => handleInputChange('matchLimit', parseFloat(e.target.value))} className="w-full text-[16px] sm:text-sm font-bold p-2.5 rounded-xl border border-[#006560]/50 bg-[#002E2B] text-white" />
</div>
</div>
<div className="mt-4 text-[11px]">
<div className={`flex items-start gap-2 ${employeeOverCap || totalOverCap ? 'text-rose-600' : 'text-slate-400'}`}>
<Info size={14} className={employeeOverCap || totalOverCap ? 'text-rose-500' : 'text-[#A8A8A8]'} />
<div className="space-y-1">
<div className={employeeOverCap ? 'text-rose-600' : 'text-slate-400'}>
Employee est: <span className="font-semibold">{formatCurrency(annualEmployee401k)}</span> (cap <span className="font-bold">{formatCurrency(LIMITS.max401kEmployee)}</span>).
</div>
<div className={totalOverCap ? 'text-rose-600' : 'text-slate-400'}>
Employer est: <span className="font-semibold">{formatCurrency(annualEmployer401k)}</span>.
</div>
<div className={`pt-2 border-t ${totalOverCap ? 'border-rose-200/70 text-rose-600' : 'border-slate-200/70 text-slate-400'}`}>
<div className="text-[10px] font-bold uppercase tracking-widest">Total</div>
<div className="font-semibold">
{formatCurrency(annualTotal401k)} (cap {formatCurrency(LIMITS.max401kTotal)}).
</div>
</div>
</div>
</div>
{(employeeOverCap || totalOverCap) && (
<div className="text-rose-600 font-bold mt-3 text-center">Over IRS caps. Projections use capped values.</div>
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
className={`w-12 h-7 flex items-center rounded-full p-1 transition-all duration-300 ${!inputs.rothMatch401k ? 'bg-slate-300' : ''}`} style={inputs.rothMatch401k ? { background: THEME.brand } : undefined}
>
<div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${inputs.rothMatch401k ? 'translate-x-5' : ''}`} />
</button>
</div>
<InputField label="Annual Amount" value={rothEffectiveContribution} onChange={v => handleInputChange('rothContribution', v)} min={0} max={LIMITS.rothAnnual} step={100} unit="$" error={rothOverCap ? 'Exceeds IRS cap. Projections use cap.' : null} disabled={inputs.rothMatch401k} />
<div className={`mt-2 text-[11px] ${rothOverCap ? 'text-rose-600' : 'text-slate-400'}`}>IRS cap: {formatCurrency(LIMITS.rothAnnual)}.</div>
</ToggleSection>
<ToggleSection label="HSA / Other" enabled={inputs.enableHSA} onToggle={(v) => handleInputChange('enableHSA', v)}>
<InputField label="Annual Amount" value={inputs.hsaContribution} onChange={v => handleInputChange('hsaContribution', v)} min={0} max={LIMITS.hsaFamily} step={100} unit="$" error={hsaOverCap ? 'Exceeds family cap. Projections use cap.' : null} />
<div className={`mt-2 text-[11px] ${hsaOverCap ? 'text-rose-600' : 'text-slate-400'}`}>Common caps: {formatCurrency(LIMITS.hsaIndividual)} individual, {formatCurrency(LIMITS.hsaFamily)} family.</div>
</ToggleSection>
</section>
<div className="pt-8 text-center">
<button
onClick={() => handleInputChange('RESET', true)}
className="text-xs font-bold text-slate-400 hover:text-[#00A499] flex items-center justify-center gap-2 transition-colors mx-auto"
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
  "There are stupid questions.",
  "The secret to wealth is… compound interest.",
  "If you don't find a career, a career will find you.",
  "You look like a jackass if you refer to yourself with lowercase i.",
  "C's get degrees.",
  "A W is better than a D. A D is better than an F. But a C is better than all of them.",
  "The cost of waiting is not $8,000. It's half your retirement.",
  "Work until 74, or start now. Your choice.",
  "If you can't pay cash for the car, you can't afford the car.",
  "Professors are human beings. They have sides.",
  "Don't show up late with a Duncan Donuts cup.",
  "Horror stories exist for a reason.",
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
useEffect(() => {
const meta = document.querySelector('meta[name="theme-color"]');
if (meta) meta.setAttribute('content', THEME.bg);
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

const summarySalary = inputs.currentSalary >= 999500 ? `$${(Math.round(inputs.currentSalary / 100000) / 10).toFixed(1)}M` : `$${Math.round(inputs.currentSalary / 1000)}k`;
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
const rawEmployee401k = currentSalary * (inputs.contribution401k / 100);
my401kCont = Math.min(rawEmployee401k, LIMITS.max401kEmployee);
const matchBase = Math.min(inputs.contribution401k, inputs.matchLimit) / 100;
const rawEmployerMatch = currentSalary * matchBase * (inputs.matchPercent / 100);
// Clamp total 401k to IRS limit
employerMatch = Math.min(rawEmployerMatch, Math.max(0, LIMITS.max401kTotal - my401kCont));
}
}
const rothMatchBase = inputs.enable401k ? currentSalary * (inputs.contribution401k / 100) : 0;
const rothMatchedAmount = Math.min(rothMatchBase, LIMITS.rothAnnual);
const rawRothCont = (isContributing && inputs.enableRoth)
? (inputs.rothMatch401k ? rothMatchedAmount : inputs.rothContribution)
: 0;
const myRothCont = Math.min(rawRothCont, LIMITS.rothAnnual);
const rawHSACont = (isContributing && inputs.enableHSA) ? inputs.hsaContribution : 0;
const myHSACont = Math.min(rawHSACont, LIMITS.hsaFamily);
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
{ label: 'Your Contributions', color: THEME.brand, visible: true },
{ label: 'Employer Match (OPM)', color: THEME.opm, visible: true },
{ label: 'Investment Returns', color: THEME.returns, visible: true },
{ label: 'Start Now Total', color: THEME.startNow, visible: isDelayed && showImmediateLine }
];
const currencyFormatter = useMemo(() => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }), []);
const formatCurrency = (val: number) => currencyFormatter.format(val || 0);
const delayYears = inputs.startAge - inputs.currentAge;
const lossAmount = comparisonData && finalData
  ? comparisonData['Total Nominal'] - finalData['Total Nominal']
  : 0;
const lossFraction = comparisonData && comparisonData['Total Nominal'] > 0
  ? lossAmount / comparisonData['Total Nominal']
  : 0;
const missedContributions = (() => {
  if (!inputs.enable401k || delayYears <= 0) return 0;
  const growthRate = 1 + inputs.salaryGrowth / 100;
  let total = 0;
  for (let i = 0; i < delayYears; i++) {
    total += Math.min(inputs.currentSalary * Math.pow(growthRate, i) * (inputs.contribution401k / 100), LIMITS.max401kEmployee);
  }
  return total;
})();
const lossYearLabel = delayYears === 1 ? 'year' : 'years';
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
<div className="min-h-[100dvh] w-full max-w-[100vw] flex flex-col lg:flex-row bg-[#003D3A] font-sans overflow-x-clip relative">
{/* VIBRANT BACKGROUND */}
<div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
<div className="absolute top-[-15%] right-[-45%] w-[520px] h-[600px] bg-[#E6C300]/10 rounded-full blur-3xl hidden lg:block" />
<div className="absolute bottom-[-15%] right-[-15%] w-[600px] h-[520px] bg-[#E6C300]/5 rounded-full blur-3xl hidden lg:block" />
</div>
{/* DESKTOP SIDEBAR (GLASS PANEL) */}
<div className="hidden lg:flex flex-col w-[420px] bg-[#004745] border-r border-black/30 z-20 relative shadow-[inset_-1px_0_0_rgba(255,255,255,0.05)]">
<div className="flex-1 overflow-hidden p-8 hover:overflow-y-auto custom-scrollbar">
<SettingsPanel inputs={inputs} handleInputChange={handleInputChange} formatCurrency={formatCurrency} />
</div>
</div>
{/* MAIN CONTENT AREA */}
<div className="min-w-0 flex flex-col relative z-10 lg:flex-1 lg:min-h-0">
{/* MOBILE HEADER */}
<div className={`lg:hidden flex justify-between items-center px-4 bg-[#003D3A] border-b border-white/10 sticky top-0 z-30 shadow-sm will-change-transform transition-[padding] duration-300 ease-in-out ${isScrolled ? 'py-1.5' : 'py-3'}`}>
<div className="flex items-center gap-2" style={{ color: THEME.brand }}>
<div
  className="transition-transform duration-300 ease-in-out"
  style={{ transform: isScrolled ? 'scale(0.67)' : 'scale(1)', transformOrigin: 'left center' }}
>
  <CrownLogo className="h-9 w-9" />
</div>
<div className="flex flex-col">
<div className="font-display font-black tracking-tight leading-tight text-2xl">Sirkis Act</div>
<div className={`font-medium text-slate-400 leading-tight text-[11px] overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${isScrolled ? 'max-h-0 opacity-0' : 'max-h-6 opacity-100'}`}>Old-Fashioned Financial Planning</div>
</div>
</div>
</div>
{/* SCROLLABLE DASHBOARD */}
<div className="overflow-x-clip custom-scrollbar main-scroll lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
<div className="max-w-[1180px] mx-auto px-4 py-4 pb-20 lg:pb-8 lg:px-10 lg:py-8 space-y-4">
{/* BRANDING HERO SECTION */}
<div className="text-left space-y-3 pt-2 pb-1 animate-in slide-in-from-bottom duration-700 fade-in">
<h1 className="text-[2.6rem] sm:text-5xl lg:text-6xl font-display font-black tracking-tight leading-[0.92]">
<span style={{ color: THEME.brand, textShadow: '0px 1px 0px rgba(255,255,255,0.12), 0px -1px 0px rgba(0,0,0,0.7)' }}>Dr. Sirkis's</span><br />
<span style={{ color: THEME.returns, textShadow: '0px 1px 0px rgba(255,255,255,0.2), 0px -1px 0px rgba(0,0,0,0.8)' }}>High-Wire Act</span>
</h1>
<p className="text-base sm:text-lg text-slate-300 font-medium max-w-2xl lg:ml-1">
Fall into a <span className="font-bold text-slate-200">Million-Dollar Safety Net</span> with{' '}<span className="inline-block">tax-advantaged compounding.</span>
</p>
{/* SIRKISM QUOTE CAROUSEL */}
<div
  onClick={() => setQuoteIndex(i => (i + 1) % SIRKISMS.length)}
  className="group cursor-pointer select-none max-w-2xl lg:ml-1"
  role="button"
  tabIndex={0}
  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setQuoteIndex(i => (i + 1) % SIRKISMS.length); } }}
>
  <p className="text-sm sm:text-base font-display italic text-slate-400 transition-opacity duration-300">
    &ldquo;{SIRKISMS[quoteIndex]}&rdquo;
  </p>
  <p className="text-[10px] text-slate-400/60 mt-1 font-medium tracking-wide uppercase group-hover:text-slate-400 transition-colors">
    <span className="hidden sm:inline">Click</span><span className="sm:hidden">Tap</span> for a new Sirkism
  </p>
</div>
</div>
{/* TOP METRICS GRID (COMPARISON AWARE) */}
<div className={`grid ${useThreeColumnPanels ? 'grid-cols-3 gap-5' : 'grid-cols-2 gap-3'} min-w-0`}>
{/* TARGET CARD */}
<Card className={`${useThreeColumnPanels ? 'p-4' : 'col-span-2 p-4'} flex flex-col justify-center`}>
<div className="flex items-center justify-center gap-2 mb-2">
<Badge color="brand">Target</Badge>
</div>
{isDelayed ? (
<div className="text-center">
<div className="text-[clamp(1.5rem,2.5vw,2.8rem)] leading-tight font-black text-white tracking-tight mb-1">
{formatCurrency(finalData['Total Nominal'])}
</div>
<p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Projected Nest Egg</p>
{useThreeColumnPanels ? (
<div className="rounded-xl bg-[#003D3A]/60 p-2.5 border border-[#00A499]/25 mt-3 text-center">
<div className="text-[clamp(0.625rem,2.5vw,0.75rem)] font-black uppercase tracking-widest" style={{ color: THEME.startNow }}>Start Early</div>
<div className="text-[clamp(0.9rem,1.8vw,1.25rem)] font-black text-white tracking-tight">
{formatCurrency(comparisonData['Total Nominal'])}
</div>
</div>
) : (
<>
<div className="grid grid-cols-2 gap-2 mt-3">
<div className="rounded-xl bg-[#003D3A]/60 p-2.5 border border-[#00A499]/25">
<div className="text-[clamp(0.625rem,2.5vw,0.75rem)] font-black uppercase tracking-widest" style={{ color: THEME.startNow }}>Start Early</div>
<div className="text-[clamp(0.9rem,4vw,1.15rem)] font-black text-white">{formatCurrency(comparisonData['Total Nominal'])}</div>
</div>
<div className="rounded-xl bg-[#003D3A]/60 p-2.5 border border-[#D32F2F]/50">
<div className="text-[clamp(0.625rem,2.5vw,0.75rem)] font-black uppercase tracking-widest" style={{ color: THEME.loss }}>Potential Loss</div>
<div className="text-[clamp(0.9rem,4vw,1.15rem)] font-black text-[#D32F2F]">-{formatCurrency(lossAmount)}</div>
</div>
</div>
<p className="font-display italic font-semibold leading-snug mt-3 text-center tracking-wide"
  style={{ fontSize: 'clamp(0.7rem, 3.75vw, 1rem)', color: THEME.loss, textShadow: '0px 1px 0.7px rgba(255,255,255,0.04), 0px -1px 0.7px rgba(0,0,0,0.25)' }}>
{missedContributions > 0
  ? `The cost of waiting ${delayYears} ${lossYearLabel} isn't ${formatCurrency(missedContributions)}…`
  : `The cost of waiting ${delayYears} ${lossYearLabel}…`
}<br />it's {getLossFractionLabel(lossFraction)} <span className="whitespace-nowrap">your retirement.</span>
</p>
</>
)}
</div>
) : (
<div className="text-center">
<div className="text-[clamp(1.5rem,2.5vw,2.8rem)] leading-tight font-black text-white tracking-tight mb-1">
{formatCurrency(finalData['Total Nominal'])}
</div>
<p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Projected Nest Egg</p>
</div>
)}
</Card>
{/* GROWTH CARD */}
<Card className={`${useThreeColumnPanels ? 'p-4' : 'p-3'} flex flex-col justify-center`}>
<div className="flex items-center justify-center gap-2 mb-2">
<Badge color="returns">Growth</Badge>
</div>
{isDelayed ? (
<div className="text-center">
<div className={`${useThreeColumnPanels ? 'text-[clamp(1.5rem,2.5vw,2.8rem)]' : 'text-[clamp(1.2rem,5vw,1.6rem)]'} leading-tight font-black text-white tracking-tight mb-1`}>
{formatCurrency(finalData['Investment Returns'])}
</div>
<p className={`${useThreeColumnPanels ? 'text-xs' : 'text-[10px]'} font-bold text-slate-400 uppercase tracking-wider`}>Compound Interest</p>
{useThreeColumnPanels ? (
<div className="rounded-xl bg-[#003D3A]/60 p-2.5 border border-[#00A499]/25 mt-3 text-center">
<div className="text-[clamp(0.625rem,2.5vw,0.75rem)] font-black uppercase tracking-widest" style={{ color: THEME.startNow }}>Start Early</div>
<div className="text-[clamp(0.9rem,1.8vw,1.25rem)] font-black text-white tracking-tight">
{formatCurrency(comparisonData['Investment Returns'])}
</div>
</div>
) : (
<>
<div className="w-full h-px bg-white/15 mt-2 mb-1" />
<div className="text-[clamp(0.9rem,4vw,1.15rem)] font-black tracking-tight" style={{ color: THEME.startNow }}>
{formatCurrency(comparisonData['Investment Returns'])}
</div>
<p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Start Early</p>
</>
)}
</div>
) : (
<div className="text-center">
<div className={`${useThreeColumnPanels ? 'text-[clamp(1.5rem,2.5vw,2.8rem)]' : 'text-[clamp(1.2rem,5vw,1.6rem)]'} leading-tight font-black text-white tracking-tight mb-1`}>
{formatCurrency(finalData['Investment Returns'])}
</div>
<p className={`${useThreeColumnPanels ? 'text-xs' : 'text-[10px]'} font-bold text-slate-400 uppercase tracking-wider`}>Compound Interest</p>
</div>
)}
</Card>
{/* REAL VALUE CARD */}
<Card className={`${useThreeColumnPanels ? 'p-4' : 'p-3'} flex flex-col justify-center`}>
<div className="flex items-center justify-center gap-2 mb-2">
<Badge color="neutral">Real Value</Badge>
</div>
{isDelayed ? (
<div className="text-center">
<div className={`${useThreeColumnPanels ? 'text-[clamp(1.5rem,2.5vw,2.8rem)]' : 'text-[clamp(1.2rem,5vw,1.6rem)]'} leading-tight font-black text-white tracking-tight mb-1`}>
{formatCurrency(finalData['Total Real (Today\'s $)'])}
</div>
<p className={`${useThreeColumnPanels ? 'text-xs' : 'text-[10px]'} font-bold text-slate-400 uppercase tracking-wider`}>Purchasing Power</p>
{useThreeColumnPanels ? (
<div className="rounded-xl bg-[#003D3A]/60 p-2.5 border border-[#00A499]/25 mt-3 text-center">
<div className="text-[clamp(0.625rem,2.5vw,0.75rem)] font-black uppercase tracking-widest" style={{ color: THEME.startNow }}>Start Early</div>
<div className="text-[clamp(0.9rem,1.8vw,1.25rem)] font-black text-white tracking-tight">
{formatCurrency(comparisonData['Total Real (Today\'s $)'])}
</div>
</div>
) : (
<>
<div className="w-full h-px bg-white/15 mt-2 mb-1" />
<div className="text-[clamp(0.9rem,4vw,1.15rem)] font-black tracking-tight" style={{ color: THEME.startNow }}>
{formatCurrency(comparisonData['Total Real (Today\'s $)'])}
</div>
<p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Start Early</p>
</>
)}
</div>
) : (
<div className="text-center">
<div className={`${useThreeColumnPanels ? 'text-[clamp(1.5rem,2.5vw,2.8rem)]' : 'text-[clamp(1.2rem,5vw,1.6rem)]'} leading-tight font-black text-white tracking-tight mb-1`}>
{formatCurrency(finalData['Total Real (Today\'s $)'])}
</div>
<p className={`${useThreeColumnPanels ? 'text-xs' : 'text-[10px]'} font-bold text-slate-400 uppercase tracking-wider`}>Purchasing Power</p>
</div>
)}
</Card>
</div>
{isDelayed && useThreeColumnPanels && (
<div className="px-4 py-3 grid grid-cols-3 items-center gap-4 rounded-[22px] shadow-[0_16px_32px_-24px_rgba(0,0,0,0.7)]" style={{ background: 'rgba(211,47,47,0.10)', border: '1px solid rgba(211,47,47,0.50)' }}>
<div className="col-span-1 text-center">
<div className="text-center text-[clamp(0.65rem,1.1vw,0.85rem)] font-black uppercase tracking-widest" style={{ color: THEME.loss }}>Potential Loss</div>
<div className="text-center text-[clamp(1.2rem,2vw,1.7rem)] leading-none font-black text-[#D32F2F]">-{formatCurrency(lossAmount)}</div>
</div>
<div className="col-span-2 flex items-center justify-center">
<p className="font-display italic font-semibold leading-snug text-center tracking-wide"
  style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.15rem)', color: THEME.loss, textShadow: '0px 1px 0.7px rgba(255,255,255,0.04), 0px -1px 0.7px rgba(0,0,0,0.25)' }}>
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
className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${showImmediateLine ? 'bg-transparent border border-[#00A499]/40 text-[#00A499] hover:bg-[#00A499]/10' : 'text-white shadow-lg'}`} style={!showImmediateLine ? { background: THEME.returns, boxShadow: `0 4px 6px ${THEME.returnsBg}` } : undefined}
>
{showImmediateLine ? 'Remove Start-Now' : 'Add Start-Now'}
</button>
)}
<div className="bg-black/25 p-1 rounded-xl flex text-xs font-bold shadow-inner">
<button
onClick={() => setActiveTab('chart')}
className={`px-3.5 py-1.5 rounded-lg transition-all shadow-sm ${activeTab === 'chart' ? 'bg-[#006560] shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/10 shadow-none'}`} style={activeTab === 'chart' ? { color: THEME.brand } : undefined}
>
Chart
</button>
<button
onClick={() => setActiveTab('table')}
className={`px-3.5 py-1.5 rounded-lg transition-all shadow-sm ${activeTab === 'table' ? 'bg-[#006560] shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/10 shadow-none'}`} style={activeTab === 'table' ? { color: THEME.brand } : undefined}
>
Table
</button>
</div>
</div>
</div>
<div className="mt-2 mb-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold text-slate-400">
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
<stop offset="5%" stopColor={THEME.returns} stopOpacity={0.6}/>
<stop offset="95%" stopColor={THEME.returns} stopOpacity={0}/>
</linearGradient>
<linearGradient id="colorUser" x1="0" y1="0" x2="0" y2="1">
<stop offset="5%" stopColor={THEME.brand} stopOpacity={0.6}/>
<stop offset="95%" stopColor={THEME.brand} stopOpacity={0}/>
</linearGradient>
<linearGradient id="colorEmployer" x1="0" y1="0" x2="0" y2="1">
<stop offset="5%" stopColor={THEME.opm} stopOpacity={0.6}/>
<stop offset="95%" stopColor={THEME.opm} stopOpacity={0}/>
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
contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: '#004745', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)', padding: '16px', color: 'white' }}
formatter={(value) => {
const numericValue = typeof value === 'number' ? value : Number(value || 0);
return [formatCurrency(numericValue), ""];
}}
itemSorter={(item) => -(typeof item.value === 'number' ? item.value : Number(item.value || 0))}
labelStyle={{ color: 'rgba(255,255,255,0.9)', marginBottom: '8px', fontWeight: '900', fontFamily: 'Fraunces, Georgia, serif', fontSize: '18px' }}
itemStyle={{ padding: 0 }}
separator=""
/>
<Area name="Your Contributions" type="monotone" dataKey="Your Contributions" stroke={THEME.brand} strokeWidth={3} fill="url(#colorUser)" stackId="1" />
<Area name="Employer Match" type="monotone" dataKey="Employer Match" stroke={THEME.opm} strokeWidth={3} fill="url(#colorEmployer)" stackId="1" />
<Area name="Investment Returns" type="monotone" dataKey="Investment Returns" stroke={THEME.returns} strokeWidth={3} fill="url(#colorReturns)" stackId="1" />
{isDelayed && showImmediateLine && (
<Line name="Start Now Total" type="monotone" dataKey="Immediate Total Nominal" stroke={THEME.startNow} strokeDasharray="6 6" strokeWidth={2.5} dot={false} />
)}
</AreaChart>
) : (
<div className="h-full w-full rounded-xl bg-white/5" />
)
): (
<div className="h-full overflow-y-auto overflow-x-auto custom-scrollbar border border-white/[0.06] rounded-xl bg-[#004240]/80">
<table className="w-full text-left text-[11px] sm:text-sm">
<thead className="bg-[#003D3A]/80 sticky top-0 font-bold text-slate-400 backdrop-blur z-10">
<tr className="text-[12px] text-center">
<th className="p-2 align-middle text-center" rowSpan={2}>Age</th>
<th className="p-2 text-center" colSpan={3}>Contributions</th>
<th className="p-2 text-center" style={{ color: THEME.returns }} colSpan={2}>Growth</th>
<th className="p-2 text-center" colSpan={2}>Totals</th>
</tr>
<tr className="text-[11px] uppercase tracking-wider text-slate-400 text-center">
<th className="p-2 text-center">You</th>
<th className="p-2 text-center">Employer</th>
<th className="p-2 text-center">Total</th>
<th className="p-2 text-center" style={{ color: THEME.returns }}>Year</th>
<th className="p-2 text-center" style={{ color: THEME.returns }}>Returns</th>
<th className="p-2 text-center">Nominal</th>
<th className="p-2 text-center">Real (Today)</th>
</tr>
</thead>
<tbody className="divide-y divide-white/[0.06]">
{results.flatMap((row, idx) => {
const isStartYear = row.age === inputs.startAge && isDelayed;
const isWaiting = row.age < inputs.startAge;
const waitingCount = inputs.startAge - inputs.currentAge;
if (isWaiting && waitingCount >= 3) {
if (row.age === inputs.currentAge) {
return [(
<tr key="waiting-summary" className="opacity-40">
<td className="px-2.5 py-3 font-bold text-slate-400 text-center">
<div className="flex flex-col items-center justify-center gap-0.5">
<span>{inputs.currentAge}</span>
<span className="text-[8px] tracking-[0.2em]">•••</span>
<span>{inputs.startAge - 1}</span>
</div>
</td>
<td className="p-2.5 font-medium text-slate-200 text-center">{formatCurrency(0)}</td>
<td className="p-2.5 font-medium text-slate-200 text-center">{formatCurrency(0)}</td>
<td className="p-2.5 font-medium text-slate-200 text-center">{formatCurrency(0)}</td>
<td className="p-2.5 font-bold text-center" style={{ color: THEME.returns }}>{formatCurrency(0)}</td>
<td className="p-2.5 font-bold text-center" style={{ color: THEME.returns }}>{formatCurrency(0)}</td>
<td className="p-2.5 font-black text-white/90 text-center">{formatCurrency(0)}</td>
<td className="p-2.5 font-semibold text-slate-300 text-center">{formatCurrency(0)}</td>
</tr>
)];
}
return [];
}
return [(
<tr key={idx} className={`transition-colors ${isStartYear ? '' : 'hover:bg-white/[0.05]'} ${isWaiting ? 'opacity-50 grayscale' : ''}`} style={isStartYear ? { background: THEME.brandBg } : undefined}>
<td className="p-2.5 font-bold text-slate-400 text-center">
{row.age}
</td>
<td className="p-2.5 font-medium text-slate-200 text-center">{formatCurrency(row['Employee Contribution (Year)'])}</td>
<td className="p-2.5 font-medium text-slate-200 text-center">{formatCurrency(row['Employer Contribution (Year)'])}</td>
<td className="p-2.5 font-medium text-slate-200 text-center">{formatCurrency(row['Total Contribution (Year)'])}</td>
<td className="p-2.5 font-bold text-center" style={{ color: THEME.returns }}>{formatCurrency(row['Year Growth'])}</td>
<td className="p-2.5 font-bold text-center" style={{ color: THEME.returns }}>{formatCurrency(row['Investment Returns'])}</td>
<td className="p-2.5 font-black text-white/90 text-center">{formatCurrency(row['Total Nominal'])}</td>
<td className="p-2.5 font-semibold text-slate-300 text-center">{formatCurrency(row['Total Real (Today\'s $)'])}</td>
</tr>
)];
})}
</tbody>
</table>
</div>
)}
</div>
<div className="mt-2 text-[11px] text-slate-400">
Assumes contributions through the year selected, no contribution at retirement age, and returns compounded annually.
</div>
</GlassCard>
{/* QUICK STATS FOOTER */}
{(() => {
const stats = [
{ label: "Market Funded", value: finalData['Investment Returns'], colorStyle: { color: THEME.returns }, bgStyle: { background: THEME.returnsBg }, icon: TrendingUp },
{ label: "Self Funded", value: finalData['Your Contributions'], colorStyle: { color: THEME.brand }, bgStyle: { background: THEME.brandBg }, icon: PiggyBank },
{ label: "Employer (OPM)", value: finalData['Employer Match'], colorStyle: { color: THEME.opm }, bgStyle: { background: THEME.brandBg }, icon: Building2 },
];
return (
<div className={`grid ${useThreeColumnPanels ? 'grid-cols-3' : 'grid-cols-2'} ${chartSize.width >= 750 ? 'gap-5' : 'gap-3'} min-w-0`}>
{stats.map((stat, i) => {
const isHero = !useThreeColumnPanels && i === 0;
return (
<GlassCard key={i} className={`${isHero ? 'col-span-2' : ''} ${chartSize.width >= 750 ? 'p-4' : 'p-3'} group hover:scale-[1.02] transition-transform duration-300 flex flex-row items-center justify-center ${chartSize.width >= 750 ? 'gap-5' : 'gap-3'}`}>
<div className={`${isHero ? 'p-3.5' : chartSize.width >= 750 ? 'p-2.5' : 'p-2'} rounded-[27%] group-hover:scale-110 transition-transform`} style={{ ...stat.bgStyle, ...stat.colorStyle }}>
<stat.icon size={isHero ? 36 : chartSize.width >= 750 ? 22 : 20} />
</div>
<div className="min-w-0">
<div className={`${isHero ? 'text-[clamp(2rem,6vw,2.8rem)]' : !useThreeColumnPanels ? 'text-[clamp(0.95rem,4vw,1.35rem)]' : 'text-[clamp(1.1rem,2.1vw,1.55rem)]'} leading-tight font-black tabular-nums`} style={stat.colorStyle}>{!useThreeColumnPanels && !isHero && stat.value >= 1_000_000 ? formatCompact(stat.value) : (useThreeColumnPanels && chartSize.width < 750 && stat.value >= 100_000 ? formatCompact(stat.value) : formatCurrency(stat.value))}</div>
{isHero ? (
<div className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-tight whitespace-nowrap">
{stat.label} · {finalData['Total Nominal'] > 0 ? Math.round((stat.value / finalData['Total Nominal']) * 100) : 0}%
</div>
) : (
<div className={`text-[10px] font-bold text-slate-400 uppercase ${chartSize.width >= 750 ? 'tracking-widest' : !useThreeColumnPanels ? 'tracking-wide' : 'tracking-wider'} leading-tight whitespace-nowrap`}>
<div>{stat.label}</div>
<div>{finalData['Total Nominal'] > 0 ? Math.round((stat.value / finalData['Total Nominal']) * 100) : 0}%</div>
</div>
)}
</div>
</GlassCard>
);
})}
</div>
);
})()}
<GlassCard className="p-5 lg:p-7">
<div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-5">
<div>
<h3 className="font-display font-black text-[1.7rem] text-white">Withdrawals</h3>
<p className="text-[11px] text-slate-400 mt-1">Growth-aware estimates from retirement through <span className="whitespace-nowrap">life expectancy.</span></p>
</div>
<div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 leading-tight md:text-right">
<div>{withdrawalYears} years</div>
<div>Age {startWithdrawAge} to {inputs.lifeExpectancy}</div>
</div>
</div>
<div className={`grid ${useThreeColumnPanels ? 'grid-cols-3 gap-3' : 'grid-cols-2 gap-3'} items-stretch min-w-0`}>
<div className={`rounded-2xl bg-[#003D3A]/60 border border-white/[0.07] ${useThreeColumnPanels ? 'p-4' : 'col-span-2 p-3'} shadow-sm h-full flex flex-col min-w-0`}>
<div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fixed Purchasing Power</div>
<div className="text-[clamp(1.4rem,2.2vw,1.95rem)] leading-none font-black text-white mt-2 tabular-nums min-w-0">{formatCurrency(monthlyRealWithdrawalAtRetirement)}</div>
<div className="text-[11px] text-slate-400 mt-1">Starts at age {startWithdrawAge} and grows {inputs.inflationRate}% yearly. Equivalent to {formatCurrency(monthlyRealWithdrawal)} <span className="whitespace-nowrap">today (real $ estimate).</span></div>
</div>
<div className={`rounded-2xl bg-[#003D3A]/60 border border-white/[0.07] ${useThreeColumnPanels ? 'p-4' : 'p-3'} shadow-sm h-full flex flex-col min-w-0`}>
<div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fixed Monthly</div>
<div className="text-[clamp(1.4rem,2.2vw,1.95rem)] leading-none font-black text-white mt-2 tabular-nums min-w-0">{formatCurrency(monthlyNominalWithdrawal)}</div>
<div className="text-[11px] text-slate-400 mt-1">At {startWithdrawAge}: {formatCurrency(nominalToRealToday(monthlyNominalWithdrawal, startWithdrawAge))} (real)<br />At {inputs.lifeExpectancy}: {formatCurrency(nominalToRealToday(monthlyNominalWithdrawal, inputs.lifeExpectancy))} (real)</div>
</div>
<div className={`rounded-2xl bg-[#003D3A]/60 border border-white/[0.07] ${useThreeColumnPanels ? 'p-4' : 'p-3'} shadow-sm h-full flex flex-col min-w-0`}>
<div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fixed Annual</div>
<div className="text-[clamp(1.4rem,2.2vw,1.95rem)] leading-none font-black text-white mt-2 tabular-nums min-w-0">{formatCurrency(annualNominalWithdrawal)}</div>
<div className="text-[11px] text-slate-400 mt-1">At {inputs.retirementAge}: {formatCurrency(nominalToRealToday(annualNominalWithdrawal, inputs.retirementAge))} (real)<br />At {inputs.lifeExpectancy}: {formatCurrency(nominalToRealToday(annualNominalWithdrawal, inputs.lifeExpectancy))} (real)</div>
</div>
</div>
<div className="mt-4 text-[11px] text-slate-400">
Assumes constant returns during retirement and no taxes; for planning only.
</div>
</GlassCard>
<footer className="mt-4 text-center text-[11px] text-slate-400">
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
<div className="pulse-glow bg-[#003D3A] border-t border-white/10 shadow-2xl rounded-t-3xl px-4 pt-2 pb-2">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
<span className="h-1 w-6 rounded-full bg-white/25" />
Inputs
</div>
<ChevronUp size={18} className="text-[#00A499]" />
</div>
<div className="mt-1 text-sm font-semibold text-slate-200">
Age {inputs.currentAge}{isDelayed && <> · <span style={{ color: THEME.loss, fontWeight: 900, fontSize: '0.925rem' }}>Start {inputs.startAge}</span></>} · Retire {inputs.retirementAge}
</div>
<div className="text-[11px] text-slate-400 font-medium">
Salary {summarySalary} · 401(k) {summaryContribution}{inputs.enableRoth && ` · Roth $${(Math.round((inputs.rothMatch401k ? Math.min(inputs.currentSalary * (inputs.contribution401k / 100), LIMITS.rothAnnual) : inputs.rothContribution) / 100) / 10).toFixed(1)}k`}
</div>
</div>
<div style={{ height: 'env(safe-area-inset-bottom)' }} />
</div>
)}
<Drawer.Root open={isSettingsOpen} onOpenChange={setIsSettingsOpen} repositionInputs={false}>
<Drawer.Portal>
<Drawer.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" />
<Drawer.Content
className="bg-[#004745] rounded-t-3xl border-t border-white/10 shadow-2xl fixed inset-x-0 bottom-0 z-50 flex flex-col outline-none"
style={{ height: '85dvh' }}
>
<Drawer.Title className="sr-only">Settings</Drawer.Title>
<div className="flex justify-center pt-3 pb-1 flex-shrink-0">
<span className="h-1.5 w-10 rounded-full bg-slate-300/80" />
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
<SettingsPanel inputs={inputs} handleInputChange={handleInputChange} formatCurrency={formatCurrency} isMobile={true} />
</div>
</Drawer.Content>
</Drawer.Portal>
</Drawer.Root>
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
	top: 0;
	left: 0;
	right: 0;
	height: 24px;
	border-radius: 24px 24px 0 0;
	box-shadow:
		0 0 8px 1px rgba(230, 195, 0, 0.50),
		0 0 28px 4px rgba(230, 195, 0, 0.32),
		0 0 60px 12px rgba(230, 195, 0, 0.20);
	clip-path: inset(-100px -100px 0 -100px);
	opacity: 0.7;
	animation: glowPulse 3s ease-in-out infinite;
	pointer-events: none;
}
@keyframes glowPulse {
	0%   { opacity: 0.55; box-shadow: 0 0 8px 1px rgba(230,195,0,0.50), 0 0 28px 4px rgba(230,195,0,0.32), 0 0 60px 12px rgba(230,195,0,0.20); }
	50%  { opacity: 1;    box-shadow: 0 0 10px 2px rgba(230,195,0,0.65), 0 0 36px 6px rgba(230,195,0,0.42), 0 0 80px 18px rgba(230,195,0,0.28); }
	100% { opacity: 0.55; box-shadow: 0 0 8px 1px rgba(230,195,0,0.50), 0 0 28px 4px rgba(230,195,0,0.32), 0 0 60px 12px rgba(230,195,0,0.20); }
}
@media (max-width: 1023px) {
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
