import type { Request, Response } from 'express';
import * as TreatmentService from './treatment.service.js';
import { asyncHandler, successResponse, createdResponse, paginatedResponse } from '../../utils/responseHandlers.js';

export const getTreatments = asyncHandler(async (req: Request, res: Response) => {
  const { athleteId, caseId, type, page = 1, limit = 10 } = req.query;

  const filters: any = {
    page: parseInt(page as string) || 1,
    limit: parseInt(limit as string) || 10
  };

  if (athleteId) filters.athleteId = parseInt(athleteId as string);
  if (caseId) filters.caseId = parseInt(caseId as string);
  if (type) filters.type = type as string;

  const result = await TreatmentService.getTreatments(filters);
  return paginatedResponse(res, result.treatments, result.pagination);
});

export const createTreatment = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body;

  const processed = {
    ...data,
    caseId: parseInt(data.caseId),
    cost: data.cost ? parseFloat(data.cost) : undefined,
    date: data.date ? new Date(data.date) : undefined
  };

  const treatment = await TreatmentService.createTreatment(processed);
  return createdResponse(res, treatment, 'Treatment created successfully');
});

export const getTreatmentById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
  return res.status(400).json({ message: 'ID is required' });
  }
  const treatment = await TreatmentService.getTreatmentById(parseInt(id));
  return successResponse(res, treatment);
});

export const updateTreatment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  if (updates.cost) updates.cost = parseFloat(updates.cost);
  if (updates.date) updates.date = new Date(updates.date);
  if (!id) {
  return res.status(400).json({ message: 'ID is required' });
  }
  const treatment = await TreatmentService.updateTreatment(parseInt(id), updates);
  return successResponse(res, treatment, 'Treatment updated successfully');
});

