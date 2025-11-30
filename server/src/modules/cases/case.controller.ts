import { Request, Response } from 'express';
import * as caseService from './case.service';

/**
 * Create a new case
 */
export const createCase = async (req: Request, res: Response): Promise<void> => {
  try {
    const caseData = req.body;
    const createdBy = (req as any).user.id;
    
    const newCase = await caseService.createCase({ ...caseData, createdBy });
    
    res.status(201).json({
      success: true,
      message: 'Case created successfully',
      data: newCase
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get all cases
 */
export const getAllCases = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const cases = await caseService.getAllCases({ page: Number(page), limit: Number(limit), status: status as string });    res.status(200).json({
      success: true,
      data: cases
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get case by ID
 */
export const getCaseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const caseData = await caseService.getCaseById(id);
    
    res.status(200).json({
      success: true,
      data: caseData
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update case
 */
export const updateCase = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedCase = await caseService.updateCase(id, updates);
    
    res.status(200).json({
      success: true,
      message: 'Case updated successfully',
      data: updatedCase
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Delete case
 */
export const deleteCase = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    await caseService.deleteCase(id);
    
    res.status(200).json({
      success: true,
      message: 'Case deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
