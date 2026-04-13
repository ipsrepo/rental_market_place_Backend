const express = require('express');

const propertyController = require('../controllers/propertyController');
const {upload} = require("../utils/cloudinary");
const authController = require("../controllers/authController");

const router = express.Router();

router
    .route('/')
    .get(propertyController.getAllProperties)
    .post(authController.protectRoute, upload.array('images', 10), propertyController.processImages, propertyController.createProperty);

router
    .route('/owner/:ownerId')
    .get(propertyController.setOwnerFilter, propertyController.getPropertiesByOwner);

router
    .route('/:id')
    .get(propertyController.getProperty)
    .patch(authController.protectRoute, upload.array('images', 10), propertyController.processImages, propertyController.updateProperty)
    .delete(authController.protectRoute, propertyController.deleteProperty);

module.exports = router;
