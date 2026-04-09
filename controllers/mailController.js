const Property = require('../models/propertyModel');
const {sendEnquiryEmail} = require('../services/mail.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// POST /api/mail/:propertyId
exports.sendMail = catchAsync(async (req, res, next) => {


    const {name, email, mobile, details} = req.body;

    // Validate required fields
    if (!name || !email || !mobile) {
        return next(new AppError('Name, email and mobile are required', 400));
    }

    // Find property and populate owner email
    const property = await Property.findById(req.params.propertyId)
        .populate('owner', 'name email');

    console.log(property);

    if (!property) {
        return next(new AppError('Property not found', 404));
    }

    if (!property.owner?.email) {
        return next(new AppError('Could not find owner contact details', 404));
    }

    await sendEnquiryEmail({
        ownerEmail: property.owner.email,
        ownerName: property.owner.name,
        propertyTitle: property.title,
        propertyLocation: property.location,
        senderName: name,
        senderEmail: email,
        senderMobile: mobile,
        details: details || null,
    });

    res.status(200).json({
        status: 'success',
        message: 'Your enquiry has been sent to the property owner',
    });
});