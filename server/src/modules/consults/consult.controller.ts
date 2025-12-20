import type { Request, Response } from 'express';
import * as ConsultService from './consult.service.js';
import { AppError } from '../../utils/AppError.js';

/**
 * Generate a Share Link
 * POST /api/consults/share
 * Protected: Clinician Only
 */
export const generateShareLink = async (req: Request, res: Response) => {
  try {
    // TODO: Uncomment for production - Role Check
    // const userRole = (req as any).user?.role;
    // if (userRole !== 'CLINICIAN' && userRole !== 'ADMIN') {
    //   return res.status(403).json({ 
    //     error: "Only clinicians can share medical records",
    //     code: 'INSUFFICIENT_PERMISSIONS'
    //   });
    // }
    // const clinicianId = (req as any).user.id;

    // TESTING ONLY: Hardcoded clinician ID for testing without auth
    const clinicianId = 2; // Replace with actual clinician ID from your database
    
    const { athleteId, externalEmail, permissions, expiryHours } = req.body;

    // Validate required fields
    if (!athleteId || !externalEmail || !permissions) {
      return res.status(400).json({ 
        error: "Missing required fields: athleteId, externalEmail, and permissions are required",
        code: 'MISSING_FIELDS'
      });
    }

    // 2. Call Service
    const share = await ConsultService.createShareLink(
      clinicianId, 
      parseInt(athleteId), 
      externalEmail, 
      permissions, 
      expiryHours ? parseInt(expiryHours) : undefined
    );

    // 3. Generate the Frontend Link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const link = `${frontendUrl}/external/view/${share.token}`;

    res.status(201).json({
      success: true,
      message: "Consultation link generated successfully",
      data: {
        shareToken: share.token,
        fullLink: link,
        expiresAt: share.expiresAt
      }
    });

  } catch (error: any) {
    console.error("Generate Share Error:", error);
    
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ 
        error: error.message,
        code: error.constructor.name.replace('Error', '').toUpperCase()
      });
    }
    
    res.status(500).json({ 
      error: "Failed to generate consultation link",
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * View Shared Data
 * GET /api/consults/view/:token
 * Public: No Auth Header needed (The token IS the auth)
 */
export const viewSharedRecord = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ 
        error: "Token is required",
        code: 'MISSING_TOKEN'
      });
    }

    const result = await ConsultService.getSharedData(token);

    res.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error("View Shared Record Error:", error);
    
    if (error instanceof AppError) {
      // Return appropriate status codes for different error types
      return res.status(error.statusCode).json({ 
        error: error.message,
        code: error.constructor.name.replace('Error', '').toUpperCase()
      });
    }
    
    // Generic error for unexpected issues
    res.status(500).json({ 
      error: "Unable to retrieve shared data",
      code: 'INTERNAL_ERROR'
    });
  }
};