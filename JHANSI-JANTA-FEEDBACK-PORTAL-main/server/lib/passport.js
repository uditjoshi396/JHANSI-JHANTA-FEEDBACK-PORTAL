const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const InstagramStrategy = require('passport-instagram').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// JWT Strategy for protecting routes
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'defaultsecret'
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await User.findById(payload.id);
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (error) {
    return done(error, false);
  }
}));

// Google OAuth Strategy - Only initialize if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // Update user info if needed
          user.name = profile.displayName;
          user.email = profile.emails[0].value;
          user.avatar = profile.photos[0].value;
          await user.save();
          return done(null, user);
        }

        // Check if user exists with same email
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          user.name = profile.displayName;
          user.avatar = profile.photos[0].value;
          await user.save();
          return done(null, user);
        }

        // Create new user
        user = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          avatar: profile.photos[0].value,
          role: 'citizen',
          verified: true, // Google accounts are pre-verified
          authProvider: 'google'
        });

        await user.save();
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  ));
} else {
  console.warn('Google OAuth credentials not found. Google authentication will not be available.');
}

// Facebook OAuth Strategy - Only initialize if credentials are available
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:5000/api/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'emails', 'photos']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Facebook ID
        let user = await User.findOne({ facebookId: profile.id });

        if (user) {
          // Update user info if needed
          user.name = profile.displayName;
          user.email = profile.emails ? profile.emails[0].value : `${profile.id}@facebook.com`;
          user.avatar = profile.photos ? profile.photos[0].value : null;
          await user.save();
          return done(null, user);
        }

        // Check if user exists with same email
        if (profile.emails && profile.emails[0].value) {
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // Link Facebook account to existing user
            user.facebookId = profile.id;
            user.name = profile.displayName;
            user.avatar = profile.photos ? profile.photos[0].value : null;
            await user.save();
            return done(null, user);
          }
        }

        // Create new user
        user = new User({
          name: profile.displayName,
          email: profile.emails ? profile.emails[0].value : `${profile.id}@facebook.com`,
          facebookId: profile.id,
          avatar: profile.photos ? profile.photos[0].value : null,
          role: 'citizen',
          verified: true, // Social accounts are pre-verified
          authProvider: 'facebook'
        });

        await user.save();
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  ));
} else {
  console.warn('Facebook OAuth credentials not found. Facebook authentication will not be available.');
}

// Twitter OAuth Strategy - Only initialize if credentials are available
if (process.env.TWITTER_CONSUMER_KEY && process.env.TWITTER_CONSUMER_SECRET) {
  passport.use(new TwitterStrategy({
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL: process.env.TWITTER_CALLBACK_URL || 'http://localhost:5000/api/auth/twitter/callback',
      includeEmail: true
    },
    async (token, tokenSecret, profile, done) => {
      try {
        // Check if user already exists with this Twitter ID
        let user = await User.findOne({ twitterId: profile.id });

        if (user) {
          // Update user info if needed
          user.name = profile.displayName;
          user.email = profile.emails ? profile.emails[0].value : `${profile.id}@twitter.com`;
          user.avatar = profile.photos ? profile.photos[0].value : null;
          await user.save();
          return done(null, user);
        }

        // Check if user exists with same email
        if (profile.emails && profile.emails[0].value) {
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // Link Twitter account to existing user
            user.twitterId = profile.id;
            user.name = profile.displayName;
            user.avatar = profile.photos ? profile.photos[0].value : null;
            await user.save();
            return done(null, user);
          }
        }

        // Create new user
        user = new User({
          name: profile.displayName,
          email: profile.emails ? profile.emails[0].value : `${profile.id}@twitter.com`,
          twitterId: profile.id,
          avatar: profile.photos ? profile.photos[0].value : null,
          role: 'citizen',
          verified: true, // Social accounts are pre-verified
          authProvider: 'twitter'
        });

        await user.save();
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  ));
} else {
  console.warn('Twitter OAuth credentials not found. Twitter authentication will not be available.');
}

// Instagram OAuth Strategy - Only initialize if credentials are available
if (process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET) {
  passport.use(new InstagramStrategy({
      clientID: process.env.INSTAGRAM_CLIENT_ID,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
      callbackURL: process.env.INSTAGRAM_CALLBACK_URL || 'http://localhost:5000/api/auth/instagram/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Instagram ID
        let user = await User.findOne({ instagramId: profile.id });

        if (user) {
          // Update user info if needed
          user.name = profile.displayName;
          user.avatar = profile.photos ? profile.photos[0].value : null;
          await user.save();
          return done(null, user);
        }

        // Create new user (Instagram doesn't provide email)
        user = new User({
          name: profile.displayName,
          email: `${profile.id}@instagram.com`, // Placeholder email
          instagramId: profile.id,
          avatar: profile.photos ? profile.photos[0].value : null,
          role: 'citizen',
          verified: true, // Social accounts are pre-verified
          authProvider: 'instagram'
        });

        await user.save();
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  ));
} else {
  console.warn('Instagram OAuth credentials not found. Instagram authentication will not be available.');
}

module.exports = passport;
