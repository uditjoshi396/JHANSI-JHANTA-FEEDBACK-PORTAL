# Janata Feedback Portal - Setup Guide

## Quick Start Options

### Option 1: Automated Interactive Setup (Recommended)

Run the interactive setup script for a guided experience:

**Windows:**

```bash
run_interactive.bat
```

**macOS/Linux:**

```bash
./run_interactive.sh
```

This will:

- Check for prerequisites
- Guide you through configuration
- Install dependencies
- Optionally start the servers

### Option 2: Manual Setup

Follow the step-by-step instructions below.

## Prerequisites

- **Node.js** (version 14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (Community Edition) - [Download](https://www.mongodb.com/try/download/community)
  - Start MongoDB service after installation

## Manual Setup Instructions

### 1. Environment Configuration

Copy the example environment file and configure it:

```bash
cd server
copy .env.example .env  # Windows
# or
cp .env.example .env    # macOS/Linux
```

Edit `.env` with your settings:

```
MONGO_URI=mongodb://localhost:27017/janata_portal
JWT_SECRET=your_secure_jwt_secret_here
PORT=5000
# Optional: SMTP settings for email notifications
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email@domain.com
SMTP_PASS=your_email_password
```

### 2. Install Dependencies

**Server:**

```bash
cd server
npm install
```

**Client:**

```bash
cd client
npm install
```

### 3. Start the Application

**Terminal 1 - Server:**

```bash
cd server
npm run dev
```

Server will run at: http://localhost:5000

**Terminal 2 - Client:**

```bash
cd client
npm start
```

Client will run at: http://localhost:3000

### 4. Access the Application

Open your browser and navigate to: http://localhost:3000

## First Time Setup

1. Register a new user account
2. Log in to access the dashboard
3. Create your first grievance to test the system

## Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running: `mongod` (or check services)
- Verify `MONGO_URI` in `.env` is correct
- Check firewall settings if using remote MongoDB

### Port Conflicts

- Change `PORT` in `.env` if 5000 is in use
- Update client API calls if server port changes

### Dependency Issues

- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

## Project Structure

```
janata_full_project/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── utils/
│   └── package.json
├── server/                 # Node.js backend
│   ├── lib/
│   ├── models/
│   ├── routes/
│   ├── index.js
│   └── package.json
├── run_project.bat         # Windows automated setup
├── run_project.sh          # Unix automated setup
├── run_interactive.bat     # Windows interactive setup
├── run_interactive.sh      # Unix interactive setup
└── README_SETUP.md         # This file
```

## Features

- User registration and authentication
- Grievance submission and management
- Dashboard with statistics
- Responsive design with dark/light themes
- AI-powered chatbot assistance
- Voice input support
- Real-time sentiment analysis

## Support

If you encounter issues, check the console logs for error messages and ensure all prerequisites are properly installed.
