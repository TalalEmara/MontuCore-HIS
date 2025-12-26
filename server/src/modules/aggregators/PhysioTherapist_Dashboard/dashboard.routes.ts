// route for the Physio Therapist Dashboard
import express, { Router } from 'express';
import * as dashboardController from './dashboard.controller.js';
const router: Router = express.Router();
/**
 * @route   GET /api/dashboard/physio-therapist/:physioId
 * @desc    Get physio therapist dashboard data
 * @desc    Returns all active cases and today's appointments for the physio therapist
 * @access  Public (to be protected with auth in production)
 * @params  physioId - The ID of the physio therapist
 **/

router.get('/dashboard/:physioId', dashboardController.getPhysioTherapistDashboard);
export default router;