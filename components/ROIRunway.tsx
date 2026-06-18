import React, { useState, useMemo, useEffect } from 'react';
import { UserState, College, CollegeResult, SalaryInsights } from '../types';
import { analyzeCFPBudget } from '../services/gemini';
import { 
  DollarSign, 
  GraduationCap, 
  Coins, 
  TrendingUp, 
  Sparkles, 
  Calculator, 
  CheckCircle2, 
  AlertCircle, 
  PieChart as PieIcon, 
  Info, 
  Briefcase, 
  ChevronRight, 
  HelpCircle,
  Lightbulb,
  ShieldAlert,
  Layers,
  Percent,
  Download,
  Flame,
  Wand2,
  Calendar,
  Compass
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  Legend, 
  CartesianGrid, 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  ComposedChart
} from 'recharts';

interface ROIRunwayProps {
  userState: UserState;
  themeColor?: string;
}

// --- Country Presets & Taxation Realities ---
interface RegionPreset {
  countryName: string;
  currency: string;
  currencySymbol: string;
  taxRate: number;        // flat rate simplification
  inflationRate: number;  // annual inflation COL increase
  averageCOL: number;     // annual living expense
  tuitionCost: number;    // annual tuition fee
  loanInterest: number;   // annual interest rate on student loans
  avgEntrySalary: number;  // typical starting graduate salary
  growthRate: number;      // annual wage growth
}

const REGION_PRESETS: Record<string, RegionPreset> = {
  'USA': {
    countryName: 'United States',
    currency: 'USD',
    currencySymbol: '$',
    taxRate: 0.22,
    inflationRate: 0.03,
    averageCOL: 24000,
    tuitionCost: 35000,
    loanInterest: 0.055,
    avgEntrySalary: 75000,
    growthRate: 0.05,
  },
  'INDIA': {
    countryName: 'India',
    currency: 'INR',
    currencySymbol: '₹',
    taxRate: 0.15,
    inflationRate: 0.055,
    averageCOL: 250000,
    tuitionCost: 300000,
    loanInterest: 0.085,
    avgEntrySalary: 750000,
    growthRate: 0.08,
  },
  'SINGAPORE': {
    countryName: 'Singapore',
    currency: 'SGD',
    currencySymbol: 'S$',
    taxRate: 0.08,
    inflationRate: 0.025,
    averageCOL: 20000,
    tuitionCost: 28000,
    loanInterest: 0.035,
    avgEntrySalary: 55000,
    growthRate: 0.045,
  },
  'UNITED KINGDOM': {
    countryName: 'United Kingdom',
    currency: 'GBP',
    currencySymbol: '£',
    taxRate: 0.20,
    inflationRate: 0.032,
    averageCOL: 15000,
    tuitionCost: 18000,
    loanInterest: 0.047,
    avgEntrySalary: 38000,
    growthRate: 0.04,
  },
  'CANADA': {
    countryName: 'Canada',
    currency: 'CAD',
    currencySymbol: 'C$',
    taxRate: 0.20,
    inflationRate: 0.03,
    averageCOL: 18000,
    tuitionCost: 22000,
    loanInterest: 0.052,
    avgEntrySalary: 62000,
    growthRate: 0.048,
  },
  'AUSTRALIA': {
    countryName: 'Australia',
    currency: 'AUD',
    currencySymbol: 'A$',
    taxRate: 0.21,
    inflationRate: 0.031,
    averageCOL: 26000,
    tuitionCost: 34000,
    loanInterest: 0.061,
    avgEntrySalary: 72000,
    growthRate: 0.052,
  },
};

const getPresetKey = (countryName: string): string => {
  const norm = countryName.toUpperCase().trim();
  if (norm.includes('INDIA')) return 'INDIA';
  if (norm.includes('SINGAPORE')) return 'SINGAPORE';
  if (norm.includes('LONDON') || norm.includes('UK') || norm.includes('UNITED KINGDOM') || norm.includes('GREAT BRITAIN')) return 'UNITED KINGDOM';
  if (norm.includes('CANADA')) return 'CANADA';
  if (norm.includes('AUSTRALIA')) return 'AUSTRALIA';
  return 'USA'; // default fallback
};

interface TaxBracket {
  limit: number | null; // null means no upper limit
  rate: number;
}

const TAX_BRACKETS: Record<string, TaxBracket[]> = {
  'USA': [
    { limit: 11600, rate: 0.10 },
    { limit: 47150, rate: 0.12 },
    { limit: 100525, rate: 0.22 },
    { limit: 191950, rate: 0.24 },
    { limit: null, rate: 0.32 }
  ],
  'INDIA': [
    { limit: 300000, rate: 0.00 },
    { limit: 700000, rate: 0.05 },
    { limit: 1000000, rate: 0.10 },
    { limit: 1200000, rate: 0.15 },
    { limit: 1500000, rate: 0.20 },
    { limit: null, rate: 0.30 }
  ],
  'SINGAPORE': [
    { limit: 20000, rate: 0.00 },
    { limit: 30000, rate: 0.02 },
    { limit: 40000, rate: 0.035 },
    { limit: 80000, rate: 0.07 },
    { limit: 120000, rate: 0.115 },
    { limit: null, rate: 0.15 }
  ],
  'UNITED KINGDOM': [
    { limit: 12570, rate: 0.00 },
    { limit: 50270, rate: 0.20 },
    { limit: null, rate: 0.40 }
  ],
  'CANADA': [
    { limit: 53359, rate: 0.15 },
    { limit: 106717, rate: 0.205 },
    { limit: 165430, rate: 0.26 },
    { limit: null, rate: 0.29 }
  ],
  'AUSTRALIA': [
    { limit: 18200, rate: 0.00 },
    { limit: 45000, rate: 0.19 },
    { limit: 120000, rate: 0.325 },
    { limit: null, rate: 0.37 }
  ],
};

const calculateProgressiveTax = (income: number, regionKey: string): number => {
  const brackets = TAX_BRACKETS[regionKey] || TAX_BRACKETS.USA;
  let tax = 0;
  let prevLimit = 0;

  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i];
    const limit = bracket.limit;
    const rate = bracket.rate;

    if (limit === null) {
      if (income > prevLimit) {
        tax += (income - prevLimit) * rate;
      }
      break;
    }

    if (income > limit) {
      tax += (limit - prevLimit) * rate;
      prevLimit = limit;
    } else {
      if (income > prevLimit) {
        tax += (income - prevLimit) * rate;
      }
      break;
    }
  }

  return tax;
};

