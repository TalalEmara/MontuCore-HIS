import express, { Router } from 'express';
import * as dashboardController from './dashboard.controller.js';

const router: Router = express.Router();

/**
 * @route   GET /api/dashboard/physician/:clinicianId
 * @desc    Get comprehensive physician dashboard data
 * @desc    Returns today's appointments, critical cases, and active cases with pagination
 * @access  Public (to be protected with auth in production)
 * @params  clinicianId - The ID of the clinician
 * @query   page - Page number for active cases (default: 1)
 * @query   limit - Items per page for active cases (default: 10)
 */
router.get('/dashboard/:clinicianId', dashboardController.getPhysicianDashboard);

export default router;
