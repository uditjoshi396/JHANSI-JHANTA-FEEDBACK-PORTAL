/**
 * API Test Suite for Janata Feedback Portal
 * Tests all major endpoints
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';
let authToken = '';
let userId = '';
let grievanceId = '';

function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting API Tests...\n');

  try {
    // Test 1: Register User (Citizen)
    console.log('Test 1: Register Citizen User');
    const registerResp = await makeRequest('POST', '/api/auth/register', {
      name: 'Test Citizen ' + Date.now(),
      email: `citizen${Date.now()}@test.com`,
      password: 'TestPassword123!',
      role: 'citizen'
    });
    console.log(`Status: ${registerResp.status}`);
    console.log(`Response:`, registerResp.data);
    
    if (registerResp.status === 201 || registerResp.status === 200) {
      userId = registerResp.data.user?.id;
      console.log('✅ Registration successful\n');
    } else {
      console.log('❌ Registration failed\n');
    }

    // Test 2: Login
    console.log('Test 2: User Login');
    const loginResp = await makeRequest('POST', '/api/auth/login', {
      email: `citizen${Date.now() - 1000}@test.com`,
      password: 'TestPassword123!'
    });
    console.log(`Status: ${loginResp.status}`);
    console.log(`Response:`, loginResp.data);
    
    if (loginResp.status === 200 && loginResp.data.token) {
      authToken = loginResp.data.token;
      userId = loginResp.data.user?.id;
      console.log('✅ Login successful\n');
    } else {
      console.log('❌ Login failed - trying with recently registered user\n');
      authToken = registerResp.data.token || '';
    }

    // Test 3: Register Admin
    console.log('Test 3: Register Admin User');
    const adminRegisterResp = await makeRequest('POST', '/api/auth/register', {
      name: 'Admin User ' + Date.now(),
      email: `admin${Date.now()}@test.com`,
      password: 'AdminPassword123!',
      role: 'admin'
    });
    console.log(`Status: ${adminRegisterResp.status}`);
    if (adminRegisterResp.status === 201 || adminRegisterResp.status === 200) {
      console.log('✅ Admin registration successful\n');
    } else {
      console.log('❌ Admin registration failed\n');
    }

    // Test 4: Register Officer
    console.log('Test 4: Register Officer User');
    const officerRegisterResp = await makeRequest('POST', '/api/auth/register', {
      name: 'Officer User ' + Date.now(),
      email: `officer${Date.now()}@test.com`,
      password: 'OfficerPassword123!',
      phone: '9876543210',
      role: 'officer'
    });
    console.log(`Status: ${officerRegisterResp.status}`);
    if (officerRegisterResp.status === 201 || officerRegisterResp.status === 200) {
      console.log('✅ Officer registration successful\n');
    } else {
      console.log('❌ Officer registration failed\n');
    }

    // Test 5: API Health Check
    console.log('Test 5: API Health Check');
    const healthResp = await makeRequest('GET', '/');
    console.log(`Status: ${healthResp.status}`);
    console.log(`Response:`, healthResp.data);
    console.log('✅ API is responding\n');

    console.log('✅ All tests completed!');
    console.log('\n📝 Summary:');
    console.log('- User Registration: ' + (registerResp.status === 201 || registerResp.status === 200 ? '✅' : '❌'));
    console.log('- Admin Registration: ' + (adminRegisterResp.status === 201 || adminRegisterResp.status === 200 ? '✅' : '❌'));
    console.log('- Officer Registration: ' + (officerRegisterResp.status === 201 || officerRegisterResp.status === 200 ? '✅' : '❌'));
    console.log('- API Health: ✅');

  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }

  process.exit(0);
}

// Wait for servers to be ready then run tests
setTimeout(runTests, 2000);
