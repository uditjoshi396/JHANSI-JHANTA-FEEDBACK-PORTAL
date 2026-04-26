# Activity Logger + Transparency Integration Guide

## Overview

The **Enhanced Activity Logger** (`activityLoggerEnhanced.js`) integrates the existing ActivityLog system with the new TransparencyTracker system. Every grievance-related action now automatically logs to BOTH systems.

## Key Features

✅ **Dual Logging**: All grievance events logged to both ActivityLog and TransparencyTracker  
✅ **Automatic Transparency**: No separate code needed—transparency logging happens automatically  
✅ **Public Messages**: Citizens see status updates through the Transparency Dashboard  
✅ **Backward Compatible**: Existing code continues to work without changes  
✅ **3 New Event Types**: Added ACKNOWLEDGED, ESCALATED, and PROGRESS_UPDATE logging  

## Integration Points

### 1. Replace existing activity logger import in grievance routes

**In: `server/routes/grievance.js`**

```javascript
// OLD:
const { logGrievanceSubmitted, logGrievanceStatusChanged } = require('../lib/activityLogger');

// NEW:
const { logGrievanceSubmitted, logGrievanceStatusChanged } = require('../lib/activityLoggerEnhanced');
```

### 2. Use in Grievance Submission

**In: `server/routes/grievance.js` - POST `/api/grievances`**

```javascript
// After creating grievance in database
const newGrievance = await Grievance.create({
  title: req.body.title,
  description: req.body.description,
  category: req.body.category,
  department: req.body.department,
  userId: req.user.id,
  status: 'pending'
});

// Log submission - automatically logs to BOTH ActivityLog + TransparencyTracker
const { logGrievanceSubmitted } = require('../lib/activityLoggerEnhanced');
await logGrievanceSubmitted(
  newGrievance,
  req.user,
  req.ip,
  req.headers['user-agent']
);

res.status(201).json({ message: 'Grievance submitted successfully', grievance: newGrievance });
```

### 3. Use in Grievance Acknowledgment (NEW)

**In: `server/routes/officer.js` or `server/routes/admin.js`**

```javascript
// When officer first receives/acknowledges grievance
const { logGrievanceAcknowledged } = require('../lib/activityLoggerEnhanced');
await logGrievanceAcknowledged(
  grievance,
  req.user,
  req.ip,
  req.headers['user-agent']
);
```

**Result**: 
- ActivityLog records the action
- TransparencyTracker logs event with type "ACKNOWLEDGED"
- Citizen sees public message via Transparency Dashboard: "We have received your grievance..."

### 4. Use in Status Change

**In: `server/routes/grievance.js` - PUT `/api/grievances/:id`**

```javascript
const previousStatus = grievance.status;
grievance.status = req.body.status;
await grievance.save();

// Log status change - automatically logs to BOTH systems
const { logGrievanceStatusChanged } = require('../lib/activityLoggerEnhanced');
await logGrievanceStatusChanged(
  grievance,
  previousStatus,
  req.body.status,
  req.user,
  [{ userId: grievance.userId, name: grievance.userName, email: grievance.userEmail, role: 'user' }],
  req.ip,
  req.headers['user-agent']
);
```

**Result**: 
- Both logging systems updated
- Citizen gets notification: "Your grievance status has been updated to: [status]"
- Complete timeline visible in Transparency Dashboard

### 5. Use in Assignment (NEW)

**In: `server/routes/admin.js` - POST `/api/admin/assign-grievance`**

```javascript
const { logGrievanceAssigned } = require('../lib/activityLoggerEnhanced');
await logGrievanceAssigned(
  grievance,
  officer,              // the person being assigned to
  req.user,            // the person doing the assignment
  req.ip,
  req.headers['user-agent']
);
```

**Result**:
- Both officers and citizens see the assignment
- Public message: "Your grievance has been assigned to [Officer Name]..."

### 6. Use in Progress Updates (NEW)

**In: `server/routes/officer.js` - POST `/api/officer/update-progress`**

```javascript
const { logProgressUpdate } = require('../lib/activityLoggerEnhanced');
await logProgressUpdate(
  grievance,
  req.user,
  req.body.progressMessage,  // visible to citizen
  req.ip,
  req.headers['user-agent']
);
```

