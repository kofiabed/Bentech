// backend/controllers/authController.js
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_node_key_3000', {
    expiresIn: '30d'
  });
};

// @desc    Register Account Profile Node (Public Interface Client Creation)
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const emailLower = email.toLowerCase();

    // 🛑 DEFENSIVE SECURITY RULE: Prevent malicious actors from forging elevated clearance via public forms
    if (role === 'admin' || role === 'staff') {
      return res.status(403).json({
        success: false,
        message: 'Security Restriction: Elevated clearance nodes cannot be provisioned via public registration channels.'
      });
    }

    // Cross-verify database collection tables to prevent duplication conflicts
    const userExists = await User.findOne({ email: emailLower });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User database node already mapped.' });
    }

    // Initialize the client record (Pre-save hashing middleware executes implicitly inside userModel)
    const user = await User.create({
      name: name || emailLower.split('@')[0],
      email: emailLower,
      password,
      role: 'customer' // Enforce total safety by defaulting exclusively to basic customer tiers
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    // 💡 DEFENSIVE FIX: Guard against missing 'next' reference allocations
    if (typeof next === 'function') {
      next(error);
    } else {
      console.error("💥 Core Engine Intercepted Unhandled Exception:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

// @desc    Login Account / Authorize Secure Session Handshake
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const emailLower = email.toLowerCase();

    // Strictly fetch the document and explicitly select the hidden password field matrix hook
    const user = await User.findOne({ email: emailLower }).select('+password');
    
    // Evaluate if user document exists AND matches hashed bcrypt structures securely
    if (!user || !(await user.matchPasswords(password))) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid server authentication credentials. Re-evaluate parameters.' 
      });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    if (typeof next === 'function') {
      next(error);
    } else {
      console.error("💥 Core Engine Intercepted Unhandled Exception:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

// @desc    Google OAuth Authentication (ID token verification)
// @route   POST /api/auth/google
exports.googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;
    const googleClientId = process.env.GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      return res.status(500).json({
        success: false,
        message: 'Google OAuth is not configured on the server.'
      });
    }

    // Verify Google ID token using GET request (Google's tokeninfo endpoint expects GET)
    const tokenInfo = await axios.get('https://oauth2.googleapis.com/tokeninfo', {
      params: { id_token: credential }
    });

    const { email, email_verified, name, picture, aud } = tokenInfo.data;

    // Verify that the audience (client ID) matches our app's client ID
    if (aud !== googleClientId) {
      return res.status(401).json({
        success: false,
        message: 'Token audience mismatch. Invalid Google client ID.'
      });
    }

    if (!email_verified) {
      return res.status(401).json({
        success: false,
        message: 'Google account email is not verified.'
      });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        role: 'customer'
      });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: picture || user.image
      }
    });
  } catch (error) {
    if (typeof next === 'function') next(error);
    else {
      console.error("💥 Core Engine Intercepted Unhandled Exception:", error);
      res.status(500).json({ success: false, message: error.response?.data?.error_description || error.message || 'Google authentication failed.' });
    }
  }
};

// @desc    Get Current Session User Profile Matrix (For App.jsx useEffect Synchronization Hook)
// @route   GET /api/auth/me
exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, email, phone, image } = req.body;
    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (phone) user.phone = phone;
    if (typeof image !== 'undefined') user.image = image;

    const updatedUser = await user.save();
    res.status(200).json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        image: updatedUser.image
      }
    });
  } catch (error) {
    if (typeof next === 'function') {
      next(error);
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    // req.user gets mapped automatically by your execution layer's 'protect' middleware validation guard
    if (!req.user) {
      return res.status(404).json({ success: false, message: 'Active profile identity token mapping missing.' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone,
        image: req.user.image
      }
    });
  } catch (error) {
    if (typeof next === 'function') {
      next(error);
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};