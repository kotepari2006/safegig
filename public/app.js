// SafeGig MNC Career Portal & AI Resume Match Engine - Client Logic

let allMncs = [];
let currentAnalysis = null;
let boosterSkills = new Set(["Java", "Python", "React", "SQL", "AWS"]);

// Auth State
let currentUser = null;
let authToken = localStorage.getItem("safegig_token") || null;

// Application Data State
let myApplicationsList = [];
let adminApplicationsList = [];
let adminCompanyStatsList = [];
let userAppliedKeys = new Set(); // "companyName:positionTitle"
let currentMyAppsFilter = "ALL";

// All available skills for live booster toggles
const ALL_BOOSTER_SKILLS = [
  "Java", "Python", "C++", "C#", "Go", "JavaScript", "TypeScript", "Swift", "Kotlin", "SQL",
  "React", "Angular", "Vue.js", "HTML5", "CSS", "GraphQL", "UI / UX", "Node.js", "Spring Boot",
  ".NET", "REST APIs", "Microservices", "AWS", "Azure", "GCP", "Docker", "Kubernetes", "DevOps",
  "Terraform", "Linux", "OpenShift", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch",
  "Data Structures & Algorithms", "System Design", "Data Analysis", "Power BI", "ETL",
  "Cyber Security", "Cloud Security", "SAP", "Salesforce", "Agile", "Git", "Selenium", "Embedded Systems", "CUDA"
];

// Document Initializer
document.addEventListener("DOMContentLoaded", () => {
  initAuth();
  fetchMncs();
  loadPreset("fullstack");
  setupDropzone();
});

// ==========================================
// AUTHENTICATION MANAGEMENT
// ==========================================

async function initAuth() {
  const savedUser = localStorage.getItem("safegig_user");
  if (savedUser && authToken) {
    try {
      currentUser = JSON.parse(savedUser);
      // Validate session with backend
      const res = await fetch("/api/auth/me", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        currentUser = data.user;
        localStorage.setItem("safegig_user", JSON.stringify(currentUser));
      } else {
        logout();
      }
    } catch (e) {
      logout();
    }
  }

  renderNavUserArea();
  fetchUserApplicationsSilent();
}

function renderNavUserArea() {
  const container = document.getElementById("navUserArea");
  if (!container) return;

  if (currentUser) {
    const roleClass = currentUser.role === "admin" ? "admin" : "";
    container.innerHTML = `
      <div class="nav-user-pill">
        <span>${currentUser.role === "admin" ? "👑" : "👤"} ${currentUser.name}</span>
        <span class="nav-role-badge ${roleClass}">${currentUser.role}</span>
      </div>
      <button class="nav-logout-btn" onclick="logout()">🚪 Logout</button>
    `;
  } else {
    container.innerHTML = `
      <button class="auth-modal-btn" onclick="openAuthModal()">
        🔑 Login / Register
      </button>
    `;
  }

  // Update badge in My Applications Tab
  const roleBadge = document.getElementById("myAppsRoleBadge");
  if (roleBadge) {
    if (currentUser) {
      roleBadge.innerText = `${currentUser.name} (${currentUser.role})`;
    } else {
      roleBadge.innerText = "Guest Candidate View";
    }
  }
}

function openAuthModal(defaultRole = 'student') {
  document.getElementById("authModal").classList.add("open");
  switchAuthTab(defaultRole === 'admin' ? 'loginAdmin' : 'loginStudent');
}

function closeAuthModal() {
  document.getElementById("authModal").classList.remove("open");
  hideAuthMsgs();
}

function switchAuthTab(tab) {
  hideAuthMsgs();
  document.querySelectorAll(".auth-tab-btn").forEach(b => b.classList.remove("active"));
  
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const loginRole = document.getElementById("loginRole");
  const submitText = document.getElementById("loginSubmitBtnText");

  if (tab === "loginStudent") {
    document.getElementById("tabLoginStudent").classList.add("active");
    loginForm.style.display = "block";
    signupForm.style.display = "none";
    loginRole.value = "student";
    submitText.innerText = "🔑 Sign In as Student / Candidate";
  } else if (tab === "loginAdmin") {
    document.getElementById("tabLoginAdmin").classList.add("active");
    loginForm.style.display = "block";
    signupForm.style.display = "none";
    loginRole.value = "admin";
    submitText.innerText = "👑 Sign In as Admin";
  } else if (tab === "signup") {
    document.getElementById("tabSignup").classList.add("active");
    loginForm.style.display = "none";
    signupForm.style.display = "block";
  }
}

function hideAuthMsgs() {
  const err = document.getElementById("authErrorMsg");
  const succ = document.getElementById("authSuccessMsg");
  if (err) err.style.display = "none";
  if (succ) succ.style.display = "none";
}

