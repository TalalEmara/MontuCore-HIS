import type { Request, Response } from 'express';
import * as PhysioService from './physioprogram.service.js';
import { asyncHandler, successResponse, createdResponse, paginatedResponse } from '../../utils/responseHandlers.js';

export const getPhysioPrograms = asyncHandler(async (req: Request, res: Response) => {
  const { athleteId, caseId, page = 1, limit = 10 } = req.query;

  const filters: any = {
    page: parseInt(page as string) || 1,
    limit: parseInt(limit as string) || 10
  };

  if (athleteId) filters.athleteId = parseInt(athleteId as string);
  if (caseId) filters.caseId = parseInt(caseId as string);

  const result = await PhysioService.getPhysioPrograms(filters);
  return paginatedResponse(res, result.physioPrograms, result.pagination);
});

export const createPhysioProgram = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body;

  const processed = {
    ...data,
    caseId: parseInt(data.caseId),
    numberOfSessions: parseInt(data.numberOfSessions),
    weeklyRepetition: parseInt(data.weeklyRepetition),
    sessionsCompleted: data.sessionsCompleted ? parseInt(data.sessionsCompleted) : undefined,
    startDate: new Date(data.startDate),
    costPerSession: data.costPerSession ? parseFloat(data.costPerSession) : undefined
  };

  const program = await PhysioService.createPhysioProgram(processed);
  return createdResponse(res, program, 'Physio program created successfully');
});

export const getPhysioProgramById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ message: 'ID is required' });

  const program = await PhysioService.getPhysioProgramById(parseInt(id));
  return successResponse(res, program);
});

export const updatePhysioProgram = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ message: 'ID is required' });

  const updates = req.body;

  if (updates.numberOfSessions) updates.numberOfSessions = parseInt(updates.numberOfSessions);
  if (updates.sessionsCompleted) updates.sessionsCompleted = parseInt(updates.sessionsCompleted);
  if (updates.weeklyRepetition) updates.weeklyRepetition = parseInt(updates.weeklyRepetition);
  if (updates.startDate) updates.startDate = new Date(updates.startDate);
  if (updates.costPerSession) updates.costPerSession = parseFloat(updates.costPerSession);

  const program = await PhysioService.updatePhysioProgram(parseInt(id), updates);
  return successResponse(res, program, 'Physio program updated successfully');
});
