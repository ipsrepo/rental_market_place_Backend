const User = require('../models/userModel');
const Favorite = require('../models/favoriteModel')
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require("../utils/appError");

exports.createFavorite = factory.createOne(Favorite);

exports.deleteFavorite = catchAsync(async (req, res, next) => {
    const {property, user} = req.body;

    console.log(property);
    console.log(user);

    const favorite = await Favorite.findOneAndDelete({user, property});

    if (!favorite) {
        return next(new AppError('Favorite not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: 'Favorite removed successfully',
    });
});

exports.getAllFavorites = catchAsync(async (req, res, next) => {
    const { user } = req.query;
    console.log(user);

    const favorites = await Favorite.find({ user })
        .populate('property');

    res.status(200).json({
        status:  'success',
        results: favorites.length,
        data:    favorites,
    });
});