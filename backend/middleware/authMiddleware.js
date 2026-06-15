const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Verification gatekeeper for logged-in sessions
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_node_key_3000');
      
      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token validation failed' });
    }
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no session token found' });
  }
};

// Role authorization gatekeeper middleware factory
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires clearance level matching [${roles.join(' or ')}]`
      });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };