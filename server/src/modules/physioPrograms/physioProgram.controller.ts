import type { Request, Response } from 'express';
import * as physioProgramService from './physioProgram.service.js';

/**
 * Create a new physio program
 */
export const createPhysioProgram = async (req: Request, res: Response): Promise<void> => {
  try {
    const programData = req.body;
    const createdProgram = await physioProgramService.createPhysioProgram(programData);

    res.status(201).json({
      success: true,
      message: 'Physio program created successfully',
      data: createdProgram
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get physio program by ID
 */
export const getPhysioProgramById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const program = await physioProgramService.getPhysioProgramById(Number(id));

    res.status(200).json({
      success: true,
      data: program
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get physio programs by case ID
 */
export const getPhysioProgramsByCaseId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { caseId } = req.params;
    const programs = await physioProgramService.getPhysioProgramsByCaseId(Number(caseId));

    res.status(200).json({
      success: true,
      data: programs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get all physio programs (admin only)
 */
export const getAllPhysioPrograms = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await physioProgramService.getAllPhysioPrograms(Number(page), Number(limit));

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update physio program
 */
export const updatePhysioProgram = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedProgram = await physioProgramService.updatePhysioProgram(Number(id), updates);

    res.status(200).json({
      success: true,
      message: 'Physio program updated successfully',
      data: updatedProgram
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update sessions completed
 */
export const updateSessionsCompleted = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { sessionsCompleted } = req.body;
    const updatedProgram = await physioProgramService.updateSessionsCompleted(Number(id), sessionsCompleted);

    res.status(200).json({
      success: true,
      message: 'Sessions completed updated successfully',
      data: updatedProgram
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Delete physio program
 */
export const deletePhysioProgram = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await physioProgramService.deletePhysioProgram(Number(id));

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get physio programs by clinician
 */
export const getPhysioProgramsByClinicianId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clinicianId } = req.params;
    const programs = await physioProgramService.getPhysioProgramsByClinicianId(Number(clinicianId));

    res.status(200).json({
      success: true,
      data: programs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};