**Result**:
- Progress update visible to citizen in real-time
- Both logging systems track the update

### 7. Use in Escalation (NEW)

**In: `server/routes/officer.js` - POST `/api/officer/escalate-grievance`**

```javascript
const { logGrievanceEscalated } = require('../lib/activityLoggerEnhanced');
await logGrievanceEscalated(
  grievance,
  req.user,
  req.body.reason,
  req.ip,
  req.headers['user-agent']
);
```

**Result**:
- Citizen notified: "Your grievance has been escalated for priority handling. Reason: [reason]"
- Admin dashboard shows escalation metrics

### 8. Use in Resolution

**In: `server/routes/officer.js` or `server/routes/admin.js` - POST `/api/grievances/resolve`**

```javascript
const { logGrievanceResolved } = require('../lib/activityLoggerEnhanced');
await logGrievanceResolved(
  grievance,
  req.user,
  req.body.resolutionNotes,
  req.ip,
  req.headers['user-agent']
);

grievance.status = 'resolved';
grievance.resolutionDate = new Date();
grievance.resolutionNotes = req.body.resolutionNotes;
await grievance.save();
```

**Result**:
- Citizen gets final notification with resolution details
- Complete resolution timeline visible
- Used for analytics and performance metrics

## Complete Example: Enhanced Grievance Route

```javascript
const express = require('express');
const router = express.Router();
const Grievance = require('../models/Grievance');
const { 
  logGrievanceSubmitted, 
  logGrievanceStatusChanged,
  logGrievanceAcknowledged,
  logProgressUpdate,
  logGrievanceResolved 
} = require('../lib/activityLoggerEnhanced');
const auth = require('../middleware/auth');

// Submit grievance
router.post('/api/grievances', auth, async (req, res) => {
  try {
    const grievance = await Grievance.create({
      userId: req.user.id,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      department: req.body.department,
      status: 'pending'
    });

    // Automatic dual logging + transparency
    await logGrievanceSubmitted(
      grievance,
      req.user,
      req.ip,
      req.headers['user-agent']
    );

    res.status(201).json({ message: 'Grievance submitted', grievance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Officer acknowledges grievance
router.put('/api/grievances/:id/acknowledge', auth, async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id);
    
    // Log acknowledgment
    await logGrievanceAcknowledged(
      grievance,
      req.user,
      req.ip,
      req.headers['user-agent']
    );

    grievance.status = 'acknowledged';
    await grievance.save();

    res.json({ message: 'Grievance acknowledged', grievance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Officer updates progress
router.put('/api/grievances/:id/progress', auth, async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id);
    
    // Log with public message
    await logProgressUpdate(
      grievance,
      req.user,
      req.body.message,
      req.ip,
      req.headers['user-agent']
    );

    if (!grievance.progressUpdates) grievance.progressUpdates = [];
    grievance.progressUpdates.push({
      updatedBy: req.user.id,
      message: req.body.message,
      timestamp: new Date()
    });
    await grievance.save();

    res.json({ message: 'Progress updated', grievance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Officer resolves grievance
router.put('/api/grievances/:id/resolve', auth, async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id);
    const previousStatus = grievance.status;

    // Log resolution with public message
    await logGrievanceResolved(
      grievance,
      req.user,
      req.body.resolutionNotes,
      req.ip,
      req.headers['user-agent']
    );

    grievance.status = 'resolved';
    grievance.resolutionNotes = req.body.resolutionNotes;
    grievance.resolvedDate = new Date();
    await grievance.save();

    res.json({ message: 'Grievance resolved', grievance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

## What Citizens See

When transparency events are logged, citizens see them in their Transparency Dashboard:

### Timeline View
```
✅ SUBMITTED - Feb 17, 2026 10:30 AM
   "Thank you for submitting your grievance..."

👤 ACKNOWLEDGED - Feb 17, 2026 2:15 PM  
   "We have received your grievance and will investigate..."

⏳ ASSIGNED_TO_OFFICER - Feb 18, 2026 9:00 AM
   "Assigned to Officer Rajesh Kumar from Police Department"

