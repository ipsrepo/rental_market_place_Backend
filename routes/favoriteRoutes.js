const express = require('express');
const favoriteController = require('../controllers/favoriteController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protectRoute);

router
    .route('/')
    .get(favoriteController.getAllFavorites)
    .delete(favoriteController.deleteFavorite)
    .post(favoriteController.createFavorite);

module.exports = router;
