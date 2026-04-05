const express = require('express');

const propertyController = require('../controllers/propertyController');
const {upload} = require("../utils/cloudinary");

const router = express.Router();

router
    .route('/')
    .get(propertyController.getAllProperties)
    .post(upload.array('images', 10), propertyController.processImages, propertyController.createProperty);

router
    .route('/owner/:ownerId')
    .get(propertyController.setOwnerFilter, propertyController.getPropertiesByOwner);

router
    .route('/:id')
    .get(propertyController.getProperty)
    .patch(upload.array('images', 10), propertyController.processImages, propertyController.updateProperty)
    .delete(propertyController.deleteProperty);

module.exports = router;
