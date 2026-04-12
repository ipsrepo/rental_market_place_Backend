const express = require('express');
const mailController = require('../controllers/mailController');
const authController = require("../controllers/authController");

const router = express.Router();

router.post('/:propertyId', authController.protectRoute, mailController.sendMail);

module.exports = router;