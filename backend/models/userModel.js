const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'], 
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  password: { 
    type: String, 
    select: false,
    default: null
  },
  role: { 
    type: String, 
    enum: ['customer', 'staff', 'admin'], 
    default: 'customer' 
  },
  phone: {
    type: String,
    default: null
  },
  image: {
    type: String,
    default: null
  }
}, { timestamps: true });

// Pre-save middleware hook to securely encrypt plain text passwords before database insertion
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// 💡 SYNCHRONIZATION UPDATE: Method name changed to match function calls inside authController.js
userSchema.methods.matchPasswords = async function (candidate) {
  return await bcrypt.compare(candidate, this.password);
};

userSchema.methods.getProfileImage = function () {
  if (this.image && this.image.startsWith && this.image.startsWith('data:image')) {
    return this.image;
  }
  return this.role === 'admin' 
    ? 'https://ui-avatars.com/api/?name=Admin&background=4A1A3A&color=fff&size=120'
    : this.role === 'staff'
    ? 'https://ui-avatars.com/api/?name=Staff&background=2D6A4F&color=fff&size=120'
    : 'https://ui-avatars.com/api/?name=User&background=1565C0&color=fff&size=120';
};

module.exports = mongoose.model('User', userSchema);