import type { Request, Response } from 'express';
import * as cdssService from './cdss.service.js';

/**
 * Analyze imaging findings with CDSS
 * @route POST /api/cdss/analyze
 * @access Public
 */
export const analyzeImaging = async (req: Request, res: Response): Promise<void> => {
  try {
    const { athlete, imaging } = req.body;

    if (!athlete || !imaging) {
      res.status(400).json({
        success: false,
        message: 'Required fields: athlete (name, age, sport), imaging (type, findings, severity)'
      });
      return;
    }

    const result = cdssService.analyzeImagingFindings(athlete, imaging);

    res.status(200).json({
      success: true,
      athlete,
      analysis: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get sport-specific risks
 * @route GET /api/cdss/sport-risks/:sport
 * @access Public
 */
export const getSportRisks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sport } = req.params;

    if (!sport) {
      res.status(400).json({
        success: false,
        message: 'Required parameter: sport'
      });
      return;
    }

    const risks = cdssService.getSportRisks(sport);

    res.status(200).json({
      success: true,
      sport,
      commonInjuries: risks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
