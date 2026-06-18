export interface TrendingInterest {
  id: string;
  title: string;
  category: 'Technology' | 'Sustainability' | 'Creative Arts' | 'Finance' | 'Life Sciences';
  popularity: number; // 0-100
  growthRate: number; // annual tech demand growth rate %
  rank: number;
  whyTrending: string;
  pros: string[];
  cons: string[];
  relatedCareers: string[];
  relatedSkills: string[];
  learningChannels: string[];
}

// 25 core fields we will adapt and localize
const BASE_INTERESTS: Record<string, Omit<TrendingInterest, 'popularity' | 'growthRate' | 'rank' | 'whyTrending'>> = {
  gen_ai: {
    id: 'gen_ai',
    title: 'Generative AI & Prompt Engineering',
    category: 'Technology',
    pros: [
      'Extremely rapid adoption across all white-collar industries',
      'No deep mathematical programming background required to start',
      'Boosts creative and analytical productivity instantly'
    ],
    cons: [
      'Rapidly shifting landscape makes tools and techniques obsolete quickly',
      'Complex ethical and intellectual property questions remain unresolved',
      'Over-reliance can degrade original human critical thinking'
    ],
    relatedCareers: ['AI Prompt Engineer', 'NLP Specialist', 'Productivity Consultant', 'AI Content Lead'],
    relatedSkills: ['LLM Tokenomics', 'Semantic Search', 'System Prompting', 'Retrieval Augmented Generation (RAG)'],
    learningChannels: ['Hugging Face Tutorials', 'DeepLearning.AI courses', 'GitHub prompt-engineering playbooks']
  },
  climate_tech: {
    id: 'climate_tech',
    title: 'Renewable Energy & Climate Tech',
    category: 'Sustainability',
    pros: [
      'High-impact industry directly addressing global ecosystem crisis',
      'Massive public subsidies and venture funding inflow',
      'Diverse roles bridging physical engineering and software modeling'
    ],
    cons: [
      'Heavy regulatory hurdles slow down actual project implementations',
      'Requires integration with sometimes archaic physical grid infrastructures',
      'Slower prototyping cycles than pure software fields'
    ],
    relatedCareers: ['Solar Grid Analyst', 'Carbon Credits Auditor', 'Climate Risk Modeler', 'EV Infrastructure Architect'],
    relatedSkills: ['Photovoltaic Modeling', 'Microgrid Designing', 'ESG Financial Auditing', 'Thermal Simulation'],
    learningChannels: ['Terra.do Climate Fellowships', 'Doerr School of Sustainability seminars', 'Department of Energy research portals']
  },
  spatial_ui: {
    id: 'spatial_ui',
    title: 'Immersive Spatial Design & UI/UX',
    category: 'Creative Arts',
    pros: [
      'Pioneering new design paradigms for mixed and augmented realities',
      'High creative autonomy in establishing UI layout rules',
      'Growing consumer device market (Vision Pro, Meta Quest, etc.)'
    ],
    cons: [
      'High-end hardware requirement restricts democratic user testing',
      'Requires mastering advanced real-time 3D physics engines',
      'Motion sickness and user fatigue restrict continuous-view designs'
    ],
    relatedCareers: ['Spatial Experience Designer', 'AR/VR Interface Architect', '3D Technical Artist', 'Interactive Unity Developer'],
    relatedSkills: ['Unity/Unreal Engine', 'Three.js / WebGL coding', 'Human Interface Guidelines (HIG)', 'Haptic Feedback Design'],
    learningChannels: ['Apple Spatial UI guidelines', 'Epic Developer community tutorials', 'Muzli digital design forums']
  },
  bioinformatics: {
    id: 'bioinformatics',
    title: 'Bioinformatics & Precision Medicine',
    category: 'Life Sciences',
    pros: [
      'Directly leads to curing chronic illnesses and disease detection',
      'Fascinating intersection of high-powered string algorithms and biochemistry',
      'Long-term stable funding backed by pharmaceuticals and government labs'
    ],
    cons: [
      'Very steep scientific learning curve (biology + advanced computing)',
      'Extremely high liability and strict clinical trials timelines',
      'Data can be noisy, massive, and highly unstructured'
    ],
    relatedCareers: ['Computational Biologist', 'Genomic Research Analyst', 'Protein Folding Engineer', 'Clinical Data Scientist'],
    relatedSkills: ['Python (Biopython)', 'Genomic Sequencing Pipeline Modeling', 'R programming', 'AlphaFold / ESMFold APIs'],
    learningChannels: ['NCBI databases guide', 'Rosalind bioinformatics puzzles', 'Coursera Genomics specialization']
  },
  algorithmic_fintech: {
    id: 'algorithmic_fintech',
    title: 'FinTech & Algorithmic Trading Systems',
    category: 'Finance',
    pros: [
      'Potentially highly lucrative career field with immediate compensation rewards',
      'Intellectually challenging system performance and latency limits',
      'Highly quantitative, state-of-the-art predictive modeling technology'
    ],
    cons: [
      'Extremely high-stress field with zero margin for code errors',
      'Often requires around-the-clock shift-work and monitoring',
      'Philosophically focused on financial market efficiency rather than tangible creation'
    ],
    relatedCareers: ['Quantitative Trading Lead', 'Risk Analytics Engineer', 'FinTech Middleware Architect', 'Blockchain Lead Practitioner'],
    relatedSkills: ['Low-Latency C++', 'Statistical Arbitrage modeling', 'Time Series Forecasting', 'DeFi Smart Contracts (Solidity)'],
    learningChannels: ['QuantStart courses', 'Kaggle financial market challenges', 'DeFi Developer academy playbooks']
  },
  ethical_hacking: {
    id: 'ethical_hacking',
    title: 'Ethical Hacking & DevSecOps',
    category: 'Technology',
    pros: [
      'Incredibly high global demand; recession-proof career path',
      'Stimulating puzzle-solving; simulating the creative perspective of state actors',
      'Contributes to securing critical public utility networks from ransomware'
    ],
    cons: [
      'Carries high personal/corporate legal compliance liability',
      'Continuous emergency on-call stress when zero-day vulnerabilities leak',
      'Heavy routine documentation of compliance checklist forms'
    ],
    relatedCareers: ['Penetration Tester', 'DevSecOps Architect', 'Incident Response Officer', 'Vulnerability Researcher'],
    relatedSkills: ['Network PenTesting', 'Assembly Language debugging', 'Container Guarding APIs', 'OWASP Top 10 Standards'],
    learningChannels: ['TryHackMe & HackTheBox platforms', 'PortSwigger Web Security Academy', 'OWASP Cheat Sheets']
  },
  agtech_hydros: {
    id: 'agtech_hydros',
    title: 'Precision AgTech & Vertical Hydroponics',
    category: 'Sustainability',
    pros: [
      'Crucial for sustaining global urban food security under climate strain',
      'Wonderful tactile feel of combining physical botany with digital monitors',
      'High growth in global high-tech smart cities and mega projects'
    ],
    cons: [
      'Extremely high capital expense (CAPEX) for vertical farming sensors',
      'Vulnerable to immediate localized power grid failures or system outages',
      'Slower ROI than digital subscription software'
    ],
    relatedCareers: ['Vertical Farm Manager', 'AgTech IoT Engineer', 'Urban Agronomist', 'Controlled-Environment Systems Engineer'],
    relatedSkills: ['IoT Sensor Calibrating', 'Automated Drip Scheduling', 'ESP32/Arduino programming', 'Phytopathology Basics'],
    learningChannels: ['Upstart University courses', 'FAO Agriculture webinars', 'Indoor Farming Science forums']
  },
  iot_robotics: {
    id: 'iot_robotics',
    title: 'Digital Robotics & IoT Tinkering',
    category: 'Technology',
    pros: [
      'Immense satisfaction of seeing code manipulate physical space and widgets',
      'High demand in automated warehousing, factories, and advanced vehicles',
      'Fun secondary application in custom home automation and art'
    ],
    cons: [
      'Material parts costs can add up quickly over experimental builds',
      'Extremely difficult debugging across mechanics, electricity, AND code lines',
      'Safety hazards involving high temperatures or moving parts'
    ],
    relatedCareers: ['Robotics Controls Engineer', 'IoT Firmware Engineer', 'Mechatronic Systems Designer', 'Automation Analyst'],
    relatedSkills: ['ROS (Robot Operating System)', 'Embedded C coding', 'Circuit Schematic Drawing', 'Kinematic Modeling'],
    learningChannels: ['ROS.org Wiki tutorials', 'Hackaday firmware logs', 'Adafruit Learning System guides']
  },
  data_storytelling: {
    id: 'data_storytelling',
    title: 'Data Journalism & Visual Journalism',
    category: 'Creative Arts',
    pros: [
      'Combines quantitative analytics with powerful liberal-arts advocacy',
      'Highly creative visual animations (D3.js, WebGL scroll-telling)',
      'Shines immediate light on complex socio-economic, ecological truths'
    ],
    cons: [
      'Traditional print-press newsrooms suffer tight budget crunches',
      'Requires handling heavy data sanitation workloads under strict deadline stress',
      'Subject to public polarization, feedback, and digital criticism'
    ],
    relatedCareers: ['Data Journalist', 'Interactive Graphic Editor', 'Public Policy Visualizer', 'Visual Analytics Designer'],
    relatedSkills: ['D3.js / SVG rendering', 'Advanced SQL & pandas', 'Cartographic Mapping', 'Narrative Essay structures'],
    learningChannels: ['Pudding.cool methodology blogs', 'Storytelling with Data podcasts', 'Nieman Lab tutorials']
  },
  metaverse_gaming: {
    id: 'metaverse_gaming',
    title: 'Virtual Worlds & Creative Game Dev',
    category: 'Creative Arts',
    pros: [
      'Unbounded imaginative freedom to build physics-defying dimensions',
      'Technically robust field synthesizing math, graphics, audio, and storytelling',
      'Thriving indie game marketplace and alternative digital communities'
    ],
    cons: [
      'Industry is infamous for "crunch" work schedules before master releases',
      'Fierce global market saturation makes user discovery difficult',
      'Difficult balancing act between monetization and player health integrity'
    ],
    relatedCareers: ['Gameplay Systems Programmer', 'Procedural World Designer', 'Shader Developer', 'Interactive Sound Designer'],
    relatedSkills: ['C# script scripting', 'GLSL/HLSL custom shaders', 'Procedural Generation math', 'Multiplayer Networking'],
    learningChannels: ['Unity Learn pathway plans', 'GDC (Game Developers Conference) Vault talks', 'Brackeys scripting lessons']
  },
  aerospace_engineering: {
    id: 'aerospace_engineering',
    title: 'Aerospace Engineering & Small-Sats',
    category: 'Technology',
    pros: [
      'Contribute to the new era of commercial space exploration',
      'High intellectual engagement solving orbital mechanics problems',
      'Extremely high-status and robust public funding profiles'
    ],
    cons: [
      'Very long project times before seeing actual launches in orbit',
      'Controlled under strict international military/ITAR regulations',
      'Zero margin for physical component failure'
    ],
    relatedCareers: ['Satellite Controller', 'Propulsion Engineer', 'Space Mission Planner', 'Avionics Architect'],
    relatedSkills: ['Orbital Trajectory Math', 'Telemetry Protocols', 'CAD Structural Design', 'Aerodynamics Analysis'],
    learningChannels: ['NASA Jet Propulsion Lab webinars', 'ESA technical courses', 'Open-source satellite kits']
  },
  materials_science: {
    id: 'materials_science',
    title: 'Advanced Materials & Nanotechnology',
    category: 'Technology',
    pros: [
      'Groundbreaking research enabling lighter, stronger batteries and super-sensors',
      'Highly valued in chip fabrication and defense manufacturing',
      'Fascinating atomic-level experimentation'
    ],
    cons: [
      'Requires access to extremely expensive cleanroom laboratories',
      'Slower commercialization cycles from lab prototype to market',
      'Complex health and safety protocols surrounding nanomaterial handling'
    ],
    relatedCareers: ['Nanotechnology Specialist', 'Materials Characterization Analyst', 'Semiconductor Process Lead', 'Polymer Synthesizer'],
    relatedSkills: ['Electron Microscopy', 'Molecular Dynamic Simulation', 'XRD/FTIR Spectroscopy', 'Crystalline Growth Modeling'],
    learningChannels: ['MIT OpenCourseWare Materials Science', 'Nature Materials review journals', 'Nanotech.gov resource index']
  },
  neurotechnology: {
    id: 'neurotechnology',
    title: 'Brain-Computer Interfaces & Neurotech',
    category: 'Life Sciences',
    pros: [
      'Life-changing potential to restore motor control and vision to amputees/blind users',
      'True frontier of combining cognitive neuroscience with machine learning',
      'Highly venture-backed ecosystem growing aggressively'
    ],
    cons: [
      'Profound ethical dilemmas regarding brain privacy and neural implants',
      'High regulatory burdens (FDA, EMA clinical trial clearances)',
      'Interfacing with biological tissue presents extreme long-term safety challenges'
    ],
    relatedCareers: ['BCI System Engineer', 'Neural Signal Decodist', 'Neuroprosthetics Designer', 'Clinical Neural Auditor'],
    relatedSkills: ['EEG/EMG Recording Analysis', 'Digital Signal Processing (DSP)', 'Python SciPy/PyEEG', 'Human Medical Trial Ethics'],
    learningChannels: ['NeuroTechX community playbooks', 'OpenBCI documentation forums', 'Society for Neuroscience annual lectures']
  },
  quantum_computing: {
    id: 'quantum_computing',
    title: 'Quantum Computing & Cryptography',
    category: 'Technology',
    pros: [
      'Solving mathematical puzzles mathematically impossible on classical computers',
      'Prepares security architectures for potential future cryptographic cracks',
      'Work alongside elite quantum physicists and computer scientists'
    ],
    cons: [
      'Hardware is currently highly unstable and noisy (NISQ era)',
      'Requires abstract, non-intuitive knowledge of quantum physics',
      'Commercial applications are still experimental and years away'
    ],
    relatedCareers: ['Quantum Algorithm Designer', 'Qubit Controls Engineer', 'Post-Quantum Cryptographer', 'Quantum SDK Developer'],
    relatedSkills: ['Qiskit / Cirq coding', 'Quantum Fourier Transform', 'Linear Algebra', 'Lattice-Based Cryptography'],
    learningChannels: ['IBM Quantum Learning plans', 'Qiskit textbook tutorials', 'Microsoft Quantum Development Kit']
  },
  digital_fashion: {
    id: 'digital_fashion',
    title: 'Digital Fashion & Virtual Avatar Wearables',
    category: 'Creative Arts',
    pros: [
      'Promotes highly sustainable fashion with absolutely zero physical textile waste',
      'Unconstrained by gravity, material cost, or physical biology',
      'Flourishing market within virtual worlds, social engines, and gaming'
    ],
    cons: [
      'Dependent on fluctuating digital asset marketplaces and tech protocols',
      'Requires mastering heavy textile physical simulators on high-end computers',
      'Can be dismissed by traditional fashion houses as non-substantial'
    ],
    relatedCareers: ['Virtual Garment Designer', '3D Fabric Simulation Lead', 'Metaverse Wearables Artist', 'AR Apparel Modeler'],
    relatedSkills: ['Marvelous Designer', 'CLO 3D modeling', 'Texture Baking (Substance Painter)', 'AR Face Filters (SparkAR)'],
    learningChannels: ['The Fabricant design blogs', 'CLO 3D academy pathway courses', 'ArtStation portfolio workshops']
  },
  vertical_mobility: {
    id: 'vertical_mobility',
    title: 'eVTOL & Autonomous Drone Mobility',
    category: 'Sustainability',
    pros: [
      'Pioneering the future of zero-emission urban air transit',
      'High funding priority from transportation and logistics conglomerates',
      'Combines advanced aerospace with modern electric battery technology'
    ],
    cons: [
      'Very strict national aviation safety guidelines regarding city flight paths',
      'Public noise pollution doubts can restrict urban rooftop takeoffs',
      'Battery energy density constraints limit flight distances heavily'
    ],
    relatedCareers: ['UAV Fleet Dispatcher', 'Aeronautical Firmware Architect', 'Urban Airspace Consultant', 'Rotordynamic Analyst'],
    relatedSkills: ['Drone Simulation Tools', 'Real-Time Operating Systems (RTOS)', 'CAD Airframe Structuring', 'Battery Telemetry Monitoring'],
    learningChannels: ['FAA drone licensing guides', 'PX4 Autopilot developer docs', 'NASA Advanced Air Mobility panels']
  },
  circular_economy: {
    id: 'circular_economy',
    title: 'Zero-Waste & Circular Product Design',
    category: 'Sustainability',
    pros: [
      'Directly combats landfill growth by designing products with infinite lifecycle recycling',
      'Saves production overhead for modern eco-conscious companies',
      'Extremely rewarding intersection of materials science, logic modeling, and design'
    ],
    cons: [
      'Requires convincing deeply entrenched supply-chain corporations to redesign workflows',
      'Initial sourcing of pure biological/biodegradable resins can be costly',
      'Complex recycling compliance standards vary across municipal borders'
    ],
    relatedCareers: ['Circular Product Designer', 'Packaging Lifecycle Specialist', 'Supply Chain Circularity Lead', 'Bio-Resin Advisor'],
    relatedSkills: ['Life Cycle Assessment (LCA)', 'Biodegradable Polymer Science', 'Sourcing Auditing', 'Reverse Logistics Modeling'],
    learningChannels: ['Ellen MacArthur Foundation learning paths', 'LCA software platforms (SimaPro, GaBi)', 'Sustainable Design journals']
  },
  ocean_cleanup: {
    id: 'ocean_cleanup',
    title: 'Marine Tech & Blue Ocean Cleanup Systems',
    category: 'Sustainability',
    pros: [
      'Direct action cleaning microplastics and protecting critical oceanic life',
      'Encompasses exciting offshore expeditions and high-tech hydrographic tracking',
      'Strong international support from NGOs and sovereign green funds'
    ],
    cons: [
      'Saltwater is extremely corrosive, degrading physical sensors and electronics rapidly',
      'Vast oceans make physical cleanup equipment deploy logistics incredibly expensive',
      'Harsh open-sea working conditions with weather dependency'
    ],
    relatedCareers: ['Marine IoT Architect', 'Hydrographic Surveyor', 'Plastic Reclamation Strategist', 'Oceanic Policy Consultant'],
    relatedSkills: ['Marine Robotics controls', 'GIS mapping & Spatial Analysis', 'Hydrodynamic Flow Modeling', 'Corrosion Resistance design'],
    learningChannels: ['NOAA marine debris resources', 'The Ocean Cleanup methodology reports', 'Scripps Institution of Oceanography seminars']
  },
  synthetic_biology: {
    id: 'synthetic_biology',
    title: 'Synthetic Biology & Biomanufacturing',
    category: 'Life Sciences',
    pros: [
      'Engineering custom microorganisms to brew biofuels, clean leather, or biodegradable plastics',
      'Replacing high-emissions petrochemical products with biological fermenters',
      'Fast-growing scientific field merging software coding logic with biological cells'
    ],
    cons: [
      'Potential biosecurity risks from accidental releases of modified organisms',
      'Controlling living biological cells in bioreactors presents chaotic volatility',
      'High starting capital requirements for bioreactor factory gear'
    ],
    relatedCareers: ['Strain Design Scientist', 'Bioprocess Engineer', 'SynBio Program Designer', 'Fermentation Optimizer'],
    relatedSkills: ['CRISPR Gene Editing tools', 'Metabolic Flux Analysis', 'Python (BioPython)', 'Biomaterial Synthesis'],
    learningChannels: ['SynBioBeta network newsletters', 'iGEM competition case studies', 'NCBI molecular workbench guidelines']
  },
  privacy_engineering: {
    id: 'privacy_engineering',
    title: 'Decentralized Identity & Privacy Engineering',
    category: 'Technology',
    pros: [
      'Secures personal consumer profiles in an age of total web tracking and scanning',
      'Allows verifying credentials without revealing sensitive private raw metrics',
      'Extremely high demand due to deep national consumer data rights laws for privacy'
    ],
    cons: [
      'Deep mathematical structures with steep conceptual design learning curves',
      'Confusing user interface setups can lead to human coordination errors',
      'Clashes at times with traditional regulatory audit frameworks'
    ],
    relatedCareers: ['Privacy-Preserving Tech Lead', 'Zero-Knowledge Cryptographer', 'Decentralized Architect', 'Compliance Technology Officer'],
    relatedSkills: ['Zero-Knowledge Proofs (ZKP)', 'Homomorphic Encryption algorithms', 'DID (Decentralized Identifier) schemas', 'GDPR/CCPA frameworks'],
    learningChannels: ['Zero Knowledge Podcast resources', 'W3C Decentralized Identity portal', 'IAPP (International Association of Privacy Professionals) guides']
  },
  microbiome_nutrition: {
    id: 'microbiome_nutrition',
    title: 'Gut Microbiome & Personalized Nutrition',
    category: 'Life Sciences',
    pros: [
      'Transformative research connecting gut health directly to immune system and brain states',
      'High startup venture funding in personalized health diagnostics and subscriptions',
      'Directly improves individual daily physical wellness and diet precision'
    ],
    cons: [
      'Highly subjective clinical inputs with complex, noisy bacterial variables',
      'Fierce marketplace filled with unscientific marketing scams or pseudoscience',
      'Requires sorting customized dietary constraints unique to each client profile'
    ],
    relatedCareers: ['Microbiome Analysis Specialist', 'Personalized Dietetics Advisor', 'Gut Health Product Developer', 'Nutrigenomics Researcher'],
    relatedSkills: ['Metagenomic Sequencing analytics', 'R statistical package', 'Human Gut Pathology basics', 'Nutritional Biochemistry'],
    learningChannels: ['Gut Microbiome for Health conferences', 'NIH Human Microbiome Project guidelines', 'Stanford Nutrition Science reviews']
  },
  robotic_surgery: {
    id: 'robotic_surgery',
    title: 'Surgical Robotics & Smart Medical Hardware',
    category: 'Life Sciences',
    pros: [
      'Allows surgeons to perform microscopic incisions with absolute stability, lessening recovery times',
      'Saves human lives in critical high-precision operation theaters',
      'Exceptional career stability backed by health networks globally'
    ],
    cons: [
      'Extremely high emotional pressure knowing code faults have immediate physical consequences',
      'Intensified regulatory validation processes requiring multi-year trials',
      'High hospital procurement costs restrict equal access to the technology'
    ],
    relatedCareers: ['Surgical Robotics Control Architect', 'Medical Device Embedded Lead', 'Tactile Feedback Engineer', 'Clinical Hardware Tester'],
    relatedSkills: ['Inverse Kinematics coding', 'Ultra-low latency middleware', 'Haptic control systems', 'ISO 13485 medical standard guidelines'],
    learningChannels: ['Intuitive Surgical research labs', 'IEEE Transactions on Medical Robotics journals', 'Open-source surgical robot simulators']
  },
  digital_twins: {
    id: 'digital_twins',
    title: 'Industrial Digital Twins & IoT Modeling',
    category: 'Technology',
    pros: [
      'Allows simulation of complex factories and mega buildings under perfect digital test conditions',
      'Dramatically reduces hardware maintenance costs by anticipating wear-and-tear events',
      'Combines high-powered real-world spatial graphics with streaming physical IoT feeds'
    ],
    cons: [
      'Managing massive real-time data inputs from millions of fast-streaming machine sensors',
      'High starting configuration effort to build accurate initial physics duplicates',
      'Requires deep understanding of physical industrial machine workflows'
    ],
    relatedCareers: ['Industrial Simulation Specialist', 'Smart City Modeler', 'IoT Middleware Analyst', 'Systems Twin Architect'],
    relatedSkills: ['NVIDIA Omniverse toolkit', 'CAD/BIM Integration APIs', 'Kafka Sensor Streaming', 'Predictive Failure analytics'],
    learningChannels: ['NVIDIA Omniverse developer portal', 'Digital Twin Consortium guides', 'Azure Digital Twins documentation plans']
  },
  carbon_capture: {
    id: 'carbon_capture',
    title: 'Industrial Carbon Sequestration & Tech',
    category: 'Sustainability',
    pros: [
      'Crucial tool in capturing gigatons of historical atmospheric emissions physically',
      'Supported by deep national carbon offset markets and federal green credits',
      'Engrossing work combining chemical, structural, and geologic tracking systems'
    ],
    cons: [
      'Requires substantial energy inputs to operate separation systems effectively',
      'High physical capital expenditures to set up major storage facilities',
      'Complex geologic validation steps needed to ensure no gas leaks'
    ],
    relatedCareers: ['Carbon Sequestration Specialist', 'Geologic Integrity Surveyor', 'Emissions Compliance Analyst', 'Direct Air Capture Advisor'],
    relatedSkills: ['Chemical Process design', 'Geographic Information Systems (GIS)', 'Thermodynamics analysis', 'Reservoir Simulation modeling'],
    learningChannels: ['Global CCS Institute academy reviews', 'Climeworks direct air capture whitepapers', 'Stanford Carbon Mitigation Initiative guides']
  },
  sound_therapy: {
    id: 'sound_therapy',
    title: 'Acoustic Engineering & Sound Therapy Systems',
    category: 'Creative Arts',
    pros: [
      'Innovative application of spatial psychoacoustics for mental health recovery',
      'Combines highly artistic sound wave production with scientific brainwave tracking',
      'Growing clinical and wellness adoption for stress and anxiety reduction'
    ],
    cons: [
      'Subjective response variability depending on individual listener profiles',
      'Requires deep sensory research to separate scientifically validated waves from placebo trends',
      'Unstructured licensing processes across international commercial wellness hubs'
    ],
    relatedCareers: ['Psychoacoustic Designer', 'Acoustic Product Engineer', 'Spatial Audio Developer', 'Wellness Audio Architect'],
    relatedSkills: ['Binaural Audio synthesizers', 'DSP (Digital Signal Processing) filters', 'Max/MSP signal scripting', 'EEG Sleep-tracking monitors'],
    learningChannels: ['Acoustic Society of America workshops', 'Dolby Atmos immersive audio textbooks', 'Kadenze spatial sound web courses']
  }
};

