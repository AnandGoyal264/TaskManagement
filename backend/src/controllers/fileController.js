const fs = require('fs');
const path = require('path');
const File = require('../models/File');
const Task = require('../models/Task');
const util = require('util');
const axios = require('axios');

const writeFileAsync = util.promisify(fs.writeFile);
const mkdirAsync = util.promisify(fs.mkdir);

exports.uploadFiles = async (req, res, next) => {
  try {
    const files = req.files || [];
    const { taskId } = req.body;

    if (!files.length) return res.status(400).json({ success: false, message: 'No files uploaded' });

    const saved = [];
    const { cloudinary, isConfigured } = require('../config/cloudinary');

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      await mkdirAsync(uploadsDir, { recursive: true });
    }

    for (const f of files) {
      // Log upload info for debugging
      console.info('Uploading file', { originalname: f.originalname, mimetype: f.mimetype, size: f.size, uploader: req.user.id, taskId });

      try {
        // If Cloudinary is configured, upload to cloud
        if (isConfigured && f.buffer) {
          const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({ resource_type: 'auto', folder: 'tasks' }, (err, result) => {
              if (err) return reject(err);
              resolve(result);
            });
            stream.end(f.buffer);
          });

          console.info('Cloudinary upload result', { public_id: uploadResult.public_id, secure_url: uploadResult.secure_url });

          const fileDoc = await File.create({
            filename: f.originalname,
            originalName: f.originalname,
            mimeType: f.mimetype,
            size: f.size,
            path: null,
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            provider: 'cloudinary',
            uploader: req.user.id,
            task: taskId || null,
          });

          if (taskId) {
            await Task.updateOne({ _id: taskId }, { $push: { files: fileDoc._id } });
          }

          saved.push(fileDoc);
        } else if (f.buffer) {
          // Save locally from buffer when Cloudinary is not configured
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(f.originalname);
          const filename = unique + ext;
          const filePath = path.join(uploadsDir, filename);

          await writeFileAsync(filePath, f.buffer);

          console.info('Local file saved', { filename, filePath });

          const fileDoc = await File.create({
            filename: filename,
            originalName: f.originalname,
            mimeType: f.mimetype,
            size: f.size,
            path: `uploads/${filename}`,
            provider: 'local',
            uploader: req.user.id,
            task: taskId || null,
          });

          if (taskId) {
            await Task.updateOne({ _id: taskId }, { $push: { files: fileDoc._id } });
          }
          saved.push(fileDoc);
        } else {
          console.warn('File has no buffer, skipping:', f.originalname);
        }
      } catch (fileErr) {
        console.error('Error uploading individual file:', f.originalname, fileErr.message);
        // Continue with next file instead of failing entire upload
      }
    }

    if (!saved.length) {
      return res.status(400).json({ success: false, message: 'No files were successfully uploaded' });
    }

    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    console.error('Upload handler error:', err);
    next(err);
  }
};

exports.getFilesByTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const files = await File.find({ task: taskId }).populate('uploader', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, data: files });
  } catch (err) {
    next(err);
  }
};

// Return a direct URL for cloud files (requires auth). For local files, return null so client will fetch blob via authenticated request.
exports.getFileUrl = async (req, res, next) => {
  try {
    const { id } = req.params;
    const file = await File.findById(id);
    if (!file) return res.status(404).json({ success: false, message: 'File not found' });

    // If file is stored in Cloudinary, return a URL
    if (file.provider === 'cloudinary' && (file.publicId || file.url)) {
      let url = file.url; // Use stored URL first

      if (!url && file.publicId) {
        const { cloudinary, isConfigured } = require('../config/cloudinary');
        if (isConfigured) {
          try {
            // Generate unsigned URL for public access (simpler and more reliable)
            url = cloudinary.url(file.publicId, { resource_type: 'auto', secure: true, type: 'upload' });
          } catch (e) {
            console.warn('Failed to generate cloudinary url', e.message);
          }
        }
      }

      if (url) {
        return res.json({ success: true, data: { url } });
      }
      
      return res.status(404).json({ success: false, message: 'No URL available' });
    }

    return res.json({ success: true, data: { url: null } });
  } catch (err) {
    next(err);
  }
};

// exports.downloadFile = async (req, res, next) => {
//   console.log("request is getting");
//   try {
//     const { id } = req.params;
//     const file = await File.findById(id);
//     if (!file) return res.status(404).json({ success: false, message: 'File not found' });
//       console.log(file.url);
//     // If stored on Cloudinary, fetch and send the file
//     if (file.provider === 'cloudinary' && (file.publicId || file.url)) {
//       let downloadUrl = file.url;

//       if (!downloadUrl && file.publicId) {
//         const { cloudinary, isConfigured } = require('../config/cloudinary');
//         if (isConfigured) {
//           // Generate unsigned URL for direct access
//           console.log(downloadUrl);
//           downloadUrl = cloudinary.url(file.publicId, { resource_type: 'auto', secure: true, type: 'upload' });
//           console.log(downloadUrl);
//           // Generate unsigned URL for direct access


//         }
//       }

//      /* if (downloadUrl) {
//         try {
//           console.info('Downloading from Cloudinary:', { url: downloadUrl, fileName: file.originalName });

//           // Fetch file from Cloudinary as buffer with timeout
//           const response = await axios.get(downloadUrl, {
//             responseType: 'stream',
//             timeout: 30000, // 30 second timeout
//             headers: { 'User-Agent': 'Node.js' }
//           });

//           const buffer = response.data;
//           console.info('Downloaded from Cloudinary:', { fileName: file.originalName, size: buffer.length });

//           // Set response headers
//           res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
//           //res.setHeader('Content-Length', buffer.length);
//           res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName || 'download')}"`);

