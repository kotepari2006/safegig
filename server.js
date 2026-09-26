try {
  require("dotenv").config();
} catch (e) {
  // dotenv is optional
}

let mongoose;
try {
  mongoose = require("mongoose");
} catch (e) {
  // mongoose is optional
}
const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { MNC_DATABASE } = require("./mncData");
const { analyzeResumeAndMatch } = require("./resumeMatcher");

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(__dirname, "data.json");

app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

// ===============================
// PASSWORD HASHING & TOKENS
// ===============================

function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");
}

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

// ===============================
// DATABASE & SEED HELPERS
// ===============================

function seedDefaultData(data) {
  let modified = false;

  if (!Array.isArray(data.users)) data.users = [];
  if (!Array.isArray(data.projects)) data.projects = [];
  if (!Array.isArray(data.sessions)) data.sessions = [];
  if (!Array.isArray(data.applications)) data.applications = [];
  if (!data.nextUserId) data.nextUserId = 10;
  if (!data.nextProjectId) data.nextProjectId = 100;
  if (!data.nextAppId) data.nextAppId = 2000;

  // 1. Ensure Admin User
  let admin = data.users.find(u => u.email.toLowerCase() === "admin@safegig.demo");
  if (!admin) {
    admin = {
      id: 99,
      name: "System Admin",
      email: "admin@safegig.demo",
      password: hashPassword("admin123"),
      role: "admin",
      company: "SafeGig Enterprise Admin"
    };
    data.users.push(admin);
    modified = true;
  }

  // 2. Ensure Demo Student
  let student = data.users.find(u => u.email.toLowerCase() === "student@safegig.demo");
  if (!student) {
    student = {
      id: 1,
      name: "Demo Student",
      email: "student@safegig.demo",
      password: hashPassword("password123"),
      role: "student",
      skills: ["Python", "SQL", "Cybersecurity", "React"]
    };
    data.users.push(student);
    modified = true;
  } else if (!student.password) {
    student.password = hashPassword("password123");
    modified = true;
  }

  // 3. Ensure Demo Employee
  let employee = data.users.find(u => u.email.toLowerCase() === "employee@safegig.demo");
  if (!employee) {
    employee = {
      id: 2,
      name: "Rahul Sharma (Employee)",
      email: "employee@safegig.demo",
      password: hashPassword("password123"),
      role: "student",
      skills: ["Java", "Spring Boot", "AWS", "Docker"]
    };
    data.users.push(employee);
    modified = true;
  }

  // 4. Ensure Initial Applications for rich demonstration
  if (data.applications.length === 0) {
    data.applications = [
      {
        id: "app_1001",
        userId: student.id,
        userName: student.name,
        userEmail: student.email,
        mncId: "google",
        company: "Google",
        positionTitle: "Software Engineer (SDE I/II)",
        appliedAt: "2026-09-24T10:30:00.000Z",
        deadline: "2026-10-30",
        status: "Accepted",
        notes: "Matches top tier Python & Algorithms profile"
      },
      {
        id: "app_1002",
        userId: student.id,
        userName: student.name,
        userEmail: student.email,
        mncId: "microsoft",
        company: "Microsoft",
        positionTitle: "Full Stack Web Engineer",
        appliedAt: "2026-09-23T14:15:00.000Z",
        deadline: "2026-10-25",
        status: "Under Review",
        notes: "Applied via SafeGig 1-click apply"
      },
      {
        id: "app_1003",
        userId: student.id,
        userName: student.name,
        userEmail: student.email,
        mncId: "amazon",
        company: "Amazon",
        positionTitle: "AWS Cloud Support Engineer",
        appliedAt: "2026-09-20T09:00:00.000Z",
        deadline: "2026-10-15",
        status: "Rejected",
        notes: "Position requirement mismatched"
      },
      {
        id: "app_1004",
        userId: employee.id,
        userName: employee.name,
        userEmail: employee.email,
        mncId: "amazon",
        company: "Amazon",
        positionTitle: "Software Development Engineer (SDE-1)",
        appliedAt: "2026-09-25T11:45:00.000Z",
        deadline: "2026-10-31",
        status: "Accepted",
        notes: "Experienced candidate with Java & AWS"
      },
      {
        id: "app_1005",
        userId: employee.id,
        userName: employee.name,
        userEmail: employee.email,
        mncId: "apple",
        company: "Apple",
        positionTitle: "iOS Software Engineer",
        appliedAt: "2026-09-22T16:20:00.000Z",
        deadline: "2026-11-05",
        status: "Under Review",
        notes: "Mobile software applicant"
      },
      {
        id: "app_1006",
        userId: employee.id,
        userName: employee.name,
        userEmail: employee.email,
        mncId: "meta",
        company: "Meta",
        positionTitle: "Frontend Infrastructure Engineer",
        appliedAt: "2026-09-21T08:10:00.000Z",
        deadline: "2026-10-28",
        status: "Under Review",
        notes: "Frontend specialist"
      }
    ];
    data.nextAppId = 1007;
    modified = true;
  }

  if (modified) {
    saveData(data);
  }

  return data;
}