// 25 Custom Order Rankings for Countries and Regions
const REGION_RANKINGS: Record<string, string[]> = {
  india: [
    'gen_ai', 'ethical_hacking', 'agtech_hydros', 'algorithmic_fintech', 'iot_robotics',
    'spatial_ui', 'bioinformatics', 'climate_tech', 'metaverse_gaming', 'data_storytelling',
    'aerospace_engineering', 'privacy_engineering', 'robotic_surgery', 'digital_twins', 'microbiome_nutrition',
    'materials_science', 'quantum_computing', 'vertical_mobility', 'circular_economy', 'ocean_cleanup',
    'synthetic_biology', 'digital_fashion', 'carbon_capture', 'neurotechnology', 'sound_therapy'
  ],
  usa: [
    'gen_ai', 'climate_tech', 'bioinformatics', 'algorithmic_fintech', 'ethical_hacking',
    'spatial_ui', 'iot_robotics', 'data_storytelling', 'metaverse_gaming', 'agtech_hydros',
    'quantum_computing', 'neurotechnology', 'materials_science', 'aerospace_engineering', 'privacy_engineering',
    'vertical_mobility', 'synthetic_biology', 'carbon_capture', 'robotic_surgery', 'digital_twins',
    'circular_economy', 'digital_fashion', 'ocean_cleanup', 'microbiome_nutrition', 'sound_therapy'
  ],
  singapore: [
    'algorithmic_fintech', 'gen_ai', 'agtech_hydros', 'ethical_hacking', 'spatial_ui',
    'climate_tech', 'bioinformatics', 'iot_robotics', 'data_storytelling', 'metaverse_gaming',
    'privacy_engineering', 'digital_twins', 'vertical_mobility', 'quantum_computing', 'circular_economy',
    'ocean_cleanup', 'microbiome_nutrition', 'materials_science', 'synthetic_biology', 'robotic_surgery',
    'digital_fashion', 'aerospace_engineering', 'carbon_capture', 'neurotechnology', 'sound_therapy'
  ],
  uk: [
    'gen_ai', 'algorithmic_fintech', 'climate_tech', 'bioinformatics', 'ethical_hacking',
    'spatial_ui', 'data_storytelling', 'iot_robotics', 'metaverse_gaming', 'agtech_hydros',
    'quantum_computing', 'privacy_engineering', 'aerospace_engineering', 'circular_economy', 'materials_science',
    'neurotechnology', 'vertical_mobility', 'ocean_cleanup', 'synthetic_biology', 'microbiome_nutrition',
    'digital_fashion', 'digital_twins', 'robotic_surgery', 'carbon_capture', 'sound_therapy'
  ],
  europe: [
    'climate_tech', 'gen_ai', 'iot_robotics', 'ethical_hacking', 'bioinformatics',
    'algorithmic_fintech', 'agtech_hydros', 'spatial_ui', 'data_storytelling', 'metaverse_gaming',
    'circular_economy', 'vertical_mobility', 'materials_science', 'privacy_engineering', 'quantum_computing',
    'ocean_cleanup', 'synthetic_biology', 'carbon_capture', 'robotic_surgery', 'digital_twins',
    'microbiome_nutrition', 'digital_fashion', 'aerospace_engineering', 'neurotechnology', 'sound_therapy'
  ],
  japan: [
    'iot_robotics', 'gen_ai', 'spatial_ui', 'metaverse_gaming', 'climate_tech',
    'agtech_hydros', 'ethical_hacking', 'algorithmic_fintech', 'bioinformatics', 'data_storytelling',
    'materials_science', 'robotic_surgery', 'digital_twins', 'quantum_computing', 'privacy_engineering',
    'aerospace_engineering', 'circular_economy', 'synthetic_biology', 'neurotechnology', 'microbiome_nutrition',
    'vertical_mobility', 'digital_fashion', 'carbon_capture', 'ocean_cleanup', 'sound_therapy'
  ],
  china: [
    'gen_ai', 'iot_robotics', 'algorithmic_fintech', 'agtech_hydros', 'ethical_hacking',
    'spatial_ui', 'metaverse_gaming', 'climate_tech', 'bioinformatics', 'data_storytelling',
    'materials_science', 'digital_twins', 'quantum_computing', 'aerospace_engineering', 'privacy_engineering',
    'robotic_surgery', 'synthetic_biology', 'vertical_mobility', 'carbon_capture', 'circular_economy',
    'ocean_cleanup', 'microbiome_nutrition', 'digital_fashion', 'neurotechnology', 'sound_therapy'
  ],
  default: [
    'gen_ai', 'climate_tech', 'ethical_hacking', 'algorithmic_fintech', 'bioinformatics',
    'agtech_hydros', 'iot_robotics', 'spatial_ui', 'data_storytelling', 'metaverse_gaming',
    'privacy_engineering', 'quantum_computing', 'aerospace_engineering', 'materials_science', 'neurotechnology',
    'synthetic_biology', 'vertical_mobility', 'circular_economy', 'ocean_cleanup', 'microbiome_nutrition',
    'digital_twins', 'robotic_surgery', 'digital_fashion', 'carbon_capture', 'sound_therapy'
  ]
};

