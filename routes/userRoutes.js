const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Middleware to give access to only admin
// router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)

router
  .route('/:id')
  .get(userController.getUser)
  .delete(userController.deleteUser);

module.exports = router;
