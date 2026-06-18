
import React, { useState, useEffect } from 'react';
import { SalaryInsights, SalaryLevel, InDemandIndustry } from '../types';
import { getSalaryInsights, getInDemandIndustry } from '../services/gemini';
import { Loader2, Search, DollarSign, TrendingUp, TrendingDown, Briefcase, MapPin, Globe, Link2, Sparkles, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, AreaChart, Area, Legend } from 'recharts';

interface JobListingsProps {
  onComplete: (data: SalaryInsights) => void;
  existingData: SalaryInsights | null;
  country: string;
}

// Custom Tooltip for Bar Chart (Salary Levels)
const CustomBarTooltip = ({ active, payload, label, currency }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumSignificantDigits: 3 });
    
    return (
      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700 shadow-xl rounded-xl text-sm z-50">
        <p className="font-bold text-gray-900 dark:text-white mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">{data.level}</p>
        <div className="space-y-2">
            <div className="flex justify-between items-center gap-6">
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></div>
                    <span>Average</span>
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatter.format(data.average)}
                </span>
            </div>
            <div className="flex justify-between items-center gap-6">
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 mr-2"></div>
                    <span>Range</span>
                </div>
                <span className="font-mono text-gray-700 dark:text-gray-300 text-xs">
                    {formatter.format(data.min)} - {formatter.format(data.max)}
                </span>
            </div>
        </div>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Area Chart (Future Trends)
