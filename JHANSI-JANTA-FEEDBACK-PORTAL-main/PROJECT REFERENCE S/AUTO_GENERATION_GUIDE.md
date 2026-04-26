# Auto-Generation of Admin & Government Officer Accounts via Gmail

This guide explains how to use the auto-generation system to create admin and government officer accounts and send credentials through Gmail.

## Prerequisites

1. **Gmail Account** - You need a Gmail account with App Password enabled
2. **Admin Access** - You must be logged in as an admin user
3. **Environment Setup** - Gmail credentials in `.env` file

## Gmail Setup (One-time Configuration)

### Step 1: Enable 2-Factor Authentication on Gmail
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click "Security" in the left sidebar
3. Enable "2-Step Verification"

### Step 2: Generate Gmail App Password
1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Select **Mail** and **Windows/Mac/Linux**
3. Click **Generate**
4. Copy the generated 16-character password

### Step 3: Configure Environment Variables
Create or update your `.env` file with:

```env
# Gmail Configuration for Auto-Account Generation
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=xxxx xxxx xxxx xxxx
# OR use this alias
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# Portal Configuration
PORTAL_URL=https://your-portal-domain.com
# or for local development
PORTAL_URL=http://localhost:3000

# Reply-To Email
REPLY_TO_EMAIL=support@janta-feedback.gov.in
```

## API Endpoints

All endpoints require admin authentication. Include JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

### 1. Create Single Account
**Endpoint:** `POST /api/users/generate-account`

**Request Body:**
```json
{
  "name": "Rajesh Kumar",
  "email": "rajesh.admin@government.in",
  "role": "admin",
  "department": "Administration"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "user_id",
    "name": "Rajesh Kumar",
    "email": "rajesh.admin@government.in",
    "username": "adm.rajesh.kumar.xyz",
    "role": "admin",
    "department": "Administration"
  },
  "emailSent": true,
  "emailMessage": "Credentials sent successfully"
}
```

### 2. Create Multiple Accounts (Bulk)
**Endpoint:** `POST /api/users/generate-bulk`

**Request Body:**
```json
{
  "accounts": [
    {
      "name": "Priya Sharma",
      "email": "priya.officer@police.gov.in",
      "role": "officer",
      "department": "Police Department"
    },
    {
      "name": "Amit Singh",
      "email": "amit.officer@public-works.gov.in",
      "role": "officer",
      "department": "Public Works"
    }
  ],
  "sendEmails": true
}
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "totalRequested": 2,
    "created": 2,
    "failed": 0,
    "emailsSent": 2,
    "emailsFailed": 0
  },
  "accounts": [
    {
      "id": "user_id_1",
      "name": "Priya Sharma",
      "email": "priya.officer@police.gov.in",
      "username": "off.priya.sharma.xyz",
      "role": "officer",
      "department": "Police Department"
    },
    {
      "id": "user_id_2",
      "name": "Amit Singh",
      "email": "amit.officer@public-works.gov.in",
      "username": "off.amit.singh.xyz",
      "role": "officer",
      "department": "Public Works"
    }
  ],
  "failures": [],
  "emailStatus": {
    "sent": [
      { "email": "priya.officer@police.gov.in", "status": "sent" },
      { "email": "amit.officer@public-works.gov.in", "status": "sent" }
    ],
    "failed": []
  }
}
```

### 3. Generate from Email List
**Endpoint:** `POST /api/users/generate-from-emails`

Quick way to create multiple accounts from just email addresses.

**Request Body:**
```json
{
  "emails": [
    "officer1@police.gov.in",
    "officer2@police.gov.in",
    "officer3@police.gov.in"
  ],
  "role": "officer",
  "department": "Police Department"
}
```

**Response:** (Similar to bulk endpoint)

The system automatically generates names from email addresses.

### 4. Generate from CSV Data
**Endpoint:** `POST /api/users/generate-from-csv`

**Request Body:**
```json
{
  "csvData": "name,email,role,department\nRajesh Kumar,rajesh@gov.in,admin,Admin\nPriya Sharma,priya@gov.in,officer,Police"
}
```

### 5. Get CSV Template
**Endpoint:** `GET /api/users/generate-template`

Downloads a CSV template file for bulk account creation.

**Response:** CSV file with proper headers and examples

### 6. View All Auto-Generated Users
**Endpoint:** `GET /api/users/auto-generated-users`

Lists all automatically generated accounts.

**Response:**
```json
{
  "total": 5,
  "users": [
    {
      "_id": "user_id",
      "name": "Rajesh Kumar",
      "email": "rajesh@gov.in",
      "role": "admin",
      "username": "adm.rajesh.xyz",
      "department": "Administration",
      "isActive": true,
      "accountGeneratedAutomatically": true,
      "createdAt": "2026-02-17T10:30:00.000Z"
    }
  ]
}
```

