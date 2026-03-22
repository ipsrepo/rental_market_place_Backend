const Property = require('../models/propertyModel');
const factory = require('./handlerFactory');

exports.createProperty = factory.createOne(Property);
exports.updateProperty = factory.updateOne(Property);
exports.deleteProperty = factory.deleteOne(Property);
exports.getProperty = factory.getOne(Property);
exports.getAllProperties = factory.getAll(Property);