const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String },
    size: { type: Number },
    path: { type: String },
    url: { type: String },
    publicId: { type: String },
    provider: { type: String, enum: ['local', 'cloudinary'], default: 'local' },
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('File', fileSchema);
