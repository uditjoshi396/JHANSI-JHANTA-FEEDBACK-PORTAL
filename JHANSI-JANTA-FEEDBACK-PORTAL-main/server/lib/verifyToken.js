const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token from Authorization header
 */
module.exports = function verifyToken(req, res, next) {
  const header = req.headers['authorization'];
  
  if (!header) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const token = header.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Invalid authorization header format' });
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
