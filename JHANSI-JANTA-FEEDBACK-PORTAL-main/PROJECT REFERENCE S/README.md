# JHANSI-JANTA-FEEDBACK-PORTAL

> > > > > > > # origin/main

# 🗳️ JHANSI-JANTA-FEEDBACK-PORTAL

A comprehensive grievance management system built with React, Node.js, Express, and MongoDB. This platform allows citizens to submit grievances, track their status, and enables government officials to manage and resolve issues efficiently.

## ✨ Features

- **User Authentication**: Secure JWT-based authentication with role-based access
- **Grievance Management**: Submit, track, and manage grievances with categories and priorities
- **Role-Based Access**: Different dashboards for citizens, officers, and administrators
- **Real-time Updates**: Live status tracking and notifications
- **Responsive Design**: Mobile-friendly interface with dark/light theme support
- **File Attachments**: Support for attaching documents to grievances
- **Email Notifications**: Optional email notifications for status updates
- **Social Authentication**: Google, Facebook, Twitter, and Instagram login options
- **Admin Dashboard**: Comprehensive admin panel for managing users and grievances

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm
- MongoDB (running locally or remote connection)

### Automated Setup (Recommended)

#### Windows

```bash
# Run the automated setup script
run_project.bat
```

#### Linux/Mac

```bash
# Make the script executable and run
chmod +x run_project.sh
./run_project.sh
```

### Interactive Setup

```bash
# Install dependencies globally (optional)
npm install -g inquirer

# Run the interactive setup
node interactive_setup.js
```

### Manual Setup

1. **Clone and navigate to the project**

   ```bash
   cd jhansi-janta-feedback-portal
   ```

2. **Setup Server**

   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Setup Client** (in a new terminal)

   ```bash
   cd client
   npm install
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📋 Environment Configuration

Create a `.env` file in the `server` directory:

```env
# Database
MONGO_URI=mongodb://localhost:27017/janata_portal

# Authentication
JWT_SECRET=your_secure_jwt_secret_here
SESSION_SECRET=your_session_secret_here

# Server
PORT=5000
CLIENT_URL=http://localhost:3000

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Social Authentication (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/auth/facebook/callback

TWITTER_CONSUMER_KEY=your_twitter_consumer_key
TWITTER_CONSUMER_SECRET=your_twitter_consumer_secret
TWITTER_CALLBACK_URL=http://localhost:5000/api/auth/twitter/callback

INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
INSTAGRAM_CALLBACK_URL=http://localhost:5000/api/auth/instagram/callback
```

## 🏗️ Project Structure

```
jhansi-janta-feedback-portal/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   └── App.js         # Main app component
│   └── package.json
├── server/                 # Node.js backend
│   ├── lib/               # Authentication libraries
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── uploads/           # File uploads directory
│   └── index.js           # Server entry point
├── run_project.bat        # Windows setup script
├── run_project.sh         # Linux/Mac setup script
├── interactive_setup.js   # Interactive setup wizard
└── README.md
```

## 🔐 User Roles

- **Citizen**: Can submit and track their grievances
- **Officer**: Can view assigned grievances and update status
- **Admin**: Full access to manage users, grievances, and system settings

## 📱 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/logout` - User logout
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/facebook` - Facebook OAuth

### Grievances

- `POST /api/grievances/create` - Create new grievance
- `GET /api/grievances/my` - Get user's grievances
- `GET /api/grievances/all` - Get all grievances (admin)
- `PUT /api/grievances/assign/:id` - Assign grievance to officer (admin)
- `PUT /api/grievances/update/:id` - Update grievance status (officer)

## 🎨 Features Overview

### Frontend Features

- Modern, responsive UI with glassmorphism effects
- Dark/Light theme toggle
- Real-time form validation
- Interactive dashboard with statistics
- Mobile-first design
- Accessibility compliant

### Backend Features

- RESTful API design
- JWT authentication
- Role-based authorization
- File upload handling
- Email notifications
- Social authentication integration
- Input validation and sanitization

## 🔧 Development

### Running in Development Mode

```bash
# Server
cd server && npm run dev

# Client (new terminal)
cd client && npm start
```

### Building for Production

```bash
# Build client
cd client && npm run build

# Start server in production
cd server && npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with React, Node.js, Express, and MongoDB
- UI inspired by modern government digital services
- Icons from various open-source icon libraries

## 📞 Support

For support, email support@janatafeedback.com or join our Discord community.

---

# **Made with ❤️ for better governance and citizen engagement**

# JHANSI-JANTA-FEEDBACK-PORTAL

> > > > > > > origin/main
