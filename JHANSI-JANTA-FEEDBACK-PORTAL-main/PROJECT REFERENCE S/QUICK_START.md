# JHANSI-JANTA Feedback Portal - Quick Start Guide

## 🎯 Project Overview
A comprehensive citizen grievance management system with role-based access for Citizens, Officers, and Administrators.

---

## ✅ CURRENT STATUS: RUNNING

### Active Services:
- ✅ **Backend Server:** http://localhost:5000 (Express + MongoDB)
- ✅ **Frontend App:** http://localhost:3000 (React)
- ✅ **Database:** MongoDB Connected

---

## 📱 Access the Application

### Open in Browser:
```
http://localhost:3000
```

The application is now **LIVE** and ready to test!

---

## 👥 Three User Roles

### 1️⃣ CITIZEN
Access the public portal to submit and track grievances

**Test Account:**
- Email: `citizen@example.com`
- Password: (create new via /register)

**Access:** 
- Home: http://localhost:3000
- Register: http://localhost:3000/register
- Login: http://localhost:3000/login
- Dashboard: http://localhost:3000/dashboard

**Features:**
- ✅ Submit grievances
- ✅ Track status in real-time
- ✅ View officer responses
- ✅ Rate resolution
- ✅ View statistics

---

### 2️⃣ OFFICER
Manage assigned grievances and provide responses

**Access:**
- Login: http://localhost:3000/officer-login
- Register: http://localhost:3000/officer-register
- Dashboard: http://localhost:3000/officer

**Test Registration:**
1. Go to: http://localhost:3000/officer-register
2. Fill registration form:
   - Name: Test Officer
   - Email: officer@example.com
   - Phone: 9876543210
   - Department: Roads & Infrastructure
   - Password: Officer@123
   - Registration Code: (ask admin)
3. Login with credentials

**Features:**
- ✅ View assigned grievances
- ✅ Update grievance status
- ✅ Add responses & feedback
- ✅ Track performance metrics
- ✅ View citizen ratings

---

### 3️⃣ ADMIN
Oversee entire system and manage users

**Access:**
- Login: http://localhost:3000/admin-login
- Register: http://localhost:3000/admin-register
- Dashboard: http://localhost:3000/admin

**Test Admin Account:**
1. Go to: http://localhost:3000/admin-login
2. Login (if account exists in database)
3. OR Register via: http://localhost:3000/admin-register
   - Fill form with admin details
   - Use admin code if required
   - Login after registration

**Features:**
- ✅ View all grievances
- ✅ Manage users
- ✅ System statistics
- ✅ Update grievance status
- ✅ Delete grievances/users if needed

---

## 🧪 Quick Testing Workflow

### Step 1: Create Citizen Account
```
1. Go to http://localhost:3000/register
2. Fill in:
   - Name: John Doe
   - Email: john@example.com
   - Password: Test@123
3. Click Register
4. Login with credentials
5. Dashboard appears
```

### Step 2: Submit a Grievance
```
1. From Dashboard, click "Submit Grievance"
2. Fill details:
   - Title: Broken Road at Main Street
   - Category: Road
   - Description: Pothole on main street causing accidents
   - Priority: High
   - Location: Main Street, Jhansi
3. Add attachment (optional)
4. Submit
5. View in grievances list (Status: Pending)
```

### Step 3: Officer Reviews Grievance
```
1. Go to http://localhost:3000/officer-login
2. Login as officer
3. Dashboard shows assigned grievances
4. Click "My Grievances"
5. Find the grievance
6. Click "Respond"
7. Fill:
   - Status: Under Progress
   - Response: "Repair work started"
8. Submit
9. Check citizen dashboard - update appears
```

### Step 4: Admin Monitors System
```
1. Go to http://localhost:3000/admin-login
2. Login as admin
3. Dashboard shows:
   - Total Grievances: 1
   - Total Users: 2+
   - Pending: Status count
   - Under Progress: Status count
4. Click "Grievances" tab
5. View all system grievances
6. Can update status or delete if needed
7. Click "Users" tab to manage users
```

---

## 🔐 Test Credentials

### Create Your Own:
Each role can register using their respective pages:

| Role | Register URL | Login URL |
|------|---|---|
| Citizen | /register | /login |
| Officer | /officer-register | /officer-login |
| Admin | /admin-register | /admin-login |

### Required Fields:

**Citizen Registration:**
- Name (min 2 chars)
- Email (valid format)
- Password (min 6 chars)

**Officer Registration:**
- Name
- Email
- Phone (10 digits)
- Department (dropdown)
- Password (6+ chars, number, uppercase required)
- Registration Code (admin-provided)

**Admin Registration:**
- Name
- Email
- Password
- Admin Code (required for registration)

---

## 📊 Testing the Complete Flow

### Scenario: Road Repair Grievance

1. **Citizen submits grievance** (5 mins)
   - Create citizen account
   - Fill grievance form
   - Submit with photo

2. **Officer receives and reviews** (10 mins)
   - Login as officer
   - View assigned grievance
   - Update status to "Under Progress"
   - Add technical assessment

3. **Officer resolves issue** (5 mins)
   - Update status to "Resolved"
   - Add completion details

4. **Citizen rates resolution** (5 mins)
   - View grievance update
   - Rate officer (1-5 stars)
   - View complete history

