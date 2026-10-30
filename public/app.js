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

// Table View & Search/Filter State
let currentViewMode = "table"; // Default to table format on desktop!
let currentTableFilter = "ALL"; // "ALL", "TOP10", "MILD10"
let currentDomainFilter = "All";
let tableSearchQuery = "";
let tableSortColumn = "rank"; // "rank", "name", "score", "skills", "deadline"
let tableSortDirection = "asc"; // "asc" or "desc"
let expandedCompanyIds = new Set();
let allMatchedCompaniesList = [];

// Device Configuration Engine State
let deviceConfigMode = localStorage.getItem("safegig_device_mode") || "auto"; // "auto", "laptop", "phone"
let activeDeviceType = "laptop"; // "laptop", "tablet", "phone"
let userExplicitlyChoseViewMode = false;

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
  loadPreset("fullstack", false);
  setupDropzone();
  updateDeviceConfiguration();

  // Listeners for device window resize & orientation
  window.addEventListener("resize", debounce(() => {
    updateDeviceConfiguration();
  }, 150));

  window.addEventListener("orientationchange", () => {
    setTimeout(updateDeviceConfiguration, 200);
  });

  // Close menus when clicking outside
  document.addEventListener("click", (e) => {
    const pill = document.getElementById("deviceConfigPill");
    if (pill && !pill.contains(e.target)) {
      closeDeviceMenu();
    }
  });

  // Keyboard shortcut: Escape to close modals and menus
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAuthModal();
      closeApplyModal();
      closeModal();
      closeMobileNav();
      closeDeviceMenu();
    }
  });
});

// Utility Debounce Helper
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

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
// DEVICE CONFIGURATION & ADAPTIVE ENGINE
// ==========================================

function detectDeviceType() {
  const w = window.innerWidth;
  if (w <= 768) return "phone";
  if (w < 992) return "tablet";
  return "laptop";
}

function updateDeviceConfiguration() {
  const detected = detectDeviceType();
  const effective = (deviceConfigMode === "auto") ? detected : deviceConfigMode;
  activeDeviceType = effective;

  const body = document.body;
  if (!body) return;

  // Reset classes
  body.classList.remove("device-phone", "device-tablet", "device-laptop", "force-phone-mode", "force-laptop-mode");

  if (deviceConfigMode === "phone") {
    body.classList.add("force-phone-mode", "device-phone");
  } else if (deviceConfigMode === "laptop") {
    body.classList.add("force-laptop-mode", "device-laptop");
  } else {
    body.classList.add(`device-${detected}`);
  }

  // Touch & orientation detection
  const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  body.classList.toggle("has-touch", hasTouch);

  const isPortrait = window.innerHeight > window.innerWidth;
  body.classList.toggle("orientation-portrait", isPortrait);
  body.classList.toggle("orientation-landscape", !isPortrait);

  // Update UI indicators
  updateDeviceConfigUI(effective);

  // Intelligent view mode adjustment per configuration:
  // On phones: Default to Cards View for best readability and 1-tap thumb application
  // On laptops: Default to Table View for full enterprise data density
  if (!userExplicitlyChoseViewMode) {
    if (effective === "phone") {
      if (currentViewMode !== "cards") {
        switchViewMode("cards", false);
      }
    } else if (effective === "laptop") {
      if (currentViewMode !== "table") {
        switchViewMode("table", false);
      }
    }
  }

  // Mobile collapse bar adjustment
  const collapseBar = document.getElementById("mobileResumeCollapseBar");
  if (collapseBar && document.getElementById("uploadedFileName")?.innerText) {
    if ((effective === "phone" || detected === "phone") && currentAnalysis) {
      collapseBar.style.display = "flex";
    }
  }
}

function updateDeviceConfigUI(effective) {
  const iconEl = document.getElementById("deviceConfigIcon");
  const labelEl = document.getElementById("deviceConfigLabel");

  let icon = "💻";
  let label = "Laptop";
  if (effective === "phone") {
    icon = "📱";
    label = "Phone";
  } else if (effective === "tablet") {
    icon = "📟";
    label = "Tablet";
  }

  if (deviceConfigMode === "auto") {
    label += " (Auto)";
  }

  if (iconEl) iconEl.innerText = icon;
  if (labelEl) labelEl.innerText = label;

  // Update Dropdown active states
  ["optModeAuto", "optModeLaptop", "optModePhone"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("active");
  });

  const activeOptionId = deviceConfigMode === "auto" ? "optModeAuto" : (deviceConfigMode === "phone" ? "optModePhone" : "optModeLaptop");
  const activeOpt = document.getElementById(activeOptionId);
  if (activeOpt) activeOpt.classList.add("active");

  // Update Drawer button active states
  ["drawerBtnAuto", "drawerBtnLaptop", "drawerBtnPhone"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("active");
  });

  const drawerBtnId = deviceConfigMode === "auto" ? "drawerBtnAuto" : (deviceConfigMode === "phone" ? "drawerBtnPhone" : "drawerBtnLaptop");
  const activeDrawerBtn = document.getElementById(drawerBtnId);
  if (activeDrawerBtn) activeDrawerBtn.classList.add("active");
}

function toggleDeviceMenu(event) {
  if (event) event.stopPropagation();
  const menu = document.getElementById("deviceDropdown");
  if (menu) menu.classList.toggle("open");
}

function closeDeviceMenu() {
  const menu = document.getElementById("deviceDropdown");
  if (menu) menu.classList.remove("open");
}

function setDeviceMode(mode, event) {
  if (event) event.stopPropagation();
  deviceConfigMode = mode;
  localStorage.setItem("safegig_device_mode", mode);
  closeDeviceMenu();
  updateDeviceConfiguration();
}

function toggleMobileResumeEditor() {
  const body = document.getElementById("uploadPanelBody");
  const btn = document.getElementById("collapseBarBtn");
  if (!body) return;
  const isHidden = body.style.display === "none";
  if (isHidden) {
    body.style.display = "block";
    if (btn) btn.innerHTML = "Hide Editor ▲";
  } else {
    body.style.display = "none";
    if (btn) btn.innerHTML = "Show / Edit Text ▾";
  }
}

function collapseMobileResumeEditor(collapse) {
  const body = document.getElementById("uploadPanelBody");
  const btn = document.getElementById("collapseBarBtn");
  if (!body) return;
  if (collapse) {
    body.style.display = "none";
    if (btn) btn.innerHTML = "Show / Edit Text ▾";
  } else {
    body.style.display = "block";
    if (btn) btn.innerHTML = "Hide Editor ▲";
  }
}