function showAuthError(msg) {
  const err = document.getElementById("authErrorMsg");
  if (err) {
    err.innerText = msg;
    err.style.display = "block";
  }
}

function showAuthSuccess(msg) {
  const succ = document.getElementById("authSuccessMsg");
  if (succ) {
    succ.innerText = msg;
    succ.style.display = "block";
  }
}

// 1-Click Quick Demo Login Helper
async function quickLogin(email, password) {
  openAuthModal();
  document.getElementById("authEmail").value = email;
  document.getElementById("authPassword").value = password;
  
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      showAuthError(data.error || "Login failed.");
      return;
    }

    authToken = data.token;
    currentUser = data.user;
    localStorage.setItem("safegig_token", authToken);
    localStorage.setItem("safegig_user", JSON.stringify(currentUser));

    showAuthSuccess(`Logged in as ${currentUser.name} (${currentUser.role})!`);
    renderNavUserArea();

    setTimeout(() => {
      closeAuthModal();
      if (currentUser.role === "admin") {
        switchTab("admin");
      } else {
        switchTab("applications");
      }
    }, 600);

  } catch (err) {
    showAuthError("Connection error during login.");
  }
}

async function handleAuthSubmit(event, type) {
  event.preventDefault();
  hideAuthMsgs();

  if (type === "login") {
    const email = document.getElementById("authEmail").value;
    const password = document.getElementById("authPassword").value;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        showAuthError(data.error || "Invalid email or password.");
        return;
      }

      authToken = data.token;
      currentUser = data.user;
      localStorage.setItem("safegig_token", authToken);
      localStorage.setItem("safegig_user", JSON.stringify(currentUser));

      renderNavUserArea();
      closeAuthModal();

      if (currentUser.role === "admin") {
        switchTab("admin");
      } else {
        switchTab("applications");
      }
    } catch (err) {
      showAuthError("Server communication error.");
    }
  } else if (type === "signup") {
    const name = document.getElementById("signupName").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const role = document.getElementById("signupRole").value;
    const skillsRaw = document.getElementById("signupSkills").value;
    const skills = skillsRaw ? skillsRaw.split(",").map(s => s.trim()).filter(Boolean) : [];

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, skills })
      });

      const data = await res.json();
      if (!res.ok) {
        showAuthError(data.error || "Signup failed.");
        return;
      }

      authToken = data.token;
      currentUser = data.user;
      localStorage.setItem("safegig_token", authToken);
      localStorage.setItem("safegig_user", JSON.stringify(currentUser));

      renderNavUserArea();
      closeAuthModal();
      switchTab(currentUser.role === "admin" ? "admin" : "applications");
    } catch (err) {
      showAuthError("Server communication error.");
    }
  }
}

async function logout() {
  if (authToken) {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Authorization": `Bearer ${authToken}` }
      });
    } catch (e) {}
  }

  authToken = null;
  currentUser = null;
  localStorage.removeItem("safegig_token");
  localStorage.removeItem("safegig_user");
  userAppliedKeys.clear();
  myApplicationsList = [];

  renderNavUserArea();
  switchTab("matcher");
}

// ==========================================
// TAB NAVIGATION
// ==========================================

function switchTab(tabId) {
  document.querySelectorAll(".nav-tab-btn").forEach(btn => btn.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(content => content.style.display = "none");

  if (tabId === "matcher") {
    document.getElementById("tabBtnMatcher").classList.add("active");
    document.getElementById("matcherTab").style.display = "block";
  } else if (tabId === "directory") {
    document.getElementById("tabBtnDirectory").classList.add("active");
    document.getElementById("directoryTab").style.display = "block";
    renderDirectoryGrid(allMncs);
  } else if (tabId === "applications") {
    document.getElementById("tabBtnApplications").classList.add("active");
    document.getElementById("applicationsTab").style.display = "block";
    fetchMyApplications();
  } else if (tabId === "admin") {
    document.getElementById("tabBtnAdmin").classList.add("active");
    document.getElementById("adminTab").style.display = "block";
    fetchAdminDashboard();
  } else if (tabId === "booster") {
    document.getElementById("tabBtnBooster").classList.add("active");
    document.getElementById("boosterTab").style.display = "block";
    renderBoosterGrid();
    recalculateBoosterMatches();
  }
}

// ==========================================
// MNC & RESUME MATCHING LOGIC
// ==========================================

async function fetchMncs() {
  try {
    const res = await fetch("/api/mncs");
    const data = await res.json();
    allMncs = data.mncs || [];
    document.getElementById("totalMncStat").innerText = `${allMncs.length}+`;
  } catch (err) {
    console.error("Error fetching MNCs:", err);
  }
}

function loadPreset(key) {
  const preset = PRESET_RESUMES[key];
  if (!preset) return;

  document.querySelectorAll(".preset-btn").forEach(btn => btn.classList.remove("active"));
  const activeBtn = document.querySelector(`.preset-btn[onclick="loadPreset('${key}')"]`);
  if (activeBtn) activeBtn.classList.add("active");

  document.getElementById("resumeText").value = preset.text;
  analyzeResume();
}

function setupDropzone() {
  const dropzone = document.getElementById("dropzone");
  if (!dropzone) return;

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, () => dropzone.classList.add('dragover'), false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, () => dropzone.classList.remove('dragover'), false);
  });

  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    if (dt.files.length > 0) handleFile(dt.files[0]);
  });
}

