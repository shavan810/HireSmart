const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');

const ensureConfigured = () => {
  if (!isCloudinaryConfigured()) {
    throw new ApiError(503, 'File storage is not configured. Add Cloudinary keys to backend/.env');
  }
};

// Streams an in-memory buffer to Cloudinary.
const uploadBuffer = (buffer, options) => {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(new ApiError(502, `Upload failed: ${err.message}`));
      return resolve(result);
    });
    stream.end(buffer);
  });
};

const uploadResume = (buffer, userId) =>
  uploadBuffer(buffer, {
    folder: 'hiresmart/resumes',
    resource_type: 'raw', // PDFs are stored as raw files
    public_id: `${userId}_${Date.now()}.pdf`,
    use_filename: false,
  });

const uploadImage = (buffer, userId) =>
  uploadBuffer(buffer, {
    folder: 'hiresmart/avatars',
    resource_type: 'image',
    public_id: `${userId}_${Date.now()}`,
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'auto' }, { quality: 'auto', fetch_format: 'auto' }],
  });

// Best-effort cleanup: failing to delete an old file must never break the request.
const deleteAsset = async (publicId, resourceType = 'image') => {
  if (!publicId || !isCloudinaryConfigured()) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.warn('Cloudinary cleanup failed:', err.message);
  }
};

module.exports = { uploadResume, uploadImage, deleteAsset };