function renderDrawerUserCard() {
  const container = document.getElementById("drawerUserCard");
  if (!container) return;

  if (currentUser) {
    const roleIcon = currentUser.role === "admin" ? "👑" : "🎓";
    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
        <div>
          <div style="font-weight:800; color:#FFF; font-size:0.95rem;">${roleIcon} ${currentUser.name}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${currentUser.email}</div>
        </div>
        <span class="nav-role-badge ${currentUser.role === 'admin' ? 'admin' : ''}">${currentUser.role}</span>
      </div>
      <button class="nav-logout-btn" onclick="logout(); closeMobileNav();" style="width:100%; justify-content:center; padding:0.5rem;">
        🚪 Logout
      </button>
    `;
  } else {
    container.innerHTML = `
      <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.5rem;">
        Browsing as Guest Candidate
      </div>
      <div style="display:flex; gap:0.4rem;">
        <button class="auth-modal-btn" onclick="closeMobileNav(); openAuthModal('student');" style="flex:1; justify-content:center; padding:0.55rem; font-size:0.8rem;">
          🎓 Candidate Login
        </button>
        <button class="auth-modal-btn" onclick="closeMobileNav(); openAuthModal('admin');" style="flex:1; justify-content:center; padding:0.55rem; font-size:0.8rem; background:rgba(236,72,153,0.2); border-color:#EC4899; color:#F472B6;">
          👑 Admin
        </button>
      </div>
    `;
  }
}

// ==========================================
// TAB NAVIGATION & MOBILE MENU
// ==========================================

function toggleMobileNav() {
  const tabs = document.getElementById("navTabsContainer");
  const backdrop = document.getElementById("mobileNavBackdrop");
  const btn = document.getElementById("mobileMenuBtn");
  if (tabs && backdrop) {
    const isOpen = tabs.classList.contains("mobile-open");
    if (isOpen) {
      closeMobileNav();
    } else {
      renderDrawerUserCard();
      tabs.classList.add("mobile-open");
      backdrop.classList.add("open");
      if (btn) btn.classList.add("open");
      document.body.style.overflow = "hidden";
    }
  }
}

function closeMobileNav() {
  const tabs = document.getElementById("navTabsContainer");
  const backdrop = document.getElementById("mobileNavBackdrop");
  const btn = document.getElementById("mobileMenuBtn");
  if (tabs) tabs.classList.remove("mobile-open");
  if (backdrop) backdrop.classList.remove("open");
  if (btn) btn.classList.remove("open");
  document.body.style.overflow = "";
}

function switchTab(tabId) {
  closeMobileNav();
  document.querySelectorAll(".nav-tab-btn, .mob-bottom-btn, .mobile-subnav-pill").forEach(btn => btn.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(content => content.style.display = "none");

  const tabMap = {
    matcher: { btn: "tabBtnMatcher", mob: "mobTabBtnMatcher", tab: "matcherTab" },
    directory: { btn: "tabBtnDirectory", mob: "mobTabBtnDirectory", tab: "directoryTab" },
    applications: { btn: "tabBtnApplications", mob: "mobTabBtnApplications", tab: "applicationsTab" },
    admin: { btn: "tabBtnAdmin", mob: "mobTabBtnAdmin", tab: "adminTab" },
    booster: { btn: "tabBtnBooster", mob: "mobTabBtnBooster", tab: "boosterTab" }
  };

  const entry = tabMap[tabId];
  if (entry) {
    const btn = document.getElementById(entry.btn);
    if (btn) btn.classList.add("active");
    const mob = document.getElementById(entry.mob);
    if (mob) mob.classList.add("active");
    const tab = document.getElementById(entry.tab);
    if (tab) tab.style.display = "block";
  }

  // Smooth scroll to top on mobile for fluid tab transition
  if (window.innerWidth <= 768 || document.body.classList.contains("device-phone") || document.body.classList.contains("force-phone-mode")) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (tabId === "directory") {
    renderDirectoryGrid(allMncs);
  } else if (tabId === "applications") {
    fetchMyApplications();
  } else if (tabId === "admin") {
    fetchAdminDashboard();
  } else if (tabId === "booster") {
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

function loadPreset(key, scroll = true) {
  const preset = PRESET_RESUMES[key];
  if (!preset) return;

  document.querySelectorAll(".preset-btn").forEach(btn => btn.classList.remove("active"));
  const activeBtn = document.querySelector(`.preset-btn[onclick*="${key}"]`);
  if (activeBtn) activeBtn.classList.add("active");

  showUploadedFileBadge(`Preset: ${preset.title}.txt`, preset.text.length);
  document.getElementById("resumeText").value = preset.text;
  analyzeResume(scroll);
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
  if (!file) return;

  const dropzoneText = document.querySelector(".dropzone-text");
  if (dropzoneText) dropzoneText.innerText = `Uploaded: ${file.name}`;

  showUploadParsing(true, `Reading and parsing ${file.name}...`);

  const fileExt = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

  if (fileExt === ".txt") {
    const reader = new FileReader();
    reader.onload = function(e) {
      onFileTextExtracted(file, e.target.result);
    };
    reader.readAsText(file);
  } else if (fileExt === ".pdf") {
    const reader = new FileReader();
    reader.onload = async function(e) {
      try {
        if (window.pdfjsLib) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          const typedarray = new Uint8Array(e.target.result);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          let fullText = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(" ");
            fullText += pageText + "\n";
          }
          if (fullText && fullText.trim().length > 20) {
            onFileTextExtracted(file, fullText);
            return;
          }
        }
      } catch (err) {
        console.warn("PDF extraction fallback:", err);
      }
      fallbackBinaryTextExtract(file, e.target.result);
    };
    reader.readAsArrayBuffer(file);
  } else if (fileExt === ".docx") {
    const reader = new FileReader();
    reader.onload = async function(e) {
      try {
        if (window.mammoth) {
          const result = await mammoth.extractRawText({ arrayBuffer: e.target.result });
          if (result && result.value && result.value.trim().length > 20) {
            onFileTextExtracted(file, result.value);
            return;
          }
        }
      } catch (err) {
        console.warn("DOCX extraction fallback:", err);
      }
      fallbackBinaryTextExtract(file, e.target.result);
    };
    reader.readAsArrayBuffer(file);
  } else {
    const reader = new FileReader();
    reader.onload = function(e) {
      fallbackBinaryTextExtract(file, e.target.result);
    };
    reader.readAsArrayBuffer(file);
  }
}

function fallbackBinaryTextExtract(file, arrayBuffer) {
  try {
    const dec = new TextDecoder("utf-8");
    const rawString = dec.decode(arrayBuffer);
    const cleanText = rawString.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, " ").replace(/\s+/g, " ");
    onFileTextExtracted(file, cleanText || `Parsed resume from ${file.name}`);
  } catch (e) {
    onFileTextExtracted(file, `Extracted resume from ${file.name}`);
  }
}

function onFileTextExtracted(file, text) {
  showUploadParsing(false);
  showUploadedFileBadge(file.name, file.size);
  document.getElementById("resumeText").value = text;
  analyzeResume(true);
}

function showUploadParsing(isParsing, message = "") {
  const bar = document.getElementById("uploadParsingStatus");
  const txt = document.getElementById("uploadParsingText");
  if (bar && txt) {
    if (isParsing) {
      txt.innerText = message;
      bar.style.display = "flex";
    } else {
      bar.style.display = "none";
    }
  }
}

function showUploadedFileBadge(name, size) {
  const badge = document.getElementById("uploadedFileBadge");
  const nameEl = document.getElementById("uploadedFileName");
  const sizeEl = document.getElementById("uploadedFileSize");
  const kb = (size / 1024).toFixed(1);
  if (badge && nameEl && sizeEl) {
    nameEl.innerText = name;
    sizeEl.innerText = `(${kb} KB)`;
    badge.style.display = "flex";
  }

  // Update mobile collapse bar
  const collapseBar = document.getElementById("mobileResumeCollapseBar");
  const collapseTitle = document.getElementById("collapseBarTitle");
  if (collapseBar && collapseTitle) {
    collapseTitle.innerText = `${name} (${kb} KB)`;
    const isMobileLayout = window.innerWidth <= 768 || document.body.classList.contains("device-phone") || document.body.classList.contains("force-phone-mode");
    if (isMobileLayout) {
      collapseBar.style.display = "flex";
    }
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function analyzeResume(scroll = true) {
  const resumeText = document.getElementById("resumeText").value;
  if (!resumeText || resumeText.trim().length === 0) {
    alert("Please upload a resume file or paste resume text first.");
    return;
  }

  showUploadParsing(true, "Scanning tech stack against 35+ Fortune 500 MNC profiles...");

  try {
    const res = await fetch("/api/match-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText })
    });

    showUploadParsing(false);

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Failed to analyze resume.");
      return;
    }

    currentAnalysis = await res.json();
    renderOverviewCard(currentAnalysis.parsedData);

    // Build unified ranked list of all matches
    const top10 = (currentAnalysis.top10Matches || []).map((m, idx) => ({
      ...m,
      rank: idx + 1,
      tierGroup: "TOP10"
    }));

    const mild10 = (currentAnalysis.mild10Matches || []).map((m, idx) => ({
      ...m,
      rank: idx + 11,
      tierGroup: "MILD10"
    }));

    allMatchedCompaniesList = [...top10, ...mild10];

    // If on mobile screen or phone mode, collapse editor so user immediately sees results
    const isMobileLayout = window.innerWidth <= 768 || document.body.classList.contains("device-phone") || document.body.classList.contains("force-phone-mode");
    if (isMobileLayout) {
      const panelBody = document.getElementById("uploadPanelBody");
      const collapseBar = document.getElementById("mobileResumeCollapseBar");
      if (panelBody && collapseBar) {
        panelBody.style.display = "none";
        collapseBar.style.display = "flex";
        const btn = document.getElementById("collapseBarBtn");
        if (btn) btn.innerHTML = "Show / Edit Text ▾";
      }
    }

    // Ensure primary Interactive Table View is active and visible
    switchViewMode("table", false);
    renderCompanyTableView();

    // Render secondary Cards View
    renderTop10AndMild10(currentAnalysis.top10Matches, currentAnalysis.mild10Matches);

    if (currentAnalysis.parsedData.extractedSkills) {
      boosterSkills = new Set(currentAnalysis.parsedData.extractedSkills);
    }

    // Smoothly bring the matched companies table into view after resume analysis
    if (scroll) {
      setTimeout(() => {
        const resultsSection = document.getElementById("companyResultsSection") || document.getElementById("companyTableView");
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 180);
    }
  } catch (err) {
    showUploadParsing(false);
    console.error("Match API Error:", err);
  }
}

function renderOverviewCard(parsedData) {
  document.getElementById("atsScoreVal").innerText = `${parsedData.atsScore}%`;
  const ring = document.querySelector(".ats-ring");
  if (ring) ring.style.setProperty("--ats-val", parsedData.atsScore);

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

// ==========================================
// INTERACTIVE COMPANIES RESULT TABLE LOGIC
// ==========================================

function getFilteredCompanyMatches() {
  let filtered = [...allMatchedCompaniesList];

  // 1. Filter by Current Tab Filter
  if (currentTableFilter === "TOP10") {
    filtered = filtered.filter(m => m.rank <= 10 || m.tierGroup === "TOP10");
  } else if (currentTableFilter === "MILD10") {
    filtered = filtered.filter(m => (m.rank > 10 && m.rank <= 20) || m.tierGroup === "MILD10");
  }

  // 2. Filter by Industry Domain
  if (currentDomainFilter && currentDomainFilter !== "All") {
    filtered = filtered.filter(m => m.domain && m.domain.toLowerCase().includes(currentDomainFilter.toLowerCase()));
  }

  // 3. Filter by Search Query
  if (tableSearchQuery) {
    const q = tableSearchQuery;
    filtered = filtered.filter(m => {
      const nameMatch = m.name.toLowerCase().includes(q);
      const domainMatch = m.domain && m.domain.toLowerCase().includes(q);
      const tierMatch = m.tier && m.tier.toLowerCase().includes(q);
      const skillMatch = (m.matchedSkills || []).some(s => s.toLowerCase().includes(q)) ||
                         (m.missingSkills || []).some(s => s.toLowerCase().includes(q));
      const posMatch = (m.matchingPositions || []).some(p => p.title.toLowerCase().includes(q) || (p.location && p.location.toLowerCase().includes(q)));
      return nameMatch || domainMatch || tierMatch || skillMatch || posMatch;
    });
  }

  return filtered;
}

function renderCompanyTableView() {
  const tbody = document.getElementById("companyTableBody");
  const emptyState = document.getElementById("tableEmptyState");
  const table = document.getElementById("companyMatchTable");
  if (!tbody) return;

  let filtered = getFilteredCompanyMatches();

  // 4. Sort
  filtered.sort((a, b) => {
    let diff = 0;
    if (tableSortColumn === "rank") {
      diff = a.rank - b.rank;
    } else if (tableSortColumn === "name") {
      diff = a.name.localeCompare(b.name);
    } else if (tableSortColumn === "score") {
      diff = b.matchScore - a.matchScore;
    } else if (tableSortColumn === "skills") {
      diff = (b.matchedSkills ? b.matchedSkills.length : 0) - (a.matchedSkills ? a.matchedSkills.length : 0);
    } else if (tableSortColumn === "deadline") {
      const deadA = (a.matchingPositions && a.matchingPositions[0] && a.matchingPositions[0].deadline) || "9999-99-99";
      const deadB = (b.matchingPositions && b.matchingPositions[0] && b.matchingPositions[0].deadline) || "9999-99-99";
      diff = deadA.localeCompare(deadB);
    }
    return tableSortDirection === "asc" ? diff : -diff;
  });

  // Update Sort Indicators
  updateSortIcons();

  // 5. Update Metrics Banner
  const totalOpeningsCount = filtered.reduce((acc, m) => acc + (m.matchingPositions ? m.matchingPositions.length : 0), 0);
  const metricCount = document.getElementById("metricShowingCount");
  if (metricCount) metricCount.innerText = filtered.length;

  const topMatchEl = document.getElementById("metricTopMatchName");
  if (topMatchEl) {
    if (filtered.length > 0) {
      topMatchEl.innerText = `${filtered[0].name} (${filtered[0].matchScore}%)`;
    } else {
      topMatchEl.innerText = "None";
    }
  }

  const openingsEl = document.getElementById("metricTotalOpenings");
  if (openingsEl) openingsEl.innerText = `${totalOpeningsCount}+`;

  const countPill = document.getElementById("countPillAll");
  if (countPill) countPill.innerText = allMatchedCompaniesList.length;

  // 6. Handle Empty State
  if (filtered.length === 0) {
    tbody.innerHTML = "";
    if (emptyState) emptyState.style.display = "block";
    if (table) table.style.display = "none";
    return;
  }

  if (emptyState) emptyState.style.display = "none";
  if (table) table.style.display = "table";

  // 7. Render Table Rows
  let html = "";
  filtered.forEach(mnc => {
    const isExpanded = expandedCompanyIds.has(mnc.mncId || mnc.id);
    html += createCompanyTableRow(mnc, isExpanded);
    if (isExpanded) {
      html += createExpandedDrawerRow(mnc);
    }
  });

  tbody.innerHTML = html;
}

function createCompanyTableRow(mnc, isExpanded) {
  const mncId = mnc.mncId || mnc.id;
  const isTopFit = mnc.matchScore >= 75;
  const scoreClass = isTopFit ? "high" : "mild";
  const scoreTag = isTopFit ? "High Fit" : "Growth Fit";

  // Rank styling
  let rankBadge = `<span class="rank-badge standard">#${mnc.rank}</span>`;
  if (mnc.rank === 1) {
    rankBadge = `<span class="rank-badge gold" title="Rank 1: Top Candidate Match">#1 🥇</span>`;
  } else if (mnc.rank === 2) {
    rankBadge = `<span class="rank-badge silver" title="Rank 2: Outstanding Fit">#2 🥈</span>`;
  } else if (mnc.rank === 3) {
    rankBadge = `<span class="rank-badge bronze" title="Rank 3: Premier Match">#3 🥉</span>`;
  }

  // Skills chips
  const matchedChips = (mnc.matchedSkills || []).slice(0, 3).map(s => `
    <span class="skill-chip-matched" title="Matched in Resume">✓ ${escapeHtml(s)}</span>
  `).join("");

  const gapChips = (mnc.missingSkills || []).slice(0, 2).map(s => `
    <span class="skill-chip-gap" title="Recommended to Learn">+ ${escapeHtml(s)}</span>
  `).join("");

  const totalMatchedCount = mnc.matchedSkills ? mnc.matchedSkills.length : 0;
  const totalMissingCount = mnc.missingSkills ? mnc.missingSkills.length : 0;

  // Positions
  const topPos = (mnc.matchingPositions && mnc.matchingPositions[0]) || {
    title: "Software Engineer",
    location: "Global / Hybrid",
    type: "Full-Time",
    deadline: "2026-10-31"
  };

  const morePositionsCount = (mnc.matchingPositions && mnc.matchingPositions.length > 1)
    ? mnc.matchingPositions.length - 1
    : 0;

  // Application Status for top position
  const appKey = `${mnc.name.toLowerCase()}:${topPos.title.toLowerCase()}`;
  const isApplied = userAppliedKeys.has(appKey);

  const fallbackLogo = `https://via.placeholder.com/44?text=${encodeURIComponent(mnc.name.substring(0, 2))}`;

  return `
    <tr class="company-main-row ${isExpanded ? 'is-expanded' : ''}" onclick="toggleRowExpansion('${mncId}')">
      <!-- 1. RANK -->
      <td>
        ${rankBadge}
      </td>

      <!-- 2. COMPANY & DOMAIN -->
      <td>
        <div class="company-info-cell">
          <div class="comp-logo-box">
            <img src="${mnc.logo || fallbackLogo}" alt="${escapeHtml(mnc.name)}" onerror="this.src='${fallbackLogo}'">
          </div>
          <div class="comp-title-group">
            <div class="comp-name-wrap">
              <span class="comp-name-text" onclick="event.stopPropagation(); openMncModal('${mncId}')">
                ${escapeHtml(mnc.name)}
              </span>
              <span class="comp-verified-badge" title="Verified SafeGig Global MNC Partner">✓</span>
            </div>
            <div class="comp-tags-row">
              <span class="comp-domain-pill">${escapeHtml(mnc.domain)}</span>
              <span class="comp-tier-pill">${escapeHtml(mnc.tier)}</span>
            </div>
          </div>
        </div>
      </td>

      <!-- 3. MATCH FIT & SCORE -->
      <td>
        <div class="score-gauge-wrap">
          <div class="score-num-row">
            <span class="score-gauge-val" style="color: ${isTopFit ? '#34D399' : '#FBBF24'};">${mnc.matchScore}%</span>
            <span class="score-tag-badge ${isTopFit ? 'score-tag-high' : 'score-tag-mild'}">${scoreTag}</span>
          </div>
          <div class="score-progress-bar">
            <div class="score-progress-fill ${scoreClass}" style="width: ${mnc.matchScore}%;"></div>
          </div>
        </div>
      </td>

      <!-- 4. MATCHED SKILLS & GAPS -->
      <td>
        <div class="skills-cell-content">
          <div class="skills-chips-row">
            ${matchedChips || "<span style='font-size:0.75rem; color:var(--text-dim)'>No direct overlap</span>"}
            ${gapChips}
          </div>
          <div class="skills-summary-text">
            <span>${totalMatchedCount} matched</span> • <span>${totalMissingCount} recommended</span>
          </div>
        </div>
      </td>

      <!-- 5. TOP OPENING & LOCATION -->
      <td>
        <div class="pos-title-text">${escapeHtml(topPos.title)}</div>
        <div class="pos-meta-text">
          <span>📍 ${escapeHtml(topPos.location || "Hybrid")}</span>
          <span>•</span>
          <span>💼 ${escapeHtml(topPos.type || "Full-Time")}</span>
        </div>
        ${morePositionsCount > 0 ? `
          <div class="pos-more-count" onclick="event.stopPropagation(); toggleRowExpansion('${mncId}')">
            +${morePositionsCount} more opening(s) ▾
          </div>
        ` : ''}
      </td>

      <!-- 6. EST. COMPENSATION -->
      <td>
        <div class="salary-val-text">${escapeHtml(mnc.salaryRange || "Competitive")}</div>
        <div class="hiring-status-pill">
          <span style="color:#10B981;">●</span> ${escapeHtml(mnc.hiringStatus || "Actively Hiring")}
        </div>
      </td>

      <!-- 7. DEADLINE -->
      <td>
        <div class="deadline-date-text">📅 ${escapeHtml(topPos.deadline || "2026-10-31")}</div>
        <span class="deadline-urgent-badge">Active Round</span>
      </td>

      <!-- 8. ACTIONS -->
      <td>
        <div class="actions-cell-content">
          ${isApplied
            ? `<button class="btn-table-applied" onclick="event.stopPropagation(); switchTab('applications')">✓ Applied</button>`
            : `<button class="btn-table-apply" onclick="event.stopPropagation(); openApplyModal('${mncId}', '${escapeHtml(mnc.name)}', '${escapeHtml(topPos.title)}', '${topPos.deadline || "2026-10-31"}')">
                 🚀 Apply
               </button>`
          }
          <button class="btn-table-expand ${isExpanded ? 'active' : ''}" onclick="event.stopPropagation(); toggleRowExpansion('${mncId}')" title="${isExpanded ? 'Collapse breakdown' : 'Inspect match details & openings'}">
            ${isExpanded ? '▲' : '🔍'}
          </button>
          <a href="${mnc.careerUrl}" target="_blank" rel="noopener noreferrer" class="btn-table-portal" onclick="event.stopPropagation();" title="Visit Official Careers Portal">
            ↗
          </a>
        </div>
      </td>
    </tr>
  `;
}

function createExpandedDrawerRow(mnc) {
  const mncId = mnc.mncId || mnc.id;

  const positionsHtml = (mnc.matchingPositions || []).map(pos => {
    const appKey = `${mnc.name.toLowerCase()}:${pos.title.toLowerCase()}`;
    const isApplied = userAppliedKeys.has(appKey);
    const deadline = pos.deadline || "2026-10-31";

    const posSkills = (pos.skills || []).map(s => {
      const isMatched = (mnc.matchedSkills || []).some(m => m.toLowerCase() === s.toLowerCase());
      return `<span class="skill-tag ${isMatched ? 'matched' : ''}" style="font-size:0.7rem; padding: 0.1rem 0.45rem;">${isMatched ? '✓' : ''} ${escapeHtml(s)}</span>`;
    }).join(" ");

    return `
      <div class="drawer-job-card">
        <div>
          <div class="drawer-job-header">
            <div class="drawer-job-title">${escapeHtml(pos.title)}</div>
            ${isApplied
              ? `<span class="btn-applied-already" style="padding:0.25rem 0.6rem; font-size:0.75rem;">✓ Applied</span>`
              : `<button class="btn-apply-job" onclick="event.stopPropagation(); openApplyModal('${mncId}', '${escapeHtml(mnc.name)}', '${escapeHtml(pos.title)}', '${deadline}')" style="padding:0.3rem 0.7rem; font-size:0.75rem;">
                   🚀 1-Click Apply
                 </button>`
            }
          </div>
          <div class="drawer-job-meta">
            <span>📍 ${escapeHtml(pos.location || 'Global')}</span>
            <span>💼 ${escapeHtml(pos.type || 'Full-Time')}</span>
            <span>⏱️ Req: ${escapeHtml(pos.experienceReq || '0-3 yrs')}</span>
          </div>
          <div class="drawer-job-skills">
            <div style="font-size:0.725rem; color:var(--text-muted); margin-bottom:0.25rem;">Required Tech Stack:</div>
            <div class="tags-flex">${posSkills}</div>
          </div>
        </div>
        <div class="drawer-job-footer">
          <div class="drawer-deadline-info">📅 Application Closes: ${escapeHtml(deadline)}</div>
          <span style="font-size:0.75rem; color:#34D399; font-weight:700;">Role Match: ${pos.posMatchPct || 70}%</span>
        </div>
      </div>
    `;
  }).join("");

  const allMatchedSkillsHtml = (mnc.matchedSkills || []).map(s => `
    <span class="skill-chip-matched" style="font-size:0.8rem; padding:0.2rem 0.6rem;">✓ ${escapeHtml(s)}</span>
  `).join(" ");

  const allMissingSkillsHtml = (mnc.missingSkills || []).map(s => `
    <span class="skill-chip-gap" style="font-size:0.8rem; padding:0.2rem 0.6rem;">+ ${escapeHtml(s)}</span>
  `).join(" ");

  return `
    <tr class="table-expanded-row">
      <td colspan="8">
        <div class="expanded-drawer-panel">
          <!-- TOP: AI MATCH RATIONALE & CORPORATE DETAILS -->
          <div class="drawer-top-grid">
            <div class="drawer-reason-card">
              <div class="drawer-reason-title">
                <span>🎯 SafeGig AI Match Rationale</span>
              </div>
              <p class="drawer-reason-text">
                ${escapeHtml(mnc.matchReason)}
              </p>
              
              <div style="margin-top: 0.85rem; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.08);">
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.35rem; font-weight: 700;">
                  YOUR MATCHED SKILLS (${mnc.matchedSkills ? mnc.matchedSkills.length : 0}):
                </div>
                <div class="tags-flex">${allMatchedSkillsHtml || "<span style='font-size:0.8rem; color:var(--text-dim)'>None</span>"}</div>
              </div>

              ${mnc.missingSkills && mnc.missingSkills.length > 0 ? `
                <div style="margin-top: 0.65rem;">
                  <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.35rem; font-weight: 700;">
                    SKILL GROWTH ROADMAP (Bridge these gaps for 100% Fit):
                  </div>
                  <div class="tags-flex">${allMissingSkillsHtml}</div>
                </div>
              ` : ''}
            </div>

            <div class="drawer-quick-stats-card">
              <div style="font-size: 0.85rem; font-weight: 800; color: #FFF; margin-bottom: 0.4rem;">
                🏢 Corporate Profile
              </div>
              <div class="drawer-stat-row">
                <span class="drawer-stat-label">Global HQ:</span>
                <span class="drawer-stat-val">${escapeHtml(mnc.headquarters)}</span>
              </div>
              <div class="drawer-stat-row">
                <span class="drawer-stat-label">Workforce Size:</span>
                <span class="drawer-stat-val">${escapeHtml(mnc.size || '100,000+ employees')}</span>
              </div>
              <div class="drawer-stat-row">
                <span class="drawer-stat-label">Industry Domain:</span>
                <span class="drawer-stat-val">${escapeHtml(mnc.domain)}</span>
              </div>
              <div class="drawer-stat-row">
                <span class="drawer-stat-label">Hiring Status:</span>
                <span class="drawer-stat-val" style="color: #34D399;">${escapeHtml(mnc.hiringStatus || 'Actively Hiring')}</span>
              </div>
              <div style="margin-top: 0.75rem; display:flex; gap:0.5rem;">
                <button class="quick-btn" onclick="event.stopPropagation(); openMncModal('${mncId}')" style="flex:1; font-size:0.75rem; padding:0.4rem;">
                  ℹ️ Full Company Info
                </button>
                <a href="${mnc.careerUrl}" target="_blank" rel="noopener noreferrer" class="quick-btn" style="flex:1; text-align:center; font-size:0.75rem; padding:0.4rem; text-decoration:none; background: rgba(59,130,246,0.2); border-color:var(--primary); color:#FFF;">
                  Official Portal ↗
                </a>
              </div>
            </div>
          </div>

          <!-- ACTIVE OPENINGS SECTION -->
          <div class="drawer-jobs-section">
            <div class="drawer-section-header">
              <div class="drawer-section-title">
                <span>💼 Active Job Positions at ${escapeHtml(mnc.name)}</span>
                <span class="badge-count">${mnc.matchingPositions ? mnc.matchingPositions.length : 0} open</span>
              </div>
              <div style="font-size:0.75rem; color:var(--text-muted);">
                1-Click Apply will record your application into "My Applications"
              </div>
            </div>

            <div class="drawer-jobs-grid">
              ${positionsHtml}
            </div>
          </div>
        </div>
      </td>
    </tr>
  `;
}

function toggleRowExpansion(mncId) {
  if (expandedCompanyIds.has(mncId)) {
    expandedCompanyIds.delete(mncId);
  } else {
    expandedCompanyIds.add(mncId);
  }
  renderCompanyTableView();
}

function setTableSort(col) {
  if (tableSortColumn === col) {
    tableSortDirection = tableSortDirection === "asc" ? "desc" : "asc";
  } else {
    tableSortColumn = col;
    tableSortDirection = (col === "score" || col === "skills") ? "desc" : "asc";
  }
  renderCompanyTableView();
}

function updateSortIcons() {
  const icons = {
    rank: document.getElementById("sortRankIcon"),
    name: document.getElementById("sortNameIcon"),
    score: document.getElementById("sortScoreIcon"),
    skills: document.getElementById("sortSkillsIcon"),
    deadline: document.getElementById("sortDeadlineIcon")
  };

  Object.keys(icons).forEach(col => {
    const el = icons[col];
    if (!el) return;
    if (tableSortColumn === col) {
      el.innerText = tableSortDirection === "asc" ? "▲" : "▼";
      el.style.opacity = "1";
    } else {
      el.innerText = "↕";
      el.style.opacity = "0.4";
    }
  });
}

function setTableFilter(filter, btn) {
  currentTableFilter = filter;
  document.querySelectorAll(".table-filter-pill").forEach(p => p.classList.remove("active"));
  if (btn) btn.classList.add("active");
  renderCompanyTableView();
  renderTop10AndMild10();
}

function onTableFilterChange() {
  const select = document.getElementById("tableDomainSelect");
  if (select) {
    currentDomainFilter = select.value;
  }
  renderCompanyTableView();
  renderTop10AndMild10();
}

function onTableSearchChange() {
  const input = document.getElementById("tableSearchInput");
  const clearBtn = document.getElementById("tableSearchClear");
  if (input) {
    tableSearchQuery = input.value.trim().toLowerCase();
    if (clearBtn) clearBtn.style.display = tableSearchQuery ? "block" : "none";
  }
  renderCompanyTableView();
  renderTop10AndMild10();
}

function clearTableSearch() {
  const input = document.getElementById("tableSearchInput");
  const clearBtn = document.getElementById("tableSearchClear");
  if (input) input.value = "";
  if (clearBtn) clearBtn.style.display = "none";
  tableSearchQuery = "";
  renderCompanyTableView();
  renderTop10AndMild10();
}

function resetTableFilters() {
  currentTableFilter = "ALL";
  currentDomainFilter = "All";
  tableSearchQuery = "";

  const select = document.getElementById("tableDomainSelect");
  if (select) select.value = "All";

  const input = document.getElementById("tableSearchInput");
  if (input) input.value = "";

  const clearBtn = document.getElementById("tableSearchClear");
  if (clearBtn) clearBtn.style.display = "none";

  document.querySelectorAll(".table-filter-pill").forEach(p => p.classList.remove("active"));
  const allPill = document.getElementById("filterPillAll");
  if (allPill) allPill.classList.add("active");

  renderCompanyTableView();
  renderTop10AndMild10();
}

function switchViewMode(mode, userInitiated = true) {
  if (userInitiated) {
    userExplicitlyChoseViewMode = true;
  }
  currentViewMode = mode;
  const btnTable = document.getElementById("btnViewTable");
  const btnCards = document.getElementById("btnViewCards");
  const tableView = document.getElementById("companyTableView");
  const cardsView = document.getElementById("companyCardsView");

  if (mode === "table") {
    if (btnTable) btnTable.classList.add("active");
    if (btnCards) btnCards.classList.remove("active");
    if (tableView) tableView.style.display = "block";
    if (cardsView) cardsView.style.display = "none";
    renderCompanyTableView();
  } else {
    if (btnCards) btnCards.classList.add("active");
    if (btnTable) btnTable.classList.remove("active");
    if (tableView) tableView.style.display = "none";
    if (cardsView) cardsView.style.display = "block";
    renderTop10AndMild10();
  }
}

function exportMatchesToCSV() {
  if (!allMatchedCompaniesList || allMatchedCompaniesList.length === 0) {
    alert("Please analyze a resume first to generate company matches.");
    return;
  }

  const headers = [
    "Rank", "Company Name", "Match Fit (%)", "Domain", "Tier", "Headquarters",
    "Est. Compensation", "Matched Skills", "Missing Skills", "Top Position Title", "Location", "Deadline", "Career Portal"
  ];

  const rows = allMatchedCompaniesList.map(m => {
    const topPos = (m.matchingPositions && m.matchingPositions[0]) || {};
    return [
      m.rank,
      `"${(m.name || '').replace(/"/g, '""')}"`,
      `${m.matchScore}%`,
      `"${(m.domain || '').replace(/"/g, '""')}"`,
      `"${(m.tier || '').replace(/"/g, '""')}"`,
      `"${(m.headquarters || '').replace(/"/g, '""')}"`,
      `"${(m.salaryRange || '').replace(/"/g, '""')}"`,
      `"${(m.matchedSkills || []).join(", ").replace(/"/g, '""')}"`,
      `"${(m.missingSkills || []).join(", ").replace(/"/g, '""')}"`,
      `"${(topPos.title || '').replace(/"/g, '""')}"`,
      `"${(topPos.location || '').replace(/"/g, '""')}"`,
      `"${topPos.deadline || ''}"`,
      `"${m.careerUrl || ''}"`
    ].join(",");
  });

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `SafeGig_Company_Matches_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function printMatchReport() {
  window.print();
}

// ==========================================
// SECONDARY CARDS VIEW RENDERING
// ==========================================

function renderTop10AndMild10(top10, mild10) {
  const topContainer = document.getElementById("top10Container");
  const mildContainer = document.getElementById("mild10Container");

  if (!topContainer || !mildContainer) return;

  topContainer.innerHTML = "";
  mildContainer.innerHTML = "";

  const list = (top10 && mild10) ? [...top10, ...mild10] : getFilteredCompanyMatches();
  const topList = list.filter(m => (m.tierGroup === "TOP10" || m.rank <= 10 || m.matchScore >= 75));
  const mildList = list.filter(m => (m.tierGroup === "MILD10" || (m.rank > 10 && m.rank <= 20) || (m.matchScore < 75 && m.matchScore >= 45)));

  if (topList.length === 0) {
    topContainer.innerHTML = `<div style="color:var(--text-muted); font-size:0.9rem; padding:1.25rem; text-align:center; background:var(--bg-card); border-radius:var(--radius-md); border:1px dashed var(--border-color);">No high fit companies match your current search/filters.</div>`;
  } else {
    topList.forEach((mnc, idx) => {
      topContainer.appendChild(createMncCardElement(mnc, mnc.rank || (idx + 1), true));
    });
  }

  if (mildList.length === 0) {
    mildContainer.innerHTML = `<div style="color:var(--text-muted); font-size:0.9rem; padding:1.25rem; text-align:center; background:var(--bg-card); border-radius:var(--radius-md); border:1px dashed var(--border-color);">No growth fit companies match your current search/filters.</div>`;
  } else {
    mildList.forEach((mnc, idx) => {
      mildContainer.appendChild(createMncCardElement(mnc, mnc.rank || (idx + 11), false));
    });
  }
}

function createMncCardElement(mnc, rank, isTopRank) {
  const card = document.createElement("div");
  card.className = `mnc-card ${isTopRank ? "top-rank" : "mild-rank"}`;

  const matchedSkillsHtml = (mnc.matchedSkills || []).map(s => `<span class="skill-tag matched">✓ ${escapeHtml(s)}</span>`).join(" ");
  const missingSkillsHtml = (mnc.missingSkills || []).slice(0, 4).map(s => `<span class="skill-tag missing">+ ${escapeHtml(s)}</span>`).join(" ");

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
          <div class="job-title">${escapeHtml(j.title)}</div>
          ${isApplied
            ? `<span class="btn-applied-already">✓ Applied</span>`
            : `<button class="btn-apply-job" onclick="openApplyModal('${mnc.mncId || mnc.id}', '${escapeHtml(mnc.name)}', '${escapeHtml(j.title)}', '${deadlineStr}')">
                 🚀 Apply Now
               </button>`
          }
        </div>
        <div class="job-details" style="margin-top: 0.5rem;">
          <span>📍 ${escapeHtml(j.location || 'Global')}</span>
          <span>💼 ${escapeHtml(j.experienceReq || '0-3 yrs')}</span>
          <span style="color:#FBBF24; font-weight:700;">📅 Deadline: ${escapeHtml(deadlineStr)}</span>
        </div>
      </div>
    `;
  }).join("");

  card.innerHTML = `
    <div class="mnc-header">
      <div class="mnc-brand-group">
        <div class="mnc-logo-box">
          <img src="${mnc.logo}" alt="${escapeHtml(mnc.name)} Logo" onerror="this.src='https://via.placeholder.com/50?text=${escapeHtml(mnc.name.substring(0,2))}'">
        </div>
        <div>
          <div class="mnc-name">
            ${escapeHtml(mnc.name)}
            <span class="rank-pill">Rank #${rank}</span>
          </div>
          <div class="mnc-meta">
            <span>🏷️ ${escapeHtml(mnc.domain)}</span>
            <span>⭐ ${escapeHtml(mnc.tier)}</span>
            <span>📍 ${escapeHtml(mnc.headquarters)}</span>
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
      <p class="match-reason">${escapeHtml(mnc.matchReason)}</p>

      <div class="card-skills-row">
        <div class="skill-row-title">Your Matched Skills (${mnc.matchedSkills ? mnc.matchedSkills.length : 0}):</div>
        <div class="tags-flex">${matchedSkillsHtml || "<span style='font-size:0.8rem; color:var(--text-dim)'>No direct overlap</span>"}</div>
      </div>

      ${mnc.missingSkills && mnc.missingSkills.length > 0 ? `
        <div class="card-skills-row">
          <div class="skill-row-title">Recommended Skill Upgrades (${mnc.missingSkills.length}):</div>
          <div class="tags-flex">${missingSkillsHtml}</div>
        </div>
      ` : ''}

      <div class="jobs-list-title">Active Openings at ${escapeHtml(mnc.name)}:</div>
      <div class="jobs-grid">
        ${jobsHtml}
      </div>

      <div class="mnc-footer">
        <div class="salary-tag">Est. Compensation: ${escapeHtml(mnc.salaryRange)}</div>
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
      const count = (data.applications || []).length;
      const stat = document.getElementById("totalAppsStat");
      if (stat) stat.innerText = count;

      const mobBadge = document.getElementById("mobAppCountBadge");
      if (mobBadge) {
        mobBadge.innerText = count;
        mobBadge.style.display = count > 0 ? "inline-flex" : "none";
      }

      if (currentAnalysis) {
        renderCompanyTableView();
        renderTop10AndMild10();
      }
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
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.35rem;">
          <label for="appNotes" style="margin:0;">Cover Note / Qualification Summary (Optional):</label>
          <button type="button" class="tracker-btn secondary" onclick="generateNoteForApplyModal('${companyName}', '${positionTitle}')" style="padding: 0.2rem 0.65rem; font-size: 0.75rem;">
            ✨ Auto-Draft with AI
          </button>
        </div>
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
      renderCompanyTableView();
      renderTop10AndMild10(currentAnalysis.top10Matches, currentAnalysis.mild10Matches);
    }
    renderDirectoryGrid(allMncs);

  } catch (err) {
    alert("Error communicating with server.");
  }
}

// ==========================================
// KANBAN & JOB APPLICATION TRACKER ENGINE
// ==========================================

let currentTrackerView = 'kanban'; // 'kanban' | 'table' | 'dashboard'
let trackerSearchTerm = '';
let trackerStatusFilterVal = 'ALL';
let draggedJobId = null;
let selectedCoverLetterJobId = null;
let currentClTone = 'professional';

const SAMPLE_TRACKER_JOBS = [
  { id: 'job_sample_1', company: 'Google', positionTitle: 'SDE Intern', status: 'Interview', appliedAt: '2026-10-15T10:00:00.000Z', deadline: '2026-11-30', url: 'https://careers.google.com', notes: 'Completed technical coding round. Got referral from senior alumni.' },
  { id: 'job_sample_2', company: 'Microsoft', positionTitle: 'Full Stack Web Engineer', status: 'Applied', appliedAt: '2026-10-20T14:30:00.000Z', deadline: '2026-12-05', url: 'https://careers.microsoft.com', notes: 'Applied via SafeGig 1-click platform. Follow up next Monday.' },
  { id: 'job_sample_3', company: 'Amazon', positionTitle: 'AWS Cloud Support Engineer', status: 'Offer', appliedAt: '2026-10-01T09:15:00.000Z', deadline: '2026-11-15', url: 'https://amazon.jobs', notes: 'Received formal offer letter! Reviewing team placement.' },
  { id: 'job_sample_4', company: 'Uber', positionTitle: 'Backend Systems Engineer', status: 'Rejected', appliedAt: '2026-09-25T11:00:00.000Z', deadline: '2026-10-31', url: 'https://uber.com/careers', notes: 'Role put on hold. Re-apply next hiring window.' }
];

function escapeJsString(str) {
  if (!str) return "";
  return String(str).replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, " ");
}

function normalizeJobStatus(status) {
  if (!status) return 'Applied';
  const s = status.toLowerCase();
  if (s.includes('interview') || s.includes('review') || s.includes('pending')) return 'Interview';
  if (s.includes('offer') || s.includes('accepted')) return 'Offer';
  if (s.includes('reject')) return 'Rejected';
  return 'Applied';
}

function getGuestJobs() {
  try {
    const saved = localStorage.getItem('safegig-tracker-jobs');
    return saved ? JSON.parse(saved) : SAMPLE_TRACKER_JOBS;
  } catch (e) {
    return SAMPLE_TRACKER_JOBS;
  }
}

function saveGuestJobs(jobs) {
  try {
    localStorage.setItem('safegig-tracker-jobs', JSON.stringify(jobs));
  } catch (e) {}
}

async function fetchMyApplications() {
  const guestPrompt = document.getElementById("guestAppsPrompt");

  if (!currentUser) {
    if (guestPrompt) guestPrompt.style.display = "flex";
    myApplicationsList = getGuestJobs();
    updateTrackerStats();
    renderTrackerUI();
    return;
  }

  if (guestPrompt) guestPrompt.style.display = "none";

  try {
    const res = await fetch("/api/applications", {
      headers: { "Authorization": `Bearer ${authToken}` }
    });

    if (res.ok) {
      const data = await res.json();
      myApplicationsList = data.applications || [];
    } else {
      myApplicationsList = getGuestJobs();
    }
  } catch (err) {
    console.error("Error fetching my applications:", err);
    myApplicationsList = getGuestJobs();
  }

  updateTrackerStats();
  renderTrackerUI();
}

function updateTrackerStats() {
  const total = myApplicationsList.length;
  let appliedCount = 0;
  let interviewCount = 0;
  let offerCount = 0;
  let rejectedCount = 0;

  myApplicationsList.forEach(job => {
    const norm = normalizeJobStatus(job.status);
    if (norm === 'Applied') appliedCount++;
    else if (norm === 'Interview') interviewCount++;
    else if (norm === 'Offer') offerCount++;
    else if (norm === 'Rejected') rejectedCount++;
  });

  const totalEl = document.getElementById("myTotalAppsVal");
  if (totalEl) totalEl.innerText = total;

  const appliedEl = document.getElementById("myAppliedAppsVal");
  if (appliedEl) appliedEl.innerText = appliedCount;

  const pendingEl = document.getElementById("myPendingAppsVal");
  if (pendingEl) pendingEl.innerText = interviewCount;

  const acceptedEl = document.getElementById("myAcceptedAppsVal");
  if (acceptedEl) acceptedEl.innerText = offerCount;

  const rejectedEl = document.getElementById("myRejectedAppsVal");
  if (rejectedEl) rejectedEl.innerText = rejectedCount;

  // Conversion rate badge
  const offerRate = total > 0 ? Math.round((offerCount / total) * 100) : 0;
  const badgeEl = document.getElementById("trackerOfferRateBadge");
  if (badgeEl) badgeEl.innerText = `${offerRate}% Offer Rate`;

  // Progress breakdown bars in Analytics tab
  const progressList = document.getElementById("trackerProgressBars");
  if (progressList) {
    const stages = [
      { name: "Applied", count: appliedCount, cls: "applied" },
      { name: "Interview / Review", count: interviewCount, cls: "interview" },
      { name: "Offer / Accepted", count: offerCount, cls: "offer" },
      { name: "Rejected", count: rejectedCount, cls: "rejected" }
    ];
    progressList.innerHTML = stages.map(st => {
      const pct = total > 0 ? Math.round((st.count / total) * 100) : 0;
      return `
        <div class="prog-row">
          <div class="prog-label">${st.name}</div>
          <div class="prog-bar-track">
            <div class="prog-bar-fill ${st.cls}" style="width: ${pct}%"></div>
          </div>
          <div class="prog-count">${st.count} <span style="font-size:0.75rem; color:var(--text-dim);">(${pct}%)</span></div>
        </div>
      `;
    }).join("");
  }

  // Company pills in Analytics tab
  const companyPills = document.getElementById("trackerCompanyPills");
  if (companyPills) {
    const compCounts = {};
    myApplicationsList.forEach(j => {
      const c = j.company || 'Unknown';
      compCounts[c] = (compCounts[c] || 0) + 1;
    });
    const comps = Object.keys(compCounts);
    if (comps.length === 0) {
      companyPills.innerHTML = `<span style="color:var(--text-dim); font-size:0.85rem;">No tracked companies yet.</span>`;
    } else {
      companyPills.innerHTML = comps.map(c => `
        <div class="company-pill">
          🏢 <strong>${escapeHtml(c)}</strong>
          <span class="company-pill-badge">${compCounts[c]}</span>
        </div>
      `).join("");
    }
  }
}

function switchTrackerView(viewName) {
  currentTrackerView = viewName;

  const btnKanban = document.getElementById("btnTrackerKanban");
  const btnTable = document.getElementById("btnTrackerTable");
  const btnDashboard = document.getElementById("btnTrackerDashboard");

  if (btnKanban) btnKanban.classList.toggle("active", viewName === 'kanban');
  if (btnTable) btnTable.classList.toggle("active", viewName === 'table');
  if (btnDashboard) btnDashboard.classList.toggle("active", viewName === 'dashboard');

  const pKanban = document.getElementById("trackerKanbanContainer");
  const pTable = document.getElementById("trackerTableContainer");
  const pDashboard = document.getElementById("trackerDashboardContainer");

  if (pKanban) pKanban.style.display = viewName === 'kanban' ? 'block' : 'none';
  if (pTable) pTable.style.display = viewName === 'table' ? 'block' : 'none';
  if (pDashboard) pDashboard.style.display = viewName === 'dashboard' ? 'block' : 'none';

  renderTrackerUI();
}

function handleTrackerSearch() {
  const input = document.getElementById("trackerSearchInput");
  trackerSearchTerm = (input ? input.value : "").trim().toLowerCase();
  renderTrackerUI();
}

function handleTrackerFilterChange() {
  const select = document.getElementById("trackerStatusFilter");
  trackerStatusFilterVal = select ? select.value : "ALL";
  renderTrackerUI();
}

function filterMyApps(statusFilter, btnEl) {
  trackerStatusFilterVal = statusFilter;
  const select = document.getElementById("trackerStatusFilter");
  if (select) select.value = statusFilter;
  renderTrackerUI();
}

function renderTrackerUI() {
  let filtered = myApplicationsList.filter(job => {
    const comp = (job.company || "").toLowerCase();
    const role = (job.positionTitle || job.role || "").toLowerCase();
    const notes = (job.notes || "").toLowerCase();
    const matchesSearch = !trackerSearchTerm || comp.includes(trackerSearchTerm) || role.includes(trackerSearchTerm) || notes.includes(trackerSearchTerm);

    let matchesStatus = true;
    if (trackerStatusFilterVal && trackerStatusFilterVal !== 'ALL') {
      const norm = normalizeJobStatus(job.status);
      matchesStatus = norm === trackerStatusFilterVal || job.status === trackerStatusFilterVal;
    }

    return matchesSearch && matchesStatus;
  });

  if (currentTrackerView === 'kanban') {
    renderKanbanBoard(filtered);
  } else if (currentTrackerView === 'table') {
    renderTrackerTable(filtered);
  }
}

// ------------------------------------------
// KANBAN BOARD RENDERING & DRAG-AND-DROP
// ------------------------------------------

function renderKanbanBoard(jobs) {
  const colApplied = document.getElementById("kanbanColApplied");
  const colInterview = document.getElementById("kanbanColInterview");
  const colOffer = document.getElementById("kanbanColOffer");
  const colRejected = document.getElementById("kanbanColRejected");

  if (!colApplied || !colInterview || !colOffer || !colRejected) return;

  colApplied.innerHTML = "";
  colInterview.innerHTML = "";
  colOffer.innerHTML = "";
  colRejected.innerHTML = "";

  const groups = {
    Applied: [],
    Interview: [],
    Offer: [],
    Rejected: []
  };

  jobs.forEach(job => {
    const norm = normalizeJobStatus(job.status);
    if (groups[norm]) {
      groups[norm].push(job);
    } else {
      groups.Applied.push(job);
    }
  });

  document.getElementById("countApplied").innerText = groups.Applied.length;
  document.getElementById("countInterview").innerText = groups.Interview.length;
  document.getElementById("countOffer").innerText = groups.Offer.length;
  document.getElementById("countRejected").innerText = groups.Rejected.length;

  // Render cards for each column
  renderKanbanCardsForColumn(colApplied, groups.Applied, 'Applied');
  renderKanbanCardsForColumn(colInterview, groups.Interview, 'Interview');
  renderKanbanCardsForColumn(colOffer, groups.Offer, 'Offer');
  renderKanbanCardsForColumn(colRejected, groups.Rejected, 'Rejected');
}

function renderKanbanCardsForColumn(container, columnJobs, colName) {
  if (columnJobs.length === 0) {
    container.innerHTML = `<div class="kanban-empty">No applications in this stage</div>`;
    return;
  }

  columnJobs.forEach(job => {
    const card = document.createElement("div");
    card.className = "kanban-card";
    card.setAttribute("draggable", "true");
    card.setAttribute("data-id", job.id);

    card.addEventListener("dragstart", (e) => handleKanbanDragStart(e, job.id));
    card.addEventListener("dragend", handleKanbanDragEnd);

    const appliedDate = job.appliedAt 
      ? new Date(job.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : "Recently";

    const deadlineStr = job.deadline ? `📅 Deadline: ${job.deadline}` : "";
    const roleTitle = job.positionTitle || job.role || "Software Engineer";

    card.innerHTML = `
      <div class="kc-top">
        <div class="kc-company">🏢 ${escapeHtml(job.company)}</div>
        ${job.url ? `<a href="${escapeHtml(job.url)}" target="_blank" rel="noreferrer" class="kc-icon-btn" title="View Job Posting">🔗 Link</a>` : ""}
      </div>
      <div class="kc-role">${escapeHtml(roleTitle)}</div>
      
      <div class="kc-meta-row">
        <span>⏰ Applied: ${appliedDate}</span>
        ${job.deadline ? `<span style="color:#FBBF24;">${deadlineStr}</span>` : ""}
      </div>

      ${job.notes ? `<div class="kc-notes">${escapeHtml(job.notes.length > 75 ? job.notes.slice(0, 75) + '...' : job.notes)}</div>` : ""}

      <div class="kc-actions">
        <select class="kc-stage-select" onchange="moveAppStatus('${job.id}', this.value)" title="Move to stage">
          <option value="Applied" ${normalizeJobStatus(job.status) === 'Applied' ? 'selected' : ''}>🔵 Applied</option>
          <option value="Interview" ${normalizeJobStatus(job.status) === 'Interview' ? 'selected' : ''}>🟡 Interview</option>
          <option value="Offer" ${normalizeJobStatus(job.status) === 'Offer' ? 'selected' : ''}>🟢 Offer</option>
          <option value="Rejected" ${normalizeJobStatus(job.status) === 'Rejected' ? 'selected' : ''}>🔴 Rejected</option>
        </select>

        <div class="kc-btn-group">
          <button type="button" class="kc-icon-btn ai-letter" onclick="openCoverLetterModal('${escapeJsString(job.company)}', '${escapeJsString(roleTitle)}', '${job.id}')" title="Generate AI Cover Letter">
            ✨ AI
          </button>
          <button type="button" class="kc-icon-btn" onclick="openEditJobModal('${job.id}')" title="Edit Application">
            ✏️
          </button>
          <button type="button" class="kc-icon-btn delete" onclick="deleteJobApplication('${job.id}')" title="Delete Application">
            🗑️
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function handleKanbanDragStart(e, id) {
  draggedJobId = id;
  e.dataTransfer.setData("text/plain", id);
  e.dataTransfer.effectAllowed = "move";
  setTimeout(() => {
    if (e.target) e.target.classList.add("dragging");
  }, 0);
}

