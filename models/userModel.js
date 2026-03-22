const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [3, 'User name must have at least 3 characters'],
    maxlength: [100, 'User name must have less than 100 characters'],
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: [true, 'Email is required'],
    validate: [validator.isEmail, 'email should be valid'],
  },
  mobile: {
    type: String,
    unique: true,
    required: [true, 'Mobile number is required'],
    validate: {
      validator: (val) => validator.isMobilePhone(val),
      message: 'Please provide a valid mobile number',
    },
  },

  password: {
    type: String,
    required: [true, 'password is required'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password are not same',
    },
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// Middleware - Run only when password modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12); // Hash the password with cost 12
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre(/^find/, function (next) {
  console.log('Run before query execution');
  this.find({ active: { $ne: false } });
  next();
});

// Instance method to compare the password
userSchema.methods.validatePassword = async function (
  enteredPassword,
  actualUserPassword,
) {
  return await bcrypt.compare(enteredPassword, actualUserPassword);
};

// Compare password modified date with token generated date
// TO validate if user changed password after token generated
userSchema.methods.validatePasswordModification = function (JWTTimeStamp) {
  if (this.passwordModifiedAt) {
    const modifiedTimeStampTime = parseInt(
      this.passwordModifiedAt.getTime() / 1000,
      10,
    );

    return JWTTimeStamp < modifiedTimeStampTime;
  }

  // False means No changes in password
  return false;
};

// Generate Hash based on token
userSchema.methods.generateHashBasedOnToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

// Model
const User = mongoose.model('User', userSchema);

module.exports = User;
