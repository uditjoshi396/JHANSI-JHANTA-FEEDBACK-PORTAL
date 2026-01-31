# Janata Feedback Portal - Backend (Node.js + Express + MongoDB)

## Setup
1. Copy `.env.example` to `.env` and fill values (MONGO_URI, JWT_SECRET, SMTP if needed).
2. Install dependencies:
   ```
   npm install
   ```
3. Start server:
   ```
   npm run dev
   ```
4. Server runs on PORT from .env (default 5000).

## Notes
- Use Postman or the provided React client to interact with the API.
- Create an admin user by registering then updating role in MongoDB, or insert directly.
