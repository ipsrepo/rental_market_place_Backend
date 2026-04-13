const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const Property = require('./propertyModel');

const userSchema = new mongoose.Schema({
        name: {
            type: String,
            required: [true, 'Name is required'],
            minlength: [3, 'User name must have at least 3 characters'],
            maxlength: [100, 'User name must have less than 100 characters'],
        },
        email: {
            type: String,
            unique: true,
            lowercase: true,
            required: [true, 'Email is required'],
            validate: [validator.isEmail, 'email should be valid'],
        },
        mobile: {
            type: String,
            unique: true,
            required: [true, 'Mobile number is required'],
        },
        savedProperty: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'Property',
            },
        ],

        password: {
            type: String,
            required: [true, 'password is required'],
            select: false,
        },
        passwordConfirm: {
            type: String,
            required: [true, 'Please confirm password'],
            validate: {
                validator: function (el) {
                    return el === this.password;
                },
                message: 'Password are not same',
            },
        },
        active: {
            type: Boolean,
            default: true,
            select: false,
        },
    },
    {
        timestamps: true,
        toJSON: {virtuals: true},
        toObject: {virtuals: true},
    }
);

userSchema.pre(/^find/, function (next) {
    console.log('Run before query execution');
    this.find({active: {$ne: false}});
    next();
});

// Instance method to compare the password
userSchema.methods.validatePassword = async function (
    enteredPassword,
    actualUserPassword,
) {
    return await bcrypt.compare(enteredPassword, actualUserPassword);
};

// Generate Hash based on token
userSchema.methods.generateHashBasedOnToken = (token) =>
    crypto.createHash('sha256').update(token).digest('hex');

// Model
const User = mongoose.model('User', userSchema);

module.exports = User;
