# Deploy JHANSI JANTA FEEDBACK PORTAL Backend on Render

This guide walks you through deploying the **Node.js/Express backend** and **MongoDB database** on Render, while keeping the React frontend on Vercel.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Step 1: MongoDB Atlas Setup](#step-1-mongodb-atlas-setup)
3. [Step 2: Prepare Environment Variables](#step-2-prepare-environment-variables)
4. [Step 3: Deploy Backend on Render](#step-3-deploy-backend-on-render)
5. [Step 4: Update Frontend on Vercel](#step-4-update-frontend-on-vercel)
6. [Step 5: Verify Deployment](#step-5-verify-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- A **GitHub account** with this repository pushed
- A **Render account** (https://render.com) — free tier works
- A **MongoDB Atlas account** (https://www.mongodb.com/cloud/atlas) — free M0 cluster
- Your **Vercel frontend** already deployed

---

## Step 1: MongoDB Atlas Setup

1. **Create a Cluster**
   - Go to https://www.mongodb.com/cloud/atlas and sign up/log in
   - Create a new **M0 (Free Tier)** cluster
   - Choose the cloud provider and region closest to your users (e.g., AWS Mumbai for India)

2. **Create a Database User**
   - In Atlas, go to **Database Access** → **Add New Database User**
   - Choose **Password** authentication
   - Set a username and strong password
   - Grant **Read and write to any database** privileges
   - Click **Add User**

3. **Whitelist IP Addresses**
   - Go to **Network Access** → **Add IP Address**
   - Click **Allow Access from Anywhere** (adds `0.0.0.0/0`)
   - This is required because Render uses dynamic IPs

4. **Get Connection String**
   - Go to **Database** → click **Connect** on your cluster
   - Choose **Drivers** → **Node.js**
   - Copy the connection string, replacing `<password>` with your database user password
   - Example:
     ```
     mongodb+srv://janata_admin:YourPassword@cluster0.xxxxx.mongodb.net/janata_portal?retryWrites=true&w=majority
     ```

---

## Step 2: Prepare Environment Variables

Copy `server/.env.example` to `server/.env` (for local testing) and prepare values for Render:

| Variable | Example Value | Description |
|----------|---------------|-------------|
| `NODE_ENV` | `production` | Must be set for production mode |
| `PORT` | `10000` | Render typically uses 10000 |
| `MONGO_URI` | `mongodb+srv://...` | Your Atlas connection string |
| `JWT_SECRET` | `a-long-random-string` | Generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `SESSION_SECRET` | `another-long-random-string` | Same generation method as JWT_SECRET |
| `CLIENT_URL` | `https://your-app.vercel.app` | Your deployed Vercel frontend URL |
| `SERVER_BASE_URL` | `https://jhansi-janta-backend.onrender.com` | Your Render service URL (set after first deploy, then update) |

**Optional (for email & OAuth):**
| Variable | Description |
|----------|-------------|
| `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` | For password reset emails |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth login |
| `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET` | Facebook OAuth login |
| `TWITTER_CONSUMER_KEY`, `TWITTER_CONSUMER_SECRET` | Twitter OAuth login |

> **Note on OAuth**: Update callback URLs in your Google/Facebook/Twitter developer consoles to point to your Render URL.

---

## Step 3: Deploy Backend on Render

### Option A: Using Render Dashboard (Recommended for first time)

1. **Go to Render Dashboard** → https://dashboard.render.com
2. Click **New +** → **Web Service**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Name**: `jhansi-janta-backend`
   - **Runtime**: `Node`
   - **Region**: Choose closest to your users (e.g., Singapore or Frankfurt)
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `JHANSI-JANTA-FEEDBACK-PORTAL-main/server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. **Set Environment Variables**
   - Click **Advanced** → **Add Environment Variable**
   - Add all variables from Step 2 one by one
6. Click **Create Web Service**

### Option B: Using render.yaml (Blueprint)

A `render.yaml` blueprint is already included in the repository root. To use it:

1. Go to Render Dashboard → **Blueprints** → **New Blueprint Instance**
2. Connect your repository
3. Render will read `render.yaml` and provision the service automatically
4. **You still need to manually set** `MONGO_URI`, `JWT_SECRET`, `SESSION_SECRET`, `CLIENT_URL`, and OAuth credentials in the service's Environment tab after creation (these are marked as `sync: false` in the blueprint)

### After First Deploy

1. Wait for the build to complete (2-3 minutes)
2. Render will assign you a URL like `https://jhansi-janta-backend.onrender.com`
3. **Copy this URL** and set it as `SERVER_BASE_URL` in your environment variables
4. If using OAuth, update callback URLs in your provider dashboards

---

## Step 4: Update Frontend on Vercel

Your frontend is already deployed on Vercel, but it needs to know where the backend is.

1. **Go to Vercel Dashboard** → Select your project
2. Go to **Settings** → **Environment Variables**
3. **Add/Update**:
   - `REACT_APP_API_URL` = `https://jhansi-janta-backend.onrender.com`
4. **Redeploy** the frontend:
   - Go to **Deployments** tab
   - Click the three dots on the latest deployment → **Redeploy**

This will rebuild the React app with the new API URL baked in.

---

## Step 5: Verify Deployment

### Test Backend Health
Open in browser:
```
https://jhansi-janta-backend.onrender.com/
```
You should see:
```json
{ "status": "Janata Feedback API", "time": "..." }
```

### Test MongoDB Connection
Check Render logs (Dashboard → Service → Logs). You should see:
```
MongoDB connected
Server listening on port 10000
```

### Test Frontend → Backend Communication
1. Open your Vercel frontend URL
2. Try registering a new account
3. Check Render logs for the request

### Test Grievance Submission
1. Log in as a citizen
2. Submit a test grievance
3. Verify it appears in the database (via MongoDB Atlas → Browse Collections)

---

## Troubleshooting

### "MongoDB connection timeout"
- Ensure your Atlas cluster allows connections from `0.0.0.0/0`
- Double-check your `MONGO_URI` password is correct (URL-encoded if it contains special characters)
- Verify the cluster name in the URI matches your actual cluster

### "CORS error" in browser console
- Ensure `CLIENT_URL` exactly matches your Vercel URL (including `https://`)
- Check for trailing slashes — they must match exactly

### "OAuth login fails"
- Verify `SERVER_BASE_URL` is set correctly
- Update callback URLs in Google/Facebook/Twitter developer consoles
- Ensure `GOOGLE_CALLBACK_URL` etc. match exactly what's configured in the provider dashboard

### "Session not persisting"
- `SESSION_SECRET` must be set and consistent across deploys
- In production, cookies require HTTPS (Render provides this automatically)

### "Build failed on Render"
- Check that **Root Directory** is set to `JHANSI-JANTA-FEEDBACK-PORTAL-main/server`
- Ensure `package.json` exists in that directory
- Check Render logs for specific npm errors

---

## Architecture Summary

```
┌─────────────────┐         ┌──────────────────────┐         ┌─────────────────┐
│   Vercel        │  HTTPS  │   Render             │  HTTPS  │  MongoDB Atlas  │
│  (React App)    │◄───────►│  (Node.js/Express)   │◄───────►│  (Database)     │
│                 │         │                      │         │                 │
│ REACT_APP_API_  │         │ MONGO_URI            │         │ M0 Free Cluster │
│ URL = Render URL│         │ JWT_SECRET           │         │                 │
└─────────────────┘         │ SESSION_SECRET       │         └─────────────────┘
                            │ CLIENT_URL = Vercel  │
                            └──────────────────────┘
```

---

## Support

If you encounter issues:
1. Check Render logs first (Dashboard → Service → Logs)
2. Verify all environment variables are set correctly
3. Test MongoDB connection locally with the same `MONGO_URI`
4. Open an issue in the project repository with the error message

