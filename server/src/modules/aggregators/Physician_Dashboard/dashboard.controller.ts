import type { Request, Response } from 'express';
import * as ApptService from '../../appointments/appointment.service.js';
import * as CaseService from '../../cases/case.service.js';

/**
 * Get Physician Dashboard Data
 * Aggregates today's appointments, critical cases, and active cases
 * @route GET /api/dashboard/physician/:clinicianId
 * @param clinicianId - The ID of the clinician
 * @param page - Page number for active cases pagination (default: 1)
 * @param limit - Limit per page for active cases (default: 10)
 */
export const getPhysicianDashboard = async (req: Request, res: Response) => {
  try {
    const { clinicianId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const clinicianIdNum = parseInt(clinicianId as string);

    if (isNaN(clinicianIdNum)) {
      return res.status(400).json({ error: 'Invalid clinician ID' });
    }

    // Execute all queries in parallel for better performance
    const [todaysAppointments, criticalCases, activesCases] = await Promise.all([
      ApptService.getTodaysAppointmentsByClinicianId(clinicianIdNum),
      CaseService.getCriticalCasesByClinicianId(clinicianIdNum),
      CaseService.getActiveCasesByClinicianId(
        clinicianIdNum,
        parseInt(page as string) || 1,
        parseInt(limit as string) || 10
      )
    ]);

    res.status(200).json({
      success: true,
      data: {
        todaysAppointments: {
          count: todaysAppointments.length,
          appointments: todaysAppointments
        },
        criticalCases: {
          count: criticalCases.length,
          cases: criticalCases
        },
        activeCases: activesCases
      }
    });
  } catch (error: any) {
    console.error('Error fetching physician dashboard:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch physician dashboard'
    });
  }
};