const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  role: {
    type: String,
    enum: ['beneficiary', 'vaccinator', 'organizer', 'admin'],
    default: 'beneficiary',
  },
  phoneNumber: {
    type: String,
  },
  uniqueId: {
    type: String,
    sparse: true,
    unique: true,
  },
  address: {
    type: String,
  },
}, { timestamps: true });

// Mongoose hook to automatically hash the password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;