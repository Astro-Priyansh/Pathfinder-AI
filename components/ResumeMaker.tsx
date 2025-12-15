
import React, { useState, useEffect, useRef } from 'react';
import { ResumeData } from '../types';
import { optimizeResumeSection } from '../services/gemini';
import { Loader2, Plus, Trash2, Wand2, Printer, Save, HardDrive, Layout, Check, FileText } from 'lucide-react';

interface ResumeMakerProps {
  onSave: (data: ResumeData) => void;
  existingData: ResumeData | null;
}

const emptyResume: ResumeData = {
  fullName: '',
  email: '',
  phone: '',
  summary: '',
  experience: [],
  education: [],
  skills: []
};

type TemplateType = 'modern' | 'classic' | 'creative' | 'minimalist';

const TEMPLATES: { id: TemplateType; name: string; color: string }[] = [
  { id: 'modern', name: 'Modern Sidebar', color: 'bg-gray-800' },
  { id: 'classic', name: 'Professional', color: 'bg-blue-900' },
  { id: 'creative', name: 'Bold Creative', color: 'bg-indigo-600' },
  { id: 'minimalist', name: 'Clean Minimalist', color: 'bg-gray-200' },
];

export const ResumeMaker: React.FC<ResumeMakerProps> = ({ onSave, existingData }) => {
  const [resume, setResume] = useState<ResumeData>(existingData || emptyResume);
  const [optimizingKey, setOptimizingKey] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('modern');
  const isMounted = useRef(false);

  // Load from local storage on mount if no existing data passed
  useEffect(() => {
    if (!existingData) {
        const saved = localStorage.getItem('userResume');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setResume(parsed);
            } catch (e) {
                console.error("Failed to load resume", e);
            }
        }
    }
    isMounted.current = true;
  }, []);

  // Sync state changes to parent handler
  useEffect(() => {
      if (isMounted.current) {
        onSave(resume);
      }
  }, [resume]);

  const handleSaveLocal = () => {
      setSaveStatus('saving');
      localStorage.setItem('userResume', JSON.stringify(resume));
      setTimeout(() => setSaveStatus('saved'), 500);
      setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resume));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `resume_${resume.fullName.replace(/\s+/g, '_') || 'draft'}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleChange = (field: keyof ResumeData, value: any) => {
    setResume(prev => ({ ...prev, [field]: value }));
    setSaveStatus('idle');
  };

  const addExperience = () => {
    setResume(prev => ({
        ...prev,
        experience: [...prev.experience, { role: '', company: '', duration: '', description: '' }]
    }));
  };

  const addEducation = () => {
    setResume(prev => ({
        ...prev,
        education: [...prev.education, { degree: '', school: '', year: '' }]
    }));
  };

  const updateArrayItem = (field: 'experience' | 'education', index: number, subField: string, value: string) => {
    setResume(prev => {
        const list = prev[field] as any[];
        const newList = list.map((item, i) => i === index ? { ...item, [subField]: value } : item);
        return { ...prev, [field]: newList };
    });
  };

  const removeArrayItem = (field: 'experience' | 'education', index: number) => {
    setResume(prev => {
        const list = prev[field] as any[];
        const newList = list.filter((_, i) => i !== index);
        return { ...prev, [field]: newList };
    });
  };

  const optimizeText = async (key: string, sectionPrompt: string, text: string, callback: (val: string) => void) => {
    if (!text.trim()) return;
    setOptimizingKey(key);
    try {
      const optimized = await optimizeResumeSection(sectionPrompt, text);
      if (optimized) {
        callback(optimized);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setOptimizingKey(null);
    }
  };

  // --- TEMPLATE RENDERERS ---

  const ModernTemplate = () => (
    <div className="h-full flex flex-col md:flex-row text-sm text-gray-800 bg-white">
        {/* Sidebar */}
        <div className="md:w-1/3 bg-gray-100 p-6 md:min-h-[800px] border-r border-gray-200 print:bg-gray-100 print:w-1/3 print:border-r">
            <div className="mb-8 break-words">
                <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wider mb-2 leading-tight">{resume.fullName || 'Your Name'}</h1>
                <div className="text-gray-600 text-xs space-y-1">
                    <p>{resume.email}</p>
                    <p>{resume.phone}</p>
                </div>
            </div>

            {resume.skills.length > 0 && (
                <div className="mb-8">
                    <h3 className="font-bold text-gray-900 uppercase text-xs mb-3 border-b border-gray-300 pb-1">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {resume.skills.map((s, i) => (
                            <span key={i} className="bg-white px-2 py-1 rounded text-xs shadow-sm border border-gray-200">{s}</span>
                        ))}
                    </div>
                </div>
            )}

            {resume.education.length > 0 && (
                <div className="mb-8">
                    <h3 className="font-bold text-gray-900 uppercase text-xs mb-3 border-b border-gray-300 pb-1">Education</h3>
                    <div className="space-y-4">
                        {resume.education.map((edu, i) => (
                            <div key={i}>
                                <div className="font-bold text-gray-800">{edu.school}</div>
                                <div className="text-xs text-gray-600">{edu.degree}</div>
                                <div className="text-xs text-gray-500 italic">{edu.year}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Main Content */}
        <div className="md:w-2/3 p-6 md:min-h-[800px] print:w-2/3">
            {resume.summary && (
                <div className="mb-8">
                    <h3 className="font-bold text-indigo-700 uppercase text-xs mb-3 tracking-wider">Professional Profile</h3>
                    <p className="leading-relaxed text-gray-700">{resume.summary}</p>
                </div>
            )}

            {resume.experience.length > 0 && (
                <div>
                    <h3 className="font-bold text-indigo-700 uppercase text-xs mb-4 tracking-wider">Experience</h3>
                    <div className="space-y-6">
                        {resume.experience.map((exp, i) => (
                            <div key={i} className="relative pl-4 border-l-2 border-indigo-100">
                                <div className="flex justify-between font-bold text-gray-800 mb-1">
                                    <span className="text-lg">{exp.role}</span>
                                </div>
                                <div className="flex justify-between text-xs text-indigo-600 font-medium mb-2">
                                     <span>{exp.company}</span>
                                     <span>{exp.duration}</span>
                                </div>
                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{exp.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </div>
  );

  const ClassicTemplate = () => (
    <div className="h-full bg-white p-8 text-sm text-gray-800 font-serif">
        <div className="text-center border-b-2 border-gray-800 pb-6 mb-6">
            <h1 className="text-3xl font-bold uppercase tracking-widest text-gray-900 mb-2">{resume.fullName || 'Your Name'}</h1>
            <div className="flex justify-center space-x-4 text-gray-600 text-sm">
                <span>{resume.email}</span>
                <span>•</span>
                <span>{resume.phone}</span>
            </div>
        </div>

        {resume.summary && (
            <div className="mb-6">
                <h2 className="font-bold text-gray-900 uppercase text-sm mb-3 text-center tracking-widest bg-gray-50 py-1">Professional Summary</h2>
                <p className="leading-relaxed text-gray-700 text-justify">{resume.summary}</p>
            </div>
        )}

        {resume.skills.length > 0 && (
            <div className="mb-6">
                 <h2 className="font-bold text-gray-900 uppercase text-sm mb-3 text-center tracking-widest bg-gray-50 py-1">Core Competencies</h2>
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                    {resume.skills.map((s, i) => (
                        <span key={i} className="text-gray-800 italic">• {s}</span>
                    ))}
                </div>
            </div>
        )}

        {resume.experience.length > 0 && (
            <div className="mb-6">
                 <h2 className="font-bold text-gray-900 uppercase text-sm mb-4 text-center tracking-widest bg-gray-50 py-1">Professional Experience</h2>
                <div className="space-y-5">
                    {resume.experience.map((exp, i) => (
                        <div key={i}>
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="font-bold text-lg text-gray-900">{exp.role}</span>
                                <span className="font-medium text-gray-600 italic">{exp.duration}</span>
                            </div>
                            <div className="text-gray-700 font-bold mb-2">{exp.company}</div>
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{exp.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {resume.education.length > 0 && (
            <div className="mb-6">
                 <h2 className="font-bold text-gray-900 uppercase text-sm mb-4 text-center tracking-widest bg-gray-50 py-1">Education</h2>
                <div className="space-y-3">
                    {resume.education.map((edu, i) => (
                        <div key={i} className="flex justify-between items-center">
                            <div>
                                <div className="font-bold text-gray-900">{edu.school}</div>
                                <div className="italic text-gray-700">{edu.degree}</div>
                            </div>
                            <div className="text-gray-600">{edu.year}</div>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );

  const CreativeTemplate = () => (
      <div className="h-full bg-white text-sm text-gray-700">
          <div className="bg-indigo-600 text-white p-8 print:bg-indigo-600 print:text-white">
              <h1 className="text-4xl font-extrabold mb-2">{resume.fullName || 'Your Name'}</h1>
              <div className="flex flex-wrap gap-4 text-indigo-100 font-medium">
                  <span>{resume.email}</span>
                  <span>{resume.phone}</span>
              </div>
          </div>
          
          <div className="p-8">
              {resume.summary && (
                  <div className="mb-8 flex flex-col md:flex-row gap-4">
                      <div className="md:w-1/4 font-bold text-indigo-600 uppercase tracking-wider text-right print:w-1/4">Profile</div>
                      <div className="md:w-3/4 text-gray-700 leading-relaxed print:w-3/4">{resume.summary}</div>
                  </div>
              )}

              {resume.experience.length > 0 && (
                   <div className="mb-8">
                      {resume.experience.map((exp, i) => (
                          <div key={i} className="flex flex-col md:flex-row gap-4 mb-6 print:flex-row">
                               <div className="md:w-1/4 text-right print:w-1/4">
                                   <div className="font-bold text-gray-900">{exp.duration}</div>
                                   <div className="text-gray-500 text-xs uppercase font-bold mt-1">{exp.company}</div>
                               </div>
                               <div className="md:w-3/4 print:w-3/4">
                                    <div className="font-bold text-xl text-indigo-600 mb-2">{exp.role}</div>
                                    <p className="whitespace-pre-wrap">{exp.description}</p>
                               </div>
                          </div>
                      ))}
                   </div>
              )}

              <div className="flex flex-col md:flex-row gap-8 print:flex-row">
                  <div className="flex-1">
                      {resume.education.length > 0 && (
                          <div className="mb-6">
                              <h3 className="font-bold text-indigo-600 uppercase tracking-wider mb-4 border-b border-indigo-100 pb-2">Education</h3>
                              {resume.education.map((edu, i) => (
                                  <div key={i} className="mb-3">
                                      <div className="font-bold text-gray-900">{edu.school}</div>
                                      <div>{edu.degree}</div>
                                      <div className="text-gray-500 text-xs">{edu.year}</div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
                  <div className="flex-1">
                      {resume.skills.length > 0 && (
                           <div>
                                <h3 className="font-bold text-indigo-600 uppercase tracking-wider mb-4 border-b border-indigo-100 pb-2">Expertise</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {resume.skills.map((s, i) => (
                                        <div key={i} className="flex items-center">
                                            <div className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></div>
                                            {s}
                                        </div>
                                    ))}
                                </div>
                           </div>
                      )}
                  </div>
              </div>
          </div>
      </div>
  );

  const MinimalistTemplate = () => (
      <div className="h-full bg-white p-8 text-sm text-gray-800">
          <div className="mb-8">
              <h1 className="text-3xl font-light text-gray-900 mb-1">{resume.fullName || 'Your Name'}</h1>
              <div className="text-gray-500 flex gap-4 text-xs uppercase tracking-widest">
                  <span>{resume.email}</span>
                  <span>{resume.phone}</span>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 print:grid-cols-12">
              <div className="md:col-span-8 print:col-span-8 space-y-8">
                  {resume.summary && (
                      <section>
                          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">About</h2>
                          <p className="leading-relaxed">{resume.summary}</p>
                      </section>
                  )}
                   {resume.experience.length > 0 && (
                      <section>
                          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Experience</h2>
                          <div className="space-y-6">
                              {resume.experience.map((exp, i) => (
                                  <div key={i}>
                                      <div className="font-medium text-lg text-gray-900">{exp.role}</div>
                                      <div className="text-gray-500 mb-2">{exp.company} | {exp.duration}</div>
                                      <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                                  </div>
                              ))}
                          </div>
                      </section>
                  )}
              </div>

              <div className="md:col-span-4 print:col-span-4 space-y-8 border-l border-gray-100 pl-6 print:border-gray-200">
                   {resume.skills.length > 0 && (
                      <section>
                          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Skills</h2>
                          <div className="flex flex-col gap-2">
                              {resume.skills.map((s, i) => (
                                  <span key={i} className="text-gray-700">{s}</span>
                              ))}
                          </div>
                      </section>
                  )}
                   {resume.education.length > 0 && (
                      <section>
                          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Education</h2>
                          <div className="space-y-4">
                              {resume.education.map((edu, i) => (
                                  <div key={i}>
                                      <div className="font-medium text-gray-900">{edu.school}</div>
                                      <div className="text-gray-600 text-xs">{edu.degree}</div>
                                      <div className="text-gray-400 text-xs">{edu.year}</div>
                                  </div>
                              ))}
                          </div>
                      </section>
                  )}
              </div>
          </div>
      </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-8 pb-20 md:pb-8">
      <style>
        {`
          @media print {
            @page { margin: 0; size: auto; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        `}
      </style>

      {/* Editor Section */}
      <div className="flex-1 space-y-8 no-print max-w-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 bg-gradient-to-r from-pink-500 to-rose-500 p-8 rounded-3xl text-white shadow-xl shadow-pink-200 dark:shadow-none">
            <div>
                <h2 className="text-3xl font-bold font-brand flex items-center">
                    <FileText className="w-8 h-8 mr-3 text-white/90" />
                    Resume Builder
                </h2>
                <p className="text-pink-100 mt-2">Craft a professional resume in minutes with AI assistance.</p>
            </div>
            <div className="flex gap-2 self-start md:self-auto flex-col">
                <button 
                    onClick={handleSaveLocal}
                    className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 rounded-xl text-sm font-bold transition"
                >
                    <Save className="w-4 h-4 mr-2" /> 
                    {saveStatus === 'saved' ? 'Saved!' : 'Save Draft'}
                </button>
                <button 
                    onClick={handleExportJSON}
                    className="flex items-center px-4 py-2 bg-black/20 hover:bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl text-sm font-bold transition"
                >
                    <HardDrive className="w-4 h-4 mr-2" /> 
                    Backup JSON
                </button>
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">Personal Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              placeholder="Full Name" 
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-pink-500 transition font-medium"
              value={resume.fullName} onChange={e => handleChange('fullName', e.target.value)} 
            />
            <input 
              placeholder="Email" 
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-pink-500 transition font-medium"
              value={resume.email} onChange={e => handleChange('email', e.target.value)} 
            />
            <input 
              placeholder="Phone" 
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-pink-500 transition font-medium"
              value={resume.phone} onChange={e => handleChange('phone', e.target.value)} 
            />
          </div>
          
          <div className="relative">
            <textarea 
              placeholder="Professional Summary" 
              className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl h-32 bg-gray-50 dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-pink-500 transition font-medium resize-none"
              value={resume.summary} onChange={e => handleChange('summary', e.target.value)}
            />
            <button 
              onClick={() => optimizeText('summary', 'Professional Summary', resume.summary, (val) => handleChange('summary', val))}
              disabled={optimizingKey === 'summary' || !resume.summary}
              className="absolute bottom-4 right-4 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition text-xs font-bold flex items-center shadow-sm"
            >
              {optimizingKey === 'summary' ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Wand2 className="w-3 h-3 mr-1" /> AI Polish</>}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Experience</h3>
            <button onClick={addExperience} className="text-sm font-bold text-pink-600 dark:text-pink-400 flex items-center hover:bg-pink-50 dark:hover:bg-pink-900/20 px-3 py-1.5 rounded-lg transition"><Plus className="w-4 h-4 mr-1"/> Add Role</button>
          </div>
          {resume.experience.map((exp, i) => (
            <div key={i} className="p-6 border border-gray-100 dark:border-gray-700 rounded-2xl space-y-4 bg-gray-50 dark:bg-gray-900/30">
              <div className="flex flex-col sm:flex-row gap-3">
                <input placeholder="Job Title" className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 font-bold dark:text-white sm:w-1/3 outline-none focus:border-pink-500" value={exp.role} onChange={e => updateArrayItem('experience', i, 'role', e.target.value)} />
                <input placeholder="Company" className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:text-gray-300 sm:w-1/3 outline-none focus:border-pink-500" value={exp.company} onChange={e => updateArrayItem('experience', i, 'company', e.target.value)} />
                <div className="flex gap-2 sm:w-1/3">
                    <input placeholder="Duration" className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-left sm:text-right dark:text-gray-400 w-full outline-none focus:border-pink-500" value={exp.duration} onChange={e => updateArrayItem('experience', i, 'duration', e.target.value)} />
                    <button onClick={() => removeArrayItem('experience', i)} className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="relative">
                <textarea 
                  placeholder="Description (bullet points)" 
                  className="w-full p-4 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-gray-200 min-h-[100px] outline-none focus:border-pink-500 transition"
                  value={exp.description} onChange={e => updateArrayItem('experience', i, 'description', e.target.value)} 
                />
                <button 
                  onClick={() => optimizeText(`exp-${i}`, 'Job Description', exp.description, (val) => updateArrayItem('experience', i, 'description', val))}
                  disabled={optimizingKey === `exp-${i}` || !exp.description}
                  className="absolute bottom-3 right-3 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition text-xs font-bold flex items-center shadow-sm"
                >
                   {optimizingKey === `exp-${i}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Wand2 className="w-3 h-3 mr-1" /> Enhance</>}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
           <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">Skills</h3>
           <textarea 
              placeholder="List your skills separated by commas (e.g. React, Node.js, Leadership)" 
              className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-pink-500 transition font-medium"
              value={resume.skills.join(', ')} 
              onChange={e => handleChange('skills', e.target.value.split(',').map(s => s.trim()))}
            />
        </div>

         <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Education</h3>
             <button onClick={addEducation} className="text-sm font-bold text-pink-600 dark:text-pink-400 flex items-center hover:bg-pink-50 dark:hover:bg-pink-900/20 px-3 py-1.5 rounded-lg transition"><Plus className="w-4 h-4 mr-1"/> Add Education</button>
          </div>
          {resume.education.map((edu, i) => (
             <div key={i} className="p-6 border border-gray-100 dark:border-gray-700 rounded-2xl space-y-3 bg-gray-50 dark:bg-gray-900/30 flex gap-3">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                     <input placeholder="School/University" className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 font-bold dark:text-white outline-none focus:border-pink-500" value={edu.school} onChange={e => updateArrayItem('education', i, 'school', e.target.value)} />
                     <input placeholder="Degree" className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:text-gray-300 outline-none focus:border-pink-500" value={edu.degree} onChange={e => updateArrayItem('education', i, 'degree', e.target.value)} />
                     <input placeholder="Year" className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:text-gray-400 outline-none focus:border-pink-500" value={edu.year} onChange={e => updateArrayItem('education', i, 'year', e.target.value)} />
                </div>
                 <button onClick={() => removeArrayItem('education', i)} className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition self-center"><Trash2 className="w-4 h-4" /></button>
             </div>
          ))}
        </div>
      </div>

      {/* Preview Section */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 no-print bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm sticky top-4 z-10">
            <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                <Layout className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                {TEMPLATES.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setSelectedTemplate(t.id)}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap border ${
                            selectedTemplate === t.id
                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700'
                            : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <div className={`w-3 h-3 rounded-full ${t.color}`}></div>
                        <span>{t.name}</span>
                        {selectedTemplate === t.id && <Check className="w-3 h-3 ml-1" />}
                    </button>
                ))}
            </div>
            <button onClick={() => window.print()} className="flex items-center px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-300 dark:shadow-none whitespace-nowrap">
                <Printer className="w-4 h-4 mr-2" /> Print PDF
            </button>
        </div>

        <div className="bg-gray-200 dark:bg-gray-900/50 p-4 md:p-8 rounded-3xl overflow-x-auto print:p-0 print:bg-white print:overflow-visible border border-gray-300 dark:border-gray-800">
            <div className="bg-white shadow-2xl min-h-[1000px] w-[800px] mx-auto print:shadow-none print:w-full print:mx-0 print:min-h-0" id="resume-preview">
                {selectedTemplate === 'modern' && <ModernTemplate />}
                {selectedTemplate === 'classic' && <ClassicTemplate />}
                {selectedTemplate === 'creative' && <CreativeTemplate />}
                {selectedTemplate === 'minimalist' && <MinimalistTemplate />}
            </div>
        </div>
      </div>
    </div>
  );
};
