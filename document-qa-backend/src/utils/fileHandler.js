// src/utils/fileHandler.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config'); // Import configuration

// Ensure the upload directory exists
const uploadDir = path.join(__dirname, '..', '..', config.uploadDir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Created upload directory: ${uploadDir}`);
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Set the destination for uploaded files
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename to prevent overwrites
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Configure Multer upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.maxFileSize, // Set file size limit from config
  },
  fileFilter: (req, file, cb) => {
    // Filter files to only allow specified types (e.g., PDF)
    if (config.allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      // Pass an error if the file type is not allowed
      const error = new Error('Only PDF files are allowed!');
      error.statusCode = 400; // Custom status code for this error
      cb(error);
    }
  },
});

console.log(`ChromaDB will persist to: ${config.chromaPersistDir}`);
console.log(`Temporary uploads will go to: ${config.uploadDir}`);

module.exports = {
  upload,
};