function handleFileUpload(e) {
  if (e.target.files.length > 0) handleFile(e.target.files[0]);
}

function handleFile(file) {
  const dropzoneText = document.querySelector(".dropzone-text");
  dropzoneText.innerText = `Uploaded: ${file.name}`;

  const reader = new FileReader();
  if (file.name.endsWith(".txt")) {
    reader.onload = function(e) {
      document.getElementById("resumeText").value = e.target.result;
      analyzeResume();
    };
    reader.readAsText(file);
  } else {
    reader.onload = function(e) {
      const dec = new TextDecoder("utf-8");
      let rawString = dec.decode(e.target.result);
      const cleanText = rawString.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, " ").replace(/\s+/g, " ");
      document.getElementById("resumeText").value = cleanText || `Extracted text from ${file.name}`;
      analyzeResume();
    };
    reader.readAsArrayBuffer(file);
  }
}

async function analyzeResume() {
  const resumeText = document.getElementById("resumeText").value;
  if (!resumeText || resumeText.trim().length === 0) {
    alert("Please upload a resume file or paste resume text first.");
    return;
  }

  try {
    const res = await fetch("/api/match-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText })
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Failed to analyze resume.");
      return;
    }

    currentAnalysis = await res.json();
    renderOverviewCard(currentAnalysis.parsedData);
    renderTop10AndMild10(currentAnalysis.top10Matches, currentAnalysis.mild10Matches);

    if (currentAnalysis.parsedData.extractedSkills) {
      boosterSkills = new Set(currentAnalysis.parsedData.extractedSkills);
    }
  } catch (err) {
    console.error("Match API Error:", err);
  }
}

function renderOverviewCard(parsedData) {
  document.getElementById("atsScoreVal").innerText = `${parsedData.atsScore}%`;
  document.querySelector(".ats-ring").style.setProperty("--ats-val", parsedData.atsScore);

  let subtext = "Solid ATS Formatting";
  if (parsedData.atsScore >= 85) subtext = "Exceptional ATS Keyword Optimization!";
  else if (parsedData.atsScore <= 60) subtext = "Consider adding more technical keywords.";
  document.getElementById("atsSubtext").innerText = subtext;

  document.getElementById("detectedExpVal").innerText = parsedData.detectedExperience;
  document.getElementById("extractedSkillsCountVal").innerText = `${parsedData.totalSkillsFound} Skills`;

  const skillsContainer = document.getElementById("extractedSkillsContainer");
  skillsContainer.innerHTML = "";

  if (parsedData.extractedSkills.length === 0) {
    skillsContainer.innerHTML = `<span style="color: var(--text-dim); font-size: 0.85rem;">No technical keywords auto-detected.</span>`;
    return;
  }

  parsedData.extractedSkills.forEach(skill => {
    const span = document.createElement("span");
    span.className = "skill-tag";
    span.innerText = skill;
    skillsContainer.appendChild(span);
  });
}

function renderTop10AndMild10(top10, mild10) {
  const topContainer = document.getElementById("top10Container");
  const mildContainer = document.getElementById("mild10Container");

  topContainer.innerHTML = "";
  mildContainer.innerHTML = "";

  top10.forEach((mnc, idx) => {
    topContainer.appendChild(createMncCardElement(mnc, idx + 1, true));
  });

  mild10.forEach((mnc, idx) => {
    mildContainer.appendChild(createMncCardElement(mnc, idx + 11, false));
  });
}

