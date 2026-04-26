const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Grievance = require('../models/Grievance');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const aiService = require('../lib/ai');
const { sendMail } = require('../lib/mailer');
const { 
  logGrievanceSubmitted,
  logGrievanceStatusChanged,
  logGrievanceAcknowledged,
  logProgressUpdate,
  logGrievanceResolved,
  logCommentAdded
} = require('../lib/activityLoggerEnhanced');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const chatbotRateLimitStore = new Map();
const CHATBOT_WINDOW_MS = Number(process.env.CHATBOT_WINDOW_MS || 60 * 1000);
const CHATBOT_MAX_REQUESTS = Number(process.env.CHATBOT_MAX_REQUESTS || 25);

// simple auth middleware (reads Bearer token)
function auth(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ error: 'Missing auth header' });
  const token = header.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Invalid auth header' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret');
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

function sanitizeChatMessage(message) {
  if (typeof message !== 'string') return '';
  return message.trim().replace(/\s+/g, ' ').slice(0, 2000);
}

function getServerBaseUrl() {
  if (process.env.SERVER_URL) return process.env.SERVER_URL;
  if (process.env.API_BASE_URL) return process.env.API_BASE_URL;
  const port = process.env.PORT || 5000;
  return `http://localhost:${port}`;
}

function buildLocationSnippet(location) {
  if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') return '';
  const accuracy = Number.isFinite(location.accuracy) ? ` (±${Math.round(location.accuracy)}m)` : '';
  const capturedAt = location.capturedAt ? ` • ${new Date(location.capturedAt).toLocaleString()}` : '';
  return `<p><strong>Location:</strong> ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}${accuracy}${capturedAt}</p>`;
}

function buildAttachmentSnippet(attachmentPath) {
  if (!attachmentPath) return '';
  const baseUrl = getServerBaseUrl();
  const link = `${baseUrl}${attachmentPath.startsWith('/') ? attachmentPath : `/${attachmentPath}`}`;
  return `<p><strong>Photo:</strong> <a href="${link}">View attachment</a></p>`;
}

async function sendSubmissionEmail(user, grievance) {
  if (!user?.email) return;
  const portalUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const subject = `Grievance submitted: ${grievance.title}`;
  const html = `
    <p>Hi ${user.name || 'there'},</p>
    <p>Your grievance has been submitted successfully.</p>
    <p><strong>Grievance ID:</strong> ${grievance._id}</p>
    <p><strong>Category:</strong> ${grievance.category}</p>
    <p><strong>Priority:</strong> ${grievance.priority}</p>
    ${buildLocationSnippet(grievance.location)}
    ${buildAttachmentSnippet(grievance.attachment)}
    <p>You can track updates on the portal: <a href="${portalUrl}">${portalUrl}</a></p>
    <p>Thank you for helping us improve the community.</p>
  `;
  await sendMail(user.email, subject, html);
}

async function sendStatusEmail(citizen, grievance, updatedBy, responseText) {
  if (!citizen?.email) return;
  const portalUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const subject = `Grievance update: ${grievance.status}`;
  const responseBlock = responseText ? `<p><strong>Official response:</strong> ${responseText}</p>` : '';
  const updatedByLine = updatedBy ? `<p><strong>Updated by:</strong> ${updatedBy.name || 'Team'} (${updatedBy.role || 'staff'})</p>` : '';
  const html = `
    <p>Hi ${citizen.name || 'there'},</p>
    <p>Your grievance status has been updated.</p>
    <p><strong>Grievance ID:</strong> ${grievance._id}</p>
    <p><strong>Status:</strong> ${grievance.status}</p>
    ${updatedByLine}
    ${responseBlock}
    <p>Track updates on the portal: <a href="${portalUrl}">${portalUrl}</a></p>
  `;
  await sendMail(citizen.email, subject, html);
}

