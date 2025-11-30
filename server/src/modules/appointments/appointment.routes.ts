import express, { Router } from 'express';
import * as appointmentController from './appointment.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router: Router = express.Router();

/**
 * @route   POST /api/appointments
 * @desc    Create a new appointment
 * @access  Private
 */
router.post('/', authenticateToken, appointmentController.createAppointment);

/**
 * @route   GET /api/appointments
 * @desc    Get all appointments
 * @access  Private
 */
router.get('/', authenticateToken, appointmentController.getAllAppointments);

/**
 * @route   GET /api/appointments/:id
 * @desc    Get appointment by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, appointmentController.getAppointmentById);

/**
 * @route   PUT /api/appointments/:id
 * @desc    Update appointment
 * @access  Private
 */
router.put('/:id', authenticateToken, appointmentController.updateAppointment);

/**
 * @route   POST /api/appointments/:id/cancel
 * @desc    Cancel appointment
 * @access  Private
 */
router.post('/:id/cancel', authenticateToken, appointmentController.cancelAppointment);

export default router;
