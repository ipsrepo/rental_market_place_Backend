const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_TOKEN, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  // cookie setup
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === ' production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined; // Remove the password from the output.
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check the email and password exists
  if (!email || !password)
    return next(new AppError('Please provide email and password', 400));

  // 2) Verify the email and password
  const user = await User.findOne({ email }).select('+password');

  // User has access for methods validatePassword
  if (!user || !(await user.validatePassword(password, user.password))) {
    // We should not specify email or password to confuse the hacker to generate combination
    return next(new AppError('Incorrect email and password', 401));
  }

  // 3) Send the toke to client
  createSendToken(user, 201, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get the user from collection
  const user = await User.findById(req.user.id).select('+password');
  // 2) Check if body password is correct
  if (!(await user.validatePassword(req.body.currentPassword, user.password))) {
    return next(
      new AppError(
        'You current password in wrong, Please enter right one!',
        401,
      ),
    );
  }
  // 3) if Yes update the password
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  //  4) Login User and send JWT
  await user.save();

  // 4) Login user and send JWT
  const token = signToken(user._id);

  res.status(201).json({
    status: 'success',
    token,
  });
});

// MIDDLEWARE to protect the routes
exports.protectRoute = catchAsync(async (req, res, next) => {
  // 1) Get the token exists
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError(
        'You do not have permission, Please login to access the data',
        401,
      ),
    );
  }
  // 2) Token verification
  const userDetailsBasedOnToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_TOKEN,
  );
  console.log(userDetailsBasedOnToken);

  // 3) Verify the user still exists
  const currentUser = await User.findById(userDetailsBasedOnToken.id);
  if (!currentUser)
    return next(
      new AppError('The User and Token not matching, Please login again!', 401),
    );
  // 4) Check if user changed password after the token was issued
  if (currentUser.validatePasswordModification(userDetailsBasedOnToken.iat)) {
    return next(
      new AppError('User recently changed password, Please login again!', 401),
    );
  }

  // Grand Access to the protected route
  req.user = currentUser;
  next();
});

