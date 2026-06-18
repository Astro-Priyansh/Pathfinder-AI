import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Unlock, CheckCircle2, Flame, Sparkles, Trophy, 
  Brain, Code, Shield, HelpCircle, BookOpen, AlertCircle, 
  ChevronRight, RefreshCw, Star, Zap, Terminal, Plus
} from 'lucide-react';
import { generateSkillQuiz } from '../services/gemini';

// Interfaces for our Skill Tree Node
export interface SkillNode {
  id: string;
  label: string;
  tier: number;
  x: number;
  y: number;
  description: string;
  prerequisites: string[];
  requirementsDescription: string;
}

export interface TreeData {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  themeColor: string; // e.g. text-blue-500, border-blue-500
  nodes: SkillNode[];
}

export interface NodeProgress {
  id: string;
  xp: number; // 0 to 100
  isMastered: boolean;
  loggedProjects: { title: string; desc: string; date: string }[];
}

export interface CharacterState {
  level: number;
  xp: number;
  intellect: number;
  engineering: number;
  security: number;
  adaptability: number;
  nodeProgress: Record<string, NodeProgress>;
}

// Default pre-defined trees
const TECH_TREES: TreeData[] = [
  {
    id: 'gen_ai',
    name: 'Generative AI & Intelligent Systems',
    icon: Brain,
    themeColor: 'cyan',
    nodes: [
      {
        id: 'prompt_eng',
        label: 'Prompt Engineering & LLM Basics',
        tier: 1,
        x: 400,
        y: 70,
        description: 'Master the core mechanics of prompting, instruction design, contextual window logic, and zero/few-shot reasoning models.',
        prerequisites: [],
        requirementsDescription: 'Starter node'
      },
      {
        id: 'rag_retrieval',
        label: 'Retrieval-Augmented Gen (RAG)',
        tier: 2,
        x: 230,
        y: 220,
        description: 'Connect models to external knowledge source context. Coordinate document parsing, chunking pipelines, and search integrations.',
        prerequisites: ['prompt_eng'],
        requirementsDescription: 'Requires level 1 Generative AI & Prompting'
      },
      {
        id: 'agentic_workflows',
        label: 'Agentic Workflows & Tool Call',
        tier: 2,
        x: 570,
        y: 220,
        description: 'Design self-correcting loop processes, dynamic tool usage sequences, and multi-agent coordination architectures.',
        prerequisites: ['prompt_eng'],
        requirementsDescription: 'Requires level 1 Generative AI & Prompting'
      },
      {
        id: 'finetuning',
        label: 'Model Fine-Tuning & Quantize',
        tier: 3,
        x: 150,
        y: 380,
        description: 'Train models on custom parameters. Understand PEFT/LoRA adapters, quantization metrics, and proprietary alignment techniques.',
        prerequisites: ['rag_retrieval'],
        requirementsDescription: 'Requires solid comprehension of RAG & Retrieval foundations'
      },
      {
        id: 'vector_db',
        label: 'Vector Databases & GraphRAG',
        tier: 3,
        x: 400,
        y: 380,
        description: 'Design semantic search layers. Master HNSW indexing, sparse/dense hybrid search models, and graph-database structure indexing.',
        prerequisites: ['rag_retrieval', 'agentic_workflows'],
        requirementsDescription: 'Requires both RAG and Agentic foundation structures'
      },
      {
        id: 'advanced_agents',
        label: 'Autonomous Specialized Agents',
        tier: 3,
        x: 650,
        y: 380,
        description: 'Build robust industrial automatons. Incorporate memory management strategies, plan-and-solve routines, and execution control sandbox grids.',
        prerequisites: ['agentic_workflows'],
        requirementsDescription: 'Requires deep understanding of basic Agent tool chains'
      }
    ]
  },
  {
    id: 'full_stack',
    name: 'Modern Full-Stack Systems',
    icon: Code,
    themeColor: 'purple',
    nodes: [
      {
        id: 'core_arch',
        label: 'System Design & Modern Stack',
        tier: 1,
        x: 400,
        y: 70,
        description: 'Understand complete cloud application structures, client-server bindings, and fundamental performance bottlenecks.',
        prerequisites: [],
        requirementsDescription: 'Starter node'
      },
      {
        id: 'distributed_calc',
        label: 'Distributed Backend Computing',
        tier: 2,
        x: 230,
        y: 220,
        description: 'Scale systems across server clusters. Handle load balancing, distributed locking models, stateless REST/gRPC routing structures.',
        prerequisites: ['core_arch'],
        requirementsDescription: 'Requires Core Architecture fundamentals'
      },
      {
        id: 'spatial_ui',
        label: 'High-Precision UI Orchestration',
        tier: 2,
        x: 570,
        y: 220,
        description: 'Manage advanced component hierarchies, responsive layout physics, state management engines, and render loops.',
        prerequisites: ['core_arch'],
        requirementsDescription: 'Requires Core Architecture fundamentals'
      },
      {
        id: 'data_caching',
        label: 'Database Topology & Caching',
        tier: 3,
        x: 150,
        y: 380,
        description: 'Configure multi-layer store configurations. Coordinate redis caching rings, primary-replica database lags, and transactional consistency models.',
        prerequisites: ['distributed_calc'],
        requirementsDescription: 'Requires Distributed Backend basics'
      },
      {
        id: 'realtime_comms',
        label: 'Realtime Comms & WebSockets',
        tier: 3,
        x: 400,
        y: 380,
        description: 'Implement persistent full-duplex socket systems. Build collaborative editors, live telemetry feeds, and custom pub/sub networks.',
        prerequisites: ['distributed_calc', 'spatial_ui'],
        requirementsDescription: 'Requires Distributed Backend and Spatial UI structures'
      },
      {
        id: 'physics_canvas',
        label: 'Graphics, Physics & Custom Canvas',
        tier: 3,
        x: 650,
        y: 380,
        description: 'Develop rich interactive visualizers. Master HTML5 canvas pipelines, hardware-accelerated animations, and math-driven UI geometries.',
        prerequisites: ['spatial_ui'],
        requirementsDescription: 'Requires Advanced UI layout foundations'
      }
    ]
  },
  {
    id: 'security',
    name: 'Cybersecurity & Defensive Engineering',
    icon: Shield,
    themeColor: 'emerald',
    nodes: [
      {
        id: 'sec_basics',
        label: 'SecOps & Cryptographic Basics',
        tier: 1,
        x: 400,
        y: 70,
        description: 'Configure basic network perimeter rules, public-key configurations, key derivation, and threat boundary modeling.',
        prerequisites: [],
        requirementsDescription: 'Starter node'
      },
      {
        id: 'pentesting',
        label: 'Pen Testing & Threat Surface',
        tier: 2,
        x: 230,
        y: 220,
        description: 'Audit vulnerabilities actively. Reconstruct cross-site script boundaries, overflow thresholds, and dynamic assembly execution traces.',
        prerequisites: ['sec_basics'],
        requirementsDescription: 'Requires SecOps & Cryptology basics'
      },
      {
        id: 'container_sec',
        label: 'DevSecOps & Platform Protection',
        tier: 2,
        x: 570,
        y: 220,
        description: 'Harden runtime execution. Implement automated pipeline vulnerability scanning, kernel-level container rules, and least-privilege configurations.',
        prerequisites: ['sec_basics'],
        requirementsDescription: 'Requires SecOps & Cryptology basics'
      },
      {
        id: 'rev_engineering',
        label: 'Reverse Assembly & Malware Analysis',
        tier: 3,
        x: 150,
        y: 380,
        description: 'Investigate proprietary executables. Deconstruct machine instruction flags, sandboxed execution logs, and network behavior trails.',
        prerequisites: ['pentesting'],
        requirementsDescription: 'Requires Pentesting fundamentals'
      },
      {
        id: 'identity_prov',
        label: 'Identity Providers, Auth & JWTs',
        tier: 3,
        x: 400,
        y: 380,
        description: 'Construct ironclad authentication. Optimize OAuth federation configurations, token signature verification logic, and dynamic rule-based access layers.',
        prerequisites: ['pentesting', 'container_sec'],
        requirementsDescription: 'Requires Pentesting and DevSecOps validations'
      },
      {
        id: 'cryptosec',
        label: 'Zero-Knowledge Proofs (ZKPs)',
        tier: 3,
        x: 650,
        y: 380,
        description: 'Verify computation states without disclosing private variables. Map polynomial equations, cryptographic commitments, and non-interactive proofs.',
        prerequisites: ['container_sec'],
        requirementsDescription: 'Requires DevSecOps platform hardening'
      }
    ]
  }
];

