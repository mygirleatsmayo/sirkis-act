import React, { useState, useMemo, useEffect } from 'react';

import {

XAxis,

YAxis,

CartesianGrid,

Tooltip,

Legend,

ResponsiveContainer,

AreaChart,

Area,

Line

} from 'recharts';

import {

TrendingUp,

Settings2,

Briefcase,

PiggyBank,

DollarSign,

RotateCcw,

User,

Building2,

Coins,

Clock,

X,

Crown,
AlertCircle

} from 'lucide-react';

  

// --- CONSTANTS ---

const DEFAULT_INPUTS = {

currentAge: 30,

startAge: 30,

retirementAge: 65,

currentSalary: 75000,

salaryGrowth: 3,

expectedReturn: 7,

inflationRate: 2.5,

enable401k: true,

enableRoth: false,

enableHSA: false,

contribution401k: 10,

matchPercent: 50,

matchLimit: 6,

rothContribution: 7000,

hsaContribution: 4150,

contributionTiming: 'start',

};

const LIMITS = {

max401kEmployee: 23000,

max401kTotal: 69000,

rothAnnual: 7000,

hsaIndividual: 4150,

hsaFamily: 8300,

};

// --- HELPER COMPONENTS ---

const GlassCard = ({ children, className = "" }) => (

<div className={`bg-gradient-to-br from-white/95 via-white/75 to-slate-50/80 backdrop-blur-2xl border border-white/80 shadow-[0_30px_70px_-45px_rgba(15,23,42,0.6)] rounded-3xl ${className}`}>

{children}

</div>

);

const Card = ({ children, className = "" }) => (

<div className={`bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/70 shadow-[0_18px_35px_-25px_rgba(15,23,42,0.55)] ring-1 ring-slate-100/80 transition-shadow hover:shadow-[0_30px_70px_-40px_rgba(15,23,42,0.65)] ${className}`}>

{children}

</div>

);

