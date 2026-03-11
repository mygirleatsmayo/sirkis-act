import { LIMITS } from '../constants';
import type { Inputs, ProjectionRow } from '../types';

export const runProjection = (inputs: Inputs, startAgeOverride: number): ProjectionRow[] => {
const data: ProjectionRow[] = [];
const init401k = inputs.enableStartingBalances ? inputs.starting401k : 0;
const initRoth = inputs.enableStartingBalances ? inputs.startingRoth : 0;
const initHSA = inputs.enableStartingBalances ? inputs.startingHSA : 0;
let balance401k = init401k;
let balanceRoth = initRoth;
let balanceHSA = initHSA;
let cumUserCont = init401k + initRoth + initHSA;
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
