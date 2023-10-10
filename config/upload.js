const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/image');
    },
    filename: (req, file, cb) => {
        const fileName = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
        cb(null, fileName);
    }
});

const upload = multer({ storage: storage });

module.exports = upload;

