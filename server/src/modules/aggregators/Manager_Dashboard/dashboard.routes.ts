import express, { Router } from 'express';
import * as dashboardController from './dashboard.controller.js';
import { authenticateToken } from '../../../middleware/auth.js';

const router: Router = express.Router();

/**
 * @route   GET /api/dashboard/manager
 * @desc    Get manager dashboard analytics
 * @access  Protected
 */
router.get('/dashboard', authenticateToken, dashboardController.getManagerDashboard);

export default router;
