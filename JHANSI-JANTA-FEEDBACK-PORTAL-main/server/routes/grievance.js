const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Grievance = require('../models/Grievance');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const aiService = require('../lib/ai');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

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

// Create grievance with AI analysis
router.post('/create', auth, upload.single('attachment'), async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;
    if (!title || !description) return res.status(400).json({ error: 'Missing fields' });

    const attachment = req.file ? '/uploads/' + path.basename(req.file.path) : null;

    // AI Analysis
    const [sentimentResult, categorySuggestion, prioritySuggestion, suggestions] = await Promise.all([
      aiService.analyzeSentiment(`${title} ${description}`),
      aiService.suggestCategory(title, description),
      aiService.suggestPriority(title, description, 0), // Initial sentiment score
      aiService.generateSuggestions(title, description)
    ]);

    const g = new Grievance({
      title,
      description,
      category: category || categorySuggestion.category,
      priority: priority || prioritySuggestion.priority,
      citizenId: req.user.id,
      attachment,
      sentimentScore: sentimentResult.score,
      aiCategory: categorySuggestion.category,
      aiPriority: prioritySuggestion.priority,
      aiSuggestions: suggestions
    });

    await g.save();

    res.json({
      success: true,
      grievance: g,
      aiInsights: {
        sentiment: sentimentResult,
        suggestions: category !== categorySuggestion.category ? [categorySuggestion] : [],
        improvements: suggestions
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
    g.assignedTo = officerId;
    g.status = 'Assigned';
    await g.save();
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
    g.status = status || g.status;
    g.response = response || g.response;
    g.updatedAt = new Date();
    await g.save();
    res.json({ success: true, grievance: g });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// AI-powered endpoints
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

router.post('/chatbot', auth, async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    const response = await aiService.getChatbotResponse(message, context || []);
    res.json({ response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chatbot unavailable' });
  }
});

module.exports = router;