5. **Admin reviews statistics** (5 mins)
   - Login as admin
   - Check dashboard metrics
   - View status distribution
   - Verify data accuracy

**Total Time: 30 minutes for complete end-to-end test**

---

## 🛠️ Backend API Endpoints

### Authentication
```
POST /api/auth/register      - Register user
POST /api/auth/login         - Login user
GET  /api/auth/logout        - Logout
```

### Grievances
```
POST   /api/grievances                    - Create grievance
GET    /api/grievances/user/:userId       - Get user grievances
GET    /api/grievances/officer            - Get assigned grievances (officer)
GET    /api/grievances/all                - Get all grievances (admin)
GET    /api/grievances/:id                - Get grievance details
PUT    /api/grievances/:id/status         - Update status
DELETE /api/grievances/:id                - Delete grievance
```

### Users
```
GET    /api/users/all        - Get all users (admin)
DELETE /api/users/:id        - Delete user (admin)
```

---

## 🔍 Key Features to Test

### ✨ Citizen Features
- [ ] Submit grievance with attachment
- [ ] Real-time status tracking
- [ ] View officer responses
- [ ] Rate/review resolution
- [ ] Search grievances
- [ ] Download certificates

### 👮 Officer Features
- [ ] View assigned grievances
- [ ] Filter by status/category
- [ ] Update grievance status
- [ ] Add detailed responses
- [ ] View performance metrics
- [ ] Track average rating

### 🛡️ Admin Features
- [ ] Dashboard with system stats
- [ ] View all grievances
- [ ] Manage users (view/delete)
- [ ] Filter and search
- [ ] Status distribution chart
- [ ] Recent activity feed

### 🔒 Security Features
- [ ] JWT token authentication
- [ ] Role-based access control
- [ ] Password encryption
- [ ] Input validation
- [ ] CORS protection
- [ ] Session timeout (7 days)

---

## 📈 Performance Metrics to Check

- **Page Load Time:** < 3 seconds
- **API Response Time:** < 1 second
- **Dashboard Rendering:** < 2 seconds
- **Search/Filter Speed:** Instant

---

## 🐛 Common Issues & Solutions

### Issue: Server won't start
**Solution:**
```
1. Kill process on port 5000: netstat -ano | findstr :5000
2. Verify MongoDB is running
3. Check .env configuration
4. Review server logs for errors
```

### Issue: Client won't compile
**Solution:**
```
1. Delete node_modules: rm -rf node_modules
2. Clear cache: npm cache clean --force
3. Reinstall: npm install
4. Start: npm start
```

### Issue: Login fails
**Solution:**
```
1. Verify credentials are correct
2. Clear localStorage: Right-click → Inspect → Application → Clear Storage
3. Check server is running
4. Verify user exists in database
```

### Issue: Grievance not saving
**Solution:**
```
1. Check MongoDB connection
2. Verify all required fields are filled
3. Check browser console for errors
4. Inspect network tab for API failures
```

---

## 📞 Support & Debugging

### Check Server Logs:
Terminal shows real-time server messages and errors

### Check Browser Logs:
```
Right-click → Inspect → Console
```

### Network Debugging:
```
Right-click → Inspect → Network tab
Check API requests and responses
```

### Database Debugging:
Connect to MongoDB and verify data:
```
- Check users collection
- Check grievances collection
- Verify data integrity
```

---

## 🎓 Learning Resources

### File Structure:
```
client/
├── src/
│   ├── pages/        (All page components)
│   ├── components/   (Reusable components)
│   ├── styles/       (CSS files)
│   └── utils/        (Helper functions)
└── public/

server/
├── models/           (Database schemas)
├── routes/           (API endpoints)
├── lib/              (Utilities: AI, mailer, auth)
└── index.js          (Main server file)
```

### Key Technologies:
- **Frontend:** React 18, React Router, Axios
- **Backend:** Express.js, MongoDB, JWT
- **Styling:** CSS3 with gradients and animations
- **Authentication:** JWT tokens with 7-day expiry
- **Database:** MongoDB with Mongoose

---

## ✅ Checklist Before Deployment

- [ ] All pages load without errors
- [ ] Authentication works (all 3 roles)
- [ ] Grievances CRUD operations work
- [ ] Status updates reflect correctly
- [ ] Admin dashboard displays accurate stats
- [ ] Officer dashboard shows assigned tasks
- [ ] Citizen can track their grievances
- [ ] Responsive design works on mobile
- [ ] Error handling is graceful
- [ ] Performance is acceptable
- [ ] All links work correctly
- [ ] Security validations in place
- [ ] Database is properly configured
- [ ] Logging is implemented
- [ ] No console errors

---

## 🚀 Next Steps

After testing:
1. **Document findings** in the TESTING_GUIDE.md
2. **Fix any bugs** discovered
3. **Optimize performance** if needed
4. **Add more test data** to database
5. **Configure deployment** settings
6. **Plan go-live** strategy

---

## 📱 Access URLs Summary

| Component | URL |
|-----------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:5000 |
| **Admin Panel** | http://localhost:3000/admin |
| **Officer Panel** | http://localhost:3000/officer |
| **Citizen Dashboard** | http://localhost:3000/dashboard |

---

**Ready to Test! 🎉**

Start by visiting: **http://localhost:3000**

Generated: January 22, 2026
Project: JHANSI-JANTA Feedback Portal
Status: ✅ RUNNING AND READY
