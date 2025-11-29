const express = require('express');
const router = express.Router();
const imagingController = require('./imaging.controller');
const { authenticateToken } = require('../../middleware/auth');

/**
 * @route   POST /api/imaging
 * @desc    Create a new imaging order
 * @access  Private
 */
router.post('/', authenticateToken, imagingController.createImagingOrder);

/**
 * @route   GET /api/imaging
 * @desc    Get all imaging orders
 * @access  Private
 */
router.get('/', authenticateToken, imagingController.getAllImagingOrders);

/**
 * @route   GET /api/imaging/:id
 * @desc    Get imaging order by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, imagingController.getImagingOrderById);

/**
 * @route   PUT /api/imaging/:id
 * @desc    Update imaging order
 * @access  Private
 */
router.put('/:id', authenticateToken, imagingController.updateImagingOrder);

/**
 * @route   POST /api/imaging/:id/results
 * @desc    Upload imaging results
 * @access  Private
 */
router.post('/:id/results', authenticateToken, imagingController.uploadImagingResults);

module.exports = router;