const Badge = ({ children, color = "indigo" }) => {

const styles = {

indigo: "bg-indigo-500/10 text-indigo-800 border-indigo-200/20",

emerald: "bg-emerald-500/10 text-emerald-800 border-emerald-200/20",

rose: "bg-rose-500/10 text-rose-800 border-rose-200/20",

amber: "bg-amber-500/10 text-amber-800 border-amber-200/20",

slate: "bg-slate-500/10 text-slate-600 border-slate-200/20",

};

return (

<span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${styles[color] || styles.indigo}`}>

{children}

</span>

);

};

  

const ComparisonRow = ({ label, value, subLabel, isPrimary = false }) => (

<div className={`flex justify-between items-baseline ${isPrimary ? 'text-slate-900' : 'text-slate-500'}`}>

<span className="text-xs font-bold uppercase tracking-wide opacity-80">{label}</span>

<div className="text-right">

<div className={`font-black tracking-tight ${isPrimary ? 'text-2xl font-serif' : 'text-sm'}`}>

{value}

</div>

{subLabel && <div className="text-[10px] font-medium opacity-60">{subLabel}</div>}

</div>

</div>

);

  

const InputField = ({ label, value, onChange, min, max, step = 1, icon: Icon, unit = "", error, helper }) => {

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

<label className={`text-sm font-semibold flex items-center gap-2 transition-colors ${hasError ? 'text-rose-600' : 'text-slate-700 group-hover:text-indigo-700'}`}>

{Icon && <Icon size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />}

{label}

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

const next = parseFloat(e.target.value);

setDraftValue(String(next));

onChange(next);

}}

className="flex-grow h-1.5 bg-slate-200/60 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500 transition-all"

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

onChange={(e) => setDraftValue(e.target.value)}

onBlur={commitDraft}

onKeyDown={(e) => {

if (e.key === 'Enter') {

e.currentTarget.blur();

}

}}

className={`text-right py-2 text-sm font-bold border bg-white/50 focus:bg-white focus:ring-2 outline-none transition-all rounded-xl text-slate-800

${hasError ? 'border-rose-300 focus:ring-rose-300/40 focus:border-rose-500' : 'border-white/60 focus:ring-indigo-500/20 focus:border-indigo-500'}

${unit === "$" ? "w-36 pl-6 pr-3" : "w-24 pr-8 pl-3"}

${unit === "%" ? "pr-8 pl-3" : "pr-3"}`}

/>

{unit === "%" && (

<span className="absolute right-3 text-slate-500 text-xs font-bold pointer-events-none">%</span>

)}

</div>

{(helper || error) && (

<div className={`mt-2 text-[11px] font-medium ${hasError ? 'text-rose-600' : 'text-slate-500'}`}>

{error || helper}

</div>

)}

</div>

</div>

);

};

  

const ToggleSection = ({ label, enabled, onToggle, children }) => (

<div className={`p-1 rounded-3xl transition-all duration-300 ${enabled ? 'bg-gradient-to-br from-white/60 to-white/30 shadow-sm border border-white/50' : 'bg-white/20 border border-transparent opacity-80'}`}>

<div

className={`flex items-center justify-between p-4 cursor-pointer rounded-2xl transition-colors ${enabled ? 'bg-indigo-50/50' : 'hover:bg-white/30'}`}

onClick={() => onToggle(!enabled)}

>

<span className={`font-bold text-sm ${enabled ? 'text-indigo-900' : 'text-slate-500'}`}>{label}</span>

<div className={`w-12 h-7 flex items-center rounded-full p-1 transition-all duration-300 ${enabled ? 'bg-indigo-600' : 'bg-slate-300'}`}>

<div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${enabled ? 'translate-x-5' : ''}`} />

</div>

</div>

<div className={`overflow-hidden transition-all duration-500 ease-in-out ${enabled ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>

<div className="p-5 pt-2">

{children}

</div>

</div>

</div>

);

const clampNumber = (value, min, max, fallback) => {

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

const SettingsPanel = ({ inputs, handleInputChange, formatCurrency, isMobile = false }) => {

const annualEmployee401k = inputs.enable401k ? inputs.currentSalary * (inputs.contribution401k / 100) : 0;

const matchBase = Math.min(inputs.contribution401k, inputs.matchLimit) / 100;

const annualEmployer401k = inputs.enable401k ? inputs.currentSalary * matchBase * (inputs.matchPercent / 100) : 0;

const annualTotal401k = annualEmployee401k + annualEmployer401k;

const employeeOverCap = annualEmployee401k > LIMITS.max401kEmployee;

const totalOverCap = annualTotal401k > LIMITS.max401kTotal;

const rothOverCap = inputs.enableRoth && inputs.rothContribution > LIMITS.rothAnnual;

const hsaOverCap = inputs.enableHSA && inputs.hsaContribution > LIMITS.hsaFamily;

return (

<div className={`${isMobile ? 'pb-32' : 'h-full custom-scrollbar overflow-y-auto pr-4 pl-1'}`}>

<div className="space-y-10 pb-10">

{/* Branding in Sidebar (Desktop) */}

{!isMobile && (

<div className="mb-8 pt-2">

<div className="flex items-center gap-2 mb-1 text-indigo-900">

<Crown size={20} fill="currentColor" className="text-indigo-600" />

<span className="font-serif font-black text-xl tracking-tight">Sirkis Act</span>

</div>

<p className="text-xs font-medium text-slate-500 ml-7">Financial Planning Tool</p>

</div>

)}

  

{/* Timeline Section */}

<section>

<h3 className="flex items-center gap-2 text-[11px] font-black text-indigo-400 uppercase tracking-widest mb-6 ml-1">

<Clock size={14} /> Timeline

</h3>

<InputField label="Current Age" value={inputs.currentAge} onChange={v => handleInputChange('currentAge', v)} min={18} max={80} icon={User} />

<div className={`relative overflow-hidden rounded-2xl mb-6 transition-all duration-300 ${inputs.startAge > inputs.currentAge ? 'bg-amber-50/60 ring-1 ring-amber-200' : 'bg-transparent'}`}>

<div className="p-4 pb-0">

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

<div className="px-4 pb-4 -mt-4">

<div className="flex items-center gap-2 text-xs text-amber-800 font-medium bg-amber-100/50 p-2 rounded-lg">

<div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />

{inputs.startAge - inputs.currentAge} year delay active

</div>

</div>

)}

</div>

<InputField label="Retirement Age" value={inputs.retirementAge} onChange={v => handleInputChange('retirementAge', v)} min={inputs.currentAge + 1} max={100} icon={Briefcase} />

<InputField label="Current Salary" value={inputs.currentSalary} onChange={v => handleInputChange('currentSalary', v)} min={0} max={1000000} step={1000} unit="$" icon={DollarSign} />

<div className="mt-6">

<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Contribution Timing</label>

<div className="flex bg-white/60 rounded-xl p-1 shadow-inner border border-white/70">

{['start', 'mid'].map((option) => (

<button

key={option}

onClick={() => handleInputChange('contributionTiming', option)}

className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${inputs.contributionTiming === option ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'}`}

>

{option === 'start' ? 'Start of Year' : 'Mid Year'}

</button>

))}

