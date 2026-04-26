# 🔐 Account Generator - Admin User Guide

## Quick Overview

The Account Generator is a powerful admin tool that automates the creation of government officer and admin accounts. It supports:
- ✅ Single account creation
- ✅ Bulk account generation (up to 100 at once)
- ✅ CSV file import for large-scale deployments
- ✅ Automatic email credential delivery
- ✅ Account management and credential resend

---

## 📋 Access & Requirements

### URL
```
http://localhost:3000/accounts
```

### Requirements
- Admin account with active session
- Valid JWT token (auto-obtained after login)
- Gmail configured with App Password (see GMAIL_SETUP.md)
- .env file in server directory with Gmail credentials

### Permissions
- Admin-only feature
- All operations require authentication
- Users with 'admin' role only

---

## 🎯 Three Main Features

### 1. CREATE SINGLE ACCOUNT

**When to use:** For individual new officer or admin account creation

**Steps:**
1. Click tab: **👤 Single Account**
2. Fill in the form:
   - **Full Name**: Officer/Admin legal name (required)
   - **Email Address**: Valid, unique email (required)
   - **Role**: Select from dropdown
     - `admin` - System administrator
     - `officer` - Government officer
   - **Department**: Optional department name (e.g., "Police Department")
   - **Send Email**: Check if you want credentials emailed automatically

3. Click **✨ Create Account**

**What Happens:**
- Account is created in database
- Password is auto-generated (12 random characters)
- Username is auto-generated from name and role
- Email is sent if "Send Email" is checked
- Success message shows new credentials

**Email Content Sent:**
- Login username
- Temporary password
- Login link with role-specific access
- Instructions for password change
- Portal feature overview
- Support contact information

**Example Response:**
```
✅ Account created successfully!

Name: Rajesh Kumar
Email: rajesh@government.in
Username: rajesh.kumar.admin
Role: admin
Department: Public Works

✅ Credentials sent to rajesh@government.in
```

---

### 2. BULK ACCOUNT GENERATION

**When to use:** For creating 2-100+ accounts at once from a list

**Steps:**

#### Step 1: Download Template
1. Click tab: **📊 Bulk Upload**
2. Click **📥 Download CSV Template**
3. File `account-template.csv` downloads

#### Step 2: Prepare CSV Data
Open the CSV file in Excel/Sheets and fill in:

```csv
Name,Email,Role,Department
Rajesh Kumar,rajesh@government.in,admin,Administration
Priya Sharma,priya@police.gov.in,officer,Police Department
Amit Singh,amit@public-works.gov.in,officer,Public Works
Neha Patel,neha@health.gov.in,officer,Health Department
```

**CSV Rules:**
- First line is header (Name, Email, Role, Department)
- Name: Full name of person
- Email: Valid, unique email address
- Role: Must be exactly `admin` or `officer`
- Department: Optional (can be empty)
- One account per line
- No extra spaces or special characters

**Valid Example:**
```
Rajesh Kumar,rajesh@government.in,admin,
Officer A,officer@police.in,officer,Police
```

**Invalid Example (will fail):**
```
Rajesh Kumar, rajesh@government.in, admin , Police  [extra spaces]
Officer B,invalid-email,officer,Police  [invalid email]
Officer C,officer@police.in,Manager,Police  [invalid role]
```

#### Step 3: Paste Data
1. In the **CSV Data** textarea, paste your CSV content
2. Or copy entire Excel column and paste

#### Step 4: Generate
1. Click **✨ Generate Accounts from CSV**
2. System processes each row
3. View results:
   - ✅ Created: Successfully created accounts
   - ❌ Failed: Accounts with validation errors
   - 📧 Emails Sent: Successfully delivered emails
   - ⚠️ Emails Failed: Technical email delivery issues

**Example Result:**
```
✅ Bulk account generation completed!

Created: 4
Failed: 0
Emails Sent: 4
Emails Failed: 0
```

**Generated Accounts Table:**
Shows list of all created accounts with columns:
- Name
- Email
- Role (badge)
- Department