export const ROIRunway: React.FC<ROIRunwayProps> = ({ userState, themeColor = '#06b6d4' }) => {
  // Determine standard keys based on profile state
  const statePresetKey = useMemo(() => getPresetKey(userState.country || 'USA'), [userState.country]);
  const initialPreset = REGION_PRESETS[statePresetKey] || REGION_PRESETS.USA;

  // --- Core Form/Slider State ---
  const [selectedRegion, setSelectedRegion] = useState<string>(statePresetKey);
  const activePreset = REGION_PRESETS[selectedRegion] || REGION_PRESETS.USA;

  const [tuitionCost, setTuitionCost] = useState<number>(activePreset.tuitionCost);
  const [scholarshipPercent, setScholarshipPercent] = useState<number>(15); // Default 15%
  const [workStudyIncome, setWorkStudyIncome] = useState<number>(0);
  const [loanInterest, setLoanInterest] = useState<number>(activePreset.loanInterest * 100);
  const [financeWithLoan, setFinanceWithLoan] = useState<boolean>(true);

  const [entrySalary, setEntrySalary] = useState<number>(activePreset.avgEntrySalary);
  const [salaryGrowth, setSalaryGrowth] = useState<number>(activePreset.growthRate * 100);
  const [livingCost, setLivingCost] = useState<number>(activePreset.averageCOL);
  const [inflationRate, setInflationRate] = useState<number>(activePreset.inflationRate * 100);
  const [taxRate, setTaxRate] = useState<number>(activePreset.taxRate * 100);

  const [repayShare, setRepayShare] = useState<number>(15); // % of net post-tax income committed to student loan payoff

  // --- Investment Simulator State ---
  const [investmentAllocation, setInvestmentAllocation] = useState<number>(30); // % of surplus allocated to index fund
  const [marketYield, setMarketYield] = useState<number>(8.0); // % standard annual market index yield

  // --- Scenarios & Budget Modes ---
  const [budgetMode, setBudgetMode] = useState<'standard' | 'frugal' | 'aggressive' | 'luxurious'>('standard');

  // --- Comparison Pathway States ---
  const [enableComparison, setEnableComparison] = useState<boolean>(false);
  const [compareRegion, setCompareRegion] = useState<string>(statePresetKey === 'USA' ? 'SINGAPORE' : 'USA');
  const comparePreset = REGION_PRESETS[compareRegion] || REGION_PRESETS.USA;
  const [compareTuition, setCompareTuition] = useState<number>(comparePreset.tuitionCost);
  const [compareEntrySalary, setCompareEntrySalary] = useState<number>(comparePreset.avgEntrySalary);

  // Sync compare regional defaults when compareRegion changes
  useEffect(() => {
    const cp = REGION_PRESETS[compareRegion] || REGION_PRESETS.USA;
    setCompareTuition(cp.tuitionCost);
    setCompareEntrySalary(cp.avgEntrySalary);
  }, [compareRegion]);


  const [storageTrigger, setStorageTrigger] = useState(0);

  useEffect(() => {
    const handleStorageChange = () => {
      setStorageTrigger(prev => prev + 1);
    };
    window.addEventListener('storage', handleStorageChange);
    // Listen for custom events or regular window storage changes
    window.addEventListener('pathfinder_saved_colleges_changed', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('pathfinder_saved_colleges_changed', handleStorageChange);
    };
  }, []);

  const [syncedPreferences, setSyncedPreferences] = useState<{
    campuses: string[];
    mattersMost: string[];
    instTypes: string[];
    rankingPref: string;
    extraPref: string;
    location: string;
    budget: string;
  } | null>(null);

  // Load preferences from localStorage on mount and when storageTrigger changes
  useEffect(() => {
    try {
      const campuses = localStorage.getItem("pathfinder_personal_campuses");
      const mattersMost = localStorage.getItem("pathfinder_personal_matters_most");
      const instTypes = localStorage.getItem("pathfinder_personal_institution_types");
      const rankingPref = localStorage.getItem("pathfinder_personal_ranking_preference");
      const extraPref = localStorage.getItem("pathfinder_personal_preferences");
      const location = localStorage.getItem("pathfinder_personal_location");
      const budget = localStorage.getItem("pathfinder_personal_budget");

      if (campuses || mattersMost || instTypes || rankingPref || extraPref || location || budget) {
        setSyncedPreferences({
          campuses: campuses ? JSON.parse(campuses) : [],
          mattersMost: mattersMost ? JSON.parse(mattersMost) : [],
          instTypes: instTypes ? JSON.parse(instTypes) : [],
          rankingPref: rankingPref || 'No preference',
          extraPref: extraPref || '',
          location: location || '',
          budget: budget || '',
        });
      } else {
        setSyncedPreferences(null);
      }
    } catch (e) {
      console.error(e);
    }
  }, [storageTrigger]);

  // College list matching from college finder results
  const availableColleges = useMemo<College[]>(() => {
    let list: College[] = [];
    if (userState.collegeResults) {
      list = [
        ...(userState.collegeResults.domestic || []),
        ...(userState.collegeResults.foreign || [])
      ];
    }

    // Inject any saved shortlist colleges
    const savedCollegesStr = localStorage.getItem('pathfinder_saved_colleges');
    if (savedCollegesStr) {
      try {
        const savedList = JSON.parse(savedCollegesStr);
        if (Array.isArray(savedList)) {
          savedList.forEach((colObj) => {
            if (colObj && colObj.name && !list.some(c => c.name === colObj.name)) {
              list.push(colObj);
            }
          });
        }
      } catch (e) {
        console.error("Error reading saved colleges in ROI Runway", e);
      }
    }
    
    // Inject linked target college if it exists and is not present
    const storedCollegeStr = localStorage.getItem('pathfinder_roi_target_college');
    if (storedCollegeStr) {
      try {
        const colObj = JSON.parse(storedCollegeStr);
        if (colObj && colObj.name && !list.some(c => c.name === colObj.name)) {
          list.unshift(colObj);
        }
      } catch (e) {
        console.error(e);
      }
    }
    return list;
  }, [userState.collegeResults, storageTrigger]);

  const [selectedCollegeId, setSelectedCollegeId] = useState<string>('manual');

  // Load preset numbers when Selected Region changes
  useEffect(() => {
    const preset = REGION_PRESETS[selectedRegion] || REGION_PRESETS.USA;
    setTuitionCost(preset.tuitionCost);
    setLoanInterest(preset.loanInterest * 100);
    setEntrySalary(preset.avgEntrySalary);
    setSalaryGrowth(preset.growthRate * 100);
    setLivingCost(preset.averageCOL);
    setInflationRate(preset.inflationRate * 100);
    setTaxRate(preset.taxRate * 100);
    setSelectedCollegeId('manual');
  }, [selectedRegion]);

  // Handle selected college import details
  const handleCollegeSelect = (collegeName: string) => {
    setSelectedCollegeId(collegeName);
    if (collegeName === 'manual') return;

    const matched = availableColleges.find(c => c.name === collegeName);
    if (matched) {
      // Clean and parse tuition fees
      const feeNum = parseFee(matched.fees, activePreset.tuitionCost);
      setTuitionCost(feeNum);
    }
  };

  // Target Role / Core salary loading integrations
  useEffect(() => {
    if (userState.salaryInsights && userState.salaryInsights.currentLevels?.length > 0) {
      const insights = userState.salaryInsights;
      const entryLevel = insights.currentLevels.find(
        l => l.level.toLowerCase().includes('entry') || 
             l.level.toLowerCase().includes('junior') || 
             l.level.toLowerCase().includes('graduate')
      );
      if (entryLevel && entryLevel.average) {
        setEntrySalary(entryLevel.average);
      } else {
        const avg = insights.currentLevels[0]?.average;
        if (avg) setEntrySalary(avg);
      }
    } else if (userState.recommendations && userState.recommendations.length > 0) {
      // Extract from first recommendation range
      const rec = userState.recommendations[0];
      const salaryStr = rec.salaryRange.replace(/[^\d-]/g, ''); // get numbers and dashes
      const parts = salaryStr.split('-');
      if (parts.length > 0) {
        const val = parseInt(parts[0], 10);
        if (!isNaN(val) && val > 1000) {
          // If range is e.g. 70-100 indicating thousands (k) or full values
          const scalar = val < 10000 ? 1000 : 1;
          setEntrySalary(val * scalar);
        }
      }
    }
  }, [userState.salaryInsights, userState.recommendations]);

  // Real-Time View Synchronization (Cross-Tab Integration)
  useEffect(() => {
    const syncRealTimeData = () => {
      // 1. Target college fee synchronization
      const storedCollegeStr = localStorage.getItem('pathfinder_roi_target_college');
      if (storedCollegeStr) {
        try {
          const colObj = JSON.parse(storedCollegeStr);
          const feeStr = colObj.fees;
          if (feeStr) {
            const sanitized = feeStr.replace(/[^\d]/g, '');
            const num = parseInt(sanitized, 10);
            if (!isNaN(num) && num > 10) {
              setTuitionCost(num);
              setSelectedCollegeId(colObj.name);
            }
          }
        } catch (e) {
          console.error(e);
        }
      }

      // 2. Expected starting wage synchronization
      const storedSalaryStr = localStorage.getItem('pathfinder_roi_linked_salary');
      if (storedSalaryStr) {
        const salaryVal = parseInt(storedSalaryStr, 10);
        if (!isNaN(salaryVal) && salaryVal > 0) {
          setEntrySalary(salaryVal);
        }
      }
    };

    syncRealTimeData();
    window.addEventListener('storage', syncRealTimeData);
    return () => window.removeEventListener('storage', syncRealTimeData);
  }, [availableColleges, selectedRegion]);

  const parseFee = (feeStr: string, fallback: number): number => {
    if (!feeStr) return fallback;
    const sanitized = feeStr.replace(/[^\d]/g, '');
    const num = parseInt(sanitized, 10);
    if (!isNaN(num) && num > 100) return num;
    return fallback;
  }  // --- 10-Year Interactive Financial Math Engine ---
  const projectionData = useMemo(() => {
    const data = [];
    let cumulativeDebt = 0;
    let savings = 0;

    // Budget Mode Custom Overrides
    let actualLivingCost = livingCost;
    let actualRepayShare = repayShare;
    let actualSalaryGrowth = salaryGrowth;

    if (budgetMode === 'frugal') {
      actualLivingCost = Math.round(livingCost * 0.65);
      actualRepayShare = 25;
    } else if (budgetMode === 'aggressive') {
      actualLivingCost = Math.round(livingCost * 0.75);
      actualRepayShare = 35;
      actualSalaryGrowth = salaryGrowth + 2;
    } else if (budgetMode === 'luxurious') {
      actualLivingCost = Math.round(livingCost * 1.35);
      actualRepayShare = 10;
    }
    
    // Constant parameters (Primary)
    const tCost = tuitionCost * (1 - scholarshipPercent / 100);
    const rTax = taxRate / 100;
    const rInflation = inflationRate / 100;
    const rGrowth = actualSalaryGrowth / 100;
    const rInterest = loanInterest / 100;
    const rRepayShare = actualRepayShare / 100;

    let currentLivingCost = actualLivingCost;
    let currentGrossSalary = entrySalary;

    // --- Comparison Pathway Parameters ---
    let compDebt = 0;
    let compSave = 0;
    const compT = compareTuition * (1 - scholarshipPercent / 100);
    const cp = REGION_PRESETS[compareRegion] || REGION_PRESETS.USA;
    const compTax = cp.taxRate;
    const compInf = cp.inflationRate;
    const compGro = cp.growthRate;
    const compInt = cp.loanInterest;
    const compRepay = 0.15; // standard 15%

    let compLiving = cp.averageCOL;
    let compGross = compareEntrySalary;

    // Year 1-4 (College Phase)
    for (let yr = 1; yr <= 4; yr++) {
      // Primary math
      const annualCollegeCost = tCost + currentLivingCost - workStudyIncome;
      let debtAdded = 0;
      if (financeWithLoan) {
        debtAdded = Math.max(0, annualCollegeCost);
        cumulativeDebt = (cumulativeDebt + debtAdded) * (1 + rInterest);
      } else {
        savings -= Math.max(0, annualCollegeCost);
      }

      // Comparison math
      let compareDebtAdded = 0;
      let compareNetWorth = 0;
      let compareStudentDebtValue = 0;
      if (enableComparison) {
        const compareCollegeCost = compT + compLiving - workStudyIncome;
        if (financeWithLoan) {
          compareDebtAdded = Math.max(0, compareCollegeCost);
          compDebt = (compDebt + compareDebtAdded) * (1 + compInt);
          compareStudentDebtValue = Math.round(compDebt);
          compareNetWorth = Math.round(compSave - compDebt);
        } else {
          compSave -= Math.max(0, compareCollegeCost);
          compareStudentDebtValue = 0;
          compareNetWorth = Math.round(compSave);
        }
      }

      data.push({
        year: `Yr ${yr} (Col)`,
        phase: 'College',
        grossIncome: 0,
        netIncome: 0,
        totalTax: 0,
        livingExpenses: currentLivingCost,
        tuitionPaid: tCost,
        debtRepaid: 0,
        interestAccrued: financeWithLoan ? cumulativeDebt * rInterest : 0,
        studentDebt: Math.round(cumulativeDebt),
        savings: Math.round(savings),
        investmentPortfolio: 0,
        bankCash: Math.round(savings),
        netWorth: Math.round(savings - cumulativeDebt),

        // Comparison fields
        compareLivingExpenses: enableComparison ? Math.round(compLiving) : undefined,
        compareStudentDebt: enableComparison ? compareStudentDebtValue : undefined,
        compareSavings: enableComparison ? Math.round(compSave) : undefined,
        compareNetWorth: enableComparison ? compareNetWorth : undefined,
      });

      // Inflate living costs
      currentLivingCost *= (1 + rInflation);
      if (enableComparison) {
        compLiving *= (1 + compInf);
      }
    }

    // Year 5-10 (Working Phase)
    let bankCash = savings;
    let investmentPortfolio = 0;
    
    const rAllocation = investmentAllocation / 100;
    const rYield = marketYield / 100;

    for (let yr = 5; yr <= 10; yr++) {
      // Primary Working Phase
      const grossIncome = currentGrossSalary;
      
      // Calculate progressive tax with interactive slider scaling
      const baseProgressiveTax = calculateProgressiveTax(grossIncome, selectedRegion);
      const presetFlatRate = activePreset.taxRate || 0.15;
      const sliderFlatRate = taxRate / 100;
      const scaleFactor = presetFlatRate > 0 ? (sliderFlatRate / presetFlatRate) : 1;
      const totalTax = Math.round(baseProgressiveTax * scaleFactor);
      
      const netIncome = grossIncome - totalTax;
      const surplusBeforeLoan = netIncome - currentLivingCost;

      let debtRepaidThisYear = 0;
      let interestAccrued = 0;

      if (cumulativeDebt > 0) {
        interestAccrued = cumulativeDebt * rInterest;
        cumulativeDebt = cumulativeDebt + interestAccrued;
        const proposedPayment = netIncome * rRepayShare;
        debtRepaidThisYear = Math.min(cumulativeDebt, proposedPayment);
        cumulativeDebt -= debtRepaidThisYear;
      }

      const yrCashflow = surplusBeforeLoan - debtRepaidThisYear;
      
      // Grow existing investment portfolio by annual yield before fresh additions
      investmentPortfolio = investmentPortfolio * (1 + rYield);

      if (yrCashflow > 0) {
        const investedAmount = yrCashflow * rAllocation;
        const standardSavingsAmount = yrCashflow * (1 - rAllocation);
        investmentPortfolio += investedAmount;
        bankCash += standardSavingsAmount;
      } else {
        // Cover any living/debt payoff deficit first using interest-free liquid bank cash
        bankCash += yrCashflow;
        // If cash accounts are dry, liquidate some investments to balance the deficit
        if (bankCash < 0) {
          investmentPortfolio += bankCash; 
          bankCash = 0;
        }
      }

      // Re-sum total combined household assets / savings
      savings = bankCash + investmentPortfolio;

      // Comparison Working Phase
      let compareGrossThisYear = 0;
      let compareTaxThisYear = 0;
      let compareNetThisYear = 0;
      let compareRepaidThisYear = 0;
      let compareStudentDebtValue = 0;
      let compareNetWorth = 0;

      if (enableComparison) {
        compareGrossThisYear = compGross;
        
        // Calculate progressive tax for comparison region
        const baseCompareProgressive = calculateProgressiveTax(compareGrossThisYear, compareRegion);
        compareTaxThisYear = Math.round(baseCompareProgressive);
        
        compareNetThisYear = compareGrossThisYear - compareTaxThisYear;
        const compareSurplusBeforeLoan = compareNetThisYear - compLiving;

        if (compDebt > 0) {
          const compIntAccrued = compDebt * compInt;
          compDebt = compDebt + compIntAccrued;
          const proposedComparePayment = compareNetThisYear * compRepay;
          compareRepaidThisYear = Math.min(compDebt, proposedComparePayment);
          compDebt -= compareRepaidThisYear;
        }

        const compYrCashflow = compareSurplusBeforeLoan - compareRepaidThisYear;
        compSave += compYrCashflow;

        compareStudentDebtValue = Math.round(compDebt);
        compareNetWorth = Math.round(compSave - compDebt);
      }

      data.push({
        year: `Yr ${yr} (Job)`,
        phase: 'Working',
        grossIncome: Math.round(grossIncome),
        netIncome: Math.round(netIncome),
        totalTax: Math.round(totalTax),
        livingExpenses: Math.round(currentLivingCost),
        tuitionPaid: 0,
        debtRepaid: Math.round(debtRepaidThisYear),
        interestAccrued: Math.round(interestAccrued),
        studentDebt: Math.round(cumulativeDebt),
        savings: Math.round(savings),
        investmentPortfolio: Math.round(investmentPortfolio),
        bankCash: Math.round(bankCash),
        netWorth: Math.round(savings - cumulativeDebt),

        // Comparison fields
        compareGrossIncome: enableComparison ? Math.round(compareGrossThisYear) : undefined,
        compareNetIncome: enableComparison ? Math.round(compareNetThisYear) : undefined,
        compareLivingExpenses: enableComparison ? Math.round(compLiving) : undefined,
        compareStudentDebt: enableComparison ? compareStudentDebtValue : undefined,
        compareSavings: enableComparison ? Math.round(compSave) : undefined,
        compareNetWorth: enableComparison ? compareNetWorth : undefined,
      });

      // Growth formulas
      currentLivingCost *= (1 + rInflation);
      currentGrossSalary *= (1 + rGrowth);

      if (enableComparison) {
        compLiving *= (1 + compInf);
        compGross *= (1 + compGro);
      }
    }

    return data;
  }, [
    tuitionCost, scholarshipPercent, workStudyIncome, loanInterest, financeWithLoan,
    entrySalary, salaryGrowth, livingCost, inflationRate, taxRate, repayShare,
    budgetMode, enableComparison, compareRegion, compareTuition, compareEntrySalary,
    investmentAllocation, marketYield
  ]);

  // Compute outstanding metrics
  const stats = useMemo(() => {
    const yr4 = projectionData[3]; // Year 4 College end
    const yr10 = projectionData[9]; // Year 10 Career end

    const peakDebt = yr4 ? yr4.studentDebt : 0;
    const endNetWorth = yr10 ? yr10.netWorth : 0;
    const endSavings = yr10 ? yr10.savings : 0;
    const remainingDebt = yr10 ? yr10.studentDebt : 0;

    // Find break-even year (first year where Net Worth crosses above 0)
    let breakEvenYear: string | number = 'None';
    for (let i = 0; i < projectionData.length; i++) {
      if (projectionData[i].netWorth >= 0) {
        breakEvenYear = projectionData[i].year;
        break;
      }
    }

    // Emergency Fund Safe Year (First year when personal savings exceed 6 months of COL expenses)
    let emergencyFundYr = 'None';
    for (let i = 0; i < projectionData.length; i++) {
      const row = projectionData[i];
      if (row.phase === 'Working' && row.savings >= row.livingExpenses / 2) {
        emergencyFundYr = row.year;
        break;
      }
    }

    // Debt Free Year
    let debtFreeYr = 'None';
    for (let i = 0; i < projectionData.length; i++) {
      const row = projectionData[i];
      if (row.studentDebt === 0 && row.phase === 'Working') {
        const prevRow = projectionData[i - 1];
        if (prevRow && prevRow.studentDebt > 0) {
          debtFreeYr = row.year;
          break;
        }
      }
    }

    // If still having debt in Year 10, predict additional payoff duration
    if (debtFreeYr === 'None' && remainingDebt > 0) {
      const yr10Repay = yr10 ? yr10.debtRepaid : 0;
      if (yr10Repay > 0) {
        const extraYrs = Math.ceil(remainingDebt / yr10Repay);
        debtFreeYr = `Yr 10 + ${extraYrs} Years`;
      } else {
        debtFreeYr = 'Indefinite';
      }
    } else if (debtFreeYr === 'None' && peakDebt === 0) {
      debtFreeYr = 'No Loans';
    }

    // 50-30-20 Rule Alignment Audit (taken on Year 5 - first job year)
    const yr5 = projectionData[4];
    let budgetAuditScore = 'Unranked';
    let needsPercent = 0;
    let savingsPercent = 0;
    let wantsPercent = 0;

    if (yr5 && yr5.grossIncome > 0) {
      const gross = yr5.grossIncome;
      needsPercent = Math.round(((yr5.livingExpenses + yr5.totalTax) / gross) * 100);
      savingsPercent = Math.round(((yr5.debtRepaid + Math.max(0, yr5.savings)) / gross) * 100);
      wantsPercent = 100 - needsPercent - savingsPercent;
      if (wantsPercent < 0) wantsPercent = 0;

      if (needsPercent <= 55 && savingsPercent >= 18) {
        budgetAuditScore = 'Elite Alignment';
      } else if (needsPercent <= 65 && savingsPercent >= 12) {
        budgetAuditScore = 'Healthy Alignment';
      } else {
        budgetAuditScore = 'Under Friction';
      }
    }

    // Sum of taxes paid and total loan interest accrued
    let totalTaxPaid = 0;
    let totalInterestAccrued = 0;
    let totalEarnings = 0;
    projectionData.forEach(d => {
      totalTaxPaid += d.totalTax;
      totalInterestAccrued += d.interestAccrued;
      totalEarnings += d.grossIncome;
    });

    return {
      peakDebt,
      endNetWorth,
      endSavings,
      remainingDebt,
      breakEvenYear,
      emergencyFundYr,
      debtFreeYr,
      savingsRateYr5: savingsPercent,
      budgetAuditScore,
      needsPercentYr5: needsPercent,
      wantsPercentYr5: wantsPercent,
      totalTaxPaid: Math.round(totalTaxPaid),
      totalInterestAccrued: Math.round(totalInterestAccrued),
      totalEarnings: Math.round(totalEarnings),
    };
  }, [projectionData]);

  // --- Gemini Budget Projection Analysis Service ---
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [errorAi, setErrorAi] = useState<string>('');

  const triggerGeminiAnalysis = async () => {
    setLoadingAi(true);
    setErrorAi('');
    setAiAnalysis('');

    const formattedPayload = {
      country: activePreset.countryName,
      currency: activePreset.currency,
      annualTuition: tuitionCost,
      scholarshipApplied: scholarshipPercent,
      workStudyIncome,
      accumulatedDebt: stats.peakDebt,
      interestRate: loanInterest,
      entrySalary,
      growthRate: salaryGrowth,
      annualLivingExpense: livingCost,
      inflationRate,
      flatTaxRate: taxRate,
      remainingDebtYear10: stats.remainingDebt,
      netWorthYear10: stats.endNetWorth,
      breakEvenYear: stats.breakEvenYear,
      totalTaxesPaid: stats.totalTaxPaid,
      totalInterestAccrued: stats.totalInterestAccrued,
      careerPath: userState.targetCareer || 'Unspecified Tech Career',
      investmentAllocation,
      marketYield,
      studentCustomPreferences: syncedPreferences ? {
        regionalPreferences: syncedPreferences.location,
        targetBudgetRate: syncedPreferences.budget,
        rankingSystemPreferred: syncedPreferences.rankingPref,
        topPriorities: syncedPreferences.mattersMost,
        environmentalVibePreferred: syncedPreferences.campuses,
        preferredInstitutionTypes: syncedPreferences.instTypes,
        additionalRequirementsText: syncedPreferences.extraPref
      } : null
    };

    try {
      const responseText = await analyzeCFPBudget(formattedPayload, repayShare);
      setAiAnalysis(responseText);
    } catch (err: any) {
      console.error(err);
      setErrorAi(err?.message || 'Failed connecting to Pathfinder AI engine.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Year", "Phase", "Gross Income", "Total Tax", "Net Income", "Living Expenses", "Debt Repaid", "Remaining Student Debt", "Net Worth"];
    const rows = projectionData.map(r => [
      r.year,
      r.phase,
      r.grossIncome,
      r.totalTax,
      r.netIncome,
      r.livingExpenses,
      r.debtRepaid,
      r.studentDebt,
      r.netWorth
    ]);
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ROI_Financial_Projection_Matrix_${selectedRegion}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-[#fafafa] dark:bg-gray-950 transition-colors" id="roi-projector-view">
      
      {/* Header Panel */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 text-xs font-black tracking-widest rounded-lg uppercase">
            Personal Finance Engine
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white font-brand tracking-tight mt-1 flex items-center gap-2">
            <Coins className="w-9 h-9 text-cyan-500" /> ROI Runway & Financial Budget Projector
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm mt-1 max-w-2xl">
            Simulate college debt matrices, tax bracket impacts, inflation drags, and career compounding to chart your 10-year net worth pathway.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-350 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-black rounded-2xl cursor-pointer transition-all shadow-sm text-gray-650 dark:text-gray-300"
          >
            <Download className="w-4 h-4 text-cyan-500" /> Export CSV Matrix
          </button>

          {/* Active Preset Indicator */}
          <div className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl shadow-sm text-xs font-black text-gray-650 dark:text-gray-300 uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync: {activePreset.countryName}
          </div>
        </div>
      </div>

      {/* Grid Layout containing Slider Settings (Left) and Charts/Calculations (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: INTERACTIVE CONTROLLERS (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-6">
            
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-cyan-500" /> Projection Controls
              </h2>
              <button 
                onClick={() => {
                  const preset = REGION_PRESETS[selectedRegion];
                  if(preset) {
                    setTuitionCost(preset.tuitionCost);
                    setScholarshipPercent(15);
                    setWorkStudyIncome(0);
                    setLoanInterest(preset.loanInterest * 100);
                    setEntrySalary(preset.avgEntrySalary);
                    setSalaryGrowth(preset.growthRate * 100);
                    setLivingCost(preset.averageCOL);
                    setInflationRate(preset.inflationRate * 100);
                    setTaxRate(preset.taxRate * 100);
                    setRepayShare(15);
                    setInvestmentAllocation(30);
                    setMarketYield(8.0);
                    setSelectedCollegeId('manual');
                  }
                }}
                className="text-[10px] font-black uppercase text-cyan-500 tracking-wider hover:underline"
              >
                Reset Inputs
              </button>
            </div>

            {/* Country preset switcher */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center justify-between">
                <span>Select Macro Region</span>
                <span className="text-[10px] text-gray-300 dark:text-gray-600 font-normal">adjusts taxes & inflation</span>
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 p-3 rounded-xl text-sm font-bold text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              >
                {Object.keys(REGION_PRESETS).map((key) => (
                  <option key={key} value={key}>
                    {REGION_PRESETS[key].countryName} ({REGION_PRESETS[key].currency})
                  </option>
                ))}
              </select>
            </div>

            {/* Scenario Strategies Selector */}
            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center justify-between">
                <span>Budgeting Strategy</span>
                <span className="text-[10px] text-cyan-500 font-bold uppercase tracking-wide">Live Override</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'standard', name: 'Standard Path', desc: 'Inputs exactly' },
                  { id: 'frugal', name: 'Frugal Life', desc: '65% COL, 25% debt' },
                  { id: 'aggressive', name: 'Rapid Payoff', desc: '75% COL, 35% debt' },
                  { id: 'luxurious', name: 'Upscale Live', desc: '135% COL, 10% debt' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setBudgetMode(mode.id as any)}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      budgetMode === mode.id
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-400 font-black'
                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-transparent text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <p className="text-xs font-black leading-none mb-1">{mode.name}</p>
                    <span className="text-[9px] font-medium leading-none block opacity-80">{mode.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION: ACADEMICS & TUITION */}
            <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800">
              <h3 className="text-xs font-black text-cyan-500 uppercase tracking-widest flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" /> Academic & Loan Financing
              </h3>

              {/* College Result Integration Dropdown */}
              {availableColleges.length > 0 && (
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                    Import College Fees from Finder
                  </label>
                  <select
                    value={selectedCollegeId}
                    onChange={(e) => handleCollegeSelect(e.target.value)}
                    className="w-full bg-[#fcfcff] dark:bg-gray-850 border border-cyan-150 dark:border-cyan-900 p-3 rounded-xl text-xs font-bold text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  >
                    <option value="manual">-- Manual Settings --</option>
                    {availableColleges.map((col, idx) => (
                      <option key={`${col.name}-${idx}`} value={col.name}>
                        {col.name} ({col.fees.split('/')[0].trim()})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Annual Tuition */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-gray-600 dark:text-gray-300">Annual Tuition Fee</span>
                  <span className="text-sm font-black text-cyan-600 dark:text-cyan-400 font-mono">
                    {activePreset.currencySymbol}{tuitionCost.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={Math.round(activePreset.tuitionCost * 0.1)}
                  max={Math.round(activePreset.tuitionCost * 3)}
                  step={selectedRegion === 'INDIA' ? 25000 : 1000}
                  value={tuitionCost}
                  onChange={(e) => setTuitionCost(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              {/* Funding & Scholarship */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-gray-600 dark:text-gray-300">Scholarship & Aid %</span>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    {scholarshipPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={scholarshipPercent}
                  onChange={(e) => setScholarshipPercent(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              {/* Work study income */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-gray-600 dark:text-gray-300">Annual Part-Time Earnings</span>
                  <span className="text-sm font-black text-gray-700 dark:text-gray-300 font-mono">
                    {activePreset.currencySymbol}{workStudyIncome.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={selectedRegion === 'INDIA' ? 300000 : 25000}
                  step={selectedRegion === 'INDIA' ? 10000 : 1000}
                  value={workStudyIncome}
                  onChange={(e) => setLoanInterest && setWorkStudyIncome(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              {/* Student Debt Interest Rate */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-gray-600 dark:text-gray-300">Loan Interest Rate</span>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    {loanInterest.toFixed(1)}% APR
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="18"
                  step="0.5"
                  value={loanInterest}
                  onChange={(e) => setLoanInterest(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              {/* Loan switch toggle */}
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-850 p-3 rounded-xl border border-gray-100 dark:border-gray-800 mt-2">
                <div>
                  <p className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase leading-tight">Accrue Student Loan</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Fund tuition + living via interest compounding</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFinanceWithLoan(!financeWithLoan)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${financeWithLoan ? 'bg-cyan-500 justify-end' : 'bg-gray-200 dark:bg-gray-700 justify-start'}`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-md block" />
                </button>
              </div>

            </div>

            {/* SECTION: CAREER & INCOME */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <h3 className="text-xs font-black text-cyan-500 uppercase tracking-widest flex items-center gap-1.5">
                <Briefcase className="w-4 h-4" /> Career Post-Graduation
              </h3>

              {/* Basic Salary */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-gray-600 dark:text-gray-300">Base Entry Salary</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {activePreset.currencySymbol}{entrySalary.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={Math.round(activePreset.avgEntrySalary * 0.3)}
                  max={Math.round(activePreset.avgEntrySalary * 3)}
                  step={selectedRegion === 'INDIA' ? 50000 : 2000}
                  value={entrySalary}
                  onChange={(e) => setEntrySalary(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Annual Growth */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-gray-600 dark:text-gray-300">Expected Annual Raise</span>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 animate-pulse">
                    {salaryGrowth.toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={salaryGrowth}
                  onChange={(e) => setSalaryGrowth(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Income Tax Rate */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-gray-600 dark:text-gray-300">Average Tax Withholding</span>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    {taxRate.toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />

                {/* Progressive tax brackets visualization table */}
                <div className="mt-3 bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 rounded-2xl p-4.5">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[11px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                      Macro Progressive Tax Slabs: {activePreset.countryName}
                    </p>
                    <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-extrabold uppercase rounded-lg">
                      {selectedRegion} Slabs
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-xs font-medium">
                    {(TAX_BRACKETS[selectedRegion] || TAX_BRACKETS.USA).map((bracket, bIdx, arr) => {
                      const lower = bIdx === 0 ? 0 : arr[bIdx - 1].limit! + 1;
                      const upper = bracket.limit;
                      const hasPresetFactor = (taxRate / 100) / (activePreset.taxRate || 0.15);
                      // Apply scaling factor to show estimated active rate based on slider withholding
                      const activeRate = Math.min(100, Math.round(bracket.rate * hasPresetFactor * 1000) / 10);
                      
                      return (
                        <div key={bIdx} className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                          <span className="font-mono">
                            {lower === 0 ? "Up to " : `${activePreset.currencySymbol}${lower.toLocaleString()} - `}
                            {upper === null ? "and above" : `${activePreset.currencySymbol}${upper.toLocaleString()}`}
                          </span>
                          <span className="text-gray-900 dark:text-white font-black font-mono">
                            {activeRate.toFixed(1)}% <span className="text-[10px] text-gray-400 font-normal">({(bracket.rate * 105).toFixed(0)}% base)</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3 leading-relaxed border-t border-gray-100 dark:border-gray-800/80 pt-2.5">
                    *Brackets automatically recalculate in real-time as starting salary inflates or as global withholding changes.
                  </p>
                </div>
              </div>

              {/* Net Repay Committed Ratio */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-gray-600 dark:text-gray-300">Net Share Dedicated to Debt</span>
                  <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
                    {repayShare}% of Income
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="2.5"
                  value={repayShare}
                  onChange={(e) => setRepayShare(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

            </div>

            {/* SECTION: BUDGET & COST OF LIVING REALITIES */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <h3 className="text-xs font-black text-cyan-500 uppercase tracking-widest flex items-center gap-1.5">
                <Info className="w-4 h-4" /> Living & Inflation realities
              </h3>

              {/* Cost of Living */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-gray-600 dark:text-gray-300">Base Cost of Living (COL)</span>
                  <span className="text-sm font-black text-red-600 dark:text-red-400 font-mono">
                    {activePreset.currencySymbol}{livingCost.toLocaleString()}/yr
                  </span>
                </div>
                <input
                  type="range"
                  min={Math.round(activePreset.averageCOL * 0.3)}
                  max={Math.round(activePreset.averageCOL * 2.5)}
                  step={selectedRegion === 'INDIA' ? 20000 : 1000}
                  value={livingCost}
                  onChange={(e) => setLivingCost(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>

              {/* Inflation Factor */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-gray-600 dark:text-gray-300">Annual COL Inflation Rate</span>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    {inflationRate.toFixed(1)}% Inflation
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.5"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>

            </div>

            {/* SECTION: COMPOUND MARKET INVESTMENTS SIMULATOR */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-[#06b6d4] uppercase tracking-widest flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-500" /> Compound Markets
                  </h3>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">Direct leftover income to portfolios</p>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase rounded-lg">
                  Portfolio Mode
                </span>
              </div>

              {/* Investment Allocation slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-gray-600 dark:text-gray-300">Surplus Cash Allocation</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {investmentAllocation}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={investmentAllocation}
                  onChange={(e) => setInvestmentAllocation(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[9px] text-gray-400 font-bold">
                  <span>0% (Flat Cash)</span>
                  <span>50% (Balanced)</span>
                  <span>100% (Full index)</span>
                </div>
              </div>

              {/* Expected Stock Market annual Yield slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-gray-600 dark:text-gray-300">Expected Annual Portfolio Yield</span>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    {marketYield.toFixed(1)}% Yield
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="15"
                  step="0.5"
                  value={marketYield}
                  onChange={(e) => setMarketYield(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[9px] text-gray-400 font-bold">
                  <span>2% (Conserv)</span>
                  <span>8% (S&P avg)</span>
                  <span>15% (Aggress)</span>
                </div>
              </div>

              {/* Compound Yield Tipping Point Info/Card */}
              {investmentAllocation > 0 && (
                <div className="p-3 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/20 rounded-2xl">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed font-bold">
                    <span className="text-emerald-600 dark:text-emerald-400">⚡ Compound Tipping Point:</span> Shifting from paying off student debt liability to compounding capital assets accelerates Year 10 wealth creation. At {marketYield}% yield, every dollar invested today compounds multi-fold over the decade.
                  </p>
                </div>
              )}
            </div>

            {/* COMPARATIVE ROADMAP GATEWAY */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-cyan-500 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                    <Coins className="w-4 h-4 text-pink-500" /> Comparison Pathway
                  </h3>
                  <p className="text-[9px] text-gray-400 dark:text-gray-500 leading-tight mt-0.5">Plot side-by-side career strategy</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEnableComparison(!enableComparison)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-all duration-300 cursor-pointer ${enableComparison ? 'bg-pink-500 justify-end' : 'bg-gray-200 dark:bg-gray-700 justify-start'}`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-md block" />
                </button>
              </div>

              {enableComparison && (
                <div className="p-3 bg-pink-50/40 dark:bg-pink-950/10 border border-pink-100/50 dark:border-pink-900/25 rounded-2xl space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">
                      Compare Macro Region
                    </label>
                    <select
                      value={compareRegion}
                      onChange={(e) => setCompareRegion(e.target.value)}
                      className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-2 rounded-xl text-xs font-bold text-gray-850 dark:text-gray-300"
                    >
                      {Object.keys(REGION_PRESETS).map((key) => (
                        <option key={key} value={key}>
                          {REGION_PRESETS[key].countryName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Alternative Tuition</span>
                      <span className="text-xs font-mono font-bold">{comparePreset.currencySymbol}{compareTuition.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min={Math.round(comparePreset.tuitionCost * 0.3)}
                      max={Math.round(comparePreset.tuitionCost * 2.5)}
                      step="2000"
                      value={compareTuition}
                      onChange={(e) => setCompareTuition(Number(e.target.value))}
                      className="w-full h-1 bg-pink-200 accent-pink-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Alternative Entry Wage</span>
                      <span className="text-xs font-mono font-bold text-emerald-500">{comparePreset.currencySymbol}{compareEntrySalary.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min={Math.round(comparePreset.avgEntrySalary * 0.3)}
                      max={Math.round(comparePreset.avgEntrySalary * 2.5)}
                      step="2000"
                      value={compareEntrySalary}
                      onChange={(e) => setCompareEntrySalary(Number(e.target.value))}
                      className="w-full h-1 bg-pink-200 accent-pink-500"
                    />
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: CORE DASHBOARD, CHARTS & AI ANALYZER (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* TOP METRICS SUMMARY CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
            
            {/* Net Worth Year 10 */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between min-w-0 h-full">
              <div>
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-normal block mb-1 break-words">
                  Net Worth (Yr 10)
                </span>
                <p className={`text-lg sm:text-xl font-black font-brand leading-tight break-all ${stats.endNetWorth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {activePreset.currencySymbol}{stats.endNetWorth.toLocaleString()}
                </p>
              </div>
              <span className="text-[9px] text-gray-400 mt-2 block leading-snug break-words">
                Cash savings minus loans
              </span>
            </div>

            {/* Total Student Debt Peak */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between min-w-0 h-full">
              <div>
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-normal block mb-1 break-words">
                  Peak Debt (Yr 4)
                </span>
                <p className="text-lg sm:text-xl font-black font-brand leading-tight text-red-550 dark:text-red-400 break-all">
                  {activePreset.currencySymbol}{stats.peakDebt.toLocaleString()}
                </p>
              </div>
              <span className="text-[9px] text-gray-400 mt-2 block leading-snug break-words">
                End of college graduation
              </span>
            </div>

            {/* Dynamic Break-even crossing point */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between min-w-0 h-full">
              <div>
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-normal block mb-1 break-words">
                  Break-Even Year
                </span>
                <p className="text-lg sm:text-xl font-black font-brand leading-tight text-cyan-500 break-all">
                  {stats.breakEvenYear}
                </p>
              </div>
              <span className="text-[9px] text-gray-400 mt-2 block leading-snug break-words">
                Where net asset exceeds 0
              </span>
            </div>

            {/* Debt Payoff Milestone Year */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between min-w-0 h-full">
              <div>
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-normal block mb-1 break-words">
                  Debt-Free Target
                </span>
                <p className="text-lg sm:text-xl font-black font-brand leading-tight text-pink-500 break-all">
                  {stats.debtFreeYr}
                </p>
              </div>
              <span className="text-[9px] text-gray-400 mt-2 block leading-snug break-words">
                Fully paid-off runway year
              </span>
            </div>

            {/* Emergency Fund Safe Year */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between min-w-0 h-full">
              <div>
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-normal block mb-1 break-words">
                  E-Fund Safe Year
                </span>
                <p className="text-lg sm:text-xl font-black font-brand leading-tight text-purple-500 break-all">
                  {stats.emergencyFundYr}
                </p>
              </div>
              <span className="text-[9px] text-gray-400 mt-2 block leading-snug break-words">
                Savings exceed 6-mo costs
              </span>
            </div>

            {/* 50-30-20 Rules Budget Alignment Score */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between min-w-0 h-full">
              <div>
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-normal block mb-1 break-words">
                  Budget Health Score
                </span>
                <p className={`text-xs font-black uppercase leading-tight break-words ${stats.budgetAuditScore.includes('Elite') ? 'text-emerald-500' : stats.budgetAuditScore.includes('Healthy') ? 'text-cyan-500' : 'text-red-500'}`}>
                  {stats.budgetAuditScore}
                </p>
              </div>
              <span className="text-[9px] text-gray-400 mt-2 block leading-snug break-words">
                Based on Year 5 cash savings rate: {stats.savingsRateYr5}%
              </span>
            </div>

          </div>

          {/* RECHARTS AREA & LINE COMPOSED CHART PANEL */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="text-cyan-500 w-5 h-5" /> 10-Year Runway & Valuation Pathway
                </h3>
                <p className="text-xs text-gray-400 font-medium">
                  Green signals climbing net worth assets; orange reveals remaining compound loan liability.
                </p>
              </div>

              {/* Finance Type Indicators */}
              <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-cyan-500/20 border border-cyan-500 block" />
                  <span>Net Worth</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-red-500/20 border border-red-500 block" />
                  <span>Student Debt</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500 block" />
                  <span>Net Income</span>
                </div>
              </div>
            </div>

            {/* Real responsive chart block */}
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={projectionData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.01}/>
                    </linearGradient>
                    <linearGradient id="colorDebt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800/60" vertical={false} />
                  <XAxis 
                    dataKey="year" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9ca3af' }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    tickFormatter={(v) => `${activePreset.currencySymbol}${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}
                  />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                      borderRadius: '16px', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    cursor={{ stroke: 'rgba(6, 182, 212, 0.2)', strokeWidth: 1.5 }}
                    formatter={(value: any, name: string, props: any) => {
                      const baseVal = `${activePreset.currencySymbol}${Number(value).toLocaleString()}`;
                      if (name === "Net Worth" && props?.payload) {
                        const port = props.payload.investmentPortfolio || 0;
                        const cash = props.payload.bankCash || 0;
                        if (port > 0) {
                          return [
                            `${baseVal} (Cash: ${activePreset.currencySymbol}${cash.toLocaleString()} | Portfolio: ${activePreset.currencySymbol}${port.toLocaleString()})`,
                            name
                          ];
                        }
                      }
                      return [baseVal, name];
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="netWorth" 
                    name="Net Worth"
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorNetWorth)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="studentDebt" 
                    name="Student Debt"
                    stroke="#ef4444" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorDebt)" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="netIncome" 
                    name="Post-Tax Net Income"
                    stroke="#10b981" 
                    strokeWidth={2.5} 
                    dot={{ r: 3, stroke: '#10b981', fill: '#10b981' }}
                    activeDot={{ r: 5 }} 
                  />
                  {enableComparison && (
                    <Line 
                      type="monotone" 
                      dataKey="compareNetWorth" 
                      name="Compare Net Worth"
                      stroke="#f43f5e" 
                      strokeWidth={2.5} 
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  )}
                  {enableComparison && (
                    <Line 
                      type="monotone" 
                      dataKey="compareStudentDebt" 
                      name="Compare Student Debt"
                      stroke="#e11d48" 
                      strokeWidth={1.5} 
                      strokeDasharray="3 3"
                      dot={false}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SYNCHRONIZED PATHFINDER EXPLORER PREFERENCES */}
          {syncedPreferences && (
            <div className="bg-amber-500/5 dark:bg-amber-500/2 border border-amber-500/10 dark:border-amber-500/5 rounded-3xl p-5 mb-5 select-none animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2.5 mb-3.5">
                <span className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Compass className="w-4 h-4 animate-pulse text-amber-500" />
                </span>
                <div>
                  <h4 className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest font-brand">Synchronized educational priorities</h4>
                  <p className="text-[10px] text-gray-500 font-medium">Automatic college constraints synced from your Pathfinder personalized query questionnaire profile</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {syncedPreferences.location && (
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl">
                    Region: {syncedPreferences.location}
                  </span>
                )}
                {syncedPreferences.budget && (
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl">
                    Budget Constraint: {syncedPreferences.budget}
                  </span>
                )}
                {syncedPreferences.rankingPref && syncedPreferences.rankingPref !== "No preference" && (
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl">
                    Ranking Priority: {syncedPreferences.rankingPref}
                  </span>
                )}
                {syncedPreferences.mattersMost.map((m) => (
                  <span key={m} className="text-[10px] font-bold px-2.5 py-1 bg-cyan-50 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900/30 rounded-xl">
                    Priority: {m}
                  </span>
                ))}
                {syncedPreferences.campuses.map((v) => (
                  <span key={v} className="text-[10px] font-bold px-2.5 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                    Vibe: {v}
                  </span>
                ))}
                {syncedPreferences.instTypes.map((i) => (
                  <span key={i} className="text-[10px] font-bold px-2.5 py-1 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 rounded-xl">
                    Type: {i}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* DYNAMIC VALUE CORRELATIONS & AI GUIDANCE BUTTON PANEL */}
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 dark:border-cyan-500/10 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-cyan-500" /> Need Professional Financial Advice?
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Let our Pathfinder AI financial engine analyze your projected student loans, compound interest burden, inflation drag, and break-even targets.
              </p>
            </div>
            <button
              onClick={triggerGeminiAnalysis}
              disabled={loadingAi}
              className="px-6 py-3 bg-cyan-600 text-white hover:bg-cyan-700 font-extrabold text-sm rounded-2xl flex items-center gap-2 cursor-pointer transition-all shadow-md disabled:opacity-50"
            >
              {loadingAi ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  Analyzing Budget...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 animate-pulse" /> Trigger CFP AI Analysis
                </>
              )}
            </button>
          </div>

          {/* GEMINI AI COACH REPORT DISPLAY */}
          {aiAnalysis && (
            <div className="bg-white dark:bg-gray-900 border border-cyan-500/20 dark:border-cyan-500/10 rounded-3xl p-6 shadow-md relative overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Wand2 className="w-32 h-32 text-cyan-500" />
              </div>

              <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-md font-black text-gray-900 dark:text-white font-brand">Pathfinder CFP Report</h4>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-cyan-500">Dynamic AI Financial Guidance</p>
                </div>
              </div>

              {/* Clean markdown parsing wrapper */}
              <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed space-y-4 font-medium max-h-[450px] overflow-y-auto custom-scrollbar pr-2">
                <div className="markdown-body prose dark:prose-invert max-w-none">
                  {aiAnalysis.split('\n').map((line, idx) => {
                    if (line.startsWith('###')) {
                      return <h5 key={idx} className="text-sm font-black text-gray-900 dark:text-white mt-4 mb-1 uppercase tracking-wider">{line.replace('###', '').trim()}</h5>;
                    }
                    if (line.startsWith('##')) {
                      return <h4 key={idx} className="text-md font-black text-cyan-600 dark:text-cyan-400 mt-6 mb-2 border-b border-gray-100 dark:border-gray-800 pb-1">{line.replace('##', '').trim()}</h4>;
                    }
                    if (line.startsWith('#')) {
                      return <h3 key={idx} className="text-lg font-black text-cyan-500 mt-6 mb-2">{line.replace('#', '').trim()}</h3>;
                    }
                    if (line.startsWith('-') || line.startsWith('*')) {
                      return (
                        <div key={idx} className="flex items-start gap-2 my-1.5 ml-2">
                          <span className="text-cyan-500 pt-1">•</span>
                          <span>{line.substring(2).trim()}</span>
                        </div>
                      );
                    }
                    if (/^\d+\./.test(line)) {
                      return (
                        <div key={idx} className="flex items-start gap-2 my-1.5 ml-2">
                          <span className="text-cyan-500 font-bold leading-none">{line.match(/^\d+/)?.[0]}.</span>
                          <span>{line.replace(/^\d+\.\s*/, '').trim()}</span>
                        </div>
                      );
                    }
                    if (line.trim() === '') return <div key={idx} className="h-2" />;
                    return <p key={idx} className="my-2">{line}</p>;
                  })}
                </div>
              </div>

            </div>
          )}

          {errorAi && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-xs font-bold font-mono py-3 px-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorAi}</span>
            </div>
          )}

          {/* YEAR-BY-YEAR DETAILED PROJECTION MATRIX */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                <Layers className="w-5 h-5 text-cyan-500" /> 10-Year Runway Matrix
              </h3>
              <p className="text-xs text-gray-400">Detailed numerical results factoring compound interest, taxation withholdings, and cumulative living inflation.</p>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs font-bold">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-850 text-gray-400 uppercase tracking-widest text-[9px] border-b border-gray-100 dark:border-gray-800">
                    <th className="py-4 px-5">Timeline</th>
                    <th className="py-4 px-4">Phase</th>
                    <th className="py-4 px-4">Gross Income</th>
                    <th className="py-4 px-4">Tax Paid</th>
                    <th className="py-4 px-4">Net Income</th>
                    <th className="py-4 px-4">COL Expenses</th>
                    <th className="py-4 px-4">Debt Repaid</th>
                    <th className="py-4 px-4">Outstanding debt</th>
                    <th className="py-4 px-5 text-right">Net Worth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-gray-700 dark:text-gray-300">
                  {projectionData.map((row, index) => {
                    const isCol = row.phase === 'College';
                    return (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-850/40 transition-colors font-mono">
                        <td className="py-3 px-5 font-bold font-sans text-gray-900 dark:text-white whitespace-nowrap">{row.year}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] tracking-wide font-sans ${isCol ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'}`}>
                            {row.phase}
                          </span>
                        </td>
                        <td className="py-3 px-4">{row.grossIncome > 0 ? `${activePreset.currencySymbol}${row.grossIncome.toLocaleString()}` : '-'}</td>
                        <td className="py-3 px-4 text-red-500/80">{row.totalTax > 0 ? `${activePreset.currencySymbol}${row.totalTax.toLocaleString()}` : '-'}</td>
                        <td className="py-3 px-4 text-emerald-500">{row.netIncome > 0 ? `${activePreset.currencySymbol}${row.netIncome.toLocaleString()}` : '-'}</td>
                        <td className="py-3 px-4">{activePreset.currencySymbol}{row.livingExpenses.toLocaleString()}</td>
                        <td className="py-3 px-4 text-cyan-500/95">{row.debtRepaid > 0 ? `${activePreset.currencySymbol}${row.debtRepaid.toLocaleString()}` : '-'}</td>
                        <td className="py-3 px-4 text-red-400">{row.studentDebt > 0 ? `${activePreset.currencySymbol}${row.studentDebt.toLocaleString()}` : 'Cleared'}</td>
                        <td className={`py-3 px-5 text-right font-bold font-sans whitespace-nowrap ${row.netWorth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          <div>{activePreset.currencySymbol}{row.netWorth.toLocaleString()}</div>
                          {row.investmentPortfolio > 0 && (
                            <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-sans font-semibold">
                              Portfolio: {activePreset.currencySymbol}{row.investmentPortfolio.toLocaleString()}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>

          {/* EDUCATIONAL FOOTNOTE */}
          <div className="bg-gray-100 dark:bg-gray-900 border border-gray-250 dark:border-gray-800 p-5 rounded-2xl text-xs text-gray-500 dark:text-gray-400 leading-normal flex items-start gap-3">
            <Info className="w-5 h-5 text-cyan-500 flex-shrink-0 pt-0.5" />
            <p className="font-semibold">
              <strong className="text-gray-900 dark:text-white font-black block mb-0.5">Disclaimers & Mathematical Modeling Constraints</strong>
              All projections are estimates generated dynamically using custom compound calculations. Real world taxes vary by state/provincial brackets, deduction policies (e.g., standard dedution, 401k pre-tax deductions), family status, and custom interest rates. Inflation is modeled as a simple annual compounding factor. Always consult a licensed local counselor before committing to heavy debt loads.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
