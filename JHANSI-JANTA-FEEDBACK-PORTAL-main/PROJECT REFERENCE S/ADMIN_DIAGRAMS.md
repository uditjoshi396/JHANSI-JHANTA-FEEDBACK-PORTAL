# Admin Panel - Visual Diagrams & Flows

## 🎯 User Access Flow

```
┌─────────────────────────────────────────────────────────┐
│                    ANY USER                              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
            ┌────────────────┐
            │  Register/Login │
            └────────┬────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
    ┌────────┐            ┌──────────────┐
    │ Citizen │            │ Admin (Role) │
    │ Token   │            │ Token        │
    └────┬───┘            └──────┬───────┘
         │                       │
         ▼                       ▼
    ┌──────────┐         ┌──────────────────┐
    │/Dashboard│         │/admin            │
    │(Limited) │         │(Full Access)     │
    └──────────┘         └──────────────────┘
                                │
                 ┌──────────────┼──────────────┐
                 │              │              │
                 ▼              ▼              ▼
            ┌────────┐    ┌──────────┐   ┌────────┐
            │Dashboard│   │Grievances│   │ Users  │
            │Analytics│   │Management│   │Manager │
            └────────┘    └──────────┘   └────────┘
```

## 📊 Admin Dashboard Layout

```
┌──────────────────────────────────────────────────────────────┐
│ 🛡️ ADMIN DASHBOARD              [Logout]                    │
├──────────────────────────────────────────────────────────────┤
│ [📊 Dashboard] [📋 Grievances] [👥 Users]                   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ 📈 Total    │  │ 👥 Users    │  │ ✅ Resolved │          │
│  │ Grievances  │  │             │  │             │          │
│  │ 234         │  │ 856         │  │ 189         │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ ⏳ Pending  │  │ ❌ Rejected │  │ ⏱️ Avg Time │          │
│  │             │  │             │  │             │          │
│  │ 45          │  │ 12          │  │ 7 days      │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Status Distribution        Recent Activity         │    │
│  │                                                     │    │
│  │ Pending: ████████░░░░░░                            │    │
│  │ Resolved: ██████░░░░░░░░░                          │    │
│  │ Rejected: ██░░░░░░░░░░░░                           │    │
│  │                                                     │    │
│  │                        ⏳ [Pending] Broken Road    │    │
│  │                        ✅ [Resolved] Water Issue   │    │
│  │                        ❌ [Rejected] Duplicate     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## 📋 Grievances Management Flow

```
                    ┌─────────────────┐
                    │ Grievances Tab  │
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
         ┌────────────┐          ┌──────────────┐
         │   Search   │          │   Filters    │
         │  & Filter  │          │  (Status,    │
         │            │          │   Category)  │
         └────────┬───┘          └────────┬─────┘
                  │                       │
                  └───────────┬───────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │ Grievances Table    │
                    │ ID | Title | Status │
                    │ ........            │
                    └──────────┬──────────┘
                               │
                       ┌───────┴────────┐
                       │                │
                       ▼                ▼
               ┌─────────────────┐  [View Button]
               │ List View       │      │
               │ (Show Table)    │      │
               └─────────────────┘      │
                                        ▼
                            ┌────────────────────┐
                            │ Detail View        │
                            ├────────────────────┤
                            │ Title              │
                            │ Description        │
                            │ Status: [Dropdown] │
                            │ Response: [Text]   │
                            │                    │
                            │ [Update] [Delete]  │
                            └────────────────────┘
```

## 🔄 Grievance Status Update Flow

```
┌──────────────────────────────┐
│ Click Grievance "View" Button │
└────────────────┬─────────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ Load Grievance  │
        │ from Database   │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────────────────────┐
        │ Display Detail View             │
        │ - Current Status                │
        │ - Full Description              │
        │ - AI Suggestions                │
        │ - Response Field (empty)        │
        └────────┬────────────────────────┘
                 │
      ┌──────────┴──────────┐
      │                     │
      ▼                     ▼
   [Select Status]   [Enter Response]
   - Pending              "We will..."
   - In Progress          "Status update:"
   - Resolved             "Thank you..."
   - Rejected
      │                     │
      └──────────┬──────────┘
                 │
                 ▼
        ┌─────────────────────┐
        │ Click "Update"      │
        │ Button              │
        └────────┬────────────┘
                 │
                 ▼
        ┌─────────────────────────────────┐
        │ Send Request to Backend         │
        │ PUT /api/grievances/:id/status  │
        │ Body: {status, response}        │
        └────────┬────────────────────────┘
                 │
                 ▼
        ┌─────────────────────────────────┐
        │ Backend Validates               │
        │ - Check Admin Role              │
        │ - Validate Status Value         │
        │ - Update Database               │
        └────────┬────────────────────────┘
                 │
                 ▼
        ┌─────────────────────────────────┐
        │ Return Success Response         │
        │ {success: true, grievance: ...} │
        └────────┬────────────────────────┘
                 │
                 ▼
        ┌─────────────────────────────────┐
        │ Refresh Grievances List         │
        │ Fetch Updated Data              │
        │ Return to List View             │
        └────────┬────────────────────────┘
                 │
                 ▼
        ┌─────────────────────────────────┐
        │ ✅ Update Successful            │
        │ Grievance Status Changed        │
        │ Citizen Notified (future)       │
        └─────────────────────────────────┘
