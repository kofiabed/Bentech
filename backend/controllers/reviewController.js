const Review = require('../models/reviewModel');

exports.createReview = async (req, res, next) => {
  try {
    const { rating, text, product } = req.body;
    const review = await Review.create({
      user: req.user._id,
      name: req.user.name,
      email: req.user.email,
      rating,
      text,
      product: product || 'General Shopping Experience'
    });
    res.status(201).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

exports.getReviews = async (req, res, next) => {
  try {
    const filter = req.user?.role === 'admin'
      ? {}
      : req.user
        ? { $or: [{ status: 'approved' }, { user: req.user._id }] }
        : { status: 'approved' };
    const reviews = await Review.find(filter)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid review status.' });
    }
    const review = await Review.findByIdAndUpdate(req.params.id, { status }, { returnDocument: 'after' }).populate('user', 'name email role');
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }
    res.status(200).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }
    res.status(200).json({ success: true, message: 'Review deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