function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      users: [],
      projects: [],
      sessions: [],
      applications: [],
      nextUserId: 10,
      nextProjectId: 100,
      nextAppId: 1000
    };
    saveData(initialData);
    return seedDefaultData(initialData);
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    return seedDefaultData(parsed);
  } catch (err) {
    const fallback = { users: [], projects: [], sessions: [], applications: [] };
    return seedDefaultData(fallback);
  }
}

function saveData(data) {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(data, null, 2)
  );
}

// ===============================
// AUTH MIDDLEWARE
// ===============================

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authentication required. Please log in."
    });
  }

  const token = authHeader.split(" ")[1];
  const data = loadData();

  const session = (data.sessions || []).find(s => s.token === token);

  if (!session) {
    return res.status(401).json({
      error: "Invalid or expired session. Please log in again."
    });
  }

  const user = (data.users || []).find(u => u.id === session.userId);

  if (!user) {
    return res.status(401).json({
      error: "User account not found."
    });
  }

  req.user = user;
  next();
}

function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({
        error: `Permission denied. Access restricted to: ${allowed.join(", ")}.`
      });
    }
    next();
  };
}

// ===============================
// AUTHENTICATION API
// ===============================

// SIGNUP
app.post("/api/auth/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = "student",
      skills = [],
      company = ""
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email, and password are required."
      });
    }

    if (!["student", "employer", "admin"].includes(role)) {
      return res.status(400).json({
        error: "Invalid role specified."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long."
      });
    }

    const data = loadData();
    const existingUser = data.users.find(
      u => u.email.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      return res.status(409).json({
        error: "An account with this email already exists."
      });
    }

    const newUser = {
      id: data.nextUserId++,
      name,
      email: email.toLowerCase(),
      password: hashPassword(password),
      role,
      skills: role === "student" ? skills : [],
      company: role === "employer" ? company : "",
      createdAt: new Date().toISOString()
    };

    data.users.push(newUser);

    // Create session immediately upon signup
    const token = generateToken();
    data.sessions.push({
      token,
      userId: newUser.id,
      createdAt: new Date().toISOString()
    });

    saveData(data);

    // Also persist to MongoDB if connected
    try {
      if (mongoose.connection.readyState === 1) {
        await User.create({
          name,
          email: email.toLowerCase(),
          password: hashPassword(password),
          role,
          skills,
          company
        });
      }
    } catch (dbErr) {
      // Non-blocking log
    }

    res.status(201).json({
      message: "Account created successfully.",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        skills: newUser.skills,
        company: newUser.company
      }
    });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      error: "Something went wrong while creating the account."
    });
  }
});

// LOGIN
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password are required."
    });
  }

  const data = loadData();
  const user = data.users.find(
    u => u.email.toLowerCase() === email.toLowerCase()
  );

  if (!user) {
    return res.status(401).json({
      error: "Invalid email or password."
    });
  }

  const passwordHash = hashPassword(password);
  if (passwordHash !== user.password) {
    return res.status(401).json({
      error: "Invalid email or password."
    });
  }

  const token = generateToken();
  if (!Array.isArray(data.sessions)) data.sessions = [];
  data.sessions.push({
    token,
    userId: user.id,
    createdAt: new Date().toISOString()
  });

  saveData(data);

  res.json({
    message: "Login successful.",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      skills: user.skills || [],
      company: user.company || ""
    }
  });
});

