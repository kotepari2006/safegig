// SafeGig AI Cover Letter Generator Engine
// Supports Google Gemini API (gemini-2.5-flash / gemini-1.5-flash) with seamless fallback
// to our intelligent built-in tailoring synthesizer.

/**
 * Clean and normalize text
 */
function clean(text) {
  return (text || "").toString().trim();
}

/**
 * Intelligent built-in Cover Letter synthesis
 */
function synthesizeCoverLetter({ company, role, jobDescription, candidateName, skills, experience, tone }) {
  const name = clean(candidateName) || "Candidate";
  const targetCompany = clean(company) || "your company";
  const targetRole = clean(role) || "Software Engineer";
  const candidateSkills = Array.isArray(skills) 
    ? skills 
    : (skills ? skills.split(",").map(s => s.trim()).filter(Boolean) : []);
  const skillListStr = candidateSkills.length > 0 
    ? candidateSkills.slice(0, 5).join(", ") 
    : "software development, problem-solving, and system design";

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  // Tone variations
  let openingHook = "";
  let toneClosing = "";
  let personalityStatement = "";

  switch ((tone || "professional").toLowerCase()) {
    case "enthusiastic":
      openingHook = `I was thrilled to come across the open ${targetRole} position at ${targetCompany}. Having closely followed ${targetCompany}'s cutting-edge work and innovation, I am eager to bring my drive, technical passion, and collaborative mindset to your engineering team.`;
      personalityStatement = `What excites me most about ${targetCompany} is your relentless commitment to solving complex problems at scale while fostering an inclusive, high-energy environment. I thrive in dynamic teams where creative thinking and fast iteration are celebrated.`;
      toneClosing = `I would welcome the opportunity to speak with you about how my enthusiasm, adaptability, and skills in ${skillListStr} can contribute to ${targetCompany}'s ongoing success.`;
      break;

    case "confident":
      openingHook = `With a proven foundation in technical problem solving and hands-on experience delivering robust software solutions, I am writing to express my strong candidacy for the ${targetRole} opportunity at ${targetCompany}.`;
      personalityStatement = `Throughout my technical projects, I have consistently demonstrated the ability to take ownership of complex requirements, architect maintainable solutions, and collaborate cross-functionally to achieve measurable results.`;
      toneClosing = `I am confident that my technical proficiency in ${skillListStr} and my proactive work ethic make me an immediate contributor to ${targetCompany}. I look forward to discussing how I can add tangible value to your roadmap.`;
      break;

    case "concise":
      openingHook = `I am writing to apply for the ${targetRole} role at ${targetCompany}. With specialized skills in ${skillListStr}, I am eager to contribute directly to your team's upcoming initiatives.`;
      personalityStatement = `My background focuses on building scalable applications, writing test-driven code, and optimizing performance across the stack. I take pride in delivering efficient, clean solutions on tight deadlines.`;
      toneClosing = `I would appreciate the chance to discuss how my skill set aligns with your team's objectives. Thank you for your time and consideration.`;
      break;

    case "professional":
    default:
      openingHook = `Please accept this letter and my accompanying resume as an expression of my sincere interest in the ${targetRole} position at ${targetCompany}. Given ${targetCompany}'s esteemed reputation for technological excellence, I am enthusiastic about the prospect of contributing to your team's mission.`;
      personalityStatement = `My academic and project experience has equipped me with strong analytical competencies, disciplined software engineering practices, and the agility to adapt rapidly to evolving tech stacks.`;
      toneClosing = `I would welcome the privilege of an interview to discuss how my background, dedication, and technical proficiencies in ${skillListStr} align with the strategic goals of ${targetCompany}.`;
      break;
  }

  // Generate relevant technical achievement bullets based on provided skills
  const bulletPoints = [];
  if (candidateSkills.some(s => /react|frontend|javascript|typescript|vue|angular|html|css/i.test(s))) {
    bulletPoints.push(`- Frontend Architecture: Designed and developed responsive, accessible, and user-centric interfaces, optimizing page load times and elevating client-side user experience.`);
  }
  if (candidateSkills.some(s => /python|java|node|spring|c\+\+|c#|backend|api|sql|mongo/i.test(s))) {
    bulletPoints.push(`- Scalable Backend Engineering: Built and integrated high-throughput RESTful services and robust database schemas, ensuring data integrity, security, and low-latency response times.`);
  }
  if (candidateSkills.some(s => /aws|cloud|docker|kubernetes|devops|ci\/cd|linux/i.test(s))) {
    bulletPoints.push(`- Cloud & DevOps Integration: Streamlined containerization workflows and automated deployment pipelines, enhancing system reliability and release velocity.`);
  }
  if (candidateSkills.some(s => /ai|ml|machine learning|deep learning|data|analytics/i.test(s))) {
    bulletPoints.push(`- Data & Machine Learning: Applied statistical models and algorithmic processing to extract actionable insights and automate decision-making pipelines.`);
  }
  if (bulletPoints.length === 0) {
    bulletPoints.push(`- Technical Problem-Solving: Applied strong data structures, algorithms, and clean architecture principles to design maintainable, testable codebases.`);
    bulletPoints.push(`- Agile Collaboration: Partnered effectively with peers to brainstorm architectures, review pull requests, and deliver production-ready milestones.`);
  }

  const jdMention = clean(jobDescription)
    ? `\nReviewing the requirements for the ${targetRole} role, I noted your emphasis on finding team members who can hit the ground running. My background directly aligns with these core responsibilities:\n${bulletPoints.join("\n")}`
    : `\nKey qualifications and competencies I bring to ${targetCompany} include:\n${bulletPoints.join("\n")}`;

  return `${today}

Hiring Team / Engineering Recruitment
${targetCompany}

Dear Hiring Team,

${openingHook}

${personalityStatement}
${jdMention}

${toneClosing} Thank you for your review of my application, and I look forward to hearing from you.

Sincerely,

${name}
Applicant for ${targetRole}
${candidateSkills.length > 0 ? `Core Competencies: ${skillListStr}` : ""}`;
}

/**
 * Generate AI Cover Letter using Gemini API (with seamless built-in fallback)
 */
async function generateCoverLetter({
  company,
  role,
  jobDescription,
  candidateName,
  skills,
  experience,
  tone = "professional",
  apiKey
}) {
  const activeKey = apiKey || process.env.GEMINI_API_KEY;

  if (activeKey) {
    try {
      const prompt = `You are an expert executive career coach and technical recruiter. Write a compelling, polished, ATS-optimized cover letter tailored for the following candidate and position:

- Candidate Name: ${candidateName || "Candidate"}
- Target Company: ${company || "Target Company"}
- Target Role / Position: ${role || "Software Engineer"}
- Tone: ${tone} (e.g. professional, enthusiastic, confident, or concise)
- Candidate Skills: ${Array.isArray(skills) ? skills.join(", ") : (skills || "Software Engineering, Problem Solving")}
- Experience / Background: ${experience || "Solid engineering projects and foundational coursework"}
${jobDescription ? `- Job Description / Key Requirements:\n${jobDescription}` : ""}

Formatting Requirements:
1. Include Date, Company recipient header, professional salutation ("Dear Hiring Team,").
2. Engaging opening paragraph stating the role and enthusiasm for the specific company.
3. 2-3 structured body paragraphs highlighting matching skills, concrete impact, and cultural fit.
4. Professional call-to-action closing with sign-off and candidate name.
5. Do not include markdown code fence formatting like \`\`\`markdown. Output the raw text of the letter directly.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1200
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText && candidateText.trim().length > 100) {
          return {
            coverLetter: candidateText.trim(),
            engine: "Gemini 2.5 Flash AI",
            tone
          };
        }
      } else {
        console.warn("Gemini API call failed with status:", response.status, await response.text());
      }
    } catch (apiErr) {
      console.warn("Gemini API request error, falling back to smart synthesizer:", apiErr.message);
    }
  }

  // Fallback to high-quality built-in synthesis
  const letter = synthesizeCoverLetter({
    company,
    role,
    jobDescription,
    candidateName,
    skills,
    experience,
    tone
  });

  return {
    coverLetter: letter,
    engine: "SafeGig Smart AI Engine",
    tone
  };
}

module.exports = {
  generateCoverLetter,
  synthesizeCoverLetter
};
