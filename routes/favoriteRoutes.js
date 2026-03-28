const express = require('express');
const favoriteController = require('../controllers/favoriteController');

const router = express.Router();

router
    .route('/')
    .get(favoriteController.getAllFavorites)
    .post(favoriteController.createFavorite);

router
    .route('/:id')
    .delete(favoriteController.deleteFavorite);

module.exports = router;