</div>

</div>

</section>

  

{/* Economics Section */}

<section>

<h3 className="flex items-center gap-2 text-[11px] font-black text-indigo-400 uppercase tracking-widest mb-6 ml-1">

<TrendingUp size={14} /> Market

</h3>

<InputField label="Expected Return" value={inputs.expectedReturn} onChange={v => handleInputChange('expectedReturn', v)} min={0} max={15} step={0.5} unit="%" icon={TrendingUp} />

<InputField label="Salary Growth" value={inputs.salaryGrowth} onChange={v => handleInputChange('salaryGrowth', v)} min={0} max={10} step={0.1} unit="%" icon={TrendingUp} />

<InputField label="Inflation Rate" value={inputs.inflationRate} onChange={v => handleInputChange('inflationRate', v)} min={0} max={10} step={0.1} unit="%" icon={TrendingUp} />

</section>

  

{/* Accounts Section */}

<section className="space-y-4">

<h3 className="flex items-center gap-2 text-[11px] font-black text-indigo-400 uppercase tracking-widest mb-6 ml-1">

<PiggyBank size={14} /> Strategy

</h3>

<ToggleSection label="401(k) / 403(b)" enabled={inputs.enable401k} onToggle={(v) => handleInputChange('enable401k', v)}>

<InputField label="Contribution %" value={inputs.contribution401k} onChange={v => handleInputChange('contribution401k', v)} min={0} max={100} unit="%" error={employeeOverCap ? 'Employee contribution exceeds IRS cap.' : null} />

<div className="grid grid-cols-2 gap-4 border-t border-indigo-100/50 pt-6 mt-2">

<div>

<label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Match %</label>

<input type="number" min={0} max={100} step={1} value={inputs.matchPercent} onChange={(e) => handleInputChange('matchPercent', parseFloat(e.target.value))} className="w-full text-sm font-bold p-2.5 rounded-xl border border-white/60 bg-white/50 text-slate-700" />

</div>

<div>

<label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Limit %</label>

<input type="number" min={0} max={100} step={1} value={inputs.matchLimit} onChange={(e) => handleInputChange('matchLimit', parseFloat(e.target.value))} className="w-full text-sm font-bold p-2.5 rounded-xl border border-white/60 bg-white/50 text-slate-700" />

</div>

</div>

<div className="mt-4 space-y-2 text-[11px]">

<div className={`flex items-center gap-2 ${employeeOverCap ? 'text-rose-600' : 'text-slate-500'}`}>

<AlertCircle size={14} className={employeeOverCap ? 'text-rose-500' : 'text-indigo-400'} />

<span>

Employee est: <span className="font-semibold">{formatCurrency(annualEmployee401k)}</span> (cap {formatCurrency(LIMITS.max401kEmployee)}).

</span>

</div>

