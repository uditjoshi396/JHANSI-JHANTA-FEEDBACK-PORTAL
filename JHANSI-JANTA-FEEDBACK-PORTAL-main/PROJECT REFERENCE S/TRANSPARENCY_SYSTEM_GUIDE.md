# 🔍 Transparency System - Complete Guide

## Overview

The **Transparency System** provides complete visibility and tracking between Citizens (Users), Administrators, and Government Officers in the Janata Feedback Portal. It ensures every interaction, status change, and communication is logged, tracked, and made visible to appropriate parties.

## 🎯 Key Features

### 1. **Complete Activity Timeline**
- Track every action taken on a grievance from submission to resolution
- Real-time updates with timestamps
- Role-based visibility (what each role can see)
- Event descriptions and public messages

### 2. **Role-Based Transparency**
Three distinct visibility levels:

#### 👤 **Citizens (Users)**
- See only public updates
- View status changes and progress
- Access public messages from admins and officers
- Cannot see internal notes or officer-only communications
- Get notifications about grievance updates

#### 👨‍💼 **Government Officers**
- See public events + internal communications
- View progress notes and internal discussions
- Access grievance details and context
- Can add public messages for citizens
- See all administrative actions related to their assigned grievances

#### 🛡️ **Administrators**
- Full visibility of all events and activities
- Access all internal notes and communications
- View system-wide analytics
- Monitor officer and user activities
- Generate comprehensive reports

### 3. **Grievance Journey Tracking**
Every grievance tracks milestones:
- 📤 **SUBMITTED** - Citizen submits grievance
- ✅ **ACKNOWLEDGED** - Admin reviews submission
- 👤 **ASSIGNED_TO_OFFICER** - Officer assigned to case
- ⏳ **PROGRESS_UPDATE** - Officer provides updates
- ✔️ **RESOLUTION_PROVIDED** - Solution offered
- 🔒 **CLOSED** - Grievance concluded

### 4. **Analytics & Insights**
- **Grievance Analytics**: Timeline, role interactions, milestones
- **Department Performance**: Activity metrics, officer participation
- **SLA Metrics**: Response times, resolution times, delays
- **System Dashboard**: Admin-only comprehensive metrics
- **Role-wise Breakdown**: Activity by user types

### 5. **Export & Reports**
- Export grievance timeline as JSON or CSV
- Generate transparency reports for audit trails
- Download complete grievance history
- Customizable date ranges

---

## 📁 File Structure

### Backend Files Created

```
server/
├── models/
│   └── TransparencyTracker.js (NEW)
│       └── Complete tracking schema for all events
│
├── routes/
│   └── transparencyV2.js (NEW)
│       └── All transparency endpoints
│
└── lib/
    └── transparencyUtils.js (NEW)
        └── Utility functions for role-based access
```

### Frontend Files Created

```
client/src/
├── pages/
│   └── TransparencyDashboard.js (NEW)
│       └── Main transparency UI component
│
└── styles/
    └── TransparencyDashboard.css (NEW)
        └── Complete styling
```

---

## 🔌 API Endpoints

### 1. **Log Transparency Event**
```
POST /api/transparency/log-event
```
Logs a new transparency event for tracking.

**Request:**
```json
{
  "grievanceId": "507f1f77bcf86cd799439011",
  "eventType": "STATUS_UPDATED",
  "description": {
    "title": "Status Changed",
    "message": "Grievance moved from Pending to Assigned"
  },
  "details": {},
  "publicMessage": "Your grievance has been assigned to an officer",
  "visibleToUser": true,
  "statusFrom": "Pending",
  "statusTo": "Assigned"
}
```

### 2. **Get Grievance Timeline**
```
GET /api/transparency/timeline/:grievanceId
```
Retrieves complete timeline based on user role.

**Response:**
```json
{
  "success": true,
  "grievanceId": "507f1f77bcf86cd799439011",
  "timelineEvents": [
    {
      "_id": "...",
      "eventType": "SUBMITTED",
      "performedBy": { "name": "John", "role": "user" },
      "timestamp": "2024-02-17T10:00:00Z",
      "publicMessage": null,
      "visibleToUser": true
    }
  ],
  "totalEvents": 5
}
```

