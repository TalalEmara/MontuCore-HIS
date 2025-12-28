import express, { Router } from 'express';
import * as appointmentController from './appointment.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router: Router = express.Router();

/***
 * @route POST /api/appointments
 * @desc Create a new appointment
 * @access Public
 */
router.post('/create-appointment', appointmentController.createAppointment);

/***
 * @route PUT /api/appointments
 * @desc Update Appointment Status
 * @access Public
 */
router.put('/update-appointment-status/', appointmentController.updateAppointmentStatus);

/***
 * @route PUT /api/appointments
 * @desc Update Appointment Details
 * @access Public
 */
router.post('/update-appointment-details/:appointmentId', appointmentController.updateAppointment);

/***
 * @route DELETE /api/appointments/
 * @desc Delete appointment
 * @access Public
 */
router.delete('/delete-appointment/:id', appointmentController.deleteAppointment);

/***
 * @route GET /api/appointments/
 * @desc Get all appointments
 * @query page, limit, status, athleteName, clinicianName, date, caseId
 * @access Public
 */
router.get('/', appointmentController.getAllAppointments);

/***
 * @route GET /api/appointments/
 * @desc Get all appointments by clinician
 * @query page, limit, status, caseId
 * @access Public
 */
router.get('/clinician/:clinicianId', appointmentController.getAppointmentsByClinicianId);

/***
 * @route GET /api/appointments/
 * @desc Get all appointments by athlete
 * @query page, limit, status, caseId
 * @access Public
 */
router.get('/athlete/:athleteId', appointmentController.getAppointmentsByAthleteId);

/***
 * @route PUT /api/appointments
 * @desc Update Appointment Status
 * @access Public
 */
router.get('/:id', appointmentController.getAppointmentById);




export default router;