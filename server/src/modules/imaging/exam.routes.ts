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

/**
 * @route   POST /api/exams
 * @desc    Create a new exam
 * @access  Public (to be protected with auth in production)
 */
router.post('/', examController.createExam);

/**
 * @route   GET /api/exams/:id
 * @desc    Get exam by ID
 * @access  Public (to be protected with auth in production)
 */
router.get('/:id', examController.getExamById);

/**
 * @route   PUT /api/exams/:id
 * @desc    Update exam
 * @access  Public (to be protected with auth in production)
 */
router.put('/:id', examController.updateExam);

export default router;