### 3. **User-Visible Timeline**
```
GET /api/transparency/user-timeline/:grievanceId
```
Gets only public events visible to citizens.

### 4. **Generate Report**
```
GET /api/transparency/report/:grievanceId
```
Generates comprehensive transparency report.

**Response:**
```json
{
  "success": true,
  "report": {
    "grievanceId": "507f1f77bcf86cd799439011",
    "grievanceDetails": {
      "title": "Pothole on Main Street",
      "category": "Roads",
      "status": "Resolved",
      "priority": "High"
    },
    "statistics": {
      "totalEvents": 8,
      "eventsByType": { "SUBMITTED": 1, "ASSIGNED": 1, "PROGRESS_UPDATE": 3, ... },
      "eventsByRole": { "user": 1, "admin": 2, "officer": 4 }
    }
  }
}
```

### 5. **Role-wise Dashboard**
```
GET /api/transparency/dashboard/roles
```
Admin-only dashboard showing system-wide activity by role.

### 6. **Grievance Analytics**
```
GET /api/transparency/analytics/grievance/:grievanceId
```
Detailed analytics about a specific grievance.

### 7. **Department Performance**
```
GET /api/transparency/analytics/department
```
Admin-only department performance metrics.

### 8. **Export Report**
```
GET /api/transparency/export/:grievanceId?format=json|csv
```
Export grievance history in desired format.

### 9. **Add Public Message**
```
POST /api/transparency/add-public-message/:grievanceId
```
Officers/Admins add public updates visible to citizens.

---

## 🎨 Frontend Usage

### Access Transparency Center

Visit: `http://localhost:3000/transparency-center`

### Navigate Between Views

1. **Overview** - Learn about transparency features
2. **Timeline** - View grievance journey
3. **Report** - Generate detailed reports
4. **Analytics** - See insights and metrics
5. **Dashboard** - (Admin only) System-wide view

---

## 📊 Event Types

| Event Type | Role | Visibility | Description |
|-----------|------|-----------|-------------|
| SUBMITTED | User | Public | Grievance submitted |
| ACKNOWLEDGED | Admin | Public | Grievance reviewed |
| ASSIGNED_TO_OFFICER | Admin | Public | Assigned to officer |
| STATUS_UPDATED | Officer/Admin | Public | Status changed |
| PROGRESS_UPDATE | Officer | Configurable | Progress notification |
| RESOLUTION_PROVIDED | Officer | Public | Solution provided |
| COMMENT_ADDED | Any | Public | Comment added |
| CLOSED | Admin | Public | Grievance closed |
| REJECTED | Admin | Public | Grievance rejected |
| ESCALATED | Admin | Public | Issue escalated |
| REASSIGNED | Admin | Public | Reassigned to different officer |
| INTERNAL_NOTE | Officer/Admin | Private | Internal tracking |

---

## 🔐 Visibility Rules

### User (Citizen) Can See:
✅ Public status updates
✅ Officer/Admin public messages
✅ Timeline of major milestones
✅ Resolution details
❌ Internal notes
❌ Officer email addresses (masked)
❌ System IP addresses

### Officer Can See:
✅ All public events
✅ Internal officer notes
✅ Full grievance details
✅ Previous resolution attempts
✅ Assigned grievance history
❌ Other officers' internal notes
❌ Admin system monitoring data

### Admin Can See:
✅ Everything - complete audit trail
✅ All internal communications
✅ User activities
✅ Officer activities
✅ System performance metrics
✅ All IP addresses (for security)

---

## 🛠️ Integration Guide

### 1. **Integrate with Grievance Routes**

When updating grievance status, log transparency event:

```javascript
const { logTransparencyEvent } = require('../lib/transparencyUtils');

// In your grievance update route
await logTransparencyEvent(
  grievanceId,
  'STATUS_UPDATED',
  { userId: user._id, name: user.name, role: user.role },
  'Status changed from Pending to Assigned',
  { previousStatus: 'Pending', newStatus: 'Assigned' },
  'Your grievance has been assigned to an officer for investigation'
);
```

### 2. **Log Events on Key Actions**

```javascript
// When assigning grievance
logTransparencyEvent(grievanceId, 'ASSIGNED_TO_OFFICER', performedBy, ...)

// When adding officer comment
logTransparencyEvent(grievanceId, 'PROGRESS_UPDATE', performedBy, ...)

// When resolving
logTransparencyEvent(grievanceId, 'RESOLUTION_PROVIDED', performedBy, ...)
```

