import type { Request, Response } from 'express';
import * as physioProgramService from './physioProgram.service.js';
import * as authC from '../auth/auth.controller.js';
import { prisma } from '../../config/db.js';

/**
 * Create a new physio program
 */
export const createPhysioProgram = async (req: Request, res: Response): Promise<void> => {
  try {
    const programData = req.body;
    const authHeader = req.headers['authorization'] || '';
    const userToken = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;
    const validToken = await authC.verifyToken(userToken);

    if (validToken && (authC.isAdmin(userToken) || authC.isClinician(userToken))) {
      const createdProgram = await physioProgramService.createPhysioProgram(programData);

      res.status(201).json({
        success: true,
        message: 'Physio program created successfully',
        data: createdProgram
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
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
    const authHeader = req.headers['authorization'] || '';
    const userToken = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;
    const validToken = await authC.verifyToken(userToken);

    if (validToken && (authC.isAdmin(userToken) || authC.isClinician(userToken) || authC.isAthlete(userToken))) {
      const userId = (validToken as any).id;
      const program = await physioProgramService.getPhysioProgramById(Number(id));

      // Check permissions
      if ((validToken as any).role === 'ATHLETE') {
        if (program.medicalCase.athlete.id !== userId) {
          res.status(403).json({
            success: false,
            message: 'Access denied'
          });
          return;
        }
      } else if ((validToken as any).role === 'CLINICIAN') {
        if (program.medicalCase.managingClinician.id !== userId) {
          res.status(403).json({
            success: false,
            message: 'Access denied'
          });
          return;
        }
      }

      res.status(200).json({
        success: true,
        data: program
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
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
    const authHeader = req.headers['authorization'] || '';
    const userToken = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;
    const validToken = await authC.verifyToken(userToken);

    if (validToken && (authC.isAdmin(userToken) || authC.isClinician(userToken) || authC.isAthlete(userToken))) {
      const userId = (validToken as any).id;
      const caseData = await prisma.case.findUnique({
        where: { id: Number(caseId) },
        select: { athleteId: true, managingClinicianId: true }
      });

      if (!caseData) {
        res.status(404).json({
          success: false,
          message: 'Case not found'
        });
        return;
      }

      // Check permissions
      if ((validToken as any).role === 'ATHLETE') {
        if (caseData.athleteId !== userId) {
          res.status(403).json({
            success: false,
            message: 'Access denied'
          });
          return;
        }
      } else if ((validToken as any).role === 'CLINICIAN') {
        if (caseData.managingClinicianId !== userId) {
          res.status(403).json({
            success: false,
            message: 'Access denied'
          });
          return;
        }
      }

      const programs = await physioProgramService.getPhysioProgramsByCaseId(Number(caseId));

      res.status(200).json({
        success: true,
        data: programs
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
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
    const authHeader = req.headers['authorization'] || '';
    const userToken = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;
    const validToken = await authC.verifyToken(userToken);

    if (validToken && authC.isAdmin(userToken)) {
      const result = await physioProgramService.getAllPhysioPrograms(Number(page), Number(limit));

      res.status(200).json({
        success: true,
        data: result
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
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
    const authHeader = req.headers['authorization'] || '';
    const userToken = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;
    const validToken = await authC.verifyToken(userToken);

    if (validToken && (authC.isAdmin(userToken) || authC.isClinician(userToken))) {
      const userId = (validToken as any).id;

      if ((validToken as any).role === 'CLINICIAN') {
        const program = await physioProgramService.getPhysioProgramById(Number(id));
        if (program.medicalCase.managingClinician.id !== userId) {
          res.status(403).json({
            success: false,
            message: 'Access denied'
          });
          return;
        }
      }

      const updatedProgram = await physioProgramService.updatePhysioProgram(Number(id), updates);

      res.status(200).json({
        success: true,
        message: 'Physio program updated successfully',
        data: updatedProgram
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
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
    const authHeader = req.headers['authorization'] || '';
    const userToken = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;
    const validToken = await authC.verifyToken(userToken);

    if (validToken && (authC.isAdmin(userToken) || authC.isClinician(userToken))) {
      const userId = (validToken as any).id;

      if ((validToken as any).role === 'CLINICIAN') {
        const program = await physioProgramService.getPhysioProgramById(Number(id));
        if (program.medicalCase.managingClinician.id !== userId) {
          res.status(403).json({
            success: false,
            message: 'Access denied'
          });
          return;
        }
      }

      const updatedProgram = await physioProgramService.updateSessionsCompleted(Number(id), sessionsCompleted);

      res.status(200).json({
        success: true,
        message: 'Sessions completed updated successfully',
        data: updatedProgram
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
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
    const authHeader = req.headers['authorization'] || '';
    const userToken = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;
    const validToken = await authC.verifyToken(userToken);

    if (validToken && authC.isAdmin(userToken)) {
      const result = await physioProgramService.deletePhysioProgram(Number(id));

      res.status(200).json({
        success: true,
        message: result.message
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
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
    const authHeader = req.headers['authorization'] || '';
    const userToken = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;
    const validToken = await authC.verifyToken(userToken);

    if (validToken && (authC.isAdmin(userToken) || authC.isClinician(userToken))) {
      const userId = (validToken as any).id;

      if ((validToken as any).role === 'CLINICIAN') {
        if (userId != Number(clinicianId)) {
          res.status(403).json({
            success: false,
            message: 'Access denied'
          });
          return;
        }
      }

      const programs = await physioProgramService.getPhysioProgramsByClinicianId(Number(clinicianId));

      res.status(200).json({
        success: true,
        data: programs
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};