const path = require('path');
const multer = require('multer');
const { isConfigured: isCloudConfigured } = require('../config/cloudinary');

let storage;

// Always use memoryStorage so files are available as buffers
// If Cloudinary is configured, we upload to cloud; otherwise save to local disk
storage = multer.memoryStorage();

// Accept common safe types; extend as needed
const allowedTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'application/x-rar-compressed',
];

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: ${allowedTypes.join(', ')}`));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB per file
  fileFilter,
});

module.exports = upload;
