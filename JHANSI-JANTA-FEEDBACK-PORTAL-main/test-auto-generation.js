#!/usr/bin/env node

/**
 * Auto-Generation System Test Script
 * Tests Gmail configuration and account generation
 */

const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:5000';
const TEST_ADMIN_TOKEN = process.env.TEST_ADMIN_TOKEN;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset', bold = false) {
  const prefix = bold ? colors.bold : '';
  console.log(`${prefix}${colors[color]}${message}${colors.reset}`);
}

async function testGmailConfig() {
  log('\n=== TESTING GMAIL CONFIGURATION ===\n', 'blue', true);

  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_PASSWORD || process.env.GMAIL_APP_PASSWORD;

  console.log('Checking environment variables...\n');

  if (!gmailUser) {
    log('❌ GMAIL_USER not set in .env', 'red');
    return false;
  } else {
    log(`✅ GMAIL_USER: ${gmailUser}`, 'green');
  }

  if (!gmailPassword) {
    log('❌ GMAIL_PASSWORD/GMAIL_APP_PASSWORD not set in .env', 'red');
    return false;
  } else {
    const maskedPassword = gmailPassword.substring(0, 4) + '••••••••••••';
    log(`✅ GMAIL_PASSWORD: ${maskedPassword}`, 'green');
  }

  const portalUrl = process.env.PORTAL_URL;
  if (!portalUrl) {
    log('⚠️  PORTAL_URL not set, using default', 'yellow');
  } else {
    log(`✅ PORTAL_URL: ${portalUrl}`, 'green');
  }

  return true;
}

async function testAuthToken() {
  log('\n=== TESTING AUTHENTICATION ===\n', 'blue', true);

  if (!TEST_ADMIN_TOKEN) {
    log('❌ TEST_ADMIN_TOKEN not set in .env', 'red');
    log('   Please set: TEST_ADMIN_TOKEN=your_jwt_token', 'yellow');
    return false;
  }

  try {
    // Test with a simple request
    const response = await axios.get(`${API_URL}/api/users/stats`, {
      headers: {
        'Authorization': `Bearer ${TEST_ADMIN_TOKEN}`
      }
    });

    log('✅ Authentication successful', 'green');
    log(`   Total users: ${response.data.total}`, 'green');
    return true;
  } catch (error) {
    if (error.response?.status === 401) {
      log('❌ Invalid authentication token', 'red');
      log('   Token Status:', 'yellow', error.response.status);
    } else {
      log(`❌ Authentication test failed: ${error.message}`, 'red');
    }
    return false;
  }
}

async function testAccountCreation(token) {
  log('\n=== TESTING SINGLE ACCOUNT CREATION ===\n', 'blue', true);

  const testEmail = `autotest_${Date.now()}@testdomain.com`;
  const testData = {
    name: 'Test Admin User',
    email: testEmail,
    role: 'admin',
    department: 'Testing'
  };

  try {
    log(`Creating test account: ${testEmail}`, 'yellow');

    const response = await axios.post(`${API_URL}/api/users/generate-account`, testData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      log('✅ Account created successfully', 'green');
      log(`   Name: ${response.data.user.name}`, 'green');
      log(`   Email: ${response.data.user.email}`, 'green');
      log(`   Username: ${response.data.user.username}`, 'green');
      log(`   Role: ${response.data.user.role}`, 'green');
      
      if (response.data.emailSent) {
        log(`✅ Email sent to ${testEmail}`, 'green');
      } else {
        log(`⚠️  Email not sent: ${response.data.emailMessage}`, 'yellow');
      }
      return true;
    }
  } catch (error) {
    log(`❌ Account creation failed`, 'red');
    if (error.response?.data?.error) {
      log(`   Error: ${error.response.data.error}`, 'red');
    } else {
      log(`   Error: ${error.message}`, 'red');
    }
    return false;
  }
}

async function testBulkCreation(token) {
  log('\n=== TESTING BULK ACCOUNT CREATION ===\n', 'blue', true);

  const testEmails = [
    `officer1_${Date.now()}@testdomain.com`,
    `officer2_${Date.now()}@testdomain.com`
  ];

  const testData = {
    accounts: [
      {
        name: 'Test Officer 1',
        email: testEmails[0],
        role: 'officer',
        department: 'Police'
      },
      {
        name: 'Test Officer 2',
        email: testEmails[1],
        role: 'officer',
        department: 'Works'
      }
    ],
    sendEmails: true
  };

  try {
    log(`Creating ${testData.accounts.length} test accounts...`, 'yellow');

    const response = await axios.post(`${API_URL}/api/users/generate-bulk`, testData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      log('✅ Bulk creation successful', 'green');
      log(`   Created: ${response.data.summary.created}`, 'green');
      log(`   Failed: ${response.data.summary.failed}`, 'green');
      log(`   Emails Sent: ${response.data.summary.emailsSent}`, 'green');
      log(`   Emails Failed: ${response.data.summary.emailsFailed}`, 'green');
      return true;
    }
  } catch (error) {
    log(`❌ Bulk creation failed`, 'red');
    if (error.response?.data?.error) {
      log(`   Error: ${error.response.data.error}`, 'red');
    } else {
      log(`   Error: ${error.message}`, 'red');
    }
    return false;
  }
}

