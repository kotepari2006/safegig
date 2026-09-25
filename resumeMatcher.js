// Resume Parsing, Skill Extraction & MNC Match Engine

const { MNC_DATABASE } = require("./mncData");

// Skill Dictionary with canonical names and alias variations
const SKILL_DICTIONARY = [
  // Languages & Core
  { name: "Python", aliases: ["python", "py", "python3"] },
  { name: "Java", aliases: ["java", "java8", "java11", "java17", "j2ee"] },
  { name: "C++", aliases: ["c++", "cpp", "cplusplus"] },
  { name: "C#", aliases: ["c#", "csharp", "c-sharp"] },
  { name: "C", aliases: ["c language", "ansi c", "\\bc\\b"] },
  { name: "Go", aliases: ["go", "golang"] },
  { name: "JavaScript", aliases: ["javascript", "js", "es6", "ecmascript"] },
  { name: "TypeScript", aliases: ["typescript", "ts"] },
  { name: "Swift", aliases: ["swift", "swiftui"] },
  { name: "Kotlin", aliases: ["kotlin"] },
  { name: "SQL", aliases: ["sql", "mysql", "postgresql", "postgres", "plsql", "pl/sql", "tsql", "sqlite"] },
  { name: "PHP", aliases: ["php", "hack"] },
  { name: "Rust", aliases: ["rust", "rustlang"] },
  
  // Frontend & UI
  { name: "React", aliases: ["react", "reactjs", "react.js"] },
  { name: "Angular", aliases: ["angular", "angularjs", "angular 2+"] },
  { name: "Vue.js", aliases: ["vue", "vuejs", "vue.js"] },
  { name: "HTML5", aliases: ["html", "html5"] },
  { name: "CSS", aliases: ["css", "css3", "sass", "scss", "tailwind", "bootstrap"] },
  { name: "GraphQL", aliases: ["graphql"] },
  { name: "UI / UX", aliases: ["ui/ux", "ui / ux", "user interface", "figma", "wireframing"] },

  // Backend & Frameworks
  { name: "Node.js", aliases: ["node", "nodejs", "node.js", "express", "expressjs"] },
  { name: "Spring Boot", aliases: ["spring", "spring boot", "springboot", "spring mvc"] },
  { name: ".NET", aliases: [".net", "dotnet", "asp.net", ".net core"] },
  { name: "REST APIs", aliases: ["rest api", "rest apis", "restful", "web apis"] },
  { name: "Microservices", aliases: ["microservices", "microservice", "distributed systems"] },

  // Cloud & DevOps
  { name: "AWS", aliases: ["aws", "amazon web services", "ec2", "s3", "lambda", "redshift", "dynamodb"] },
  { name: "Azure", aliases: ["azure", "microsoft azure"] },
  { name: "GCP", aliases: ["gcp", "google cloud", "google cloud platform"] },
  { name: "Docker", aliases: ["docker", "containerization"] },
  { name: "Kubernetes", aliases: ["kubernetes", "k8s"] },
  { name: "DevOps", aliases: ["devops", "ci/cd", "ci / cd", "jenkins", "gitlab ci", "github actions"] },
  { name: "Terraform", aliases: ["terraform", "iac", "infrastructure as code"] },
  { name: "Linux", aliases: ["linux", "ubuntu", "centos", "redhat", "bash", "shell scripting"] },
  { name: "OpenShift", aliases: ["openshift", "redhat openshift"] },

  // AI, Data & Analytics
  { name: "Machine Learning", aliases: ["machine learning", "ml", "ai", "artificial intelligence"] },
  { name: "Deep Learning", aliases: ["deep learning", "neural networks"] },
  { name: "TensorFlow", aliases: ["tensorflow", "tf"] },
  { name: "PyTorch", aliases: ["pytorch"] },
  { name: "Data Structures & Algorithms", aliases: ["dsa", "data structures", "algorithms", "problem solving", "leetcode"] },
  { name: "System Design", aliases: ["system design", "system architecture", "high availability"] },
  { name: "Data Analysis", aliases: ["data analysis", "data analytics", "pandas", "numpy", "scipy"] },
  { name: "Power BI", aliases: ["power bi", "powerbi", "tableau"] },
  { name: "ETL", aliases: ["etl", "data warehousing", "spark", "hadoop"] },

  // Security & Enterprise
  { name: "Cyber Security", aliases: ["cyber security", "cybersecurity", "information security", "infosec", "penetration testing"] },
  { name: "Cloud Security", aliases: ["cloud security", "iam", "zero trust"] },
  { name: "SAP", aliases: ["sap", "sap hana", "abap"] },
  { name: "Salesforce", aliases: ["salesforce", "apex", "crm"] },
  { name: "Agile", aliases: ["agile", "scrum", "jira"] },
  { name: "Git", aliases: ["git", "github", "gitlab", "version control"] },
  { name: "Selenium", aliases: ["selenium", "automation testing", "qa automation", "junit", "testing"] },
  { name: "Embedded Systems", aliases: ["embedded systems", "firmware", "microcontrollers", "autosar", "can bus"] },
  { name: "CUDA", aliases: ["cuda", "gpu computing", "parallel programming"] }
];

