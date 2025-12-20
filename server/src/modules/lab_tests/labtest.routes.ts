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

/**
 * @route   POST /api/lab-tests
 * @desc    Create a new lab test
 * @access  Public (to be protected with auth in production)
 */
router.post('/', labTestController.createLabTest);

/**
 * @route   GET /api/lab-tests/:id
 * @desc    Get lab test by ID
 * @access  Public (to be protected with auth in production)
 */
router.get('/:id', labTestController.getLabTestById);

/**
 * @route   PUT /api/lab-tests/:id
 * @desc    Update lab test
 * @access  Public (to be protected with auth in production)
 */
router.put('/:id', labTestController.updateLabTest);

export default router;
