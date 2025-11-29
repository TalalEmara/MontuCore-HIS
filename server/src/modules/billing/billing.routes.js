const express = require('express');
const router = express.Router();
const billingController = require('./billing.controller');
const { authenticateToken } = require('../../middleware/auth');

/**
 * @route   POST /api/billing/invoices
 * @desc    Create a new invoice
 * @access  Private
 */
router.post('/invoices', authenticateToken, billingController.createInvoice);

/**
 * @route   GET /api/billing/invoices
 * @desc    Get all invoices
 * @access  Private
 */
router.get('/invoices', authenticateToken, billingController.getAllInvoices);

/**
 * @route   GET /api/billing/invoices/:id
 * @desc    Get invoice by ID
 * @access  Private
 */
router.get('/invoices/:id', authenticateToken, billingController.getInvoiceById);

/**
 * @route   PUT /api/billing/invoices/:id
 * @desc    Update invoice
 * @access  Private
 */
router.put('/invoices/:id', authenticateToken, billingController.updateInvoice);

/**
 * @route   POST /api/billing/invoices/:id/payments
 * @desc    Record payment
 * @access  Private
 */
router.post('/invoices/:id/payments', authenticateToken, billingController.recordPayment);

/**
 * @route   GET /api/billing/patients/:patientId/summary
 * @desc    Get patient billing summary
 * @access  Private
 */
router.get('/patients/:patientId/summary', authenticateToken, billingController.getPatientBillingSummary);

module.exports = router;
