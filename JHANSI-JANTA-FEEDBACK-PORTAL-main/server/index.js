require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const passport = require('passport');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/janata_portal';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

const SESSION_SECRET = process.env.SESSION_SECRET || 'dev_session_secret_change_me';
if (!process.env.SESSION_SECRET) {
  console.warn('[config] SESSION_SECRET is not set. Using insecure fallback secret.');
}

// Session middleware for Passport
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Passport configuration
require('./lib/passport');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/grievances', require('./routes/grievance'));
app.use('/api/users', require('./routes/admin'));
app.use('/api/admin', require('./routes/accountManagement')); // Account generation for admins and officers
app.use('/api/transparency', require('./routes/transparency'));
app.use('/api/transparency', require('./routes/transparencyV2')); // V2 Transparency with complete tracking

app.get('/', (req, res) => res.json({ status: 'Janata Feedback API', time: new Date() }));

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({ error: 'Internal server error' });
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  } catch (err) {
    console.error('Mongo connect error:', err);
    process.exit(1);
  }
}

startServer();
