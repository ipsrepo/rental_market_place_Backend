const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const filterObj = (body, ...filteredKeys) => {
  const newObj = {};
  Object.keys(body).forEach((key) => {
    if (filteredKeys.includes(key)) {
      newObj[key] = body[key];
    }
  });

  return body;
};

exports.getAllUsers = factory.getAll(User);

exports.updateProfile = catchAsync(async (req, res, next) => {
  // return error if the changes are password
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError('Please use password update, This is for profile only', 401),
    );
  }

  // 2. Filtered out unwanted fields names that are not allowed
  const profileData = filterObj(req.body, 'name', 'email');

  // 3. Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, profileData, {
    new: true,
    runValidators: true,
  });

  // const user = await Tour.find().where('duration').gte(10);
  res.status(200).json({
    status: 'success',
    data: updatedUser,
  });
});

// Deactivate User
exports.deactivateUser = catchAsync(async (req, res, next) => {
  // return error if the changes are password
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

//Middleware to get current user details by setting user id
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// Do Not update password with this
exports.updateUser = factory.updateOne(User);
exports.getUser = factory.getOne(User);
exports.deleteUser = factory.deleteOne(User);

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    data: 'This route is not implemented',
  });
};