// Generative trend templates for standard descriptions per category item
const BASE_TRENDS_TEMPLATES: Record<string, string> = {
  gen_ai: 'Massive enterprise adoption and computing cluster expansions across {country} for scaling customer and mathematical reasoning agents.',
  climate_tech: 'Surging investments driven by national carbon reduction mandates and local clean energy infrastructure deployment in {country}.',
  spatial_ui: 'Rapid adoption of professional mixed reality systems and haptic interface standards across spatial design firms in {country}.',
  bioinformatics: 'High demand linking massive genomic databases with localized clinical trial frameworks in {country}.',
  algorithmic_fintech: 'Avenue for real-time asset pricing and high-frequency model execution to capture macro rate variations in {country}.',
  ethical_hacking: 'Vital cyber defense hardening triggered by national updates to digital infrastructure and cloud node security in {country}.',
  agtech_hydros: 'Critical priority for sustainable local food cultivation, vertical farms, and precision drip scheduling across {country}.',
  iot_robotics: 'Scale-up of automated sorting nodes and embedded mechatronic systems across factory and logistics hubs in {country}.',
  data_storytelling: 'Accelerating data literacy demands for visualizing complex socio-economic, legislative, and environmental indicators in {country}.',
  metaverse_gaming: 'Strong expansion of local indie platforms and multi-user environments building persistent interactive sandboxes in {country}.',
  aerospace_engineering: 'Growing small-satellite deployment demands and commercial launch scheduling pipelines in {country}.',
  materials_science: 'Advanced R&D focused on superconductor properties, high-energy density batteries, and microchip fabrication within {country}.',
  neurotechnology: 'Pioneering cognitive signal decoding and neural telemetry research backing next-generation neuro-prosthetics in {country}.',
  quantum_computing: 'Active foundational development for lattice-based decryption models and quantum state simulation research in {country}.',
  digital_fashion: 'Surging traction among local creative agencies designing sustainable digital apparel templates and metaverse avatars in {country}.',
  vertical_mobility: 'Strategic municipal planning trials for autonomous eVTOL aerial commutes and drone package deliveries in {country}.',
  circular_economy: 'Strong regulatory pressure driving manufacturers to redesign product life-cycles and utilize biodegradable resins in {country}.',
  ocean_cleanup: 'High priority for deployment of solar-powered sea sweepers and satellite microplastic tracking tools along {country} waterways.',
  synthetic_biology: 'Venture backing for engineered yeasts and bioreactor designs producing local climate-safe biofuels and biomaterials in {country}.',
  privacy_engineering: 'Strict compliance updates to local data rights directives driving demand for zero-knowledge proof designs in {country}.',
  microbiome_nutrition: 'Widespread public interest in personalized metagenomic gut health reports and biotech-curated diets in {country}.',
  robotic_surgery: 'Medical integration of micro-incision surgical arms to ensure absolute stability and minimal recovery rates in {country} clinics.',
  digital_twins: 'High-fidelity systems engineering replicating ports, automated assemblies, and smart buildings via NVIDIA Omniverse in {country}.',
  carbon_capture: 'Scaling up direct air sequestration reactors backed by localized carbon ledger trading credits and storage grids in {country}.',
  sound_therapy: 'Emergence of acoustic engineering laboratories utilizing psychoacoustic wave synthesizers for neurological relaxation in {country}.'
};

