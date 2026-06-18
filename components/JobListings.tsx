
import React, { useState, useEffect } from 'react';
import { SalaryInsights, SalaryLevel } from '../types';
import { getSalaryInsights } from '../services/gemini';
import { Loader2, Search, DollarSign, TrendingUp, TrendingDown, Briefcase, MapPin, Globe, Link2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, AreaChart, Area } from 'recharts';

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

export const JobListings: React.FC<JobListingsProps> = ({ onComplete, existingData, country }) => {
  const [role, setRole] = useState(existingData?.role || '');
  const [location, setLocation] = useState(existingData?.location || country);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SalaryInsights | null>(existingData);

  const [isSalaryLinked, setIsSalaryLinked] = useState<boolean>(false);

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

  const handlePredict = async () => {
    if (!role.trim()) return;
    setLoading(true);
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
            
            {/* Real-time sync connection banner */}
            <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-150 dark:border-emerald-900/30 px-6 py-4.5 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-full text-white ${isSalaryLinked ? 'bg-emerald-600' : 'bg-gray-400 dark:bg-gray-700'}`}>
                  <Link2 className={`w-5 h-5 ${isSalaryLinked ? 'animate-pulse' : ''}`} />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-800 dark:text-white">ROI Runway Synchronization</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Expected junior starting wage for <span className="font-bold text-emerald-600 dark:text-emerald-400">{data.role}</span> is {formatCurrency(
                      data.currentLevels.find(
                        l => l.level.toLowerCase().includes('entry') || 
                             l.level.toLowerCase().includes('junior') || 
                             l.level.toLowerCase().includes('graduate')
                      )?.average || data.currentLevels[0]?.average || 50000
                    )}/yr.
                  </p>
                </div>
              </div>
              <button
                onClick={handleLinkSalary}
                className={`px-5 py-2.5 font-extrabold text-xs whitespace-nowrap rounded-xl transition shadow-md ${
                  isSalaryLinked 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100 dark:shadow-none' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 shadow-none'
                }`}
              >
                {isSalaryLinked ? 'Linked as ROI Starting Salary' : 'Link to ROI Runway'}
              </button>
            </div>
            
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Salary By Level Chart */}
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

                {/* Future Trends Chart */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-8 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-emerald-500" />
                        5-Year Forecast
                    </h3>
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
