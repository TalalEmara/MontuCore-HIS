import express, { Router } from 'express';
import * as examController from './exam.controller.js';
import multer from 'multer';

const router: Router = express.Router();

// Configure multer for DICOM uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

/**
 * @route   GET /api/exams
 * @desc    Get exams with filters (athleteId, caseId, modality, status) and pagination
 * @access  Public (to be protected with auth in production)
 * @query   athleteId, caseId, modality, status, page, limit
 */
router.get('/', examController.getExams);

/**
 * @route   POST /api/exams
 * @desc    Create a new exam (optional DICOM upload)
 * @access  Public (to be protected with auth in production)
 */
router.post('/', upload.single('dicomFile'), examController.createExam);

/**
 * @route   GET /api/exams/:id
 * @desc    Get exam by ID
 * @access  Public (to be protected with auth in production)
 */
router.get('/:id', examController.getExamById);

/**
 * @route   PUT /api/exams/:id
 * @desc    Update exam
 * @access  Public (to be protected with auth in production)
 */
router.put('/:id', examController.updateExam);

/**
 * @route   POST /api/exams/:id/upload
 * @desc    Upload DICOM to existing exam
 * @access  Public (to be protected with auth in production)
 */
router.post('/:id/upload', upload.single('dicomFile'), examController.uploadDicomToExam);

export default router;