<div className={`flex items-center gap-2 ${totalOverCap ? 'text-rose-600' : 'text-slate-500'}`}>

<AlertCircle size={14} className={totalOverCap ? 'text-rose-500' : 'text-indigo-400'} />

<span>

Employer est: <span className="font-semibold">{formatCurrency(annualEmployer401k)}</span>. Total est: <span className="font-semibold">{formatCurrency(annualTotal401k)}</span> (cap {formatCurrency(LIMITS.max401kTotal)}).

</span>

</div>

{employeeOverCap && (

<div className="text-rose-600">Employee contribution exceeds IRS cap. Lower the contribution %.</div>

)}

{totalOverCap && (

<div className="text-rose-600">Total contributions exceed IRS cap. Adjust contribution % or match inputs.</div>

)}

</div>

</ToggleSection>

  

<ToggleSection label="Roth IRA" enabled={inputs.enableRoth} onToggle={(v) => handleInputChange('enableRoth', v)}>

<InputField label="Annual Amount" value={inputs.rothContribution} onChange={v => handleInputChange('rothContribution', v)} min={0} max={LIMITS.rothAnnual} step={100} unit="$" error={rothOverCap ? 'Roth IRA contribution exceeds IRS cap.' : null} />

<div className={`mt-2 text-[11px] ${rothOverCap ? 'text-rose-600' : 'text-slate-500'}`}>IRS cap shown: {formatCurrency(LIMITS.rothAnnual)}.</div>

</ToggleSection>

  

<ToggleSection label="HSA / Other" enabled={inputs.enableHSA} onToggle={(v) => handleInputChange('enableHSA', v)}>

<InputField label="Annual Amount" value={inputs.hsaContribution} onChange={v => handleInputChange('hsaContribution', v)} min={0} max={LIMITS.hsaFamily} step={100} unit="$" error={hsaOverCap ? 'HSA contribution exceeds family cap.' : null} />

<div className={`mt-2 text-[11px] ${hsaOverCap ? 'text-rose-600' : 'text-slate-500'}`}>Common caps: {formatCurrency(LIMITS.hsaIndividual)} individual, {formatCurrency(LIMITS.hsaFamily)} family.</div>

</ToggleSection>

</section>

<div className="pt-8 text-center">

<button

onClick={() => handleInputChange('RESET', true)}

className="text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center justify-center gap-2 transition-colors mx-auto"

>

<RotateCcw size={12} /> Reset to Defaults

</button>

</div>

</div>

</div>

);

};

  

