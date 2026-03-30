const express = require('express');
const favoriteController = require('../controllers/favoriteController');

const router = express.Router();

router
    .route('/')
    .delete(favoriteController.deleteFavorite)
    .post(favoriteController.createFavorite);

router
    .route('/:id')
    .get(favoriteController.getAllFavorites)

module.exports = router;
