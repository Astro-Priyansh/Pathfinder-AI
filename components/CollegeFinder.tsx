import React, { useState, useMemo, useEffect } from 'react';
import { College, CollegeResult } from '../types';
import { findColleges } from '../services/gemini';
import { Loader2, Search, MapPin, Trophy, DollarSign, ExternalLink, ChevronDown, Globe, Building2, GraduationCap, Briefcase, FileCheck, Phone, TrendingUp, Filter, X, Scale, CheckSquare, Square } from 'lucide-react';

interface CollegeFinderProps {
  onComplete: (result: CollegeResult) => void;
  existingResult: CollegeResult | null;
  country: string;
}

// --- Helper Components ---

const TabButton = ({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) => (
    <button
        onClick={onClick}
        className={`pb-4 px-6 flex items-center font-bold text-sm transition-all border-b-4 whitespace-nowrap ${
            active 
            ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400' 
            : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
    >
        <Icon className={`w-4 h-4 mr-2 ${active ? 'animate-bounce' : ''}`} />
        {label}
    </button>
);

const DetailItem = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) => (
    <div className="flex items-start p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-900 mr-3 ${color}`}>
            <Icon className="w-5 h-5" />
        </div>
        <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 line-clamp-2">{value}</p>
        </div>
    </div>
);

interface CollegeCardProps {
    college: College;
    isExpanded: boolean;
    onToggle: () => void;
    isSelected: boolean;
    onSelect: (e: React.MouseEvent) => void;
}

const CollegeCard: React.FC<CollegeCardProps> = ({ college, isExpanded, onToggle, isSelected, onSelect }) => {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all group ${isSelected ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-gray-100 dark:border-gray-700'}`}>
            {/* Card Header */}
            <div 
                className="p-6 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative"
                onClick={onToggle}
            >
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-2.5 py-1 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-xs font-extrabold rounded-lg uppercase tracking-wide">
                            {college.ranking.includes('#') || college.ranking.toLowerCase().includes('rank') ? college.ranking : `Rank ${college.ranking}`}
                        </span>
                        <span className="flex items-center text-gray-500 dark:text-gray-400 text-xs font-bold">
                            <MapPin className="w-3.5 h-3.5 mr-1" /> {college.location}
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white font-brand group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{college.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-1 font-medium" title={college.description}>{college.description}</p>
                </div>
                <div className="flex items-center gap-3">
                        <button
                            onClick={onSelect}
                            className={`p-2.5 rounded-xl transition-colors flex items-center gap-2 text-sm font-bold ${isSelected ? 'bg-cyan-600 text-white hover:bg-cyan-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                            title="Compare"
                        >
                             {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                             <span className="hidden sm:inline">Compare</span>
                        </button>
                        <a 
                            href={college.website} 
                            target="_blank" 
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2.5 text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                            title="Visit Website"
                        >
                            <ExternalLink className="w-5 h-5" />
                        </a>
                        <div className={`p-2 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                            <ChevronDown className="w-6 h-6" />
                        </div>
                </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
                <div className="border-t border-gray-100 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900/30 animate-in slide-in-from-top-2 duration-200">
                        <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed text-sm font-medium">
                        {college.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <DetailItem icon={DollarSign} label="Annual Fees" value={college.fees} color="text-green-600" />
                            <DetailItem icon={Briefcase} label="Placements" value={college.placements} color="text-blue-600" />
                            <DetailItem icon={TrendingUp} label="ROI" value={college.roi} color="text-purple-600" />
                            <DetailItem icon={FileCheck} label="Entrance Exams" value={college.exams.join(', ')} color="text-orange-600" />
                            <DetailItem icon={GraduationCap} label="Cutoffs" value={college.cutoffs} color="text-red-600" />
                            <DetailItem icon={Trophy} label="Eligibility" value={college.eligibility} color="text-indigo-600" />
                        </div>

                        {college.courses && college.courses.length > 0 && (
                            <div className="mt-8">
                                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Popular Courses</h4>
                                <div className="flex flex-wrap gap-2">
                                    {college.courses.map((course, idx) => (
                                        <span key={idx} className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300">
                                            {course}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center text-sm gap-4">
                        <div className="flex items-center text-gray-600 dark:text-gray-400 font-medium">
                            <Phone className="w-4 h-4 mr-2" />
                            <span>Contact: {college.contact}</span>
                        </div>
                        <a 
                            href={college.website} 
                            target="_blank" 
                            rel="noreferrer"
                            className="px-6 py-2.5 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 transition flex items-center shadow-lg shadow-cyan-100 dark:shadow-none"
                        >
                            Visit Official Website <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                        </div>
                </div>
            )}
        </div>
    );
};

interface CollegeListProps {
    colleges: College[];
    expandedId: string | null;
    onToggle: (id: string) => void;
    selectedIds: string[];
    onSelect: (college: College) => void;
}

const CollegeList: React.FC<CollegeListProps> = ({ colleges, expandedId, onToggle, selectedIds, onSelect }) => {
    if (!colleges || colleges.length === 0) {
        return (
            <div className="text-center text-gray-500 py-16 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="font-medium">No colleges found matching your criteria.</p>
            </div>
        );
    }

    return (
      <div className="space-y-4">
        {colleges.map((college, index) => (
            <CollegeCard 
                key={index} 
                college={college} 
                isExpanded={expandedId === college.name} 
                onToggle={() => onToggle(college.name)} 
                isSelected={selectedIds.includes(college.name)}
                onSelect={(e) => {
                    e.stopPropagation();
                    onSelect(college);
                }}
            />
        ))}
      </div>
    );
};

interface ComparisonModalProps {
    colleges: College[];
    onClose: () => void;
}

const ComparisonModal: React.FC<ComparisonModalProps> = ({ colleges, onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 sticky top-0 z-10">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                        <Scale className="w-6 h-6 mr-3 text-cyan-600" /> Compare Colleges
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>
                
                <div className="overflow-auto p-6 bg-gray-50 dark:bg-gray-950">
                    <div className="min-w-[800px] bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-5 border-b dark:border-gray-800 w-48 bg-gray-50 dark:bg-gray-800/50 font-bold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">Feature</th>
                                    {colleges.map((c, i) => (
                                        <th key={i} className="p-5 border-b dark:border-gray-800 align-top min-w-[200px]">
                                            <div className="text-lg font-bold text-gray-900 dark:text-white mb-1 font-brand">{c.name}</div>
                                            <div className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded w-fit">{c.location}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                                <tr>
                                    <td className="p-5 font-bold text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/20">Ranking</td>
                                    {colleges.map((c, i) => <td key={i} className="p-5 text-gray-900 dark:text-gray-200 font-bold text-cyan-600 dark:text-cyan-400">{c.ranking}</td>)}
                                </tr>
                                <tr>
                                    <td className="p-5 font-bold text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/20">Fees</td>
                                    {colleges.map((c, i) => <td key={i} className="p-5 text-gray-900 dark:text-gray-200">{c.fees}</td>)}
                                </tr>
                                <tr>
                                    <td className="p-5 font-bold text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/20">Placements</td>
                                    {colleges.map((c, i) => <td key={i} className="p-5 text-gray-900 dark:text-gray-200">{c.placements}</td>)}
                                </tr>
                                <tr>
                                    <td className="p-5 font-bold text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/20">ROI</td>
                                    {colleges.map((c, i) => <td key={i} className="p-5 text-gray-900 dark:text-gray-200">{c.roi}</td>)}
                                </tr>
                                <tr>
                                    <td className="p-5 font-bold text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/20">Exams</td>
                                    {colleges.map((c, i) => <td key={i} className="p-5 text-gray-900 dark:text-gray-200">{c.exams.join(', ')}</td>)}
                                </tr>
                                <tr>
                                    <td className="p-5 font-bold text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/20">Cutoffs</td>
                                    {colleges.map((c, i) => <td key={i} className="p-5 text-gray-900 dark:text-gray-200">{c.cutoffs}</td>)}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

export const CollegeFinder: React.FC<CollegeFinderProps> = ({ onComplete, existingResult, country }) => {
  const [field, setField] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CollegeResult | null>(existingResult);
  const [activeTab, setActiveTab] = useState<'domestic' | 'foreign'>('domestic');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Comparison State
  const [selectedColleges, setSelectedColleges] = useState<College[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // Filters
  const [filterRanking, setFilterRanking] = useState<string>('All');
  const [filterLocation, setFilterLocation] = useState<string>('All');
  const [filterExam, setFilterExam] = useState<string>('All');
  const [filterCourse, setFilterCourse] = useState<string>('All');
  const [filterPlacement, setFilterPlacement] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Reset filters when tab changes or new search performed
  useEffect(() => {
    setFilterRanking('All');
    setFilterLocation('All');
    setFilterExam('All');
    setFilterCourse('All');
    setFilterPlacement(0);
    setSearchQuery('');
  }, [activeTab, result]);

  const handleSearch = async () => {
    if (!field.trim()) return;
    setLoading(true);
    setExpandedId(null);
    setSelectedColleges([]);
    try {
      const data = await findColleges(field, country);
      setResult(data);
      onComplete(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (name: string) => {
    setExpandedId(expandedId === name ? null : name);
  };

  const toggleSelection = (college: College) => {
      if (selectedColleges.find(c => c.name === college.name)) {
          setSelectedColleges(selectedColleges.filter(c => c.name !== college.name));
      } else {
          if (selectedColleges.length < 3) {
              setSelectedColleges([...selectedColleges, college]);
          } else {
              // Optionally show toast "Max 3 colleges"
          }
      }
  };

  const currentList = activeTab === 'domestic' ? result?.domestic : result?.foreign;

  const uniqueLocations = useMemo(() => {
    if (!currentList) return [];
    const locs = new Set(currentList.map(c => c.location));
    return Array.from(locs).sort();
  }, [currentList]);

  const uniqueExams = useMemo(() => {
    if (!currentList) return [];
    const exams = new Set(currentList.flatMap(c => c.exams));
    return Array.from(exams).sort();
  }, [currentList]);

  const uniqueCourses = useMemo(() => {
    if (!currentList) return [];
    const courses = new Set(currentList.flatMap(c => c.courses || []));
    return Array.from(courses).sort();
  }, [currentList]);

  const getPlacementPercentage = (text: string): number => {
      const match = text.match(/(\d+)%/);
      return match ? parseInt(match[1]) : 0;
  };

  const filteredList = useMemo(() => {
    if (!currentList) return [];

    return currentList.filter(college => {
      // Ranking Filter (Top N)
      if (filterRanking !== 'All') {
        const limit = parseInt(filterRanking);
        const index = currentList.indexOf(college);
        if (index >= limit) return false;
      }

      // Location Filter
      if (filterLocation !== 'All' && college.location !== filterLocation) {
        return false;
      }

      // Exam Filter
      if (filterExam !== 'All' && !college.exams.includes(filterExam)) {
        return false;
      }

      // Course Filter
      if (filterCourse !== 'All' && (!college.courses || !college.courses.includes(filterCourse))) {
          return false;
      }

      // Placement Filter
      if (filterPlacement > 0) {
          const rate = getPlacementPercentage(college.placements);
          // Only filter if we successfully parsed a percentage, otherwise show it (lenient filtering)
          if (rate > 0 && rate < filterPlacement) return false;
      }

      // Text Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match = 
          college.name.toLowerCase().includes(q) ||
          college.fees.toLowerCase().includes(q) ||
          college.description.toLowerCase().includes(q);
        if (match) return true;
        return false;
      }

      return true;
    });
  }, [currentList, filterRanking, filterLocation, filterExam, filterCourse, filterPlacement, searchQuery]);

  const clearFilters = () => {
    setFilterRanking('All');
    setFilterLocation('All');
    setFilterExam('All');
    setFilterCourse('All');
    setFilterPlacement(0);
    setSearchQuery('');
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-32 md:pb-8 relative">
      {/* Header */}
      <div className="mb-8 bg-gradient-to-r from-cyan-600 to-blue-600 p-8 rounded-3xl text-white shadow-xl shadow-cyan-200 dark:shadow-none flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
            <h2 className="text-3xl font-bold font-brand flex items-center">
                <GraduationCap className="w-8 h-8 mr-3 text-white/90" />
                College Finder
            </h2>
            <p className="text-cyan-100 mt-2 text-lg">Top institutions in <span className="font-bold">{country}</span> and abroad tailored to you.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">Field of Study</label>
            <div className="relative">
                <input
                    type="text"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:text-white rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition font-medium"
                    placeholder="e.g. Computer Science, MBA, Fashion Design, Medicine"
                    value={field}
                    onChange={(e) => setField(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Search className="absolute left-4 top-4 w-6 h-6 text-gray-400" />
            </div>
        </div>
        <button
            onClick={handleSearch}
            disabled={loading || !field.trim()}
            className="w-full md:w-auto px-8 py-4 bg-cyan-600 text-white font-bold rounded-2xl hover:bg-cyan-700 transition disabled:opacity-50 flex items-center justify-center whitespace-nowrap shadow-lg shadow-cyan-200 dark:shadow-none"
        >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Find Colleges'}
        </button>
      </div>

      {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-200 dark:border-gray-700 mb-8 gap-4">
                 <div className="flex space-x-2 overflow-x-auto w-full md:w-auto">
                    <TabButton 
                        active={activeTab === 'domestic'} 
                        onClick={() => setActiveTab('domestic')} 
                        icon={Building2} 
                        label={`Top 10 in ${country}`} 
                    />
                    <TabButton 
                        active={activeTab === 'foreign'} 
                        onClick={() => setActiveTab('foreign')} 
                        icon={Globe} 
                        label="Top 10 Global" 
                    />
                 </div>
                 
                 <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center px-4 py-2 rounded-xl text-sm font-bold transition mb-3 ${showFilters ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                 >
                     {showFilters ? <X className="w-4 h-4 mr-2" /> : <Filter className="w-4 h-4 mr-2" />}
                     {showFilters ? 'Hide Filters' : 'Filter Results'}
                 </button>
             </div>

             {/* Filters Bar */}
             {showFilters && (
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-2">
                     <div>
                         <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Location</label>
                         <select 
                            value={filterLocation}
                            onChange={(e) => setFilterLocation(e.target.value)}
                            className="w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                         >
                             <option value="All">All Locations</option>
                             {uniqueLocations.map(loc => (
                                 <option key={loc} value={loc}>{loc}</option>
                             ))}
                         </select>
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Specific Course</label>
                         <select 
                            value={filterCourse}
                            onChange={(e) => setFilterCourse(e.target.value)}
                            className="w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                         >
                             <option value="All">All Courses</option>
                             {uniqueCourses.map(c => (
                                 <option key={c} value={c}>{c}</option>
                             ))}
                         </select>
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Min. Placement (%)</label>
                         <div className="px-2 pt-2">
                            <input 
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={filterPlacement}
                                onChange={(e) => setFilterPlacement(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-cyan-600"
                            />
                            <div className="flex justify-between text-xs font-bold text-gray-500 mt-2">
                                <span>0%</span>
                                <span className="text-cyan-600 dark:text-cyan-400">{filterPlacement > 0 ? `${filterPlacement}%` : 'Any'}</span>
                                <span>100%</span>
                            </div>
                         </div>
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Search</label>
                         <div className="relative">
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Keyword..."
                                className="w-full p-3 pl-9 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                            />
                            <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                         </div>
                     </div>
                 </div>
             )}

             <div className="min-h-[400px]">
                 {filteredList.length > 0 ? (
                     <CollegeList 
                        colleges={filteredList} 
                        expandedId={expandedId} 
                        onToggle={toggleExpand} 
                        selectedIds={selectedColleges.map(c => c.name)}
                        onSelect={toggleSelection}
                     />
                 ) : (
                     <div className="text-center text-gray-500 py-16 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                        <Search className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <p className="font-medium">No colleges found matching your criteria.</p>
                        <button 
                            onClick={clearFilters}
                            className="mt-4 text-cyan-600 hover:text-cyan-800 text-sm font-bold"
                        >
                            Clear Filters
                        </button>
                    </div>
                 )}
             </div>
          </div>
      )}

      {/* Comparison Floating Bar */}
      {selectedColleges.length > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-4 rounded-full shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-10 fade-in border border-gray-700 dark:border-gray-200">
              <span className="text-sm font-bold whitespace-nowrap">{selectedColleges.length} Selected</span>
              <div className="h-5 w-px bg-gray-700 dark:bg-gray-300"></div>
              <button 
                onClick={() => setShowComparison(true)}
                className="text-sm font-bold hover:text-cyan-400 dark:hover:text-cyan-600 transition flex items-center"
              >
                  Compare Now <Scale className="w-5 h-5 ml-2" />
              </button>
              <button 
                onClick={() => setSelectedColleges([])}
                className="ml-2 p-1.5 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-full transition"
              >
                  <X className="w-5 h-5" />
              </button>
          </div>
      )}

      {/* Comparison Modal */}
      {showComparison && (
          <ComparisonModal 
            colleges={selectedColleges} 
            onClose={() => setShowComparison(false)} 
          />
      )}
    </div>
  );
};