const mongoose = require("mongoose");
const User = require('./userModel');
const Property = require('./propertyModel');

const FavoriteSchema = new mongoose.Schema({
        property:
            {
                type: mongoose.Schema.ObjectId,
                ref: 'Property',
            },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Property must belong to an owner'],
        },
    },
    {
        timestamps: true,
        toJSON: {virtuals: true},
        toObject: {virtuals: true},
    }
);


const Favorite = mongoose.model('Favorite', FavoriteSchema);

module.exports = Favorite;