export const RPGSkillTree: React.FC = () => {
  const [selectedTreeId, setSelectedTreeId] = useState<string>('gen_ai');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('prompt_eng');
  
  // Game Play States
  const [charState, setCharState] = useState<CharacterState>(() => {
    const saved = localStorage.getItem('rpg_character_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    // Return pristine initial state
    return {
      level: 1,
      xp: 0,
      intellect: 10,
      engineering: 10,
      security: 10,
      adaptability: 5,
      nodeProgress: {
        prompt_eng: { id: 'prompt_eng', xp: 20, isMastered: false, loggedProjects: [] },
        core_arch: { id: 'core_arch', xp: 10, isMastered: false, loggedProjects: [] },
        sec_basics: { id: 'sec_basics', xp: 10, isMastered: false, loggedProjects: [] }
      }
    };
  });

  // Quiz Modal State
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [quizLoading, setQuizLoading] = useState<boolean>(false);
  const [activeQuiz, setActiveQuiz] = useState<{
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  } | null>(null);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<'success' | 'fail' | null>(null);

  // Project Log Modal
  const [showProjectLog, setShowProjectLog] = useState<boolean>(false);
  const [projectTitle, setProjectTitle] = useState<string>('');
  const [projectDesc, setProjectDesc] = useState<string>('');

  // Triumphant Level Up Notification State
  const [showLevelUp, setShowLevelUp] = useState<boolean>(false);
  const [previousLevel, setPreviousLevel] = useState<number>(1);

  // Save State to LocalStorage on Change
  useEffect(() => {
    localStorage.setItem('rpg_character_state', JSON.stringify(charState));
  }, [charState]);

  const currentTree = TECH_TREES.find(t => t.id === selectedTreeId) || TECH_TREES[0];
  const currentNode = currentTree.nodes.find(n => n.id === selectedNodeId) || currentTree.nodes[0];

  // Derive title based on level
  const getLevelTitle = (lvl: number) => {
    if (lvl < 2) return 'AI Initiate';
    if (lvl < 3) return 'Algorithmic Apprentice';
    if (lvl < 4) return 'Logic Sorcerer';
    if (lvl < 5) return 'Forge Architect';
    if (lvl < 6) return 'Cybernetic Sentinel';
    return 'Omniscience Oracle';
  };

  const getThemeHex = (colorString: string) => {
    if (colorString === 'cyan') return '#06b6d4';
    if (colorString === 'purple') return '#a855f7';
    return '#10b981'; // emerald
  };

  const checkPrerequisitesMet = (node: SkillNode): boolean => {
    if (node.prerequisites.length === 0) return true;
    return node.prerequisites.every(prereqId => {
      const prog = charState.nodeProgress[prereqId];
      return prog && prog.isMastered;
    });
  };

  const getNodeState = (node: SkillNode): 'locked' | 'unlocked' | 'mastered' => {
    const prog = charState.nodeProgress[node.id];
    if (prog?.isMastered) return 'mastered';
    return checkPrerequisitesMet(node) ? 'unlocked' : 'locked';
  };

  // XP addition logic
  const addCharacterXP = (amount: number, statsUpdate: Partial<Pick<CharacterState, 'intellect' | 'engineering' | 'security' | 'adaptability'>>) => {
    setCharState(prev => {
      const nextXP = prev.xp + amount;
      const progressRequired = prev.level * 1000;
      let nextLevel = prev.level;
      let finalXP = nextXP;

      if (nextXP >= progressRequired) {
        nextLevel = prev.level + 1;
        finalXP = nextXP - progressRequired;
        setPreviousLevel(prev.level);
        setShowLevelUp(true);
      }

      return {
        ...prev,
        xp: finalXP,
        level: nextLevel,
        intellect: prev.intellect + (statsUpdate.intellect || 0),
        engineering: prev.engineering + (statsUpdate.engineering || 0),
        security: prev.security + (statsUpdate.security || 0),
        adaptability: prev.adaptability + (statsUpdate.adaptability || 0)
      };
    });
  };

  const addNodeProgress = (nodeId: string, xpAmount: number) => {
    setCharState(prev => {
      const existing = prev.nodeProgress[nodeId] || {
        id: nodeId,
        xp: 0,
        isMastered: false,
        loggedProjects: []
      };

      const newXP = Math.min(100, existing.xp + xpAmount);
      const newlyMastered = !existing.isMastered && newXP >= 100;

      const updatedProgress = {
        ...existing,
        xp: newXP,
        isMastered: existing.isMastered || newlyMastered
      };

      // If newly mastered, unlock pre-defined bonus
      if (newlyMastered) {
        setTimeout(() => {
          // Play micro effects
        }, 100);
      }

      return {
        ...prev,
        nodeProgress: {
          ...prev.nodeProgress,
          [nodeId]: updatedProgress
        }
      };
    });
  };

  // Launch AI Quiz from Gemini
  const handleStartQuiz = async () => {
    setShowQuiz(true);
    setQuizLoading(true);
    setSelectedQuizAnswer(null);
    setQuizResult(null);
    try {
      const nodeProgress = charState.nodeProgress[currentNode.id]?.xp || 10;
      const testQuestion = await generateSkillQuiz(currentNode.label, nodeProgress);
      if (testQuestion) {
        setActiveQuiz(testQuestion);
      } else {
        // Fallback quiz in case of failure/limitation
        setActiveQuiz({
          question: `Which of the following describes the core functionality or primary challenge related to "${currentNode.label}"?`,
          options: [
            "Optimizing throughput and parameter latency controls dynamically.",
            "Structuring stateless interfaces with low redundancy limits.",
            "Achieve continuous validation bounds aligned with the architecture specs.",
            "Synthesizing high fidelity caching chains for structural operations."
          ],
          correctIndex: 0,
          explanation: "Optimizing parameter alignments and execution thresholds are core tasks of this skill node."
        });
      }
    } catch (e) {
      console.error(e);
      // Resilience fallback
      setActiveQuiz({
        question: `What is a primary engineering strategy for scaling and handling errors in "${currentNode.label}"?`,
        options: [
          "Implementing incremental backoff patterns with error boundaries.",
          "Overriding environment variables globally without sandbox controls.",
          "Hardcoding strict fallback metrics on client-side modules.",
          "Consolidating distributed states into a single persistent global file."
        ],
        correctIndex: 0,
        explanation: "Robust state logic utilizes exponential backups and error zones to sustain performance."
      });
    } finally {
      setQuizLoading(false);
    }
  };

  const submitQuizAnswer = (optionIndex: number) => {
    if (activeQuiz === null || quizResult !== null) return;
    setSelectedQuizAnswer(optionIndex);
    
    if (optionIndex === activeQuiz.correctIndex) {
      setQuizResult('success');
      // Award node XP of +40, Overall XP +250
      addNodeProgress(currentNode.id, 40);
      
      // Update character attributes based on tree type
      const statsDelta: any = {};
      if (selectedTreeId === 'gen_ai') statsDelta.intellect = 5;
      else if (selectedTreeId === 'full_stack') statsDelta.engineering = 5;
      else statsDelta.security = 5;

      addCharacterXP(250, statsDelta);
    } else {
      setQuizResult('fail');
    }
  };

  // Submit Project Log
  const handleLoggingProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim() || !projectDesc.trim()) return;

    setCharState(prev => {
      const existing = prev.nodeProgress[currentNode.id] || {
        id: currentNode.id,
        xp: 0,
        isMastered: false,
        loggedProjects: []
      };

      const newLog = {
        title: projectTitle,
        desc: projectDesc,
        date: new Date().toLocaleDateString()
      };

      const updatedProgress = {
        ...existing,
        xp: Math.min(100, existing.xp + 50),
        isMastered: existing.isMastered || (existing.xp + 50 >= 100),
        loggedProjects: [newLog, ...existing.loggedProjects]
      };

      return {
        ...prev,
        nodeProgress: {
          ...prev.nodeProgress,
          [currentNode.id]: updatedProgress
        }
      };
    });

    const statsDelta: any = { adaptability: 2 };
    if (selectedTreeId === 'gen_ai') statsDelta.intellect = 4;
    else if (selectedTreeId === 'full_stack') statsDelta.engineering = 4;
    else statsDelta.security = 4;

    addCharacterXP(300, statsDelta);

    setProjectTitle('');
    setProjectDesc('');
    setShowProjectLog(false);
  };

  const resetCharacter = () => {
    if (window.confirm("Are you sure you want to reset your RPG stats and nodes? This will delete all your XP.")) {
      const resetState = {
        level: 1,
        xp: 0,
        intellect: 10,
        engineering: 10,
        security: 10,
        adaptability: 5,
        nodeProgress: {
          prompt_eng: { id: 'prompt_eng', xp: 20, isMastered: false, loggedProjects: [] },
          core_arch: { id: 'core_arch', xp: 10, isMastered: false, loggedProjects: [] },
          sec_basics: { id: 'sec_basics', xp: 10, isMastered: false, loggedProjects: [] }
        }
      };
      setCharState(resetState);
      localStorage.setItem('rpg_character_state', JSON.stringify(resetState));
      setSelectedNodeId(TECH_TREES.find(t => t.id === selectedTreeId)?.nodes[0].id || 'prompt_eng');
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 p-3 md:p-6 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
      
      {/* Background cyber grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 mt-1 pointer-events-none" />

      {/* Title */}
      <div className="flex flex-col md:flex-row items-center justify-between pb-6 mb-6 border-b border-slate-800 relative z-10 gap-4">
        <div className="flex items-center space-x-3 self-start">
          <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/30 text-cyan-400">
            <Trophy className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500 bg-clip-text text-transparent font-brand">
              RPG Skill-Tree Sandbox
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              LEVEL UP YOUR CAPABILITIES • EARN EXPERIENCING POINTS • CONQUER DOMAINS
            </p>
          </div>
        </div>

        <button 
          onClick={resetCharacter}
          className="px-3 py-1.5 rounded-lg border border-red-500/30 font-mono text-xs text-red-400 hover:bg-red-500/10 transition flex items-center gap-1.5 self-end md:self-center"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Talent
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* CHARACTER CARD PANEL (3 Cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between shadow-lg relative min-h-[440px]">
          <div>
            {/* Player Avatar Card */}
            <div className="flex items-center space-x-3 mb-5 pb-5 border-b border-slate-800">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-cyan-400 flex items-center justify-center text-xl font-bold font-mono text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                  {charState.level}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 p-1 rounded-full text-[10px] font-extrabold shadow-md">
                  <Star className="w-3 h-3 fill-slate-950" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-200 tracking-tight leading-none mb-1">
                  Pathfinder Adventurer
                </h3>
                <span className="text-xs text-cyan-400 font-mono uppercase bg-cyan-950/40 border border-cyan-800/30 px-2 py-0.5 rounded-md">
                  {getLevelTitle(charState.level)}
                </span>
              </div>
            </div>

            {/* Character XP Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-slate-400">CHARACTER XP PROGRESS</span>
                <span className="text-cyan-300 font-semibold">{charState.xp} / {charState.level * 1000} XP</span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-[2px]">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-500"
                  style={{ width: `${(charState.xp / (charState.level * 1000)) * 100}%` }}
                />
              </div>
            </div>

            {/* RPG Status Attributes */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono uppercase text-slate-500 tracking-widest pl-1">
                Aventurer Attributes
              </h4>
              
              {/* Intellect (AI Tree) */}
              <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 bg-cyan-950/40 border border-cyan-900/30 rounded-lg text-cyan-400">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase text-slate-400">Intellect (INT)</div>
                    <div className="text-[10px] text-slate-500">Improves Generative intelligence nodes</div>
                  </div>
                </div>
                <div className="text-lg font-mono font-bold text-cyan-400">{charState.intellect}</div>
              </div>

              {/* Engineering (Build Tree) */}
              <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 bg-purple-950/40 border border-purple-900/30 rounded-lg text-purple-400">
                    <Code className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase text-slate-400">Engineering (ENG)</div>
                    <div className="text-[10px] text-slate-500">Derived from full stack modules</div>
                  </div>
                </div>
                <div className="text-lg font-mono font-bold text-purple-400">{charState.engineering}</div>
              </div>

              {/* Defensive (Sec Tree) */}
              <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 bg-emerald-950/40 border border-emerald-900/30 rounded-lg text-emerald-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase text-slate-400">Defensive (SEC)</div>
                    <div className="text-[10px] text-slate-500">Unlocks through system protection</div>
                  </div>
                </div>
                <div className="text-lg font-mono font-bold text-emerald-400">{charState.security}</div>
              </div>

              {/* Adaptability */}
              <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 bg-amber-950/40 border border-amber-900/30 rounded-lg text-amber-500">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase text-slate-400">Adaptability (ADP)</div>
                    <div className="text-[10px] text-slate-500">Improves logging of real-world tasks</div>
                  </div>
                </div>
                <div className="text-lg font-mono font-bold text-amber-500">{charState.adaptability}</div>
              </div>

            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Complete quizzes and logs below to add attribute points.</span>
          </div>
        </div>

        {/* ACTIVE TREE WORKSPACE & TREE VIEWER (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Tree selectors tabs */}
          <div className="flex flex-wrap gap-2">
            {TECH_TREES.map(tree => {
              const IconComp = tree.icon;
              const isActive = tree.id === selectedTreeId;
              const activeBorderColor = tree.themeColor === 'cyan' ? 'border-cyan-500/45 text-cyan-400 bg-cyan-950/20' : tree.themeColor === 'purple' ? 'border-purple-500/45 text-purple-400 bg-purple-950/20' : 'border-emerald-500/45 text-emerald-400 bg-emerald-950/20';

              return (
                <button
                  key={tree.id}
                  onClick={() => {
                    setSelectedTreeId(tree.id);
                    setSelectedNodeId(tree.nodes[0].id);
                  }}
                  className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 text-sm font-bold transition-all duration-300 ${
                    isActive 
                      ? `${activeBorderColor} border-t-2 shadow-md`
                      : 'border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 bg-slate-950'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  {tree.name}
                </button>
              );
            })}
          </div>

          {/* THE SVG GRAPH CONTAINER */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 relative shadow-inner h-[500px] overflow-hidden flex items-center justify-center">
            
            {/* Floating particle background simulation for cyberpunk flavor */}
            <div className="absolute inset-x-0 bottom-4 top-1/2 flex justify-around pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/20 animate-ping duration-[3000ms]" />
              <span className="w-1 h-1 rounded-full bg-purple-500/20 animate-ping duration-[4000ms]" />
              <span className="w-2 h-2 rounded-full bg-emerald-500/10 animate-ping duration-[5500ms]" />
            </div>

            {/* Glowing filter definition for SVGs */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="glow-purple" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
            </svg>

            {/* Dynamic Interactive SVG Tree */}
            <svg 
              viewBox="0 0 800 500" 
              className="w-full h-full"
              style={{ minWidth: '600px' }}
            >
              {/* Connector lines behind nodes */}
              {currentTree.nodes.map(node => {
                return node.prerequisites.map(prereqId => {
                  const parentNode = currentTree.nodes.find(n => n.id === prereqId);
                  if (!parentNode) return null;

                  const parentState = getNodeState(parentNode);
                  const nodeState = getNodeState(node);

                  // Decide line color
                  let strokeColor = '#334155'; // Slate-700 for locked
                  let strokeDash = '5,5';
                  let filterValue = '';

                  if (nodeState === 'mastered') {
                    strokeColor = getThemeHex(currentTree.themeColor);
                    strokeDash = '0';
                    filterValue = `url(#glow-${currentTree.themeColor})`;
                  } else if (nodeState === 'unlocked' && parentState === 'mastered') {
                    strokeColor = '#475569'; // Slate-600
                    strokeDash = '3,3';
                  }

                  return (
                    <g key={`${parentNode.id}-${node.id}`}>
                      {/* Interactive glowing line */}
                      <line
                        x1={parentNode.x}
                        y1={parentNode.y}
                        x2={node.x}
                        y2={node.y}
                        stroke={strokeColor}
                        strokeWidth={nodeState === 'mastered' ? '3' : '1.5'}
                        strokeDasharray={strokeDash}
                        filter={filterValue}
                        className="transition-all duration-700"
                      />
                    </g>
                  );
                });
              })}

              {/* The clickable circle nodes with state icons */}
              {currentTree.nodes.map(node => {
                const nodeState = getNodeState(node);
                const isSelected = node.id === selectedNodeId;
                const nodeProgress = charState.nodeProgress[node.id]?.xp || 0;

                // Color configuration
                const themeHex = getThemeHex(currentTree.themeColor);
                let fillBg = '#0b1329'; // deep slate
                let borderStroke = '#334155'; // lock
                let glowEffect = '';

                if (nodeState === 'mastered') {
                  fillBg = themeHex;
                  borderStroke = themeHex;
                  glowEffect = `url(#glow-${currentTree.themeColor})`;
                } else if (nodeState === 'unlocked') {
                  fillBg = '#020617';
                  borderStroke = themeHex;
                }

                // Selected styling overrides
                const radiusSize = isSelected ? 30 : 25;

                return (
                  <g 
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setSelectedNodeId(node.id)}
                    className="cursor-pointer group select-none"
                  >
                    {/* Selected Halo ring */}
                    {isSelected && (
                      <circle
                        r={radiusSize + 8}
                        fill="none"
                        stroke={themeHex}
                        strokeWidth="1.5"
                        strokeDasharray="4,4"
                        className="animate-[spin_10s_linear_infinite] opacity-60"
                      />
                    )}

                    {/* Progress Outer Border Indicator */}
                    {nodeState === 'unlocked' && nodeProgress > 0 && nodeProgress < 100 && (
                      <circle
                        r={radiusSize + 4}
                        fill="none"
                        stroke={themeHex}
                        strokeWidth="2.5"
                        strokeDasharray={`${(nodeProgress / 100) * 163} 163`}
                        transform="rotate(-90)"
                        className="opacity-70"
                      />
                    )}

                    {/* The main node ball */}
                    <circle
                      r={radiusSize}
                      fill={fillBg}
                      stroke={borderStroke}
                      strokeWidth={isSelected ? '3.5' : '2'}
                      filter={nodeState === 'mastered' ? glowEffect : ''}
                      className="transition-all duration-300 group-hover:scale-105"
                      style={{ filter: isSelected ? glowEffect : (nodeState === 'mastered' ? glowEffect : undefined) }}
                    />

                    {/* Node State Icon overlay inside the circle */}
                    <g transform="translate(0, 0)">
                      {nodeState === 'locked' && (
                        <path 
                          d="M-5,-4.5 h10 v9 h-10 z" 
                          fill="none"
                          stroke="#64748b" 
                          strokeWidth="2"
                          transform="translate(0, 2)"
                        />
                      )}
                      {nodeState === 'locked' && (
                        <circle 
                          cx="0" 
                          cy="-3" 
                          r="4" 
                          fill="none" 
                          stroke="#64748b" 
                          strokeWidth="1.5"
                        />
                      )}

                      {nodeState === 'unlocked' && (
                        <circle 
                          cx="0" 
                          cy="0" 
                          r="3" 
                          fill={themeHex} 
                          className="animate-pulse"
                        />
                      )}

                      {nodeState === 'mastered' && (
                        <path
                          d="M-6,0 L-2,4 L6,-4"
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}
                    </g>

                    {/* Simple responsive labels on top of or below the nodes */}
                    <text
                      y={radiusSize + (isSelected ? 20 : 16)}
                      textAnchor="middle"
                      fill={isSelected ? '#f8fafc' : (nodeState === 'mastered' ? '#cbd5e1' : '#64748b')}
                      className={`font-mono font-semibold tracking-wide cursor-pointer transition-colors ${isSelected ? 'text-[11px]' : 'text-[9.5px]'}`}
                    >
                      {node.label.split(' & ')[0].split(' Workflows')[0].split(' (RAG)')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>
            
            {/* Absolute positioning watermark labels */}
            <div className="absolute top-4 left-5 flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> GENERATIVE AI
              <span className="w-2 h-2 rounded-full bg-purple-500 ml-2" /> FULL STACK
              <span className="w-2 h-2 rounded-full bg-emerald-400 ml-2" /> CRYPTO & SEC
            </div>
          </div>

          {/* ACTIVE SELECTED NODE CONTROLLER CONSOLE */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative">
            <div className="flex flex-col md:flex-row items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-extrabold uppercase bg-cyan-950/40 border border-cyan-800/20 px-2 py-0.5 rounded mr-2">
                  TIER {currentNode.tier} NODE
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {getNodeState(currentNode) === 'locked' ? '🔴 LOCKED' : getNodeState(currentNode) === 'mastered' ? '🟢 MASTERED' : '🟡 IN PROGRESS'}
                </span>
                <h3 className="text-lg font-bold text-slate-100 mt-2 font-display">
                  {currentNode.label}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs text-slate-400">Node Progress:</span>
                <span className="font-mono font-bold text-slate-200">
                  {charState.nodeProgress[currentNode.id]?.xp || 0}%
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed py-4">
              {currentNode.description}
            </p>

            {/* If node is locked, explain prerequisites */}
            {getNodeState(currentNode) === 'locked' ? (
              <div className="bg-red-950/20 border border-red-900/30 text-red-300 p-4 rounded-xl flex items-start text-xs leading-relaxed">
                <AlertCircle className="w-4 h-4 mr-2.5 mt-0.5 flex-shrink-0 text-red-500" />
                <div>
                  <h4 className="font-bold uppercase tracking-wider mb-1">Prerequisites Unfulfilled</h4>
                  <p>{currentNode.requirementsDescription}. Master the parent nodes to unlock this branch.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Node XP bar */}
                <div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-[1px] border border-slate-800">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        currentNode.id === 'finetuning' || currentNode.id === 'rag_retrieval' || currentNode.id === 'prompt_eng' || currentNode.id === 'vector_db' || currentNode.id === 'advanced_agents' || currentNode.id === 'agentic_workflows'
                          ? 'bg-cyan-500' 
                          : 'bg-purple-500'
                      }`}
                      style={{ width: `${charState.nodeProgress[currentNode.id]?.xp || 0}%` }}
                    />
                  </div>
                </div>

                {/* Submitting console operations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* QUIZ SECTOR GATEWAY */}
                  <button
                    onClick={handleStartQuiz}
                    disabled={charState.nodeProgress[currentNode.id]?.xp >= 100}
                    className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl flex flex-col hover:bg-slate-900 transition text-left group"
                  >
                    <div className="flex items-center space-x-2 mb-2 text-cyan-400">
                      <HelpCircle className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider">Take AI Knowledge Quiz</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-normal mb-3">
                      Generate a bespoke test on this spec to earn +50 Node XP & +250 Character Points.
                    </p>
                    <span className="text-[10px] font-mono text-cyan-500 mt-auto flex items-center group-hover:translate-x-1 transition-transform">
                      INITIALIZE SIMULATION <ChevronRight className="w-3 h-3 ml-1" />
                    </span>
                  </button>

                  {/* PROJECT LOGGER LINK */}
                  <button
                    onClick={() => setShowProjectLog(true)}
                    disabled={charState.nodeProgress[currentNode.id]?.xp >= 100}
                    className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl flex flex-col hover:bg-slate-900 transition text-left group"
                  >
                    <div className="flex items-center space-x-2 mb-2 text-indigo-400">
                      <BookOpen className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider">Log Real Project</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-normal mb-3">
                      Register dynamic proof of build details to secure +50 Node XP & +300 Character Points.
                    </p>
                    <span className="text-[10px] font-mono text-indigo-500 mt-auto flex items-center group-hover:translate-x-1 transition-transform">
                      ENTER ADV_QUEST REGISTRY <ChevronRight className="w-3 h-3 ml-1" />
                    </span>
                  </button>

                </div>

                {/* Adventure logs tracker at bottom */}
                {charState.nodeProgress[currentNode.id]?.loggedProjects && charState.nodeProgress[currentNode.id].loggedProjects.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-slate-800/60">
                    <h4 className="text-xs font-mono uppercase text-slate-500 mb-3 tracking-widest flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-slate-500" />
                      Registered Adventures (Quest Logs)
                    </h4>
                    <div className="max-h-[140px] overflow-y-auto space-y-2.5 pr-1">
                      {charState.nodeProgress[currentNode.id].loggedProjects.map((proj, idx) => (
                        <div key={idx} className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60 font-mono text-xs text-slate-400 flex justify-between items-start">
                          <div>
                            <div className="font-bold text-slate-200">{proj.title}</div>
                            <div className="text-[11px] text-slate-400 mt-1">{proj.desc}</div>
                          </div>
                          <span className="text-[10px] text-slate-500 shrink-0 select-none ml-2">{proj.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>

        </div>

      </div>

      {/* QUIZ PORTAL CONSOLE DIALOG */}
      <AnimatePresence>
        {showQuiz && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative z-10"
            >
              <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-300">
                    KNOWLEDGE GATEWAY v1.4
                  </span>
                </div>
                <button 
                  onClick={() => setShowQuiz(false)}
                  className="text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800/50 transition font-mono text-xs"
                >
                  DISALLOW [X]
                </button>
              </div>

              <div className="p-6">
                {quizLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-3 font-mono">
                    <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                    <p className="text-xs text-slate-400">GENERATING DEEP KNOWLEDGE PROBE USING GEMINI...</p>
                  </div>
                ) : activeQuiz ? (
                  <div className="space-y-6">
                    <p className="text-sm md:text-base text-slate-100 font-medium leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
                      {activeQuiz.question}
                    </p>

                    <div className="space-y-2.5">
                      {activeQuiz.options.map((opt, idx) => {
                        const isSelected = selectedQuizAnswer === idx;
                        const isCorrect = idx === activeQuiz.correctIndex;
                        let btnStyle = "border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800/40";

                        if (quizResult !== null) {
                          if (isCorrect) {
                            btnStyle = "border-emerald-500 bg-emerald-950/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)]";
                          } else if (isSelected) {
                            btnStyle = "border-red-500 bg-red-950/20 text-red-400";
                          } else {
                            btnStyle = "border-slate-850 bg-slate-950/40 text-slate-500 cursor-not-allowed";
                          }
                        }

                        return (
                          <button
                            key={idx}
                            disabled={quizResult !== null}
                            onClick={() => submitQuizAnswer(idx)}
                            className={`w-full p-4 rounded-xl border text-xs md:text-sm text-left transition font-mono leading-relaxed flex items-start gap-3 ${btnStyle}`}
                          >
                            <span className="font-bold text-slate-500 shrink-0 select-none">[{idx + 1}]</span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Result screen */}
                    {quizResult && (
                      <div className="p-4 rounded-xl border animate-in fade-in slide-in-from-bottom-2 duration-300 font-mono text-xs leading-relaxed bg-slate-950/50 border-slate-800">
                        {quizResult === 'success' ? (
                          <div className="text-emerald-400 font-bold mb-2 flex items-center">
                            <Sparkles className="w-4 h-4 mr-1.5 animate-bounce" /> CORE ALIGNMENT SYNCED (+50 Node XP! Character points increased!)
                          </div>
                        ) : (
                          <div className="text-red-400 font-bold mb-2">
                            ❌ SIGNAL OUT OF BOUNDS (Quiz failed. Close and try again!)
                          </div>
                        )}
                        <p className="text-slate-400 font-mono font-medium">{activeQuiz.explanation}</p>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs font-mono">
                    Failed to initialize knowledge simulation. Check connection.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PROJECT ADVENTURE LOGGING MODULE */}
      <AnimatePresence>
        {showProjectLog && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative z-10"
            >
              <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-300">
                  ADV_QUEST LOG LOADER
                </span>
                <button 
                  onClick={() => setShowProjectLog(false)}
                  className="text-slate-400 hover:text-slate-100 p-1 rounded-md text-xs font-mono"
                >
                  CANCEL
                </button>
              </div>

              <form onSubmit={handleLoggingProject} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-2">Project Venture Title</label>
                  <input
                    type="text"
                    required
                    maxLength={60}
                    placeholder="e.g. Optimized RAG prompt pipeline context"
                    className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-mono"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-2">Quest Accomplishment Summary</label>
                  <textarea
                    required
                    maxLength={200}
                    rows={3}
                    placeholder="Briefly describe what you implemented and the parameters optimized..."
                    className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-mono resize-none leading-relaxed"
                    value={projectDesc}
                    onChange={(e) => setProjectDesc(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 text-white font-mono text-xs font-bold uppercase rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/10"
                >
                  SAVE TRANSACTION TO CHRONO-LOG (+50 Node XP / +300 Char XP)
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GLORIOUS LEVEL UP OVERLAY NOTIFICATION */}
      <AnimatePresence>
        {showLevelUp && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-center space-y-8 max-w-md bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/40 via-slate-900 to-slate-950 border border-cyan-500/30 p-10 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.15)] relative"
            >
              {/* Pulsing rings */}
              <div className="absolute inset-0 border border-cyan-400/20 rounded-3xl animate-ping scale-105 opacity-30 pointer-events-none" />

              <div className="flex justify-center">
                <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 via-cyan-400 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-cyan-400/20">
                  <Flame className="w-10 h-10 text-slate-950 animate-bounce" />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-[0.3em] text-cyan-400">
                  SYNAPSE LEVEL OVERRIDE COMPLETED
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-300 via-amber-300 to-yellow-300 bg-clip-text text-transparent font-brand">
                  LEVEL UP!
                </h1>
                <p className="text-slate-400 font-mono text-xs">
                  Your cognitive capabilities have transcended.
                </p>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 font-mono flex items-center justify-around">
                <div>
                  <div className="text-[10px] text-slate-500">PREVIOUS</div>
                  <div className="text-xl text-slate-400 font-bold">{previousLevel}</div>
                </div>
                <div className="text-cyan-400 text-lg">✦</div>
                <div>
                  <div className="text-[10px] text-cyan-400">NEW SYSTEM LEVEL</div>
                  <div className="text-2xl text-cyan-300 font-bold">{charState.level}</div>
                </div>
              </div>

              <div className="text-xs font-mono text-amber-300">
                Unlocks access to higher-tier knowledge modules!
              </div>

              <button
                onClick={() => setShowLevelUp(false)}
                className="w-full py-3 bg-cyan-500 text-slate-950 font-mono text-xs font-extrabold uppercase rounded-lg hover:bg-cyan-400 transition"
              >
                ACCEPT OVERRIDE & CONTINUE
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
