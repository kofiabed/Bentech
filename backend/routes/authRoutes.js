// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, googleAuth } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public Access Endpoints
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);

router.get('/me', protect, getMe);
router.put('/profile/update', protect, updateProfile);

module.exports = router;