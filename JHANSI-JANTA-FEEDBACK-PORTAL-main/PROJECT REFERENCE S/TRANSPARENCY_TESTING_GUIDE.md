# 🧪 Transparency System - Testing & Integration Guide

## ✅ Project Completion Checklist

### Backend Components
- [x] TransparencyTracker Model (`server/models/TransparencyTracker.js`)
  - [x] Event logging schema
  - [x] Status transitions
  - [x] Role-based visibility
  - [x] Communication tracking
  - [x] SLA metrics
  - [x] Database indexes for performance

- [x] Transparency V2 Routes (`server/routes/transparencyV2.js`)
  - [x] Log event endpoint
  - [x] Timeline retrieval (complete + user-visible)
  - [x] Report generation
  - [x] Analytics endpoints
  - [x] Department performance
  - [x] Export functionality (JSON/CSV)
  - [x] Public message endpoint
  - [x] Auth middleware

- [x] Utility Functions (`server/lib/transparencyUtils.js`)
  - [x] Visibility permission checking
  - [x] Filtered timeline retrieval
  - [x] Role-based analytics
  - [x] Report generation
  - [x] Notification preparation
  - [x] Sensitive data masking

### Frontend Components
- [x] TransparencyDashboard Component (`client/src/pages/TransparencyDashboard.js`)
  - [x] Multiple tabs (Overview, Timeline, Report, Analytics, Dashboard)
  - [x] Grievance selector
  - [x] Timeline visualization
  - [x] Report generation and export
  - [x] Analytics display
  - [x] Admin dashboard
  - [x] Role-based UI

- [x] Styling (`client/src/styles/TransparencyDashboard.css`)
  - [x] Timeline styling
  - [x] Card layouts
  - [x] Responsive design
  - [x] Dark/Light mode compatible
  - [x] Mobile optimization
  - [x] Animations

### Server Integration
- [x] Updated `server/index.js`
  - [x] Added transparencyV2 route
  - [x] Compatible with existing routes

### Client Integration
- [x] Updated `client/src/App.js`
  - [x] Imported TransparencyDashboard
  - [x] Added `/transparency-center` route

### Documentation
- [x] TRANSPARENCY_SYSTEM_GUIDE.md
  - [x] Feature overview
  - [x] API documentation
  - [x] Usage examples
  - [x] Best practices

---

## 🚀 Installation Steps

### 1. Copy Backend Files

```bash
# TransparencyTracker Model
cp server/models/TransparencyTracker.js server/models/

# Transparency Routes
cp server/routes/transparencyV2.js server/routes/

# Utility Functions
cp server/lib/transparencyUtils.js server/lib/
```

### 2. Copy Frontend Files

```bash
# Transparency Dashboard Component
cp client/src/pages/TransparencyDashboard.js client/src/pages/

# Styling
cp client/src/styles/TransparencyDashboard.css client/src/styles/
```

### 3. Update Existing Files

The following files have been automatically updated:
- ✅ `server/index.js` - Added route
- ✅ `client/src/App.js` - Added import and route

---

## 🧪 Testing Guide

### Test 1: Create a Transparency Event

**Endpoint:** `POST /api/transparency/log-event`

```bash
curl -X POST http://localhost:5000/api/transparency/log-event \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "grievanceId": "507f1f77bcf86cd799439011",
    "eventType": "STATUS_UPDATED",
    "description": {
      "title": "Status Changed",
      "message": "Your grievance is being investigated"
    },
    "publicMessage": "Officer has started investigation",
    "visibleToUser": true,
    "statusFrom": "Pending",
    "statusTo": "In Progress"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Transparency event logged",
  "tracker": { ... }
}
```

### Test 2: Retrieve Timeline

**Endpoint:** `GET /api/transparency/timeline/:grievanceId`

```bash
curl -X GET http://localhost:5000/api/transparency/timeline/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer USER_TOKEN"
```

**Expected Response (for User):**
```json
{
  "success": true,
  "grievanceId": "507f1f77bcf86cd799439011",
  "timelineEvents": [
    {
      "eventType": "SUBMITTED",
      "performedBy": { "name": "Admin", "role": "admin" },
      "timestamp": "2024-02-17T10:00:00Z",
      "publicMessage": "Grievance received and under review",
      "visibleToUser": true
    }
  ],
  "totalEvents": 1
}
```

### Test 3: Generate Report