const App = () => {

const [inputs, setInputs] = useState(DEFAULT_INPUTS);

const [activeTab, setActiveTab] = useState('chart');

const [isSettingsOpen, setIsSettingsOpen] = useState(false);

const [showImmediateLine, setShowImmediateLine] = useState(true);

  

// --- CALCULATIONS ---

const { results, chartData, comparisonData, finalData } = useMemo(() => {

// Helper to run a projection

const runProjection = (startAgeOverride) => {

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

const myRothCont = (isContributing && inputs.enableRoth) ? inputs.rothContribution : 0;

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

const currencyFormatter = useMemo(() => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }), []);

const formatCurrency = (val) => currencyFormatter.format(val || 0);

  

const INPUT_BOUNDS = {

currentAge: { min: 18, max: 80 },

startAge: { min: 18, max: 100 },

retirementAge: { min: 19, max: 100 },

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

const handleInputChange = (key, value) => {

if (key === 'RESET') {

setInputs(DEFAULT_INPUTS);

} else {

setInputs(prev => {

const next = { ...prev };

if (INPUT_BOUNDS[key]) {

const bounds = INPUT_BOUNDS[key];

const fallback = prev[key];

next[key] = clampNumber(value, bounds.min, bounds.max, fallback);

} else {

next[key] = value;

}

if (key === 'currentAge') {

next.startAge = Math.max(next.startAge, next.currentAge);

next.retirementAge = Math.max(next.retirementAge, next.currentAge + 1);

}

if (key === 'retirementAge') {

next.startAge = Math.min(next.startAge, next.retirementAge - 1);

}

if (key === 'startAge') {

next.retirementAge = Math.max(next.retirementAge, next.startAge + 1);

}

return next;

});

}

};

  

return (

<div className="h-screen flex flex-col lg:flex-row bg-slate-100 font-sans overflow-hidden">

{/* VIBRANT BACKGROUND */}

<div className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50" />

<div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-200/40 rounded-full blur-3xl" />

<div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-3xl" />

{/* DESKTOP SIDEBAR (GLASS PANEL) */}

<div className="hidden lg:flex flex-col w-[420px] bg-white/30 backdrop-blur-2xl border-r border-white/50 z-20 relative shadow-2xl shadow-indigo-100/50">

<div className="flex-1 overflow-hidden p-8 hover:overflow-y-auto custom-scrollbar">

<SettingsPanel inputs={inputs} handleInputChange={handleInputChange} formatCurrency={formatCurrency} />

</div>

</div>

  

{/* MAIN CONTENT AREA */}

<div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">

{/* MOBILE HEADER */}

<div className="lg:hidden flex justify-between items-center p-4 bg-white/80 backdrop-blur-md border-b border-white/50 sticky top-0 z-30 shadow-sm">

<div className="flex items-center gap-2 font-serif font-black text-xl text-indigo-900">

<Crown size={24} className="text-indigo-600" fill="currentColor"/>

Sirkis Act

</div>

<button

onClick={() => setIsSettingsOpen(true)}

className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"

>

<Settings2 size={20} />

</button>

</div>

  

{/* SCROLLABLE DASHBOARD */}

<div className="flex-1 overflow-y-auto custom-scrollbar">

<div className="max-w-[1200px] mx-auto p-4 lg:p-12 space-y-10">

  

{/* BRANDING HERO SECTION */}

<div className="text-center lg:text-left space-y-4 py-4 animate-in slide-in-from-bottom duration-700 fade-in">

<h1 className="text-4xl sm:text-5xl lg:text-7xl font-serif font-black text-slate-900 tracking-tight leading-[0.9]">

Dr. Sirkis's <br className="hidden lg:block"/>

<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">High-Wire Act</span>

</h1>

<p className="text-lg sm:text-xl text-slate-500 font-medium max-w-2xl lg:ml-1">

Fall into a <span className="font-bold text-slate-700">Million-Dollar Safety Net</span> with tax-advantaged compounding.

</p>

</div>

{/* TOP METRICS GRID (COMPARISON AWARE) */}

<div className="grid grid-cols-1 md:grid-cols-3 gap-6">

{/* TARGET CARD */}

<Card className="p-6 flex flex-col justify-center">

<div className="flex items-center justify-center gap-2 mb-4">

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

subLabel={`Potential Loss: ${formatCurrency(comparisonData['Total Nominal'] - finalData['Total Nominal'])}`}

/>

</div>

) : (

<div className="text-center">

<div className="text-3xl font-black text-slate-900 tracking-tight mb-1">

{formatCurrency(finalData['Total Nominal'])}

</div>

<p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Projected Nest Egg</p>

</div>

)}

</Card>

  

{/* GROWTH CARD */}

<Card className="p-6 flex flex-col justify-center">

<div className="flex items-center justify-center gap-2 mb-4">

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

<div className="text-3xl font-black text-slate-900 tracking-tight mb-1">

{formatCurrency(finalData['Investment Returns'])}

</div>

<p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Compound Interest</p>

</div>

)}

</Card>

  

{/* REAL VALUE CARD */}

<Card className="p-6 flex flex-col justify-center bg-white/80">

<div className="flex items-center justify-center gap-2 mb-4">

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

<div className="text-3xl font-black text-slate-900 tracking-tight mb-1">

{formatCurrency(finalData['Total Real (Today\'s $)'])}

</div>

<p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Purchasing Power</p>

</div>

)}

</Card>

</div>

  

{/* MAIN CHART CARD */}

