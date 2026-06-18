import React, { useState, useEffect } from 'react';
import { ProjectIdea, UserState } from '../types';
import { generateProjectIdeas } from '../services/gemini';
import { Loader2, FlaskConical, Target, Heart, Plus, X, Clock, BarChart } from 'lucide-react';

interface ProjectLabProps {
  userState: UserState;
  onUpdateProjects: (projects: ProjectIdea[]) => void;
}

export const ProjectLab: React.FC<ProjectLabProps> = ({ userState, onUpdateProjects }) => {
  const [skillGaps, setSkillGaps] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  
  const [interests, setInterests] = useState<string>('');
  
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<ProjectIdea[]>(userState.projectIdeas || []);

  // Initialize from user state if empty
  useEffect(() => {
    if (skillGaps.length === 0) {
      const initialGaps: string[] = [];
      if (userState.skillGap?.missingSkills) {
        initialGaps.push(...userState.skillGap.missingSkills);
      }
      if (userState.skillTracker) {
          userState.skillTracker.forEach(st => {
              if (st.level < st.targetLevel && !initialGaps.includes(st.skill)) {
                  initialGaps.push(st.skill);
              }
          });
      }
      setSkillGaps(initialGaps);
    }
    
    if (!interests && userState.interestAnalysis?.categories) {
        setInterests(userState.interestAnalysis.categories.join(', '));
    }
  }, [userState]);

  const addSkill = () => {
    if (skillInput.trim()) {
      const newSkills = skillInput.split(',').map(s => s.trim()).filter(s => s && !skillGaps.includes(s));
      if (newSkills.length > 0) {
        setSkillGaps([...skillGaps, ...newSkills]);
      }
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    setSkillGaps(skillGaps.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addSkill();
  };

  const handleGenerate = async () => {
    if (skillGaps.length === 0) return;
    setLoading(true);
    try {
      const newProjects = await generateProjectIdeas(skillGaps, interests);
      setProjects(newProjects);
      onUpdateProjects(newProjects);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-20 md:pb-8">
      {/* Header */}
      <div className="mb-8 bg-gradient-to-r from-purple-600 to-pink-600 shadow-purple-200 p-8 rounded-3xl text-white shadow-xl dark:shadow-none flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
           <h2 className="text-3xl font-bold font-brand flex items-center">
               <FlaskConical className="w-8 h-8 mr-3 text-white/90" />
               AI Project Lab
           </h2>
           <p className="text-white/90 mt-2 text-lg">
               Close your skill gaps by building custom projects tailored to your interests.
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 animate-fade-in">
          {/* Input Section */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-purple-500" />
                  Target Skill Gaps
              </h3>
              
              <div className="flex gap-2 mb-4">
                  <input
                  type="text"
                  className="flex-1 min-w-0 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-medium text-sm"
                  placeholder="Add a skill gap..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  />
                  <button 
                  onClick={addSkill}
                  className="shrink-0 p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl hover:bg-purple-200 dark:hover:bg-purple-900/50 transition"
                  >
                  <Plus className="w-5 h-5" />
                  </button>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6 min-h-[60px] content-start p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                  {skillGaps.length === 0 && <span className="text-gray-400 dark:text-gray-500 text-xs italic w-full text-center py-2">Add skills you want to learn.</span>}
                  {skillGaps.map((skill, index) => (
                  <span key={index} className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700">
                      {skill}
                      <button onClick={() => removeSkill(index)} className="ml-1.5 text-gray-400 hover:text-red-500">
                      <X className="w-3 h-3" />
                      </button>
                  </span>
                  ))}
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-pink-500" />
                  Your Interests
              </h3>
              <textarea
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-pink-500 outline-none font-medium text-sm min-h-[100px] resize-none mb-6"
                  placeholder="e.g. Space exploration, Finance, Gaming, Healthcare..."
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
              />

              <button
                  onClick={handleGenerate}
                  disabled={loading || skillGaps.length === 0}
                  className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition disabled:opacity-50 flex justify-center items-center shadow-lg shadow-purple-200 dark:shadow-none"
              >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Generate Projects"}
              </button>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2 space-y-6">
              {projects.length === 0 ? (
                  <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                      <FlaskConical className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ready to Build?</h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md">
                          Add your skill gaps and interests on the left, then click generate to get custom project ideas tailored to your learning goals.
                      </p>
                  </div>
              ) : (
                  <div className="grid gap-6 animate-slide-right">
                      {projects.map((project, index) => (
                          <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                              <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
                                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{project.title}</h3>
                                  <div className="flex gap-2 shrink-0">
                                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                          project.difficulty === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                          project.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                      }`}>
                                          <BarChart className="w-3 h-3 mr-1" />
                                          {project.difficulty}
                                      </span>
                                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                          <Clock className="w-3 h-3 mr-1" />
                                          {project.estimatedTime}
                                      </span>
                                  </div>
                              </div>
                              
                              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                                  {project.description}
                              </p>

                              {project.whyThisProject && (
                                  <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-800/30">
                                      <h4 className="text-sm font-bold text-purple-900 dark:text-purple-300 mb-2 flex items-center">
                                          <Target className="w-4 h-4 mr-2" />
                                          Why this project?
                                      </h4>
                                      <p className="text-sm text-purple-800 dark:text-purple-400/80 leading-relaxed">
                                          {project.whyThisProject}
                                      </p>
                                  </div>
                              )}

                              {project.techStack && project.techStack.length > 0 && (
                                  <div className="mb-6">
                                      <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Tech Stack</h4>
                                      <div className="flex flex-wrap gap-2">
                                          {project.techStack.map((tech, i) => (
                                              <span key={i} className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-600">
                                                  {tech}
                                              </span>
                                          ))}
                                      </div>
                                  </div>
                              )}

                              {project.keyFeatures && project.keyFeatures.length > 0 && (
                                  <div className="mb-6">
                                      <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Key Features</h4>
                                      <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 text-sm">
                                          {project.keyFeatures.map((feature, i) => (
                                              <li key={i}>{feature}</li>
                                          ))}
                                      </ul>
                                  </div>
                              )}

                              {project.stepByStepGuide && project.stepByStepGuide.length > 0 && (
                                  <div className="mb-6">
                                      <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Step-by-Step Guide</h4>
                                      <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                                          {project.stepByStepGuide.map((step, i) => (
                                              <li key={i} className="pl-1">{step}</li>
                                          ))}
                                      </ol>
                                  </div>
                              )}
                              
                              <div>
                                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Skills Addressed</h4>
                                  <div className="flex flex-wrap gap-2">
                                      {project.skillsAddressed.map((skill, i) => (
                                          <span key={i} className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium border border-purple-100 dark:border-purple-800/30">
                                              {skill}
                                          </span>
                                      ))}
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};
