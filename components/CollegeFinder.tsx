import React, { useState, useMemo, useEffect } from "react";
import {
  College,
  CollegeResult,
  PersonalizedCollege,
  PersonalizedCollegeResult,
  PersonalizedCollegeQueryParams,
} from "../types";
import { findColleges, findCollegesPersonalized } from "../services/gemini";
import {
  Loader2,
  Search,
  MapPin,
  Trophy,
  DollarSign,
  ExternalLink,
  ChevronDown,
  Globe,
  Building2,
  GraduationCap,
  Briefcase,
  FileCheck,
  Phone,
  TrendingUp,
  Filter,
  X,
  Scale,
  CheckSquare,
  Square,
  Link2,
  CheckCircle2,
  Sparkles,
  Award,
  IndianRupee,
  Euro,
  PoundSterling,
  JapaneseYen,
  Coins,
  Heart,
} from "lucide-react";

interface CollegeFinderProps {
  onComplete: (result: CollegeResult) => void;
  existingResult: CollegeResult | null;
  country: string;
}

// --- Dynamic & Procedure-Specific Application Milestones Generator ---
interface MilestoneItem {
  id: string;
  label: string;
}

const getCollegeMilestones = (college: College): MilestoneItem[] => {
  const loc = college.location.toLowerCase();
  const name = college.name.toLowerCase();
  const milestones: MilestoneItem[] = [];

  // Step 1: Exams and standardized tests
  let examString = "standardized exams";
  if (college.exams && college.exams.length > 0) {
    const validExams = college.exams.filter(
      (e) => e && e.toUpperCase() !== "N/A" && e.toUpperCase() !== "NONE",
    );
    if (validExams.length > 0) {
      examString = validExams.join(" / ");
    } else if (loc.includes("usa") || loc.includes("united states")) {
      examString = "SAT / ACT & TOEFL / IELTS (if international)";
    } else if (loc.includes("uk") || loc.includes("united kingdom")) {
      examString = "IELTS / TOEFL English Proficiency Exam";
    } else {
      examString = "Required Entrance Qualification / Board GPA transcripts";
    }
  } else if (loc.includes("usa") || loc.includes("united states")) {
    examString = "SAT/ACT and English Language Proficiency (IELTS/TOEFL)";
  } else if (loc.includes("uk") || loc.includes("united kingdom")) {
    examString =
      "IELTS/TOEFL and specific subject admissions tests if required";
  } else {
    examString =
      "Standardized eligibility entrance tests or high school transcripts";
  }
  milestones.push({
    id: "sat",
    label: `1. Submit entrance credentials (${examString})`,
  });

  // Step 2: Application Portal Setup
  let portalName = "University Application Portal";
  if (loc.includes("usa") || loc.includes("united states")) {
    portalName =
      name.includes("mit") || name.includes("georgetown")
        ? "Institutional Application System"
        : "Common App / Coalition App profile";
  } else if (loc.includes("uk") || loc.includes("united kingdom")) {
    portalName = "UCAS (Universities & Colleges Admissions Service) form";
  } else if (loc.includes("canada")) {
    portalName =
      loc.includes("ontario") ||
      name.includes("toronto") ||
      name.includes("waterloo")
        ? "OUAC (Ontario Universities Application Centre)"
        : "Provincial / Institutional Direct Portal";
  } else if (loc.includes("india")) {
    portalName = name.includes("iit")
      ? "JEE Advanced / JoSAA Counselor Portal"
      : "Institutional / Joint counseling application";
  } else if (loc.includes("australia")) {
    portalName = "State TAC / UAC or Direct International Submission system";
  }
  milestones.push({
    id: "portal",
    label: `2. Complete institutional register via ${portalName}`,
  });

  // Step 3: Essays and Statement-of-Purpose (SOP)
  let essayLabel =
    "Draft custom Statement of Purpose (SOP) explaining academic intentions";
  if (loc.includes("usa") || loc.includes("united states")) {
    essayLabel = `Draft standard 650-word Common App essay and university-specific supplemental short responses`;
  } else if (loc.includes("uk") || loc.includes("united kingdom")) {
    essayLabel =
      "Complete UCAS 4,000-character Personal Statement highlighting subject interest & reading";
  } else if (
    name.includes("mit") ||
    name.includes("stanford") ||
    name.includes("harvard") ||
    name.includes("oxford") ||
    name.includes("cambridge")
  ) {
    essayLabel =
      "Write competitive high-tier supplement questionnaires or provide specialized portfolio essays";
  } else if (
    college.courses &&
    college.courses.some(
      (c) =>
        c.toLowerCase().includes("design") ||
        c.toLowerCase().includes("art") ||
        c.toLowerCase().includes("architecture"),
    )
  ) {
    essayLabel =
      "Assemble creative showcase portfolio, designs, and architectural study mockups";
  }
  milestones.push({ id: "essay", label: `3. ${essayLabel}` });

  // Step 4: Letters of Recommendation (LORs) and Certified School Records
  let lorLabel =
    "Request and secure two strong letters of recommendation from core teachers";
  if (loc.includes("usa") || loc.includes("united states")) {
    lorLabel =
      "Secure secondary school report, counselor reference, and 2 core teacher evaluations";
  } else if (loc.includes("uk") || loc.includes("united kingdom")) {
    lorLabel =
      "Acquire certified academic reference from principal/lead tutor with predicted grades evidence";
  } else if (loc.includes("india") || name.includes("iit")) {
    lorLabel =
      "Gather validated certified physical copies of Grade 10 & 12 Board scorecards";
  }
  milestones.push({ id: "lor", label: `4. ${lorLabel}` });

  // Step 5: Financial Aids, CSS, Scholarships, or Study Visa Arrangements
  let finLabel =
    "Identify merit scholarships, bursary eligibility, or local student loans";
  if (loc.includes("usa") || loc.includes("united states")) {
    finLabel =
      "Submit FAFSA / institutional CSS Profile form specifying this college's federal code";
  } else if (
    loc.includes("uk") ||
    loc.includes("united kingdom") ||
    loc.includes("canada") ||
    loc.includes("australia") ||
    !loc.includes("domestic")
  ) {
    const visaDetails = loc.includes("uk")
      ? "UK Student Visa (CAS number confirmation)"
      : loc.includes("canada")
        ? "Canadian Study Permit (GIC requirement)"
        : "International Student Visa and financial proof of tuition";
    finLabel = `Arrange official funding certificates, bank statements, and prepare for ${visaDetails}`;
  } else if (loc.includes("india")) {
    finLabel =
      "Complete verification registration and reserve semester tuition deposit";
  }
  milestones.push({ id: "finaid", label: `5. ${finLabel}` });

  return milestones;
};

// --- Currency Mapping and Fee Formatting Helpers ---
interface CurrencyInfo {
  symbol: string;
  code: string;
  icon: any; // Lucide Icon
}

export const getCurrencyForLocation = (locationStr: string): CurrencyInfo => {
  const loc = (locationStr || "").toLowerCase();

  if (
    loc.includes("india") ||
    loc.includes("chennai") ||
    loc.includes("mumbai") ||
    loc.includes("delhi") ||
    loc.includes("bangalore") ||
    loc.includes("bengaluru") ||
    loc.includes("inr") ||
    loc.includes("rupee")
  ) {
    return { symbol: "₹", code: "INR", icon: IndianRupee };
  }
  if (
    loc.includes("uk") ||
    loc.includes("united kingdom") ||
    loc.includes("gbp") ||
    loc.includes("london") ||
    loc.includes("oxford") ||
    loc.includes("cambridge") ||
    loc.includes("scotland") ||
    loc.includes("edinburgh") ||
    loc.includes("wales")
  ) {
    return { symbol: "£", code: "GBP", icon: PoundSterling };
  }
  if (
    loc.includes("germany") ||
    loc.includes("france") ||
    loc.includes("europe") ||
    loc.includes("european union") ||
    loc.includes("eur") ||
    loc.includes("euro") ||
    loc.includes("munich") ||
    loc.includes("paris") ||
    loc.includes("berlin") ||
    loc.includes("netherlands") ||
    loc.includes("amsterdam") ||
    loc.includes("switzerland") ||
    loc.includes("zurich")
  ) {
    return { symbol: "€", code: "EUR", icon: Euro };
  }
  if (
    loc.includes("japan") ||
    loc.includes("tokyo") ||
    loc.includes("jpy") ||
    loc.includes("yen") ||
    loc.includes("kyoto")
  ) {
    return { symbol: "¥", code: "JPY", icon: JapaneseYen };
  }
  if (
    loc.includes("china") ||
    loc.includes("cny") ||
    loc.includes("beijing") ||
    loc.includes("shanghai") ||
    loc.includes("yuan")
  ) {
    return { symbol: "¥", code: "CNY", icon: JapaneseYen };
  }
  if (loc.includes("singapore") || loc.includes("sgd") || loc.includes("s$")) {
    return { symbol: "S$", code: "SGD", icon: DollarSign };
  }
  if (
    loc.includes("canada") ||
    loc.includes("cad") ||
    loc.includes("c$") ||
    loc.includes("toronto") ||
    loc.includes("vancouver") ||
    loc.includes("waterloo")
  ) {
    return { symbol: "C$", code: "CAD", icon: DollarSign };
  }
  if (
    loc.includes("australia") ||
    loc.includes("aud") ||
    loc.includes("a$") ||
    loc.includes("sydney") ||
    loc.includes("melbourne") ||
    loc.includes("queensland")
  ) {
    return { symbol: "A$", code: "AUD", icon: DollarSign };
  }
  if (
    loc.includes("uae") ||
    loc.includes("dubai") ||
    loc.includes("abu dhabi") ||
    loc.includes("aed") ||
    loc.includes("emirates")
  ) {
    return { symbol: "AED ", code: "AED", icon: Coins };
  }
  if (
    loc.includes("brazil") ||
    loc.includes("brl") ||
    loc.includes("r$") ||
    loc.includes("sao paulo")
  ) {
    return { symbol: "R$", code: "BRL", icon: Coins };
  }
  if (
    loc.includes("south africa") ||
    loc.includes("zar") ||
    loc.includes("rand") ||
    loc.includes("cape town")
  ) {
    return { symbol: "R ", code: "ZAR", icon: Coins };
  }

  return { symbol: "$", code: "USD", icon: DollarSign };
};

export const getFormattedFees = (fees: string, location: string): string => {
  if (!fees) return "N/A";

  // Clean potential artifact formatting from fees like "₹ 1.5 Lakhs USD"
  const currencyInfo = getCurrencyForLocation(location);
  let cleanedFees = fees.trim();

  if (currencyInfo.symbol !== "$") {
    // If the fee contains '$' but location currency is NOT '$', swap it
    if (cleanedFees.includes("$")) {
      cleanedFees = cleanedFees.replace(/\$/g, currencyInfo.symbol);
    } else if (
      !cleanedFees.includes(currencyInfo.symbol) &&
      !cleanedFees.toLowerCase().includes(currencyInfo.code.toLowerCase())
    ) {
      cleanedFees = `${currencyInfo.symbol}${cleanedFees}`;
    }
  } else {
    // Correct dollar sign prefix
    if (
      !cleanedFees.includes("$") &&
      !cleanedFees.toLowerCase().includes("usd") &&
      !cleanedFees.includes("C$") &&
      !cleanedFees.includes("A$") &&
      !cleanedFees.includes("S$")
    ) {
      cleanedFees = `$${cleanedFees}`;
    }
  }

  return cleanedFees;
};