// LOGOUT
app.post("/api/auth/logout", authenticate, (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const data = loadData();

  if (Array.isArray(data.sessions)) {
    data.sessions = data.sessions.filter(s => s.token !== token);
    saveData(data);
  }

  res.json({
    message: "Logged out successfully."
  });
});

// GET CURRENT USER PROFILE
app.get("/api/auth/me", authenticate, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      skills: req.user.skills || [],
      company: req.user.company || ""
    }
  });
});

// ===============================
// APPLICATIONS API (STUDENT & ADMIN)
// ===============================

// GET APPLICATIONS (Filtered by role: Student gets own, Admin gets all + company metrics)
app.get("/api/applications", authenticate, (req, res) => {
  const data = loadData();
  const allApps = data.applications || [];

  if (req.user.role === "admin") {
    // Calculate total applicants per company
    const companyCounts = {};
    allApps.forEach(app => {
      const comp = app.company || "Unknown";
      companyCounts[comp] = (companyCounts[comp] || 0) + 1;
    });

    const companyStats = Object.keys(companyCounts).map(comp => ({
      company: comp,
      applicantCount: companyCounts[comp]
    }));

    return res.json({
      role: "admin",
      totalApplications: allApps.length,
      acceptedCount: allApps.filter(a => a.status === "Accepted").length,
      rejectedCount: allApps.filter(a => a.status === "Rejected").length,
      pendingCount: allApps.filter(a => a.status === "Under Review" || a.status === "Pending").length,
      companyStats,
      applications: allApps
    });
  } else {
    // Student or Employee
    const myApps = allApps.filter(a => a.userId === req.user.id || a.userEmail === req.user.email);
    return res.json({
      role: req.user.role,
      totalApplications: myApps.length,
      acceptedCount: myApps.filter(a => a.status === "Accepted").length,
      rejectedCount: myApps.filter(a => a.status === "Rejected").length,
      pendingCount: myApps.filter(a => a.status === "Under Review" || a.status === "Pending").length,
      applications: myApps
    });
  }
});

// SUBMIT NEW APPLICATION (Student / Employee)
app.post("/api/applications", authenticate, (req, res) => {
  const { mncId, company, positionTitle, deadline, notes } = req.body;

  if (!company || !positionTitle) {
    return res.status(400).json({
      error: "Company name and position title are required to apply."
    });
  }

  const data = loadData();
  if (!Array.isArray(data.applications)) data.applications = [];

  // Check if student has already applied for this company position
  const existingApp = data.applications.find(
    a => (a.userId === req.user.id || a.userEmail === req.user.email) &&
         a.company.toLowerCase() === company.toLowerCase() &&
         a.positionTitle.toLowerCase() === positionTitle.toLowerCase()
  );

  if (existingApp) {
    return res.status(409).json({
      error: `You have already applied for "${positionTitle}" at ${company}. Status: ${existingApp.status}`,
      application: existingApp
    });
  }

  const newApp = {
    id: `app_${data.nextAppId++}`,
    userId: req.user.id,
    userName: req.user.name,
    userEmail: req.user.email,
    mncId: mncId || company.toLowerCase(),
    company,
    positionTitle,
    deadline: deadline || "2026-11-30",
    appliedAt: new Date().toISOString(),
    status: "Under Review",
    notes: notes || "Applied via SafeGig 1-Click Platform"
  };

  data.applications.unshift(newApp);
  saveData(data);

  res.status(201).json({
    message: `Successfully applied to ${company} for ${positionTitle}!`,
    application: newApp
  });
});

// ADMIN: UPDATE APPLICATION STATUS (Accepted, Rejected, Under Review)
app.patch("/api/admin/applications/:id/status", authenticate, requireRole("admin"), (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  const validStatuses = ["Accepted", "Rejected", "Under Review"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      error: `Invalid status value. Allowed: ${validStatuses.join(", ")}`
    });
  }

  const data = loadData();
  const targetApp = (data.applications || []).find(a => String(a.id) === String(id));

  if (!targetApp) {
    return res.status(404).json({
      error: "Application record not found."
    });
  }

  targetApp.status = status;
  targetApp.updatedAt = new Date().toISOString();
  saveData(data);

  res.json({
    message: `Application status updated to "${status}" for ${targetApp.userName} at ${targetApp.company}.`,
    application: targetApp
  });
});