// Generates custom trends depending on the selected country to ensure full-stack authenticity!
export function getTrendingInterestsByCountry(country: string): TrendingInterest[] {
  const normCountry = (country || 'Global').toLowerCase().trim();

  // Create customized weights and descriptions depending on country context (for original 10)
  let localizedConfigs: Record<string, { rank?: number; popularity?: number; growth?: number; why?: string }> = {};

  if (normCountry.includes('india')) {
    localizedConfigs = {
      gen_ai: { popularity: 98, growth: 42, why: 'Unprecedented demand across tech corridors in Bangalore, Hyderabad, and Pune for scaling business intelligence processes.' },
      ethical_hacking: { popularity: 92, growth: 31, why: 'Rapid digitization of the national banking (UPI) structure places premium cyber-fortressing to the fore.' },
      agtech_hydros: { popularity: 89, growth: 29, why: 'Vital intersection for precision irrigation to optimize water conservation and yield in northern plains.' },
      algorithmic_fintech: { popularity: 87, growth: 34, why: 'Surging algorithms trading demand matching retail broker boom in Mumbai financial markets.' },
      iot_robotics: { popularity: 84, growth: 25, why: 'Automated warehouse robotics systems scaling to handle national e-commerce logistics giants.' },
      spatial_ui: { popularity: 80, growth: 22, why: 'Fierce creative agency focus on 3D design portals and immersive e-retail user avenues.' },
      bioinformatics: { popularity: 78, growth: 18, why: 'Vaccine sequencing hubs in Hyderabad moving computing closer to traditional molecular bioscience.' },
      climate_tech: { popularity: 75, growth: 21, why: 'Solar farm grid microgrids deploying rapidly across Rajasthan with specialized monitoring assets.' },
      metaverse_gaming: { popularity: 73, growth: 19, why: 'Exploding mobile game production pipelines transitioning from outsourcing to local indie projects.' },
      data_storytelling: { popularity: 69, growth: 15, why: 'Visualizing massive urban density and environmental air monitoring indexes through local dashboards.' }
    };
  } else if (normCountry.includes('usa') || normCountry.includes('america')) {
    localizedConfigs = {
      gen_ai: { popularity: 99, growth: 48, why: 'Silicon Valley driving multi-billion dollar foundational frontier models research and enterprise rollouts.' },
      climate_tech: { popularity: 94, growth: 36, why: 'Massive private climate VC investments responding to legislative clean investment credits.' },
      bioinformatics: { popularity: 91, growth: 28, why: 'Boston-San Diego pharmaceutical clusters heavily adopting computational precision medicine engines.' },
      algorithmic_fintech: { popularity: 89, growth: 30, why: 'Wall Street institutional systems transitioning completely into machine-learning driven high-speed trading.' },
      ethical_hacking: { popularity: 87, growth: 24, why: 'Protecting cloud multi-tenant storage nodes and public power grid structures from state adversaries.' },
      spatial_ui: { popularity: 85, growth: 32, why: 'Apple spatial hardware and VR ecosystems driving user UX transformations in California hubs.' },
      iot_robotics: { popularity: 82, growth: 22, why: 'Advanced manufacturing automation and self-driving transport logistics routing across states.' },
      data_storytelling: { popularity: 80, growth: 18, why: 'Data-driven visual essays at major publications modeling real-time socio-economic and climate indexes.' },
      metaverse_gaming: { popularity: 78, growth: 16, why: 'Robust game studio development ecosystem designing persistent physics-driven networking sandboxes.' },
      agtech_hydros: { popularity: 74, growth: 15, why: 'High-tech greenhouse complexes scaling in central valleys to counter climate-induced water restrictions.' }
    };
  } else if (normCountry.includes('singapore')) {
    localizedConfigs = {
      algorithmic_fintech: { popularity: 97, growth: 38, why: 'Southeast Asia’s prime banking capital leveraging algorithmic micro-second transactions and smart ledger rules.' },
      gen_ai: { popularity: 95, growth: 44, why: 'Smart Nation program deploying custom AI micro-agents for governmental and financial automation.' },
      agtech_hydros: { popularity: 92, growth: 33, why: 'Crucial for Sg\'s "30 by 30" plan—aiming to locally farm 30% of nutrition needs using vertical hydroponics.' },
      ethical_hacking: { popularity: 89, growth: 26, why: 'Securing massive cloud datacenters and international logistics routing hubs aligned in the port.' },
      spatial_ui: { popularity: 86, growth: 29, why: 'Urban spatial architectural planners crafting highly detailed "digital twin" models of the city.' },
      climate_tech: { popularity: 83, growth: 25, why: 'Carbon exchange portals and ocean-based cooling grid architectures scaling in the tropics.' },
      bioinformatics: { popularity: 81, growth: 22, why: 'Biopolis research laboratories engineering personalized oncology treatments for Asia genotypes.' },
      iot_robotics: { popularity: 79, growth: 20, why: 'Deploying autonomous cleaning and hospital logistics transport drones across public hospitals.' },
      data_storytelling: { popularity: 74, growth: 14, why: 'Publishing interactive charts tracking dense city energy consumption grids and heat island offsets.' },
      metaverse_gaming: { popularity: 72, growth: 12, why: 'Localized digital world builders staging creative exhibitions and virtual community squares.' }
    };
  } else if (normCountry.includes('uk') || normCountry.includes('united kingdom') || normCountry.includes('london')) {
    localizedConfigs = {
      gen_ai: { popularity: 96, growth: 40, why: 'London research laboratories advancing deep-learning models for healthcare and complex scientific reasoning.' },
      algorithmic_fintech: { popularity: 94, growth: 33, why: 'High-performing quant trading teams scaling next-generation risk engines near the City of London.' },
      climate_tech: { popularity: 90, growth: 32, why: 'North Sea wind grid integrations requiring sophisticated computer dispatch and forecasting models.' },
      bioinformatics: { popularity: 88, growth: 26, why: 'Wellcome Sanger and Cambridge science lanes linking genetic sequencing databases with clinical models.' },
      ethical_hacking: { popularity: 86, growth: 23, why: 'Active defense strategies securing healthcare databases, fin-systems, and public communication assets.' },
      spatial_ui: { popularity: 82, growth: 25, why: 'Creative agencies building immersive theatrical performances and digital art galleries physically/online.' },
      data_storytelling: { popularity: 80, growth: 19, why: 'Visual investigative panels leveraging geospatial data to expose public-interest climate records.' },
      iot_robotics: { popularity: 78, growth: 18, why: 'Deploying automated drones and sensors to monitor safety states in historical heavy grids.' },
      metaverse_gaming: { popularity: 76, growth: 16, why: 'Pioneering indie games developer network authoring intricate narrative virtual environments.' },
      agtech_hydros: { popularity: 72, growth: 12, why: 'Smart glasshouse complexes growing cold-resistant greens using automated soil probes.' }
    };
  } else if (normCountry.includes('europe') || normCountry.includes('germany') || normCountry.includes('france')) {
    localizedConfigs = {
      climate_tech: { popularity: 96, growth: 38, why: 'Strict EU Green Deal guidelines accelerating investment in local power grids, carbon calculators, and green materials.' },
      gen_ai: { popularity: 94, growth: 36, why: 'Intense focus on pioneering ethical AI models and open-source models aligned with stringent privacy policies.' },
      iot_robotics: { popularity: 91, growth: 29, why: 'Industrial automation, smart driving components, and manufacturing machine arms scaling in Germany/France.' },
      ethical_hacking: { popularity: 88, growth: 25, why: 'Securing pan-European supply networks and manufacturing grids from cross-border ransomware.' },
      bioinformatics: { popularity: 85, growth: 24, why: 'European Molecular Biology labs leveraging high-performance code pipelines for protein folding.' },
      algorithmic_fintech: { popularity: 83, growth: 21, why: 'Integrating open-banking API rules with automated trade-execution pipelines in Frankfurt/Paris.' },
      agtech_hydros: { popularity: 81, growth: 23, why: 'Developing autonomous harvesting machinery and high-efficiency smart farms to lower pesticide use.' },
      spatial_ui: { popularity: 78, growth: 22, why: 'Innovative creative art networks modeling interactive museum installations and acoustic spatial UI.' },
      data_storytelling: { popularity: 76, growth: 16, why: 'Visualizing cross-border energy flows, immigration patterns, and national environmental indexes.' },
      metaverse_gaming: { popularity: 74, growth: 14, why: 'European indie game communities building cozy, social-impact, and artistic simulation worlds.' }
    };
  } else if (normCountry.includes('japan')) {
    localizedConfigs = {
      iot_robotics: { popularity: 97, growth: 32, why: 'Aged population relief requiring cutting-edge development of elder-care assistive devices and companion robots.' },
      gen_ai: { popularity: 93, growth: 39, why: 'Broad national creative and anime production houses adopting custom AI rendering tools for pre-visualization.' },
      spatial_ui: { popularity: 89, growth: 31, why: 'Gaming and sensory developers defining virtual avatar space interactions and spatial consoles.' },
      metaverse_gaming: { popularity: 87, growth: 22, why: 'Traditional gaming powerhouse studios upgrading to larger-scale immersive physics environments.' },
      climate_tech: { popularity: 83, growth: 24, why: 'Offshore thermal, geothermal, and disaster-proof microgrids monitoring seismic anomalies.' },
      agtech_hydros: { popularity: 81, growth: 21, why: 'Optimizing indoor automated farming within small urban footprint shelves to produce high-value crops.' },
      ethical_hacking: { popularity: 79, growth: 19, why: 'Hardening specialized IoT industrial controllers and national satellite telemetry assets.' },
      algorithmic_fintech: { popularity: 77, growth: 18, why: 'High-frequency trading programs responding to Bank of Japan macro-monetary rate changes.' },
      bioinformatics: { popularity: 75, growth: 15, why: 'Stem cell gene sequencing databases researching longevity and metabolic therapies.' },
      data_storytelling: { popularity: 70, growth: 11, why: 'Exposing seismic alerts and demographic shifts with elegant, animated real-time map plots.' }
    };
  } else if (normCountry.includes('china')) {
    localizedConfigs = {
      gen_ai: { popularity: 98, growth: 46, why: 'Heavy local server computing clusters training massive multi-modal smart city models and industrial agents.' },
      iot_robotics: { popularity: 95, growth: 34, why: 'Shenzhen hardware hubs engineering the supply chain to assemble, program, and ship international physical drones.' },
      algorithmic_fintech: { popularity: 90, growth: 31, why: 'Major fintech platforms designing high-velocity credit assessment systems and national digital yuan ledgers.' },
      agtech_hydros: { popularity: 88, growth: 27, why: 'Massive smart greenhouses monitoring environmental soil profiles across arid western states.' },
      ethical_hacking: { popularity: 86, growth: 22, why: 'National firewall networks and high-security communication channels engineering hardened encryption.' },
      spatial_ui: { popularity: 83, growth: 28, why: 'High-end interactive device screens integrating immersive social shopping features with 3D views.' },
      metaverse_gaming: { popularity: 81, growth: 20, why: 'Dominant corporate gaming publishers modeling massive cloud multiplayer games with advanced physics.' },
      climate_tech: { popularity: 79, growth: 23, why: 'Pioneering lithium-battery control management firmware and solar array scheduling systems.' },
      bioinformatics: { popularity: 77, growth: 18, why: 'High-velocity genomic mapping centers modeling plant genomes for resilient agriculture.' },
      data_storytelling: { popularity: 72, growth: 13, why: 'Generating dynamic infographics describing commercial expansion and carbon capture metrics.' }
    };
  } else if (normCountry.includes('brazil') || normCountry.includes('south africa') || normCountry.includes('uae') || normCountry.includes('australia') || normCountry.includes('canada')) {
    localizedConfigs = {
      gen_ai: { popularity: 95, growth: 38, why: `Broad regional adoption in ${country} organizations seeking to optimize administrative and digital operations.` },
      climate_tech: { popularity: 92, growth: 34, why: `Crucial environmental focus on managing ${normCountry.includes('australia') ? 'bushfire/solar risk' : 'mining carbon carbon footprint'} and energy networks.` },
      agtech_hydros: { popularity: 89, growth: 28, why: 'Precision agriculture vital for preserving water resources while maximizing heavy food production crop yields.' },
      ethical_hacking: { popularity: 86, growth: 24, why: 'Providing localized defense measures to safeguard digital services from global systemic cyberattacks.' },
      algorithmic_fintech: { popularity: 83, growth: 22, why: 'Fierce digital start-up banking expansion to serve millions of modern digital consumers.' },
      iot_robotics: { popularity: 80, growth: 21, why: 'Developing automation tools to manage logistics hubs and extraction processes.' },
      spatial_ui: { popularity: 77, growth: 23, why: 'High visual demand to design consumer applications and interactive commercial hubs.' },
      data_storytelling: { popularity: 75, growth: 17, why: 'Investigating historical development and natural-resource conservation rates in visual reports.' },
      metaverse_gaming: { popularity: 72, growth: 15, why: 'Vibrant local development communities programming interactive cross-platform simulator assets.' },
      bioinformatics: { popularity: 69, growth: 13, why: 'Using genetic sequencing databases to track climate resilience indicators in local ecology.' }
    };
  } else {
    localizedConfigs = {
      gen_ai: { popularity: 97, growth: 45, why: 'The global standard for corporate knowledge automation, synthetic text creation, and generative asset design.' },
      climate_tech: { popularity: 93, growth: 35, why: 'Universal investment in local microgrid operations, emission compliance software, and battery modeling.' },
      ethical_hacking: { popularity: 90, growth: 28, why: 'Worldwide priority to safeguard cloud architectures, databases, and critical physical grids.' },
      algorithmic_fintech: { popularity: 87, growth: 26, why: 'Global digital banking pipelines incorporating trading signals and decentralized ledger operations.' },
      bioinformatics: { popularity: 84, growth: 23, why: 'Rapid computing integration into medical diagnostic hubs and molecular drug design globally.' },
      agtech_hydros: { popularity: 82, growth: 22, why: 'Tackling global food crises with automated soil sensors, vertical green walls, and indoor grow lights.' },
      iot_robotics: { popularity: 80, growth: 21, why: 'Modern robotic factory automation and connected physical widgets interacting globally.' },
      spatial_ui: { popularity: 78, growth: 26, why: 'Crafting responsive user interfaces for VR glasses and spatial displays across tech ecosystems.' },
      data_storytelling: { popularity: 75, growth: 16, why: 'Using web-based graphics dynamically representing heavy public-interest scientific data.' },
      metaverse_gaming: { popularity: 72, growth: 15, why: 'Global indie networks authoring interactive sandbox virtual environments and cozy games.' }
    };
  }

  // Get active rank sequence based on matched country
  let rankOrder = REGION_RANKINGS.default;
  if (normCountry.includes('india')) rankOrder = REGION_RANKINGS.india;
  else if (normCountry.includes('usa') || normCountry.includes('america')) rankOrder = REGION_RANKINGS.usa;
  else if (normCountry.includes('singapore')) rankOrder = REGION_RANKINGS.singapore;
  else if (normCountry.includes('uk') || normCountry.includes('united kingdom') || normCountry.includes('london')) rankOrder = REGION_RANKINGS.uk;
  else if (normCountry.includes('europe') || normCountry.includes('germany') || normCountry.includes('france')) rankOrder = REGION_RANKINGS.europe;
  else if (normCountry.includes('japan')) rankOrder = REGION_RANKINGS.japan;
  else if (normCountry.includes('china')) rankOrder = REGION_RANKINGS.china;
  else if (normCountry.includes('brazil') || normCountry.includes('south africa') || normCountry.includes('uae') || normCountry.includes('australia') || normCountry.includes('canada')) rankOrder = REGION_RANKINGS.brazil;

  // Build the complete array of 25 sorted objects
  return rankOrder.map((key, index) => {
    const base = BASE_INTERESTS[key];
    const rank = index + 1;

    // Organic decay logic for popularity score capped between 50 and 99
    const localConf = localizedConfigs[key] || {};
    const popularity = localConf.popularity !== undefined
      ? localConf.popularity
      : Math.max(50, Math.min(99, Math.round(92 - (index * 1.5) - ((index * 7) % 3))));

    // Organic decay logic for growth rate capped between 8% and 48%
    const growthRate = localConf.growth !== undefined
      ? localConf.growth
      : Math.max(8, Math.min(48, Math.round(38 - (index * 1.2) + ((index * 5) % 4))));

    // Localization text replacement
    let whyTrending = localConf.why;
    if (!whyTrending) {
      const template = BASE_TRENDS_TEMPLATES[key] || 'Highly popular global domain with solid career prospects inside {country}.';
      whyTrending = template.replace(/{country}/g, country || 'Global');
    }

    return {
      ...base,
      popularity,
      growthRate,
      rank,
      whyTrending
    };
  });
}
