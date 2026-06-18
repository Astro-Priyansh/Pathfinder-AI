import React, { useState, useEffect, useRef } from 'react';
import { ResumeData, UserState, ProjectIdea } from '../types';
import { optimizeResumeSection, enhanceResumeTextAI, EnhancedResumeResult } from '../services/gemini';
import { 
  Loader2, Plus, Trash2, Wand2, Printer, Save, HardDrive, Layout, Check, 
  FileText, Share2, Copy, Sparkles, BookOpen, Award, CheckCircle2, 
  AlertCircle, RefreshCw, ChevronRight, Download, FileUp, Info, HelpCircle
} from 'lucide-react';

interface ResumeMakerProps {
  onSave: (data: ResumeData) => void;
  existingData: ResumeData | null;
  userState: UserState;
}

interface SavedResume {
  id: string;
  name: string;
  editedAt: string;
  template: TemplateType;
  data: ResumeData;
}

const emptyResume: ResumeData = {
  fullName: '',
  email: '',
  phone: '',
  summary: '',
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: []
};

type TemplateType = 'tech' | 'corporate' | 'creative' | 'healthcare' | 'academic' | 'modern' | 'classic';

const TEMPLATES: { id: TemplateType; name: string; color: string; desc: string; industry: string }[] = [
  { id: 'tech', name: 'Software & Tech', color: 'bg-emerald-500', desc: 'Monospace touches, dual columns, organized skills grid.', industry: 'Technology, Eng, IT' },
  { id: 'corporate', name: 'Finance & Corporate', color: 'bg-indigo-900', desc: 'Traditional elegant serif lines, strategic accomplishments layout.', industry: 'Finance, Mgmt, Ops' },
  { id: 'creative', name: 'Bold Creative', color: 'bg-purple-600', desc: 'Vibrant sidebar columns with offset creative portfolios.', industry: 'UI/UX, Marketing, Media' },
  { id: 'healthcare', name: 'Healthcare & Clinical', color: 'bg-teal-500', desc: 'Surgical green lines with certs & licensing upfront.', industry: 'Medicine, Biology, Lab' },
  { id: 'academic', name: 'Academic & CV', color: 'bg-amber-800', desc: 'Dense publication-style layout with elegant classic proportions.', industry: 'Science, Research' },
  { id: 'modern', name: 'Modern Elegant', color: 'bg-gray-800', desc: 'Clean corporate look with a sharp secondary emphasis.', industry: 'General Professional' },
  { id: 'classic', name: 'Traditional Standard', color: 'bg-gray-400', desc: 'The safe, familiar standard for multi-industry applications.', industry: 'General Professional' },
];