**Endpoint:** `GET /api/transparency/report/:grievanceId`

```bash
curl -X GET http://localhost:5000/api/transparency/report/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer USER_TOKEN"
```

### Test 4: Admin Dashboard

**Endpoint:** `GET /api/transparency/dashboard/roles`

```bash
curl -X GET http://localhost:5000/api/transparency/dashboard/roles \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Test 5: Export Report

**Endpoint:** `GET /api/transparency/export/:grievanceId?format=json|csv`

```bash
# JSON Format
curl -X GET "http://localhost:5000/api/transparency/export/507f1f77bcf86cd799439011?format=json" \
  -H "Authorization: Bearer USER_TOKEN"

# CSV Format
curl -X GET "http://localhost:5000/api/transparency/export/507f1f77bcf86cd799439011?format=csv" \
  -H "Authorization: Bearer USER_TOKEN" \
  --output grievance-report.csv
```

---

## 🌐 Frontend Testing

### Access the Dashboard

1. **Navigate to:** `http://localhost:3000/transparency-center`

2. **Test as Different Roles:**
   - Log in as **Citizen** → See only public events
   - Log in as **Officer** → See public + internal
   - Log in as **Admin** → See all + dashboard

### Test Each Tab

#### Overview Tab
- ✅ View feature descriptions
- ✅ See getting started guide
- ✅ Read feature cards

#### Timeline Tab
1. Enter grievance ID
2. Click "Load Timeline"
3. Verify events appear in chronological order
4. Check role badges match user roles
5. Verify status transitions display correctly

#### Report Tab
1. Select grievance
2. Click "Generate Report"
3. Verify report shows:
   - Grievance details
   - Event statistics
   - Role participation breakdown
   - Report generation date
4. Export as JSON
5. Export as CSV
6. Open files and verify data

#### Analytics Tab
1. Select grievance
2. Click "Generate Analytics"
3. Verify lifecycle data
4. Check role interactions
5. Verify milestones display

#### Admin Dashboard Tab
1. Log in as admin
2. Click "Load Dashboard"
3. Verify shows:
   - Total activities
   - Activities by role
   - Role-wise analysis
   - Event breakdown per role

---

## 🔗 Integration with Existing Routes

### Hook into Grievance Routes

**Examples of where to add transparency logging:**

```javascript
// In routes/grievance.js

// When grievance is created
const newGrievance = await Grievance.create(grievanceData);
const { logTransparencyEvent } = require('../lib/transparencyUtils');

await logTransparencyEvent(
  newGrievance._id,
  'SUBMITTED',
  {
    userId: req.user.id,
    name: req.user.name,
    role: req.user.role
  },
  'Grievance submitted',
  {},
  'Thank you for submitting your grievance. We will investigate it promptly.'
);

// When grievance is assigned
const assignedGrievance = await Grievance.findByIdAndUpdate(
  req.params.id,
  { assignedTo: req.body.assignedTo },
  { new: true }
);

const officer = await User.findById(req.body.assignedTo);
await logTransparencyEvent(
  assignedGrievance._id,
  'ASSIGNED_TO_OFFICER',
  {
    userId: req.user.id,
    name: req.user.name,
    role: req.user.role
  },
  `Assigned to officer: ${officer.name}`,
  { assignedToOfficer: officer.name },
  `Your grievance has been assigned to ${officer.name} for investigation.`
);

// When status is updated
await logTransparencyEvent(
  grievanceId,
  'STATUS_UPDATED',
  performedBy,
  `Status changed to ${newStatus}`,
  { previousStatus: oldStatus, newStatus },
  `Your grievance status has been updated to ${newStatus}`
);
```

---

## 📊 Database Setup

### Check if TransparencyTracker Collection Exists

```javascript
// In MongoDB shell
db.transparency_trackers.find().limit(1)
```

### Create Indexes (if not auto-created)

```javascript
db.transparency_trackers.createIndex({ grievanceId: 1, timestamp: -1 })
db.transparency_trackers.createIndex({ "performedBy.role": 1, timestamp: -1 })
db.transparency_trackers.createIndex({ eventType: 1, timestamp: -1 })
db.transparency_trackers.createIndex({ visibleToUser: 1 })
```

---

## 🔐 Security Checklist

- [x] JWT authentication on all endpoints
- [x] Role-based access control enforced
- [x] User cannot see other users' private data
- [x] Admin-only endpoints protected
- [x] Sensitive data masked for non-admins
- [x] IP addresses logged (admin-only visibility)
- [x] Date validation on queries
- [x] Input sanitization

