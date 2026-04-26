# Admin Panel Quick Reference

## 🚀 Quick Start (2 minutes)

### Step 1: Make Someone Admin
```bash
# Using MongoDB Shell:
mongosh
use janata_portal
db.users.updateOne({email: "your@email.com"}, {$set: {role: "admin"}})
```

### Step 2: Log In & Access Admin
1. Log in to `http://localhost:3000/login`
2. Go to `http://localhost:3000/admin`
3. Done! 🎉

---

## 📊 Dashboard Overview

| Card | Shows |
|------|-------|
| 📈 Total | All grievances ever filed |
| 👥 Users | Total registered users |
| ✅ Resolved | Completed grievances |
| ⏳ Pending | Awaiting action |
| ❌ Rejected | Dismissed grievances |
| ⏱️ Avg Time | Days to resolve |

---

## 📋 Grievances Tab

### Search & Filter
```
Search by: Title, Description, or Citizen ID
Status: Pending, In Progress, Resolved, Rejected
Category: General, Infrastructure, Health, Education, Safety
```

### Actions
| Action | Steps |
|--------|-------|
| View | Click "View" button on any grievance |
| Update | Change status + Add response → Submit |
| Delete | Click "Delete" in detail view |

---

## 👥 Users Tab

### See Users
- All registered users listed
- Shows: Name, Email, Phone, Role, Join Date
- Search by name or email

### Delete User
- Click 🗑️ button
- Confirm deletion
- Cannot delete last admin

---

## 🔑 Key Shortcuts

| What | Where |
|------|-------|
| Dashboard | Click first tab with 📊 icon |
| Grievances | Click second tab with 📋 icon |
| Users | Click third tab with 👥 icon |
| Back | Click "← Back to List" button |
| Logout | Click red "Logout" button |

---

## 🔗 API Endpoints (for developers)

```
GET  /api/grievances/all                    - All grievances
PUT  /api/grievances/:id/status             - Update grievance
DELETE /api/grievances/:id                  - Delete grievance

GET  /api/users/all                         - All users
DELETE /api/users/:id                       - Delete user
```

---

## 💡 Common Tasks

### Task: Resolve a Grievance
1. Go to Grievances tab
2. Search or filter to find it
3. Click "View"
4. Change status to "Resolved"
5. Add response
6. Click "✓ Update Grievance"

### Task: Check System Health
1. Go to Dashboard tab
2. View statistics cards
3. Check status distribution chart
4. Review recent activity

### Task: Find a User
1. Go to Users tab
2. Type name/email in search box
3. View user details
4. Delete if needed

---

## ⚠️ Important Notes

- ⚡ **Super Power**: Admin can do anything! Use wisely.
- 🔐 **Security**: All actions require valid JWT token
- 📱 **Mobile**: Fully responsive on phones/tablets
- 💾 **Changes Save**: Immediately to database
- 🔄 **Auto-logout**: After token expiration

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't see admin panel? | Check your role in MongoDB |
| Data not loading? | Refresh page, check connection |
| Changes not saving? | Verify admin role, try again |
| No permissions? | Only admins can access |

---

## 📚 Full Documentation

- **Detailed Guide**: See `ADMIN_PANEL_README.md`
- **Setup Instructions**: See `ADMIN_SETUP_GUIDE.md`
- **Implementation Details**: See `ADMIN_IMPLEMENTATION_SUMMARY.md`

---

## 🎯 Admin Responsibilities

✅ Monitor grievances daily
✅ Update grievance statuses promptly
✅ Add helpful responses
✅ Manage user accounts
✅ Review system statistics
✅ Maintain data quality

---

## 🎨 UI Color Guide

| Color | Meaning |
|-------|---------|
| 🟩 Green | Resolved ✓ |
| 🟨 Yellow | Pending ⏳ |
| 🟥 Red | Rejected ✗ |
| 🟦 Blue | In Progress |
| 🟪 Purple | Info/Primary |

---

## 📞 Need Help?

1. Check the documentation files
2. Review browser console for errors (F12)
3. Verify MongoDB connection
4. Check that you're logged in as admin
5. Try logging out and back in

---

**Happy administrating!** 🎉

Last Updated: 2026-01-22
