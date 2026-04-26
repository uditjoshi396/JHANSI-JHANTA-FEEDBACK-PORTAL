# Admin Setup Guide

## Quick Start: Setting Up Your First Admin

### Option 1: Using MongoDB Compass (Recommended for beginners)

1. **Open MongoDB Compass**
   - Connect to your local MongoDB instance
   - Navigate to your database (default: `janata_portal`)

2. **Find the Users Collection**
   - In the left sidebar, click on `janata_portal` database
   - Click on `users` collection

3. **Register a Normal User First**
   - Use the portal's `/register` page to create an account
   - Remember the email you registered with

4. **Update User Role to Admin**
   - In MongoDB Compass, find the user you just created
   - Click the pencil icon to edit
   - Change the `role` field from `"citizen"` to `"admin"`
   - Click Update

5. **Log in and Access Admin Panel**
   - Log in with your admin credentials
   - Navigate to `http://localhost:3000/admin`

### Option 2: Using MongoDB Shell

```bash
# 1. Open MongoDB shell
mongosh

# 2. Use the correct database
use janata_portal

# 3. Update your user to admin
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)

# 4. Verify the change
db.users.findOne({ email: "your-email@example.com" })
```

### Option 3: Using Node.js Script

Create a file `make-admin.js` in your project root:

```javascript
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./server/models/User');

async function makeAdmin(email) {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/janata_portal');
    
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role: 'admin' },
      { new: true }
    );

    if (!user) {
      console.log(`User with email ${email} not found`);
      process.exit(1);
    }

    console.log(`✅ User ${email} has been promoted to admin!`);
    console.log('User details:', {
      name: user.name,
      email: user.email,
      role: user.role
    });

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

const email = process.argv[2];
if (!email) {
  console.error('Usage: node make-admin.js <email>');
  process.exit(1);
}

makeAdmin(email);
```

Then run:
```bash
node make-admin.js your-email@example.com
```

## Admin Panel Access

Once you're an admin:

1. **Log in** to the portal at `http://localhost:3000/login`
2. **Navigate** to `http://localhost:3000/admin`
3. You should see the Admin Dashboard with all features enabled

## Verifying Admin Status

### In the Browser Console:
```javascript
const user = JSON.parse(localStorage.getItem('user'));
console.log(user.role); // Should print "admin"
```

### In MongoDB:
```bash
db.users.findOne({ email: "your-email@example.com" }).role
```

## Creating Additional Admins

Once you have one admin account, you can create more:

1. **Register** a new user normally through `/register`
2. **Use the Admin Panel** Users tab (coming in next update)
   - OR use MongoDB to change their role to admin
3. **They can now access** the admin panel at `/admin`

## Dashboard Features Overview

After logging in to the admin panel, you'll see:

### 📊 Dashboard Tab
- Overview statistics (total grievances, users, resolutions, etc.)
- Status distribution charts
- Recent activity feed

### 📋 Grievances Tab
- View all grievances in the system
- Filter by status, category, or search
- Click on grievances to view details
- Update status and add responses
- Delete grievances if needed

### 👥 Users Tab
- View all registered users
- See user information (name, email, role, join date)
- Delete users from the system
- Search users by name or email

## Common Issues

### Can't See Admin Panel?
**Solution**: 
- Make sure your role is set to `admin` in MongoDB
- Clear browser cache: Ctrl+Shift+Delete
- Log out and log back in

### Changes Not Saving?
**Solution**:
- Check that you're using a valid admin account
- Ensure MongoDB is running
- Check browser console (F12) for error messages

### Dashboard Shows No Data?
**Solution**:
- Refresh the page
- Create some test grievances in the user dashboard
- Check MongoDB connection

## Test Data

To test the admin panel with sample data, you can create test grievances:

1. **Create a citizen account**
2. **Go to Dashboard** and submit a few grievances
3. **Log in as admin** and see the data in the admin panel

## Security Notes

⚠️ **Important**:
- Only promote trusted users to admin role
- Each admin has full access to all data
- In production, use strong authentication methods
- Consider adding 2FA (Two-Factor Authentication)
- Audit admin actions regularly

## Next Steps

After setting up admin:

1. **Explore the Dashboard** - Get familiar with metrics
2. **Review Grievances** - See all submitted grievances
3. **Manage Users** - Monitor user accounts
4. **Test Features** - Try updating statuses and responses
5. **Monitor Statistics** - Keep track of system health

## Support

For issues with admin setup:
- Check the main README.md
- Review ADMIN_PANEL_README.md for detailed documentation
- Check MongoDB logs for connection issues
- Verify all environment variables are set correctly

Good luck! 🚀
