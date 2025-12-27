import express, { Router } from 'express';
import * as treatmentController from './treatment.controller.js';

const router: Router = express.Router();

router.get('/', treatmentController.getTreatments);
router.post('/', treatmentController.createTreatment);
router.get('/:id', treatmentController.getTreatmentById);
router.put('/:id', treatmentController.updateTreatment);

export default router;

