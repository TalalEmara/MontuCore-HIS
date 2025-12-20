import type { Request, Response } from 'express';
import * as LabTestService from './labtest.service.js';
import { asyncHandler, successResponse, createdResponse, paginatedResponse } from '../../utils/responseHandlers.js';

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
export const createLabTest = asyncHandler(async (req: Request, res: Response) => {
  const labTestData = req.body;
  const labTest = await LabTestService.createLabTest(labTestData);
  return createdResponse(res, labTest, 'Lab test created successfully');
});

/**
 * Get lab test by ID
 * @route GET /api/lab-tests/:id
 */
export const getLabTestById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const labTest = await LabTestService.getLabTestById(parseInt(id));
  return successResponse(res, labTest);
});

/**
 * Update lab test
 * @route PUT /api/lab-tests/:id
 */
export const updateLabTest = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const labTest = await LabTestService.updateLabTest(parseInt(id), updates);
  return successResponse(res, labTest, 'Lab test updated successfully');
});
