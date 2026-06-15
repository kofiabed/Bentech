const express = require('express');
const router = express.Router();
const { createReview, getReviews, updateReview, deleteReview } = require('../controllers/reviewController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', getReviews);
router.post('/', protect, createReview);

router.route('/:id')
  .put(protect, authorizeRoles('admin'), updateReview)
  .delete(protect, authorizeRoles('admin'), deleteReview);

module.exports = router;
