import type { Request, Response } from 'express';
import * as ExamService from './exam.service.js';
import { asyncHandler, successResponse, createdResponse, paginatedResponse } from '../../utils/responseHandlers.js';
import * as authC from '../auth/auth.controller.js';
import { prisma } from '../../config/db.js';
import e from 'express';

// Extend Request for single file uploads
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Extend Request for multiple file uploads
interface MulterMultipleRequest extends Request {
  files?: Express.Multer.File[];
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

  // Make sure that only the admin or the related clinician can create an exam
  const authHeader = req.headers['authorization'] || '';
  const userToken = authHeader.startsWith('Bearer ')  
    ? authHeader.substring(7) 
    : authHeader;
  const verified = await authC.verifyToken(userToken);
  if (verified || ['ADMIN', 'CLINICIAN'].includes((verified as any).role)) {
    if ((verified as any).role === 'CLINICIAN') {
      const currentCase = await prisma.case.findUnique({
        where: { id: examData.caseId }
      });
      const clinician = await prisma.clinicianProfile.findUnique({
        where: { userId: (verified as any).id }
      });
      if (currentCase?.managingClinicianId !== clinician?.id) {
        return res.status(403).json({ message: 'Forbidden: You can only create exams for your own cases' });
      }
    }
    const exam = await ExamService.createExam(examData);
    return createdResponse(res, exam, 'Exam created successfully');
  }
  else{
    return res.status(403).json({ message: 'Forbidden: You do not have permission to perform this action' });
  }
});

/**
 * Create a new exam with multiple DICOM uploads or add DICOMs to existing exam
 * @route POST /api/exams/with-multiple-dicoms
 */
export const createExamWithMultipleDicoms = asyncHandler(async (req: MulterMultipleRequest, res: Response) => {
  // With .fields() configuration, files are in req.files.fieldname
  const dicomFiles = req.files && 'dicomFiles' in req.files ? req.files.dicomFiles : [];

  const examData = {
    ...req.body,
    caseId: req.body.caseId ? parseInt(req.body.caseId) : undefined,
    examId: req.body.examId ? parseInt(req.body.examId) : undefined,
    cost: req.body.cost ? parseFloat(req.body.cost) : undefined,
    scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : undefined,
    performedAt: req.body.performedAt ? new Date(req.body.performedAt) : undefined,
    dicomFiles: Array.isArray(dicomFiles) ? dicomFiles : dicomFiles ? [dicomFiles] : [] // Ensure it's an array
  };

  // Validate that either caseId or examId is provided, but not both
  if ((!examData.caseId && !examData.examId) || (examData.caseId && examData.examId)) {
    return res.status(400).json({
      message: 'Either caseId (for new exam) or examId (for existing exam) must be provided, but not both'
    });
  }

  const authHeader = req.headers['authorization'] || '';
  const userToken = authHeader.startsWith('Bearer ')  
    ? authHeader.substring(7) 
    : authHeader;
  const verified = await authC.verifyToken(userToken);
  if (verified || ['ADMIN', 'CLINICIAN'].includes((verified as any).role)) {
    if ((verified as any).role === 'CLINICIAN') {
      const currentCase = await prisma.case.findUnique({
        where: { id: examData.caseId }
      });
      const clinician = await prisma.clinicianProfile.findUnique({
        where: { userId: (verified as any).id }
      });
      if (examData.caseId && currentCase?.managingClinicianId !== clinician?.id) {
        return res.status(403).json({ message: 'Forbidden: You can only create exams for your own cases' });
      }
    const exam = await ExamService.createExamWithMultipleDicoms(examData);
    return createdResponse(res, exam, 'DICOM files processed successfully');
    }
  }
  else {
    return res.status(403).json({ message: 'Forbidden: You do not have permission to perform this action' });
  }
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
  const authHeader = req.headers['authorization'] || '';
  const userToken = authHeader.startsWith('Bearer ')  
    ? authHeader.substring(7) 
    : authHeader;
  const verified = await authC.verifyToken(userToken);
  if (verified || ['ADMIN', 'CLINICIAN'].includes((verified as any).role)) {
    const exam = await ExamService.getExamById(parseInt(id));
    if ((verified as any).role === 'CLINICIAN') {
      const clinician = await prisma.clinicianProfile.findUnique({
        where: { userId: (verified as any).id }
      });
      if (exam?.medicalCase && (exam.medicalCase as any).managingClinicianId !== clinician?.id) {
        return res.status(403).json({ message: 'Forbidden: You do not have permission to access this exam' });
      }
    }
    return successResponse(res, exam);
  }
  else{
    return res.status(403).json({ message: 'Forbidden: You do not have permission to perform this action' });
  }
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

/**
 * Mark exam as completed
 * @route POST /api/exams/:id/complete
 */
export const markExamCompleted = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: 'Exam ID is required' });
  }

  const authHeader = req.headers['authorization'] || '';
  const userToken = authHeader.startsWith('Bearer ')  
    ? authHeader.substring(7) 
    : authHeader;
  const verified = await authC.verifyToken(userToken);
  if (verified || ['ADMIN', 'CLINICIAN'].includes((verified as any).role)) {
    if ((verified as any).role === 'CLINICIAN') {
      const getExam = await ExamService.getExamById(parseInt(id));
      const clinician = await prisma.clinicianProfile.findUnique({
        where: { userId: (verified as any).id }
      });
      if (getExam?.medicalCase && (getExam.medicalCase as any).managingClinicianId !== clinician?.id) {
        return res.status(403).json({ message: 'Forbidden: You do not have permission to access this exam' });
      }
    }
    const exam = await ExamService.markExamCompleted(parseInt(id));
    return successResponse(res, exam, 'Exam marked as completed');
  }
  else{
    return res.status(403).json({ message: 'Forbidden: You do not have permission to perform this action' });
  }
});