```

## 👥 User Management Flow

```
                    ┌─────────────────┐
                    │  Users Tab      │
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
         ┌──────────────┐        ┌──────────────┐
         │   Search     │        │ Users Table  │
         │  (Name/Email)│        │ Display All  │
         └──────┬───────┘        └────────┬─────┘
                │                         │
                │    ┌────────────────────┘
                │    │
                ▼    ▼
        ┌────────────────────────────┐
        │ Filtered Users List        │
        │ ID | Name | Email | Role   │
        │                            │
        │ [User 1] ........ [🗑️]    │
        │ [User 2] ........ [🗑️]    │
        │ [User 3] ........ [🗑️]    │
        └────────┬───────────────────┘
                 │
                 ▼
            [Delete Button]
                 │
            ┌────┴────┐
            │          │
            ▼          ▼
        [Confirm]  [Cancel]
            │
            ▼
        ┌─────────────────────────┐
        │ DELETE /api/users/:id   │
        └────────┬────────────────┘
                 │
                 ▼
        ┌─────────────────────────┐
        │ ✅ User Deleted         │
        │ Refresh User List       │
        └─────────────────────────┘
```

## 🔐 Authentication & Authorization Flow

```
┌──────────────────────────────────────────────────────────┐
│                   USER REQUEST                            │
│              GET /admin (Admin Page)                      │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │ Check localStorage     │
        │ token? token_expiry?   │
        └────────┬───────────────┘
                 │
        ┌────────┴────────┐
        │ NO              │ YES
        ▼                 ▼
    Redirect to      ┌──────────────────┐
    /login           │ Token Expired?   │
                     └────────┬─────────┘
                              │
                    ┌─────────┴─────────┐
                    │ YES               │ NO
                    ▼                   ▼
                Redirect to       ┌──────────────┐
                /login            │ Parse Token  │
                                  └────────┬─────┘
                                           │
                                           ▼
                                  ┌──────────────────┐
                                  │ Extract User ID  │
                                  │ Extract Role     │
                                  │ Extract Name     │
                                  └────────┬─────────┘
                                           │
                                           ▼
                                  ┌──────────────────┐
                                  │ Is Role "admin"? │
                                  └────────┬─────────┘
                                           │
                            ┌──────────────┴──────────────┐
                            │ NO                          │ YES
                            ▼                             ▼
                    Redirect to            ┌──────────────────────┐
                    /dashboard             │ Render Admin Panel   │
                                          │ Fetch Admin Data     │
                                          └──────────────────────┘
```

## 📈 Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                   ADMIN PANEL DATA FLOW                         │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐                        ┌──────────────┐      │
│  │ React State  │                        │ MongoDB      │      │
│  │              │                        │ Database     │      │
│  │ - grievances │                        │              │      │
│  │ - users      │                        │ Collections: │      │
│  │ - stats      │                        │ - users      │      │
│  │ - filters    │                        │ - grievances │      │
│  └──────┬───────┘                        └──────────────┘      │
│         │                                        ▲              │
│         │                                        │              │
│         │        ┌─────────────────────┐        │              │
│         │        │  Express/Node.js    │        │              │
│         │        │   API Endpoints     │        │              │
│         │        │                     │        │              │
│         ├──────→ │ GET /api/users/all  ├───────┤              │
│         │        │ GET /api/grievances │        │              │
│         │        │ PUT /api/grievances │        │              │
│         │        │ DELETE /api/...     │        │              │
│         │        └─────────────────────┘        │              │
│         │                                        │              │
│         └────────────────────────────────────────┘              │
│                    (Axios requests)                            │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

## 🎨 Component Hierarchy

```
App Component
└── Admin Page
    ├── Header Section
    │   ├── Title (Admin Dashboard)
    │   └── Logout Button
    │
    ├── Navigation Tabs
    │   ├── Dashboard Tab Button
    │   ├── Grievances Tab Button
    │   └── Users Tab Button
    │
    └── Content Area (based on activeTab)
        ├── Dashboard Tab
        │   ├── Statistics Cards (6x)
        │   └── Analytics Charts
        │
        ├── Grievances Tab
        │   ├── Filter/Search Section
        │   ├── List View (Table)
        │   └── Detail View
        │       ├── Grievance Info
        │       ├── Status Update Form
        │       ├── Response Textarea
        │       └── Action Buttons
        │
        └── Users Tab
            ├── Search Section
            └── Users Table
                └── Delete Actions
```

## 🔗 API Call Sequence

```
Client (React)           Server (Express)         Database (MongoDB)
│                        │                         │
├─→ GET /users/all      │                         │
│                        ├─→ Check Auth           │
│                        ├─→ Check Admin Role     │
│                        │                         │
│                        ├─→ Query users          │
│                        │                         ├─→ Find all users
│                        │                         ├─→ Exclude passwords
│                        │                         ├─→ Return results
│                        │ ←─────────────────────│
│  ←─ 200 OK [users]    │                         │
│     {data: [...]}      │                         │
│                        │                         │
├─→ PUT /grievances/123/status                    │
│     {status, response} │                         │
│                        ├─→ Check Auth           │
│                        ├─→ Check Admin Role     │
│                        │                         │
│                        ├─→ Update grievance     │
│                        │                         ├─→ Find grievance
│                        │                         ├─→ Update status
│                        │                         ├─→ Update response
│                        │                         ├─→ Set timestamp
│                        │                         ├─→ Save changes
│                        │ ←─────────────────────│
│  ←─ 200 OK            │                         │
│     {success: true}   │                         │
│                        │                         │
└─ Refresh Page ────────→ Fetch updated data     │
                         └────────────────────────→
```

---

**These diagrams show the complete architecture and data flow of the Admin Panel!** 📊