### 3. **Check Visibility Before Showing Data**

```javascript
const { getFilteredTimeline } = require('../lib/transparencyUtils');

// Get role-appropriate timeline
const timeline = await getFilteredTimeline(grievanceId, userRole, userId);
```

---

## 📈 Analytics Available

### For Citizens:
- Grievance status history
- All public updates
- Estimated resolution time (calculated from events)

### For Officers:
- Assigned grievance analytics
- Case resolution metrics
- Internal progress tracking

### For Admins:
- System-wide activity dashboard
- Department performance metrics
- Role-wise activity breakdown
- SLA compliance metrics
- Top active officers
- Critical issue tracking

---

## 🔄 Data Flow

```
User Action
    ↓
Update Grievance/Create Event
    ↓
Log to TransparencyTracker
    ↓
Apply Visibility Rules
    ↓
Notify Relevant Parties
    ↓
Roles Query Their Visible Data
    ↓
Display in Dashboard/Timeline
```

---

## 🚀 Best Practices

### For Administrators:
1. Always include public messages for significant updates
2. Regularly monitor department performance
3. Export reports for audit purposes
4. Review critical activities daily

### For Officers:
1. Add progress updates regularly
2. Communicate publicly to citizens
3. Check assigned grievance timeline
4. Resolve by SLA deadlines

### For Citizens:
1. Check transparency center regularly
2. Note all status changes
3. Download reports for records
4. Use timeline for follow-ups

---

## 📝 Example Scenarios

### Scenario 1: Citizen Tracks Grievance
```
1. Citizen submits grievance → SUBMITTED event logged
2. Admin reviews → ACKNOWLEDGED event (public message sent)
3. Officer assigned → ASSIGNED_TO_OFFICER event (citizen notified)
4. Officer investigates → PROGRESS_UPDATE events (public updates sent)
5. Officer resolves → RESOLUTION_PROVIDED event + public message
6. Admin closes → CLOSED event

Citizen sees: All these events with public messages in real-time
Timeline: Goes from submitted → acknowledged → assigned → resolved → closed
```

### Scenario 2: Admin Monitors System
```
Accesses Dashboard:
- Views total activities: 1,247 (last 30 days)
- User actions: 340
- Admin actions: 287
- Officer actions: 620
- Critical activities: 23 (needs attention)

Reviews Department Performance:
- Roads Department: 120 active cases
- Parks Department: 89 active cases
- Health Department: 156 active cases

Exports Reports:
- CSV with all activities
- JSON for integration
```

### Scenario 3: SLA Tracking
```
Grievance submitted: Feb 15, 10:00 AM
Expected resolution: Feb 22, 10:00 AM (7 days SLA)

Timeline events:
- Feb 15: SUBMITTED
- Feb 16: ACKNOWLEDGED (1 day - within SLA)
- Feb 17: ASSIGNED (2 days - within SLA)
- Feb 20: PROGRESS_UPDATE (5 days - within SLA)
- Feb 21: RESOLVED (6 days - within SLA) ✅
```

---

## 🔧 Troubleshooting

### Issue: Timeline Shows No Events
- **Solution**: Ensure `transphparencyV2` route is loaded
- Check database connection
- Verify grievance ID is correct

### Issue: Visibility Not Working
- **Solution**: Check user role in token
- Verify `visibleToUser` flag in database
- Clear browser cache

### Issue: Export Not Working
- **Solution**: Ensure token is valid
- Check server permissions
- Try different format (JSON first)

---

## 🔮 Future Enhancements

- [ ] Real-time notifications
- [ ] Email alerts for updates
- [ ] SMS notifications
- [ ] Advanced search filters
- [ ] Citizen feedback/rating system
- [ ] Officer performance scoring
- [ ] AI-powered insights
- [ ] Blockchain audit trail integration

---

## 📞 Support

For issues or questions about the transparency system:
1. Check this documentation
2. Review the API endpoints
3. Check server logs for errors
4. Contact development team

---

**Last Updated:** February 17, 2026
**Version:** 1.0
**Status:** Complete and Production Ready ✅