---

## 📈 Performance Testing

### Test Large Timeline
```bash
# Create multiple events for testing
for i in {1..100}; do
  curl -X POST http://localhost:5000/api/transparency/log-event \
    -H "Authorization: Bearer TOKEN" \
    -H "Content-Type: application/json" \
    -d '{ ... }'
done

# Then test retrieval
time curl -X GET http://localhost:5000/api/transparency/timeline/GRIEVANCE_ID \
  -H "Authorization: Bearer TOKEN"
```

### Test Analytics Performance
```bash
time curl -X GET http://localhost:5000/api/transparency/analytics/grievance/GRIEVANCE_ID \
  -H "Authorization: Bearer TOKEN"
```

---

## 🐛 Debugging

### Enable Debug Logging

```javascript
// In transparencyV2.js
console.log('Timeline request for grievance:', grievanceId);
console.log('User role:', req.user.role);
console.log('Events found:', timeline.length);
```

### Check MongoDB Logs

```bash
# Monitor MongoDB operations
mongosh
> db.setProfilingLevel(1, { slowms: 100 })

# View slow queries
> db.system.profile.find({ millis: { $gt: 100 } }).pretty()
```

### Check Server Logs

```bash
# In terminal running server
tail -f logs/server.log | grep transparency
```

---

## 📋 Sample Test Data

### Create Test Grievance with Events

```javascript
// Use this script to populate test data
const mongoose = require('mongoose');
const Grievance = require('./models/Grievance');
const TransparencyTracker = require('./models/TransparencyTracker');

async function createTestData() {
  // Create grievance
  const grievance = await Grievance.create({
    title: 'Test Grievance for Transparency',
    description: 'This is a test grievance',
    category: 'Roads',
    citizenId: '...' // Replace with real user ID
  });

  // Create events
  const events = [
    {
      grievanceId: grievance._id,
      eventType: 'SUBMITTED',
      performedBy: { userId: '...', name: 'John', role: 'user' },
      visibleToUser: true,
      publicMessage: 'Grievance received'
    },
    {
      grievanceId: grievance._id,
      eventType: 'ACKNOWLEDGED',
      performedBy: { userId: '...', name: 'Admin', role: 'admin' },
      visibleToUser: true,
      publicMessage: 'We have received your grievance'
    }
  ];

  for (const event of events) {
    await TransparencyTracker.create(event);
  }

  console.log('Test data created successfully');
}

createTestData().catch(console.error);
```

---

## ✨ Features Deployed

| Feature | Status | Route | File |
|---------|--------|-------|------|
| Event Logging | ✅ | POST /api/transparency/log-event | transparencyV2.js |
| Timeline Retrieval | ✅ | GET /api/transparency/timeline/:id | transparencyV2.js |
| User Timeline | ✅ | GET /api/transparency/user-timeline/:id | transparencyV2.js |
| Report Generation | ✅ | GET /api/transparency/report/:id | transparencyV2.js |
| Analytics | ✅ | GET /api/transparency/analytics/grievance/:id | transparencyV2.js |
| Department Analytics | ✅ | GET /api/transparency/analytics/department | transparencyV2.js |
| Admin Dashboard | ✅ | GET /api/transparency/dashboard/roles | transparencyV2.js |
| Export (JSON/CSV) | ✅ | GET /api/transparency/export/:id | transparencyV2.js |
| Public Messages | ✅ | POST /api/transparency/add-public-message/:id | transparencyV2.js |
| Dashboard UI | ✅ | /transparency-center | TransparencyDashboard.js |

---

## 🎓 Tutorials

### Tutorial 1: Track Your Grievance
1. Submit a grievance
2. Go to `/transparency-center`
3. Enter your Grievance ID
4. Click "Load Timeline"
5. See every update instantly!

### Tutorial 2: As an Officer
1. Log in as officer
2. Go to `/transparency-center`
3. View your assigned grievances
4. Add public updates for citizens
5. Monitor progress analytics

### Tutorial 3: As Admin
1. Log in as admin
2. Go to `/transparency-center`
3. Click "Admin Dashboard" tab
4. View all activities by role
5. Export reports for auditing

---

**Version:** 1.0
**Status:** Complete & Tested ✅
**Last Updated:** February 17, 2026
