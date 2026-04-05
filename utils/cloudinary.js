const cloudinary = require('cloudinary').v2;
const {CloudinaryStorage} = require('multer-storage-cloudinary');
const multer = require('multer');

// ── Debug — remove after it works ────────────────────────────────────────────
console.log('CLOUDINARY_NAME:', process.env.CLOUDINARY_NAME);
console.log('CLOUDINARY_KEY: ', process.env.CLOUDINARY_KEY);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'rent-market/properties',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{width: 1200, height: 800, crop: 'limit', quality: 'auto'}],
    },
});

const upload = multer({
    storage,
    limits: {fileSize: 5 * 1024 * 1024},
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only image files are allowed'), false);
    },
});

module.exports = {upload, cloudinary};