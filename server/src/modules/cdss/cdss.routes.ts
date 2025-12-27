import express, { Router } from 'express';
import * as cdssController from './cdss.controller.js';

const router: Router = express.Router();

// Note: Legacy /analyze and /sport-risks routes removed
// Main CDSS functionality is now in /analyze-dicom endpoint

/**
 * @route   POST /api/cdss/analyze-dicom
 * @desc    Analyze DICOM images with AI models (ACL, Meniscus detection)
 * @access  Public
 * 
 * @example Request Body:
 * {
 *   "dicomUrls": [
 *     "https://your-supabase-url.com/storage/v1/object/public/dicom-bucket/slice1.dcm",
 *     "https://your-supabase-url.com/storage/v1/object/public/dicom-bucket/slice2.dcm",
 *     "https://your-supabase-url.com/storage/v1/object/public/dicom-bucket/slice3.dcm"
 *   ],
 *   "patientId": 6,
 *   "examId": 1
 * }
 */
router.post('/analyze-dicom', cdssController.analyzeDicom);

export default router;
