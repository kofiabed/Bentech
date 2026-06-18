// backend/controllers/authController.js
const supabase = require('../config/supabase');

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

    // Register user in Supabase
    const { data, error } = await supabase.auth.signUp({
      email: emailLower,
      password,
      options: {
        data: {
          name,
          role: 'customer'
        }
      }
    });

    if (error) throw error;

    res.status(201).json({
      success: true,
      token: data.session?.access_token,
      user: {
        id: data.user.id,
        _id: data.user.id,
        name: name || emailLower.split('@')[0],
        email: data.user.email,
        role: 'customer'
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

// @desc    Login Account / Authorize Secure Session Handshake
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const emailLower = email.toLowerCase();

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailLower,
      password
    });

    if (error) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid server authentication credentials. Re-evaluate parameters.' 
      });
    }

    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.status(200).json({
      success: true,
      token: data.session.access_token,
      user: {
        id: data.user.id,
        _id: data.user.id,
        name: profile ? profile.name : (data.user.user_metadata?.name || emailLower.split('@')[0]),
        email: data.user.email,
        role: profile ? profile.role : 'customer',
        phone: profile ? profile.phone : null,
        image: profile ? profile.image : null
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

// @desc    Google OAuth Authentication (ID token verification) - Legacy compatibility
// @route   POST /api/auth/google
exports.googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;
    // Direct verification of credential with Supabase if frontend logs in using provider
    const { data: { user }, error } = await supabase.auth.getUser(credential);
    if (error) throw error;

    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    res.status(200).json({
      success: true,
      token: credential,
      user: {
        id: user.id,
        _id: user.id,
        name: profile ? profile.name : (user.user_metadata?.name || user.email.split('@')[0]),
        email: user.email,
        role: profile ? profile.role : 'customer',
        image: profile ? profile.image : null
      }
    });
  } catch (error) {
    if (typeof next === 'function') next(error);
    else {
      console.error("💥 Core Engine Intercepted Unhandled Exception:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile/update
exports.updateProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, email, phone, image } = req.body;
    const profileUpdate = {};
    if (name) profileUpdate.name = name;
    if (email) profileUpdate.email = email.toLowerCase();
    if (phone !== undefined) profileUpdate.phone = phone;
    if (image !== undefined) profileUpdate.image = image;

    // Update profiles table in Supabase
    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(profileUpdate)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    // Also update auth.users metadata if email or name changes
    if (email || name) {
      const authUpdate = {};
      if (email) authUpdate.email = email.toLowerCase();
      if (name) {
        authUpdate.user_metadata = {
          ...req.user.user_metadata,
          name
        };
      }
      
      const { error: authError } = await supabase.auth.admin.updateUserById(req.user.id, authUpdate);
      if (authError) {
        console.error("Auth user metadata update error:", authError);
      }
    }

    res.status(200).json({
      success: true,
      user: {
        id: updatedProfile.id,
        _id: updatedProfile.id,
        name: updatedProfile.name,
        email: updatedProfile.email,
        role: updatedProfile.role,
        phone: updatedProfile.phone,
        image: updatedProfile.image
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
    if (!req.user) {
      return res.status(404).json({ success: false, message: 'Active profile identity token mapping missing.' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        _id: req.user.id,
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