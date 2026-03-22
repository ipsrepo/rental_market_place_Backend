const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Property title is required'],
            trim: true,
            minlength: [10, 'Title must have at least 10 characters'],
            maxlength: [150, 'Title cannot exceed 150 characters'],
        },
        details: {
            type: String,
            required: [true, 'Property details required.'],
            trim: true,
            maxlength: [2000, 'Details cannot exceed 2000 characters'],
        },

        location: {
            type: String,
            required: [true, 'Property must have a location'],
            trim: true,
        },

        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },

        pricedisplay: {
            type: String,
            enum: ['month', 'week'],
            default: 'month',
        },

        propertytype: {
            type: String,
            required: [true, 'Property must have a type'],
            enum: {
                values: ['studio', 'apartment', 'house'],
                message: '{VALUE} is not a supported property type',
            },
        },
        rentaltype: {
            type: String,
            enum: {
                values: ["entire_place", "private_room", "shared_room"],
                message: '{VALUE} is not a supported rental type',
            },
            default: 'whole',
        },

        bedrooms: {
            type: Number,
            min: [0, 'Bedrooms cannot be negative'],
        },
        bathrooms: {
            type: Number,
            min: [1, 'At least 1 bathroom required'],
        },
        isprivatebathroom: {
            type: Boolean,
            default: false,
        },
        issharedbed: {
            type: Boolean,
            default: false,
        },

        primaryimage: {
            type: String,
            required: [true, 'Primary image is required'],
        },
        images: {
            type: [String],
            default: [],
            validate: {
                validator: (arr) => arr.length <= 10,
                message: 'A property can have at most 10 images',
            },
        },

        isnew: {
            type: Boolean,
            default: false,
        },

        billsincluded: {
            type: Boolean,
            default: false,
        },

        furnished: {
            type: Boolean,
            default: true,
        },

        availablefrom: {
            type: Date,
            required: [true, 'Please specify available from date'],
        },

        available: {
            type: Boolean,
            default: true,
            index: true,
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Property must belong to an owner'],
            index: true,
        },

        berrating: {
            type: String,
            enum: ['a1','a2','a3','b1','b2','b3','c1','c2','c3','d1','d2','e1','e2','f','g','exempt'],
            lowercase: true,
            default: null,
        },

        active: {
            type: Boolean,
            default: true,
            select: false,
        },
    },
    {
        timestamps: true,
        toJSON:  { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Creating Index
PropertySchema.index(
    { title: 'text', details: 'text', location: 'text' },
    { weights: { title: 10, location: 5, details: 1 }, name: 'property_text_search' }
);

// index: available + location + price
PropertySchema.index({ available: 1, location: 1, price: 1 });

// by Created on
PropertySchema.index({ owner: 1, createdAt: -1 });

PropertySchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
});

const Property = mongoose.model('Property', PropertySchema);

module.exports = Property;