/**
 * Extract skills from resume raw text
 */
function extractSkills(text) {
  const lowerText = text.toLowerCase();
  const foundSkills = new Set();

  SKILL_DICTIONARY.forEach(item => {
    for (const alias of item.aliases) {
      // Regexp matching with word boundaries
      let pattern;
      if (alias.startsWith("\\b")) {
        pattern = new RegExp(alias, "i");
      } else {
        const escaped = alias.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
        pattern = new RegExp(`(?:^|[^a-zA-Z0-9#+])${escaped}(?:$|[^a-zA-Z0-9#+])`, "i");
      }

      if (pattern.test(lowerText)) {
        foundSkills.add(item.name);
        break;
      }
    }
  });

  return Array.from(foundSkills);
}

/**
 * Detect experience level from text
 */
function detectExperienceLevel(text) {
  const lower = text.toLowerCase();

  // Pattern checks for years of experience
  const yrMatch = lower.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)?/i);
  let yrs = 0;
  if (yrMatch) {
    yrs = parseInt(yrMatch[1], 10);
  } else {
    // Check graduation / date patterns
    if (lower.includes("fresher") || lower.includes("intern") || lower.includes("student") || lower.includes("graduate 2024") || lower.includes("graduate 2025") || lower.includes("graduate 2026")) {
      yrs = 1;
    } else {
      yrs = 2; // Default assumption for balanced evaluation
    }
  }

  if (yrs <= 2) return { yrs, label: "Fresher (0-2 yrs)" };
  if (yrs <= 5) return { yrs, label: "Mid-Level (2-5 yrs)" };
  return { yrs, label: "Senior (5+ yrs)" };
}

/**
 * Compute ATS Score for resume text
 */
function calculateAtsScore(text, extractedSkills) {
  let score = 50; // Base score

  // 1. Skill count boost (up to +25)
  const skillBoost = Math.min(extractedSkills.length * 2.5, 25);
  score += skillBoost;

  // 2. Formatting & Sections check (up to +15)
  const lower = text.toLowerCase();
  let sections = 0;
  if (lower.includes("experience") || lower.includes("work history") || lower.includes("projects")) sections++;
  if (lower.includes("education") || lower.includes("university") || lower.includes("bachelor") || lower.includes("degree")) sections++;
  if (lower.includes("skills") || lower.includes("technologies") || lower.includes("technical")) sections++;
  if (lower.includes("summary") || lower.includes("objective") || lower.includes("about")) sections++;
  score += (sections * 3.75);

  // 3. Action verbs boost (up to +10)
  const actionVerbs = ["developed", "architected", "engineered", "built", "implemented", "managed", "optimized", "scaled", "led", "created", "designed", "deployed"];
  let verbCount = 0;
  actionVerbs.forEach(v => {
    if (lower.includes(v)) verbCount++;
  });
  score += Math.min(verbCount * 1.5, 10);

  return Math.min(Math.round(score), 98);
}

/**
 * Calculate match score between candidate resume & an MNC profile
 */
