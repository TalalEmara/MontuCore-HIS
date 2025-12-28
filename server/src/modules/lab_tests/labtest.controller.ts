import type { Request, Response, RequestHandler } from 'express';
import multer from 'multer';
import * as LabTestService from './labtest.service.js';
import { asyncHandler, successResponse, createdResponse, paginatedResponse } from '../../utils/responseHandlers.js';
import * as authC from '../auth/auth.controller.js';
import { prisma } from '../../config/db.js';

// Configure multer for PDF uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

/**
 * Get lab tests with filters
 * @route GET /api/lab-tests
 * @query athleteId, caseId, status, category, page, limit
 */
export const getLabTests = asyncHandler(async (req: Request, res: Response) => {
  const { athleteId, caseId, status, category, page = 1, limit = 10 } = req.query;

  const filters: any = {
    page: parseInt(page as string) || 1,
    limit: parseInt(limit as string) || 10
  };

  if (athleteId) filters.athleteId = parseInt(athleteId as string);
  if (caseId) filters.caseId = parseInt(caseId as string);
  if (status) filters.status = status as string;
  if (category) filters.category = category as string;

  const result = await LabTestService.getLabTests(filters);

  return paginatedResponse(res, result.labTests, result.pagination);
});

/**
 * Create a new lab test
 * @route POST /api/lab-tests
 */
export const createLabTest: RequestHandler[] = [
  upload.single('pdf'), // Optional PDF upload
  asyncHandler(async (req: Request, res: Response) => {
    const labTestData = req.body;

    // Convert string values to appropriate types
    const processedData = {
      ...labTestData,
      caseId: labTestData.caseId ? parseInt(labTestData.caseId) : undefined,
      cost: labTestData.cost ? parseFloat(labTestData.cost) : undefined,
    };

    // Add PDF file data if provided
    if (req.file) {
      processedData.pdfFile = {
        buffer: req.file.buffer,
        originalName: req.file.originalname
      };
    }

    const labTest = await LabTestService.createLabTest(processedData);
    return createdResponse(res, labTest, 'Lab test created successfully');
  })
];

export const getLabTestById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: 'Lab test ID is required' });
  }
  const labTest = await LabTestService.getLabTestById(parseInt(id));
  return successResponse(res, labTest);
});

/**
 * Update lab test
 * @route PUT /api/lab-tests/:id
 */
export const updateLabTest = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: 'Lab test ID is required' });
  }
  const updates = req.body;
  const labTest = await LabTestService.updateLabTest(parseInt(id), updates);
  return successResponse(res, labTest, 'Lab test updated successfully');
});

/**
 * Upload PDF result for a lab test
 * @route POST /api/lab-tests/:id/upload-pdf
 */
export const uploadLabTestPdf: RequestHandler[] = [
  upload.single('pdf'),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Lab test ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file provided' });
    }

    const labTest = await LabTestService.uploadLabTestPdf(
      parseInt(id),
      req.file.buffer,
      req.file.originalname
    );

    return successResponse(res, labTest, 'PDF uploaded successfully');
  })
];