async function testEmailListCreation(token) {
  log('\n=== TESTING EMAIL LIST ACCOUNT CREATION ===\n', 'blue', true);

  const testEmails = [
    `emaillist1_${Date.now()}@testdomain.com`,
    `emaillist2_${Date.now()}@testdomain.com`
  ];

  const testData = {
    emails: testEmails,
    role: 'officer',
    department: 'Testing Department'
  };

  try {
    log(`Creating accounts from email list (${testEmails.length} emails)...`, 'yellow');

    const response = await axios.post(`${API_URL}/api/users/generate-from-emails`, testData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      log('✅ Email list creation successful', 'green');
      log(`   Created: ${response.data.summary.created}`, 'green');
      log(`   Failed: ${response.data.summary.failed}`, 'green');
      return true;
    }
  } catch (error) {
    log(`❌ Email list creation failed`, 'red');
    if (error.response?.data?.error) {
      log(`   Error: ${error.response.data.error}`, 'red');
    } else {
      log(`   Error: ${error.message}`, 'red');
    }
    return false;
  }
}

async function testViewAutoGenerated(token) {
  log('\n=== TESTING VIEW AUTO-GENERATED ACCOUNTS ===\n', 'blue', true);

  try {
    const response = await axios.get(`${API_URL}/api/users/auto-generated-users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.users) {
      log(`✅ Found ${response.data.total} auto-generated accounts`, 'green');
      if (response.data.total > 0) {
        const firstUser = response.data.users[0];
        log(`   Sample: ${firstUser.name} (${firstUser.email})`, 'green');
      }
      return true;
    }
  } catch (error) {
    log(`❌ Failed to retrieve auto-generated accounts`, 'red');
    if (error.response?.data?.error) {
      log(`   Error: ${error.response.data.error}`, 'red');
    } else {
      log(`   Error: ${error.message}`, 'red');
    }
    return false;
  }
}

async function testDownloadTemplate(token) {
  log('\n=== TESTING CSV TEMPLATE DOWNLOAD ===\n', 'blue', true);

  try {
    const response = await axios.get(`${API_URL}/api/users/generate-template`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      responseType: 'text'
    });

    if (response.data && response.data.includes('name,email,role')) {
      log('✅ CSV template downloaded successfully', 'green');
      log(`   Template size: ${response.data.length} bytes`, 'green');
      return true;
    }
  } catch (error) {
    log(`❌ Failed to download CSV template`, 'red');
    if (error.response?.data?.error) {
      log(`   Error: ${error.response.data.error}`, 'red');
    } else {
      log(`   Error: ${error.message}`, 'red');
    }
    return false;
  }
}

async function runTests() {
  log('\n╔═══════════════════════════════════════════════════════╗', 'blue', true);
  log('║  AUTO-GENERATION SYSTEM - COMPREHENSIVE TEST SUITE    ║', 'blue', true);
  log('╚═══════════════════════════════════════════════════════╝', 'blue', true);

  log(`\nAPI URL: ${API_URL}`, 'yellow');
  log(`Timestamp: ${new Date().toISOString()}`, 'yellow');

  // Test Gmail config
  const gmailOk = await testGmailConfig();
  if (!gmailOk) {
    log('\n⚠️  Gmail configuration issues detected. Please fix .env file.', 'yellow');
  }

  // Test authentication
  const authOk = await testAuthToken();
  if (!authOk) {
    log('\n⚠️  Cannot proceed without valid authentication token.', 'yellow');
    log('Set TEST_ADMIN_TOKEN in .env to run remaining tests.', 'yellow');
    process.exit(1);
  }

  // Run functional tests
  const results = {
    singleAccount: await testAccountCreation(TEST_ADMIN_TOKEN),
    bulkAccounts: await testBulkCreation(TEST_ADMIN_TOKEN),
    emailList: await testEmailListCreation(TEST_ADMIN_TOKEN),
    viewAccounts: await testViewAutoGenerated(TEST_ADMIN_TOKEN),
    template: await testDownloadTemplate(TEST_ADMIN_TOKEN)
  };

  // Summary
  log('\n╔═══════════════════════════════════════════════════════╗', 'blue', true);
  log('║                    TEST SUMMARY                       ║', 'blue', true);
  log('╚═══════════════════════════════════════════════════════╝', 'blue', true);

  const passCount = Object.values(results).filter(r => r === true).length;
  const totalTests = Object.values(results).length;

  console.log('');
  for (const [test, result] of Object.entries(results)) {
    const icon = result ? '✅' : '❌';
    const status = result ? 'PASS' : 'FAIL';
    log(`${icon} ${test}: ${status}`, result ? 'green' : 'red');
  }

  console.log('');
  log(`\nResults: ${passCount}/${totalTests} tests passed`, passCount === totalTests ? 'green' : 'yellow', true);

  if (passCount === totalTests) {
    log('✅ All tests passed! Auto-generation system is working correctly.', 'green', true);
    process.exit(0);
  } else if (passCount > 0) {
    log('⚠️  Some tests failed. Please review the output above.', 'yellow', true);
    process.exit(1);
  } else {
    log('❌ All tests failed. Check your configuration.', 'red', true);
    process.exit(1);
  }
}

// Run tests
runTests().catch(err => {
  log(`\n❌ Unexpected error: ${err.message}`, 'red');
  process.exit(1);
});
