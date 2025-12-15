import type { Request, Response } from 'express';
import * as TreatmentService from './treatment.service.js';

/**
 * Get treatments with filters
 * @route GET /api/treatments
 * @query athleteId, caseId, type, page, limit
 */
export const getTreatments = async (req: Request, res: Response) => {
  try {
    const { athleteId, caseId, type, page = 1, limit = 10 } = req.query;

    const filters: any = {
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 10
    };

    if (athleteId) filters.athleteId = parseInt(athleteId as string);
    if (caseId) filters.caseId = parseInt(caseId as string);
    if (type) filters.type = type as string;

    const result = await TreatmentService.getTreatments(filters);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error fetching treatments:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch treatments'
    });
  }
};