//           // Send buffer directly
//           //return res.send(buffer);
//         } catch (err) {
//           console.error('Failed to download from Cloudinary:', {
//             message: err.message,
//             code: err.code,
//             status: err.response?.status,
//             statusText: err.response?.statusText,
//             fileName: file.originalName
//           });
//           return res.status(502).json({ 
//             success: false, 
//             message: `Failed to fetch file from cloud: ${err.message}`,
//             details: {
//               status: err.response?.status,
//               statusText: err.response?.statusText,
//               url: downloadUrl
//             }
//           });
//         }
//       }*/if (downloadUrl) {
//   try {
//     console.info('Downloading from Cloudinary:', {
//       url: downloadUrl,
//       fileName: file.originalName
//     });

//     const response = await axios.get(downloadUrl, {
//       responseType: 'stream', // ✅ correct
//       timeout: 30000
//     });

//     // Set headers BEFORE piping
//     res.setHeader(
//       'Content-Type',
//       response.headers['content-type'] ||
//         file.mimeType ||
//         'application/octet-stream'
//     );

//     res.setHeader(
//       'Content-Disposition',
//       `attachment; filename="${encodeURIComponent(
//         file.originalName || 'download'
//       )}"`
//     );

//     // ✅ THIS IS THE KEY LINE
//     return response.data.pipe(res);

//   } catch (err) {
//     console.error('Failed to download from Cloudinary:', {
//       message: err.message,
//       code: err.code,
//       status: err.response?.status,
//       statusText: err.response?.statusText,
//       fileName: file.originalName
//     });

//     return res.status(502).json({
//       success: false,
//       message: `Failed to fetch file from cloud: ${err.message}`
//     });
//   }
// }

//       else {
//         return res.status(404).json({ success: false, message: 'No download URL available' });
//       }
//     }

//     // Local file fallback
//     if (file.path) {
//       const filePath = path.resolve(process.cwd(), file.path);
//       console.info('Attempting to download local file', { filePath, exists: fs.existsSync(filePath), storedPath: file.path });
      
//       if (!fs.existsSync(filePath)) {
//         console.warn('Local file not found:', filePath);
//         return res.status(404).json({ success: false, message: 'File missing on server' });
//       }

//       const fileStats = fs.statSync(filePath);
//       res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
//       res.setHeader('Content-Length', fileStats.size);
//       res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName || 'download')}"`);
      
//       console.info('Streaming local file', { filePath, size: fileStats.size, mimeType: file.mimeType });
      
//       const fileStream = fs.createReadStream(filePath);
//       fileStream.on('error', (err) => {
//         console.error('Stream error reading local file:', err);
//         if (!res.headersSent) {
//           res.status(500).json({ success: false, message: 'Error reading file' });
//         }
//       });
      
//       return fileStream.pipe(res);
//     }

//     return res.status(404).json({ success: false, message: 'File has no location information' });
//   } catch (err) {
//     console.error('Download handler error:', err);
//     next(err);
//   }
// };
exports.downloadFile = async (req, res, next) => {
  try {
    console.log('request is getting');

    const { id } = req.params;
    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // ===============================
    // ✅ CLOUDINARY FILE
    // ===============================
    if (file.provider === 'cloudinary' && file.url) {
      console.log('Downloading from Cloudinary:', {
        url: file.url,
        fileName: file.originalName
      });

      try {
        const response = await axios.get(file.url, {
          responseType: 'stream',
          timeout: 30000
        });

        res.setHeader(
          'Content-Type',
          response.headers['content-type'] ||
            file.mimeType ||
            'application/octet-stream'
        );

        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${encodeURIComponent(
            file.originalName || 'download'
          )}"`
        );

        return response.data.pipe(res);
      } catch (err) {
        console.error('Cloudinary download failed:', {
          status: err.response?.status,
          message: err.message,
          url: file.url
        });

        return res.status(502).json({
          success: false,
          message: 'Failed to download file from Cloudinary'
        });
      }
    }

    // ===============================
    // ✅ LOCAL FILE FALLBACK
    // ===============================
    if (file.path) {
      const filePath = path.resolve(process.cwd(), file.path);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Local file not found'
        });
      }

      const stats = fs.statSync(filePath);

      res.setHeader(
        'Content-Type',
        file.mimeType || 'application/octet-stream'
      );
      res.setHeader('Content-Length', stats.size);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(
          file.originalName || 'download'
        )}"`
      );

      return fs.createReadStream(filePath).pipe(res);
    }

    return res.status(404).json({
      success: false,
      message: 'File has no location information'
    });
  } catch (err) {
    console.error('Download handler error:', err);
    next(err);
  }
};


exports.deleteFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const file = await File.findById(id);
    if (!file) return res.status(404).json({ success: false, message: 'File not found' });

    // Only uploader or admin can delete
    if (String(file.uploader) !== String(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // Remove from task files
    if (file.task) {
      await Task.updateOne({ _id: file.task }, { $pull: { files: file._id } });
    }

    // If stored on Cloudinary, delete from cloud
    const { cloudinary, isConfigured } = require('../config/cloudinary');
    if (file.provider === 'cloudinary' && file.publicId && isConfigured) {
      try {
        await cloudinary.uploader.destroy(file.publicId, { resource_type: 'auto' });
      } catch (e) {
        console.warn('Failed to delete file from cloud', e.message);
      }
    }

    // Remove from fs if present
    if (file.path) {
      try {
        fs.unlinkSync(path.resolve(file.path));
      } catch (e) {
        // log and continue
        console.warn('Failed to delete file from disk', e.message);
      }
    }

    await File.deleteOne({ _id: file._id });
    res.json({ success: true, message: 'File deleted' });
  } catch (err) {
    next(err);
  }
};
