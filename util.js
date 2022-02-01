const multer = require("multer");
const fs = require('fs');

const storageConfig = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'C:/Users/Akbar/Downloads/shell-upload');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    },
});

exports.handleFileUpload = multer({
    storage: storageConfig
}).array('files', 20);