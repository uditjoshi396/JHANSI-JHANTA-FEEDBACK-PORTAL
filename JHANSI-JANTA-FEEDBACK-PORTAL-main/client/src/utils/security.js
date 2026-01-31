// Security utility functions for the Jhansi Janata Feedback Portal

/**
 * Sanitizes input by removing potentially dangerous characters
 * @param {string} input - The input string to sanitize
 * @returns {string} - Sanitized string
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input.replace(/[<>]/g, '').trim();
}

/**
 * Validates email format and length
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {boolean} - True if meets requirements
 */
export function isValidPassword(password) {
  return password.length >= 8 &&
         password.length <= 128 &&
         /[A-Z]/.test(password) &&
         /[a-z]/.test(password) &&
         /[0-9]/.test(password) &&
         /[^A-Za-z0-9]/.test(password);
}

/**
 * Checks password strength level
 * @param {string} password - Password to check
 * @returns {number} - Strength level (0-5)
 */
export function checkPasswordStrength(password) {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return strength;
}

/**
 * Validates file for security
 * @param {File} file - File to validate
 * @returns {Object} - {valid: boolean, error: string}
 */
export function validateFile(file) {
  if (!file) return { valid: false, error: 'No file provided' };

  // File type validation
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only images, PDF, and Word documents are allowed.' };
  }

  // File size validation (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }

  // File name sanitization check
  const sanitizedName = file.name.replace(/[<>:"/\\|?*]/g, '').trim();
  if (sanitizedName !== file.name) {
    return { valid: false, error: 'File name contains invalid characters' };
  }

  return { valid: true };
}

/**
 * Gets secure axios config with timeout and headers
 * @param {string} token - JWT token
 * @param {boolean} isFileUpload - Whether this is a file upload request
 * @returns {Object} - Axios config object
 */
export function getSecureAxiosConfig(token, isFileUpload = false) {
  return {
    headers: {
      Authorization: 'Bearer ' + token,
      'X-Requested-With': 'XMLHttpRequest' // CSRF protection
    },
    timeout: isFileUpload ? 30000 : 10000 // Longer timeout for file uploads
  };
}

/**
 * Handles authentication errors consistently
 * @param {Error} error - Axios error object
 * @param {Function} navigate - React Router navigate function
 */
export function handleAuthError(error, navigate) {
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiry');
    navigate('/login');
  } else if (error.code === 'ECONNABORTED') {
    alert('Request timed out. Please check your connection and try again.');
  } else {
    alert(error.response?.data?.error || 'An error occurred. Please try again.');
  }
}

/**
 * Checks if user session is valid
 * @returns {boolean} - True if session is valid
 */
export function isSessionValid() {
  const token = localStorage.getItem('token');
  const tokenExpiry = localStorage.getItem('tokenExpiry');

  if (!token || !tokenExpiry) return false;

  return Date.now() < parseInt(tokenExpiry);
}

/**
 * Clears user session data
 */
export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('tokenExpiry');
}

/**
 * Rate limiting helper for client-side actions
 */
export class RateLimiter {
  constructor(maxAttempts = 5, windowMs = 300000) { // 5 attempts per 5 minutes
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.attempts = [];
  }

  canAttempt() {
    const now = Date.now();
    this.attempts = this.attempts.filter(time => now - time < this.windowMs);
    return this.attempts.length < this.maxAttempts;
  }

  recordAttempt() {
    this.attempts.push(Date.now());
  }

  getRemainingTime() {
    if (this.attempts.length === 0) return 0;
    const oldestAttempt = Math.min(...this.attempts);
    return Math.max(0, this.windowMs - (Date.now() - oldestAttempt));
  }
}