💬 PROGRESS_UPDATE - Feb 18, 2026 4:30 PM
   "We are verifying the details with witnesses..."

✅ RESOLVED - Feb 19, 2026 11:00 AM
   "Your grievance has been resolved. Resolution: [details]"
```

### Report View
- Event count: 5
- Average response time: 22.5 hours
- Status progression: Submitted → Acknowledged → Assigned → Resolved
- Total time: 24 hours 30 minutes

## What Officers See

All metadata + internal notes + public messages:

```
GRIEVANCE: "Pothole on Main Road"
Created: Feb 17, 10:30 AM (by Citizen)
Status: Resolved
Timeline Events: 5

ASSIGNED TO: Officer Rajesh Kumar
ASSIGNED ON: Feb 18, 9:00 AM
RESOLVED ON: Feb 19, 11:00 AM

Events with visibility control:
- SUBMITTED (public) - Public message shown
- ACKNOWLEDGED (public) - Public message shown
- INTERNAL_NOTE (admin-only) - Not shown to citizen
- PROGRESS_UPDATE (public) - Public message shown
- RESOLVED (public) - Public message shown
```

## What Admins See

Everything + system metrics:

```
System Statistics:
- Total grievances: 1,245
- Average resolution time: 3.2 days
- By status: Resolved (892), In Progress (287), Pending (66)
- By category: Infrastructure (456), Services (389), Other (400)
- By department: Police (344), Public Works (289), Health (289)

Most recent events:
- Officer activity: 127 events today
- Citizen activity: 89 submissions today
- SLA compliance: 94.2%

Department performance:
- Fastest resolution: Public Works (2.1 days avg)
- Most grievances: Police (456)
- Escalation rate: 3.2%
```

## Benefits

| Feature | Without Integration | With Integration |
|---------|-------------------|------------------|
| Grievance logged | ✅ ActivityLog only | ✅ Both systems |
| Timeline visible to citizen | ❌ No | ✅ Yes |
| Status updates sent | ❌ Manual | ✅ Automatic |
| Public messages | ❌ No | ✅ Yes |
| Officer accountability | ⚠️ Limited | ✅ Complete |
| Analytics | ⚠️ System level | ✅ Per-grievance |
| SLA tracking | ❌ Manual | ✅ Automatic |

## Testing Integration

```bash
# 1. Submit grievance - both systems log automatically
curl -X POST http://localhost:5000/api/grievances \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Pothole on Main Road",
    "description": "Large pothole...",
    "category": "Infrastructure"
  }'

# 2. Check both logs
curl http://localhost:5000/api/activity-logs
curl http://localhost:5000/api/transparency/timeline/GRIEVANCE_ID

# 3. Check citizen sees transparency
curl http://localhost:3000/transparency-center
# Navigate to Timeline tab, select grievance - see public messages

# 4. Check system sees both logs
curl http://localhost:5000/api/transparency/dashboard/roles/admin
# Verify all events appear with proper roles
```

## Migration Path

**If you're using the original `activityLogger.js`:**

1. Keep original file as-is for other activities (user login, registration, etc.)
2. Only update grievance routes to use `activityLoggerEnhanced.js`
3. Both systems will coexist peacefully with no conflicts

**Optional: Full Migration**

Replace all imports in one go:
```bash
# Replace all references
grep -r "require('../lib/activityLogger')" ./server/routes
grep -r "require('../lib/activityLogger')" ./server/lib
# Then update all to use activityLoggerEnhanced.js
```

## Summary

**You now have**:
- ✅ Automatic transparency logging with every grievance action
- ✅ Role-based visibility for public/internal messages
- ✅ Complete audit trail for accountability
- ✅ Real-time updates for citizens
- ✅ Analytics and performance tracking
- ✅ SLA monitoring and escalation alerts
- ✅ Seamless integration with existing ActivityLog system
- ✅ No breaking changes to existing code

**The system:**
- Logs to ActivityLog for admin auditing
- Logs to TransparencyTracker for citizen visibility
- Sends public messages for transparency
- Maintains role-based access control
- Tracks all metrics automatically
