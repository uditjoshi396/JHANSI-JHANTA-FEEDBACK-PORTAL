# Janata Feedback Portal - React Client

## Setup
1. `cd client`
2. `npm install`
3. `npm start`
4. The client expects the backend to run at http://localhost:5000

## Password Reset
- Use the `/forgot-password` route from the login UI.
- The backend must have SMTP configured (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`).
- Optional backend tuning: `PASSWORD_RESET_CODE_TTL_MS`, `PASSWORD_RESET_RESEND_COOLDOWN_MS`, `PASSWORD_RESET_MAX_ATTEMPTS`.

## Notes
- This is a minimal UI to demonstrate the API integration.
- You can expand it with Bootstrap, role-specific dashboards (admin/officer), file upload, and pagination.

## Google Login
- Set `REACT_APP_GOOGLE_CLIENT_ID` in `client/.env` to show the Google button.
- Server must be configured with Google OAuth credentials (see root `.env.example`).
