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

// Configure for multiple files
const uploadMultiple = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit per file
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
 * @route   POST /api/exams/with-multiple-dicoms
 * @desc    Create a new exam with multiple DICOM uploads
 * @access  Public (to be protected with auth in production)
 */
router.post('/with-multiple-dicoms', uploadMultiple.array('dicomFiles', 20), examController.createExamWithMultipleDicoms);

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

/**
 * @route   POST /api/exams/:id/complete
 * @desc    Mark exam as completed (after all DICOM uploads are done)
 * @access  Public (to be protected with auth in production)
 */
router.post('/:id/complete', examController.markExamCompleted);

export default router;
