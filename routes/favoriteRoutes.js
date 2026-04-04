const express = require('express');
const favoriteController = require('../controllers/favoriteController');

const router = express.Router();

router
    .route('/')
    .get(favoriteController.getAllFavorites)
    .delete(favoriteController.deleteFavorite)
    .post(favoriteController.createFavorite);

module.exports = router;