function checkChatbotRateLimit(req) {
  const key = `${req.ip}:${req.user?.id || 'anonymous'}`;
  const now = Date.now();
  const existing = chatbotRateLimitStore.get(key);

  if (!existing || now > existing.windowEnd) {
    chatbotRateLimitStore.set(key, {
      count: 1,
      windowEnd: now + CHATBOT_WINDOW_MS
    });
    return { allowed: true, retryAfter: 0 };
  }

  existing.count += 1;
  chatbotRateLimitStore.set(key, existing);
  if (existing.count > CHATBOT_MAX_REQUESTS) {
    const retryAfter = Math.max(1, Math.ceil((existing.windowEnd - now) / 1000));
    return { allowed: false, retryAfter };
  }

  return { allowed: true, retryAfter: 0 };
}

// Create grievance with AI analysis
router.post('/create', auth, upload.single('attachment'), async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;
    if (!title || !description) return res.status(400).json({ error: 'Missing fields' });

    const attachment = req.file ? '/uploads/' + path.basename(req.file.path) : null;
    const locationLat = Number.parseFloat(req.body.locationLat);
    const locationLng = Number.parseFloat(req.body.locationLng);
    const locationAccuracy = Number.parseFloat(req.body.locationAccuracy);
    let locationCapturedAt = req.body.locationCapturedAt ? new Date(req.body.locationCapturedAt) : null;
    if (locationCapturedAt && Number.isNaN(locationCapturedAt.getTime())) {
      locationCapturedAt = null;
    }
    const location =
      Number.isFinite(locationLat) && Number.isFinite(locationLng)
        ? {
            lat: locationLat,
            lng: locationLng,
            accuracy: Number.isFinite(locationAccuracy) ? locationAccuracy : null,
            source: req.body.locationSource || 'manual',
            capturedAt: locationCapturedAt,
          }
        : null;

    // AI Era: single-pass smart triage with sentiment, category, priority, summary, suggestions
    const triage = await aiService.smartTriage(title, description);

    const g = new Grievance({
      title,
      description,
      category: category || triage.category.category,
      priority: priority || triage.priority.priority,
      citizenId: req.user.id,
      attachment,
      location: location || undefined,
      sentimentScore: triage.sentiment.score,
      aiCategory: triage.category.category,
      aiPriority: triage.priority.priority,
      aiSuggestions: triage.suggestions
    });

    await g.save();

    // Log to both ActivityLog and TransparencyTracker automatically
    await logGrievanceSubmitted(
      g,
      req.user,
      req.ip,
      req.headers['user-agent']
    ).catch(err => console.warn('Warning: Activity logging failed:', err.message));

    sendSubmissionEmail(req.user, g).catch(err => {
      console.warn('Warning: submission email failed:', err.message);
    });

    res.json({
      success: true,
      grievance: g,
      aiInsights: {
        sentiment: triage.sentiment,
        category: triage.category,
        priority: triage.priority,
        summary: triage.summary,
        improvements: triage.suggestions
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get grievances for logged-in citizen
router.get('/my', auth, async (req, res) => {
  try {
    const rows = await Grievance.find({ citizenId: req.user.id }).populate('assignedTo', 'name email').sort({ createdAt: -1 });
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: get all grievances
router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const rows = await Grievance.find().populate('citizenId', 'name email').populate('assignedTo', 'name email').sort({ createdAt: -1 });
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: get system statistics
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    // Get grievance statistics
    const totalGrievances = await Grievance.countDocuments();
    const grievancesByStatus = await Grievance.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const grievancesByCategory = await Grievance.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const grievancesByPriority = await Grievance.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Get user statistics
    const totalUsers = await User.countDocuments();
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentGrievances = await Grievance.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const recentUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    // Average sentiment score
    const sentimentStats = await Grievance.aggregate([
      { $group: { _id: null, avgSentiment: { $avg: '$sentimentScore' }, total: { $sum: 1 } } }
    ]);

    res.json({
      grievances: {
        total: totalGrievances,
        byStatus: grievancesByStatus,
        byCategory: grievancesByCategory,
        byPriority: grievancesByPriority,
        recent: recentGrievances
      },
      users: {
        total: totalUsers,
        byRole: usersByRole,
        recent: recentUsers
      },
      sentiment: sentimentStats[0] || { avgSentiment: 0, total: 0 }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: assign grievance to officer
router.put('/assign/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { officerId } = req.body;
    const g = await Grievance.findById(req.params.id);
    if (!g) return res.status(404).json({ error: 'Not found' });
    
    const officer = await User.findById(officerId);
    if (!officer) return res.status(404).json({ error: 'Officer not found' });
    
    g.assignedTo = officerId;
    g.status = 'Assigned';
    await g.save();
    const citizen = await User.findById(g.citizenId).select('name email');
    
    // Log assignment with transparency tracking
    await logGrievanceStatusChanged(
      g,
      g.status === 'Assigned' ? 'Pending' : 'Unassigned',
      'Assigned',
      req.user,
      [{ userId: officer._id, name: officer.name, email: officer.email, role: officer.role }],
      req.ip,
      req.headers['user-agent']
    ).catch(err => console.warn('Warning: Activity logging failed:', err.message));

    sendStatusEmail(citizen, g, req.user, null).catch(err => {
      console.warn('Warning: status email failed:', err.message);
    });
    
    res.json({ success: true, grievance: g });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Officer: update status & response
router.put('/update/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'officer') return res.status(403).json({ error: 'Forbidden' });
    const { status, response } = req.body;
    const g = await Grievance.findById(req.params.id);
    if (!g) return res.status(404).json({ error: 'Not found' });
    if (!g.assignedTo || String(g.assignedTo) !== String(req.user.id)) return res.status(403).json({ error: 'Not assigned to you' });
    
    const previousStatus = g.status;
    g.status = status || g.status;
    g.response = response || g.response;
    g.updatedAt = new Date();
    await g.save();
    const citizen = await User.findById(g.citizenId).select('name email');
    
    // Log status change with transparency tracking
    if (previousStatus !== g.status) {
      await logGrievanceStatusChanged(
        g,
        previousStatus,
        g.status,
        req.user,
        [],
        req.ip,
        req.headers['user-agent']
      ).catch(err => console.warn('Warning: Activity logging failed:', err.message));
    }
    
    // Log progress update if response is provided
    if (response) {
      await logProgressUpdate(
        g,
        req.user,
        response,
        req.ip,
        req.headers['user-agent']
      ).catch(err => console.warn('Warning: Activity logging failed:', err.message));
    }

    if (previousStatus !== g.status || response) {
      sendStatusEmail(citizen, g, req.user, response).catch(err => {
        console.warn('Warning: status email failed:', err.message);
      });
    }
    
    res.json({ success: true, grievance: g });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: update status & response for any grievance
router.put('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { status, response } = req.body;
    const g = await Grievance.findById(req.params.id);
    if (!g) return res.status(404).json({ error: 'Not found' });
    
    const previousStatus = g.status;
    g.status = status || g.status;
    g.response = response || g.response;
    g.updatedAt = new Date();
    await g.save();
    const citizen = await User.findById(g.citizenId).select('name email');
    
    // Log status change with transparency tracking
    if (previousStatus !== g.status) {
      await logGrievanceStatusChanged(
        g,
        previousStatus,
        g.status,
        req.user,
        [],
        req.ip,
        req.headers['user-agent']
      ).catch(err => console.warn('Warning: Activity logging failed:', err.message));
    }
    
    // Log response update if provided
    if (response) {
      await logProgressUpdate(
        g,
        req.user,
        response,
        req.ip,
        req.headers['user-agent']
      ).catch(err => console.warn('Warning: Activity logging failed:', err.message));
    }

    if (previousStatus !== g.status || response) {
      sendStatusEmail(citizen, g, req.user, response).catch(err => {
        console.warn('Warning: status email failed:', err.message);
      });
    }
    
    res.json({ success: true, grievance: g });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: delete grievance
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const g = await Grievance.findByIdAndDelete(req.params.id);
    if (!g) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, message: 'Grievance deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// AI-powered endpoints
router.post('/smart-triage', auth, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description required' });
    }

    const triage = await aiService.smartTriage(title, description);
    res.json({ success: true, triage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Triage failed' });
  }
});

router.post('/analyze-sentiment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text required' });

    const result = await aiService.analyzeSentiment(text);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

router.post('/suggest-category', auth, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) return res.status(400).json({ error: 'Title and description required' });

    const result = await aiService.suggestCategory(title, description);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Suggestion failed' });
  }
});

router.post('/generate-response', auth, async (req, res) => {
  try {
    if (req.user.role !== 'officer' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { title, description, category, priority } = req.body;
    if (!title || !description) return res.status(400).json({ error: 'Title and description required' });

    const response = await aiService.generateResponse(title, description, category, priority);
    res.json({ aiResponse: response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Response generation failed' });
  }
});

router.post('/chatbot/session', auth, async (req, res) => {
  try {
    const session = aiService.createChatSession({
      userId: req.user.id,
      role: req.user.role,
      name: req.user.name
    });
    res.json({ success: true, ...session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create chatbot session' });
  }
});

router.post('/chatbot', auth, async (req, res) => {
  try {
    const rateLimit = checkChatbotRateLimit(req);
    if (!rateLimit.allowed) {
      return res.status(429).json({
        error: 'Too many AI requests. Please try again shortly.',
        retryAfter: rateLimit.retryAfter
      });
    }

    const { message, context, sessionId } = req.body;
    const normalizedMessage = sanitizeChatMessage(message);
    if (!normalizedMessage) return res.status(400).json({ error: 'Message required' });

    const result = await aiService.getChatbotResponse(normalizedMessage, context || [], {
      sessionId,
      userProfile: {
        userId: req.user.id,
        role: req.user.role,
        name: req.user.name
      }
    });

    res.json({
      success: true,
      response: result.response,
      sessionId: result.sessionId,
      suggestions: result.suggestions || [],
      cached: Boolean(result.cached)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chatbot unavailable' });
  }
});

router.post('/chatbot/stream', auth, async (req, res) => {
  const rateLimit = checkChatbotRateLimit(req);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: 'Too many AI requests. Please try again shortly.',
      retryAfter: rateLimit.retryAfter
    });
  }

  const { message, context, sessionId } = req.body;
  const normalizedMessage = sanitizeChatMessage(message);
  if (!normalizedMessage) {
    return res.status(400).json({ error: 'Message required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (typeof res.flushHeaders === 'function') {
    res.flushHeaders();
  }

  const sendEvent = (eventName, payload) => {
    res.write(`event: ${eventName}\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  let disconnected = false;
  req.on('aborted', () => {
    disconnected = true;
  });
  res.on('close', () => {
    if (!res.writableEnded) {
      disconnected = true;
    }
  });

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  try {
    const result = await aiService.getChatbotResponse(normalizedMessage, context || [], {
      sessionId,
      userProfile: {
        userId: req.user.id,
        role: req.user.role,
        name: req.user.name
      }
    });

    const responseText = result.response || '';
    const chunkSize = 24;

    for (let index = 0; index < responseText.length; index += chunkSize) {
      if (disconnected) break;
      sendEvent('chunk', {
        text: responseText.slice(index, index + chunkSize),
        sessionId: result.sessionId || sessionId || null
      });
      await wait(8);
    }

    if (!disconnected) {
      sendEvent('done', {
        response: responseText,
        sessionId: result.sessionId || sessionId || null,
        suggestions: result.suggestions || [],
        cached: Boolean(result.cached)
      });
    }
  } catch (err) {
    console.error('Streaming chatbot error:', err);
    if (!disconnected) {
      sendEvent('error', { error: 'Chatbot streaming failed' });
    }
  } finally {
    if (!res.writableEnded) {
      res.end();
    }
  }
});

module.exports = router;
