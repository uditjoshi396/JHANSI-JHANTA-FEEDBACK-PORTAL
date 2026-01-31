# Google Authentication Setup Guide

## Prerequisites

- Google Cloud Console account
- Node.js and npm installed
- MongoDB running locally or remote connection

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Configure OAuth consent screen if prompted
   - Set Application type to "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback` (for development)
     - Add your production URL when deploying
   - Copy the Client ID and Client Secret

## Step 2: Configure Environment Variables

Update your `server/.env` file with the Google OAuth credentials:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Other required variables
MONGO_URI=mongodb://localhost:27017/janata_portal
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here
PORT=5000
CLIENT_URL=http://localhost:3000
```

## Step 3: Install Dependencies

The required packages have been installed:

- `passport`
- `passport-google-oauth20`
- `express-session`

## Step 4: Start the Application

1. Start MongoDB if not already running
2. Start the server: `cd server && npm run dev`
3. Start the client: `cd client && npm start`
4. Visit `http://localhost:3000/login` and click "Continue with Google"

## Features Implemented

- **Google OAuth Login**: Users can sign in with their Google account
- **Account Linking**: Existing users can link their Google account
- **New User Creation**: New users are automatically created with Google data
- **JWT Token Generation**: Standard JWT tokens are issued for authenticated users
- **Session Management**: Proper session handling with Passport.js
- **Profile Data**: Google profile information (name, email, avatar) is stored

## Security Features

- Secure session management
- JWT token-based authentication
- CSRF protection
- Input validation and sanitization
- Rate limiting on login attempts
- Account lockout after failed attempts

## Database Changes

The User model has been updated to support Google authentication:

- `googleId`: Unique Google user ID
- `avatar`: Profile picture URL from Google
- `authProvider`: Tracks authentication method ('local' or 'google')
- `verified`: Email verification status (Google accounts are pre-verified)

## API Endpoints

- `GET /api/auth/google`: Initiates Google OAuth flow
- `GET /api/auth/google/callback`: Handles OAuth callback
- `GET /api/auth/me`: Get current user info (requires authentication)

## Troubleshooting

1. **"redirect_uri_mismatch"**: Ensure the callback URL in Google Console matches your `.env` file
2. **"invalid_client"**: Check your Client ID and Secret in the `.env` file
3. **MongoDB connection error**: Ensure MongoDB is running and the URI is correct
4. **Session errors**: Clear browser cookies and try again

## Production Deployment

When deploying to production:

1. Update the callback URL in Google Cloud Console
2. Set `SESSION_SECRET` to a strong, random string
3. Use HTTPS for secure cookie transmission
4. Set `CLIENT_URL` to your production frontend URL
5. Configure proper CORS settings

## Testing

1. Test Google login flow
2. Test account linking with existing users
3. Test new user creation
4. Test JWT token validation
5. Test session persistence

The Google authentication system is now fully integrated with your existing email/password authentication!
