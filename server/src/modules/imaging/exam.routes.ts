import express, { Router } from 'express';
import * as examController from './exam.controller.js';

const router: Router = express.Router();

/**
 * @route   GET /api/exams
 * @desc    Get exams with filters (athleteId, caseId, modality, status) and pagination
 * @access  Public (to be protected with auth in production)
 * @query   athleteId, caseId, modality, status, page, limit
 */
router.get('/', examController.getExams);

export default router;
