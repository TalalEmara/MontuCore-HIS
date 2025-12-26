import type { Request, Response } from 'express';
import * as ExamService from './exam.service.js';
import { asyncHandler, successResponse, createdResponse, paginatedResponse } from '../../utils/responseHandlers.js';

// Extend Request for file uploads
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

/**
 * Get exams with filters
 * @route GET /api/exams
 * @query athleteId, caseId, modality, status, page, limit
 */
export const getExams = asyncHandler(async (req: Request, res: Response) => {
  const { athleteId, caseId, modality, status, page = 1, limit = 10 } = req.query;

  const filters: any = {
    page: parseInt(page as string) || 1,
    limit: parseInt(limit as string) || 10
  };

  if (athleteId) filters.athleteId = parseInt(athleteId as string);
  if (caseId) filters.caseId = parseInt(caseId as string);
  if (modality) filters.modality = modality as string;
  if (status) filters.status = status as string;

  const result = await ExamService.getExams(filters);

  return paginatedResponse(res, result.exams, result.pagination);
});

/**
 * Create a new exam
 * @route POST /api/exams
 */
export const createExam = asyncHandler(async (req: MulterRequest, res: Response) => {
  const examData = {
    ...req.body,
    caseId: req.body.caseId ? parseInt(req.body.caseId) : undefined,
    cost: req.body.cost ? parseFloat(req.body.cost) : undefined,
    scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : undefined,
    performedAt: req.body.performedAt ? new Date(req.body.performedAt) : undefined,
    dicomFile: req.file // Add the uploaded file if present
  };

  const exam = await ExamService.createExam(examData);
  return createdResponse(res, exam, 'Exam created successfully');
});

/**
 * Get exam by ID
 * @route GET /api/exams/:id
 */
export const getExamById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: 'Exam ID is required' });
  }
  const exam = await ExamService.getExamById(parseInt(id));
  return successResponse(res, exam);
});

/**
 * Update exam
 * @route PUT /api/exams/:id
 */
export const updateExam = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: 'Exam ID is required' });
  }
  const updates = req.body;
  const exam = await ExamService.updateExam(parseInt(id), updates);
  return successResponse(res, exam, 'Exam updated successfully');
});

/**
 * Upload DICOM to existing exam
 * @route POST /api/exams/:id/upload
 */
export const uploadDicomToExam = asyncHandler(async (req: MulterRequest, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: 'Exam ID is required' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'DICOM file is required' });
  }

  const image = await ExamService.uploadDicomToExam(parseInt(id), req.file);
  return createdResponse(res, image, 'DICOM uploaded successfully');
});
