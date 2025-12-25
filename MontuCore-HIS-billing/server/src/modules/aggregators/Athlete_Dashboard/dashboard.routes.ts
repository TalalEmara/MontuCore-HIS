import express, { Router } from 'express';
import * as dashboardController from './dashboard.controller.js';

const router: Router = express.Router();

/**
 * @route   GET /api/dashboard/athlete/:athleteId
 * @desc    Get comprehensive athlete dashboard data
 * @desc    Returns upcoming appointments, cases (report), treatments (prescriptions), exams (imaging), and lab tests (tests)
 * @access  Public (to be protected with auth in production)
 * @params  athleteId - The ID of the athlete
 */
router.get('/dashboard/:athleteId', dashboardController.getAthleteDashboard);

export default router;