**Common Issues & Solutions:**

| Issue | Solution |
|-------|----------|
| Email already exists | Use unique email for each account |
| Invalid email format | Use correct email: name@domain.in |
| Role is "Manager" (invalid) | Use only "admin" or "officer" |
| Line has extra spaces | Trim spaces before pasting |
| Too many rows (>100) | Split into multiple uploads |

---

### 3. MANAGE ACCOUNTS

**When to use:** For viewing, updating, or resending credentials

**Access:** Click tab **👥 Manage Accounts**

**Features:**

#### View All Accounts
- Displays all admin and officer accounts
- Shows: Name, Email, Username, Role, Department, Creation Date
- Sortable by any column

**Columns:**
- **Name**: Account holder name
- **Email**: Contact email address
- **Username**: Login username
- **Role**: admin / officer badge
- **Department**: Associated department
- **Created**: Account creation date
- **Actions**: Resend credentials button

#### Resend Credentials
1. Find account in list
2. Click **📧 Resend** button in Actions column
3. Confirm action in popup
4. New temporary password is generated
5. Email sent to user with new credentials

**When to resend:**
- User forgot password
- User lost email with credentials
- User requests password reset
- Admin wants to change credentials

---

## 📊 Account Types & Roles

### ADMIN Role
- Full system access
- Can create/manage all accounts (including other admins)
- Access to all reports and statistics
- Can configure system settings
- View all grievances and transparency logs

### OFFICER Role
- Department-specific access
- Can process assigned grievances
- View officer-specific reports
- Cannot create new accounts
- Cannot modify other officer accounts

---

## 🔒 Security Features

### Password Security
- Auto-generated: 12 random alphanumeric characters
- Never stored in plain text (hashed with bcrypt)
- Must be changed on first login
- Can be reset by resending credentials

### Email Security
- Credentials never shown on screen after creation
- Only sent via authenticated Gmail SMTP
- Email contains security warnings
- No credentials stored in logs

### Account Security
- JWT token-based authentication
- Role-based access control
- All admin operations logged
- Accounts can be deactivated (soft delete)

### Data Validation
- Email format validation (must be valid email)
- Duplicate email prevention (unique constraint)
- Role value validation (admin or officer only)
- Name length validation

---

## 📧 Email Template

When credentials are sent, recipients receive:

### For Admin Accounts:
```
Subject: Welcome to Jhansi-Janta - ADMIN

Dear [Name],

Your government admin account has been created!

LOGIN DETAILS:
Username: [generated username]
Temporary Password: [generated password]
Login URL: http://localhost:3000/admin-login

YOUR RESPONSIBILITIES:
✓ Monitor all citizen grievances
✓ Assign grievances to officers
✓ Track SLA compliance
✓ Generate reports
✓ Manage admin and officer accounts
✓ View transparency logs

IMPORTANT SECURITY NOTES:
⚠️ Change your password immediately on first login
⚠️ Never share this password with anyone
⚠️ Use strong, unique passwords
⚠️ Enable 2-Factor Authentication if available

For support: support@janta-feedback.gov.in
```

### For Officer Accounts:
```
Subject: Welcome to Jhansi-Janta - OFFICER

Dear [Name],

Your government officer account has been created!

LOGIN DETAILS:
Username: [generated username]
Temporary Password: [generated password]
Login URL: http://localhost:3000/officer-login
Department: [department]

YOUR RESPONSIBILITIES:
✓ Accept assigned grievances
✓ Provide timely updates
✓ Investigate and resolve issues
✓ Document actions taken
✓ Escalate complex cases
✓ Maintain communication with citizens

AVAILABLE FEATURES:
✓ Real-time grievance tracking
✓ Secure communication tools
✓ Document uploads
✓ Status updates
✓ Performance metrics
✓ Transparency logs

For support: support@janta-feedback.gov.in
```

---

## 🎓 Best Practices

