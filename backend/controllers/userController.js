const supabase = require('../config/supabase');

exports.getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    let queryBuilder = supabase.from('profiles').select('*');
    if (role) {
      queryBuilder = queryBuilder.eq('role', role);
    }
    const { data: users, error } = await queryBuilder.order('created_at', { ascending: false });
    if (error) throw error;

    // Adapt fields to match MongoDB format
    const adaptedUsers = users.map(user => ({
      _id: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      image: user.image,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }));

    res.status(200).json({ success: true, users: adaptedUsers });
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!['customer', 'staff', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid user role.' });
    }

    // Call Supabase admin auth API to create user
    const { data: { user }, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role }
    });

    if (error) throw error;

    // Also update phone in profiles
    const { data: profile } = await supabase
      .from('profiles')
      .update({ phone })
      .eq('id', user.id)
      .select()
      .single();

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        name: profile ? profile.name : name,
        email: user.email,
        role: profile ? profile.role : role,
        phone: profile ? profile.phone : phone,
        image: profile ? profile.image : null
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, image } = req.body;
    const userId = req.params.id;

    // Fetch user profile first
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError || !profile) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (req.user.id === userId && role && role !== profile.role) {
      return res.status(403).json({ success: false, message: 'You cannot change your own role.' });
    }

    // Update Auth.users properties if password/email/metadata changes
    const authUpdate = {};
    if (email) authUpdate.email = email.toLowerCase();
    if (password) authUpdate.password = password;
    if (name || role) {
      authUpdate.user_metadata = {
        name: name || profile.name,
        role: role || profile.role
      };
    }

    if (Object.keys(authUpdate).length > 0) {
      const { error: authError } = await supabase.auth.admin.updateUserById(userId, authUpdate);
      if (authError) throw authError;
    }

    // Update Profiles properties
    const profileUpdate = {};
    if (name) profileUpdate.name = name;
    if (email) profileUpdate.email = email.toLowerCase();
    if (role) profileUpdate.role = role;
    if (phone !== undefined) profileUpdate.phone = phone;
    if (image !== undefined) profileUpdate.image = image;

    const { data: updatedProfile, error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdate)
      .eq('id', userId)
      .select()
      .single();

    if (profileError) throw profileError;

    res.status(200).json({
      success: true,
      user: {
        id: updatedProfile.id,
        name: updatedProfile.name,
        email: updatedProfile.email,
        role: updatedProfile.role,
        phone: updatedProfile.phone,
        image: updatedProfile.image
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    if (req.user.id === userId) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
    }

    // Call Supabase admin to delete user (will cascade delete their profile)
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) throw error;

    res.status(200).json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
