import type { Request, Response } from 'express';
import * as sessionService from './session.service.js';

/**
 * Create a new session
 */
export const createSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionData = req.body;
    const createdBy = (req as any).user.id;
    
    const newSession = await sessionService.createSession({ ...sessionData, createdBy });
    
    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      data: newSession
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get all sessions
 */
export const getAllSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, patientId, caseId } = req.query;
    
    const sessions = await sessionService.getAllSessions({ page: Number(page), limit: Number(limit), status: status as string, patientId: patientId as string, caseId: caseId as string });
    
    res.status(200).json({
      success: true,
      data: sessions
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get session by ID
 */
export const getSessionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
      return;
    }
    
    const session = await sessionService.getSessionById(id);
    
    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update session
 */
export const updateSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
      return;
    }
    
    const updatedSession = await sessionService.updateSession(id, updates);
    
    res.status(200).json({
      success: true,
      message: 'Session updated successfully',
      data: updatedSession
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Complete session
 */
export const completeSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { notes, prescriptions } = req.body;
    
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
      return;
    }
    
    const completedSession = await sessionService.completeSession(id, { notes, prescriptions });
    
    res.status(200).json({
      success: true,
      message: 'Session completed successfully',
      data: completedSession
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
