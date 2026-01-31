const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing required fields' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email: email.toLowerCase(), phone, password: hash, role: role || 'citizen' });
    await user.save();
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Google OAuth routes - Only if Google strategy is configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    async (req, res) => {
      try {
        // Generate JWT token for the authenticated user
        const token = jwt.sign(
          {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        // Redirect to frontend with token
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        res.redirect(`${clientUrl}/login?token=${token}&google=true`);
      } catch (error) {
        console.error('Google auth callback error:', error);
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=auth_failed`);
      }
    }
  );
}

// Facebook OAuth routes - Only if Facebook strategy is configured
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  router.get('/facebook',
    passport.authenticate('facebook', { scope: ['email'] })
  );

  router.get('/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    async (req, res) => {
      try {
        // Generate JWT token for the authenticated user
        const token = jwt.sign(
          {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        // Redirect to frontend with token
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        res.redirect(`${clientUrl}/login?token=${token}&facebook=true`);
      } catch (error) {
        console.error('Facebook auth callback error:', error);
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=auth_failed`);
      }
    }
  );
}

// Twitter OAuth routes - Only if Twitter strategy is configured
if (process.env.TWITTER_CONSUMER_KEY && process.env.TWITTER_CONSUMER_SECRET) {
  router.get('/twitter',
    passport.authenticate('twitter')
  );

  router.get('/twitter/callback',
    passport.authenticate('twitter', { failureRedirect: '/login' }),
    async (req, res) => {
      try {
        // Generate JWT token for the authenticated user
        const token = jwt.sign(
          {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        // Redirect to frontend with token
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        res.redirect(`${clientUrl}/login?token=${token}&twitter=true`);
      } catch (error) {
        console.error('Twitter auth callback error:', error);
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=auth_failed`);
      }
    }
  );
}

// Instagram OAuth routes - Only if Instagram strategy is configured
if (process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET) {
  router.get('/instagram',
    passport.authenticate('instagram')
  );

  router.get('/instagram/callback',
    passport.authenticate('instagram', { failureRedirect: '/login' }),
    async (req, res) => {
      try {
        // Generate JWT token for the authenticated user
        const token = jwt.sign(
          {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        // Redirect to frontend with token
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        res.redirect(`${clientUrl}/login?token=${token}&instagram=true`);
      } catch (error) {
        console.error('Instagram auth callback error:', error);
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=auth_failed`);
      }
    }
  );
}

// Get current user info
router.get('/me', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all citizens (admin only)
router.get('/citizens', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const citizens = await User.find({ role: 'citizen' }).select('-password');
    res.json({ citizens });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
