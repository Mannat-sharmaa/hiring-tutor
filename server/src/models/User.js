const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Base User schema. Tutor and Student extend this via Mongoose discriminators
// so shared auth/profile fields live in one place, while role-specific fields
// (hourlyRate, subjects, grade level, etc.) live on the child schemas.
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: function () {
        // Not required for users created via Google OAuth
        return !this.googleId;
      },
      minlength: 8,
      select: false,
    },
    googleId: { type: String, default: null },
    avatar: { type: String, default: '' },
    role: {
      type: String,
      enum: ['student', 'tutor', 'admin'],
      required: true,
      default: 'student',
    },
    phone: { type: String, default: '' },
    isEmailVerified: { type: Boolean, default: false },
    otp: { type: String, select: false },
    otpExpires: { type: Date, select: false },
    status: {
      type: String,
      enum: ['active', 'banned', 'suspended'],
      default: 'active',
    },
    lastLoginAt: { type: Date },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  {
    timestamps: true,
    discriminatorKey: 'role',
  }
);

// Note: no separate index({ email: 1 }) here — `unique: true` above already
// creates one; adding another would just duplicate it.

// Hash password before saving whenever it changes
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

// Strip sensitive fields whenever a user doc is serialized
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpires;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
