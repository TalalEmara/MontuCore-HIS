import express, { Router } from 'express';
import * as treatmentController from './treatment.controller.js';

const router: Router = express.Router();

/**
 * @route   GET /api/treatments
 * @desc    Get treatments with filters (athleteId, caseId, type) and pagination
 * @access  Public (to be protected with auth in production)
 * @query   athleteId, caseId, type, page, limit
 */
router.get('/', treatmentController.getTreatments);

export default router;
