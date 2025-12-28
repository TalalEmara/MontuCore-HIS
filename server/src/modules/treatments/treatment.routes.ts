import express, { Router } from 'express';
import * as treatmentController from './treatment.controller.js';

const router: Router = express.Router();

router.get('/', treatmentController.getTreatments);
router.post('/', treatmentController.createTreatment);
router.get('/:id', treatmentController.getTreatments);
router.put('/:id', treatmentController.updateTreatment);

/**
 * @route   GET /api/treatments/athlete/:athleteId
 * @desc    Get treatments for a specific athlete
 * @access  Public (to be protected with auth in production)
 * @query   page, limit
 */
router.get('/athlete/:athleteId', treatmentController.getTreatmentsByAthlete);

/**
 * @route   GET /api/treatments/case/:caseId
 * @desc    Get treatments for a specific case
 * @access  Public (to be protected with auth in production)
 * @query   page, limit
 */
router.get('/case/:caseId', treatmentController.getTreatmentsByCase);

/**
 * @route   POST /api/treatments
 * @desc    Create a new treatment
 * @access  Public (to be protected with auth in production)
 */
router.post('/', treatmentController.createTreatment);

/**
 * @route   PUT /api/treatments/:id
 * @desc    Update an existing treatment
 * @access  Public (to be protected with auth in production)
 */
router.put('/:id', treatmentController.updateTreatment);

/**
 * @route   DELETE /api/treatments/:id
 * @desc    Delete a treatment
 * @access  Public (to be protected with auth in production)
 */
router.delete('/:id', treatmentController.deleteTreatment);

export default router;