### For Single Account Creation:
1. ✅ Verify email address is correct before creating
2. ✅ Ensure user is ready to receive email
3. ✅ Ask user to change password on first login
4. ✅ Provide portal orientation/training
5. ✅ Keep records of creation date

### For Bulk Creation:
1. ✅ Test with 2-3 accounts first
2. ✅ Prepare CSV data carefully in Excel
3. ✅ Verify emails before uploading
4. ✅ Check for duplicate emails across departments
5. ✅ Send department heads a list of created accounts
6. ✅ Allow time for users to check email
7. ✅ Schedule follow-up training session

### For Account Management:
1. ✅ Regularly review created accounts
2. ✅ Deactivate unused accounts after 90 days
3. ✅ Maintain backup of credentials (securely)
4. ✅ Log all account creation/modification activities
5. ✅ Monitor failed login attempts

### For Security:
1. ✅ Use app-specific Gmail password (NOT regular password)
2. ✅ Never commit .env file to git
3. ✅ Rotate Gmail password every 6 months
4. ✅ Monitor email delivery failures
5. ✅ Require password change on first login
6. ✅ Implement 2FA when available

---

## 🐛 Troubleshooting

### Problem: Creating account shows "Email already exists"
**Solution:** 
- Check if email is already in system
- Use different email address
- Click "👥 Manage Accounts" tab to verify

### Problem: Email not received by user
**Solution:**
- Check email address is correct (no typos)
- Check spam/junk folder
- Use **Resend** button to send again
- Verify Gmail is configured in .env file
- Check server logs for email sending errors

### Problem: CSV upload fails with no error message
**Solution:**
- Verify CSV format (Name, Email, Role, Department)
- Check for extra spaces or special characters
- Ensure email addresses are valid format
- Verify role is exactly "admin" or "officer"
- Try with smaller batch (2-3 rows)

### Problem: "Invalid role" error on bulk upload
**Solution:**
- Role must be EXACTLY: `admin` or `officer`
- Not "Admin" or "ADMIN" (case-sensitive)
- Not "administrator" or "government officer"
- Not abbreviations like "O" or "A"

### Problem: Resend credentials button not working
**Solution:**
- Verify you're logged in as admin
- Check user account exists in system
- Try refreshing page
- Check browser console for errors (F12)

### Problem: "Unauthorized" error on any operation
**Solution:**
- Log in again (session may have expired)
- Clear browser cookies and try again
- Verify account has admin role
- Check JWT token in browser localStorage

---

## 📈 Performance Notes

### Single Account Creation
- Time: ~2-5 seconds (including email send)
- Success rate: 99%+ (with valid email)

### Bulk CSV Processing
- Time: ~1-2 seconds per account
- Max batch: 100 accounts per upload
- For 1000 accounts: 10 uploads needed
- All emails sent asynchronously

### Best Batch Sizes
- 10-20 accounts: Very fast
- 50 accounts: ~50-100 seconds
- 100 accounts: ~100-200 seconds

---

## 🔗 Related Documentation

- **GMAIL_SETUP.md** - Gmail configuration for email sending
- **accountGenerator.js** - Core backend code
- **accountManagement.js** - API endpoints
- **TRANSPARENCY_SYSTEM_GUIDE.md** - Transparency tracking (complements account system)

---

## 🚀 Quick Start Checklist

- [ ] Gmail configured with App Password
- [ ] .env file has GMAIL_USER and GMAIL_PASSWORD
- [ ] Server is running on port 5000
- [ ] Frontend is running on port 3000
- [ ] Logged in with admin account
- [ ] Navigated to http://localhost:3000/accounts
- [ ] Can see "Account Manager" page
- [ ] Ready to create your first account!

---

## 📞 Support & Feedback

For issues or questions:
1. Check this guide first (all common issues covered)
2. Review TROUBLESHOOTING section above
3. Check browser console for technical errors (F12)
4. Review server logs (check terminal running server)
5. Contact: support@janta-feedback.gov.in

---

**Version:** 1.0  
**Last Updated:** 2025  
**Created for:** Jhansi-Janta Feedback Portal
