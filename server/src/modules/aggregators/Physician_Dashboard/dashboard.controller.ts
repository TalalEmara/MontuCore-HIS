import type { Request, Response } from 'express';
import * as ApptService from '../../appointments/appointment.service.js';
import * as CaseService from '../../cases/case.service.js';

/**
 * Get Physician Dashboard Data
 * Aggregates today's appointments, critical cases, and active cases (first page only)
 * For paginating active cases, use GET /api/cases?clinicianId=X&status=ACTIVE&page=2
 * @route GET /api/dashboard/physician/:clinicianId
 * @param clinicianId - The ID of the clinician
 */
export const getPhysicianDashboard = async (req: Request, res: Response) => {
  try {
    const { clinicianId } = req.params;

    const clinicianIdNum = parseInt(clinicianId as string);

    if (isNaN(clinicianIdNum)) {
      return res.status(400).json({ error: 'Invalid clinician ID' });
    }

    // Execute all queries in parallel for better performance
    // Note: Only first page of active cases is returned
    const [todaysAppointments, criticalCases, activesCases] = await Promise.all([
      ApptService.getTodaysAppointmentsByClinicianId(clinicianIdNum),
      CaseService.getCriticalCasesByClinicianId(clinicianIdNum),
      CaseService.getActiveCasesByClinicianId(clinicianIdNum, 1, 10)
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
      },
      message: 'Dashboard shows first page of active cases. For more, use GET /api/cases?clinicianId=' + clinicianIdNum + '&status=ACTIVE&page=2'
    });
  } catch (error: any) {
    console.error('Error fetching physician dashboard:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch physician dashboard'
    });
  }
};