function createMncCardElement(mnc, rank, isTopRank) {
  const card = document.createElement("div");
  card.className = `mnc-card ${isTopRank ? "top-rank" : "mild-rank"}`;

  const matchedSkillsHtml = mnc.matchedSkills.map(s => `<span class="skill-tag matched">✓ ${s}</span>`).join(" ");
  const missingSkillsHtml = mnc.missingSkills.slice(0, 4).map(s => `<span class="skill-tag missing">+ ${s}</span>`).join(" ");

  const positions = mnc.matchingPositions && mnc.matchingPositions.length > 0
    ? mnc.matchingPositions
    : (mnc.activePositions || []);

  const jobsHtml = positions.slice(0, 2).map(j => {
    const appKey = `${mnc.name.toLowerCase()}:${j.title.toLowerCase()}`;
    const isApplied = userAppliedKeys.has(appKey);
    const deadlineStr = j.deadline || "2026-10-31";

    return `
      <div class="job-subcard">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div class="job-title">${j.title}</div>
          ${isApplied
            ? `<span class="btn-applied-already">✓ Applied</span>`
            : `<button class="btn-apply-job" onclick="openApplyModal('${mnc.mncId || mnc.id}', '${mnc.name}', '${j.title}', '${deadlineStr}')">
                 🚀 Apply Now
               </button>`
          }
        </div>
        <div class="job-details" style="margin-top: 0.5rem;">
          <span>📍 ${j.location || 'Global'}</span>
          <span>💼 ${j.experienceReq || '0-3 yrs'}</span>
          <span style="color:#FBBF24; font-weight:700;">📅 Deadline: ${deadlineStr}</span>
        </div>
      </div>
    `;
  }).join("");

  card.innerHTML = `
    <div class="mnc-header">
      <div class="mnc-brand-group">
        <div class="mnc-logo-box">
          <img src="${mnc.logo}" alt="${mnc.name} Logo" onerror="this.src='https://via.placeholder.com/50?text=${mnc.name.substring(0,2)}'">
        </div>
        <div>
          <div class="mnc-name">
            ${mnc.name}
            <span class="rank-pill">Rank #${rank}</span>
          </div>
          <div class="mnc-meta">
            <span>🏷️ ${mnc.domain}</span>
            <span>⭐ ${mnc.tier}</span>
            <span>📍 ${mnc.headquarters}</span>
          </div>
        </div>
      </div>

      <div class="match-score-box">
        <div class="score-num">${mnc.matchScore}%</div>
        <div class="score-label">${isTopRank ? "High Match" : "Mild Match"}</div>
        <div class="score-bar-bg">
          <div class="score-bar-fill" style="width: ${mnc.matchScore}%;"></div>
        </div>
      </div>
    </div>

    <div class="mnc-body">
      <p class="match-reason">${mnc.matchReason}</p>

      <div class="card-skills-row">
        <div class="skill-row-title">Your Matched Skills (${mnc.matchedSkills.length}):</div>
        <div class="tags-flex">${matchedSkillsHtml || "<span style='font-size:0.8rem; color:var(--text-dim)'>No direct overlap</span>"}</div>
      </div>

      ${mnc.missingSkills.length > 0 ? `
        <div class="card-skills-row">
          <div class="skill-row-title">Recommended Skill Upgrades (${mnc.missingSkills.length}):</div>
          <div class="tags-flex">${missingSkillsHtml}</div>
        </div>
      ` : ''}

      <div class="jobs-list-title">Active Openings at ${mnc.name}:</div>
      <div class="jobs-grid">
        ${jobsHtml}
      </div>

      <div class="mnc-footer">
        <div class="salary-tag">Est. Compensation: ${mnc.salaryRange}</div>
        <div>
          <button class="apply-link-btn" onclick="openMncModal('${mnc.mncId || mnc.id}')" style="margin-right: 0.5rem; background: rgba(255,255,255,0.08); color:#FFF; cursor:pointer;">
            ℹ️ Details
          </button>
          <a href="${mnc.careerUrl}" target="_blank" rel="noopener noreferrer" class="apply-link-btn">
            🚀 Careers Portal ↗
          </a>
        </div>
      </div>
    </div>
  `;

  return card;
}

// ==========================================
// JOB APPLICATION SUBMISSION FLOW
// ==========================================

async function fetchUserApplicationsSilent() {
  if (!authToken) return;
  try {
    const res = await fetch("/api/applications", {
      headers: { "Authorization": `Bearer ${authToken}` }
    });
    if (res.ok) {
      const data = await res.json();
      userAppliedKeys.clear();
      (data.applications || []).forEach(a => {
        const key = `${a.company.toLowerCase()}:${a.positionTitle.toLowerCase()}`;
        userAppliedKeys.add(key);
      });
      document.getElementById("totalAppsStat").innerText = (data.applications || []).length;
    }
  } catch (e) {}
}

