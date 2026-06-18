const supabase = require('../config/supabase');

exports.createReview = async (req, res, next) => {
  try {
    const { rating, text, product } = req.body;
    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        user_id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        rating,
        text,
        product: product || 'General Shopping Experience'
      })
      .select()
      .single();

    if (error) throw error;

    const adaptedReview = {
      _id: review.id,
      id: review.id,
      user: review.user_id,
      name: review.name,
      email: review.email,
      rating: review.rating,
      text: review.text,
      product: review.product,
      status: review.status,
      createdAt: review.created_at,
      updatedAt: review.updated_at
    };

    res.status(201).json({ success: true, review: adaptedReview });
  } catch (error) {
    next(error);
  }
};

exports.getReviews = async (req, res, next) => {
  try {
    let queryBuilder = supabase.from('reviews').select(`
      *,
      user:profiles (id, name, email, role)
    `);

    if (req.user?.role !== 'admin') {
      if (req.user) {
        queryBuilder = queryBuilder.or(`status.eq.approved,user_id.eq.${req.user.id}`);
      } else {
        queryBuilder = queryBuilder.eq('status', 'approved');
      }
    }

    const { data: reviews, error } = await queryBuilder.order('created_at', { ascending: false });
    if (error) throw error;

    const adaptedReviews = reviews.map(review => ({
      _id: review.id,
      id: review.id,
      user: review.user,
      name: review.name,
      email: review.email,
      rating: review.rating,
      text: review.text,
      product: review.product,
      status: review.status,
      createdAt: review.created_at,
      updatedAt: review.updated_at
    }));

    res.status(200).json({ success: true, reviews: adaptedReviews });
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

    const { data: review, error } = await supabase
      .from('reviews')
      .update({ status })
      .eq('id', req.params.id)
      .select(`
        *,
        user:profiles (id, name, email, role)
      `)
      .single();

    if (error || !review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const adaptedReview = {
      _id: review.id,
      id: review.id,
      user: review.user,
      name: review.name,
      email: review.email,
      rating: review.rating,
      text: review.text,
      product: review.product,
      status: review.status,
      createdAt: review.created_at,
      updatedAt: review.updated_at
    };

    res.status(200).json({ success: true, review: adaptedReview });
  } catch (error) {
    next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const { data: review, error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    res.status(200).json({ success: true, message: 'Review deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
