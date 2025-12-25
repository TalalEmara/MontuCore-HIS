import express, { Router } from 'express';
import * as labTestController from './labtest.controller.js';

const router: Router = express.Router();

/**
 * @route   GET /api/lab-tests
 * @desc    Get lab tests with filters (athleteId, caseId, status, category) and pagination
 * @access  Public (to be protected with auth in production)
 * @query   athleteId, caseId, status, category, page, limit
 */
router.get('/', labTestController.getLabTests);

export default router;
