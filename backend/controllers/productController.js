const supabase = require('../config/supabase');

exports.getProducts = async (req, res) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: true }); // Standard sorting to match home layout logic
      
    if (error) throw error;
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, price, category, stock, img, oldPrice, tag, brand, description, specs } = req.body;
    const { data: product, error } = await supabase
      .from('products')
      .insert({ name, price, category, stock, img, old_price: oldPrice, tag, brand, description, specs })
      .select()
      .single();
      
    if (error) throw error;
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, price, category, stock, img, oldPrice, tag, brand, description, specs } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = price;
    if (category !== undefined) updateData.category = category;
    if (stock !== undefined) updateData.stock = stock;
    if (img !== undefined) updateData.img = img;
    if (oldPrice !== undefined) updateData.old_price = oldPrice;
    if (tag !== undefined) updateData.tag = tag;
    if (brand !== undefined) updateData.brand = brand;
    if (description !== undefined) updateData.description = description;
    if (specs !== undefined) updateData.specs = specs;

    const { data: product, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();
      
    if (error) {
      return res.status(404).json({ success: false, message: 'Product not found or update failed.' });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id);
      
    if (error) throw error;
    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};