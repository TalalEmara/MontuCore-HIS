import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Configure multer for DICOM file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads/dicom';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

export const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept DICOM files (often have .dcm extension or no extension)
    if (
      file.mimetype === 'application/dicom' || 
      file.originalname.toLowerCase().endsWith('.dcm')
    ) {
      cb(null, true);
    } else {
      // Accept anyway, DICOM files may have no extension
      cb(null, true);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max file size
  }
});