// --- Work-Study & Co-Op Viability Score Helper ---
const getCoopViability = (college: College) => {
  if (college.coopScore && college.coopDetails) {
    return {
      score: college.coopScore,
      details: college.coopDetails,
    };
  }

  // Deterministic generator based on Name hash
  let hash = 0;
  for (let i = 0; i < college.name.length; i++) {
    hash = college.name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const score = Math.abs(hash % 26) + 73; // score between 73 and 98

  // Determine location context
  const currencyInfo = getCurrencyForLocation(college.location);
  const currency = currencyInfo.symbol;

  // Scale rates based on currency context
  const rateScale =
    currency === "₹"
      ? 80
      : currency === "¥"
        ? 150
        : currency === "€"
          ? 0.9
          : currency === "£"
            ? 0.8
            : 1;
  const fmt = (val: number) => {
    const scaled = Math.round(val * rateScale);
    return `${currency}${scaled.toLocaleString()}`;
  };
  const fmtHr = (val: number) => {
    const scaled = Math.round(val * (currency === "₹" ? 30 : rateScale)); // INR student hr rate around ₹400-500
    return `${currency}${scaled.toLocaleString()}`;
  };

  // Custom presets
  let campusEmployment = `Abundant TA/RA positions and department service roles starting from ${fmtHr(14.5)} to ${fmtHr(21.0)} per hour (capped at 20 hr/wk).`;
  let coOpInternships = `Alternating standard internship pipelines with typical earnings of ${fmt(9500)} - ${fmt(14000)} per academic off-term.`;
  let industryPartnerships =
    "Close hiring ties with 80+ companies spanning metropolitan technology and business agencies.";
  let loanOffsetEstimate = `${fmt(11200)}/yr`;

  if (college.name.toLowerCase().includes("waterloo")) {
    campusEmployment = `Premium technical project assistants, tutoring services, and department web admins paying ${fmtHr(18)}-${fmtHr(26)}/hr.`;
    coOpInternships = `World-famous Waterloo Cooperative System: 4-6 mandatory alternating terms. Median earnings average ${fmt(18500)}/term.`;
    industryPartnerships =
      "Tied directly with Silicon Valley magnets (Google, Apple, Microsoft) and local tech incubators.";
    loanOffsetEstimate = `${fmt(22000)}/yr`;
  } else if (
    college.name.toLowerCase().includes("drexel") ||
    college.name.toLowerCase().includes("northeastern")
  ) {
    campusEmployment = `Extensive tutoring, academic advising, and administrative roles paying ${fmtHr(16)}-${fmtHr(22)}/hr.`;
    coOpInternships = `Structured Drexel or Northeastern style co-op semesters. Standard full-time co-op compensation of ${fmt(16200)}/term.`;
    industryPartnerships =
      "Tied to 1,500+ active partner employers spanning engineering, bio-tech, finance, and software.";
    loanOffsetEstimate = `${fmt(18500)}/yr`;
  } else if (score > 90) {
    campusEmployment = `Highly competitive research assistantships and campus tutoring labs paying up to ${fmtHr(24.5)}/hr.`;
    coOpInternships = `Industry-sponsored full-time autumn/summer internships with average pay of ${fmt(15800)}/placement.`;
    industryPartnerships =
      "Premier Tier-1 corporate partners who host on-site mock interviews, exclusive recruitment events, and research fellowships.";
    loanOffsetEstimate = `${fmt(15400)}/yr`;
  } else if (score > 80) {
    campusEmployment = `Campus helpdesks, lab monitors, and administrative support roles paying ${fmtHr(15.5)}-${fmtHr(18.0)}/hr.`;
    coOpInternships = `Supported 3-to-6 month winter/summer work integrations earning a median of ${fmt(12500)}.`;
    industryPartnerships =
      "Active recruitment channels with major local employers and regional branch enterprises.";
    loanOffsetEstimate = `${fmt(12800)}/yr`;
  }

  return {
    score,
    details: {
      campusEmployment,
      coOpInternships,
      industryPartnerships,
      loanOffsetEstimate,
    },
  };
};

// --- Cost of Living Index Helpers ---
const getColOffsetIndex = (college: College) => {
  if (college.colIndex !== undefined && college.colDetails) {
    return {
      index: college.colIndex,
      details: college.colDetails,
    };
  }

  // Deterministic generator using string hashing
  let hash = 0;
  for (let i = 0; i < college.name.length; i++) {
    hash = college.name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const currencyInfo = getCurrencyForLocation(college.location);
  const currency = currencyInfo.symbol;
  const rateScale =
    currency === "₹"
      ? 80
      : currency === "¥"
        ? 150
        : currency === "€"
          ? 0.9
          : currency === "£"
            ? 0.8
            : 1;
  const fmt = (val: number) => {
    const scaled = Math.round(val * rateScale);
    return `${currency}${scaled.toLocaleString()}/yr`;
  };

  let index = Math.abs(hash % 91) + 80; // Cost of Living Index from 80 to 170

  // Standard high cost override scenarios
  const loc = college.location.toLowerCase();
  const name = college.name.toLowerCase();
  if (
    loc.includes("london") ||
    loc.includes("new york") ||
    loc.includes("san francisco") ||
    loc.includes("boston") ||
    loc.includes("tokyo") ||
    loc.includes("singapore") ||
    loc.includes("bay area") ||
    name.includes("nyu") ||
    name.includes("columbia") ||
    name.includes("harvard") ||
    name.includes("mit") ||
    name.includes("imperial") ||
    name.includes("ucl")
  ) {
    index = Math.abs(hash % 20) + 160; // 160 - 180
  } else if (
    loc.includes("chicago") ||
    loc.includes("los angeles") ||
    loc.includes("paris") ||
    loc.includes("sydney") ||
    loc.includes("toronto") ||
    name.includes("berkeley") ||
    name.includes("vancouver")
  ) {
    index = Math.abs(hash % 20) + 130; // 130 - 150
  }

  let livingContext = "Moderate Cost Suburban Area";
  if (index >= 150) {
    livingContext = "Ultra-High Cost Metropolitan Center";
  } else if (index >= 120) {
    livingContext = "High Cost Urban Transit Zone";
  } else if (index < 95) {
    livingContext = "Affordable College Town Hub";
  }

  // Calculate realistic indices
  const rentIndex = Math.round(index * 1.15); // rents are typically more volatile
  const grocIndex = Math.round(index * 0.95);
  const transitIndex = Math.round(index * 0.9);

  // Annual Estimates
  let annRent = 12000;
  if (index >= 150) annRent = 18500;
  else if (index >= 120) annRent = 14200;
  else if (index < 95) annRent = 8500;

  let annTotal = Math.round(annRent + 4500 * (grocIndex / 100));

  return {
    index,
    details: {
      rentIndex,
      grocIndex,
      transitIndex,
      annualEstRent: fmt(annRent),
      annualEstTotalCOL: fmt(annTotal),
      livingContext,
    },
  };
};

// --- Alumni Placement & Industry Recruit Clusters Data ---
const getAlumniPlacement = (college: College) => {
  if (college.alumniPipeline) {
    return college.alumniPipeline;
  }

  // Fallback generation
  let hash = 0;
  for (let i = 0; i < college.name.length; i++) {
    hash = college.name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const name = college.name.toLowerCase();

  let industrySectors = [
    { sector: "Software & Technology", percentage: 35 },
    { sector: "Engineering & Hardware", percentage: 25 },
    { sector: "Finance & Consulting", percentage: 15 },
    { sector: "Research & Academia", percentage: 15 },
    { sector: "Other Sectors", percentage: 10 },
  ];

  let topEmployers = ["Google", "Microsoft", "Meta", "Amazon", "Deloitte"];
  let topRegions = ["Silicon Valley", "New York City", "Seattle"];
  let overview =
    "Graduates from this institution heavily feed global tech superpowers and local enterprise sectors.";

  if (
    name.includes("mit") ||
    name.includes("stanford") ||
    name.includes("berkeley") ||
    name.includes("carnegie") ||
    name.includes("caltech")
  ) {
    industrySectors = [
      { sector: "Software & Technology", percentage: 65 },
      { sector: "Engineering & Hardware", percentage: 18 },
      { sector: "Research & Deep Tech", percentage: 10 },
      { sector: "Finance & Fintech", percentage: 5 },
      { sector: "Other Sectors", percentage: 2 },
    ];
    topEmployers = ["NVIDIA", "OpenAI", "Google DeepMind", "Apple", "Stripe"];
    topRegions = ["Silicon Valley", "San Francisco", "Seattle / Austin"];
    overview =
      "A premier global feeder to pioneering AI research labs, semiconductor giants, and early-stage venture pipelines.";
  } else if (
    name.includes("oxford") ||
    name.includes("cambridge") ||
    name.includes("lse") ||
    name.includes("columbia") ||
    name.includes("harvard") ||
    name.includes("wharton") ||
    name.includes("nyu")
  ) {
    industrySectors = [
      { sector: "Finance & Investment Banking", percentage: 40 },
      { sector: "Management Consulting", percentage: 25 },
      { sector: "Software & AI Tech", percentage: 18 },
      { sector: "Legal & Public Policy", percentage: 12 },
      { sector: "Other Sectors", percentage: 5 },
    ];
    topEmployers = [
      "Goldman Sachs",
      "McKinsey & Co",
      "J.P. Morgan",
      "BlackRock",
      "Google",
    ];
    topRegions = ["London", "New York City", "continental Europe"];
    overview =
      "Exceptional institutional presence across elite investment banking, financial consulting, and policy research institutes.";
  } else if (
    name.includes("waterloo") ||
    name.includes("toronto") ||
    name.includes("british columbia")
  ) {
    industrySectors = [
      { sector: "Software & Technology", percentage: 48 },
      { sector: "Engineering & Hardware", percentage: 22 },
      { sector: "Finance & Fintech", percentage: 15 },
      { sector: "Renewable Energy & Mining", percentage: 10 },
      { sector: "Other Sectors", percentage: 5 },
    ];
    topEmployers = [
      "Shopify",
      "Amazon",
      "Royal Bank of Canada",
      "Microsoft",
      "Intel",
    ];
    topRegions = ["Toronto Metro", "Silicon Valley", "Vancouver Hub"];
    overview =
      "A powerhouse of co-op execution, leading directly to immediate technical roles across North America.";
  } else {
    const sectors = [
      "Software & Technology",
      "Engineering & Industry",
      "Finance & Corporate Services",
      "Bio-Tech & Healthcare",
      "Education, Arts & Research",
    ];

    const val1 = 30 + Math.abs(hash % 15);
    const val2 = 20 + Math.abs((hash >> 2) % 10);
    const val3 = 15 + Math.abs((hash >> 4) % 10);
    const remainder = 100 - (val1 + val2 + val3);
    const val4 = Math.max(1, Math.round(remainder * 0.6));
    const val5 = Math.max(1, remainder - val4);

    industrySectors = [
      { sector: sectors[0], percentage: val1 },
      { sector: sectors[1], percentage: val2 },
      { sector: sectors[2], percentage: val3 },
      { sector: sectors[3], percentage: val4 },
      { sector: sectors[4], percentage: val5 },
    ];

    const companies = [
      "Microsoft",
      "Amazon",
      "Accenture",
      "Google",
      "PwC",
      "Siemens",
      "General Electric",
      "Tesla",
      "Intel",
      "IBM",
      "Pfizer",
      "Cisco",
      "Ernst & Young",
      "Morgan Stanley",
    ];

    const regions = [
      "Silicon Valley",
      "New York",
      "Chicago Zone",
      "London Metro",
      "Toronto",
      "Tokyo Tech Ring",
      "Sydney Harbor Hub",
      "Austin Tech Center",
      "Boston Biotech Cluster",
    ];

    const picker1 = Math.abs(hash) % companies.length;
    const picker2 = (Math.abs(hash) + 2) % companies.length;
    const picker3 = (Math.abs(hash) + 4) % companies.length;
    const picker4 = (Math.abs(hash) + 6) % companies.length;

    topEmployers = [
      companies[picker1],
      companies[
        picker2 === picker1 ? (picker2 + 1) % companies.length : picker2
      ],
      companies[
        picker3 === picker2 || picker3 === picker1
          ? (picker3 + 2) % companies.length
          : picker3
      ],
      companies[
        picker4 === picker3 || picker4 === picker2 || picker4 === picker1
          ? picker4 + 3
          : picker4
      ],
    ].map((name) => (typeof name === "string" ? name : "Local Enterprise"));

    const rPicker1 = Math.abs(hash) % regions.length;
    const rPicker2 = (Math.abs(hash) + 3) % regions.length;
    topRegions = [
      regions[rPicker1],
      regions[
        rPicker2 === rPicker1 ? (rPicker2 + 1) % regions.length : rPicker2
      ],
    ];

    overview = `Strong employment linkages with the regional ${regions[rPicker1]} job market, driven heavily by engineering and technology innovation partnerships.`;
  }

  return {
    industrySectors,
    topEmployers,
    topRegions,
    overview,
  };
};

// --- Geolocation & Proximity Helpers ---

export const getDeterministicCoordinates = (location: string, name: string) => {
  const loc = location.toLowerCase();

  if (
    loc.includes("boston") ||
    loc.includes("massachusetts") ||
    loc.includes("cambridge, ma") ||
    loc.includes("mit") ||
    loc.includes("harvard")
  ) {
    return { lat: 42.3601, lng: -71.0589, name: "Boston & Cambridge, MA" };
  }
  if (
    loc.includes("new york") ||
    loc.includes("nyu") ||
    loc.includes("columbia") ||
    loc.includes("manhattan") ||
    loc.includes("cornell")
  ) {
    return { lat: 40.7128, lng: -74.006, name: "New York City, NY" };
  }
  if (
    loc.includes("san francisco") ||
    loc.includes("stanford") ||
    loc.includes("berkeley") ||
    loc.includes("bay area") ||
    loc.includes("california") ||
    loc.includes("la")
  ) {
    return { lat: 37.7749, lng: -122.4194, name: "San Francisco Bay Area, CA" };
  }
  if (
    loc.includes("london") ||
    loc.includes("oxford") ||
    loc.includes("cambridge, uk") ||
    loc.includes("united kingdom") ||
    loc.includes("england") ||
    loc.includes("imperial")
  ) {
    return { lat: 51.5074, lng: -0.1278, name: "London & Oxford, UK" };
  }
  if (
    loc.includes("chennai") ||
    loc.includes("madras") ||
    loc.includes("tamil nadu")
  ) {
    return { lat: 13.0827, lng: 80.2707, name: "Chennai, Tamil Nadu" };
  }
  if (
    loc.includes("mumbai") ||
    loc.includes("bombay") ||
    loc.includes("maharashtra") ||
    loc.includes("iitb")
  ) {
    return { lat: 19.076, lng: 72.8777, name: "Mumbai, Maharashtra" };
  }
  if (
    loc.includes("delhi") ||
    loc.includes("ncr") ||
    loc.includes("kanpur") ||
    loc.includes("kharagpur") ||
    loc.includes("roorkee")
  ) {
    return { lat: 28.6139, lng: 77.209, name: "New Delhi & North India" };
  }
  if (
    loc.includes("bangalore") ||
    loc.includes("bengaluru") ||
    loc.includes("karnataka") ||
    loc.includes("iisc")
  ) {
    return { lat: 12.9716, lng: 77.5946, name: "Bengaluru, Karnataka" };
  }
  if (
    loc.includes("toronto") ||
    loc.includes("waterloo") ||
    loc.includes("ontario") ||
    loc.includes("canada") ||
    loc.includes("mcgill")
  ) {
    return { lat: 43.6532, lng: -79.3832, name: "Toronto & Ontario Hub" };
  }
  if (
    loc.includes("sydney") ||
    loc.includes("australia") ||
    loc.includes("melbourne")
  ) {
    return { lat: -33.8688, lng: 151.2093, name: "Sydney, Australia" };
  }
  if (loc.includes("singapore")) {
    return { lat: 1.3521, lng: 103.8198, name: "Singapore" };
  }
  if (loc.includes("tokyo") || loc.includes("japan")) {
    return { lat: 35.6762, lng: 139.6503, name: "Tokyo, Japan" };
  }

  // Deterministic hash fallback distributed over geographical areas
  let hash = 0;
  for (let i = 0; i < location.length; i++) {
    hash = location.charCodeAt(i) + ((hash << 5) - hash);
  }
  const seed = Math.abs(hash);
  const lat = 20 + (seed % 25);
  const lng = -110 + (seed % 60);
  return { lat, lng, name: location };
};

export const getHaversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// --- Smart Autocomplete Dicts ---

export interface SuggestionItem {
  text: string;
  label: string;
  category: string;
}

export const FIELD_SUGGESTIONS: SuggestionItem[] = [
  { text: "Computer Science", label: "CSE", category: "Tech & Engineering" },
  {
    text: "Artificial Intelligence",
    label: "AI/ML",
    category: "Tech & Engineering",
  },
  {
    text: "Data Science",
    label: "Data Analytics",
    category: "Tech & Engineering",
  },
  { text: "Cybersecurity", label: "InfoSec", category: "Tech & Engineering" },
  {
    text: "Software Engineering",
    label: "SWE",
    category: "Tech & Engineering",
  },
  {
    text: "MBA",
    label: "Business Administration",
    category: "Management & Econ",
  },
  {
    text: "Finance",
    label: "Quantitative Trading",
    category: "Management & Econ",
  },
  {
    text: "Economics",
    label: "Strategic Consulting",
    category: "Management & Econ",
  },
  { text: "Medicine", label: "MBBS & Pre-med", category: "Life Sciences" },
  { text: "Biotechnology", label: "Bioinformatics", category: "Life Sciences" },
  {
    text: "Mechanical Engineering",
    label: "Mechanical",
    category: "Traditional Core",
  },
  {
    text: "Electrical Engineering",
    label: "ECE",
    category: "Traditional Core",
  },
  { text: "UI/UX Design", label: "Product Design", category: "Art & Media" },
  {
    text: "Fashion Commerce",
    label: "Fashion Design",
    category: "Art & Media",
  },
];

export const CAREER_SUGGESTIONS: SuggestionItem[] = [
  {
    text: "Google",
    label: "Google Recruiter placement",
    category: "Tech Magnets",
  },
  { text: "Meta", label: "Meta Systems Engineering", category: "Tech Magnets" },
  {
    text: "Apple",
    label: "Apple Hardware & Software",
    category: "Tech Magnets",
  },
  {
    text: "Goldman Sachs",
    label: "Goldman Sachs Finance Group",
    category: "Investment Banks",
  },
  {
    text: "McKinsey",
    label: "McKinsey Strategy Advisor",
    category: "Management Consulting",
  },
  {
    text: "Tesla",
    label: "Tesla Autopilot Systems",
    category: "Applied Robotics",
  },
  {
    text: "NVIDIA",
    label: "NVIDIA AI Scaling Architecture",
    category: "Tech Magnets",
  },
  {
    text: "OpenAI",
    label: "OpenAI Large Model Systems",
    category: "AI Pioneers",
  },
  {
    text: "JPMorgan Chase",
    label: "JPMorgan Chase Financial Analysis",
    category: "Investment Banks",
  },
  {
    text: "Microsoft",
    label: "Microsoft Windows & Azure",
    category: "Tech Magnets",
  },
  {
    text: "Amazon",
    label: "Amazon Retail & AWS Tech",
    category: "Tech Magnets",
  },
];

// --- Helper Components ---

const TabButton = ({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
}) => (
  <button
    onClick={onClick}
    className={`pb-4 px-6 flex items-center font-bold text-sm transition-all border-b-4 whitespace-nowrap ${
      active
        ? "border-cyan-500 text-cyan-600 dark:text-cyan-400"
        : "border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
    }`}
  >
    <Icon className={`w-4 h-4 mr-2 ${active ? "animate-bounce" : ""}`} />
    {label}
  </button>
);

const DetailItem = ({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
}) => (
  <div className="flex items-start p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
    <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-900 mr-3 ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 line-clamp-2">
        {value}
      </p>
    </div>
  </div>
);

interface CollegeCardProps {
  college: College;
  isExpanded: boolean;
  onToggle: () => void;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  isTarget: boolean;
  onSetTarget: () => void;
  completedMilestones: string[];
  onToggleMilestone: (milestoneId: string) => void;
  allColleges?: College[];
  onSelectCollegeName?: (name: string) => void;
  highlightedEmployer?: string;
  isSaved?: boolean;
  onToggleSave?: (e: React.MouseEvent) => void;
}

const CollegeCard: React.FC<CollegeCardProps> = ({
  college,
  isExpanded,
  onToggle,
  isSelected,
  onSelect,
  isTarget,
  onSetTarget,
  completedMilestones,
  onToggleMilestone,
  allColleges,
  onSelectCollegeName,
  highlightedEmployer,
  isSaved = false,
  onToggleSave,
}) => {
  const cardId = `college-card-${college.name.replace(/\s+/g, "-").toLowerCase()}`;

  // Compute whether this college matches the career goal employer
  const isEmployerTarget = useMemo(() => {
    if (!highlightedEmployer) return false;
    const q = highlightedEmployer.toLowerCase();

    // Match topEmployers or description or name
    const matchName = college.name.toLowerCase().includes(q);
    const matchDesc = college.description.toLowerCase().includes(q);

    let matchAlumni = false;
    if (college.alumniPipeline && college.alumniPipeline.topEmployers) {
      matchAlumni = college.alumniPipeline.topEmployers.some((emp: string) =>
        emp.toLowerCase().includes(q),
      );
    } else {
      // Also search fallback keys if standard property is not loaded or missing
      const alumniKey = "alumniPipeline";
      const details = (college as any)[alumniKey];
      if (details && details.topEmployers) {
        matchAlumni = details.topEmployers.some((emp: string) =>
          emp.toLowerCase().includes(q),
        );
      }
    }
    return matchName || matchDesc || matchAlumni;
  }, [college, highlightedEmployer]);

  const similarColleges = useMemo(() => {
    if (!allColleges || allColleges.length <= 1) return [];
    const others = allColleges.filter((c) => c.name !== college.name);

    const scoredOthers = others.map((other) => {
      let score = 0;

      // Geographic match
      if (other.location.toLowerCase() === college.location.toLowerCase()) {
        score += 4;
      } else if (
        other.location.split(",")[1]?.trim().toLowerCase() ===
        college.location.split(",")[1]?.trim().toLowerCase()
      ) {
        score += 2;
      }

      // Standard Exam overlap
      const overlapExams = other.exams.filter((ex) =>
        college.exams.includes(ex),
      );
      score += overlapExams.length * 1.5;

      // Placement alignment overlap
      const thisPlace = parseInt(college.placements) || 80;
      const otherPlace = parseInt(other.placements) || 80;
      if (Math.abs(thisPlace - otherPlace) <= 5) {
        score += 2;
      }

      // Popular course subject overlap
      if (college.courses && other.courses) {
        const overlapCourses = other.courses.filter((c) =>
          college.courses.includes(c),
        );
        score += overlapCourses.length * 1.2;
      }

      return { college: other, score };
    });

    return scoredOthers
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((x) => x.college);
  }, [allColleges, college]);

  return (
    <div
      id={cardId}
      className={`bg-white dark:bg-gray-800 rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all group ${isSelected ? "border-cyan-500 ring-2 ring-cyan-500/20" : "border-gray-100 dark:border-gray-700"}`}
    >
      {/* Card Header */}
      <div
        className="p-6 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative"
        onClick={onToggle}
      >
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-1 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-xs font-extrabold rounded-lg uppercase tracking-wide">
              {college.ranking.includes("#") ||
              college.ranking.toLowerCase().includes("rank")
                ? college.ranking
                : `Rank ${college.ranking}`}
            </span>
            <span className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-450 text-xs font-extrabold rounded-lg uppercase tracking-wide flex items-center gap-1">
              ★{" "}
              {(
                4.9 -
                ((parseInt(college.ranking.replace(/\D/g, "")) || 20) % 15) *
                  0.1
              ).toFixed(1)}{" "}
              Overall
            </span>
            <span className="flex items-center text-gray-500 dark:text-gray-400 text-xs font-bold mr-2">
              <MapPin className="w-3.5 h-3.5 mr-1" /> {college.location}
            </span>
            {isTarget && (
              <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold rounded-lg uppercase tracking-wider flex items-center gap-1 border border-emerald-100 dark:border-emerald-900 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{" "}
                Active Target
              </span>
            )}
            {isEmployerTarget && highlightedEmployer && (
              <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 text-[10px] font-extrabold rounded-lg uppercase tracking-wider flex items-center gap-1 border border-amber-200 dark:border-amber-900">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />{" "}
                Prime pipeline partner for {highlightedEmployer}
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white font-brand group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
            {college.name}
          </h3>
          <p
            className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-1 font-medium"
            title={college.description}
          >
            {college.description}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleSave) onToggleSave(e);
            }}
            className={`p-2.5 rounded-xl transition-colors flex items-center gap-2 text-sm font-bold ${isSaved ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 hover:bg-rose-100/70" : "bg-gray-105 dark:bg-gray-700/80 text-gray-650 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"}`}
            title={isSaved ? "Saved" : "Save to Shortlist"}
          >
            <Heart
              className={`w-4 h-4 ${isSaved ? "fill-rose-500 text-rose-500" : "text-gray-400 dark:text-gray-300"}`}
            />
            <span className="hidden sm:inline">
              {isSaved ? "Saved" : "Save"}
            </span>
          </button>
          <button
            onClick={onSelect}
            className={`p-2.5 rounded-xl transition-colors flex items-center gap-2 text-sm font-bold ${isSelected ? "bg-cyan-600 text-white hover:bg-cyan-700" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"}`}
            title="Compare"
          >
            {isSelected ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
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
          <div
            className={`p-2 text-gray-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
          >
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
            <DetailItem
              icon={getCurrencyForLocation(college.location).icon || DollarSign}
              label="Annual Fees"
              value={getFormattedFees(college.fees, college.location)}
              color="text-green-600"
            />
            <DetailItem
              icon={Briefcase}
              label="Placements"
              value={college.placements}
              color="text-blue-600"
            />
            <DetailItem
              icon={TrendingUp}
              label="ROI"
              value={college.roi}
              color="text-purple-600"
            />
            <DetailItem
              icon={FileCheck}
              label="Entrance Exams"
              value={college.exams.join(", ")}
              color="text-orange-600"
            />
            <DetailItem
              icon={GraduationCap}
              label="Cutoffs"
              value={college.cutoffs}
              color="text-red-600"
            />
            <DetailItem
              icon={Trophy}
              label="Eligibility"
              value={college.eligibility}
              color="text-indigo-600"
            />
          </div>

          {/* Interactive Application Tracker, Co-Op, COL, & Alumni Section */}
          {(() => {
            const coopInfo = getCoopViability(college);
            const colInfo = getColOffsetIndex(college);
            const alumniInfo = getAlumniPlacement(college);
            const milestonesList = getCollegeMilestones(college);
            const completedCount = completedMilestones.length;
            const totalMilestones = milestonesList.length;
            const progressPercent = Math.round(
              (completedCount / totalMilestones) * 100,
            );
            const isAllDone = completedCount === totalMilestones;

            return (
              <div className="space-y-6 mt-8">
                {/* Row 1: Tracker & Co-Op */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Column 1: Application Tracker */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-cyan-50 dark:bg-cyan-950 rounded-lg text-cyan-500">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                              Application Planner
                            </h4>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                              Track your application pre-requisites
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 text-[10px] uppercase font-black rounded-lg ${
                            isAllDone
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                              : "bg-gray-50 dark:bg-gray-800 text-gray-500"
                          }`}
                        >
                          {completedCount} / {totalMilestones} Completed
                        </span>
                      </div>

                      {/* Process Bar */}
                      <div className="mb-5">
                        <div className="h-2 w-full bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden relative">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isAllDone
                                ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md shadow-emerald-500/20"
                                : "bg-gradient-to-r from-cyan-500 to-blue-500"
                            }`}
                            style={{ width: `${progressPercent}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center mt-1.5">
                          <span className="text-[10px] text-gray-400 font-bold">
                            {progressPercent}% Completed
                          </span>
                          {isAllDone && (
                            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                              <Sparkles className="w-3 h-3 animate-spin" />{" "}
                              Ready to Apply!
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Checklist Items */}
                      <div className="space-y-2.5">
                        {milestonesList.map((item) => {
                          const isChecked = completedMilestones.includes(
                            item.id,
                          );
                          return (
                            <label
                              key={item.id}
                              onClick={(e) => e.stopPropagation()}
                              className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                                isChecked
                                  ? "bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-500/30 dark:border-emerald-500/10 text-gray-800 dark:text-gray-200"
                                  : "bg-gray-50/50 dark:bg-gray-900/10 border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/10"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => onToggleMilestone(item.id)}
                                className="sr-only"
                              />
                              <div className="mt-0.5">
                                {isChecked ? (
                                  <div className="w-4 h-4 rounded-md bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-3 w-3"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth="3"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  </div>
                                ) : (
                                  <div className="w-4 h-4 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-805"></div>
                                )}
                              </div>
                              <span className="text-xs font-semibold leading-relaxed flex-1 min-w-0 break-words text-left">
                                {item.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {isAllDone && (
                      <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-bold animate-in zoom-in-95 duration-200">
                        <Award className="w-5 h-5 text-emerald-500 flex-shrink-0 animate-bounce" />
                        <span>
                          Awesome! Application planner is 100% draft-complete.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Column 2: Co-Op & Work-Study Metrics */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-5">
                        <div>
                          <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                            Earnability & Work-Study
                          </h4>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                            Alternative to high-interest student loans
                          </p>
                        </div>

                        <div className="relative flex flex-col items-end">
                          <div className="flex items-baseline gap-1 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/50 dark:to-teal-950/50 border border-emerald-500/20 dark:border-emerald-500/10 px-3 py-1 rounded-2xl">
                            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                              {coopInfo.score}
                            </span>
                            <span className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase">
                              Index
                            </span>
                          </div>
                          <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-1">
                            Viability Score
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3.5">
                        <div className="flex items-start gap-3">
                          <div className="p-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg text-gray-500 dark:text-gray-400 mt-0.5 shrink-0">
                            <Briefcase className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="text-[11px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                              On-Campus Payroll
                            </h5>
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-0.5 leading-relaxed">
                              {coopInfo.details.campusEmployment}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="p-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg text-teal-600 dark:text-teal-400 mt-0.5 shrink-0">
                            <TrendingUp className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="text-[11px] font-black uppercase text-teal-600 dark:text-teal-400 tracking-wider">
                              Co-Op & Internships
                            </h5>
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-0.5 leading-relaxed">
                              {coopInfo.details.coOpInternships}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="p-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg text-indigo-505 mt-0.5 shrink-0">
                            <Globe className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="text-[11px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                              Local Employer Surcharges
                            </h5>
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-0.5 leading-relaxed">
                              {coopInfo.details.industryPartnerships}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-emerald-500/[0.04] dark:bg-emerald-950/[0.15] border border-emerald-500/10 dark:border-emerald-500/5 rounded-2xl flex items-center justify-between gap-3">
                      <div>
                        <h5 className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest leading-none">
                          Est. Loan Principal Offsets
                        </h5>
                        <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mt-1">
                          Saves loan interest compound principal over 4 years.
                        </p>
                      </div>
                      <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400 whitespace-nowrap bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        {coopInfo.details.loanOffsetEstimate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Row 2: Regional Cost of Living Index & Alumni Pipeline Recruit Clusters */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Column 1: Regional Cost of Living Offset Index */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-5">
                        <div>
                          <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                            Cost of Living Offset Index
                          </h4>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                            Localized student housing & CPI premium
                          </p>
                        </div>

                        <div className="relative flex flex-col items-end">
                          <div
                            className={`flex items-baseline gap-1 px-3 py-1 rounded-2xl border ${
                              colInfo.index >= 140
                                ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                                : colInfo.index >= 110
                                  ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            <span className="text-sm font-black font-mono">
                              {colInfo.index}
                            </span>
                            <span className="text-[9px] font-black uppercase">
                              Points
                            </span>
                          </div>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            Regional CPI
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Comparative indicators */}
                        <div>
                          <div className="flex justify-between text-[11px] font-bold text-gray-400 dark:text-gray-500 mb-1">
                            <span>
                              Rent Index: {colInfo.details.rentIndex}% of
                              baseline
                            </span>
                            <span>Housing Cost</span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                colInfo.details.rentIndex >= 150
                                  ? "bg-rose-500"
                                  : colInfo.details.rentIndex >= 115
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                              }`}
                              style={{
                                width: `${Math.min(100, colInfo.details.rentIndex / 2)}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] font-bold text-gray-400 dark:text-gray-500 mb-1">
                            <span>
                              Groceries CPI: {colInfo.details.grocIndex}% of
                              baseline
                            </span>
                            <span>Food & Provisions</span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                colInfo.details.grocIndex >= 140
                                  ? "bg-rose-500"
                                  : colInfo.details.grocIndex >= 110
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                              }`}
                              style={{
                                width: `${Math.min(100, colInfo.details.grocIndex / 2)}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] font-bold text-gray-400 dark:text-gray-500 mb-1">
                            <span>
                              Local Transit: {colInfo.details.transitIndex}% of
                              baseline
                            </span>
                            <span>Off-Campus Commutes</span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                colInfo.details.transitIndex >= 145
                                  ? "bg-rose-500"
                                  : colInfo.details.transitIndex >= 110
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                              }`}
                              style={{
                                width: `${Math.min(100, colInfo.details.transitIndex / 2)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold leading-relaxed">
                          Context:{" "}
                          <span className="font-extrabold text-gray-800 dark:text-gray-200">
                            {colInfo.details.livingContext}
                          </span>
                          . Local cost margins can significantly influence
                          yearly debt levels.
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-amber-500/[0.04] dark:bg-amber-950/[0.15] border border-amber-500/10 dark:border-amber-500/5 rounded-2xl flex items-center justify-between gap-3">
                      <div>
                        <h5 className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-widest leading-none">
                          Est. Annual Room & Board
                        </h5>
                        <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 mt-1">
                          Average cost of typical student housing.
                        </p>
                      </div>
                      <span className="text-sm font-black font-mono text-amber-600 dark:text-amber-400 whitespace-nowrap bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-900">
                        {colInfo.details.annualEstTotalCOL}
                      </span>
                    </div>
                  </div>

                  {/* Column 2: Career Placement and Alumni Pipeline */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-5">
                        <div>
                          <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                            Alumni Recruit Pipeline
                          </h4>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                            Bridges college directly back to active careers
                          </p>
                        </div>

                        <div className="relative flex flex-col items-end">
                          <div className="flex items-baseline gap-1 bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 dark:from-cyan-950/50 dark:to-indigo-950/50 border border-cyan-500/20 dark:border-cyan-500/10 px-3 py-1 rounded-2xl">
                            <span className="text-[9px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
                              Industry Ties
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Industry Sectors Breakdown */}
                      <div className="space-y-3 mb-5">
                        <h5 className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest leading-none">
                          Graduate Hires by Sector
                        </h5>
                        <div className="space-y-2">
                          {alumniInfo.industrySectors.map((sec, sIdx) => (
                            <div key={sIdx} className="space-y-1">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-gray-700 dark:text-gray-300">
                                  {sec.sector}
                                </span>
                                <span className="font-bold text-cyan-650 dark:text-cyan-400 font-mono">
                                  {sec.percentage}%
                                </span>
                              </div>
                              <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-950 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-500"
                                  style={{ width: `${sec.percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Top Recruiter Employers */}
                      <div className="mb-4 space-y-2">
                        <h5 className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest leading-none">
                          Primary Hiring Hubs & Clusters
                        </h5>
                        <div className="flex flex-wrap gap-1.5">
                          {alumniInfo.topEmployers
                            .slice(0, 4)
                            .map((emp, eIdx) => (
                              <span
                                key={eIdx}
                                className="text-[10px] font-extrabold uppercase px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900 rounded-lg"
                              >
                                {emp}
                              </span>
                            ))}
                        </div>
                      </div>

                      {/* Relocation Clusters */}
                      <div className="space-y-2">
                        <h5 className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest leading-none">
                          Main Relocation Cities
                        </h5>
                        <div className="flex flex-wrap gap-1.5">
                          {alumniInfo.topRegions.map((reg, rIdx) => (
                            <span
                              key={rIdx}
                              className="text-[10px] font-extrabold uppercase px-2.5 py-1 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-750 dark:text-cyan-300 border border-cyan-100 dark:border-cyan-900 rounded-lg flex items-center gap-1"
                            >
                              <MapPin className="w-3 h-3 text-cyan-500" />
                              {reg}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 p-3 bg-cyan-500/[0.04] dark:bg-cyan-950/[0.15] border border-cyan-500/10 dark:border-cyan-500/5 rounded-2xl">
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold leading-relaxed">
                        <span className="font-extrabold text-cyan-600 dark:text-cyan-400">
                          Industry Proof:
                        </span>{" "}
                        {alumniInfo.overview}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {college.courses && college.courses.length > 0 && (
            <div className="mt-8">
              <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Popular Courses
              </h4>
              <div className="flex flex-wrap gap-2">
                {college.courses.map((course, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300"
                  >
                    {course}
                  </span>
                ))}
              </div>
            </div>
          )}

          {similarColleges.length > 0 && onSelectCollegeName && (
            <div className="mt-8 border-t border-gray-150 dark:border-gray-700 pt-6">
              <h4 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
                Students who saved/viewed this also looked at
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {similarColleges.map((sim, simIdx) => (
                  <div
                    key={simIdx}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCollegeName(sim.name);
                    }}
                    className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-3.5 rounded-xl cursor-pointer hover:border-cyan-500 hover:ring-2 hover:ring-cyan-500/10 transition-all text-left flex flex-col justify-between group/sim h-full"
                  >
                    <div>
                      <span className="text-[9px] font-black uppercase text-cyan-600 dark:text-cyan-400 bg-cyan-100/50 dark:bg-cyan-950/45 px-2 py-0.5 rounded-md border border-cyan-100/30 dark:border-cyan-900/40 font-mono">
                        Rank {sim.ranking}
                      </span>
                      <h5 className="text-xs font-extrabold text-gray-900 dark:text-white mt-2 group-hover/sim:text-cyan-600 dark:group-hover/sim:text-cyan-400 line-clamp-2 transition-colors duration-150">
                        {sim.name}
                      </h5>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                        <MapPin className="w-2.5 h-2.5 mr-0.5 text-gray-400" />{" "}
                        {sim.location}
                      </p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-gray-150 dark:border-gray-800/80 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center justify-between">
                      <span>Placements:</span>
                      <span className="text-cyan-600 dark:text-cyan-400 font-mono font-black">
                        {sim.placements}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-250 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center text-sm gap-4">
            <div className="flex items-center text-gray-600 dark:text-gray-400 font-medium">
              <Phone className="w-4 h-4 mr-2" />
              <span>Contact: {college.contact}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSetTarget();
                }}
                className={`px-6 py-2.5 font-bold rounded-xl transition flex items-center gap-2 text-xs md:text-sm ${
                  isTarget
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100 dark:shadow-none"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                <Link2 className="w-4 h-4" />
                {isTarget ? "Linked as ROI Target" : "Link to ROI Runway"}
              </button>
              <a
                href={college.website}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-2.5 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 transition flex items-center text-xs md:text-sm shadow-lg shadow-cyan-100 dark:shadow-none"
              >
                Visit Official Website <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </div>
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
  targetCollegeName: string | null;
  onSetTargetCollege: (college: College) => void;
  completedMilestones: Record<string, string[]>;
  onToggleMilestone: (collegeName: string, milestoneId: string) => void;
  highlightedEmployer?: string;
  savedCollegeNames?: string[];
  onToggleSave?: (college: College) => void;
}

const CollegeList: React.FC<CollegeListProps> = ({
  colleges,
  expandedId,
  onToggle,
  selectedIds,
  onSelect,
  targetCollegeName,
  onSetTargetCollege,
  completedMilestones,
  onToggleMilestone,
  highlightedEmployer,
  savedCollegeNames = [],
  onToggleSave,
}) => {
  const [visibleCount, setVisibleCount] = useState(6);

  if (!colleges || colleges.length === 0) {
    return (
      <div className="text-center text-gray-500 py-16 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
        <Search className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
        <p className="font-medium">No colleges found matching your criteria.</p>
      </div>
    );
  }

  const pagedColleges = colleges.slice(0, visibleCount);

  return (
    <div className="space-y-4">
      {pagedColleges.map((college, index) => (
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
          isTarget={targetCollegeName === college.name}
          onSetTarget={() => onSetTargetCollege(college)}
          completedMilestones={completedMilestones[college.name] || []}
          onToggleMilestone={(milestoneId) =>
            onToggleMilestone(college.name, milestoneId)
          }
          allColleges={colleges}
          highlightedEmployer={highlightedEmployer}
          isSaved={savedCollegeNames.includes(college.name)}
          onToggleSave={(e) => {
            e.stopPropagation();
            if (onToggleSave) onToggleSave(college);
          }}
          onSelectCollegeName={(name) => {
            if (onToggle) {
              onToggle(name);
              setTimeout(() => {
                const targetId = `college-card-${name.replace(/\s+/g, "-").toLowerCase()}`;
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                  targetElement.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                    inline: "nearest"
                  });
                }
              }, 200);
            }
          }}
        />
      ))}

      {colleges.length > visibleCount && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => setVisibleCount((prev) => prev + 10)}
            className="px-6 py-3 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:hover:bg-cyan-900/40 dark:text-cyan-400 text-xs font-black uppercase tracking-wider rounded-2xl transition-all duration-200 flex items-center gap-2 border border-cyan-100 dark:border-cyan-900"
          >
            <ChevronDown className="w-4 h-4 animate-bounce" />
            Show More Colleges (showing {visibleCount} of {colleges.length})
          </button>
        </div>
      )}
    </div>
  );
};

interface ComparisonModalProps {
  colleges: College[];
  onClose: () => void;
}

const ComparisonModal: React.FC<ComparisonModalProps> = ({
  colleges,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 sticky top-0 z-10">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Scale className="w-6 h-6 mr-3 text-cyan-600" /> Compare Colleges
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="overflow-auto p-6 bg-gray-50 dark:bg-gray-950">
          <div className="min-w-[800px] bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-5 border-b dark:border-gray-800 w-48 bg-gray-50 dark:bg-gray-800/50 font-bold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">
                    Feature
                  </th>
                  {colleges.map((c, i) => (
                    <th
                      key={i}
                      className="p-5 border-b dark:border-gray-800 align-top min-w-[200px]"
                    >
                      <div className="text-lg font-bold text-gray-900 dark:text-white mb-1 font-brand">
                        {c.name}
                      </div>
                      <div className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded w-fit">
                        {c.location}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                <tr>
                  <td className="p-5 font-bold text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/20">
                    Ranking
                  </td>
                  {colleges.map((c, i) => (
                    <td
                      key={i}
                      className="p-5 text-gray-900 dark:text-gray-200 font-bold text-cyan-600 dark:text-cyan-400"
                    >
                      {c.ranking}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-5 font-bold text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/20">
                    Fees
                  </td>
                  {colleges.map((c, i) => (
                    <td
                      key={i}
                      className="p-5 text-gray-900 dark:text-gray-200"
                    >
                      {getFormattedFees(c.fees, c.location)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-5 font-bold text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/20">
                    Placements
                  </td>
                  {colleges.map((c, i) => (
                    <td
                      key={i}
                      className="p-5 text-gray-900 dark:text-gray-200"
                    >
                      {c.placements}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-5 font-bold text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/20">
                    ROI
                  </td>
                  {colleges.map((c, i) => (
                    <td
                      key={i}
                      className="p-5 text-gray-900 dark:text-gray-200"
                    >
                      {c.roi}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-5 font-bold text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/20">
                    Exams
                  </td>
                  {colleges.map((c, i) => (
                    <td
                      key={i}
                      className="p-5 text-gray-900 dark:text-gray-200"
                    >
                      {c.exams.join(", ")}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-5 font-bold text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/20">
                    Cutoffs
                  </td>
                  {colleges.map((c, i) => (
                    <td
                      key={i}
                      className="p-5 text-gray-900 dark:text-gray-200"
                    >
                      {c.cutoffs}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-5 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/[0.02] dark:bg-emerald-950/[0.05]">
                    Work-Study Viability
                  </td>
                  {colleges.map((c, i) => {
                    const coop = getCoopViability(c);
                    return (
                      <td
                        key={i}
                        className="p-5 font-bold text-emerald-650 dark:text-emerald-400"
                      >
                        <span className="font-mono text-sm px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900">
                          {coop.score}/100
                        </span>
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="p-5 font-bold text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/20">
                    Est. Loan Offset
                  </td>
                  {colleges.map((c, i) => {
                    const coop = getCoopViability(c);
                    return (
                      <td
                        key={i}
                        className="p-5 text-gray-900 dark:text-gray-200 font-mono font-bold"
                      >
                        {coop.details.loanOffsetEstimate}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PersonalizedCollegeCardProps {
  college: PersonalizedCollege;
  isExpanded: boolean;
  onToggle: () => void;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  isTarget: boolean;
  onSetTarget: () => void;
  completedMilestones: string[];
  onToggleMilestone: (milestoneId: string) => void;
  allColleges?: College[];
  onSelectCollegeName?: (name: string) => void;
  highlightedEmployer?: string;
  isSaved?: boolean;
  onToggleSave?: (e: React.MouseEvent) => void;
}

const PersonalizedCollegeCard: React.FC<PersonalizedCollegeCardProps> = ({
  college,
  isExpanded,
  onToggle,
  isSelected,
  onSelect,
  isTarget,
  onSetTarget,
  completedMilestones,
  onToggleMilestone,
  allColleges,
  onSelectCollegeName,
  highlightedEmployer,
  isSaved = false,
  onToggleSave,
}) => {
  return (
    <div
      id={`personalized-college-card-${college.name.replace(/\s+/g, "-").toLowerCase()}`}
      className={`border rounded-3xl overflow-hidden bg-white dark:bg-gray-800 transition shadow-sm ${
        isExpanded
          ? "border-amber-400 dark:border-amber-600 ring-4 ring-amber-500/10"
          : "border-gray-250 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-700"
      }`}
    >
      {/* Header Click Area */}
      <div
        className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
        onClick={onToggle}
      >
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1">
              <Trophy className="w-3 h-3 text-cyan-500" />
              Ranking {college.ranking}
            </span>
            {college.institutionType && (
              <span className="bg-cyan-50 dark:bg-cyan-950/45 text-cyan-800 dark:text-cyan-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-cyan-150 dark:border-cyan-900/50 uppercase tracking-wide">
                {college.institutionType}
              </span>
            )}
            <span className="bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-rose-150 dark:border-rose-900/40 uppercase tracking-wide">
              ★ {(college.overallRating || 4.7).toFixed(1)} Overall
            </span>
            <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-200 dark:border-amber-900/50 uppercase tracking-wide">
              <Sparkles className="w-2.5 h-2.5 text-amber-500 animate-pulse" />{" "}
              {college.fitScore}% Fit Match
            </span>
          </div>

          <h3 className="text-xl font-black text-gray-950 dark:text-white font-brand flex items-center flex-wrap gap-2">
            {college.name}
          </h3>

          <p className="text-xs text-gray-500 dark:text-gray-405 flex items-center mt-1">
            <MapPin className="w-3.5 h-3.5 mr-1 text-red-500" />
            {college.location}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleSave) onToggleSave(e);
            }}
            className={`p-2.5 rounded-xl border transition ${
              isSaved
                ? "bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900/50"
                : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            title={isSaved ? "Saved" : "Save / Shortlist college"}
          >
            <Heart
              className={`w-4 h-4 ${isSaved ? "fill-rose-500 text-rose-500" : "text-gray-405 dark:text-gray-500"}`}
            />
          </button>

          <button
            onClick={onSelect}
            className={`p-2.5 rounded-xl border transition ${
              isSelected
                ? "bg-cyan-600 border-cyan-600 text-white"
                : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-650 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            title="Add to Comparison"
          >
            <Scale className="w-4 h-4" />
          </button>

          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* Standard Description with Personal Match Bullet Points */}
      <div className="px-6 pb-6 border-b border-gray-50 dark:border-gray-900">
        <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm leading-relaxed">
          {college.description}
        </p>

        {/* Personal Match Reasons bullet items */}
        <div className="mt-4 bg-emerald-50/40 dark:bg-emerald-950/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
          <h4 className="text-xs font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
            Personal Best-Fit Reasons:
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 list-none">
            {college.fitReasons?.map((reason, idx) => (
              <li
                key={idx}
                className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2 font-medium leading-relaxed"
              >
                <span className="text-emerald-600 dark:text-emerald-400 select-none font-bold">
                  ✓
                </span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Expanded Content Details */}
      {isExpanded && (
        <div className="p-6 bg-gray-50/50 dark:bg-gray-900/20 space-y-6 animate-in slide-in-from-top-2 duration-200">
          {/* Bento Grid layouts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tab-styled detail: Scholarships */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="p-2 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-lg">
                    <Award className="w-4 h-4" />
                  </span>
                  <h4 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Scholarships Tailored for You
                  </h4>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-semibold">
                  {college.scholarshipOpportunities}
                </p>
              </div>
            </div>

            {/* Tab-styled detail: Hostel & Housing */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="p-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <Building2 className="w-4 h-4" />
                  </span>
                  <h4 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Hostel & Housing Facilities
                  </h4>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-semibold">
                  {college.hostelFacilities}
                </p>
              </div>
            </div>

            {/* Tab-styled detail: Campus Vibe */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="p-2 bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 rounded-lg">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <h4 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Campus Atmosphere & Vibe
                  </h4>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-semibold">
                  {college.campusLifeDetails}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <DetailItem
              icon={getCurrencyForLocation(college.location).icon || DollarSign}
              label="Annual Fees"
              value={getFormattedFees(college.fees, college.location)}
              color="text-green-600"
            />
            <DetailItem
              icon={Briefcase}
              label="Placements"
              value={college.placements || "Excellent placements profile"}
              color="text-blue-600"
            />
            <DetailItem
              icon={TrendingUp}
              label="ROI"
              value={college.roi || "High Value"}
              color="text-purple-600"
            />
            <DetailItem
              icon={FileCheck}
              label="Entrance Exams"
              value={
                college.exams && college.exams.length > 0
                  ? college.exams.join(", ")
                  : "None Needed"
              }
              color="text-orange-600"
            />
            <DetailItem
              icon={GraduationCap}
              label="Cutoffs"
              value={college.cutoffs || "Flexible cutoffs"}
              color="text-red-600"
            />
            <DetailItem
              icon={Trophy}
              label="Eligibility"
              value={college.eligibility || "Standard academic background"}
              color="text-indigo-600"
            />
          </div>

          {/* Standard Application Tracker, Co-Op, COL, & Alumni Pipeline rendering logic */}
          {(() => {
            const coopInfo = getCoopViability(college);
            const colInfo = getColOffsetIndex(college);
            const alumniInfo = getAlumniPlacement(college);
            const milestonesList = getCollegeMilestones(college);
            const completedCount = completedMilestones.length;
            const totalMilestones = milestonesList.length;
            const progressPercent = Math.round(
              (completedCount / totalMilestones) * 100,
            );

            return (
              <div className="space-y-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                {/* Row 1: Tracker & Co-Op */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Application Tracker Progress */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700/80 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                        Procedural Application Milestones
                      </h4>
                      <span className="text-xs font-black font-mono text-cyan-600 bg-cyan-50 dark:bg-cyan-950/20 px-2.5 py-1 rounded-lg">
                        {progressPercent}% Complete
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-950 h-2 rounded-full overflow-hidden mb-6">
                      <div
                        className="bg-cyan-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
                      {milestonesList.map((item) => {
                        const done = completedMilestones.includes(item.id);
                        return (
                          <div
                            key={item.id}
                            onClick={() => onToggleMilestone(item.id)}
                            className={`p-3 rounded-xl border cursor-pointer select-none flex items-start gap-3 transition min-w-0 ${
                              done
                                ? "bg-emerald-50/50 dark:bg-emerald-950/5 border-emerald-500/30 text-gray-800 dark:text-gray-200"
                                : "bg-gray-50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900"
                            }`}
                          >
                            {done ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                            )}
                            <span className="text-xs font-medium leading-relaxed flex-1 min-w-0 break-words text-left">
                              {item.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Co-Op Employability Insights */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700/80 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                          Co-Op & In-Study Viability
                        </h4>
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${
                            coopInfo.score >= 80
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400"
                          }`}
                        >
                          Score: {coopInfo.score}/100
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-3 rounded-xl">
                          <div className="text-[10px] font-bold text-gray-400 uppercase">
                            Campus Employment
                          </div>
                          <div className="text-xs font-bold dark:text-white mt-1">
                            {coopInfo.details.campusEmployment}
                          </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-3 rounded-xl">
                          <div className="text-[10px] font-bold text-gray-400 uppercase">
                            Co-Op Work Internships
                          </div>
                          <div className="text-xs font-bold dark:text-white mt-1">
                            {coopInfo.details.coOpInternships}
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-cyan-50/50 dark:bg-cyan-950/10 border border-cyan-100/50 dark:border-cyan-900/20 rounded-xl mb-4">
                        <div className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase">
                          Industry Ties & Placement Pipelines
                        </div>
                        <div className="text-xs text-gray-700 dark:text-gray-300 font-medium mt-1">
                          {coopInfo.details.industryPartnerships}
                        </div>
                      </div>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-3.5 rounded-2xl flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-emerald-850 dark:text-emerald-400 uppercase tracking-wider">
                          Est. Annual Loan Offset Opportunity
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                          Part-time job & co-op offset potential
                        </p>
                      </div>
                      <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                        {coopInfo.details.loanOffsetEstimate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Row 2: COL and Alumni Pipeline */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Cost of Living Multi-Index */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700/80 shadow-sm flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">
                        Cost of Living Multi-Index (COLI)
                      </h4>
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-150 p-3 rounded-xl text-center">
                          <div className="text-[10px] font-black text-gray-400 uppercase border-gray-200 dark:border-gray-800">
                            Rent Index
                          </div>
                          <div className="text-lg font-black text-cyan-600 mt-1 font-mono">
                            {colInfo.details.rentIndex}
                          </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-150 p-3 rounded-xl text-center">
                          <div className="text-[10px] font-black text-gray-400 uppercase border-gray-200 dark:border-gray-800">
                            Groceries
                          </div>
                          <div className="text-lg font-black text-blue-600 mt-1 font-mono">
                            {colInfo.details.grocIndex}
                          </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-150 p-3 rounded-xl text-center">
                          <div className="text-[10px] font-black text-gray-400 uppercase border-gray-200 dark:border-gray-800">
                            Transit
                          </div>
                          <div className="text-lg font-black text-purple-600 mt-1 font-mono">
                            {colInfo.details.transitIndex}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed bg-gray-50/50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-855">
                        {colInfo.details.livingContext}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6 border-t border-gray-150 dark:border-gray-700 pt-4">
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase">
                          Est. Annual Shared Rent
                        </div>
                        <div className="text-sm font-bold text-gray-800 dark:text-gray-200 font-mono mt-0.5">
                          {colInfo.details.annualEstRent}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase border-l border-gray-100 dark:border-gray-800 pl-4">
                          Total Avg Expense (COL)
                        </div>
                        <div className="text-sm font-bold text-cyan-600 dark:text-cyan-400 font-mono mt-0.5 border-l border-gray-100 dark:border-gray-800 pl-4">
                          {colInfo.details.annualEstTotalCOL}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Career & Alumni Pipeline */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700/80 shadow-sm">
                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">
                      Post-Graduate Alumni Placement
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Sectors Distribution */}
                      <div className="space-y-3">
                        <div className="text-[10px] font-black text-gray-400 uppercase mb-2">
                          Industry Sector Splits
                        </div>
                        {alumniInfo.industrySectors.map((sec, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                              <span className="truncate max-w-[120px]">
                                {sec.sector}
                              </span>
                              <span className="font-mono">
                                {sec.percentage}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-900 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-orange-500 rounded-full"
                                style={{ width: `${sec.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Top Recruiter Details */}
                      <div className="space-y-4">
                        <div>
                          <div className="text-[10px] font-black text-gray-400 uppercase mb-1.5">
                            Primary Employers
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {alumniInfo.topEmployers.map((emp, i) => {
                              const isMatch =
                                highlightedEmployer &&
                                emp
                                  .toLowerCase()
                                  .includes(highlightedEmployer.toLowerCase());
                              return (
                                <span
                                  key={i}
                                  className={`text-[10px] font-black px-2.5 py-1 rounded-lg transition-all duration-300 ${
                                    isMatch
                                      ? "bg-amber-500 text-white animate-bounce"
                                      : "bg-gray-100 dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800 text-gray-805 dark:text-gray-200"
                                  }`}
                                >
                                  {emp}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-gray-400 uppercase mb-1">
                            Regional Hotspots
                          </div>
                          <div className="text-xs font-bold text-gray-700 dark:text-gray-300 leading-relaxed truncate">
                            {alumniInfo.topRegions.join(", ")}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-5 pt-3 border-t border-gray-100 dark:border-gray-700 font-medium">
                      {alumniInfo.overview}
                    </p>
                  </div>
                </div>

                {/* External Links Row */}
                <div className="pt-4 border-t border-gray-150 dark:border-gray-800 flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetTarget();
                      }}
                      className={`px-6 py-2.5 font-bold rounded-xl transition flex items-center gap-2 text-xs md:text-sm ${
                        isTarget
                          ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100 dark:shadow-none"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-650"
                      }`}
                    >
                      <Link2 className="w-4 h-4" />
                      {isTarget ? "Linked as ROI Target" : "Link to ROI Runway"}
                    </button>
                    <a
                      href={college.website}
                      target="_blank"
                      rel="noreferrer"
                      className="px-6 py-2.5 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 transition flex items-center text-xs md:text-sm shadow-lg shadow-cyan-100 dark:shadow-none"
                    >
                      Visit Official Website{" "}
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

interface PersonalizedCollegeListProps {
  colleges: PersonalizedCollege[];
  expandedId: string | null;
  onToggle: (id: string) => void;
  selectedIds: string[];
  onSelect: (college: College) => void;
  targetCollegeName: string | null;
  onSetTargetCollege: (college: College) => void;
  completedMilestones: Record<string, string[]>;
  onToggleMilestone: (collegeName: string, milestoneId: string) => void;
  savedCollegeNames?: string[];
  onToggleSave?: (college: College) => void;
}

const PersonalizedCollegeList: React.FC<PersonalizedCollegeListProps> = ({
  colleges,
  expandedId,
  onToggle,
  selectedIds,
  onSelect,
  targetCollegeName,
  onSetTargetCollege,
  completedMilestones,
  onToggleMilestone,
  savedCollegeNames = [],
  onToggleSave,
}) => {
  const [visibleCount, setVisibleCount] = useState(6);

  if (!colleges || colleges.length === 0) {
    return (
      <div className="text-center text-gray-500 py-16 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
        <Sparkles className="w-12 h-12 mx-auto mb-4 text-amber-500 animate-pulse" />
        <p className="font-bold text-gray-700 dark:text-white">
          Begin your Personalized Fit Search
        </p>
        <p className="text-xs text-gray-500 max-w-md mx-auto mt-2 leading-relaxed">
          Fill out your subject interests, past scores, entrance exams, and
          budget choices above to unlock a bespoke matched portfolio with exact
          fit scores.
        </p>
      </div>
    );
  }

  const pagedColleges = colleges.slice(0, visibleCount);

  return (
    <div className="space-y-4">
      {pagedColleges.map((college, index) => (
        <PersonalizedCollegeCard
          key={index}
          college={college}
          isExpanded={expandedId === college.name}
          onToggle={() => onToggle(college.name)}
          isSelected={selectedIds.includes(college.name)}
          onSelect={(e) => {
            e.stopPropagation();
            onSelect(college);
          }}
          isTarget={targetCollegeName === college.name}
          onSetTarget={() => onSetTargetCollege(college)}
          completedMilestones={completedMilestones[college.name] || []}
          onToggleMilestone={(milestoneId) =>
            onToggleMilestone(college.name, milestoneId)
          }
          isSaved={savedCollegeNames.includes(college.name)}
          onToggleSave={(e) => {
            e.stopPropagation();
            if (onToggleSave) onToggleSave(college);
          }}
        />
      ))}

      {colleges.length > visibleCount && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => setVisibleCount((prev) => prev + 10)}
            className="px-6 py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 dark:text-amber-400 text-xs font-black uppercase tracking-wider rounded-2xl transition-all duration-200 flex items-center gap-2 border border-amber-100 dark:border-amber-900"
          >
            <ChevronDown className="w-4 h-4 animate-bounce" />
            Show More Perfect Fit (showing {visibleCount} of {colleges.length})
          </button>
        </div>
      )}
    </div>
  );
};

// --- Main Component ---

export const CollegeFinder: React.FC<CollegeFinderProps> = ({
  onComplete,
  existingResult,
  country,
}) => {
  const [field, setField] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CollegeResult | null>(existingResult);
  const [activeTab, setActiveTab] = useState<"domestic" | "foreign">(
    "domestic",
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Discovery & Search Enhancements
  const [searchMode, setSearchMode] = useState<
    "field" | "career" | "personalized" | "saved"
  >("field");
  const [careerGoal, setCareerGoal] = useState("");
  const [showAutoComplete, setShowAutoComplete] = useState(false);
  const [showCareerAutoComplete, setShowCareerAutoComplete] = useState(false);

  // Personalized Questionnaire States
  const [personalField, setPersonalField] = useState("");
  const [personalLevel, setPersonalLevel] = useState<"UG" | "PG" | "PhD">("UG");
  const [personalAcademics, setPersonalAcademics] = useState("");
  const [personalExams, setPersonalExams] = useState<string[]>([]);
  const [personalScores, setPersonalScores] = useState("");
  
  const [personalBudget, setPersonalBudget] = useState(() => {
    return localStorage.getItem("pathfinder_personal_budget") || "";
  });
  
  const [personalScholarship, setPersonalScholarship] = useState<
    "High" | "Medium" | "Low"
  >("Medium");
  
  const [personalCampuses, setPersonalCampuses] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("pathfinder_personal_campuses");
      return stored ? JSON.parse(stored) : ["Research Centric", "Urban / City Hub"];
    } catch {
      return ["Research Centric", "Urban / City Hub"];
    }
  });
  
  const [personalHostel, setPersonalHostel] = useState<boolean>(true);
  
  const [personalLocation, setPersonalLocation] = useState(() => {
    return localStorage.getItem("pathfinder_personal_location") || country || "";
  });
  
  const [personalMattersMost, setPersonalMattersMost] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("pathfinder_personal_matters_most");
      return stored ? JSON.parse(stored) : ["Placements", "High ROI"];
    } catch {
      return ["Placements", "High ROI"];
    }
  });
  
  const [personalInstitutionTypes, setPersonalInstitutionTypes] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("pathfinder_personal_institution_types");
      return stored ? JSON.parse(stored) : ["Public University", "Private University"];
    } catch {
      return ["Public University", "Private University"];
    }
  });
  
  const [personalRankingPreference, setPersonalRankingPreference] = useState<
    | "QS World"
    | "Times Higher Education"
    | "US News"
    | "NIRF / Domestic"
    | "No preference"
  >(() => {
    const stored = localStorage.getItem("pathfinder_personal_ranking_preference");
    return (stored as any) || "No preference";
  });
  
  const [personalPreferences, setPersonalPreferences] = useState(() => {
    return localStorage.getItem("pathfinder_personal_preferences") || "";
  });

  // Keep questionnaire states synchronized across storage
  useEffect(() => {
    localStorage.setItem("pathfinder_personal_campuses", JSON.stringify(personalCampuses));
    window.dispatchEvent(new Event("storage"));
  }, [personalCampuses]);

  useEffect(() => {
    localStorage.setItem("pathfinder_personal_matters_most", JSON.stringify(personalMattersMost));
    window.dispatchEvent(new Event("storage"));
  }, [personalMattersMost]);

  useEffect(() => {
    localStorage.setItem("pathfinder_personal_institution_types", JSON.stringify(personalInstitutionTypes));
    window.dispatchEvent(new Event("storage"));
  }, [personalInstitutionTypes]);

  useEffect(() => {
    localStorage.setItem("pathfinder_personal_ranking_preference", personalRankingPreference);
    window.dispatchEvent(new Event("storage"));
  }, [personalRankingPreference]);

  useEffect(() => {
    localStorage.setItem("pathfinder_personal_preferences", personalPreferences);
    window.dispatchEvent(new Event("storage"));
  }, [personalPreferences]);

  useEffect(() => {
    localStorage.setItem("pathfinder_personal_location", personalLocation);
    window.dispatchEvent(new Event("storage"));
  }, [personalLocation]);

  useEffect(() => {
    localStorage.setItem("pathfinder_personal_budget", personalBudget);
    window.dispatchEvent(new Event("storage"));
  }, [personalBudget]);

  // Saved / Marked Colleges state persisted in localStorage
  const [savedColleges, setSavedColleges] = useState<College[]>(() => {
    try {
      const stored = localStorage.getItem("pathfinder_saved_colleges");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const handleSaveCollege = (college: College) => {
    let updated;
    const isSaved = savedColleges.some((c) => c.name === college.name);
    if (isSaved) {
      updated = savedColleges.filter((c) => c.name !== college.name);
    } else {
      updated = [...savedColleges, college];
    }
    setSavedColleges(updated);
    localStorage.setItem("pathfinder_saved_colleges", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("pathfinder_saved_colleges_changed"));
  };

  // Personalized Match result state
  const [personalizedResult, setPersonalizedResult] =
    useState<PersonalizedCollegeResult | null>(null);
  const [personalizedLoading, setPersonalizedLoading] = useState(false);
  const [personalizedActiveTab, setPersonalizedActiveTab] = useState<
    "domestic" | "foreign"
  >("domestic");
  const [personalizedExpandedId, setPersonalizedExpandedId] = useState<
    string | null
  >(null);

  // Maps & Location Filtering State
  const [selectedCityAnchor, setSelectedCityAnchor] = useState<string>("All");
  const [maxDistanceKm, setMaxDistanceKm] = useState<string>("All");
  const [mapViewEnabled, setMapViewEnabled] = useState<boolean>(false);

  // Comparison State
  const [selectedColleges, setSelectedColleges] = useState<College[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // ROI Target College Sync State
  const [targetCollege, setTargetCollege] = useState<string | null>(null);

  // Milestones State
  const [milestones, setMilestones] = useState<Record<string, string[]>>(() => {
    try {
      const stored = localStorage.getItem("pathfinder_college_milestones");
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.error(e);
      return {};
    }
  });

  const handleToggleMilestone = (collegeName: string, milestoneId: string) => {
    setMilestones((prev) => {
      const current = prev[collegeName] || [];
      const updated = current.includes(milestoneId)
        ? current.filter((id) => id !== milestoneId)
        : [...current, milestoneId];
      const next = { ...prev, [collegeName]: updated };
      localStorage.setItem(
        "pathfinder_college_milestones",
        JSON.stringify(next),
      );
      return next;
    });
  };

  useEffect(() => {
    const val = localStorage.getItem("pathfinder_roi_target_college");
    if (val) {
      try {
        const parsed = JSON.parse(val);
        setTargetCollege(parsed.name);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSetTargetCollege = (college: College) => {
    if (targetCollege === college.name) {
      localStorage.removeItem("pathfinder_roi_target_college");
      setTargetCollege(null);
    } else {
      localStorage.setItem(
        "pathfinder_roi_target_college",
        JSON.stringify(college),
      );
      setTargetCollege(college.name);
    }
    // Emit storage event so other components sync instantly
    window.dispatchEvent(new Event("storage"));
  };

  // Filters
  const [filterRanking, setFilterRanking] = useState<string>("All");
  const [filterLocation, setFilterLocation] = useState<string>("All");
  const [filterExam, setFilterExam] = useState<string>("All");
  const [filterCourse, setFilterCourse] = useState<string>("All");
  const [filterPlacement, setFilterPlacement] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Reset filters when tab changes or new search performed
  useEffect(() => {
    setFilterRanking("All");
    setFilterLocation("All");
    setFilterExam("All");
    setFilterCourse("All");
    setFilterPlacement(0);
    setSearchQuery("");
  }, [activeTab, result]);

  const handleSearch = async () => {
    const activeField = field.trim() || "Computer Science";
    const queryField =
      searchMode === "career" && careerGoal.trim()
        ? `targeting recruitment pipeline into ${careerGoal.trim()} (specifically for ${activeField})`
        : activeField;

    if (!queryField) return;
    setLoading(true);
    setExpandedId(null);
    setSelectedColleges([]);
    try {
      const data = await findColleges(queryField, country);
      setResult(data);
      onComplete(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalizedSearch = async () => {
    const activeField = personalField.trim() || "Computer Science";
    setPersonalizedLoading(true);
    setPersonalizedExpandedId(null);
    try {
      const data = await findCollegesPersonalized({
        fieldOfStudy: activeField,
        studyLevel: personalLevel,
        academicsGrade: personalAcademics || "Competitive standard grades",
        entranceExamsChecked: personalExams,
        entranceScores: personalScores || "Competitive standard scores",
        annualBudget: personalBudget || "Any / Open Budget",
        scholarshipNeeded: personalScholarship,
        campusLifePreferences: personalCampuses,
        hostelNeeded: personalHostel,
        locationPreference: personalLocation || country || "Domestic",
        mattersMostPriorities: personalMattersMost,
        institutionTypes: personalInstitutionTypes,
        rankingPreference: personalRankingPreference,
        personalPreferences: personalPreferences,
      });
      if (data) {
        setPersonalizedResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPersonalizedLoading(false);
    }
  };

  const toggleExpand = (name: string) => {
    setExpandedId(expandedId === name ? null : name);
  };

  const toggleSelection = (college: College) => {
    if (selectedColleges.find((c) => c.name === college.name)) {
      setSelectedColleges(
        selectedColleges.filter((c) => c.name !== college.name),
      );
    } else {
      if (selectedColleges.length < 3) {
        setSelectedColleges([...selectedColleges, college]);
      } else {
        // Optionally show toast "Max 3 colleges"
      }
    }
  };

  const currentList =
    activeTab === "domestic" ? result?.domestic : result?.foreign;

  const uniqueLocations = useMemo(() => {
    if (!currentList) return [];
    const locs = new Set(currentList.map((c) => c.location));
    return Array.from(locs).sort();
  }, [currentList]);

  const uniqueExams = useMemo(() => {
    if (!currentList) return [];
    const exams = new Set(currentList.flatMap((c) => c.exams));
    return Array.from(exams).sort();
  }, [currentList]);

  const uniqueCourses = useMemo(() => {
    if (!currentList) return [];
    const courses = new Set(currentList.flatMap((c) => c.courses || []));
    return Array.from(courses).sort();
  }, [currentList]);

  const getPlacementPercentage = (text: string): number => {
    const match = text.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 0;
  };

  const filteredList = useMemo(() => {
    if (!currentList) return [];

    let filtered = currentList.filter((college) => {
      // Ranking Filter (Top N)
      if (filterRanking !== "All") {
        const limit = parseInt(filterRanking);
        const index = currentList.indexOf(college);
        if (index >= limit) return false;
      }

      // Location Filter
      if (filterLocation !== "All" && college.location !== filterLocation) {
        return false;
      }

      // Exam Filter
      if (filterExam !== "All" && !college.exams.includes(filterExam)) {
        return false;
      }

      // Course Filter
      if (
        filterCourse !== "All" &&
        (!college.courses || !college.courses.includes(filterCourse))
      ) {
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

      // Proximity & Geolocation Filter
      if (selectedCityAnchor !== "All" && maxDistanceKm !== "All") {
        const anchorMap: Record<string, { lat: number; lng: number }> = {
          boston: { lat: 42.3601, lng: -71.0589 },
          newyork: { lat: 40.7128, lng: -74.006 },
          bayarea: { lat: 37.7749, lng: -122.4194 },
          london: { lat: 51.5074, lng: -0.1278 },
          chennai: { lat: 13.0827, lng: 80.2707 },
          mumbai: { lat: 19.076, lng: 72.8777 },
          delhi: { lat: 28.6139, lng: 77.209 },
          bangalore: { lat: 12.9716, lng: 77.5946 },
          toronto: { lat: 43.6532, lng: -79.3832 },
          sydney: { lat: -33.8688, lng: 151.2093 },
          singapore: { lat: 1.3521, lng: 103.8198 },
          tokyo: { lat: 35.6762, lng: 139.6503 },
        };
        const coords = anchorMap[selectedCityAnchor];
        if (coords) {
          const collegeCoords = getDeterministicCoordinates(
            college.location,
            college.name,
          );
          const dist = getHaversineDistance(
            coords.lat,
            coords.lng,
            collegeCoords.lat,
            collegeCoords.lng,
          );
          const maxDist = parseFloat(maxDistanceKm);
          if (dist > maxDist) return false;
        }
      }

      return true;
    });

    // Distance sorting
    if (selectedCityAnchor !== "All") {
      const anchorMap: Record<string, { lat: number; lng: number }> = {
        boston: { lat: 42.3601, lng: -71.0589 },
        newyork: { lat: 40.7128, lng: -74.006 },
        bayarea: { lat: 37.7749, lng: -122.4194 },
        london: { lat: 51.5074, lng: -0.1278 },
        chennai: { lat: 13.0827, lng: 80.2707 },
        mumbai: { lat: 19.076, lng: 72.8777 },
        delhi: { lat: 28.6139, lng: 77.209 },
        bangalore: { lat: 12.9716, lng: 77.5946 },
        toronto: { lat: 43.6532, lng: -79.3832 },
        sydney: { lat: -33.8688, lng: 151.2093 },
        singapore: { lat: 1.3521, lng: 103.8198 },
        tokyo: { lat: 35.6762, lng: 139.6503 },
      };
      const coords = anchorMap[selectedCityAnchor];
      if (coords) {
        return [...filtered].sort((a, b) => {
          const coordsA = getDeterministicCoordinates(a.location, a.name);
          const coordsB = getDeterministicCoordinates(b.location, b.name);
          const distA = getHaversineDistance(
            coords.lat,
            coords.lng,
            coordsA.lat,
            coordsA.lng,
          );
          const distB = getHaversineDistance(
            coords.lat,
            coords.lng,
            coordsB.lat,
            coordsB.lng,
          );
          return distA - distB;
        });
      }
    }

    return filtered;
  }, [
    currentList,
    filterRanking,
    filterLocation,
    filterExam,
    filterCourse,
    filterPlacement,
    searchQuery,
    selectedCityAnchor,
    maxDistanceKm,
  ]);

  const clearFilters = () => {
    setFilterRanking("All");
    setFilterLocation("All");
    setFilterExam("All");
    setFilterCourse("All");
    setFilterPlacement(0);
    setSearchQuery("");
    setSelectedCityAnchor("All");
    setMaxDistanceKm("All");
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
          <p className="text-cyan-100 mt-2 text-lg">
            Top institutions in <span className="font-bold">{country}</span> and
            abroad tailored to you.
          </p>
        </div>
      </div>

      {/* Tabs for Search Methods */}
      <div className="flex space-x-1 p-1 bg-gray-100 dark:bg-gray-800/85 rounded-2xl max-w-sm md:max-w-2xl mb-4 border border-gray-200/50 dark:border-gray-700/50">
        <button
          onClick={() => {
            setSearchMode("field");
            setShowAutoComplete(false);
            setShowCareerAutoComplete(false);
          }}
          className={`flex-1 py-1.5 px-2 md:py-2 md:px-3 font-bold text-[11px] md:text-xs rounded-xl transition flex items-center justify-center gap-1.5 ${
            searchMode === "field"
              ? "bg-cyan-600 text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          By Field
        </button>
        <button
          onClick={() => {
            setSearchMode("career");
            setShowAutoComplete(false);
            setShowCareerAutoComplete(false);
          }}
          className={`flex-1 py-1.5 px-2 md:py-2 md:px-3 font-bold text-[11px] md:text-xs rounded-xl transition flex items-center justify-center gap-1.5 ${
            searchMode === "career"
              ? "bg-cyan-600 text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          By Career Goal
        </button>
        <button
          onClick={() => {
            setSearchMode("personalized");
            setShowAutoComplete(false);
            setShowCareerAutoComplete(false);
          }}
          className={`flex-1 py-1.5 px-2 md:py-2 md:px-3 font-bold text-[11px] md:text-xs rounded-xl transition flex items-center justify-center gap-1.5 ${
            searchMode === "personalized"
              ? "bg-amber-600 text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          Personalized Fit
        </button>
        <button
          onClick={() => {
            setSearchMode("saved");
            setShowAutoComplete(false);
            setShowCareerAutoComplete(false);
          }}
          className={`flex-1 py-1.5 px-2 md:py-2 md:px-3 font-bold text-[11px] md:text-xs rounded-xl transition flex items-center justify-center gap-1.5 ${
            searchMode === "saved"
              ? "bg-rose-600 text-white shadow-sm shadow-rose-100/30"
              : "text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400"
          }`}
        >
          <Heart
            className={`w-3.5 h-3.5 ${searchMode === "saved" ? "fill-white text-white" : "text-rose-500 fill-rose-500"}`}
          />
          Saved ({savedColleges.length})
        </button>
      </div>

      {searchMode !== "personalized" && searchMode !== "saved" && (
        <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 flex flex-col md:flex-row gap-4 items-end relative z-30">
          {searchMode === "field" ? (
            <div className="flex-1 w-full relative">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">
                Field of Study
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:text-white rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition font-medium"
                  placeholder="e.g. Computer Science, Artificial Intelligence, Medicine..."
                  value={field}
                  onChange={(e) => {
                    setField(e.target.value);
                    setShowAutoComplete(true);
                  }}
                  onFocus={() => setShowAutoComplete(true)}
                  onBlur={() =>
                    setTimeout(() => setShowAutoComplete(false), 200)
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Search className="absolute left-4 top-4 w-6 h-6 text-gray-400" />
              </div>

              {/* Autocomplete Suggestions */}
              {showAutoComplete && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-950 text-[10px] font-black uppercase text-gray-440 tracking-wider">
                    Suggested Subjects of Study
                  </div>
                  {FIELD_SUGGESTIONS.filter((item) => {
                    const q = field.toLowerCase();
                    return (
                      !q ||
                      item.text.toLowerCase().includes(q) ||
                      item.label.toLowerCase().includes(q)
                    );
                  })
                    .slice(0, 5)
                    .map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onMouseDown={() => {
                          setField(item.text);
                          setShowAutoComplete(false);
                        }}
                        className="w-full text-left px-4 py-3 text-xs hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 flex items-center justify-between transition-colors text-gray-800 dark:text-gray-200"
                      >
                        <span className="font-bold">
                          {item.text}{" "}
                          <span className="font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-100/45 dark:bg-cyan-950/45 px-1.5 py-0.5 rounded text-[10px] ml-1.5">
                            {item.label}
                          </span>
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">
                          {item.category}
                        </span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 w-full flex flex-col md:flex-row gap-4 relative">
              {/* Career Target Selector */}
              <div className="flex-1 relative">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">
                  Dream Employer / Recruiter Hub
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:text-white rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition font-medium"
                    placeholder="Where do you want to work? e.g. Google, Tesla, Goldman Sachs, NVIDIA..."
                    value={careerGoal}
                    onChange={(e) => {
                      setCareerGoal(e.target.value);
                      setShowCareerAutoComplete(true);
                    }}
                    onFocus={() => setShowCareerAutoComplete(true)}
                    onBlur={() =>
                      setTimeout(() => setShowCareerAutoComplete(false), 200)
                    }
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <Briefcase className="absolute left-4 top-4 w-6 h-6 text-gray-400" />
                </div>

                {/* Career Goal Autocomplete Overlay */}
                {showCareerAutoComplete && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-950 text-[10px] font-black uppercase text-gray-440 tracking-wider">
                      Top Recruiter Pathways
                    </div>
                    {CAREER_SUGGESTIONS.filter((item) => {
                      const q = careerGoal.toLowerCase();
                      return !q || item.text.toLowerCase().includes(q);
                    })
                      .slice(0, 5)
                      .map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onMouseDown={() => {
                            setCareerGoal(item.text);
                            setShowCareerAutoComplete(false);
                          }}
                          className="w-full text-left px-4 py-3 text-xs hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 flex items-center justify-between transition-colors text-gray-800 dark:text-gray-100"
                        >
                          <span className="font-bold flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />{" "}
                            {item.text}
                          </span>
                          <span className="text-[10px] font-bold text-gray-455 dark:text-gray-550">
                            {item.category}
                          </span>
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* Field overlayed with career */}
              <div className="w-full md:w-64 relative">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">
                  Subject / Major context
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:text-white rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition font-medium"
                  placeholder="e.g. Computer Science"
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>
          )}

          <button
            onClick={handleSearch}
            disabled={
              loading ||
              (searchMode === "field" ? !field.trim() : !careerGoal.trim())
            }
            className="w-full md:w-auto px-8 py-4 bg-cyan-600 text-white font-bold rounded-2xl hover:bg-cyan-700 transition disabled:opacity-50 flex items-center justify-center whitespace-nowrap shadow-lg shadow-cyan-200 dark:shadow-none"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Find Colleges"
            )}
          </button>
        </div>
      )}

      {searchMode === "personalized" && (
        /* Bespoke Matchmaker Questionnaire panel */
        <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 space-y-6 relative z-30 animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Header summary */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-150 dark:border-gray-700">
            <span className="p-3 bg-amber-500/10 rounded-2xl">
              <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
            </span>
            <div>
              <h3 className="text-lg font-black text-gray-950 dark:text-white uppercase tracking-wide">
                Bespoke Fit Matchmaker
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Specify your academic details, scores, budget and priorities so
                that Gemini can search a matched portfolio.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Section 1: Major Context & Study Level */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-400 mb-2 uppercase tracking-wide">
                  Target Field of Study
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition font-medium text-sm"
                  placeholder="e.g. Computer Science with AI specialisation, Finance..."
                  value={personalField}
                  onChange={(e) => setPersonalField(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-400 mb-2 uppercase tracking-wide">
                  Level of Study Needed
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["UG", "PG", "PhD"] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setPersonalLevel(level)}
                      className={`py-2 px-3 font-semibold text-xs rounded-xl border transition ${
                        personalLevel === level
                          ? "bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400 shadow-sm"
                          : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-400 mb-2 uppercase tracking-wide">
                  12th Grade / GPAs / Prior Marks
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition font-medium text-sm"
                  placeholder="e.g. 12th Grade 94%, or CGPA 3.8/4.0"
                  value={personalAcademics}
                  onChange={(e) => setPersonalAcademics(e.target.value)}
                />
              </div>
            </div>

            {/* Section 2: Exams & scores */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                  Exams Given / Planned
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[
                    "SAT",
                    "ACT",
                    "GRE",
                    "GMAT",
                    "IELTS",
                    "TOEFL",
                    "JEE Main",
                    "JEE Advanced",
                    "GATE",
                    "CAT",
                  ].map((exam) => {
                    const checked = personalExams.includes(exam);
                    return (
                      <button
                        key={exam}
                        type="button"
                        onClick={() => {
                          if (checked) {
                            setPersonalExams(
                              personalExams.filter((e) => e !== exam),
                            );
                          } else {
                            setPersonalExams([...personalExams, exam]);
                          }
                        }}
                        className={`text-[10px] font-black px-2.5 py-1 rounded-lg border transition ${
                          checked
                            ? "bg-cyan-600 border-cyan-600 text-white shadow-sm"
                            : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        {exam}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition font-medium text-sm"
                  placeholder="Specific exam scores (e.g. SAT 1515, IELTS 8.0, JEE Rank 25000)"
                  value={personalScores}
                  onChange={(e) => setPersonalScores(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-150 dark:border-gray-700">
            {/* Section 3: Budget and Scholarship preference */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-400 mb-2 uppercase tracking-wide">
                  Expected Annual Tuition Budget
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition font-medium text-sm"
                  placeholder={`e.g. ₹5,00,000 to ₹10,00,000 INR, or $40,000 USD...`}
                  value={personalBudget}
                  onChange={(e) => setPersonalBudget(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-400 mb-2 uppercase tracking-wide">
                  Scholarship Necessity
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["High", "Medium", "Low"] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setPersonalScholarship(level)}
                      className={`py-2 px-3 font-semibold text-xs rounded-xl border transition ${
                        personalScholarship === level
                          ? "bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400"
                          : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {level} Need
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 4: Campus Life, Hostel, Placement priorities, Location */}
            <div className="space-y-4 font-brand border-t border-gray-100 dark:border-gray-800 pt-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2.5 uppercase tracking-wide">
                  Campus Vibe & Environment (Select Multiple)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Research Centric",
                    "Urban / City Hub",
                    "Quiet Suburban",
                    "Vibrant Social Life",
                    "Rural / Close to Nature",
                    "Technical & STEM Focused",
                    "Sports & Athletic Focus",
                    "Arts & Creative Vibe",
                    "Global & Diverse",
                  ].map((vibe) => {
                    const checked = personalCampuses.includes(vibe);
                    return (
                      <button
                        key={vibe}
                        type="button"
                        onClick={() => {
                          if (checked) {
                            setPersonalCampuses(
                              personalCampuses.filter((v) => v !== vibe),
                            );
                          } else {
                            setPersonalCampuses([...personalCampuses, vibe]);
                          }
                        }}
                        className={`text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
                          checked
                            ? "bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400 shadow-sm"
                            : "border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900"
                        }`}
                      >
                        {vibe}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                    Hostel Requirement
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPersonalHostel(true)}
                      className={`flex-1 py-2.5 px-4 font-bold text-xs rounded-xl border transition ${
                        personalHostel === true
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-sm"
                          : "border-gray-200 dark:border-gray-700 hover:bg-gray-55 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      Hostel Needed
                    </button>
                    <button
                      type="button"
                      onClick={() => setPersonalHostel(false)}
                      className={`flex-1 py-2.5 px-4 font-bold text-xs rounded-xl border transition ${
                        personalHostel === false
                          ? "bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-400 shadow-sm"
                          : "border-gray-200 dark:border-gray-700 hover:bg-gray-55 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      Day Scholar
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide font-brand">
                    Location / Regional Choices
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition font-medium text-sm"
                    placeholder={`e.g. Bangalore, South India, or ${country}, USA, Europe...`}
                    value={personalLocation}
                    onChange={(e) => setPersonalLocation(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Careers, placement priority, and custom text */}
          <div className="pt-4 border-t border-gray-150 dark:border-gray-700 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2.5 uppercase tracking-wide">
                  What matters most to you? (Select Multiple)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Placements",
                    "Research",
                    "High ROI",
                    "MNC Connection",
                    "Campus Environment",
                    "Alumni Network",
                    "Higher Studies pathways",
                    "Extracurriculars / Sports",
                  ].map((item) => {
                    const checked = personalMattersMost.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          if (checked) {
                            setPersonalMattersMost(
                              personalMattersMost.filter((i) => i !== item),
                            );
                          } else {
                            setPersonalMattersMost([
                              ...personalMattersMost,
                              item,
                            ]);
                          }
                        }}
                        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition ${
                          checked
                            ? "bg-cyan-500/10 border-cyan-500 text-cyan-700 dark:text-cyan-400 font-bold shadow-sm"
                            : "border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-55 dark:hover:bg-gray-900"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2.5 uppercase tracking-wide">
                  Institution Type Preference (Select Multiple)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Public University",
                    "Private University",
                    "Liberal Arts College",
                    "Technical Institute",
                    "Ivy League / Elite Tier",
                  ].map((item) => {
                    const checked = personalInstitutionTypes.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          if (checked) {
                            setPersonalInstitutionTypes(
                              personalInstitutionTypes.filter((i) => i !== item),
                            );
                          } else {
                            setPersonalInstitutionTypes([
                              ...personalInstitutionTypes,
                              item,
                            ]);
                          }
                        }}
                        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition ${
                          checked
                            ? "bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-400 font-bold shadow-sm"
                            : "border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-55 dark:hover:bg-gray-900"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                  Ranking System Preference
                </label>
                <select
                  value={personalRankingPreference}
                  onChange={(e) => setPersonalRankingPreference(e.target.value as any)}
                  className="w-full px-3 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition font-medium text-sm"
                >
                  <option value="No preference">
                    No preference (Overall Fit Match)
                  </option>
                  <option value="QS World">QS World University Rankings</option>
                  <option value="Times Higher Education">
                    Times Higher Education (THE)
                  </option>
                  <option value="US News">US News & World Report</option>
                  <option value="NIRF / Domestic">
                    NIRF / Domestic Rankings
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                  Personal Preferences / Extracurriculars / Special Needs
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition font-medium text-sm"
                  placeholder="e.g. Needs strong sports facilities, near library, or quick visa processing support"
                  value={personalPreferences}
                  onChange={(e) => setPersonalPreferences(e.target.value)}
                />
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4 flex justify-end">
              <button
                onClick={handlePersonalizedSearch}
                disabled={personalizedLoading}
                className="w-full md:w-auto px-10 py-4 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-2xl transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-205 dark:shadow-none"
              >
                {personalizedLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Matching Best
                    Fit...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />{" "}
                    Find Personalized Best Fit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {result && searchMode !== "personalized" && searchMode !== "saved" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-200 dark:border-gray-700 mb-8 gap-4">
            <div className="flex space-x-2 overflow-x-auto w-full md:w-auto">
              <TabButton
                active={activeTab === "domestic"}
                onClick={() => setActiveTab("domestic")}
                icon={Building2}
                label={`Top 25 in ${country}`}
              />
              <TabButton
                active={activeTab === "foreign"}
                onClick={() => setActiveTab("foreign")}
                icon={Globe}
                label="Top 25 Global"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-2 rounded-xl text-sm font-bold transition ${showFilters ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"}`}
              >
                {showFilters ? (
                  <X className="w-4 h-4 mr-2" />
                ) : (
                  <Filter className="w-4 h-4 mr-2" />
                )}
                {showFilters ? "Hide Filters" : "Filter Results"}
              </button>
              <button
                onClick={() => setMapViewEnabled(!mapViewEnabled)}
                className={`flex items-center px-4 py-2 rounded-xl text-sm font-bold transition ${mapViewEnabled ? "bg-cyan-600 text-white shadow-sm" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"}`}
              >
                <MapPin className="w-4 h-4 mr-2" />
                {mapViewEnabled ? "Hide Map Grid" : "Interactive Map Grid"}
              </button>
            </div>
          </div>
          {/* Filters Bar */}
          {showFilters && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-in fade-in slide-in-from-top-2 z-20 relative">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                  Location
                </label>
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full p-2.5 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                >
                  <option value="All">All Locations</option>
                  {uniqueLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                  Specific Course
                </label>
                <select
                  value={filterCourse}
                  onChange={(e) => setFilterCourse(e.target.value)}
                  className="w-full p-2.5 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                >
                  <option value="All">All Courses</option>
                  {uniqueCourses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                  Proximity Anchor
                </label>
                <select
                  value={selectedCityAnchor}
                  onChange={(e) => {
                    setSelectedCityAnchor(e.target.value);
                    if (e.target.value !== "All" && maxDistanceKm === "All") {
                      setMaxDistanceKm("500"); // set reasonable default
                    }
                  }}
                  className="w-full p-2.5 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                >
                  <option value="All">Any Regional Hub</option>
                  <option value="boston">Cambridge/Boston, MA</option>
                  <option value="newyork">New York, NY</option>
                  <option value="bayarea">SF/Bay Area, CA</option>
                  <option value="london">London & Southeast UK</option>
                  <option value="chennai">Chennai, TN</option>
                  <option value="mumbai">Mumbai, MH</option>
                  <option value="delhi">Delhi & North India</option>
                  <option value="bangalore">Bengaluru, KA</option>
                  <option value="toronto">Toronto/Waterloo Hub</option>
                  <option value="sydney">Sydney, NSW</option>
                  <option value="singapore">Singapore Hub</option>
                  <option value="tokyo">Tokyo, Japan</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                  Range Filter
                </label>
                <select
                  value={maxDistanceKm}
                  onChange={(e) => setMaxDistanceKm(e.target.value)}
                  disabled={selectedCityAnchor === "All"}
                  className="w-full p-2.5 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 font-medium disabled:opacity-40"
                >
                  <option value="All">Any Distance</option>
                  <option value="100">Within 100 km</option>
                  <option value="250">Within 250 km</option>
                  <option value="500">Within 500 km</option>
                  <option value="1000">Within 1000 km</option>
                  <option value="3000">Within 3000 km</option>
                  <option value="5000">Within 5000 km</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                  Min. Placement (%)
                </label>
                <div className="px-1 pt-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={filterPlacement}
                    onChange={(e) =>
                      setFilterPlacement(parseInt(e.target.value))
                    }
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-cyan-600"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-gray-500 mt-1">
                    <span>0%</span>
                    <span className="text-cyan-600 dark:text-cyan-400 font-mono">
                      {filterPlacement > 0 ? `${filterPlacement}%` : "Any"}
                    </span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Keyword..."
                    className="w-full p-2.5 pl-8 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                  />
                  <Search className="absolute left-2.5 top-3 w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>
            </div>
          )}{" "}
          <div key={activeTab} className="animate-fade-in min-h-[400px]">
            {filteredList.length > 0 ? (
              <div
                className={`grid grid-cols-1 ${mapViewEnabled ? "lg:grid-cols-12" : ""} gap-6`}
              >
                <div className={mapViewEnabled ? "lg:col-span-7" : ""}>
                  <CollegeList
                    colleges={filteredList}
                    expandedId={expandedId}
                    onToggle={toggleExpand}
                    selectedIds={selectedColleges.map((c) => c.name)}
                    targetCollegeName={targetCollege}
                    onSetTargetCollege={handleSetTargetCollege}
                    onSelect={toggleSelection}
                    completedMilestones={milestones}
                    onToggleMilestone={handleToggleMilestone}
                    highlightedEmployer={
                      searchMode === "career" ? careerGoal : undefined
                    }
                    savedCollegeNames={savedColleges.map((c) => c.name)}
                    onToggleSave={handleSaveCollege}
                  />
                </div>

                {mapViewEnabled && (
                  <div className="lg:col-span-5 bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 rounded-3xl h-[650px] sticky top-6 flex flex-col justify-between overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                      <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2 mb-1">
                        <MapPin className="text-cyan-500 w-4 h-4 animate-bounce" />{" "}
                        Vector Map Coordinates
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mb-3">
                        Interactive geographical coordinates of all filtered
                        institutions on a 2D canvas grid.
                      </p>
                    </div>

                    {/* Map Canvas Frame */}
                    <div
                      className="relative flex-1 w-full bg-white dark:bg-gray-950 border border-gray-200/60 dark:border-gray-800/80 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center p-4 min-h-[200px]"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle, var(--color-cyan-100) 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                      }}
                    >
                      {/* Lat/Lng lines */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                        <div className="w-full h-[1px] bg-cyan-500"></div>
                        <div className="h-full w-[1px] bg-cyan-500 absolute"></div>
                      </div>

                      {/* Render Anchor Hub if active */}
                      {selectedCityAnchor !== "All" &&
                        (() => {
                          const anchorMap: Record<
                            string,
                            { lat: number; lng: number; title: string }
                          > = {
                            boston: {
                              lat: 42.3601,
                              lng: -71.0589,
                              title: "Boston & Cambridge",
                            },
                            newyork: {
                              lat: 40.7128,
                              lng: -74.006,
                              title: "New York City",
                            },
                            bayarea: {
                              lat: 37.7749,
                              lng: -122.4194,
                              title: "Bay Area / Stanford",
                            },
                            london: {
                              lat: 51.5074,
                              lng: -0.1278,
                              title: "London & Southeast UK",
                            },
                            chennai: {
                              lat: 13.0827,
                              lng: 80.2707,
                              title: "Chennai Hub",
                            },
                            mumbai: {
                              lat: 19.076,
                              lng: 72.8777,
                              title: "Mumbai Core",
                            },
                            delhi: {
                              lat: 28.6139,
                              lng: 77.209,
                              title: "National Capital Region",
                            },
                            bangalore: {
                              lat: 12.9716,
                              lng: 77.5946,
                              title: "Bengaluru Tech Corridor",
                            },
                            toronto: {
                              lat: 43.6532,
                              lng: -79.3832,
                              title: "Ontario Cluster",
                            },
                            sydney: {
                              lat: -33.8688,
                              lng: 151.2093,
                              title: "Sydney Hub",
                            },
                            singapore: {
                              lat: 1.3521,
                              lng: 103.8198,
                              title: "Singapore",
                            },
                            tokyo: {
                              lat: 35.6762,
                              lng: 139.6503,
                              title: "Greater Tokyo",
                            },
                          };
                          const item = anchorMap[selectedCityAnchor];
                          if (!item) return null;
                          return (
                            <div
                              className="absolute z-10 w-4 h-4 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center cursor-help animate-ping"
                              style={{
                                left: "50%",
                                top: "50%",
                                transform: "translate(-50%, -50%)",
                              }}
                              title={`Anchor: ${item.title}`}
                            />
                          );
                        })()}

                      {/* Pins of filtered list colleges */}
                      {filteredList.map((col, cIdx) => {
                        const coordObj = getDeterministicCoordinates(
                          col.location,
                          col.name,
                        );

                        // Calculate relative position based on offsets
                        let leftOffset = 50;
                        let topOffset = 50;

                        if (selectedCityAnchor !== "All") {
                          const anchorMap: Record<
                            string,
                            { lat: number; lng: number }
                          > = {
                            boston: { lat: 42.3601, lng: -71.0589 },
                            newyork: { lat: 40.7128, lng: -74.006 },
                            bayarea: { lat: 37.7749, lng: -122.4194 },
                            london: { lat: 51.5074, lng: -0.1278 },
                            chennai: { lat: 13.0827, lng: 80.2707 },
                            mumbai: { lat: 19.076, lng: 72.8777 },
                            delhi: { lat: 28.6139, lng: 77.209 },
                            bangalore: { lat: 12.9716, lng: 77.5946 },
                            toronto: { lat: 43.6532, lng: -79.3832 },
                            sydney: { lat: -33.8688, lng: 151.2093 },
                            singapore: { lat: 1.3521, lng: 103.8198 },
                            tokyo: { lat: 35.6762, lng: 139.6503 },
                          };
                          const anchor = anchorMap[selectedCityAnchor];
                          if (anchor) {
                            // Delta mapped on scale
                            const dLat = coordObj.lat - anchor.lat;
                            const dLng = coordObj.lng - anchor.lng;
                            leftOffset = Math.min(
                              Math.max(50 + dLng * 4.5, 8),
                              92,
                            );
                            topOffset = Math.min(
                              Math.max(50 - dLat * 4.5, 8),
                              92,
                            );
                          }
                        } else {
                          // Fallback absolute distribute using hash
                          let mapSeed = cIdx * 179 + 53;
                          leftOffset = 15 + (mapSeed % 70);
                          topOffset = 15 + ((mapSeed >> 2) % 70);
                        }

                        const isActiveCard = expandedId === col.name;

                        return (
                          <button
                            key={cIdx}
                            onClick={() => {
                              toggleExpand(col.name);
                              setTimeout(() => {
                                const targetId = `college-card-${col.name.replace(/\s+/g, "-").toLowerCase()}`;
                                const element =
                                  document.getElementById(targetId);
                                if (element) {
                                  element.scrollIntoView({
                                    behavior: "smooth",
                                    block: "center",
                                  });
                                }
                              }, 200);
                            }}
                            className="absolute group z-20"
                            style={{
                              left: `${leftOffset}%`,
                              top: `${topOffset}%`,
                              transform: "translate(-50%, -50%)",
                            }}
                          >
                            <div
                              className={`p-1.5 rounded-full border transition-all ${
                                isActiveCard
                                  ? "bg-cyan-600 border-white ring-4 ring-cyan-500/30 scale-125 z-40"
                                  : "bg-white dark:bg-gray-800 border-cyan-500 dark:border-cyan-400 group-hover:scale-110 z-25 shadow-sm"
                              }`}
                            >
                              <MapPin
                                className={`w-3.5 h-3.5 ${isActiveCard ? "text-white" : "text-cyan-600 dark:text-cyan-400"}`}
                              />
                            </div>

                            {/* Hover Tooltip / Label */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-990 bg-gray-900/95 dark:bg-gray-950/95 text-white text-[9px] font-extrabold rounded-lg px-2 py-1 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 dark:border dark:border-gray-850/50 shadow-md transition-opacity z-50">
                              <div>{col.name}</div>
                              <div className="text-cyan-300 text-[8px] font-mono mt-0.5 tracking-tight">
                                {col.location}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Map Footer Anchor Link */}
                    <div className="mt-4 p-3 bg-white dark:bg-gray-850 border border-gray-150 dark:border-gray-800 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500 relative">
                          <span className="absolute inset-0 bg-amber-500 rounded-full animate-ping"></span>
                        </div>
                        <span className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                          {selectedCityAnchor !== "All"
                            ? `Centered on regional hub`
                            : "Overview mapping mode"}
                        </span>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((searchMode === "career" ? careerGoal : field) + " universities")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-extrabold uppercase text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        Open Google Maps <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-16 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="font-medium">
                  No colleges found matching your criteria.
                </p>
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

      {searchMode === "personalized" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8">
          {personalizedLoading ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
              <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto" />
              <h4 className="text-sm font-black uppercase text-amber-600 tracking-wider">
                Structuring Best Fit Portfolio
              </h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                Gemini is matching your academic profile, given entrance exams,
                tuition budget, and campus life preferences with real-time
                institutions...
              </p>
            </div>
          ) : personalizedResult ? (
            <div className="space-y-6">
              {/* Analysis Summary Card */}
              <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-950/20 dark:to-orange-950/20 p-6 md:p-8 rounded-3xl border border-amber-500/20 text-gray-800 dark:text-gray-100 shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="p-3 bg-amber-500/15 rounded-2xl text-amber-600 dark:text-amber-400">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </span>
                  <div>
                    <h4 className="text-base font-black uppercase tracking-wider text-amber-805 dark:text-amber-400">
                      Consultant fit analysis
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed mt-2">
                      {personalizedResult.analysisOverview ||
                        "Our AI Advisor has generated a tailored college recommendation board matching your academic capabilities, budget coordinates, and future career priorities."}
                    </p>
                  </div>
                </div>
              </div>

              {/* College List */}
              <PersonalizedCollegeList
                colleges={personalizedResult.colleges || personalizedResult.matchedColleges || []}
                expandedId={personalizedExpandedId}
                onToggle={(name) => {
                  setPersonalizedExpandedId(
                    personalizedExpandedId === name ? null : name,
                  );
                }}
                selectedIds={selectedColleges.map((c) => c.name)}
                onSelect={toggleSelection}
                targetCollegeName={targetCollege}
                onSetTargetCollege={handleSetTargetCollege}
                completedMilestones={milestones}
                onToggleMilestone={handleToggleMilestone}
                savedCollegeNames={savedColleges.map((c) => c.name)}
                onToggleSave={handleSaveCollege}
              />
            </div>
          ) : (
            <div className="text-center text-gray-500 py-16 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-amber-500 animate-pulse" />
              <p className="font-bold text-gray-750 dark:text-white">
                Begin your Personalized Fit Search
              </p>
              <p className="text-xs text-gray-500 max-w-md mx-auto mt-2 leading-relaxed">
                Fill out your subject interests, past scores, entrance exams,
                and budget choices above to unlock a bespoke matched portfolio
                with exact fit scores.
              </p>
            </div>
          )}
        </div>
      )}

      {searchMode === "saved" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8 space-y-6">
          <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-sm">
            <span className="p-3 bg-rose-500/10 rounded-2xl">
              <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
            </span>
            <div>
              <h3 className="text-lg font-black text-gray-950 dark:text-white uppercase tracking-wide font-brand">
                Saved Shortlist ({savedColleges.length})
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Track, target, and compare your saved high-potential prospective
                institutions in one single shortlist desk.
              </p>
            </div>
          </div>

          {savedColleges.length > 0 ? (
            <CollegeList
              colleges={savedColleges}
              expandedId={expandedId}
              onToggle={toggleExpand}
              selectedIds={selectedColleges.map((c) => c.name)}
              targetCollegeName={targetCollege}
              onSetTargetCollege={handleSetTargetCollege}
              onSelect={toggleSelection}
              completedMilestones={milestones}
              onToggleMilestone={handleToggleMilestone}
              savedCollegeNames={savedColleges.map((c) => c.name)}
              onToggleSave={handleSaveCollege}
            />
          ) : (
            <div className="text-center text-gray-500 py-16 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <Heart className="w-12 h-12 mx-auto mb-4 text-rose-300 dark:text-rose-905/30" />
              <p className="font-bold text-gray-750 dark:text-white font-brand">
                Your shortlist is empty
              </p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-2 leading-relaxed">
                Browse prospective colleges, click the heart "Save" button on
                any institution card (standard lists or personalized fits) to
                build your customized application target board.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Comparison Floating Bar */}
      {selectedColleges.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-4 rounded-full shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-10 fade-in border border-gray-700 dark:border-gray-200">
          <span className="text-sm font-bold whitespace-nowrap">
            {selectedColleges.length} Selected
          </span>
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