function calculateMncMatch(mnc, extractedSkills, expLevel) {
  const mncSkills = mnc.requiredSkills.map(s => s.toLowerCase());
  const candidateSkillsLower = extractedSkills.map(s => s.toLowerCase());

  // 1. Direct Skill Overlap
  const matchedSkills = [];
  const missingSkills = [];

  mnc.requiredSkills.forEach(reqSkill => {
    if (candidateSkillsLower.includes(reqSkill.toLowerCase())) {
      matchedSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  });

  const skillMatchRatio = mnc.requiredSkills.length > 0 ? (matchedSkills.length / mnc.requiredSkills.length) : 0;
  let matchScore = skillMatchRatio * 70; // Skill overlap gives up to 70 points

  // 2. Experience level compatibility (+15 points)
  if (mnc.experienceTiers.includes(expLevel.label)) {
    matchScore += 15;
  } else {
    matchScore += 7; // Partial credit
  }

  // 3. Candidate skill count density bonus (+15 points max)
  const bonus = Math.min(matchedSkills.length * 3, 15);
  matchScore += bonus;

  // Add realistic variation variance based on company tier & requirements
  if (matchedSkills.length === 0) {
    matchScore = Math.min(matchScore, 25);
  }

  const finalScore = Math.max(15, Math.min(Math.round(matchScore), 99));

  // Determine open position matches
  const matchingPositions = mnc.activePositions.map(pos => {
    const posMatchedSkills = pos.skills.filter(s => candidateSkillsLower.includes(s.toLowerCase()));
    const posMatchPct = Math.round((posMatchedSkills.length / Math.max(pos.skills.length, 1)) * 100);

    return {
      title: pos.title,
      type: pos.type,
      location: pos.location,
      experienceReq: pos.experienceReq,
      matchedSkillsCount: posMatchedSkills.length,
      totalSkillsCount: pos.skills.length,
      posMatchPct: Math.max(posMatchPct, 40)
    };
  });

  // Reason generation
  let matchReason = "";
  if (finalScore >= 75) {
    matchReason = `Exceptional fit! You match ${matchedSkills.length} core technical requirements (${matchedSkills.slice(0, 3).join(", ")}) and align with ${mnc.name}'s engineering stack and hiring experience tier (${expLevel.label}).`;
  } else if (finalScore >= 50) {
    matchReason = `Solid mild match. You possess strong foundational skills (${matchedSkills.join(", ") || "core tech"}) that overlap with ${mnc.name}. Acquiring ${missingSkills.slice(0, 2).join(" & ") || "additional frameworks"} can boost you into top priority.`;
  } else {
    matchReason = `Moderate reach opportunity. ${mnc.name} heavily values ${missingSkills.slice(0, 3).join(", ")}, which are adjacent to your current toolkit.`;
  }

  return {
    mncId: mnc.id,
    name: mnc.name,
    logo: mnc.logo,
    domain: mnc.domain,
    tier: mnc.tier,
    headquarters: mnc.headquarters,
    salaryRange: mnc.salaryRange,
    careerUrl: mnc.careerUrl,
    description: mnc.description,
    matchScore: finalScore,
    matchedSkills,
    missingSkills,
    matchingPositions,
    matchReason
  };
}

/**
 * Main matching function returning Top 10 MNCs and 10 Mild MNCs
 */
function analyzeResumeAndMatch(resumeText) {
  const cleanText = resumeText || "";
  const extractedSkills = extractSkills(cleanText);
  const expLevel = detectExperienceLevel(cleanText);
  const atsScore = calculateAtsScore(cleanText, extractedSkills);

  // Score against all 35+ MNCs
  const scoredMncs = MNC_DATABASE.map(mnc => calculateMncMatch(mnc, extractedSkills, expLevel));

  // Sort descending by matchScore
  scoredMncs.sort((a, b) => b.matchScore - a.matchScore);

  // Top 10 High Matches
  const top10 = scoredMncs.slice(0, 10);

  // 10 Mild Matches (Ranks 11 to 20)
  const mild10 = scoredMncs.slice(10, 20);

  return {
    parsedData: {
      extractedSkills,
      totalSkillsFound: extractedSkills.length,
      detectedExperience: expLevel.label,
      atsScore
    },
    top10Matches: top10,
    mild10Matches: mild10,
    totalMncsEvaluated: MNC_DATABASE.length
  };
}

module.exports = {
  extractSkills,
  detectExperienceLevel,
  calculateAtsScore,
  analyzeResumeAndMatch
};
