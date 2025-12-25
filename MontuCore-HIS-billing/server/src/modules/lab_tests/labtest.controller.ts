import type { Request, Response } from 'express';
import * as LabTestService from './labtest.service.js';

/**
 * Get lab tests with filters
 * @route GET /api/lab-tests
 * @query athleteId, caseId, status, category, page, limit
 */
export const getLabTests = async (req: Request, res: Response) => {
  try {
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

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error fetching lab tests:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch lab tests'
    });
  }
};
