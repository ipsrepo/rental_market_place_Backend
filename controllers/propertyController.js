const Property = require('../models/propertyModel');
const factory = require('./handlerFactory');

exports.processImages = (req, res, next) => {
    const boolFields = ['isprivatebathroom', 'issharedbed', 'billsincluded', 'furnished', 'isnew', 'available'];
    boolFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            req.body[field] = req.body[field] === 'true';
        }
    });

    if (req.body.price)     req.body.price     = Number(req.body.price);
    if (req.body.bedrooms)  req.body.bedrooms  = Number(req.body.bedrooms);
    if (req.body.bathrooms) req.body.bathrooms = Number(req.body.bathrooms);

    if (req.files && req.files.length > 0) {
        const [primary, ...rest] = req.files;
        req.body.primaryimage = primary.path;
        req.body.images       = rest.map((f) => f.path);
    }

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