function openApplyModal(mncId, companyName, positionTitle, deadline) {
  if (!currentUser) {
    alert("Please log in as a student or employee candidate to apply.");
    openAuthModal('student');
    return;
  }

  const container = document.getElementById("applyModalContent");
  container.innerHTML = `
    <div style="margin-bottom: 1.25rem;">
      <h2 style="font-size: 1.4rem; color: #FFF; font-weight: 800; margin-bottom: 0.4rem;">
        🚀 Submit Job Application
      </h2>
      <div style="font-size: 0.9rem; color: var(--text-muted);">
        Applying to <strong style="color:#FFF">${companyName}</strong> for <strong style="color:#60A5FA">${positionTitle}</strong>
      </div>
    </div>

    <div style="background: var(--bg-card-secondary); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.25rem;">
      <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; font-size:0.85rem;">
        <span style="color:var(--text-dim)">Applicant Name:</span>
        <strong style="color:#FFF">${currentUser.name}</strong>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; font-size:0.85rem;">
        <span style="color:var(--text-dim)">Email Address:</span>
        <strong style="color:#FFF">${currentUser.email}</strong>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:0.85rem;">
        <span style="color:var(--text-dim)">Application Deadline:</span>
        <strong style="color:#FBBF24">📅 ${deadline}</strong>
      </div>
    </div>

    <form onsubmit="submitJobApplication(event, '${mncId}', '${companyName}', '${positionTitle}', '${deadline}')">
      <div class="form-group">
        <label for="appNotes">Cover Note / Qualification Summary (Optional):</label>
        <textarea id="appNotes" class="resume-textarea" style="height: 90px;" placeholder="Highlight why you are a top fit for this position..."></textarea>
      </div>

      <div style="text-align: right; margin-top: 1.25rem;">
        <button type="button" class="nav-tab-btn" onclick="closeApplyModal()" style="margin-right:0.5rem;">Cancel</button>
        <button type="submit" class="action-btn" style="display:inline-flex; width:auto; padding:0.65rem 1.5rem;">
          Submit Application 🚀
        </button>
      </div>
    </form>
  `;

  document.getElementById("applyModal").classList.add("open");
}

function closeApplyModal() {
  document.getElementById("applyModal").classList.remove("open");
}

async function submitJobApplication(event, mncId, company, positionTitle, deadline) {
  event.preventDefault();
  const notes = document.getElementById("appNotes").value;

  try {
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      },
      body: JSON.stringify({ mncId, company, positionTitle, deadline, notes })
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Failed to submit application.");
      return;
    }

    closeApplyModal();
    alert(`🎉 ${data.message}`);

    const key = `${company.toLowerCase()}:${positionTitle.toLowerCase()}`;
    userAppliedKeys.add(key);

    fetchUserApplicationsSilent();
    if (currentAnalysis) {
      renderTop10AndMild10(currentAnalysis.top10Matches, currentAnalysis.mild10Matches);
    }
    renderDirectoryGrid(allMncs);

  } catch (err) {
    alert("Error communicating with server.");
  }
}

// ==========================================
// MY APPLICATIONS DASHBOARD (STUDENT / EMPLOYEE)
// ==========================================

async function fetchMyApplications() {
  const prompt = document.getElementById("guestAppsPrompt");
  const content = document.getElementById("applicationsContent");

  if (!currentUser) {
    prompt.style.display = "flex";
    content.style.display = "none";
    return;
  }

  prompt.style.display = "none";
  content.style.display = "block";

  try {
    const res = await fetch("/api/applications", {
      headers: { "Authorization": `Bearer ${authToken}` }
    });

    if (!res.ok) {
      prompt.style.display = "flex";
      content.style.display = "none";
      return;
    }

    const data = await res.json();
    myApplicationsList = data.applications || [];

    document.getElementById("myTotalAppsVal").innerText = myApplicationsList.length;
    document.getElementById("myAcceptedAppsVal").innerText = data.acceptedCount || 0;
    document.getElementById("myPendingAppsVal").innerText = data.pendingCount || 0;
    document.getElementById("myRejectedAppsVal").innerText = data.rejectedCount || 0;

    renderMyApplications(currentMyAppsFilter);

  } catch (err) {
    console.error("Error fetching my applications:", err);
  }
}

function filterMyApps(statusFilter, btnEl) {
  currentMyAppsFilter = statusFilter;
  if (btnEl) {
    document.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
    btnEl.classList.add("active");
  }
  renderMyApplications(statusFilter);
}

