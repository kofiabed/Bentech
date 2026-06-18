const supabase = require('../config/supabase');

// Verification gatekeeper for logged-in sessions
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Call Supabase auth to verify and get user
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        return res.status(401).json({ success: false, message: 'Not authorized, token validation failed' });
      }

      // Fetch user profile from public.profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError || !profile) {
        // Fallback/Create profile or return error. Usually the trigger handles profile creation
        req.user = {
          _id: user.id,
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email.split('@')[0],
          role: user.user_metadata?.role || 'customer'
        };
      } else {
        req.user = {
          _id: profile.id,
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          phone: profile.phone,
          image: profile.image
        };
      }
      
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