<GlassCard className="p-6 lg:p-10 !rounded-[2rem]">

<div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">

<div>

<h2 className="font-serif font-black text-3xl text-slate-900 mb-2">The Trajectory</h2>

</div>

<div className="flex flex-wrap items-center gap-3">

<div className="bg-slate-100/50 p-1.5 rounded-xl flex text-sm font-bold shadow-inner">

<button

onClick={() => setActiveTab('chart')}

className={`px-6 py-2.5 rounded-lg transition-all shadow-sm ${activeTab === 'chart' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50 shadow-none'}`}

>

Chart

</button>

<button

onClick={() => setActiveTab('table')}

className={`px-6 py-2.5 rounded-lg transition-all shadow-sm ${activeTab === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50 shadow-none'}`}

>

Table

</button>

</div>

{isDelayed && (

<button

onClick={() => setShowImmediateLine(prev => !prev)}

className={`px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${showImmediateLine ? 'bg-slate-900 text-white' : 'bg-white/70 text-slate-500 hover:text-slate-700'}`}

>

Start-Now Line

</button>

)}

</div>

</div>

<div className="mt-3 text-[11px] text-slate-500">

Assumes contributions through the year selected, no contribution at retirement age, and returns compounded annually.

</div>

<div className="h-[400px] w-full">

{activeTab === 'chart' ? (

<ResponsiveContainer width="100%" height="100%">

<AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>

<defs>

<linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">

<stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>

<stop offset="95%" stopColor="#10b981" stopOpacity={0}/>

</linearGradient>

<linearGradient id="colorUser" x1="0" y1="0" x2="0" y2="1">

<stop offset="5%" stopColor="#6366f1" stopOpacity={0.6}/>

<stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>

</linearGradient>

<linearGradient id="colorEmployer" x1="0" y1="0" x2="0" y2="1">

<stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>

<stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>

</linearGradient>

</defs>

<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />

<XAxis

dataKey="age"

axisLine={false}

tickLine={false}

tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}}

dy={10}

/>

<YAxis

width={80} // Increased width for larger dollar values

axisLine={false}

tickLine={false}

tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}}

tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}

/>

<Tooltip

contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.9)', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', padding: '16px' }}

formatter={(value) => [formatCurrency(value), ""]}

labelStyle={{ color: '#0f172a', marginBottom: '8px', fontWeight: '900', fontFamily: 'serif', fontSize: '18px' }}

itemStyle={{ padding: 0 }}

separator=""

/>

<Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontWeight: 600, color: '#64748b' }}/>

<Area name="Your Contributions" type="monotone" dataKey="Your Contributions" stroke="#6366f1" strokeWidth={3} fill="url(#colorUser)" stackId="1" />

<Area name="Employer Match" type="monotone" dataKey="Employer Match" stroke="#8b5cf6" strokeWidth={3} fill="url(#colorEmployer)" stackId="1" />

<Area name="Investment Returns" type="monotone" dataKey="Investment Returns" stroke="#10b981" strokeWidth={3} fill="url(#colorReturns)" stackId="1" />

{isDelayed && showImmediateLine && (

<Line name="Start Now Total" type="monotone" dataKey="Immediate Total Nominal" stroke="#0f172a" strokeDasharray="6 6" strokeWidth={2} dot={false} />

)}

</AreaChart>

