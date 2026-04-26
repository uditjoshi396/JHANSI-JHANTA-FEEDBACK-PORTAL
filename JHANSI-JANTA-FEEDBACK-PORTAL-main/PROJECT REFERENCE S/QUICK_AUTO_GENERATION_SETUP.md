# Quick Start Guide: Auto-Generate Admin & Officer Accounts

## In 5 Minutes ⏱️

### Step 1: Enable Gmail (One-time)
1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Select **Mail** → **Windows Computer** → **Generate**
3. Copy the 16-character password

### Step 2: Update .env
```env
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=xxxx xxxx xxxx xxxx
PORTAL_URL=http://localhost:3000
```

### Step 3: Restart Server
```bash
npm start
# or
node index.js
```

### Step 4: Generate Account (Using REST Client)

**Create Single Account:**
```http
POST http://localhost:5000/api/users/generate-account
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Rajesh Kumar",
  "email": "rajesh@government.in",
  "role": "admin",
  "department": "Administration"
}
```

**Create Multiple Accounts:**
```http
POST http://localhost:5000/api/users/generate-bulk
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "accounts": [
    { "name": "Officer 1", "email": "officer1@gov.in", "role": "officer", "department": "Police" },
    { "name": "Officer 2", "email": "officer2@gov.in", "role": "officer", "department": "Works" }
  ]
}
```

**Create from Email List:**
```http
POST http://localhost:5000/api/users/generate-from-emails
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "emails": ["officer1@gov.in", "officer2@gov.in"],
  "role": "officer",
  "department": "Police Department"
}
```

## What Happens Next? ✅

1. **Account Created** - Username and password generated
2. **Email Sent** - Credentials delivered to officer's Gmail
3. **Ready to Use** - Officer logs in immediately
4. **First Login** - Prompted to change password

## Your Generated Account Details

```
Email:    officer@gov.in
Username: off.officer.xyz  (auto-generated)
Password: Sx#9aBxW3k@L    (shown in email)
Role:     Officer
```

## Common Tasks

### View All Auto-Generated Accounts
```bash
GET /api/users/auto-generated-users
Authorization: Bearer YOUR_JWT_TOKEN
```

### Resend Credentials
```bash
PUT /api/users/resend-credentials/{userId}
Authorization: Bearer YOUR_JWT_TOKEN
```

### Download CSV Template
```bash
GET /api/users/generate-template
Authorization: Bearer YOUR_JWT_TOKEN
```

Then save it as `accounts.csv` and fill in your data...

### Create from CSV File
```bash
# 1. Edit accounts.csv with your data
# 2. Read the file and send:

POST /api/users/generate-from-csv
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "csvData": "name,email,role,department\nRajesh Kumar,rajesh@gov.in,admin,Admin\nPriya Sharma,priya@gov.in,officer,Police"
}
```

## Email Template Preview

Officers receive a professional email with:
- ✅ Login credentials
- ✅ Portal link
- ✅ Role-based responsibilities  
- ✅ Security guidelines
- ✅ Support contact

## Troubleshooting

### Emails not sending?
```bash
# Check 1: Gmail credentials in .env
echo $GMAIL_USER
echo $GMAIL_PASSWORD

# Check 2: Verify account has 2FA enabled
# Check 3: Gmail App Passwords not regular password
```

### Email already exists?
```
Error: "Email already registered"
→ Use different email or delete existing user
```

### Invalid token?
```
Error: "Invalid token"
→ Make sure you're logged in as admin
→ Use correct JWT token
```

## API Summary Table

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/users/generate-account` | Create single account |
| POST | `/api/users/generate-bulk` | Create multiple accounts |
| POST | `/api/users/generate-from-emails` | Create from email list |
| POST | `/api/users/generate-from-csv` | Create from CSV data |
| GET | `/api/users/generate-template` | Download CSV template |
| GET | `/api/users/auto-generated-users` | List all auto-generated |
| PUT | `/api/users/resend-credentials/{id}` | Resend credentials |

## Complete Example: Node.js

```javascript
const axios = require('axios');

const API_URL = 'http://localhost:5000/api/users';
const JWT_TOKEN = 'your_jwt_token_here';

const headers = {
  'Authorization': `Bearer ${JWT_TOKEN}`,
  'Content-Type': 'application/json'
};

// Create single admin account
async function createAdmin() {
  try {
    const response = await axios.post(`${API_URL}/generate-account`, {
      name: 'Rajesh Kumar',
      email: 'rajesh@government.in',
      role: 'admin',
      department: 'Administration'
    }, { headers });
    
    console.log('✅ Account Created:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.response.data);
  }
}

// Create multiple officer accounts
async function createOfficers() {
  try {
    const response = await axios.post(`${API_URL}/generate-bulk`, {
      accounts: [
        {
          name: 'Priya Sharma',
          email: 'priya@police.gov.in',
          role: 'officer',
          department: 'Police'
        },
        {
          name: 'Amit Singh',
          email: 'amit@works.gov.in',
          role: 'officer',
          department: 'Public Works'
        }
      ],
      sendEmails: true
    }, { headers });
    
    console.log('✅ Officers Created:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.response.data);
  }
}

// Run
createAdmin();
createOfficers();
```

---

**Need more help?** See [AUTO_GENERATION_GUIDE.md](./AUTO_GENERATION_GUIDE.md)
