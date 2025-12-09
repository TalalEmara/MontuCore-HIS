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

export default router;
