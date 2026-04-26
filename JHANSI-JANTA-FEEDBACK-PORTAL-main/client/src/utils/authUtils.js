// Authentication Utility Functions

/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeInput = (input) => {
  return input.replace(/[<>]/g, '').trim();
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Validate name format (letters and spaces only)
 */
export const isValidName = (name) => {
  return name.length >= 2 && name.length <= 50 && /^[a-zA-Z\s]+$/.test(name);
};

/**
 * Validate phone number format
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Check password strength (0-5)
 */
export const checkPasswordStrength = (password) => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return strength;
};

/**
 * Get password strength text
 */
export const getPasswordStrengthText = (strength) => {
  switch (strength) {
    case 0:
      return 'Very Weak';
    case 1:
      return 'Weak';
    case 2:
      return 'Fair';
    case 3:
      return 'Good';
    case 4:
      return 'Strong';
    case 5:
      return 'Very Strong';
    default:
      return '';
  }
};

/**
 * Get password strength color
 */
export const getPasswordStrengthColor = (strength) => {
  switch (strength) {
    case 0:
    case 1:
      return '#dc3545';
    case 2:
      return '#ffc107';
    case 3:
      return '#17a2b8';
    case 4:
    case 5:
      return '#28a745';
    default:
      return '#6c757d';
  }
};

/**
 * Validate password strength
 */
export const isValidPassword = (password) => {
  return (
    password.length >= 8 &&
    password.length <= 128 &&
    checkPasswordStrength(password) >= 3
  );
};

/**
 * Validate passwords match
 */
export const passwordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

/**
 * Get authentication error message
 */
export const getAuthErrorMessage = (error) => {
  if (error.response?.status === 429) {
    return 'Too many attempts. Please try again later.';
  }
  if (error.response?.status === 401) {
    return 'Invalid email or password';
  }
  if (error.response?.status === 409) {
    return 'Email already exists. Please use a different email.';
  }
  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Please check your connection.';
  }
  return error.response?.data?.error || 'An error occurred. Please try again.';
};

/**
 * Generate client fingerprint for security
 */
export const generateDeviceFingerprint = async () => {
  try {
    const navigator_data = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: navigator.deviceMemory,
      maxTouchPoints: navigator.maxTouchPoints,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    // Create a simple hash from the data
    const str = JSON.stringify(navigator_data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  } catch (error) {
    console.error('Error generating device fingerprint:', error);
    return null;
  }
};

/**
 * Validate CAPTCHA response
 */
export const validateCaptcha = async (captchaToken) => {
  if (!captchaToken) return false;
  
  try {
    const response = await fetch('http://localhost:5000/api/auth/verify-captcha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: captchaToken })
    });
    return response.ok;
  } catch (error) {
    console.error('CAPTCHA validation error:', error);
    return false;
  }
};

/**
 * Check email availability
 */
export const checkEmailAvailability = async (email) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    return data.available;
  } catch (error) {
    console.error('Email availability check error:', error);
    return null;
  }
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

/**
 * Verify token validity with server
 */
export const verifyToken = async (token) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.ok;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
};

/**
 * Clear auth data from localStorage
 */
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('tokenExpiry');
  localStorage.removeItem('deviceFingerprint');
};

/**
 * Save auth data to localStorage securely
 */
export const saveAuthData = (token, user) => {
  try {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('tokenExpiry', Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  } catch (error) {
    console.error('Error saving auth data:', error);
    throw new Error('Unable to save session. Please check your browser settings.');
  }
};

/**
 * Get auth data from localStorage
 */
export const getAuthData = () => {
  try {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const tokenExpiry = localStorage.getItem('tokenExpiry');

    if (!token || !user) return null;

    // Check if token is expired
    if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
      clearAuthData();
      return null;
    }

    return {
      token,
      user: JSON.parse(user),
      tokenExpiry
    };
  } catch (error) {
    console.error('Error retrieving auth data:', error);
    return null;
  }
};

/**
 * Log login attempt for security auditing
 */
export const logLoginAttempt = async (email, success, errorMessage = null) => {
  try {
    await fetch('http://localhost:5000/api/auth/log-attempt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        success,
        error: errorMessage,
        timestamp: new Date().toISOString(),
        ipAddress: 'auto-detect', // Server will detect this
        userAgent: navigator.userAgent
      })
    });
  } catch (error) {
    console.error('Error logging login attempt:', error);
  }
};

export default {
  sanitizeInput,
  isValidEmail,
  isValidName,
  isValidPhone,
  checkPasswordStrength,
  getPasswordStrengthText,
  getPasswordStrengthColor,
  isValidPassword,
  passwordsMatch,
  getAuthErrorMessage,
  generateDeviceFingerprint,
  validateCaptcha,
  checkEmailAvailability,
  formatPhoneNumber,
  verifyToken,
  clearAuthData,
  saveAuthData,
  getAuthData,
  logLoginAttempt
};
