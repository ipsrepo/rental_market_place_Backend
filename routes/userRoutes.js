const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Middleware to protect the routes
// router.use(authController.protectRoute);

// Below code execute only above middleware code passed

router.patch('/updatePassword', authController.updatePassword);

router.patch('/updateProfile', userController.updateProfile);
router.delete('/deactivateUser', userController.deactivateUser);

router.get('/me', userController.getMe, userController.getUser);

// Middleware to give access to only admin
// router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .delete(userController.deleteUser);

module.exports = router;
