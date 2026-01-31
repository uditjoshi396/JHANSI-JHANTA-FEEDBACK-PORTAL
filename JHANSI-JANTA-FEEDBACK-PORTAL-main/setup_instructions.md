# Janata Feedback Portal - Setup Instructions

## Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)
- MongoDB (installed and running locally)

## Quick Setup

### Option 1: Automated Setup (Windows)

1. Run the `run_project.bat` file in the root directory
2. The script will:
   - Check if MongoDB is running
   - Install dependencies for both client and server
   - Start the server on port 5000
   - Start the client on port 3000

### Option 2: Manual Setup

#### Server Setup

1. Navigate to the server directory:

   ```
   cd server
   ```

2. Copy environment file:

   ```
   copy .env.example .env
   ```

3. Edit `.env` file with your configuration:

   ```
   MONGO_URI=mongodb://localhost:27017/janata_portal
   JWT_SECRET=your_secure_jwt_secret_here
   PORT=5000

   # Optional: Email configuration
   SMTP_HOST=your_smtp_host
   SMTP_PORT=587
   SMTP_USER=your_email@domain.com
   SMTP_PASS=your_email_password

   # Optional: Social Authentication
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

4. Install dependencies:

   ```
   npm install
   ```

5. Start the server:
   ```
   npm run dev
   ```

#### Client Setup

1. Open a new terminal and navigate to the client directory:

   ```
   cd client
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the React development server:
   ```
   npm start
   ```

## Accessing the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Features

- User registration and login
- JWT-based authentication
- Social authentication (Google, Facebook, Twitter, Instagram) - conditionally enabled
- Grievance submission and management
- Role-based access (citizen, officer, admin)
- Responsive UI with modern design

## Social Authentication Setup

To enable social authentication, you need to:

1. **Google OAuth**:

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`

2. **Facebook OAuth**:

   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create a new app
   - Add Facebook Login product
   - Configure OAuth redirect URIs: `http://localhost:5000/api/auth/facebook/callback`

3. **Twitter OAuth**:

   - Go to [Twitter Developer Portal](https://developer.twitter.com/)
   - Create a new app
   - Enable OAuth 1.0a
   - Set callback URL: `http://localhost:5000/api/auth/twitter/callback`

4. **Instagram OAuth**:
   - Go to [Facebook Developers](https://developers.facebook.com/) (Instagram uses Facebook's API)
   - Create a business app
   - Add Instagram Basic Display product
   - Configure OAuth redirect URIs: `http://localhost:5000/api/auth/instagram/callback`

Add the obtained credentials to your `.env` file.

## Database

The application uses MongoDB. Make sure MongoDB is running before starting the server.

## Default Admin User

After setup, you can create an admin user by:

1. Registering a new account
2. Updating the user's role to 'admin' directly in MongoDB

## Troubleshooting

- **Port already in use**: Make sure no other applications are using ports 3000 or 5000
- **MongoDB connection error**: Ensure MongoDB is running and the MONGO_URI is correct
- **Social auth not working**: Check that the credentials are correctly set in `.env` and callback URLs match

## Development

- Server uses nodemon for auto-restart on file changes
- Client uses create-react-app with hot reloading
- Both support development mode with detailed error messages
