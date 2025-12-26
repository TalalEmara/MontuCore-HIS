import express, { Router } from 'express';
import * as billingController from './billing.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router: Router = express.Router();

/***
 * @route POST /api/billing/invoices
 * @desc Create a new invoice
 * @access Protected
 */
router.post('/invoices', authenticateToken, billingController.createInvoice);

/***
 * @route GET /api/billing/invoices
 * @desc Get all invoices
 * @access Protected
 */
router.get('/invoices', authenticateToken, billingController.getAllInvoices);

/***
 * @route GET /api/billing/invoices/:id
 * @desc Get invoice by ID
 * @access Protected
 */
router.get('/invoices/:id', authenticateToken, billingController.getInvoiceById);

/***
 * @route GET /api/billing/invoices/case/:caseId
 * @desc Get invoice for a specific case
 * @access Protected
 */
router.get('/invoices/case/:caseId', authenticateToken, billingController.getInvoiceByCaseId);

export default router;