### 7. Resend Credentials
**Endpoint:** `PUT /api/users/resend-credentials/{userId}`

Resend login credentials for auto-generated accounts.

**Response:**
```json
{
  "success": true,
  "message": "Credentials sent successfully",
  "email": "rajesh@gov.in"
}
```

## Email Template

Users receive a professional HTML email containing:
- ✅ Welcome message with role badge
- ✅ Login credentials (email, password, username)
- ✅ Department information
- ✅ Login link for their role
- ✅ Role-specific responsibilities
- ✅ Portal features overview
- ✅ Security guidelines
- ✅ Support contact information

## Usage Examples

### Example 1: Using curl

```bash
# Create single admin account
curl -X POST http://localhost:5000/api/users/generate-account \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rajesh Kumar",
    "email": "rajesh@government.in",
    "role": "admin",
    "department": "Administration"
  }'
```

### Example 2: Using JavaScript/Node.js

```javascript
const addAminAccount = async (token) => {
  const response = await fetch('http://localhost:5000/api/users/generate-account', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Rajesh Kumar',
      email: 'rajesh@government.in',
      role: 'admin',
      department: 'Administration'
    })
  });

  const result = await response.json();
  console.log(result);
};
```

### Example 3: Bulk Creation

```javascript
const createBulkAccounts = async (token) => {
  const accounts = [
    {
      name: 'Priya Sharma',
      email: 'priya.officer@police.gov.in',
      role: 'officer',
      department: 'Police Department'
    },
    {
      name: 'Amit Singh',
      email: 'amit.officer@pwc.gov.in',
      role: 'officer',
      department: 'Public Works'
    }
  ];

  const response = await fetch('http://localhost:5000/api/users/generate-bulk', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accounts, sendEmails: true })
  });

  const result = await response.json();
  console.log(result);
};
```

## Security Best Practices

1. **Never expose Gmail password** in code or version control
2. **Use Gmail App Password**, not your main Gmail password
3. **Restrict API access** to authenticated admins only
4. **Audit auto-generated accounts** regularly
5. **Force password change** on first login (can be implemented in UI)
6. **Use HTTPS** in production
7. **Rotate Gmail App Password** periodically
8. **Keep environment variables secure**

## Troubleshooting

### Gmail Not Sending Emails

**Problem:** Emails not being sent to users

**Solution:**
1. Verify `.env` has correct `GMAIL_USER` and `GMAIL_PASSWORD`
2. Check Gmail account has 2FA enabled
3. Verify App Password is correct (remove spaces if copied)
4. Check Gmail's less secure app access is not blocking

### Account Created But Email Not Sent

**Response shows:**
```json
{
  "success": true,
  "emailSent": false,
  "emailMessage": "Error message here"
}
```

**Solutions:**
1. Verify email address is correct
2. Check Gmail quota hasn't been exceeded
3. Use resend-credentials endpoint to retry

### Database Conflicts

**Error:** Email already registered

**Solution:**
1. Use different email address
2. Or delete existing user first if needed

## Generated Account Information

When accounts are auto-generated:

- **Username** - Automatically generated (e.g., `adm.rajesh.kumar.xyz`)
- **Password** - Secure random 12-character password
- **Email** - As provided
- **Role** - admin or officer
- **Status** - Active by default
- **Department** - As provided

Users receive all login information in the email and can change their password on first login.

## CSV Format

When using CSV upload, format should be:

```
name,email,role,department
Rajesh Kumar,rajesh@gov.in,admin,Administration
Priya Sharma,priya@gov.in,officer,Police Department
Amit Singh,amit@gov.in,officer,Public Works
```

**Notes:**
- First line is header (don't skip)
- Roles: `admin` or `officer`
- Department is optional
- Email must be unique
- Name can contain spaces

## Performance Considerations

- **Single account**: ~2-3 seconds
- **Bulk (10 accounts)**: ~10-15 seconds
- **Bulk (100 accounts)**: ~60-90 seconds
- Gmail has rate limits (~1000 emails/day for normal accounts)

## API Rate Limiting

To protect against abuse, consider adding rate limiting:

```javascript
const rateLimit = require('express-rate-limit');

const accountLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

router.post('/generate-account', accountLimiter, /* ... */);
```

## Support

For issues or questions:
- Check `.env` configuration
- Review MongoDB connection
- Verify JWT token is valid
- Check Gmail account settings
- Review server logs for detailed errors

---

**Last Updated:** February 2026
**Version:** 1.0
