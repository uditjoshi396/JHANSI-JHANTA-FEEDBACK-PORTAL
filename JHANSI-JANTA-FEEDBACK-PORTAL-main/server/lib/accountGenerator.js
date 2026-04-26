/**
 * Auto Account Generator for Admin and Government Officers
 * Generates accounts and sends credentials via Gmail
 */

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

/**
 * Configure Gmail transporter
 * Uses environment variables for security
 */
const createMailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER || 'your-email@gmail.com',
      pass: process.env.GMAIL_PASSWORD || 'your-app-password'
      // Note: Use Gmail App Password, not regular password
      // Generate at: https://myaccount.google.com/apppasswords
    }
  });
};

/**
 * Generate random password
 */
const generatePassword = (length = 12) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

/**
 * Generate account ID/username
 */
const generateUsername = (name, role) => {
  const namePart = name.toLowerCase().replace(/\s+/g, '.').substring(0, 10);
  const rolePart = role.substring(0, 3).toLowerCase();
  const randomPart = Math.random().toString(36).substring(7);
  return `${rolePart}.${namePart}.${randomPart}`;
};

/**
 * Create single user account
 */
const createUserAccount = async (name, email, role, department = '') => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return {
        success: false,
        error: 'Email already registered',
        email
      };
    }

    // Generate credentials
    const password = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10);
    const username = generateUsername(name, role);

    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      department,
      username,
      isActive: true,
      createdAt: new Date(),
      accountGeneratedAutomatically: true
    });

    await user.save();

    return {
      success: true,
      user: {
        id: user._id,
        name,
        email,
        username,
        role,
        department,
        password, // Return plaintext password ONCE for sending
        createdAt: user.createdAt
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      email
    };
  }
};

/**
 * Send credentials via Gmail
 */
