import express, { Router } from 'express';
import * as caseController from './case.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router: Router = express.Router();

/**
 * @route   POST /api/cases
 * @desc    Create a new case
 * @access  Private
 */
router.post('/', caseController.createCase);    // No auth for demo purposes (to be fixed later)

/**
 * @route   GET /api/cases
 * @desc    Get all cases
 * @access  Private
 */
router.get('/', caseController.getAllCases);    // No auth for demo purposes (to be fixed later)

/**
 * @route   GET /api/cases/:id
 * @desc    Get case by ID
 * @access  Private
 */
router.get('/:id', caseController.getCaseById);   // No auth for demo purposes (to be fixed later)

/**
 * @route   PATCH /api/cases/:id
 * @desc    Update case (partial update)
 * @access  Private
 */
router.patch('/:id', caseController.updateCase);  // No auth for demo purposes (to be fixed later) authenticateToken

/**
 * @route   DELETE /api/cases/:id
 * @desc    Delete case
 * @access  Private
 */
router.delete('/:id', caseController.deleteCase);

export default router;