function renderMyApplications(statusFilter) {
  const grid = document.getElementById("myApplicationsGrid");
  grid.innerHTML = "";

  let filtered = myApplicationsList;
  if (statusFilter && statusFilter !== "ALL") {
    filtered = filtered.filter(a => a.status === statusFilter);
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: span 3; text-align: center; color: var(--text-muted); padding: 3rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
        <p style="font-size: 1.1rem; font-weight:700; color:#FFF; margin-bottom: 0.5rem;">No Applications Found</p>
        <p style="font-size: 0.9rem;">You haven't submitted any job applications under this status filter yet.</p>
        <button class="action-btn" onclick="switchTab('directory')" style="display:inline-flex; width:auto; margin-top: 1rem;">
          Explore Companies & Apply Now
        </button>
      </div>
    `;
    return;
  }

  filtered.forEach(appItem => {
    const card = document.createElement("div");
    card.className = "app-card";

    let statusClass = "under-review";
    let statusIcon = "🟡";
    if (appItem.status === "Accepted") {
      statusClass = "accepted";
      statusIcon = "🟢";
    } else if (appItem.status === "Rejected") {
      statusClass = "rejected";
      statusIcon = "🔴";
    }

    const appliedDate = appItem.appliedAt ? new Date(appItem.appliedAt).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }) : "Recently";

    card.innerHTML = `
      <div>
        <div class="app-card-header">
          <div>
            <div class="app-company-name">🏢 ${appItem.company}</div>
            <div class="app-position-title">${appItem.positionTitle}</div>
          </div>
          <span class="status-badge ${statusClass}">${statusIcon} ${appItem.status}</span>
        </div>

        <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 0.75rem;">
          ${appItem.notes || "Submitted via SafeGig Career Portal"}
        </p>
      </div>

      <div class="app-meta-row">
        <div class="app-meta-item">
          <span class="app-meta-label">⏰ Applied Time:</span>
          <span class="app-meta-val">${appliedDate}</span>
        </div>
        <div class="app-meta-item">
          <span class="app-meta-label">📅 Application Deadline:</span>
          <span class="app-meta-val" style="color:#FBBF24;">${appItem.deadline}</span>
        </div>
        <div class="app-meta-item">
          <span class="app-meta-label">Candidate Name:</span>
          <span class="app-meta-val">${appItem.userName}</span>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

// ==========================================
// ADMIN DASHBOARD & STATUS MANAGEMENT
// ==========================================

async function fetchAdminDashboard() {
  const prompt = document.getElementById("guestAdminPrompt");
  const content = document.getElementById("adminContent");

  if (!currentUser || currentUser.role !== "admin") {
    prompt.style.display = "flex";
    content.style.display = "none";
    return;
  }

  prompt.style.display = "none";
  content.style.display = "block";

  try {
    const res = await fetch("/api/applications", {
      headers: { "Authorization": `Bearer ${authToken}` }
    });

    if (!res.ok) {
      prompt.style.display = "flex";
      content.style.display = "none";
      return;
    }

    const data = await res.json();
    adminApplicationsList = data.applications || [];
    adminCompanyStatsList = data.companyStats || [];

    document.getElementById("adminTotalAppsVal").innerText = data.totalApplications || 0;
    document.getElementById("adminTotalCompaniesVal").innerText = adminCompanyStatsList.length;
    document.getElementById("adminAcceptedVal").innerText = data.acceptedCount || 0;
    document.getElementById("adminPendingVal").innerText = data.pendingCount || 0;
    document.getElementById("adminRejectedVal").innerText = data.rejectedCount || 0;

    renderAdminCompanyStats();
    renderAdminTable();

  } catch (err) {
    console.error("Error fetching admin dashboard:", err);
  }
}

function renderAdminCompanyStats() {
  const grid = document.getElementById("adminCompanyStatsGrid");
  grid.innerHTML = "";

  if (adminCompanyStatsList.length === 0) {
    grid.innerHTML = `<p style="color:var(--text-muted); grid-column:span 3;">No company application statistics available yet.</p>`;
    return;
  }

  adminCompanyStatsList.forEach(stat => {
    const card = document.createElement("div");
    card.className = "company-stat-card";
    card.innerHTML = `
      <div class="comp-name">🏢 ${stat.company}</div>
      <div class="comp-count-pill">${stat.applicantCount} Candidate${stat.applicantCount > 1 ? 's' : ''}</div>
    `;
    grid.appendChild(card);
  });
}

function renderAdminTable() {
  const tbody = document.getElementById("adminTableBody");
  tbody.innerHTML = "";

  const searchVal = (document.getElementById("adminSearchInput")?.value || "").toLowerCase();
  const statusFilter = document.getElementById("adminStatusFilter")?.value || "ALL";

  let filtered = adminApplicationsList;

  if (statusFilter && statusFilter !== "ALL") {
    filtered = filtered.filter(a => a.status === statusFilter);
  }

  if (searchVal) {
    filtered = filtered.filter(a =>
      a.userName.toLowerCase().includes(searchVal) ||
      a.userEmail.toLowerCase().includes(searchVal) ||
      a.company.toLowerCase().includes(searchVal) ||
      a.positionTitle.toLowerCase().includes(searchVal)
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:2rem;">No matching candidate applications found.</td></tr>`;
    return;
  }

  filtered.forEach(appItem => {
    const tr = document.createElement("tr");

    let statusClass = "under-review";
    if (appItem.status === "Accepted") statusClass = "accepted";
    else if (appItem.status === "Rejected") statusClass = "rejected";

    const appliedDate = appItem.appliedAt ? new Date(appItem.appliedAt).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }) : "N/A";

    tr.innerHTML = `
      <td>
        <div class="candidate-name">👤 ${appItem.userName}</div>
        <div class="candidate-email">${appItem.userEmail}</div>
      </td>
      <td>
        <div style="font-weight:700; color:#FFF;">🏢 ${appItem.company}</div>
        <div style="font-size:0.8rem; color:#60A5FA;">${appItem.positionTitle}</div>
      </td>
      <td>
        <div style="font-size:0.85rem; font-weight:700; color:#FFF;">⏰ ${appliedDate}</div>
      </td>
      <td>
        <div style="font-size:0.85rem; font-weight:700; color:#FBBF24;">📅 ${appItem.deadline}</div>
      </td>
      <td>
        <span class="status-badge ${statusClass}">${appItem.status}</span>
      </td>
      <td>
        <div class="table-action-btns">
          <button class="btn-status-action accept" onclick="updateAppStatusByAdmin('${appItem.id}', 'Accepted')" title="Mark as Accepted">
            ✅ Accept
          </button>
          <button class="btn-status-action reject" onclick="updateAppStatusByAdmin('${appItem.id}', 'Rejected')" title="Mark as Rejected">
            ❌ Reject
          </button>
          <button class="btn-status-action review" onclick="updateAppStatusByAdmin('${appItem.id}', 'Under Review')" title="Mark as Under Review">
            ⏳ Review
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function updateAppStatusByAdmin(appId, newStatus) {
  if (!authToken) return;

  try {
    const res = await fetch(`/api/admin/applications/${appId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      },
      body: JSON.stringify({ status: newStatus })
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Failed to update status.");
      return;
    }

    // Refresh admin data
    fetchAdminDashboard();

  } catch (err) {
    alert("Server communication error.");
  }
}

// ==========================================
// DIRECTORY & LIVE BOOSTER
// ==========================================

function renderDirectoryGrid(list) {
  const grid = document.getElementById("directoryGrid");
  grid.innerHTML = "";

  if (list.length === 0) {
    grid.innerHTML = `<p style="color: var(--text-muted); grid-column: span 3;">No MNCs match your search filter.</p>`;
    return;
  }

  list.forEach(mnc => {
    const card = document.createElement("div");
    card.className = "mnc-card";

    const positions = mnc.activePositions || [];
    const firstPos = positions[0] || { title: "Software Role", deadline: "2026-10-31" };
    const appKey = `${mnc.name.toLowerCase()}:${firstPos.title.toLowerCase()}`;
    const isApplied = userAppliedKeys.has(appKey);

    card.innerHTML = `
      <div class="mnc-brand-group" style="margin-bottom: 1rem;">
        <div class="mnc-logo-box">
          <img src="${mnc.logo}" alt="${mnc.name}" onerror="this.src='https://via.placeholder.com/50?text=${mnc.name.substring(0,2)}'">
        </div>
        <div>
          <div class="mnc-name">${mnc.name}</div>
          <div class="mnc-meta">
            <span>🏷️ ${mnc.domain}</span>
          </div>
        </div>
      </div>

      <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem; line-height: 1.4;">${mnc.description}</p>

      <div class="card-skills-row">
        <div class="skill-row-title">Required Tech Stack:</div>
        <div class="tags-flex">
          ${mnc.requiredSkills.slice(0, 6).map(s => `<span class="skill-tag">${s}</span>`).join(" ")}
        </div>
      </div>

      <div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.06);">
        <div style="font-size:0.8rem; color:var(--text-dim); margin-bottom:0.4rem;">Featured Opening: <strong>${firstPos.title}</strong></div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.8rem; color:#FBBF24; font-weight:700;">📅 Deadline: ${firstPos.deadline}</span>
          ${isApplied
            ? `<span class="btn-applied-already">✓ Applied</span>`
            : `<button class="btn-apply-job" onclick="openApplyModal('${mnc.id}', '${mnc.name}', '${firstPos.title}', '${firstPos.deadline}')">
                 🚀 Apply Now
               </button>`
          }
        </div>
      </div>

      <div class="mnc-footer" style="margin-top: 1rem;">
        <span class="salary-tag">${mnc.salaryRange}</span>
        <button class="apply-link-btn" onclick="openMncModal('${mnc.id}')" style="cursor:pointer;">
          View Profile & All Jobs ↗
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filterDirectory() {
  const searchVal = document.getElementById("dirSearchInput").value.toLowerCase();
  const domainVal = document.getElementById("dirDomainSelect").value;

  let filtered = allMncs;
  if (domainVal && domainVal !== "All") {
    filtered = filtered.filter(m => m.domain.toLowerCase().includes(domainVal.toLowerCase()));
  }

  if (searchVal) {
    filtered = filtered.filter(m => 
      m.name.toLowerCase().includes(searchVal) ||
      m.domain.toLowerCase().includes(searchVal) ||
      m.requiredSkills.some(s => s.toLowerCase().includes(searchVal))
    );
  }

  renderDirectoryGrid(filtered);
}

function renderBoosterGrid() {
  const container = document.getElementById("boosterSkillsToggleGrid");
  container.innerHTML = "";

  ALL_BOOSTER_SKILLS.forEach(skill => {
    const isSelected = boosterSkills.has(skill);
    const tag = document.createElement("span");
    tag.className = `skill-tag ${isSelected ? "matched" : ""}`;
    tag.style.cursor = "pointer";
    tag.innerText = isSelected ? `✓ ${skill}` : `+ ${skill}`;

    tag.onclick = () => {
      if (boosterSkills.has(skill)) boosterSkills.delete(skill);
      else boosterSkills.add(skill);
      renderBoosterGrid();
      recalculateBoosterMatches();
    };

    container.appendChild(tag);
  });
}

async function recalculateBoosterMatches() {
  const skillsText = Array.from(boosterSkills).join(", ");
  const mockResume = `Skills Profile: ${skillsText}. Experienced candidate seeking MNC opportunities.`;

  try {
    const res = await fetch("/api/match-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText: mockResume })
    });

    const data = await res.json();
    const container = document.getElementById("boosterResultsContainer");
    container.innerHTML = "";

    data.top10Matches.slice(0, 5).forEach((mnc, idx) => {
      container.appendChild(createMncCardElement(mnc, idx + 1, true));
    });

  } catch (err) {
    console.error("Booster recalculation error:", err);
  }
}

// Modal View for MNC Details
function openMncModal(mncId) {
  const mnc = allMncs.find(m => m.id === mncId || m.mncId === mncId);
  if (!mnc) return;

  const content = document.getElementById("modalContent");
  const positionsHtml = (mnc.activePositions || []).map(p => {
    const appKey = `${mnc.name.toLowerCase()}:${p.title.toLowerCase()}`;
    const isApplied = userAppliedKeys.has(appKey);
    const deadline = p.deadline || "2026-10-31";

    return `
      <div class="job-subcard" style="margin-bottom: 0.75rem;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <h4 style="color: #FFF; margin-bottom: 0.3rem;">${p.title}</h4>
          ${isApplied
            ? `<span class="btn-applied-already">✓ Applied</span>`
            : `<button class="btn-apply-job" onclick="openApplyModal('${mnc.id}', '${mnc.name}', '${p.title}', '${deadline}')">
                 🚀 Apply Now
               </button>`
          }
        </div>
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">
          <span>📍 ${p.location}</span> | <span>💼 ${p.experienceReq}</span> | <span style="color:#FBBF24; font-weight:700;">📅 Deadline: ${deadline}</span>
        </div>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">${p.description}</p>
        <div class="tags-flex">
          ${p.skills.map(s => `<span class="skill-tag">${s}</span>`).join(" ")}
        </div>
      </div>
    `;
  }).join("");

  content.innerHTML = `
    <div class="mnc-brand-group" style="margin-bottom: 1.25rem;">
      <div class="mnc-logo-box" style="width: 64px; height: 64px;">
        <img src="${mnc.logo}" alt="${mnc.name}">
      </div>
      <div>
        <h2 style="font-size: 1.5rem; font-weight: 800; color: #FFF;">${mnc.name}</h2>
        <div style="font-size: 0.9rem; color: var(--text-muted);">
          <span>🏷️ ${mnc.domain}</span> | <span>⭐ ${mnc.tier}</span>
        </div>
      </div>
    </div>

    <p style="font-size: 0.95rem; color: var(--text-muted); margin-bottom: 1.25rem; line-height: 1.6;">${mnc.description}</p>

    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem; background: var(--bg-card-secondary); padding: 1rem; border-radius: var(--radius-md);">
      <div>
        <span style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase;">Headquarters</span>
        <div style="font-weight: 700; color: #FFF;">${mnc.headquarters}</div>
      </div>
      <div>
        <span style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase;">Company Size</span>
        <div style="font-weight: 700; color: #FFF;">${mnc.size}</div>
      </div>
      <div>
        <span style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase;">Salary Bracket</span>
        <div style="font-weight: 700; color: #60A5FA;">${mnc.salaryRange}</div>
      </div>
      <div>
        <span style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase;">Hiring Status</span>
        <div style="font-weight: 700; color: #34D399;">${mnc.hiringStatus}</div>
      </div>
    </div>

    <h3 style="font-size: 1.1rem; font-weight: 700; color: #FFF; margin-bottom: 0.75rem;">Active Hiring Positions (${(mnc.activePositions || []).length}):</h3>
    ${positionsHtml || "<p style='color: var(--text-muted);'>No active roles specified.</p>"}

    <div style="margin-top: 1.5rem; text-align: right;">
      <a href="${mnc.careerUrl}" target="_blank" rel="noopener noreferrer" class="action-btn" style="display: inline-flex; width: auto; padding: 0.75rem 1.5rem;">
        Apply on ${mnc.name} Official Careers Portal ↗
      </a>
    </div>
  `;

  document.getElementById("mncModal").classList.add("open");
}

function closeModal() {
  document.getElementById("mncModal").classList.remove("open");
}