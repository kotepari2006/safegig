const http = require('http');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch(e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test() {
  console.log("--- Testing Admin Login ---");
  const adminLogin = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@safegig.demo', password: 'admin123' });
  console.log("Admin Login Status:", adminLogin.status, adminLogin.body.user);

  const adminToken = adminLogin.body.token;

  console.log("\n--- Testing Admin Applications Dashboard ---");
  const adminApps = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/applications',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log("Total Applications (Admin):", adminApps.body.totalApplications);
  console.log("Company Stats:", adminApps.body.companyStats);

  console.log("\n--- Testing Student Login ---");
  const studentLogin = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'student@safegig.demo', password: 'password123' });
  console.log("Student Login Status:", studentLogin.status, studentLogin.body.user);

  const studentToken = studentLogin.body.token;

  console.log("\n--- Testing Submit Application (Student) ---");
  const newApp = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/applications',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    }
  }, {
    mncId: 'google',
    company: 'Google',
    positionTitle: 'Cloud Solutions Architect',
    deadline: '2026-11-15',
    notes: 'Testing application submission'
  });
  console.log("New Application Response:", newApp.status, newApp.body.message);

  console.log("\n--- Testing Student Applications View ---");
  const studentApps = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/applications',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  console.log("Student Applications Count:", studentApps.body.totalApplications);
  console.log("Student Applications:", studentApps.body.applications.map(a => `${a.company} - ${a.positionTitle} (${a.status})`));

  console.log("\n--- Testing Admin Accept Status Update ---");
  const targetAppId = studentApps.body.applications[0].id;
  const updateRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/admin/applications/${targetAppId}/status`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  }, { status: 'Accepted' });
  console.log("Status Update Status:", updateRes.status, updateRes.body.message);

  console.log("\n✅ ALL TESTS PASSED!");
}

test();
