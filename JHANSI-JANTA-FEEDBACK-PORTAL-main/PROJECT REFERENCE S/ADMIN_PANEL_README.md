# Admin Panel Documentation

## Overview
The Admin Panel is a comprehensive management dashboard for administrators of the JHANSI-JANTA Feedback Portal. It provides complete control over grievances, users, and system statistics.

## Access
- **URL**: `/admin`
- **Requirements**: User must have `admin` role
- **Authentication**: Bearer token required

## Features

### 1. Dashboard Tab 📊
The main dashboard provides an at-a-glance overview of the system:

#### Statistics Cards
- **Total Grievances**: Total count of all grievances in the system
- **Total Users**: Count of all registered users
- **Resolved**: Number of resolved grievances
- **Pending**: Number of pending grievances
- **Rejected**: Number of rejected grievances
- **Avg Resolution Time**: Average time taken to resolve grievances (in days)

#### Charts & Analytics
- **Status Distribution**: Bar charts showing distribution of grievances by status
- **Recent Activity**: List of 5 most recent grievances with status badges and timestamps

### 2. Grievances Tab 📋
Comprehensive grievance management interface:

#### Filtering & Search
- **Search**: Search grievances by title, description, or citizen ID
- **Status Filter**: Filter by Pending, In Progress, Resolved, or Rejected
- **Category Filter**: Filter by General, Infrastructure, Health, Education, Safety, or Other

#### Grievance List View
- Displays all grievances in a sortable table
- Shows: ID, Title, Status, Category, Priority, and Date
- Click "View" button to open detailed view

#### Grievance Detail View
When you click on a grievance, you can:
- View full details (title, description, category, priority, creation date)
- View citizen information
- Check attachments
- Review AI suggestions
- **Update Status**: Change grievance status
- **Add Response**: Enter admin response/comment
- **Delete**: Remove grievance from system

### 3. Users Tab 👥
User management and monitoring:

#### Search
- Search users by name or email
- Real-time filtering of user list

#### User Management
- View all registered users
- See user details: ID, Name, Email, Phone, Role, Join Date
- **User Roles**: Citizen, Officer, Admin
- **Delete User**: Remove users from the system (prevents deleting last admin)

#### User Statistics
- Total number of users
- Users by role (Citizen, Officer, Admin)

## API Endpoints

### Grievances API

#### Get All Grievances (Admin Only)
```
GET /api/grievances/all
Headers: Authorization: Bearer <token>
Response: Array of all grievances with citizen and officer details
```

#### Update Grievance Status (Admin Only)
```
PUT /api/grievances/:id/status
Headers: Authorization: Bearer <token>
Body: {
  "status": "Pending|In Progress|Resolved|Rejected",
  "response": "Your response text here"
}
Response: Updated grievance object
```

#### Delete Grievance (Admin Only)
```
DELETE /api/grievances/:id
Headers: Authorization: Bearer <token>
Response: { "success": true, "message": "Grievance deleted" }
```

### Users API

#### Get All Users (Admin Only)
```
GET /api/users/all
Headers: Authorization: Bearer <token>
Response: Array of all users (passwords excluded)
```

#### Get Single User (Admin Only)
```
GET /api/users/:id
Headers: Authorization: Bearer <token>
Response: User object
```

#### Update User Role (Admin Only)
```
PUT /api/users/:id/role
Headers: Authorization: Bearer <token>
Body: { "role": "citizen|officer|admin" }
Response: { "success": true, "user": {...} }
```

#### Delete User (Admin Only)
```
DELETE /api/users/:id
Headers: Authorization: Bearer <token>
Response: { "success": true, "message": "User deleted successfully" }
```

#### Get User Statistics (Admin Only)
```
GET /api/users/stats
Headers: Authorization: Bearer <token>
Response: {
  "total": number,
  "byRole": [{_id: role, count: number}],
  "recent": number,
  "active": number
}
```

## Security Features

1. **Role-Based Access Control**: Only users with `admin` role can access the panel
2. **Token Validation**: All requests require a valid JWT token
3. **Admin Verification**: Double-checks admin status before sensitive operations
4. **Last Admin Protection**: Prevents deletion of the last admin user
5. **Auto-logout**: Automatically logs out if token expires

## User Interface Features

### Responsive Design
- Fully responsive on desktop, tablet, and mobile
- Grid-based layout adapts to screen size
- Touch-friendly buttons and controls

### Visual Indicators
- Color-coded status badges
- Icon-based navigation tabs
- Gradient backgrounds for visual appeal
- Hover effects for better UX

### Data Presentation
- Tables for organized data display
- Status bars for visual representation
- Charts for analytics
- Activity feeds for recent updates

## How to Create an Admin User

1. Register a new user through the registration page
2. Connect to MongoDB and update the user's role:
   ```javascript
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { role: "admin" } }
   )
   ```

Or programmatically in code:
```javascript
const User = require('./models/User');
await User.findByIdAndUpdate(userId, { role: 'admin' });
```

## Workflow Example

### Typical Admin Workflow:

1. **Log in** to admin panel at `/admin`
2. **View Dashboard** to monitor system health
3. **Go to Grievances Tab** to see pending items
4. **Search/Filter** to find specific grievances
5. **Click View** on a grievance
6. **Review Details** including AI suggestions
7. **Update Status** as appropriate
8. **Add Response** with resolution details
9. **Submit Update** to save changes
10. **Return to List** and handle next grievance

## Key Statistics Explained

| Metric | Meaning |
|--------|---------|
| Total Grievances | All grievances ever filed |
| Pending | Not yet assigned or in initial review |
| Resolved | Successfully completed |
| Rejected | Not valid or duplicate |
| Avg Resolution Time | Average days from creation to resolution |
| Recent Users (30 days) | New registrations in last 30 days |
| Active Users (7 days) | Users who logged in last 7 days |

## Best Practices

1. **Regular Monitoring**: Check dashboard daily for pending grievances
2. **Prompt Response**: Address grievances within SLA timelines
3. **Clear Communication**: Provide detailed responses to citizens
4. **Status Updates**: Keep status current to reflect actual progress
5. **User Management**: Monitor user roles and permissions regularly
6. **System Health**: Watch statistics for trends and issues

## Troubleshooting

### Can't Access Admin Panel?
- Verify your account has `admin` role
- Check that your JWT token is valid and not expired
- Try logging out and logging back in

### Grievances Not Loading?
- Check network connectivity
- Verify MongoDB is running
- Check browser console for error messages

### Changes Not Saving?
- Ensure you have admin privileges
- Check network connection
- Try refreshing the page

## Support
For issues or feature requests, contact the development team or check the main README.md file.