const CustomAreaTooltip = ({ active, payload, label, currency }: any) => {
    if (active && payload && payload.length) {
      const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumSignificantDigits: 3 });
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700 shadow-xl rounded-xl text-sm z-50">
          <p className="font-bold text-gray-900 dark:text-white mb-2">Year {label}</p>
          <div className="flex items-center gap-3">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Predicted Salary:</span>
            <span className="font-mono font-bold text-gray-900 dark:text-white text-lg">
                {formatter.format(payload[0].value)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

// Custom Box-and-Whisker SVG Shape for rendering salary variance distribution bounds
const CustomBoxAndWhiskerShape = (props: any) => {
  const { x, y, width, height, payload } = props;
  if (!payload || height === undefined || height === null) return null;

  const { min, q1, median, q3, max } = payload;
  
  const range = q3 - q1;
  const pixelPerSalary = range > 0 ? height / range : 0;

  const yMin = y + height + (q1 - min) * pixelPerSalary;
  const yMedian = y + (q3 - median) * pixelPerSalary;
  const yMax = y - (max - q3) * pixelPerSalary;

  const halfWidth = width / 2;
  const cx = x + halfWidth;

  return (
    <g id={`box-and-whisker-plot-group-${payload.level}`}>
      {/* Whisker Line (Bottom) */}
      <line
        x1={cx}
        y1={y + height}
        x2={cx}
        y2={yMin}
        stroke="#10b981"
        strokeWidth={2}
      />
      {/* Whisker Cap (Bottom) */}
      <line
        x1={cx - width * 0.2}
        y1={yMin}
        x2={cx + width * 0.2}
        y2={yMin}
        stroke="#10b981"
        strokeWidth={2}
      />

      {/* Whisker Line (Top) */}
      <line
        x1={cx}
        y1={y}
        x2={cx}
        y2={yMax}
        stroke="#10b981"
        strokeWidth={2}
      />
      {/* Whisker Cap (Top) */}
      <line
        x1={cx - width * 0.2}
        y1={yMax}
        x2={cx + width * 0.2}
        y2={yMax}
        stroke="#10b981"
        strokeWidth={2}
      />

      {/* Box (Q1 to Q3) */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="#10b981"
        fillOpacity={0.16}
        stroke="#10b981"
        strokeWidth={2.5}
        rx={3}
      />

      {/* Median Line */}
      <line
        x1={x}
        y1={yMedian}
        x2={x + width}
        y2={yMedian}
        stroke="#047857"
        strokeWidth={3.5}
      />
    </g>
  );
};

// Custom Tooltip for Box-and-Whisker plot
const BoxWhiskerTooltip = ({ active, payload, currency }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD', maximumSignificantDigits: 3 });
    return (
      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700 shadow-xl rounded-2xl text-xs space-y-2 min-w-[210px] z-50">
        <p className="font-extrabold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-750 pb-1.5 uppercase tracking-wider">{data.level} Variance</p>
        <div className="space-y-1.5 text-gray-600 dark:text-gray-300">
          <div className="flex justify-between items-center gap-4">
            <span className="font-medium text-gray-400">Maximum limit:</span>
            <span className="font-mono font-bold text-gray-900 dark:text-white">{formatter.format(data.max)}</span>
          </div>
          <div className="flex justify-between items-center gap-4 text-emerald-600 dark:text-emerald-400">
            <span className="font-medium">Upper Quartile (Q3):</span>
            <span className="font-mono font-semibold">{formatter.format(data.q3)}</span>
          </div>
          <div className="flex justify-between items-center gap-4 text-gray-900 dark:text-gray-100 font-extrabold">
            <span className="font-medium">Median (Avg):</span>
            <span className="font-mono">{formatter.format(data.median)}</span>
          </div>
          <div className="flex justify-between items-center gap-4 text-emerald-600 dark:text-emerald-400">
            <span className="font-medium">Lower Quartile (Q1):</span>
            <span className="font-mono font-semibold">{formatter.format(data.q1)}</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="font-medium text-gray-400">Minimum limit:</span>
            <span className="font-mono font-bold text-gray-900 dark:text-white">{formatter.format(data.min)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const JobListings: React.FC<JobListingsProps> = ({ onComplete, existingData, country }) => {
  const [role, setRole] = useState(existingData?.role || '');
  const [location, setLocation] = useState(existingData?.location || country);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SalaryInsights | null>(existingData);

  const [isSalaryLinked, setIsSalaryLinked] = useState<boolean>(false);
  
  // New States for In-Demand Industry and Compare Region
  const [inDemandIndustry, setInDemandIndustry] = useState<InDemandIndustry | null>(null);
  const [loadingIndustry, setLoadingIndustry] = useState(false);
  const [compareCountry, setCompareCountry] = useState('');
  const [compareData, setCompareData] = useState<SalaryInsights | null>(null);
  const [loadingCompare, setLoadingCompare] = useState(false);

  useEffect(() => {
    if (!data) return;
    const storedSal = localStorage.getItem('pathfinder_roi_linked_salary');
    const storedRole = localStorage.getItem('pathfinder_roi_linked_salary_role');
    const entryAvgVal = data.currentLevels.find(
      l => l.level.toLowerCase().includes('entry') || 
           l.level.toLowerCase().includes('junior') || 
           l.level.toLowerCase().includes('graduate')
    )?.average || data.currentLevels[0]?.average || 0;
    
    setIsSalaryLinked(storedRole?.toLowerCase() === data.role.toLowerCase() && Number(storedSal) === entryAvgVal);
  }, [data]);

  const handleLinkSalary = () => {
    if (!data) return;
    const entryAvgVal = data.currentLevels.find(
      l => l.level.toLowerCase().includes('entry') || 
           l.level.toLowerCase().includes('junior') || 
           l.level.toLowerCase().includes('graduate')
    )?.average || data.currentLevels[0]?.average || 50000;

    if (isSalaryLinked) {
      localStorage.removeItem('pathfinder_roi_linked_salary');
      localStorage.removeItem('pathfinder_roi_linked_salary_role');
      setIsSalaryLinked(false);
    } else {
      localStorage.setItem('pathfinder_roi_linked_salary_role', data.role);
      localStorage.setItem('pathfinder_roi_linked_salary', String(entryAvgVal));
      setIsSalaryLinked(true);
    }
    window.dispatchEvent(new Event('storage'));
  };

  // Update location when country prop changes, but only if no existing data or if user hasn't typed
  useEffect(() => {
    if (!existingData && location === '') {
        setLocation(country);
    }
  }, [country]);

  // Fetch in-demand industry based on selected location
  const fetchInDemandIndustry = async (countryName: string) => {
    if (!countryName) return;
    setLoadingIndustry(true);
    try {
      const res = await getInDemandIndustry(countryName);
      if (res) {
        setInDemandIndustry(res);
      }
    } catch (e) {
      console.error("Error fetching in demand sector details:", e);
    } finally {
      setLoadingIndustry(false);
    }
  };

  useEffect(() => {
    const targetLoc = data?.location || location || country;
    if (targetLoc) {
      fetchInDemandIndustry(targetLoc);
    }
  }, [data?.location, country]);

  const handleCompareCountryChange = async (targetCountry: string) => {
    setCompareCountry(targetCountry);
    if (!targetCountry) {
      setCompareData(null);
      return;
    }
    const targetRole = data?.role || role;
    if (!targetRole) return;
    setLoadingCompare(true);
    try {
      const res = await getSalaryInsights(targetRole, targetCountry);
      if (res) {
        setCompareData(res);
      }
    } catch (e) {
      console.error("Error fetching comparison market insights:", e);
    } finally {
      setLoadingCompare(false);
    }
  };

  const handlePredict = async () => {
    if (!role.trim()) return;
    setLoading(true);
    setCompareCountry('');
    setCompareData(null);
    try {
      const insights = await getSalaryInsights(role, location);
      if (insights) {
        setData(insights);
        onComplete(insights);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: data?.currency || 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(val);
  };

  // Calculate 5-Year Forecast trend trajectory at the component scope
  const baseForecastValue = data?.futureTrends && data.futureTrends.length > 0 ? data.futureTrends[0].salary : 0;
  const targetForecastValue = data?.futureTrends && data.futureTrends.length > 0 ? data.futureTrends[data.futureTrends.length - 1].salary : 0;
  const isTrendPositive = targetForecastValue >= baseForecastValue;
  const rawTrendDiff = targetForecastValue - baseForecastValue;
  const trendPercentage = baseForecastValue > 0 ? (rawTrendDiff / baseForecastValue) * 100 : 0;

  // Build mathematically coherent box-and-whisker metrics at the component scope
  const boxAndWhiskerData = data?.currentLevels.map(level => {
    const min = level.min;
    const max = level.max;
    const avg = level.average;
    
    const q1 = Math.round(min + (avg - min) * 0.45);
    const q3 = Math.round(avg + (max - avg) * 0.45);

    return {
      level: level.level,
      min,
      q1,
      median: avg,
      q3,
      max,
      boxRange: [q1, q3]
    };
  }) || [];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-20 md:pb-8">
      {/* Header */}
      <div className="mb-8 bg-gradient-to-r from-emerald-500 to-green-600 p-8 rounded-3xl text-white shadow-xl shadow-emerald-200 dark:shadow-none flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
            <h2 className="text-3xl font-bold font-brand flex items-center">
                <Briefcase className="w-8 h-8 mr-3 text-white/90" />
                Live Market Insights
            </h2>
            <p className="text-emerald-100 mt-2 text-lg">Real-time job listings, trending skills, and salary forecasting.</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">Job Role</label>
            <div className="relative">
                <input
                    type="text"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:text-white rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition font-medium"
                    placeholder="e.g. Data Scientist, UI Designer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePredict()}
                />
                <Search className="absolute left-4 top-4 w-6 h-6 text-gray-400" />
            </div>
        </div>
        <div className="w-full md:w-1/3">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">Location</label>
            <div className="relative">
                <input
                    type="text"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:text-white rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition font-medium"
                    placeholder="e.g. India, USA, Global"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePredict()}
                />
                <MapPin className="absolute left-4 top-4 w-6 h-6 text-gray-400" />
            </div>
        </div>
        <button
            onClick={handlePredict}
            disabled={loading || !role.trim()}
            className="w-full md:w-auto px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center whitespace-nowrap shadow-lg shadow-emerald-200 dark:shadow-none"
        >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Predict Salary'}
        </button>
      </div>

      {data && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              
              {/* Dynamic Synchronization & Comparative Action Hub */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {/* Left: Real-time sync connection banner */}
                <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-150 dark:border-emerald-900/30 px-6 py-6 rounded-3xl flex flex-col justify-between gap-4 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl text-white shrink-0 ${isSalaryLinked ? 'bg-emerald-600 animate-pulse' : 'bg-gray-400 dark:bg-gray-700'}`}>
                      <Link2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-gray-800 dark:text-white">ROI Runway Synchronization</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                        Expected starting wage for <span className="font-bold text-emerald-600 dark:text-emerald-400">{data.role}</span> is {formatCurrency(
                          data.currentLevels.find(
                            l => l.level.toLowerCase().includes('entry') || 
                                 l.level.toLowerCase().includes('junior') || 
                                 l.level.toLowerCase().includes('graduate')
                          )?.average || data.currentLevels[0]?.average || 50000
                        )}/yr in {data.location}. Link this to dynamically calculate course payback timelines.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLinkSalary}
                    className={`w-full py-3 font-extrabold text-xs whitespace-nowrap rounded-xl transition shadow-md ${
                      isSalaryLinked 
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100' 
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-105 dark:hover:bg-gray-750 border border-gray-150 dark:border-gray-700'
                    }`}
                  >
                    {isSalaryLinked ? 'Linked as ROI Starting Salary ✓' : 'Link to ROI Runway Engine'}
                  </button>
                </div>

                {/* Right: Compare Region dropdown control panel */}
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-3xl flex flex-col justify-between gap-4 shadow-sm">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-5 h-5 text-emerald-500" />
                      <h4 className="text-base font-black text-gray-800 dark:text-white">Compare Regional Markets</h4>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                      Select a second location to execute a side-by-side comparison of local average salary tiers, currency differentials, and hiring patterns for <span className="font-bold text-emerald-600 dark:text-emerald-400">{data.role}</span>.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Select target market</label>
                    <div className="flex gap-3">
                      <select
                        value={compareCountry}
                        onChange={(e) => handleCompareCountryChange(e.target.value)}
                        disabled={loadingCompare}
                        className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-700 rounded-xl px-4 py-3 text-xs text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                      >
                        <option value="">-- Choose Country to Compare --</option>
                        {[
                          'United States', 'United Kingdom', 'Canada', 'Australia', 
                          'Germany', 'India', 'Singapore', 'Japan', 'France', 
                          'United Arab Emirates', 'Brazil', 'South Africa'
                        ].filter(c => c.toLowerCase() !== data.location.toLowerCase() && c.toLowerCase() !== location.toLowerCase() && c.toLowerCase() !== country.toLowerCase()).map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      {loadingCompare && (
                        <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 px-3 rounded-xl">
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Country In-Demand Industry Insight Card */}
              {loadingIndustry ? (
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-150 dark:border-gray-700 animate-pulse flex flex-col items-center justify-center gap-3">
                  <Sparkles className="w-6 h-6 text-indigo-500 animate-spin" />
                  <span className="text-xs font-bold text-gray-400">Querying real-time market sector indices via Pathfinder AI...</span>
                </div>
              ) : inDemandIndustry ? (
                <div id="in-demand-sector-container" className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-purple-500/15 rounded-3xl p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl text-indigo-600 dark:text-indigo-400 border border-indigo-150/20">
                        <Sparkles className="w-5 h-5 font-bold" />
                      </div>
                      <div>
                        <span className="bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-[9px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-md border border-indigo-200/50 dark:border-indigo-850">
                          In-Demand Sector Profile
                        </span>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mt-1">
                          Most In-Demand Sector: <span className="text-indigo-600 dark:text-indigo-400">{inDemandIndustry.name}</span>
                        </h3>
                      </div>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-950 px-3.5 py-1.5 rounded-xl border border-indigo-150/40 dark:border-indigo-850 flex items-center gap-2 self-start sm:self-auto shadow-xs">
                      <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <div>
                        <p className="text-[8px] font-black text-gray-400 uppercase leading-none">Growth index</p>
                        <p className="text-xs font-black text-indigo-700 dark:text-indigo-300 mt-1">{inDemandIndustry.growthRate}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-350 leading-relaxed font-medium mb-5">
                    {inDemandIndustry.reason}
                  </p>
                  <div className="border-t border-gray-100 dark:border-gray-750 pt-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Hot Career Entry Roles:</p>
                    <div className="flex flex-wrap gap-2.5">
                      {inDemandIndustry.topJobs.map((job, idx) => (
                        <span key={idx} className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 font-bold text-xs text-gray-750 dark:text-gray-300 px-3.5 py-1.5 rounded-xl shadow-xs transition hover:border-indigo-400 dark:hover:border-indigo-500">
                          🎯 {job}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            
            {/* Level Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {data.currentLevels.map((level, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all group hover:-translate-y-1">
                        <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3 group-hover:text-emerald-500 transition-colors">{level.level}</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 truncate" title={formatCurrency(level.average)}>{formatCurrency(level.average)}</h3>
                        <div className="flex flex-wrap justify-between gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl">
                             <span className="truncate" title={`Min: ${formatCurrency(level.min)}`}>Min: {formatCurrency(level.min)}</span>
                             <span className="truncate" title={`Max: ${formatCurrency(level.max)}`}>Max: {formatCurrency(level.max)}</span>
                        </div>
                    </div>
                ))}
            </div>

             {/* Deep Market Insight Visualization Suite */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {/* Chart 1: Current Market Breakdown (BarChart) */}
                 <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                     <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-8">Current Market Breakdown</h3>
                     <div className="h-[300px]">
                         <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={data.currentLevels} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                 <XAxis dataKey="level" tick={{fontSize: 11, fill: '#6b7280', fontWeight: 600}} axisLine={false} tickLine={false} dy={10} />
                                 <YAxis tick={{fontSize: 11, fill: '#6b7280'}} tickFormatter={(value) => `${value / 1000}k`} axisLine={false} tickLine={false} />
                                 <Tooltip 
                                     cursor={{ fill: 'rgba(16, 185, 129, 0.1)', radius: 12 }}
                                     content={<CustomBarTooltip currency={data.currency} />}
                                 />
                                 <Bar dataKey="average" fill="#10b981" radius={[8, 8, 0, 0]} name="Avg Salary" animationDuration={1500} barSize={50} />
                             </BarChart>
                         </ResponsiveContainer>
                     </div>
                 </div>

                 {/* Chart 2: Salary Distribution Variance - Custom Box and Whisker Plot */}
                 <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                     <div>
                         <div className="flex justify-between items-start mb-4">
                             <h3 className="text-lg font-bold text-gray-900 dark:text-white">Salary distribution variance</h3>
                             <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 font-black uppercase px-2.5 py-1 rounded-md border border-emerald-150/40">
                               Box & Whisker Plot
                             </span>
                         </div>
                         <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                           Displays entry to lead seniority thresholds. Box represents Q1 to Q3 bounds, lines show min/max variance, and the center ticks trace median benchmarks.
                         </p>
                     </div>
                     <div className="h-[280px]">
                         <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={boxAndWhiskerData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.12} />
                                 <XAxis dataKey="level" tick={{fontSize: 11, fill: '#6b7280', fontWeight: 600}} axisLine={false} tickLine={false} dy={10} />
                                 <YAxis 
                                   tick={{fontSize: 11, fill: '#6b7280'}} 
                                   tickFormatter={(value) => `${value / 1000}k`} 
                                   axisLine={false} 
                                   tickLine={false}
                                   domain={['dataMin - 15000', 'dataMax + 15000']}
                                 />
                                 <Tooltip 
                                     cursor={{ fill: 'rgba(16, 185, 129, 0.05)', radius: 8 }}
                                     content={<BoxWhiskerTooltip currency={data.currency} />}
                                 />
                                 <Bar 
                                     dataKey="boxRange" 
                                     fill="#10b981" 
                                     shape={<CustomBoxAndWhiskerShape />} 
                                     animationDuration={1500} 
                                 />
                             </BarChart>
                         </ResponsiveContainer>
                     </div>
                 </div>

                 {/* Chart 3: Future Trends with Trend Arrow Indicator */}
                 <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 lg:col-span-2">
                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                         <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                             <TrendingUp className="w-5 h-5 mr-2 text-emerald-500" />
                             5-Year Growth Curve & Market Trajectory
                         </h3>
                         
                         {/* Positive / Negative Trend Indicator Badge */}
                         <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-extrabold ${
                           isTrendPositive 
                           ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-150/40 text-emerald-700 dark:text-emerald-400' 
                           : 'bg-rose-50 dark:bg-rose-950/20 border-rose-150/40 text-rose-700 dark:text-rose-450'
                         }`}>
                           {isTrendPositive ? (
                             <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                           ) : (
                             <TrendingDown className="w-4 h-4 text-rose-650" />
                           )}
                           <span>
                             Trajectory: {isTrendPositive ? 'Positive' : 'Negative'} ({isTrendPositive ? '+' : ''}{trendPercentage.toFixed(1)}%)
                           </span>
                         </div>
                     </div>
                     <div className="h-[300px]">
                         <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={data.futureTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                 <defs>
                                     <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                     <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                     </linearGradient>
                                 </defs>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                 <XAxis dataKey="year" tick={{fontSize: 12, fill: '#6b7280', fontWeight: 600}} axisLine={false} tickLine={false} dy={10} />
                                 <YAxis tick={{fontSize: 12, fill: '#6b7280'}} tickFormatter={(value) => `${value / 1000}k`} axisLine={false} tickLine={false} />
                                 <Tooltip 
                                      content={<CustomAreaTooltip currency={data.currency} />}
                                 />
                                 <Area 
                                     type="monotone" 
                                     dataKey="salary" 
                                     stroke="#10b981" 
                                     fillOpacity={1} 
                                     fill="url(#colorSalary)" 
                                     strokeWidth={4}
                                     activeDot={{ r: 6, strokeWidth: 0, fill: '#059669' }}
                                     animationDuration={1500}
                                 />
                             </AreaChart>
                         </ResponsiveContainer>
                     </div>
                 </div>
             </div>

             {/* Side-by-Side Dual Region Comparison Deck */}
             {compareData && (
               <div id="side-by-side-deck" className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-6 animate-in fade-in duration-300">
                 <div className="flex justify-between items-start gap-4">
                   <div>
                     <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border border-indigo-150/40">
                       Regional comparison analysis
                     </span>
                     <h3 className="text-xl font-black text-gray-900 dark:text-white mt-1.5">
                       {data.location} vs {compareData.location} Global Outlook
                     </h3>
                   </div>
                   <button 
                     onClick={() => { setCompareData(null); setCompareCountry(''); }}
                     className="text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-white border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-1.5 rounded-xl cursor-pointer"
                   >
                     Reset Comparison
                   </button>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                   {/* Comparative Dual Bar Chart */}
                   <div className="lg:col-span-2 bg-gray-50 dark:bg-gray-900/30 p-6 rounded-2xl border border-gray-150/50 dark:border-gray-750/50">
                     <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Wages Comparison by Seniority Bracket ({data.currency} vs {compareData.currency})</h4>
                     <div className="h-[250px]">
                       <ResponsiveContainer width="100%" height="100%">
                         <BarChart 
                           data={data.currentLevels.map((lvl, idx) => {
                             const companion = compareData.currentLevels.find(
                               cl => cl.level.toLowerCase() === lvl.level.toLowerCase()
                             ) || compareData.currentLevels[idx];
                             return {
                               level: lvl.level,
                               [data.location]: lvl.average,
                               [compareData.location]: companion ? companion.average : 0
                             };
                           })}
                           margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                         >
                           <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                           <XAxis dataKey="level" tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 600 }} axisLine={false} tickLine={false} />
                           <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={(val) => `${val / 1000}k`} axisLine={false} tickLine={false} />
                           <Tooltip 
                             cursor={{ fill: 'rgba(16, 185, 129, 0.05)', radius: 6 }}
                             formatter={(value: any, name: string) => {
                               const targetCurr = name === data.location ? data.currency : compareData.currency;
                               return [new Intl.NumberFormat('en-US', { style: 'currency', currency: targetCurr || 'USD', maximumSignificantDigits: 3 }).format(value), name];
                             }}
                           />
                           <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                           <Bar dataKey={data.location} fill="#10b981" radius={[6, 6, 0, 0]} />
                           <Bar dataKey={compareData.location} fill="#6366f1" radius={[6, 6, 0, 0]} />
                         </BarChart>
                       </ResponsiveContainer>
                     </div>
                   </div>

                   {/* Compare Outlook panels */}
                   <div className="bg-gray-50 dark:bg-gray-900/30 p-5 rounded-2xl border border-gray-150/50 dark:border-gray-750/50 flex flex-col justify-between">
                     <div>
                       <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Target Market Outlook Comparison</h4>
                       <div className="space-y-4">
                         <div>
                           <p className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 leading-none">{data.location}</p>
                           <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold mt-1.5 max-h-[85px] overflow-y-auto leading-relaxed">{data.marketOutlook}</p>
                         </div>
                         <div className="border-t border-gray-150 dark:border-gray-750/45 pt-3">
                           <p className="text-[10px] font-black uppercase text-indigo-500 leading-none">{compareData.location}</p>
                           <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold mt-1.5 max-h-[85px] overflow-y-auto leading-relaxed">{compareData.marketOutlook}</p>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Curated Side-by-Side Values Deck */}
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                   {data.currentLevels.map((lvl, index) => {
                     const companion = compareData.currentLevels.find(
                       cl => cl.level.toLowerCase() === lvl.level.toLowerCase()
                     ) || compareData.currentLevels[index];
                     
                     const primaryAvg = lvl.average;
                     const secondaryAvg = companion ? companion.average : 0;
                     
                     return (
                       <div key={index} className="bg-gray-50/55 dark:bg-gray-900/10 border border-gray-150/40 dark:border-gray-850 p-4.5 rounded-2xl">
                         <p className="text-[10px] font-black uppercase text-gray-450 tracking-wider mb-2">{lvl.level}</p>
                         <div className="space-y-2 text-xs">
                           <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-1.5 px-2 rounded-lg border border-gray-100/50 dark:border-gray-750">
                             <span className="text-gray-400 font-bold">{data.location}:</span>
                             <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                               {new Intl.NumberFormat('en-US', { style: 'currency', currency: data?.currency || 'USD', notation: 'compact' }).format(primaryAvg)}
                             </span>
                           </div>
                           <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-1.5 px-2 rounded-lg border border-gray-100/50 dark:border-gray-750">
                             <span className="text-gray-400 font-bold">{compareData.location}:</span>
                             <span className="font-mono font-black text-indigo-505 dark:text-indigo-400">
                               {new Intl.NumberFormat('en-US', { style: 'currency', currency: compareData?.currency || 'USD', notation: 'compact' }).format(secondaryAvg)}
                             </span>
                           </div>
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </div>
             )}

            {/* Market Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 bg-emerald-900 dark:bg-emerald-950 p-8 rounded-3xl text-white shadow-xl">
                    <h3 className="text-lg font-bold mb-4 flex items-center">
                        <Globe className="w-5 h-5 mr-2 text-emerald-300" /> Market Outlook
                    </h3>
                    <p className="text-emerald-100 leading-relaxed text-sm font-medium opacity-90">
                        {data.marketOutlook}
                    </p>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-8 rounded-3xl border border-emerald-100 dark:border-emerald-900/30">
                    <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mb-6 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2" /> Rising Roles
                    </h3>
                    <ul className="space-y-3">
                        {data.risingRoles.map((r, i) => (
                            <li key={i} className="flex items-center text-sm font-bold text-emerald-700 dark:text-emerald-300">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                                {r}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-rose-50 dark:bg-rose-900/20 p-8 rounded-3xl border border-rose-100 dark:border-rose-900/30">
                    <h3 className="text-lg font-bold text-rose-800 dark:text-rose-300 mb-6 flex items-center">
                        <TrendingDown className="w-5 h-5 mr-2" /> Declining Roles
                    </h3>
                    <ul className="space-y-3">
                        {data.decliningRoles.map((r, i) => (
                            <li key={i} className="flex items-center text-sm font-bold text-rose-700 dark:text-rose-300">
                                <div className="w-2 h-2 bg-rose-500 rounded-full mr-3"></div>
                                {r}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Trending Skills & Job Listings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Trending Skills */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-emerald-500" />
                        Trending Skills (Must-Have)
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {data.trendingSkills?.map((skill, i) => (
                            <span key={i} className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-xl text-sm font-bold border border-emerald-100 dark:border-emerald-800/30">
                                {skill}
                            </span>
                        ))}
                        {(!data.trendingSkills || data.trendingSkills.length === 0) && (
                            <p className="text-gray-500 dark:text-gray-400 text-sm">No trending skills data available.</p>
                        )}
                    </div>
                </div>

                {/* Job Openings */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                        <Briefcase className="w-5 h-5 mr-2 text-emerald-500" />
                        Current Job Openings
                    </h3>
                    <div className="space-y-4">
                        {data.jobListings?.map((job, i) => (
                            <a 
                                key={i} 
                                href={job.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block p-4 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all group"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                            {job.title}
                                        </h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {job.company} • {job.location}
                                        </p>
                                    </div>
                                    <Globe className="w-4 h-4 text-gray-400 group-hover:text-emerald-500" />
                                </div>
                            </a>
                        ))}
                        {(!data.jobListings || data.jobListings.length === 0) && (
                            <p className="text-gray-500 dark:text-gray-400 text-sm">No current job listings found.</p>
                        )}
                    </div>
                </div>
            </div>

        </div>
      )}
    </div>
  );
};
