const supabase = require('../config/supabase');

exports.getOrders = async (req, res, next) => {
  try {
    let queryBuilder = supabase.from('orders').select(`
      *,
      user:profiles (id, name, email, phone, role)
    `);

    if (req.user.role !== 'admin') {
      queryBuilder = queryBuilder.eq('user_id', req.user.id);
    }

    const { data: orders, error } = await queryBuilder.order('created_at', { ascending: false });

    if (error) throw error;

    // Populating products manually because items is a JSONB array of { product: product_id, qty, priceAtPurchase }
    const productIds = [];
    orders.forEach(order => {
      if (Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (item.product) productIds.push(item.product);
        });
      }
    });

    if (productIds.length > 0) {
      const { data: products } = await supabase
        .from('products')
        .select('id, name, img, price, category')
        .in('id', productIds);

      const productMap = {};
      if (products) {
        products.forEach(p => {
          productMap[p.id] = p;
        });
      }

      orders.forEach(order => {
        if (Array.isArray(order.items)) {
          order.items = order.items.map(item => ({
            ...item,
            product: productMap[item.product] || null
          }));
        }
      });
    }

    // Adapt fields to match MongoDB format (e.g. mapping _id = id, createdAt = created_at)
    const adaptedOrders = orders.map(order => ({
      _id: order.id,
      id: order.id,
      user: order.user,
      items: order.items,
      shippingDetails: order.shipping_details,
      deliveryType: order.delivery_type,
      paymentMethod: order.payment_method,
      financials: order.financials,
      status: order.status,
      trackingUpdate: order.tracking_update,
      reference: order.reference,
      paymentReference: order.payment_reference,
      paymentStatus: order.payment_status,
      createdAt: order.created_at,
      updatedAt: order.updated_at
    }));

    res.status(200).json({ success: true, orders: adaptedOrders });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new order (Any verified customer)
// @route   POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingDetails, deliveryType, paymentMethod, financials, reference, paymentReference, paymentStatus } = req.body;

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: req.user.id,
        items,
        shipping_details: shippingDetails,
        delivery_type: deliveryType,
        payment_method: paymentMethod,
        financials,
        reference,
        payment_reference: paymentReference,
        payment_status: paymentStatus || (paymentMethod === 'card' ? 'pending' : 'paid')
      })
      .select()
      .single();

    if (error) throw error;

    // Map properties for response
    const adaptedOrder = {
      _id: order.id,
      id: order.id,
      user: req.user.id,
      items: order.items,
      shippingDetails: order.shipping_details,
      deliveryType: order.delivery_type,
      paymentMethod: order.payment_method,
      financials: order.financials,
      status: order.status,
      trackingUpdate: order.tracking_update,
      reference: order.reference,
      paymentReference: order.payment_reference,
      paymentStatus: order.payment_status,
      createdAt: order.created_at,
      updatedAt: order.updated_at
    };

    res.status(201).json({ success: true, data: adaptedOrder });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status or logistics string (Staff & Admin only)
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingUpdate } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (trackingUpdate) updateData.tracking_update = trackingUpdate;

    const { data: order, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !order) {
      return res.status(404).json({ success: false, message: 'Target order record missing.' });
    }

    const adaptedOrder = {
      _id: order.id,
      id: order.id,
      user: order.user_id,
      items: order.items,
      shippingDetails: order.shipping_details,
      deliveryType: order.delivery_type,
      paymentMethod: order.payment_method,
      financials: order.financials,
      status: order.status,
      trackingUpdate: order.tracking_update,
      reference: order.reference,
      paymentReference: order.payment_reference,
      paymentStatus: order.payment_status,
      createdAt: order.created_at,
      updatedAt: order.updated_at
    };

    res.status(200).json({ success: true, data: adaptedOrder });
  } catch (error) {
    next(error);
  }
};