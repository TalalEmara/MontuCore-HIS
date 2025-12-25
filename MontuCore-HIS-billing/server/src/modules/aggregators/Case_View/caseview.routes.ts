import express, { Router } from 'express';
import * as caseViewController from './caseview.controller.js';

const router: Router = express.Router();

/**
 * @route   GET /api/case-view/:caseId
 * @desc    Get comprehensive case view data
 * @desc    Returns all related data: case details, appointments, treatments, physio programs, lab tests, and exams
 * @access  Public (to be protected with auth in production)
 * @params  caseId - The ID of the case to retrieve
 */
router.get('/:caseId', caseViewController.getCaseView);

export default router;
