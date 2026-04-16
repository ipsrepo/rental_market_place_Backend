const Property = require('../models/propertyModel');
const factory = require('./handlerFactory');

exports.processImages = (req, res, next) => {
    const boolFields = ['isprivatebathroom', 'issharedbed', 'billsincluded', 'furnished', 'isnew', 'available'];
    boolFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            req.body[field] = req.body[field] === 'true';
        }
    });

    if (req.body.price) req.body.price = Number(req.body.price);
    if (req.body.bedrooms) req.body.bedrooms = Number(req.body.bedrooms);
    if (req.body.bathrooms) req.body.bathrooms = Number(req.body.bathrooms);

    const existingPrimary = req.body.existingPrimary || null;
    const existingImages = req.body.existingImages
        ? Array.isArray(req.body.existingImages)
            ? req.body.existingImages
            : [req.body.existingImages]
        : [];

    const newFiles = req.files || [];
    const newUrls = newFiles.map(f => f.path);

    const allImages = [...existingImages, ...newUrls];

    if (existingPrimary) {
        req.body.primaryimage = existingPrimary;
        req.body.images = allImages;
    } else if (newUrls.length > 0) {
        req.body.primaryimage = newUrls[0];
        req.body.images = [...existingImages, ...newUrls.slice(1)];
    }

    delete req.body.existingPrimary;
    delete req.body.existingImages;
    next();
};

exports.setOwnerFilter = (req, res, next) => {
    if (req.params.ownerId) {
        req.query.owner = req.params.ownerId;
    }
    next();
};

exports.getPropertiesByOwner = factory.getAll(Property);

exports.createProperty = factory.createOne(Property);
exports.updateProperty = factory.updateOne(Property);
exports.deleteProperty = factory.deleteOne(Property);
exports.getProperty = factory.getOne(Property);
exports.getAllProperties = factory.getAll(Property);