</ResponsiveContainer>

) : (

<div className="h-full overflow-auto custom-scrollbar border border-slate-100 rounded-xl bg-white/50">

<table className="w-full text-left text-sm">

<thead className="bg-slate-50/80 sticky top-0 font-bold text-slate-600 backdrop-blur z-10">

<tr>

<th className="p-4">Age</th>

<th className="p-4">Employee</th>

<th className="p-4">Employer</th>

<th className="p-4">Total Contrib</th>

<th className="p-4 text-emerald-600">Growth</th>

<th className="p-4 text-emerald-600">Returns</th>

<th className="p-4 text-right">Total</th>

<th className="p-4 text-right">Real (Today)</th>

<th className="p-4 text-right">Real (Retire)</th>

</tr>

</thead>

<tbody className="divide-y divide-slate-100/50">

{results.map((row, idx) => {

const isStartYear = row.age === inputs.startAge && isDelayed;

const isWaiting = row.age < inputs.startAge;

return (

<tr key={idx} className={`transition-colors ${isStartYear ? 'bg-indigo-50/80' : 'hover:bg-white/60'} ${isWaiting ? 'opacity-50 grayscale' : ''}`}>

<td className="p-4 font-bold text-slate-500 flex items-center gap-2">

{row.age}

{isStartYear && <Badge color="indigo">Start</Badge>}

</td>

<td className="p-4 font-medium">{formatCurrency(row['Employee Contribution (Year)'])}</td>

<td className="p-4 font-medium">{formatCurrency(row['Employer Contribution (Year)'])}</td>

<td className="p-4 font-medium">{formatCurrency(row['Total Contribution (Year)'])}</td>

<td className="p-4 text-emerald-600 font-bold">{formatCurrency(row['Year Growth'])}</td>

<td className="p-4 text-emerald-600 font-bold">{formatCurrency(row['Investment Returns'])}</td>

<td className="p-4 text-right font-black text-slate-800">{formatCurrency(row['Total Nominal'])}</td>

<td className="p-4 text-right font-semibold text-slate-600">{formatCurrency(row['Total Real (Today\'s $)'])}</td>

<td className="p-4 text-right font-semibold text-slate-600">{formatCurrency(row['Total Real (Retirement $)'])}</td>

</tr>

);

})}

</tbody>

</table>

</div>

)}

</div>

</GlassCard>

  

{/* QUICK STATS FOOTER */}

<div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-20">

{[

{ label: "Self Funded", value: finalData['Your Contributions'], color: "text-indigo-600", bg: "bg-indigo-50", icon: User },

{ label: "Employer Funded", value: finalData['Employer Match'], color: "text-purple-600", bg: "bg-purple-50", icon: Building2 },

{ label: "Market Funded", value: finalData['Investment Returns'], color: "text-emerald-600", bg: "bg-emerald-50", icon: Coins },

].map((stat, i) => (

<GlassCard key={i} className="p-6 flex flex-row items-center gap-6 group hover:scale-[1.02] transition-transform duration-300">

<div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>

<stat.icon size={24} />

</div>

<div>

<div className={`text-xl font-black ${stat.color}`}>{formatCurrency(stat.value)}</div>

<div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">

{stat.label} • {finalData['Total Nominal'] > 0 ? Math.round((stat.value / finalData['Total Nominal']) * 100) : 0}%

</div>

</div>

</GlassCard>

))}

</div>

</div>

</div>

  

{/* MOBILE SETTINGS DRAWER */}

{isSettingsOpen && (

<div className="lg:hidden absolute inset-0 z-50 flex items-end sm:items-center justify-center">

<div

className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"

onClick={() => setIsSettingsOpen(false)}

/>

<div className="bg-white/90 backdrop-blur-xl w-full h-[85vh] rounded-t-3xl shadow-2xl relative flex flex-col animate-in slide-in-from-bottom duration-300 border-t border-white/50">

<div className="p-5 border-b border-slate-100/50 flex justify-between items-center">

<h3 className="font-serif font-black text-xl text-slate-800">Configuration</h3>

<button

onClick={() => setIsSettingsOpen(false)}

className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors"

>

<X size={20} />

</button>

</div>

<div className="p-6 overflow-y-auto custom-scrollbar">

<SettingsPanel inputs={inputs} handleInputChange={handleInputChange} formatCurrency={formatCurrency} isMobile={true} />

</div>

</div>

</div>

)}

  

</div>

<style>{`

.custom-scrollbar::-webkit-scrollbar { width: 6px; }

.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }

.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.3); border-radius: 10px; }

.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(148, 163, 184, 0.5); }

`}</style>

</div>

);

};

  

export default App;