// ===============================
// DASHBOARD ENDPOINTS
// ===============================

app.get("/api/student/dashboard", authenticate, requireRole(["student", "employer", "admin"]), (req, res) => {
  const data = loadData();
  const myApps = (data.applications || []).filter(a => a.userId === req.user.id);

  res.json({
    message: "Student dashboard",
    user: {
      name: req.user.name,
      email: req.user.email,
      skills: req.user.skills
    },
    applications: myApps
  });
});

app.get("/api/admin/dashboard", authenticate, requireRole("admin"), (req, res) => {
  const data = loadData();
  const allApps = data.applications || [];

  const companyCounts = {};
  allApps.forEach(a => {
    companyCounts[a.company] = (companyCounts[a.company] || 0) + 1;
  });

  res.json({
    message: "Admin dashboard metrics",
    totalUsers: data.users.length,
    students: data.users.filter(u => u.role === "student").length,
    totalApplications: allApps.length,
    acceptedCount: allApps.filter(a => a.status === "Accepted").length,
    rejectedCount: allApps.filter(a => a.status === "Rejected").length,
    pendingCount: allApps.filter(a => a.status === "Under Review" || a.status === "Pending").length,
    companyStats: Object.keys(companyCounts).map(comp => ({
      company: comp,
      count: companyCounts[comp]
    }))
  });
});

// ===============================
// MNC & RESUME MATCHING API
// ===============================

// Fetch MNC list with deadlines helper
app.get("/api/mncs", (req, res) => {
  const { domain, search } = req.query;
  let results = MNC_DATABASE;

  if (domain && domain !== "All") {
    results = results.filter(m => m.domain.toLowerCase().includes(domain.toLowerCase()));
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(m => 
      m.name.toLowerCase().includes(q) ||
      m.domain.toLowerCase().includes(q) ||
      m.requiredSkills.some(s => s.toLowerCase().includes(q))
    );
  }

  // Ensure every position has a deadline string
  const defaultDeadlines = ["2026-10-31", "2026-11-15", "2026-11-30", "2026-12-15"];
  const enrichedMncs = results.map((mnc, idx) => {
    const activePositions = (mnc.activePositions || []).map((pos, pIdx) => ({
      ...pos,
      deadline: pos.deadline || defaultDeadlines[(idx + pIdx) % defaultDeadlines.length]
    }));
    return { ...mnc, activePositions };
  });

  res.json({
    total: enrichedMncs.length,
    mncs: enrichedMncs
  });
});

// Fetch single MNC by ID
app.get("/api/mncs/:id", (req, res) => {
  const mnc = MNC_DATABASE.find(m => m.id === req.params.id);
  if (!mnc) {
    return res.status(404).json({ error: "MNC not found" });
  }

  const defaultDeadlines = ["2026-10-31", "2026-11-15", "2026-11-30"];
  const activePositions = (mnc.activePositions || []).map((pos, pIdx) => ({
    ...pos,
    deadline: pos.deadline || defaultDeadlines[pIdx % defaultDeadlines.length]
  }));

  res.json({ ...mnc, activePositions });
});

// Match Resume Endpoint
app.post("/api/match-resume", (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText || typeof resumeText !== "string" || resumeText.trim().length === 0) {
      return res.status(400).json({ error: "Resume content is required for matching." });
    }

    const matchResult = analyzeResumeAndMatch(resumeText);
    res.json(matchResult);
  } catch (error) {
    console.error("Resume match error:", error);
    res.status(500).json({ error: "Failed to process resume matching." });
  }
});

// ===============================
// HEALTH CHECK
// ===============================

app.get("/api/health", (req, res) => {
  res.json({
    status: "SafeGig API running",
    timestamp: new Date().toISOString()
  });
});

// ===============================
// START SERVER
// ===============================

if (mongoose) {
  mongoose.connection.on("error", (err) => {
    console.log("ℹ️ MongoDB connection event error handled gracefully.");
  });
}

if (mongoose && process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("✅ MongoDB connected");
    })
    .catch((error) => {
      console.log("ℹ️ MongoDB connection skipped or unavailable. Using local JSON store.");
    });
} else {
  console.log("ℹ️ Using local JSON store (data.json).");
}

app.listen(PORT, () => {
  console.log(`SafeGig server running at http://localhost:${PORT}`);
});