import express, { Router } from 'express';
import * as cdssController from './cdss.controller.js';

const router: Router = express.Router();

/**
 * @route   POST /api/cdss/analyze
 * @desc    Analyze imaging findings with CDSS
 * @access  Public
 * 
 * @example Request Body:
 * {
 *   "athlete": {
 *     "name": "John Doe",
 *     "age": 22,
 *     "sport": "soccer"
 *   },
 *   "imaging": {
 *     "type": "musculoskeletal",
 *     "findings": "ACL tear detected",
 *     "severity": "high"
 *   }
 * }
 */
router.post('/analyze', cdssController.analyzeImaging);

/**
 * @route   GET /api/cdss/sport-risks/:sport
 * @desc    Get common injuries for a specific sport
 * @access  Public
 */
router.get('/sport-risks/:sport', cdssController.getSportRisks);

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
