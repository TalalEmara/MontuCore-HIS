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

/**
 * Get treatments by athlete ID
 * @route GET /api/treatments/athlete/:athleteId
 * @query page, limit
 */
export const getTreatmentsByAthlete = async (req: Request, res: Response) => {
  try {
    const { athleteId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!athleteId) {
      return res.status(400).json({
        success: false,
        error: 'Athlete ID is required'
      });
    }

    const result = await TreatmentService.getTreatmentsByAthleteId(
      parseInt(athleteId),
      parseInt(page as string) || 1,
      parseInt(limit as string) || 10
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error fetching treatments by athlete:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch treatments'
    });
  }
};

/**
 * Get treatments by case ID
 * @route GET /api/treatments/case/:caseId
 * @query page, limit
 */
export const getTreatmentsByCase = async (req: Request, res: Response) => {
  try {
    const { caseId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!caseId) {
      return res.status(400).json({
        success: false,
        error: 'Case ID is required'
      });
    }

    const result = await TreatmentService.getTreatmentsByCaseId(
      parseInt(caseId),
      parseInt(page as string) || 1,
      parseInt(limit as string) || 10
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error fetching treatments by case:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch treatments'
    });
  }
};

/**
 * Create a new treatment
 * @route POST /api/treatments
 */
export const createTreatment = async (req: Request, res: Response) => {
  try {
    const treatmentData = req.body;
    const result = await TreatmentService.createTreatment(treatmentData);

    res.status(201).json({
      success: true,
      message: 'Treatment created successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Error creating treatment:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create treatment'
    });
  }
};

/**
 * Update an existing treatment
 * @route PUT /api/treatments/:id
 */
export const updateTreatment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Treatment ID is required'
      });
    }

    const result = await TreatmentService.updateTreatment(parseInt(id), updateData);

    res.status(200).json({
      success: true,
      message: 'Treatment updated successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Error updating treatment:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update treatment'
    });
  }
};

/**
 * Delete a treatment
 * @route DELETE /api/treatments/:id
 */
export const deleteTreatment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Treatment ID is required'
      });
    }

    await TreatmentService.deleteTreatment(parseInt(id));

    res.status(200).json({
      success: true,
      message: 'Treatment deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting treatment:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete treatment'
    });
  }
};