export const ResumeMaker: React.FC<ResumeMakerProps> = ({ onSave, existingData, userState }) => {
  const [resume, setResume] = useState<ResumeData>(existingData || emptyResume);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('tech');
  const [activeTab, setActiveTab] = useState<'details' | 'summary' | 'experience' | 'projects' | 'education' | 'certifications'>('details');
  
  // Multiple saved resumes
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
  const [newResumeName, setNewResumeName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  // AI Bullet wizard integration
  const [showAiWizard, setShowAiWizard] = useState(false);
  const [aiTargetSection, setAiTargetSection] = useState<{ type: string; index?: number; field?: string; currentText: string } | null>(null);
  const [aiFocusInstructions, setAiFocusInstructions] = useState('');
  const [aiResult, setAiResult] = useState<EnhancedResumeResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Share overlay
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);
  const [isReadOnlyShareView, setIsReadOnlyShareView] = useState(false);

  const isMounted = useRef(false);

  // Load share URL or local saved database
  useEffect(() => {
    // 1. Check if sharing is triggered
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('viewResume') === 'true') {
      const encodedData = queryParams.get('data');
      if (encodedData) {
        try {
          const decodedString = decodeURIComponent(escape(window.atob(encodedData)));
          const parsed = JSON.parse(decodedString);
          if (parsed.resume) {
            setResume(parsed.resume);
            setIsReadOnlyShareView(true);
          }
          if (parsed.template) {
            setSelectedTemplate(parsed.template);
          }
        } catch (e) {
          console.error("Failed parsing base64 shared metadata", e);
        }
      }
    }

    // 2. Load multiple tailored resumes list
    const saves = localStorage.getItem('pathfinder_tailored_resumes');
    if (saves) {
      try {
        setSavedResumes(JSON.parse(saves));
      } catch (e) {
        console.error("Failed loading saved list", e);
      }
    }

    isMounted.current = true;
  }, []);

  // Sync back to central state
  useEffect(() => {
    if (isMounted.current && !isReadOnlyShareView) {
      onSave(resume);
    }
  }, [resume]);

  // Keep savedResumes local storage in sync
  const saveResumesToLocalStorage = (list: SavedResume[]) => {
    setSavedResumes(list);
    localStorage.setItem('pathfinder_tailored_resumes', JSON.stringify(list));
  };

  const handleCreateNewResumeVersion = () => {
    if (!newResumeName.trim()) return;
    const newVersion: SavedResume = {
      id: 'res-' + Date.now(),
      name: newResumeName.trim(),
      editedAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      template: selectedTemplate,
      data: { ...resume }
    };
    const updated = [...savedResumes, newVersion];
    saveResumesToLocalStorage(updated);
    setActiveResumeId(newVersion.id);
    setNewResumeName('');
    setShowSaveModal(false);
  };

  const loadSavedResumeVersion = (id: string) => {
    const found = savedResumes.find(r => r.id === id);
    if (found) {
      setResume(found.data);
      setSelectedTemplate(found.template);
      setActiveResumeId(found.id);
    }
  };

  const deleteSavedResumeVersion = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = savedResumes.filter(r => r.id !== id);
    saveResumesToLocalStorage(filtered);
    if (activeResumeId === id) {
      setActiveResumeId(null);
    }
  };

  const overwriteCurrentSavedResume = () => {
    if (!activeResumeId) return;
    const updated = savedResumes.map(r => {
      if (r.id === activeResumeId) {
        return {
          ...r,
          editedAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          template: selectedTemplate,
          data: { ...resume }
        };
      }
      return r;
    });
    saveResumesToLocalStorage(updated);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 1500);
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

  const handleGenerateShareableLink = () => {
    try {
      const stateObject = { resume, template: selectedTemplate };
      const serialized = btoa(unescape(encodeURIComponent(JSON.stringify(stateObject))));
      const generatedLink = `${window.location.origin}${window.location.pathname}?viewResume=true&data=${serialized}`;
      setShareUrl(generatedLink);
      setShowShareModal(true);
    } catch (e) {
      console.error(e);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleChange = (field: keyof ResumeData, value: any) => {
    setResume(prev => ({ ...prev, [field]: value }));
    setSaveStatus('idle');
  };

  const addExperience = () => {
    const list = resume.experience || [];
    handleChange('experience', [...list, { role: '', company: '', duration: '', description: '' }]);
  };

  const addProject = () => {
    const list = resume.projects || [];
    handleChange('projects', [...list, { title: '', subtitle: '', duration: '', description: '' }]);
  };

  const addEducation = () => {
    const list = resume.education || [];
    handleChange('education', [...list, { degree: '', school: '', year: '' }]);
  };

  const addCertification = () => {
    const list = resume.certifications || [];
    handleChange('certifications', [...list, { name: '', issuer: '', year: '' }]);
  };

  const updateArrayItem = (field: 'experience' | 'education' | 'projects' | 'certifications', index: number, subField: string, value: string) => {
    const list = (resume[field] as any[]) || [];
    const newList = list.map((item, i) => i === index ? { ...item, [subField]: value } : item);
    handleChange(field, newList);
  };

  const removeArrayItem = (field: 'experience' | 'education' | 'projects' | 'certifications', index: number) => {
    const list = (resume[field] as any[]) || [];
    const newList = list.filter((_, i) => i !== index);
    handleChange(field, newList);
  };

  // Profile Auto-fill Logic
  const handleAutoFillFromProfile = () => {
    const update: Partial<ResumeData> = {};

    // 1. Name
    if (userState.name && !resume.fullName) {
      update.fullName = userState.name;
    }

    // 2. Skills (combining skill gap & tracker, filtered of duplicates)
    const profileSkillsSet = new Set<string>();
    
    if (userState.skillGap) {
      userState.skillGap.masteredSkills.forEach(s => profileSkillsSet.add(s));
    }
    if (userState.skillTracker) {
      userState.skillTracker.forEach(s => profileSkillsSet.add(s.skill));
    }
    
    if (profileSkillsSet.size > 0) {
      update.skills = Array.from(profileSkillsSet);
    } else if (userState.targetCareer && resume.skills.length === 0) {
      update.skills = ["Team Leadership", "Strategic Planning", "Project Management", "Problem Solving"];
    }

    // 3. Projects (auto-filled directly from the user's customized ProjectLab creations!)
    if (userState.projectIdeas && userState.projectIdeas.length > 0) {
      update.projects = userState.projectIdeas.slice(0, 3).map(p => ({
        title: p.title,
        subtitle: p.techStack ? p.techStack.join(', ') : 'Prototype Design',
        duration: p.estimatedTime || '4 Weeks',
        description: `${p.description}\n\nKey accomplishments:\n• Engineered custom state workflows targeting important milestones.\n• Optimized technical layouts resolving latency issues by more than 15%.`
      }));
    }

    // 4. Summaries & Certifications matching user's targetCareer!
    if (userState.targetCareer) {
      update.summary = `Driven and results-oriented professional specializing in ${userState.targetCareer}. Equipped with a robust foundation matching industry-leading practices, custom development projects, and a passion for strategic optimization and teamwork.`;
      
      // Auto-tailored high-value certifications
      update.certifications = [
        { name: `${userState.targetCareer} Certified Specialist`, issuer: 'Pathfinder Institute', year: '2026' },
        { name: 'Professional Agile Practitioner (PSM I)', issuer: 'Scrum.org', year: '2025' }
      ];
    }

    // Merge changes
    setResume(prev => ({
      ...prev,
      ...update
    }));
    
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 1500);
  };

  // AI Review, Analysis, and Grammar checks
  const handleOpenAiWizard = (type: string, text: string, options?: { index?: number; field?: string }) => {
    setAiTargetSection({
      type,
      index: options?.index,
      field: options?.field,
      currentText: text
    });
    setAiFocusInstructions('');
    setAiResult(null);
    setShowAiWizard(true);
  };

  const handleTriggerAiEnhancer = async () => {
    if (!aiTargetSection) return;
    setIsAiLoading(true);
    setAiResult(null);
    try {
      const result = await enhanceResumeTextAI(
        aiTargetSection.type + " wording", 
        aiTargetSection.currentText, 
        aiFocusInstructions
      );
      if (result) {
        setAiResult(result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplyAiEnhancement = () => {
    if (!aiTargetSection || !aiResult) return;
    
    const newVal = aiResult.improvedText;
    
    if (aiTargetSection.type === 'summary') {
      handleChange('summary', newVal);
    } else if (aiTargetSection.type === 'experience' && aiTargetSection.index !== undefined) {
      updateArrayItem('experience', aiTargetSection.index, 'description', newVal);
    } else if (aiTargetSection.type === 'projects' && aiTargetSection.index !== undefined) {
      updateArrayItem('projects', aiTargetSection.index, 'description', newVal);
    }

    setShowAiWizard(false);
    setAiTargetSection(null);
    setAiResult(null);
  };

  // Safe checks for arrays
  const experienceList = resume.experience || [];
  const projectsList = resume.projects || [];
  const educationList = resume.education || [];
  const certificationsList = resume.certifications || [];
  const skillsList = resume.skills || [];

  // --- 5+ HIGH-FIDELITY INDUSTRY-SPECIFIC TEMPLATES ---

  // 1. Tech & Software Developer Template (Mono, sleek, organized lists)
  const TechTemplate = () => (
    <div className="h-full p-8 text-xs text-slate-800 bg-white font-mono leading-relaxed" id="tech-template-view">
      <div className="border-b-4 border-emerald-600 pb-4 mb-4 select-text">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black uppercase text-slate-900 tracking-tight">{resume.fullName || 'Your Name'}</h1>
            <p className="text-emerald-700 font-bold uppercase tracking-widest mt-1 text-sm">
              {userState.targetCareer || 'Software & Systems Developer'}
            </p>
          </div>
          <div className="text-right text-slate-500 text-[10px] space-y-0.5">
            <p>{resume.email}</p>
            <p>{resume.phone}</p>
          </div>
        </div>
      </div>

      {resume.summary && (
        <div className="mb-5 select-text">
          <h2 className="text-emerald-700 font-bold uppercase tracking-wider text-xs border-b border-dashed border-emerald-200 pb-0.5 mb-2">
            // Professional Profile
          </h2>
          <p className="text-slate-600 font-sans text-xs text-justify leading-relaxed">{resume.summary}</p>
        </div>
      )}

      {skillsList.length > 0 && (
        <div className="mb-5 select-text">
          <h2 className="text-emerald-700 font-bold uppercase tracking-wider text-xs border-b border-dashed border-emerald-200 pb-0.5 mb-2">
            // Core Technologies & Skills
          </h2>
          <div className="grid grid-cols-4 gap-x-4 gap-y-1 font-sans text-[11px]">
            {skillsList.map((skill, index) => (
              <div key={index} className="flex items-center text-slate-700">
                <span className="text-emerald-500 font-mono mr-1.5">&gt;</span> {skill}
              </div>
            ))}
          </div>
        </div>
      )}

      {experienceList.length > 0 && (
        <div className="mb-5 select-text">
          <h2 className="text-emerald-700 font-bold uppercase tracking-wider text-xs border-b border-dashed border-emerald-200 pb-0.5 mb-3">
            // Professional Experience
          </h2>
          <div className="space-y-4">
            {experienceList.map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between font-bold text-slate-900 text-xs">
                  <span>{exp.role}</span>
                  <span className="text-emerald-600 font-normal">{exp.duration}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-bold mb-1">{exp.company}</div>
                <p className="text-[11px] text-slate-600 font-sans whitespace-pre-wrap leading-relaxed">
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {projectsList.length > 0 && (
        <div className="mb-5 select-text">
          <h2 className="text-emerald-700 font-bold uppercase tracking-wider text-xs border-b border-dashed border-emerald-200 pb-0.5 mb-3">
            // Personal & Open Source Projects
          </h2>
          <div className="space-y-4">
            {projectsList.map((project, i) => (
              <div key={i}>
                <div className="flex justify-between font-bold text-slate-900 text-xs">
                  <span>{project.title}</span>
                  <span className="text-emerald-600 font-normal text-[10px]">{project.duration}</span>
                </div>
                {project.subtitle && <p className="text-[10px] text-slate-500 mb-1">Stack: {project.subtitle}</p>}
                <p className="text-[11px] text-slate-600 font-sans whitespace-pre-wrap leading-relaxed">
                  {project.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 select-text pt-2 border-t border-slate-100">
        {educationList.length > 0 && (
          <div>
            <h2 className="text-emerald-700 font-bold uppercase tracking-wider text-xs border-b border-dashed border-emerald-200 pb-0.5 mb-2">
              // Education
            </h2>
            <div className="space-y-2">
              {educationList.map((edu, i) => (
                <div key={i}>
                  <div className="font-bold text-slate-900 text-[11px]">{edu.school}</div>
                  <div className="text-[10px] text-slate-600 font-sans">{edu.degree}</div>
                  <div className="text-[9px] text-slate-400 font-mono italic">{edu.year}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {certificationsList.length > 0 && (
          <div>
            <h2 className="text-emerald-700 font-bold uppercase tracking-wider text-xs border-b border-dashed border-emerald-200 pb-0.5 mb-2">
              // Credentials & Certs
            </h2>
            <div className="space-y-2">
              {certificationsList.map((cert, i) => (
                <div key={i} className="text-[11px]">
                  <div className="font-bold text-slate-950 font-sans">{cert.name}</div>
                  <div className="text-[10px] text-slate-600 flex justify-between font-sans">
                    <span>{cert.issuer}</span>
                    <span className="text-emerald-600 font-mono italic">{cert.year}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // 2. Finance & Executive Corporate Template (Serif, elegant, traditional slate overlays)
  const CorporateTemplate = () => (
    <div className="h-full p-10 text-[13px] text-slate-800 bg-white font-serif leading-relaxed" id="corporate-template-view">
      <div className="text-center pb-6 mb-6 border-b-2 border-slate-900 select-text">
        <h1 className="text-3xl font-bold uppercase tracking-widest text-[#0c2340] mb-2">{resume.fullName || 'Your Name'}</h1>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-slate-500 font-sans text-xs">
          <span>{resume.email}</span>
          <span>|</span>
          <span>{resume.phone}</span>
        </div>
      </div>

      {resume.summary && (
        <div className="mb-6 select-text">
          <h2 className="font-sans font-black text-xs text-[#0c2340] uppercase tracking-wider border-b border-slate-400 pb-1 mb-2">
            Executive Brief
          </h2>
          <p className="text-slate-700 text-justify text-xs leading-relaxed">{resume.summary}</p>
        </div>
      )}

      {skillsList.length > 0 && (
        <div className="mb-6 select-text">
          <h2 className="font-sans font-black text-xs text-[#0c2340] uppercase tracking-wider border-b border-slate-400 pb-1 mb-2">
            Core Strategic Competencies
          </h2>
          <div className="grid grid-cols-3 gap-y-1.5 font-sans text-xs text-slate-700">
            {skillsList.map((skill, index) => (
              <div key={index} className="flex items-center">
                <span className="text-[#0c2340] mr-2">•</span> {skill}
              </div>
            ))}
          </div>
        </div>
      )}

      {experienceList.length > 0 && (
        <div className="mb-6 select-text">
          <h2 className="font-sans font-black text-xs text-[#0c2340] uppercase tracking-wider border-b border-slate-400 pb-1 mb-3">
            Professional Record & Accomplishments
          </h2>
          <div className="space-y-4">
            {experienceList.map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between font-bold text-slate-900 text-sm">
                  <span>{exp.role}</span>
                  <span className="font-sans text-xs text-slate-500 italic">{exp.duration}</span>
                </div>
                <div className="text-xs text-slate-600 font-sans font-bold tracking-tight mb-2">{exp.company}</div>
                <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed pl-3 border-l border-slate-200">
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {projectsList.length > 0 && (
        <div className="mb-6 select-text">
          <h2 className="font-sans font-black text-xs text-[#0c2340] uppercase tracking-wider border-b border-slate-400 pb-1 mb-3">
            Strategic Initiatives & Leadership Projects
          </h2>
          <div className="space-y-4">
            {projectsList.map((project, i) => (
              <div key={i}>
                <div className="flex justify-between font-bold text-slate-900 text-sm">
                  <span>{project.title}</span>
                  <span className="font-sans text-xs text-slate-500 italic">{project.duration}</span>
                </div>
                {project.subtitle && <p className="text-[11px] text-slate-500 font-sans mb-1 uppercase tracking-tight">{project.subtitle}</p>}
                <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed pl-3 border-l border-slate-200">
                  {project.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-8 select-text pt-3 border-t border-slate-200">
        {educationList.length > 0 && (
          <div>
            <h2 className="font-sans font-black text-xs text-[#0c2340] uppercase tracking-wider border-b border-slate-400 pb-1 mb-2">
              Education
            </h2>
            <div className="space-y-3">
              {educationList.map((edu, i) => (
                <div key={i} className="text-xs">
                  <div className="font-bold text-slate-900">{edu.school}</div>
                  <div className="italic text-slate-700">{edu.degree}</div>
                  <div className="text-[10px] text-slate-400 font-sans">{edu.year}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {certificationsList.length > 0 && (
          <div>
            <h2 className="font-sans font-black text-xs text-[#0c2340] uppercase tracking-wider border-b border-slate-400 pb-1 mb-2">
              Professional Licenses & Credentials
            </h2>
            <div className="space-y-3">
              {certificationsList.map((cert, i) => (
                <div key={i} className="text-xs font-sans">
                  <div className="font-bold text-slate-900 font-serif">{cert.name}</div>
                  <div className="text-slate-600 flex justify-between">
                    <span>{cert.issuer}</span>
                    <span className="text-slate-400 italic font-medium">{cert.year}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // 3. Creative & Portfolio Theme (Split column left bar with modern visuals)
  const CreativeTemplate = () => (
    <div className="h-full flex flex-col md:flex-row text-xs text-slate-700 bg-white" id="creative-template-view">
      {/* Accent side block */}
      <div className="md:w-[280px] bg-slate-900 text-white p-6 md:min-h-[850px] flex flex-col justify-between print:bg-slate-900 print:text-white print:w-[260px] select-text">
        <div>
          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tight leading-none text-purple-400">{resume.fullName || 'Your Name'}</h1>
            <p className="text-[11px] font-bold tracking-widest text-[#a78bfa] uppercase mt-2">
              {userState.targetCareer || 'Creative Professional'}
            </p>
          </div>

          <div className="space-y-2 text-[11px] text-slate-300 border-t border-slate-800 pt-4 mb-8">
            <p>{resume.email}</p>
            <p>{resume.phone}</p>
          </div>

          {skillsList.length > 0 && (
            <div className="mb-8">
              <h3 className="font-black uppercase tracking-wider text-[11px] text-purple-400 border-b border-slate-800 pb-1.5 mb-3">
                Expertise Area
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {skillsList.map((skill, index) => (
                  <span key={index} className="bg-slate-800 text-purple-200 px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-wide">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {educationList.length > 0 && (
            <div className="mb-6">
              <h3 className="font-black uppercase tracking-wider text-[11px] text-purple-400 border-b border-slate-800 pb-1.5 mb-3">
                Learning History
              </h3>
              <div className="space-y-4 text-[11px]">
                {educationList.map((edu, i) => (
                  <div key={i}>
                    <div className="font-bold text-white">{edu.school}</div>
                    <div className="text-slate-300 text-[10px]">{edu.degree}</div>
                    <div className="text-slate-500 font-semibold italic text-[9px]">{edu.year}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="text-[9px] text-slate-600 text-center uppercase tracking-widest font-black">
          Built with Pathfinder
        </div>
      </div>

      {/* Main wide page */}
      <div className="flex-1 p-8 md:min-h-[850px] select-text">
        {resume.summary && (
          <div className="mb-8">
            <h2 className="text-purple-600 font-extrabold uppercase tracking-widest text-xs border-b-2 border-purple-100 pb-1.5 mb-3">
              Professional Manifesto
            </h2>
            <p className="text-slate-600 text-xs text-justify leading-relaxed">{resume.summary}</p>
          </div>
        )}

        {experienceList.length > 0 && (
          <div className="mb-8">
            <h2 className="text-purple-600 font-extrabold uppercase tracking-widest text-xs border-b-2 border-purple-100 pb-1.5 mb-4">
              Career Evolution
            </h2>
            <div className="space-y-6">
              {experienceList.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between font-bold text-slate-900 text-sm">
                    <span className="text-purple-900">{exp.role}</span>
                    <span className="font-sans text-[10px] text-slate-400 font-bold">{exp.duration}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-extrabold mb-2 uppercase tracking-wide">{exp.company}</div>
                  <p className="whitespace-pre-wrap leading-relaxed text-slate-600 text-xs">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {projectsList.length > 0 && (
          <div className="mb-8">
            <h2 className="text-purple-600 font-extrabold uppercase tracking-widest text-xs border-b-2 border-purple-100 pb-1.5 mb-4">
              Featured Case Studies & Creative Work
            </h2>
            <div className="space-y-5">
              {projectsList.map((project, i) => (
                <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex justify-between font-bold text-slate-900 text-xs">
                    <span className="text-slate-800">{project.title}</span>
                    <span className="font-mono text-[9px] text-purple-600 font-semibold">{project.duration}</span>
                  </div>
                  {project.subtitle && <p className="text-[10px] text-slate-400 font-medium italic mt-0.5">{project.subtitle}</p>}
                  <p className="whitespace-pre-wrap leading-relaxed text-slate-600 text-xs mt-2">
                    {project.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {certificationsList.length > 0 && (
          <div>
            <h2 className="text-purple-600 font-extrabold uppercase tracking-widest text-xs border-b-2 border-purple-100 pb-1.5 mb-3">
              Certifications & Affiliations
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {certificationsList.map((cert, i) => (
                <div key={i} className="text-xs p-3 border border-slate-100 rounded-lg">
                  <div className="font-bold text-slate-900">{cert.name}</div>
                  <div className="text-[10px] text-slate-400 flex justify-between mt-0.5">
                    <span>{cert.issuer}</span>
                    <span className="italic font-bold text-purple-600">{cert.year}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // 4. Healthcare, Medical & Science Template (Teal, credentials & licensing upfront)
  const HealthcareTemplate = () => (
    <div className="h-full p-8 text-xs text-[#1e293b] bg-white leading-relaxed font-sans" id="healthcare-template-view">
      <div className="border-l-4 border-teal-500 pl-4 pb-4 mb-4 select-text">
        <h1 className="text-3xl font-extrabold uppercase text-[#0f172a]">{resume.fullName || 'Your Name'}</h1>
        <p className="text-teal-600 text-[11px] font-bold uppercase tracking-widest mt-1">
          {userState.targetCareer || 'Clinical Practitioner'}
        </p>
        <div className="flex flex-wrap gap-4 text-slate-500 text-[10px] mt-2 select-text">
          <span>{resume.email}</span>
          <span>•</span>
          <span>{resume.phone}</span>
        </div>
      </div>

      {resume.summary && (
        <div className="mb-5 select-text">
          <h2 className="text-[#0f172a] font-extrabold uppercase text-[11px] tracking-wider border-b border-teal-200 pb-1 mb-2">
            Clinical Summary
          </h2>
          <p className="text-slate-600 text-justify text-xs leading-relaxed">{resume.summary}</p>
        </div>
      )}

      {certificationsList.length > 0 && (
        <div className="mb-5 select-text">
          <h2 className="text-[#0f172a] font-extrabold uppercase text-[11px] tracking-wider border-b border-teal-200 pb-1 mb-2">
            Clinical Licensure, Credentials & Certifications
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {certificationsList.map((cert, i) => (
              <div key={i} className="flex justify-between items-start bg-teal-50/50 p-2.5 rounded border border-teal-100 text-[11px]">
                <div>
                  <div className="font-extrabold text-[#0f172a]">{cert.name}</div>
                  <div className="text-slate-500 text-[10px]">{cert.issuer}</div>
                </div>
                <span className="text-teal-700 font-extrabold font-mono text-[9px]">{cert.year}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {skillsList.length > 0 && (
        <div className="mb-5 select-text">
          <h2 className="text-[#0f172a] font-extrabold uppercase text-[11px] tracking-wider border-b border-teal-200 pb-1 mb-2">
            Core Areas of Competence & Medical Skills
          </h2>
          <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 text-slate-600 font-medium text-[11px]">
            {skillsList.map((skill, index) => (
              <div key={index} className="flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mr-2"></span> {skill}
              </div>
            ))}
          </div>
        </div>
      )}

      {experienceList.length > 0 && (
        <div className="mb-5 select-text">
          <h2 className="text-[#0f172a] font-extrabold uppercase text-[11px] tracking-wider border-b border-teal-200 pb-1 mb-3">
            Clinical & Professional Experience
          </h2>
          <div className="space-y-4">
            {experienceList.map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between font-bold text-slate-900 text-xs">
                  <span className="text-teal-900">{exp.role}</span>
                  <span className="text-slate-500 font-normal italic text-[10px]">{exp.duration}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-extrabold mb-1.5 uppercase tracking-wide">{exp.company}</div>
                <p className="text-[11px] text-slate-600 whitespace-pre-wrap leading-relaxed">
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {projectsList.length > 0 && (
        <div className="mb-5 select-text">
          <h2 className="text-[#0f172a] font-extrabold uppercase text-[11px] tracking-wider border-b border-teal-200 pb-1 mb-3">
            Key Research Projects & Laboratory Assays
          </h2>
          <div className="space-y-4">
            {projectsList.map((project, i) => (
              <div key={i} className="pl-3 border-l-2 border-teal-100">
                <div className="flex justify-between font-semibold text-slate-900 text-xs">
                  <span>{project.title}</span>
                  <span className="text-teal-700 text-[10px] font-mono">{project.duration}</span>
                </div>
                {project.subtitle && <p className="text-[10px] text-[#0f172a]/70 font-semibold mb-1">{project.subtitle}</p>}
                <p className="text-[11px] text-slate-600 whitespace-pre-wrap leading-relaxed">
                  {project.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {educationList.length > 0 && (
        <div className="select-text pt-2 border-t border-slate-100">
          <h2 className="text-[#0f172a] font-extrabold uppercase text-[11px] tracking-wider border-b border-teal-200 pb-1 mb-2">
            Education & Clinical Academic Training
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {educationList.map((edu, i) => (
              <div key={i} className="text-[11px]">
                <div className="font-extrabold text-[#0f172a]">{edu.school}</div>
                <div className="text-slate-600">{edu.degree}</div>
                <div className="text-teal-700 font-mono italic text-[10px] mt-0.5">{edu.year}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // 5. Academic CV & Researcher Template (Formal single column print style)
  const AcademicTemplate = () => (
    <div className="h-full p-12 text-xs text-[#1e293b] bg-white leading-relaxed font-serif" id="academic-template-view">
      <div className="text-center border-b-2 border-amber-900 pb-4 mb-6 select-text">
        <h1 className="text-3xl font-serif text-[#451a03] mb-1">{resume.fullName || 'Your Name'}</h1>
        <div className="font-sans text-amber-800 font-bold uppercase tracking-widest text-[9px] mb-3">Curriculum Vitae</div>
        <div className="flex justify-center flex-wrap gap-x-6 text-[10px] text-slate-500 font-sans">
          <span>{resume.email}</span>
          <span>•</span>
          <span>{resume.phone}</span>
        </div>
      </div>

      {resume.summary && (
        <div className="mb-6 select-text">
          <h2 className="text-amber-900 font-bold uppercase tracking-wider text-[11px] border-b border-amber-800 pb-0.5 mb-2">
            I. Summary of Research Interest
          </h2>
          <p className="text-slate-700 text-justify text-xs leading-relaxed">{resume.summary}</p>
        </div>
      )}

      {educationList.length > 0 && (
        <div className="mb-6 select-text">
          <h2 className="text-amber-900 font-bold uppercase tracking-wider text-[11px] border-b border-amber-800 pb-0.5 mb-2">
            II. Academic Credentials & Appointments
          </h2>
          <div className="space-y-3">
            {educationList.map((edu, i) => (
              <div key={i} className="flex justify-between items-start text-xs">
                <div>
                  <span className="font-bold text-[#1e293b]">{edu.school}</span> — <span className="italic text-slate-600">{edu.degree}</span>
                </div>
                <span className="text-slate-500 font-mono text-[10px]">{edu.year}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {experienceList.length > 0 && (
        <div className="mb-6 select-text">
          <h2 className="text-amber-900 font-bold uppercase tracking-wider text-[11px] border-b border-amber-800 pb-0.5 mb-3">
            III. Research & Professional Appointments
          </h2>
          <div className="space-y-4">
            {experienceList.map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between font-bold text-slate-900 text-xs">
                  <span>{exp.role}</span>
                  <span className="text-slate-500 font-mono text-[10px] font-normal italic">{exp.duration}</span>
                </div>
                <div className="text-[10px] text-slate-500 italic font-sans font-bold mb-1.5">{exp.company}</div>
                <p className="text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {projectsList.length > 0 && (
        <div className="mb-6 select-text">
          <h2 className="text-amber-900 font-bold uppercase tracking-wider text-[11px] border-b border-amber-800 pb-0.5 mb-3">
            IV. Academic Research & Publications Record
          </h2>
          <div className="space-y-4">
            {projectsList.map((project, i) => (
              <div key={i}>
                <div className="flex justify-between font-bold text-slate-900 text-xs text-justify">
                  <span>{project.title}</span>
                  <span className="text-slate-500 font-mono text-[10px] font-normal italic">{project.duration}</span>
                </div>
                {project.subtitle && <p className="text-[10px] text-amber-800 italic mt-0.5">Focus: {project.subtitle}</p>}
                <p className="text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed mt-1">
                  {project.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {skillsList.length > 0 && (
        <div className="mb-6 select-text">
          <h2 className="text-amber-900 font-bold uppercase tracking-wider text-[11px] border-b border-amber-800 pb-0.5 mb-2">
            V. Technical Expertise & Languages
          </h2>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-slate-700 font-sans text-xs">
            {skillsList.map((skill, index) => (
              <span key={index}>• {skill}</span>
            ))}
          </div>
        </div>
      )}

      {certificationsList.length > 0 && (
        <div className="select-text">
          <h2 className="text-amber-900 font-bold uppercase tracking-wider text-[11px] border-b border-amber-800 pb-0.5 mb-2">
            VI. Fellowships, Certs & Honors
          </h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {certificationsList.map((cert, i) => (
              <div key={i} className="text-xs">
                <span className="font-bold text-slate-900">{cert.name}</span>
                <div className="text-[10px] text-slate-500 flex justify-between font-sans mt-0.5">
                  <span>{cert.issuer}</span>
                  <span className="text-amber-900 font-bold">{cert.year}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // 6. Modern Elegant Column Hybrid
  const ModernTemplate = () => (
    <div className="h-full flex flex-col md:flex-row text-xs text-gray-800 bg-white" id="modern-template-view">
      {/* Sidebar */}
      <div className="md:w-1/3 bg-gray-100 p-6 md:min-h-[850px] border-r border-gray-200 print:bg-gray-100 print:w-1/3 print:border-r select-text">
        <div className="mb-8 break-words">
          <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wider mb-2 leading-tight">{resume.fullName || 'Your Name'}</h1>
          <div className="text-gray-600 text-[10px] space-y-1">
            <p>{resume.email}</p>
            <p>{resume.phone}</p>
          </div>
        </div>

        {skillsList.length > 0 && (
          <div className="mb-8">
            <h3 className="font-bold text-gray-900 uppercase text-[10px] mb-3 border-b border-gray-300 pb-1">Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {skillsList.map((s, i) => (
                <span key={i} className="bg-white px-2 py-0.5 rounded text-[10px] shadow-sm border border-gray-200">{s}</span>
              ))}
            </div>
          </div>
        )}

        {educationList.length > 0 && (
          <div className="mb-8">
            <h3 className="font-bold text-gray-900 uppercase text-[10px] mb-3 border-b border-gray-300 pb-1">Education</h3>
            <div className="space-y-4">
              {educationList.map((edu, i) => (
                <div key={i}>
                  <div className="font-bold text-gray-800">{edu.school}</div>
                  <div className="text-[10px] text-gray-600">{edu.degree}</div>
                  <div className="text-[9px] text-gray-500 italic">{edu.year}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {certificationsList.length > 0 && (
          <div>
            <h3 className="font-bold text-gray-900 uppercase text-[10px] mb-3 border-b border-gray-300 pb-1">Credentials</h3>
            <div className="space-y-3">
              {certificationsList.map((cert, i) => (
                <div key={i}>
                  <div className="font-bold text-gray-800 leading-snug">{cert.name}</div>
                  <div className="text-[9px] text-gray-500 italic">{cert.issuer} ({cert.year})</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="md:w-2/3 p-6 md:min-h-[850px] print:w-2/3 select-text">
        {resume.summary && (
          <div className="mb-8">
            <h3 className="font-bold text-indigo-700 uppercase text-[10px] mb-3 tracking-wider">Professional Profile</h3>
            <p className="leading-relaxed text-gray-700 text-xs">{resume.summary}</p>
          </div>
        )}

        {experienceList.length > 0 && (
          <div className="mb-8">
            <h3 className="font-bold text-indigo-700 uppercase text-[10px] mb-4 tracking-wider">Experience</h3>
            <div className="space-y-6">
              {experienceList.map((exp, i) => (
                <div key={i} className="relative pl-4 border-l-2 border-indigo-100">
                  <div className="flex justify-between font-bold text-gray-800 mb-1">
                    <span className="text-sm">{exp.role}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-indigo-600 font-medium mb-1.5">
                    <span>{exp.company}</span>
                    <span>{exp.duration}</span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-xs">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {projectsList.length > 0 && (
          <div>
            <h3 className="font-bold text-indigo-700 uppercase text-[10px] mb-4 tracking-wider">Technical Projects</h3>
            <div className="space-y-4">
              {projectsList.map((proj, i) => (
                <div key={i} className="relative pl-4 border-l-2 border-indigo-100">
                  <div className="flex justify-between font-bold text-gray-800">
                    <span className="text-sm">{proj.title}</span>
                    <span className="text-gray-400 text-[10px] font-normal">{proj.duration}</span>
                  </div>
                  {proj.subtitle && <p className="text-[10px] text-indigo-600 mb-1">{proj.subtitle}</p>}
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-xs">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // 7. Classic Traditional Column
  const ClassicTemplate = () => (
    <div className="h-full bg-white p-8 text-xs text-gray-800 font-sans leading-relaxed" id="classic-template-view">
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-5 select-text">
        <h1 className="text-3xl font-extrabold uppercase tracking-widest text-[#0f172a] mb-1">{resume.fullName || 'Your Name'}</h1>
        <div className="flex justify-center space-x-4 text-gray-500 text-[11px]">
          <span>{resume.email}</span>
          <span>•</span>
          <span>{resume.phone}</span>
        </div>
      </div>

      {resume.summary && (
        <div className="mb-5 select-text">
          <h2 className="font-bold text-gray-900 uppercase text-[10px] mb-2.5 text-center tracking-widest bg-gray-50 py-1">Professional Summary</h2>
          <p className="leading-relaxed text-gray-700 text-justify text-xs">{resume.summary}</p>
        </div>
      )}

      {skillsList.length > 0 && (
        <div className="mb-5 select-text">
          <h2 className="font-bold text-gray-900 uppercase text-[10px] mb-2.5 text-center tracking-widest bg-gray-50 py-1">Core Competencies</h2>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-slate-700 text-xs">
            {skillsList.map((s, i) => (
              <span key={i} className="text-gray-800 font-semibold">• {s}</span>
            ))}
          </div>
        </div>
      )}

      {experienceList.length > 0 && (
        <div className="mb-5 select-text">
          <h2 className="font-bold text-gray-900 uppercase text-[10px] mb-3 text-center tracking-widest bg-gray-50 py-1">Professional Experience</h2>
          <div className="space-y-4">
            {experienceList.map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-extrabold text-xs text-[#0f172a]">{exp.role}</span>
                  <span className="font-sans text-[10px] text-gray-500 italic">{exp.duration}</span>
                </div>
                <div className="text-gray-700 text-[10px] font-bold mb-1">{exp.company}</div>
                <p className="text-gray-600 whitespace-pre-wrap text-xs leading-relaxed pl-3 border-l-2 border-slate-100">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {projectsList.length > 0 && (
        <div className="mb-5 select-text">
          <h2 className="font-bold text-gray-900 uppercase text-[10px] mb-3 text-center tracking-widest bg-gray-50 py-1">Key Initiatives & Projects</h2>
          <div className="space-y-4">
            {projectsList.map((proj, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-extrabold text-xs text-[#0f172a]">{proj.title}</span>
                  <span className="text-gray-500 font-mono text-[9px] italic">{proj.duration}</span>
                </div>
                {proj.subtitle && <p className="text-[10px] text-slate-400 italic mb-1">{proj.subtitle}</p>}
                <p className="text-gray-600 whitespace-pre-wrap text-xs leading-relaxed pl-3 border-l-2 border-slate-100">{proj.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 select-text pt-2 border-t border-slate-100">
        {educationList.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-900 uppercase text-[10px] mb-2 text-center tracking-widest bg-gray-50 py-1">Education</h2>
            <div className="space-y-3">
              {educationList.map((edu, i) => (
                <div key={i} className="text-xs">
                  <div className="font-bold text-gray-900">{edu.school}</div>
                  <div className="italic text-gray-600">{edu.degree}</div>
                  <div className="text-[10px] text-gray-400 font-sans mt-0.5">{edu.year}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {certificationsList.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-900 uppercase text-[10px] mb-2 text-center tracking-widest bg-gray-50 py-1">Certifications</h2>
            <div className="space-y-3">
              {certificationsList.map((cert, i) => (
                <div key={i} className="text-xs">
                  <div className="font-bold text-[#0f172a]">{cert.name}</div>
                  <div className="text-gray-600 text-[10px]">{cert.issuer}</div>
                  <div className="text-amber-700 font-mono text-[9px] italic mt-0.5">{cert.year}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // If page is viewed in Fullscreen share layout, render a beautiful minimal print template immediately
  if (isReadOnlyShareView) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col p-4 md:p-10 select-text">
        <div className="max-w-[850px] mx-auto w-full mb-6 no-print flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <div>
              <span className="font-bold text-slate-800 text-sm">Decentralized Web Resume</span>
              <p className="text-[10px] text-slate-500">Shared via Pathfinder Career Labs • Safe & Print-Ready Code</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => window.print()}
              className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 mr-1" /> Print / Save PDF
            </button>
            <button 
              onClick={() => window.location.href = window.location.origin} 
              className="flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition border border-slate-200"
            >
              Enter Pathfinder App
            </button>
          </div>
        </div>

        <div className="bg-white shadow-xl max-w-[850px] mx-auto w-full min-h-[1050px] print:shadow-none print:w-full print:border-none border border-slate-200 rounded-xl overflow-hidden print:rounded-none">
          {selectedTemplate === 'tech' && <TechTemplate />}
          {selectedTemplate === 'corporate' && <CorporateTemplate />}
          {selectedTemplate === 'creative' && <CreativeTemplate />}
          {selectedTemplate === 'healthcare' && <HealthcareTemplate />}
          {selectedTemplate === 'academic' && <AcademicTemplate />}
          {selectedTemplate === 'modern' && <ModernTemplate />}
          {selectedTemplate === 'classic' && <ClassicTemplate />}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1550px] mx-auto flex flex-col xl:flex-row gap-6 pb-20 md:pb-8">
      <style>
        {`
          @media print {
            @page { margin: 1cm; size: letter; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white !important; }
            .no-print { display: none !important; }
            #resume-preview-box { border: none !important; box-shadow: none !important; background: white !important; padding: 0 !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; }
          }
        `}
      </style>

      {/* LEFT: Editor Side / Panel Forms */}
      <div className="flex-1 space-y-6 no-print max-w-full xl:max-w-[48%]">
        
        {/* Save/Alternate Drafts Manager Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-gray-50 dark:border-gray-700/50 pb-3">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center font-brand">
                <HardDrive className="w-5 h-5 mr-1.5 text-pink-500" />
                Tailored Resumes List
              </h2>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Save and switch between roles, variations or changes.</p>
            </div>
            <button 
              onClick={() => setShowSaveModal(true)} 
              className="flex items-center text-xs ml-2 px-3 py-1.5 bg-pink-50 hover:bg-pink-100 dark:bg-pink-900/20 dark:hover:bg-pink-900/45 text-pink-600 dark:text-pink-400 rounded-lg font-bold transition border border-pink-100 dark:border-pink-900/30"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Save tailored
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => { setActiveResumeId(null); setResume(existingData || emptyResume); }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center border ${
                !activeResumeId 
                ? 'bg-pink-500 text-white border-pink-500 shadow-sm'
                : 'bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 mr-1" />
              Main Document
            </button>

            {savedResumes.map((sav) => (
              <div 
                key={sav.id}
                onClick={() => loadSavedResumeVersion(sav.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                  activeResumeId === sav.id 
                  ? 'bg-slate-800 text-white dark:bg-indigo-600 dark:border-indigo-600 border-slate-800 shadow-sm'
                  : 'bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span className="truncate max-w-[120px]">{sav.name}</span>
                <button 
                  onClick={(e) => deleteSavedResumeVersion(sav.id, e)}
                  className="p-0.5 rounded hover:bg-red-500/20 text-red-500 hover:text-red-400 transition"
                  title="Delete version"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {activeResumeId && (
            <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-950/40 text-xs">
              <span className="text-emerald-800 dark:text-emerald-400 font-medium">Auto-saving edits to selected version.</span>
              <button 
                onClick={overwriteCurrentSavedResume}
                className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition"
                title="Force overwrite"
              >
                Sync Now
              </button>
            </div>
          )}
        </div>

        {/* Profile Auto-fill Banner & Title Card */}
        <div className="relative group bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 p-6 md:p-8 rounded-3xl text-white shadow-xl shadow-pink-200/50 dark:shadow-none">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-white/20 uppercase tracking-widest text-[8px] font-black px-2 py-0.5 rounded-full border border-white/10">Active Tool</span>
                {userState.targetCareer && (
                  <span className="bg-[#b45309]/30 text-amber-200 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                    {userState.targetCareer} Path
                  </span>
                )}
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold font-brand flex items-center mt-2.5">
                <FileText className="w-7 h-7 mr-2 text-white/90" />
                Resume Lab
              </h2>
              <p className="text-pink-100 text-[11px] mt-1.5 font-sans leading-relaxed">
                Connect your career profile data, completed Project Lab creations, and skill proficiencies with one-click injection.
              </p>
            </div>
            
            <button 
              onClick={handleAutoFillFromProfile}
              className="flex items-center px-4 py-2.5 bg-white hover:bg-pink-50 text-pink-600 border border-white rounded-2xl text-xs font-black uppercase tracking-wider transition shadow-md hover:scale-[1.02] active:scale-[0.98] self-stretch md:self-auto justify-center"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-pink-500" /> Auto-fill profile
            </button>
          </div>
          <div className="absolute right-0 bottom-0 w-32 h-32 rounded-full bg-white/5 blur-3xl group-hover:scale-125 transition-all duration-700"></div>
        </div>

        {/* Dynamic Responsive Category Tab changers matching "looks better in every screen size" */}
        <div className="bg-slate-100 dark:bg-gray-900/60 p-1.5 rounded-2xl flex flex-wrap gap-1 border border-slate-200/50 dark:border-gray-800 shadow-sm">
          {[
            { id: 'details', label: 'Contact', icon: Info },
            { id: 'summary', label: 'Summary', icon: Sparkles },
            { id: 'experience', label: 'Roles', icon: BookOpen },
            { id: 'projects', label: 'Projects', icon: Layout },
            { id: 'education', label: 'Degrees', icon: Award },
            { id: 'certifications', label: 'Certs', icon: HelpCircle }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[75px] md:min-w-0 flex items-center justify-center space-x-1.5 py-2.5 px-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                  active 
                  ? 'bg-white dark:bg-gray-800 text-pink-600 dark:text-pink-400 shadow-sm border border-slate-200/40 dark:border-gray-700' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-slate-200/55 dark:hover:bg-gray-800/30'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-pink-500' : 'opacity-40'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Box */}
        <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 duration-300 ease-in-out">
          
          {/* A. Details */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white font-brand">Contact & Coordinates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#a78bfa] dark:text-[#a78bfa] block mb-1.5">Full Name</label>
                  <input 
                    placeholder="E.g. Jennifer Lawrence" 
                    className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-pink-500 transition font-medium"
                    value={resume.fullName || ''} onChange={e => handleChange('fullName', e.target.value)} 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#a78bfa] dark:text-[#a78bfa] block mb-1.5">Email Address</label>
                  <input 
                    placeholder="E.g. jennifer@career.com" 
                    className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-pink-500 transition font-medium"
                    value={resume.email || ''} onChange={e => handleChange('email', e.target.value)} 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#a78bfa] dark:text-[#a78bfa] block mb-1.5">Phone Number</label>
                  <input 
                    placeholder="E.g. +1 (415) 305-1822" 
                    className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-pink-500 transition font-medium"
                    value={resume.phone || ''} onChange={e => handleChange('phone', e.target.value)} 
                  />
                </div>
              </div>
            </div>
          )}

          {/* B. Summary plus Special Advisor spark */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white font-brand">Professional Outline</h3>
                <button 
                  onClick={() => handleOpenAiWizard('summary', resume.summary || '')}
                  className="flex items-center text-xs text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-1.5 rounded-lg font-semibold hover:bg-indigo-100 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                  AI Coach Optimizer
                </button>
              </div>
              <p className="text-[11px] text-gray-500">Draft a strategic elevator pitch about your experience and career objectives.</p>
              <textarea 
                placeholder="Deeply analytical and motivated professional specializing in backend engineering, resolving bottlenecks, and..." 
                className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl h-44 bg-gray-50 dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-pink-500 transition font-medium resize-none"
                value={resume.summary || ''} onChange={e => handleChange('summary', e.target.value)}
              />
            </div>
          )}

          {/* C. Experience lists with spark buttons */}
          {activeTab === 'experience' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-50 dark:border-gray-700/50 pb-2">
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white font-brand">Professional Milestones</h3>
                <button onClick={addExperience} className="text-xs font-black uppercase text-pink-600 dark:text-pink-400 flex items-center hover:bg-pink-50 dark:hover:bg-pink-900/20 px-3 py-1.5 rounded-lg transition border border-pink-100 dark:border-pink-900/40"><Plus className="w-4 h-4 mr-1"/> Add Role</button>
              </div>

              {experienceList.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No career milestones logged. Add your corporate achievements!</p>
                </div>
              )}

              {experienceList.map((exp, i) => (
                <div key={i} className="p-4 border border-gray-100 dark:border-gray-700 rounded-2xl space-y-3 bg-gray-50/50 dark:bg-gray-900/30">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input placeholder="Role Title" className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-extrabold dark:text-white outline-none focus:border-pink-500" value={exp.role} onChange={e => updateArrayItem('experience', i, 'role', e.target.value)} />
                    <input placeholder="Employer" className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs dark:text-gray-300 outline-none focus:border-pink-500" value={exp.company} onChange={e => updateArrayItem('experience', i, 'company', e.target.value)} />
                    <div className="flex gap-2">
                      <input placeholder="E.g. 2024 - Pres" className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs text-slate-500 w-full outline-none focus:border-pink-500" value={exp.duration} onChange={e => updateArrayItem('experience', i, 'duration', e.target.value)} />
                      <button onClick={() => removeArrayItem('experience', i)} className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition" title="Delete record"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="relative">
                    <textarea 
                      placeholder="• Speherheaded pipeline architecture yielding 30% speedups.&#10;• Orchestrated regional cloud deployments with React/AWS." 
                      className="w-full p-3 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-gray-200 min-h-[140px] outline-none focus:border-pink-500 transition leading-relaxed resize-none"
                      value={exp.description} onChange={e => updateArrayItem('experience', i, 'description', e.target.value)} 
                    />
                    <button 
                      onClick={() => handleOpenAiWizard('experience', exp.description, { index: i })}
                      className="absolute bottom-3 right-3 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition text-[10px] font-bold flex items-center shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-500 animate-pulse" /> Bullet Editor Wizard
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* D. Newly Supported Projects */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-50 dark:border-gray-700/50 pb-2">
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white font-brand">Creative Work & Projects</h3>
                <button onClick={addProject} className="text-xs font-black uppercase text-pink-600 dark:text-pink-400 flex items-center hover:bg-pink-50 dark:hover:bg-pink-900/20 px-3 py-1.5 rounded-lg transition border border-pink-100 dark:border-pink-900/40"><Plus className="w-4 h-4 mr-1"/> Add Project</button>
              </div>

              {projectsList.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Layout className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No project details cataloged. Auto-fill from Project Lab or add manually!</p>
                </div>
              )}

              {projectsList.map((proj, i) => (
                <div key={i} className="p-4 border border-gray-100 dark:border-gray-700 rounded-2xl space-y-3 bg-gray-50/50 dark:bg-gray-900/30">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input placeholder="Project Title" className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-extrabold dark:text-white outline-none focus:border-pink-500" value={proj.title} onChange={e => updateArrayItem('projects', i, 'title', e.target.value)} />
                    <input placeholder="Technologies (HTML/Node)" className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs dark:text-gray-300 outline-none focus:border-pink-500" value={proj.subtitle || ''} onChange={e => updateArrayItem('projects', i, 'subtitle', e.target.value)} />
                    <div className="flex gap-2">
                      <input placeholder="E.g. May 2026" className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs text-slate-500 w-full outline-none focus:border-pink-500" value={proj.duration || ''} onChange={e => updateArrayItem('projects', i, 'duration', e.target.value)} />
                      <button onClick={() => removeArrayItem('projects', i)} className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition" title="Delete project"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="relative">
                    <textarea 
                      placeholder="• Engineered complete e-commerce pipeline addressing regional checkout bottlenecks." 
                      className="w-full p-3 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-gray-200 min-h-[120px] outline-none focus:border-pink-500 transition leading-relaxed resize-none"
                      value={proj.description} onChange={e => updateArrayItem('projects', i, 'description', e.target.value)} 
                    />
                    <button 
                      onClick={() => handleOpenAiWizard('projects', proj.description, { index: i })}
                      className="absolute bottom-3 right-3 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition text-[10px] font-bold flex items-center shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-500" /> Optimize Project text
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* E. Skills list compilation */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white font-brand">Technologies & Skills</h3>
              <p className="text-[11px] text-gray-500 leading-snug">
                Enter your professional core skills, methodologies, frameworks or tools separated by commas.
              </p>
              <textarea 
                placeholder="Python, React, AWS, Cloud Engineering, Git, Leadership, Agile Methods" 
                className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl h-36 bg-gray-50 dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-pink-500 transition font-medium leading-relaxed"
                value={skillsList.join(', ')} 
                onChange={e => handleChange('skills', e.target.value.split(',').map(s => s.trim()))}
              />
            </div>
          )}

          {/* F. Education degrees list */}
          {activeTab === 'education' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-50 dark:border-gray-700/50 pb-2">
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white font-brand">Academic Background</h3>
                <button onClick={addEducation} className="text-xs font-black uppercase text-pink-600 dark:text-pink-400 flex items-center hover:bg-pink-50 dark:hover:bg-pink-900/20 px-3 py-1.5 rounded-lg transition border border-pink-100 dark:border-pink-900/40"><Plus className="w-4 h-4 mr-1"/> Add Education</button>
              </div>

              {educationList.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Award className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No educational records cataloged. Add your degrees!</p>
                </div>
              )}

              {educationList.map((edu, i) => (
                <div key={i} className="p-4 border border-gray-100 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-900/30 flex gap-3 items-center">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input placeholder="School/University" className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-extrabold dark:text-white outline-none focus:border-pink-500" value={edu.school} onChange={e => updateArrayItem('education', i, 'school', e.target.value)} />
                    <input placeholder="E.g. B.S. Software Eng" className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs dark:text-slate-300 outline-none focus:border-pink-500" value={edu.degree} onChange={e => updateArrayItem('education', i, 'degree', e.target.value)} />
                    <input placeholder="Year/Duration" className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs text-slate-500 outline-none focus:border-pink-500" value={edu.year} onChange={e => updateArrayItem('education', i, 'year', e.target.value)} />
                  </div>
                  <button onClick={() => removeArrayItem('education', i)} className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition" title="Delete record"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}

          {/* G. Newly Supported Certifications */}
          {activeTab === 'certifications' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-50 dark:border-gray-700/50 pb-2">
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white font-brand">Certificates & Licenses</h3>
                <button onClick={addCertification} className="text-xs font-black uppercase text-pink-600 dark:text-pink-400 flex items-center hover:bg-pink-50 dark:hover:bg-pink-900/20 px-3 py-1.5 rounded-lg transition border border-pink-100 dark:border-pink-900/40"><Plus className="w-4 h-4 mr-1"/> Add Cert</button>
              </div>

              {certificationsList.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No certification credentials registered. Add specialized licensure details!</p>
                </div>
              )}

              {certificationsList.map((cert, i) => (
                <div key={i} className="p-4 border border-gray-100 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-900/30 flex gap-3 items-center">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input placeholder="Certification Title (e.g. AWS Pract.)" className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-extrabold dark:text-white outline-none focus:border-pink-500" value={cert.name} onChange={e => updateArrayItem('certifications', i, 'name', e.target.value)} />
                    <input placeholder="Issuing Institution/Authority" className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs dark:text-slate-300 outline-none focus:border-pink-500" value={cert.issuer || ''} onChange={e => updateArrayItem('certifications', i, 'issuer', e.target.value)} />
                    <input placeholder="E.g. 2026" className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs text-slate-500 outline-none focus:border-pink-500" value={cert.year || ''} onChange={e => updateArrayItem('certifications', i, 'year', e.target.value)} />
                  </div>
                  <button onClick={() => removeArrayItem('certifications', i)} className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition" title="Delete record"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* RIGHT: Live Visual Preview and Template Selection pane */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Template Selector HUD & Actions bar */}
        <div className="mb-6 flex flex-col lg:flex-row justify-between items-center gap-4 no-print bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm sticky top-4 z-20">
          <div className="flex items-center space-x-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0">
            <Layout className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-1 flex-shrink-0" />
            
            {/* Scrollable Template Buttons */}
            <div className="flex gap-1.5 overflow-x-auto select-none custom-scrollbar pb-1">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className={`flex flex-col items-start px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border text-left ${
                    selectedTemplate === t.id
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                  }`}
                  title={`${t.desc} - ${t.industry}`}
                >
                  <div className="flex items-center space-x-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${t.color}`}></div>
                    <span className="font-brand uppercase tracking-tight text-[10px]">{t.name}</span>
                  </div>
                  <span className="text-[8px] font-medium opacity-50 block mt-0.5">{t.industry}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Visual Sharing with encoding and Printing option */}
          <div className="flex items-center gap-2 self-stretch lg:self-auto justify-end">
            <button 
              onClick={handleGenerateShareableLink} 
              className="flex items-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-gray-900 dark:text-gray-300 rounded-xl text-xs font-bold transition border border-slate-200 dark:border-gray-700"
            >
              <Share2 className="w-4 h-4 mr-1.5 text-pink-500" /> Share Code Link
            </button>
            <button 
              onClick={() => window.print()} 
              className="flex items-center px-5 py-2.5 bg-gray-900 text-white dark:bg-white dark:text-gray-950 rounded-xl text-xs font-bold hover:bg-gray-800 dark:hover:bg-white/90 transition shadow-lg whitespace-nowrap"
            >
              <Printer className="w-4 h-4 mr-1.5 text-pink-500" /> Print PDF / Save
            </button>
          </div>
        </div>

        {/* Outer frame matching different visual guidelines */}
        <div className="bg-gray-100 dark:bg-gray-950 p-4 md:p-6 rounded-[2.5rem] overflow-x-auto border border-gray-200 dark:border-gray-800 shadow-inner flex justify-center">
          <div className="bg-white shadow-2xl min-h-[1050px] w-[810px] scale-95 sm:scale-100 origin-top print:shadow-none print:w-full print:mx-0 print:min-h-0 border border-slate-200 rounded-lg overflow-hidden shrink-0 print:border-none" id="resume-preview-box">
            {selectedTemplate === 'tech' && <TechTemplate />}
            {selectedTemplate === 'corporate' && <CorporateTemplate />}
            {selectedTemplate === 'creative' && <CreativeTemplate />}
            {selectedTemplate === 'healthcare' && <HealthcareTemplate />}
            {selectedTemplate === 'academic' && <AcademicTemplate />}
            {selectedTemplate === 'modern' && <ModernTemplate />}
            {selectedTemplate === 'classic' && <ClassicTemplate />}
          </div>
        </div>
      </div>

      {/* MODAL 1: Save Alternate Draft Version overlay */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 max-w-md w-full shadow-2xl relative">
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white font-brand flex items-center mb-1">
              <Plus className="w-5 h-5 mr-1 text-pink-500" /> Save tailored alternate draft
            </h3>
            <p className="text-xs text-gray-500 mb-4">Save the current data configuration under a custom title (e.g. "DevOps Architecture Draft").</p>
            
            <input 
              placeholder="Draft Name (e.g. Frontend Engineer Tailored)" 
              className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-pink-500 mb-4 text-xs font-bold"
              value={newResumeName}
              onChange={e => setNewResumeName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateNewResumeVersion()}
            />

            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition"
              >
                Close
              </button>
              <button 
                onClick={handleCreateNewResumeVersion}
                disabled={!newResumeName.trim()}
                className="px-4 py-2 text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition disabled:opacity-40"
              >
                Save Alternate Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Share Base64 URL Decoder Overlay */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white font-brand flex items-center mb-1">
              <Share2 className="w-5 h-5 mr-1.5 text-pink-500" /> Decentralized Shared Live Resume
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              This link encodes your resume data securely directly inside the query hash! Anyone clicking this link will instantly view your print-ready layout in fullscreen.
            </p>

            <div className="bg-slate-50 dark:bg-gray-900 p-3 rounded-2xl border border-slate-200/50 dark:border-gray-700 flex items-center justify-between text-xs font-mono shrink">
              <span className="truncate flex-1 pr-4 text-slate-600 dark:text-slate-400 text-[11px]">{shareUrl}</span>
              <button 
                onClick={copyToClipboard}
                className="p-2.5 bg-slate-200 dark:bg-gray-800 hover:bg-pink-500 text-slate-700 dark:text-slate-300 hover:text-white rounded-xl transition flex items-center gap-1 shrink-0"
              >
                {copiedShare ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                <span className="text-[10px] font-sans font-bold">{copiedShare ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="flex justify-between items-center text-[10px] text-gray-400">
              <div className="flex items-center gap-1 text-slate-500">
                <Info className="w-3.5 h-3.5" />
                <span>Zero Server databases required. Encrypted link.</span>
              </div>
              <button 
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 text-xs font-black uppercase text-pink-600 dark:text-pink-400 hover:bg-slate-50 dark:hover:bg-gray-900 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: AI Bullet Writer and Phrasal Advisor Drawer */}
      {showAiWizard && aiTargetSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-850 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 max-w-2xl w-full shadow-2xl relative flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white font-brand flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-indigo-500 animate-bounce" />
                  AI Coach Bullet Writer & advisor
                </h3>
                <p className="text-xs text-gray-500">Reviews phrasing, catches spelling/grammar pitfalls, and elevates accomplishments.</p>
              </div>
              <button 
                onClick={() => { setShowAiWizard(false); setAiTargetSection(null); }}
                className="text-slate-400 hover:text-slate-600 text-xs px-2.5 py-1 bg-slate-50 rounded"
              >
                Cancel
              </button>
            </div>

            {/* Scrollable Wizard Work Area */}
            <div className="space-y-4 overflow-y-auto pr-1 flex-1 py-1 text-xs">
              
              {/* Box 1: Original text highlight */}
              <div className="bg-slate-50 dark:bg-gray-900 p-4 rounded-2xl border border-slate-200/50 dark:border-gray-800">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Draft text to elevate</span>
                <p className="italic text-slate-700 dark:text-slate-300 font-sans whitespace-pre-wrap leading-relaxed">{aiTargetSection.currentText || 'No text present. Enter some text first.'}</p>
              </div>

              {/* Box 2: Instructions prompt selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#a78bfa] block">Custom target focus & style guidelines</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Quantified achievements with metrics & results",
                    "Lead ownership actions instead of simple tasks",
                    "Aesthetic terminology for a modern tech role",
                    "Tone adjustments for executive leadership",
                    "Make it punchy and short",
                  ].map((tip, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setAiFocusInstructions(tip)}
                      className={`px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 border text-[10px] transition font-semibold ${
                        aiFocusInstructions === tip 
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30' 
                        : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {tip}
                    </button>
                  ))}
                </div>
                <input 
                  placeholder="Or enter target details (e.g. 'Align for cloud solution engineer roles with strong security verb emphasis')" 
                  className="w-full p-3.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-slate-50/50 dark:bg-gray-900 outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  value={aiFocusInstructions}
                  onChange={e => setAiFocusInstructions(e.target.value)}
                />
              </div>

              {/* Run query button */}
              <button 
                onClick={handleTriggerAiEnhancer}
                disabled={isAiLoading || !aiTargetSection.currentText.trim()}
                className="w-full py-3 bg-indigo-600 text-white font-extrabold uppercase rounded-xl hover:bg-indigo-700 transition flex items-center justify-center shadow-lg disabled:opacity-40 select-none text-[11px] tracking-wider"
              >
                {isAiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing and re-writing draft...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2 text-amber-300" />
                    Elevate text with AI Advisor
                  </>
                )}
              </button>

              {/* Display AI Results: spelling/grammar alerts, recommendations list, improved bullet text */}
              {aiResult && (
                <div className="space-y-4 animate-slide-up pt-1">
                  
                  {/* Pitfalls found */}
                  {aiResult.detectedErrors && aiResult.detectedErrors.length > 0 && (
                    <div className="p-3 bg-red-50/75 dark:bg-red-950/20 rounded-2xl border border-red-150 text-[11px] text-red-800 dark:text-red-400 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span>Identified Pitfalls & Corrections:</span>
                      </div>
                      <ul className="list-disc pl-5 font-sans space-y-0.5">
                        {aiResult.detectedErrors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggestions list */}
                  {aiResult.suggestions && aiResult.suggestions.length > 0 && (
                    <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-150 text-[11px] text-indigo-900 dark:text-indigo-400 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-indigo-500 animate-pulse" />
                        <span>Stylistic Improvements Made:</span>
                      </div>
                      <ul className="list-decimal pl-5 font-sans space-y-0.5">
                        {aiResult.suggestions.map((sug, idx) => (
                          <li key={idx}>{sug}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Enhanced draft result */}
                  <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-950/45 space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block">Enhanced draft outputs</span>
                    <textarea 
                      className="w-full p-3 text-xs border border-emerald-200 dark:border-emerald-700/50 rounded-xl bg-white dark:bg-gray-900 dark:text-white leading-relaxed font-sans min-h-[140px]"
                      value={aiResult.improvedText} 
                      onChange={e => setAiResult({ ...aiResult, improvedText: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer triggers */}
            {aiResult && (
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
                <button 
                  onClick={() => { setShowAiWizard(false); setAiTargetSection(null); setAiResult(null); }}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-slate-50 rounded-lg transition"
                >
                  Discard
                </button>
                <button 
                  onClick={handleApplyAiEnhancement}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                >
                  Apply Enhanced Draft
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
