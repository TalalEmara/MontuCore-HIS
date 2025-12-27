import express, { Router } from 'express';
import * as physioController from './physioprogram.controller.js';

const router: Router = express.Router();

router.get('/', physioController.getPhysioPrograms);
router.post('/', physioController.createPhysioProgram);
router.get('/:id', physioController.getPhysioProgramById);
router.put('/:id', physioController.updatePhysioProgram);

export default router;
