import express, { Router } from 'express';
import * as physioProgramController from './physioProgram.controller.js';
// import { authenticateToken } from '../../../middleware/auth.js';

const router: Router = express.Router();

/***
 * @route POST /api/physio-programs
 * @desc Create a new physio program
 * @access Admin, Clinician
 */
router.post('/', physioProgramController.createPhysioProgram);

/***
 * @route GET /api/physio-programs/:id
 * @desc Get physio program by ID
 * @access Admin, Clinician, Athlete (own case)
 */
router.get('/:id', physioProgramController.getPhysioProgramById);

/***
 * @route GET /api/physio-programs/case/:caseId
 * @desc Get physio programs by case ID
 * @access Admin, Clinician (managing), Athlete (own case)
 */
router.get('/case/:caseId', physioProgramController.getPhysioProgramsByCaseId);

/***
 * @route GET /api/physio-programs/clinician/:clinicianId
 * @desc Get physio programs by clinician ID
 * @access Admin, Clinician (own)
 */
router.get('/clinician/:clinicianId', physioProgramController.getPhysioProgramsByClinicianId);

/***
 * @route GET /api/physio-programs/athlete/:athleteId
 * @desc Get physio programs by athlete ID
 * @access Admin, Clinician, Athlete (own)
 */
router.get('/athlete/:athleteId', physioProgramController.getPhysioProgramsByAthleteId);

/***
 * @route GET /api/physio-programs
 * @desc Get all physio programs
 * @query page, limit
 * @access Admin
 */
router.get('/', physioProgramController.getAllPhysioPrograms);

/***
 * @route PUT /api/physio-programs/:id
 * @desc Update physio program
 * @access Admin, Clinician (managing)
 */
router.put('/:id', physioProgramController.updatePhysioProgram);

/***
 * @route PUT /api/physio-programs/:id/sessions
 * @desc Update sessions completed
 * @access Admin, Clinician (managing)
 */
router.put('/:id/sessions', physioProgramController.updateSessionsCompleted);

/***
 * @route DELETE /api/physio-programs/:id
 * @desc Delete physio program
 * @access Admin
 */
router.delete('/:id', physioProgramController.deletePhysioProgram);

export default router;