function handleKanbanDragEnd(e) {
  if (e.target) e.target.classList.remove("dragging");
  document.querySelectorAll(".kanban-column").forEach(col => col.classList.remove("drag-over"));
}

function handleKanbanDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  const col = e.currentTarget;
  if (col && !col.classList.contains("drag-over")) {
    col.classList.add("drag-over");
  }
}

function handleKanbanDragLeave(e) {
  const col = e.currentTarget;
  if (col) col.classList.remove("drag-over");
}

function handleKanbanDrop(e, targetStatus) {
  e.preventDefault();
  const col = e.currentTarget;
  if (col) col.classList.remove("drag-over");

  const jobId = e.dataTransfer.getData("text/plain") || draggedJobId;
  if (jobId) {
    moveAppStatus(jobId, targetStatus);
    draggedJobId = null;
  }
}

async function moveAppStatus(jobId, newStatus) {
  const job = myApplicationsList.find(j => String(j.id) === String(jobId));
  if (!job) return;

  const oldStatus = job.status;
  job.status = newStatus;

  // Persist update
  if (currentUser) {
    try {
      const res = await fetch(`/api/applications/${jobId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        console.warn("Failed to persist status change to server, reverting");
        job.status = oldStatus;
      }
    } catch (e) {
      console.warn("Status patch network error:", e);
    }
  } else {
    saveGuestJobs(myApplicationsList);
  }

  updateTrackerStats();
  renderTrackerUI();
}

// ------------------------------------------
// TABLE VIEW RENDERING
// ------------------------------------------

function renderTrackerTable(jobs) {
  const tbody = document.getElementById("trackerTableBody");
  const empty = document.getElementById("trackerTableEmpty");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (jobs.length === 0) {
    if (empty) empty.style.display = "block";
    return;
  }
  if (empty) empty.style.display = "none";

  jobs.forEach(job => {
    const tr = document.createElement("tr");
    const roleTitle = job.positionTitle || job.role || "Software Engineer";
    const appliedDate = job.appliedAt 
      ? new Date(job.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : "—";

    tr.innerHTML = `
      <td>
        <div style="font-weight: 700; color: #FFF;">🏢 ${escapeHtml(job.company)}</div>
        <div style="color: #60A5FA; font-size: 0.8rem; font-weight: 600;">${escapeHtml(roleTitle)}</div>
      </td>
      <td>
        <select class="kc-stage-select" onchange="moveAppStatus('${job.id}', this.value)" style="font-size:0.8rem; padding:0.3rem 0.5rem;">
          <option value="Applied" ${normalizeJobStatus(job.status) === 'Applied' ? 'selected' : ''}>🔵 Applied</option>
          <option value="Interview" ${normalizeJobStatus(job.status) === 'Interview' ? 'selected' : ''}>🟡 Interview</option>
          <option value="Offer" ${normalizeJobStatus(job.status) === 'Offer' ? 'selected' : ''}>🟢 Offer</option>
          <option value="Rejected" ${normalizeJobStatus(job.status) === 'Rejected' ? 'selected' : ''}>🔴 Rejected</option>
        </select>
      </td>
      <td><span style="color: var(--text-muted); font-size: 0.82rem;">${appliedDate}</span></td>
      <td><span style="color: #FBBF24; font-size: 0.82rem;">${job.deadline || '—'}</span></td>
      <td>
        ${job.url ? `<a href="${escapeHtml(job.url)}" target="_blank" rel="noreferrer" class="url-link" style="color:#60A5FA; font-size:0.82rem; text-decoration:underline;">View Link ↗</a>` : '<span style="color:var(--text-dim);">—</span>'}
      </td>
      <td>
        <span style="color: var(--text-muted); font-size: 0.8rem;">
          ${job.notes ? escapeHtml(job.notes.length > 50 ? job.notes.slice(0, 50) + '…' : job.notes) : '—'}
        </span>
      </td>
      <td style="text-align: right;">
        <div style="display: inline-flex; gap: 0.35rem;">
          <button type="button" class="kc-icon-btn ai-letter" onclick="openCoverLetterModal('${escapeJsString(job.company)}', '${escapeJsString(roleTitle)}', '${job.id}')" title="AI Cover Letter">
            ✨ AI
          </button>
          <button type="button" class="kc-icon-btn" onclick="openEditJobModal('${job.id}')" title="Edit">
            ✏️ Edit
          </button>
          <button type="button" class="kc-icon-btn delete" onclick="deleteJobApplication('${job.id}')" title="Delete">
            🗑️
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ------------------------------------------
// ADD / EDIT JOB MODAL HANDLERS
// ------------------------------------------

function openAddJobModal() {
  document.getElementById("jobModalTitle").innerText = "➕ Track Job Application";
  document.getElementById("jobModalSubmitBtnText").innerText = "Save Application";
  document.getElementById("jobModalEditId").value = "";
  document.getElementById("jobModalCompany").value = "";
  document.getElementById("jobModalRole").value = "";
  document.getElementById("jobModalStatus").value = "Applied";
  document.getElementById("jobModalDate").value = new Date().toISOString().split("T")[0];
  document.getElementById("jobModalDeadline").value = "";
  document.getElementById("jobModalUrl").value = "";
  document.getElementById("jobModalNotes").value = "";

  document.getElementById("jobTrackerModal").classList.add("open");
}

function openEditJobModal(jobId) {
  const job = myApplicationsList.find(j => String(j.id) === String(jobId));
  if (!job) return;

  document.getElementById("jobModalTitle").innerText = "✏️ Edit Job Application";
  document.getElementById("jobModalSubmitBtnText").innerText = "Save Changes";
  document.getElementById("jobModalEditId").value = job.id;
  document.getElementById("jobModalCompany").value = job.company || "";
  document.getElementById("jobModalRole").value = job.positionTitle || job.role || "";
  document.getElementById("jobModalStatus").value = normalizeJobStatus(job.status);
  
  if (job.appliedAt) {
    try {
      document.getElementById("jobModalDate").value = new Date(job.appliedAt).toISOString().split("T")[0];
    } catch {
      document.getElementById("jobModalDate").value = new Date().toISOString().split("T")[0];
    }
  } else {
    document.getElementById("jobModalDate").value = new Date().toISOString().split("T")[0];
  }

  document.getElementById("jobModalDeadline").value = job.deadline || "";
  document.getElementById("jobModalUrl").value = job.url || "";
  document.getElementById("jobModalNotes").value = job.notes || "";

  document.getElementById("jobTrackerModal").classList.add("open");
}

function closeJobTrackerModal() {
  document.getElementById("jobTrackerModal").classList.remove("open");
}

async function handleSaveJobTracker(e) {
  e.preventDefault();

  const editId = document.getElementById("jobModalEditId").value;
  const company = document.getElementById("jobModalCompany").value.trim();
  const role = document.getElementById("jobModalRole").value.trim();
  const status = document.getElementById("jobModalStatus").value;
  const dateApplied = document.getElementById("jobModalDate").value;
  const deadline = document.getElementById("jobModalDeadline").value;
  const url = document.getElementById("jobModalUrl").value.trim();
  const notes = document.getElementById("jobModalNotes").value.trim();

  if (!company || !role) {
    alert("Please enter company name and position/role.");
    return;
  }

  if (editId) {
    // Edit existing application
    if (currentUser) {
      try {
        const res = await fetch(`/api/applications/${editId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          },
          body: JSON.stringify({ company, role, positionTitle: role, status, dateApplied, deadline, url, notes })
        });
        if (res.ok) {
          const data = await res.json();
          const idx = myApplicationsList.findIndex(j => String(j.id) === String(editId));
          if (idx !== -1) myApplicationsList[idx] = data.application;
        }
      } catch (err) {
        console.error("Save edit error:", err);
      }
    } else {
      const idx = myApplicationsList.findIndex(j => String(j.id) === String(editId));
      if (idx !== -1) {
        myApplicationsList[idx] = {
          ...myApplicationsList[idx],
          company,
          role,
          positionTitle: role,
          status,
          appliedAt: new Date(dateApplied).toISOString(),
          deadline,
          url,
          notes
        };
        saveGuestJobs(myApplicationsList);
      }
    }
  } else {
    // Add new application
    if (currentUser) {
      try {
        const res = await fetch("/api/applications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          },
          body: JSON.stringify({ company, role, positionTitle: role, status, dateApplied, deadline, url, notes })
        });
        if (res.ok) {
          const data = await res.json();
          myApplicationsList.unshift(data.application);
        } else {
          const err = await res.json();
          alert(err.error || "Failed to add application.");
          return;
        }
      } catch (err) {
        console.error("Add application error:", err);
      }
    } else {
      const newJob = {
        id: `guest_${Date.now()}`,
        company,
        role,
        positionTitle: role,
        status,
        appliedAt: new Date(dateApplied).toISOString(),
        deadline: deadline || "2026-12-31",
        url,
        notes: notes || "Tracked in SafeGig Guest Tracker"
      };
      myApplicationsList.unshift(newJob);
      saveGuestJobs(myApplicationsList);
    }
  }

  closeJobTrackerModal();
  updateTrackerStats();
  renderTrackerUI();
}

async function deleteJobApplication(jobId) {
  const job = myApplicationsList.find(j => String(j.id) === String(jobId));
  const comp = job ? job.company : "this application";

  if (!confirm(`Are you sure you want to remove your application to ${comp}?`)) {
    return;
  }

  if (currentUser) {
    try {
      const res = await fetch(`/api/applications/${jobId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.ok) {
        myApplicationsList = myApplicationsList.filter(j => String(j.id) !== String(jobId));
      } else {
        alert("Failed to delete application.");
      }
    } catch (e) {
      console.error("Delete error:", e);
    }
  } else {
    myApplicationsList = myApplicationsList.filter(j => String(j.id) !== String(jobId));
    saveGuestJobs(myApplicationsList);
  }

  updateTrackerStats();
  renderTrackerUI();
}

// ------------------------------------------
// EXPORT TO CSV
// ------------------------------------------

function exportApplicationsToCSV() {
  if (myApplicationsList.length === 0) {
    alert("No applications found to export.");
    return;
  }

  const headers = ["ID", "Company", "Role", "Status", "Date Applied", "Deadline", "Job URL", "Notes"];
  const rows = myApplicationsList.map(j => {
    const dateStr = j.appliedAt ? j.appliedAt.split("T")[0] : "";
    const roleStr = j.positionTitle || j.role || "";
    return [
      `"${(j.id || '').replace(/"/g, '""')}"`,
      `"${(j.company || '').replace(/"/g, '""')}"`,
      `"${roleStr.replace(/"/g, '""')}"`,
      `"${(j.status || '').replace(/"/g, '""')}"`,
      `"${dateStr}"`,
      `"${(j.deadline || '').replace(/"/g, '""')}"`,
      `"${(j.url || '').replace(/"/g, '""')}"`,
      `"${(j.notes || '').replace(/"/g, '""')}"`
    ].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `SafeGig_Applications_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ------------------------------------------
// AI COVER LETTER GENERATOR LOGIC
// ------------------------------------------

function openCoverLetterModal(company = '', role = '', jobId = null) {
  selectedCoverLetterJobId = jobId;

  document.getElementById("clCompany").value = company;
  document.getElementById("clRole").value = role;
  document.getElementById("clJobDesc").value = "";

  // Auto-fill skills from user profile, current resume match, or fallback
  let skills = [];
  if (currentUser && currentUser.skills && currentUser.skills.length > 0) {
    skills = currentUser.skills;
  } else if (currentAnalysis && currentAnalysis.matchedSkills && currentAnalysis.matchedSkills.length > 0) {
    skills = currentAnalysis.matchedSkills;
  } else {
    skills = ["Python", "JavaScript", "React", "SQL", "Problem Solving"];
  }

  document.getElementById("clSkills").value = Array.isArray(skills) ? skills.join(", ") : skills;

  // Restore session gemini key if previously saved
  const savedKey = sessionStorage.getItem("safegig_gemini_api_key");
  if (savedKey) {
    const keyInput = document.getElementById("clGeminiKey");
    if (keyInput) keyInput.value = savedKey;
  }

  const saveBtn = document.getElementById("clSaveToJobBtn");
  if (saveBtn) {
    saveBtn.style.display = jobId ? "inline-flex" : "none";
  }

  // Set default tone
  selectClTone('professional');

  // Clear output preview
  const out = document.getElementById("clOutputText");
  if (out) out.value = "";
  updateCoverLetterWordCount();

  const engineBadge = document.getElementById("clEngineBadge");
  if (engineBadge) engineBadge.style.display = "none";

  document.getElementById("coverLetterModal").classList.add("open");
}

function closeCoverLetterModal() {
  document.getElementById("coverLetterModal").classList.remove("open");
}

function selectClTone(tone, btnEl) {
  currentClTone = tone;
  document.querySelectorAll(".cl-tone-btn").forEach(b => {
    b.classList.toggle("active", b.getAttribute("data-tone") === tone);
  });
}

async function handleGenerateCoverLetter() {
  const company = document.getElementById("clCompany").value.trim();
  const role = document.getElementById("clRole").value.trim();
  const jobDescription = document.getElementById("clJobDesc").value.trim();
  const skillsStr = document.getElementById("clSkills").value.trim();
  const apiKey = document.getElementById("clGeminiKey").value.trim();

  if (apiKey) {
    sessionStorage.setItem("safegig_gemini_api_key", apiKey);
  }

  if (!company || !role) {
    alert("Please provide target company and role.");
    return;
  }

  const btn = document.getElementById("clGenerateBtn");
  const origText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<span>⏳ Crafting Tailored Letter...</span>`;

  const skills = skillsStr ? skillsStr.split(",").map(s => s.trim()).filter(Boolean) : [];
  const candidateName = currentUser ? currentUser.name : (currentAnalysis ? currentAnalysis.candidateName : "Candidate");

  try {
    const res = await fetch("/api/cover-letter/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {})
      },
      body: JSON.stringify({
        company,
        role,
        jobDescription,
        skills,
        candidateName,
        tone: currentClTone,
        apiKey
      })
    });

    const data = await res.json();
    if (res.ok && data.coverLetter) {
      const out = document.getElementById("clOutputText");
      out.value = data.coverLetter;
      updateCoverLetterWordCount();

      const engineBadge = document.getElementById("clEngineBadge");
      if (engineBadge) {
        engineBadge.innerText = data.engine || "SafeGig AI";
        engineBadge.style.display = "inline-block";
      }
    } else {
      alert(data.error || "Failed to generate cover letter.");
    }
  } catch (err) {
    console.error("Cover letter error:", err);
    alert("Connection error while generating cover letter.");
  } finally {
    btn.disabled = false;
    btn.innerHTML = origText;
  }
}

function updateCoverLetterWordCount() {
  const text = (document.getElementById("clOutputText")?.value || "").trim();
  const words = text ? text.split(/\s+/).length : 0;
  const badge = document.getElementById("clWordCountBadge");
  if (badge) badge.innerText = `${words} words`;
}

// Attach listener to update word count live on edit
document.addEventListener("DOMContentLoaded", () => {
  const out = document.getElementById("clOutputText");
  if (out) {
    out.addEventListener("input", updateCoverLetterWordCount);
  }
});

function copyCoverLetter() {
  const text = document.getElementById("clOutputText").value;
  if (!text) {
    alert("No cover letter generated yet to copy.");
    return;
  }

  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById("clCopyBtn");
    const orig = btn.innerHTML;
    btn.innerHTML = `<span>✅ Copied!</span>`;
    setTimeout(() => { btn.innerHTML = orig; }, 1800);
  }).catch(() => {
    alert("Failed to copy to clipboard.");
  });
}

function downloadCoverLetter() {
  const text = document.getElementById("clOutputText").value;
  const company = document.getElementById("clCompany").value.trim() || "Company";
  const role = document.getElementById("clRole").value.trim() || "Role";

  if (!text) {
    alert("No cover letter to download.");
    return;
  }

  const blob = new Blob([text], { type: "text/plain;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Cover_Letter_${company.replace(/[^a-zA-Z0-9]/g, '_')}_${role.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function printCoverLetter() {
  const text = document.getElementById("clOutputText").value;
  if (!text) {
    alert("No cover letter to print.");
    return;
  }

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Cover Letter - SafeGig AI</title>
        <style>
          body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.6; padding: 40px; color: #111; max-width: 800px; margin: 0 auto; }
          pre { white-space: pre-wrap; font-family: inherit; font-size: inherit; }
        </style>
      </head>
      <body>
        <pre>${escapeHtml(text)}</pre>
        <script>window.onload = function() { window.print(); }<\/script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

async function saveCoverLetterToSelectedJob() {
  if (!selectedCoverLetterJobId) return;
  const text = document.getElementById("clOutputText").value;
  if (!text) {
    alert("No cover letter text to save.");
    return;
  }

  const job = myApplicationsList.find(j => String(j.id) === String(selectedCoverLetterJobId));
  if (!job) return;

  const addition = `\n\n--- [AI COVER LETTER] ---\n${text}`;
  job.notes = (job.notes ? job.notes : "") + addition;

  if (currentUser) {
    try {
      await fetch(`/api/applications/${job.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ notes: job.notes })
      });
    } catch (e) {}
  } else {
    saveGuestJobs(myApplicationsList);
  }

  alert("Cover letter attached to job application notes!");
  closeCoverLetterModal();
  renderTrackerUI();
}

// 1-Click AI Auto-Draft inside the Apply Job Modal
async function generateNoteForApplyModal(company, role) {
  const notesArea = document.getElementById("appNotes");
  if (!notesArea) return;
  notesArea.value = "⏳ Drafting tailored pitch with SafeGig AI...";

  let skills = [];
  if (currentUser && currentUser.skills && currentUser.skills.length > 0) {
    skills = currentUser.skills;
  } else if (currentAnalysis && currentAnalysis.matchedSkills) {
    skills = currentAnalysis.matchedSkills;
  }

  try {
    const res = await fetch("/api/cover-letter/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {})
      },
      body: JSON.stringify({
        company,
        role,
        skills,
        candidateName: currentUser ? currentUser.name : "Candidate",
        tone: "professional"
      })
    });
    if (res.ok) {
      const data = await res.json();
      notesArea.value = data.coverLetter || "";
    } else {
      notesArea.value = `I am excited to apply for the ${role} role at ${company}. My background in ${(skills.slice(0, 4).join(", ") || "software engineering")} directly matches your technical requirements.`;
    }
  } catch (e) {
    notesArea.value = `I am applying for the ${role} opportunity at ${company}. Looking forward to discussing how my skills contribute to your goals.`;
  }
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