const sendCredentialsViaGmail = async (user, password, portalUrl = 'http://localhost:3000') => {
  try {
    const transporter = createMailTransporter();

    // Construct login URL based on role
    let loginUrl = portalUrl;
    if (user.role === 'admin') {
      loginUrl += '/admin-login';
    } else if (user.role === 'officer') {
      loginUrl += '/officer-login';
    } else {
      loginUrl += '/login';
    }

    const emailContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
        .container { background-color: white; padding: 30px; border-radius: 8px; max-width: 600px; margin: 20px auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { color: #667eea; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
        .role-badge { display: inline-block; background-color: #667eea; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; margin: 10px 0; }
        .credentials-box { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
        .credential-field { margin: 10px 0; }
        .label { font-weight: bold; color: #333; }
        .value { background-color: #f0f0f0; padding: 8px; border-radius: 4px; font-family: monospace; margin-top: 5px; word-break: break-all; }
        .login-button { background-color: #667eea; color: white; padding: 12px 30px; border: none; border-radius: 5px; text-decoration: none; display: inline-block; margin: 20px 0; font-weight: bold; cursor: pointer; }
        .login-button:hover { background-color: #764ba2; }
        .warning { background-color: #fff3cd; border: 1px solid #ffc107; padding: 12px; border-radius: 4px; margin: 15px 0; color: #856404; font-size: 12px; }
        .footer { color: #666; font-size: 12px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">🔐 Welcome to Jhansi-Janta Feedback Portal</div>
        
        <p>Dear <strong>${user.name}</strong>,</p>
        
        <p>Your account has been successfully created in the Jhansi-Janta Feedback Portal system.</p>
        
        <div class="role-badge">Role: ${user.role.toUpperCase()}</div>
        
        <div class="credentials-box">
            <strong style="color: #333;">Your Login Credentials:</strong>
            
            <div class="credential-field">
                <div class="label">📧 Email:</div>
                <div class="value">${user.email}</div>
            </div>
            
            <div class="credential-field">
                <div class="label">🔑 Password:</div>
                <div class="value">${password}</div>
            </div>
            
            <div class="credential-field">
                <div class="label">👤 Username:</div>
                <div class="value">${user.username}</div>
            </div>

            ${user.department ? `
            <div class="credential-field">
                <div class="label">🏢 Department:</div>
                <div class="value">${user.department}</div>
            </div>
            ` : ''}
        </div>

        <a href="${loginUrl}" class="login-button">Login to Portal</a>

        <div class="warning">
            <strong>⚠️ Security Notice:</strong>
            <ul style="margin: 5px 0; padding-left: 20px;">
                <li>Please change your password immediately after first login</li>
                <li>Do not share this password with anyone</li>
                <li>Delete this email after saving your credentials</li>
                <li>Your account is active and ready to use</li>
            </ul>
        </div>

        <h3>Your Responsibilities:</h3>
        ${user.role === 'admin' ? `
        <ul>
            <li>Monitor and manage all grievances in the system</li>
            <li>Assign grievances to appropriate government officers</li>
            <li>Track SLA compliance and performance metrics</li>
            <li>Generate reports and analytics</li>
            <li>Manage user accounts and permissions</li>
            <li>Review escalated grievances</li>
        </ul>
        ` : user.role === 'officer' ? `
        <ul>
            <li>Accept and process assigned grievances</li>
            <li>Provide timely updates to citizens</li>
            <li>Investigate and resolve grievances within SLA</li>
            <li>Collaborate with other departments as needed</li>
            <li>Document all actions and findings</li>
            <li>Escalate complex cases when necessary</li>
        </ul>
        ` : `
        <ul>
            <li>Submit grievances through the portal</li>
            <li>Track the status of your grievances in real-time</li>
            <li>Communicate with assigned officers</li>
            <li>View complete timeline of actions</li>
            <li>Provide feedback and ratings</li>
        </ul>
        `}

        <h3>Portal Features:</h3>
        <ul>
            <li>✅ Real-time Grievance Tracking</li>
            <li>✅ Complete Transparency of Process</li>
            <li>✅ Secure Authentication</li>
            <li>✅ Role-Based Dashboard</li>
            <li>✅ SLA Compliance Monitoring</li>
            <li>✅ Performance Analytics</li>
        </ul>

        <div style="background-color: #e8f4f8; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <strong>Quick Start:</strong><br>
            1. Click the login button above<br>
            2. Enter your email and password<br>
            3. Change your password on first login<br>
            4. Start using the portal
        </div>

        <div class="footer">
            <p><strong>Questions or Issues?</strong></p>
            <p>Contact the IT Support Team: support@janta-feedback.gov.in</p>
            <p>Portal URL: <a href="${portalUrl}">${portalUrl}</a></p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>This is an automated email. Please do not reply directly.</p>
        </div>
    </div>
</body>
</html>
    `;

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: `🎉 Welcome to Jhansi-Janta Feedback Portal - ${user.role.toUpperCase()} Account Created`,
      html: emailContent,
      replyTo: 'support@janta-feedback.gov.in'
    };

    const result = await transporter.sendMail(mailOptions);
    return {
      success: true,
      message: 'Credentials sent successfully',
      messageId: result.messageId
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate multiple accounts (bulk)
 */
const generateBulkAccounts = async (accountsList, sendEmails = true) => {
  const results = {
    created: [],
    failed: [],
    emailsSent: [],
    emailsFailed: []
  };

  for (const account of accountsList) {
    // Create account
    const createResult = await createUserAccount(
      account.name,
      account.email,
      account.role,
      account.department || ''
    );

    if (createResult.success) {
      results.created.push(createResult.user);

      // Send email if requested
      if (sendEmails) {
        const emailResult = await sendCredentialsViaGmail(
          createResult.user,
          createResult.user.password,
          account.portalUrl || 'http://localhost:3000'
        );

        if (emailResult.success) {
          results.emailsSent.push({
            email: account.email,
            status: 'sent'
          });
        } else {
          results.emailsFailed.push({
            email: account.email,
            error: emailResult.error
          });
        }
      }
    } else {
      results.failed.push({
        name: account.name,
        email: account.email,
        error: createResult.error
      });
    }
  }

  return results;
};

/**
 * Generate accounts from CSV data
 */
const generateAccountsFromCSV = async (csvData) => {
  const lines = csvData.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
  const accountsList = [];

  for (let i = 1; i < lines.length; i++) { // Skip header
    const [name, email, role, department] = lines[i].split(',').map(field => field.trim());
    if (name && email && role) {
      accountsList.push({
        name,
        email,
        role,
        department: department || ''
      });
    }
  }

  return generateBulkAccounts(accountsList);
};

/**
 * Export accounts template
 */
const getAccountsTemplate = () => {
  return `# CSV Template for Account Generation
# Format: Name, Email, Role, Department
# Roles: admin, officer, user
# Remove # to activate lines

# Example Admin
# Rajesh Kumar, rajesh.admin@government.in, admin, Administration

# Example Officers
# Priya Sharma, priya.officer@police.gov.in, officer, Police Department
# Amit Singh, amit.officer@public-works.gov.in, officer, Public Works

# Add your accounts below:
# Name, Email, Role, Department
`;
};

module.exports = {
  createUserAccount,
  sendCredentialsViaGmail,
  generateBulkAccounts,
  generateAccountsFromCSV,
  getAccountsTemplate,
  generatePassword,
  generateUsername,
  createMailTransporter
};
