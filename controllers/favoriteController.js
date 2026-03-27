const User = require('../models/userModel');
const Favorite = require('../models/favoriteModel')
const factory = require('./handlerFactory');

exports.createFavorite = factory.createOne(Favorite);
exports.deleteFavorite = factory.deleteOne(Favorite);
exports.getAllFavorites = factory.getAll(User);