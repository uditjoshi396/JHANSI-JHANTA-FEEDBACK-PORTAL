# ============================================
# JHANSI-JANTA FEEDBACK PORTAL - GMAIL SETUP
# ============================================

# INSTALL nodemailer if not already installed:
# npm install nodemailer

# ============================================
# GMAIL CONFIGURATION
# ============================================
# Important: Use Gmail App Password, NOT your regular password
# 
# Steps to get App Password:
# 1. Go to: https://myaccount.google.com/apppasswords
# 2. Sign in with your Gmail account
# 3. Select "Mail" as app and "Windows Computer" as device
# 4. Copy the 16-character password (without spaces)
# 5. Paste it below as GMAIL_PASSWORD

GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=your-16-char-app-password

# Portal URL (for links in emails)
PORTAL_URL=http://localhost:3000

# ============================================
# ALTERNATIVE: Use OAuth (Gmail API)
# ============================================
# For production, you can also use Gmail API OAuth2:

GMAIL_CLIENT_ID=your-client-id
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token

# ============================================
# EXAMPLE .env file content:
# ============================================
# JWT_SECRET=your_jwt_secret_here
# MONGO_URI=mongodb://localhost:27017/janata_portal
# GMAIL_USER=janta-feedback@gmail.com
# GMAIL_PASSWORD=abcd1234efgh5678
# PORTAL_URL=http://localhost:3000
# NODE_ENV=development
# PORT=5000
# CLIENT_URL=http://localhost:3000

# ============================================
# SECURITY NOTES:
# ============================================
# 1. NEVER commit this file to GitHub
# 2. NEVER share your Gmail app password
# 3. Use environment variables for all secrets
# 4. For production, use OAuth2 instead of app password
# 5. Rotate credentials regularly
# 6. Monitor email sending logs for suspicious activity

# ============================================
# SETUP INSTRUCTIONS:
# ============================================
# 1. Create a .env file in /server directory
# 2. Copy all variables above (except comments)
# 3. Replace placeholders with your values:
#    - GMAIL_USER: Your Gmail email address
#    - GMAIL_PASSWORD: 16-character app password from Gmail
#    - PORTAL_URL: Your portal's public URL
# 4. Save .env file
# 5. Restart Node.js server: npm start
# 6. Test account generation API

# ============================================
# HOW TO GET GMAIL APP PASSWORD:
# ============================================
# 1. Enable 2-Step Verification on your Gmail:
#    https://support.google.com/accounts/answer/185839
# 2. Go to https://myaccount.google.com/apppasswords
# 3. Select "Mail" as the app
# 4. Select "Windows Computer" (or your device type)
# 5. Click "Generate"
# 6. Copy the 16-character password
# 7. Paste into GMAIL_PASSWORD above
#
# Note: If you don't see "App passwords", you may need to:
# - Enable 2-Step Verification first
# - Use a personal Gmail account (not business)
# - Check if your organization blocks it

# ============================================
# TESTING EMAIL CONFIGURATION:
# ============================================
# After setup, test with curl:
#
# curl -X POST http://localhost:5000/api/admin/generate-account \
#   -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "name": "Test Officer",
#     "email": "test.officer@government.in",
#     "role": "officer",
#     "department": "Police",
#     "sendEmail": true
#   }'
#
# Expected: Account created and email sent successfully

# ============================================
# TROUB LESHOOTING EMAIL ISSUES:
# ============================================
# 
# Issue: "Invalid login credentials"
# Solution: 
# - Check if GMAIL_PASSWORD is correct (16 chars, from app password)
# - Not your regular Gmail password
# - Check Gmail account has 2-Step Verification enabled
#
# Issue: "Less secure apps is turned off"
# Solution:
# - Use Gmail App Password instead of regular password
# - App passwords only work with 2-Step Verification
#
# Issue: "Email not sending"
# Solution:
# - Test with curl command above
# - Check console logs for error messages
# - Verify email address is valid
# - Check Gmail hasn't blocked your sending
#
# Issue: "Too many login attempts"
# Solution:
# - Wait 24 hours for block to clear
# - Use Gmail App Password instead
# - Check for typos in credentials
#
# For more help:
# - https://support.google.com/accounts/answer/185833
# - https://nodemailer.com/smtp/gmail/

# ============================================
# PRODUCTION RECOMMENDATIONS:
# ============================================
# 1. Use Gmail OAuth2 instead of app password
# 2. Use a dedicated Gmail account for sending
# 3. Enable DKIM signing for domains
# 4. Monitor bounce rates and complaints
# 5. Set up email templates in SendGrid/AWS SES
# 6. Add reply-to address for support
# 7. Test email deliverability
# 8. Set up rate limiting for account generation
# 9. Log all account generation activities
# 10. Implement approval workflow for account creation
