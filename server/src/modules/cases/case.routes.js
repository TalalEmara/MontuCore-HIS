const express = require('express');
const router = express.Router();
const caseController = require('./case.controller');
const { authenticateToken } = require('../../middleware/auth');

/**
 * @route   POST /api/cases
 * @desc    Create a new case
 * @access  Private
 */
router.post('/', authenticateToken, caseController.createCase);

/**
 * @route   GET /api/cases
 * @desc    Get all cases
 * @access  Private
 */
router.get('/', authenticateToken, caseController.getAllCases);

/**
 * @route   GET /api/cases/:id
 * @desc    Get case by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, caseController.getCaseById);

/**
 * @route   PUT /api/cases/:id
 * @desc    Update case
 * @access  Private
 */
router.put('/:id', authenticateToken, caseController.updateCase);

/**
 * @route   DELETE /api/cases/:id
 * @desc    Delete case
 * @access  Private
 */
router.delete('/:id', authenticateToken, caseController.deleteCase);

module.exports = router;
