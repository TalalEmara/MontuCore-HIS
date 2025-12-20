import express, { Router } from 'express';
import * as cdssController from './cdss.controller.js';

const router: Router = express.Router();

// Note: Legacy /analyze and /sport-risks routes removed
// Main CDSS functionality is now in /analyze-dicom endpoint

/**
 * @route   POST /api/cdss/analyze-dicom
 * @desc    Analyze DICOM image with AI models (ACL, Meniscus detection)
 * @access  Public
 * 
 * @example Request Body:
 * {
 *   "dicomUrl": "https://your-supabase-url.com/storage/v1/object/public/dicom-bucket/scan123.dcm",
 *   "patientId": 6,
 *   "examId": 1
 * }
 */
router.post('/analyze-dicom', cdssController.analyzeDicom);

export default router;
