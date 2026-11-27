const path = require('path');
const multer = require('multer');
const ApiError = require('../utils/ApiError');

// Files are kept in memory and streamed straight to Cloudinary: nothing is
// written to the server disk, which keeps the API stateless and deployable
// on read-only hosts.
const storage = multer.memoryStorage();

const resumeUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const isPdf = file.mimetype === 'application/pdf' && path.extname(file.originalname).toLowerCase() === '.pdf';
    cb(isPdf ? null : new ApiError(400, 'Only PDF files are allowed for resumes'), isPdf);
  },
}).single('resume');

const imageUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 }, // 2 MB
  fileFilter: (_req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
    cb(ok ? null : new ApiError(400, 'Only JPG, PNG or WEBP images are allowed'), ok);
  },
}).single('image');

// Defence in depth: the mimetype comes from the client, so also check the
// file's magic bytes.
const assertPdfSignature = (buffer) => {
  if (!buffer || buffer.slice(0, 5).toString() !== '%PDF-') {
    throw new ApiError(400, 'The uploaded file is not a valid PDF');
  }
};

const assertImageSignature = (buffer) => {
  const hex = buffer.slice(0, 12).toString('hex');
  const isJpg = hex.startsWith('ffd8ff');
  const isPng = hex.startsWith('89504e47');
  const isWebp = buffer.slice(0, 4).toString() === 'RIFF' && buffer.slice(8, 12).toString() === 'WEBP';
  if (!isJpg && !isPng && !isWebp) throw new ApiError(400, 'The uploaded file is not a valid image');
};

module.exports = { resumeUpload, imageUpload, assertPdfSignature, assertImageSignature };
