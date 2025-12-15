import type { Request, Response } from 'express';
import * as ExamService from './exam.service.js';

/**
 * Get exams with filters
 * @route GET /api/exams
 * @query athleteId, caseId, modality, status, page, limit
 */
export const getExams = async (req: Request, res: Response) => {
  try {
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

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error fetching exams:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch exams'
    });
  }
};
