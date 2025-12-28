import type { Request, Response } from 'express';
import * as ApptService from '../../appointments/appointment.service.js';
import * as CaseService from '../../cases/case.service.js';
import * as TreatmentService from '../../treatments/treatment.service.js';
import * as ExamService from '../../imaging/exam.service.js';
import * as LabTestService from '../../lab_tests/labtest.service.js';

/**
 * Get Athlete Dashboard Data (Initial Load)
 * Aggregates upcoming appointments, cases (reports), treatments (prescriptions), exams (imaging), and lab tests
 * Returns first page of paginated data. For subsequent pages, use individual endpoints:
 * - /api/treatments?athleteId=X&page=2
 * - /api/exams?athleteId=X&page=2
 * - /api/lab-tests?athleteId=X&page=2
 * @route GET /api/dashboard/athlete/:athleteId
 * @param athleteId - The ID of the athlete
 */
export const getAthleteDashboard = async (req: Request, res: Response) => {
  try {
    const { athleteId } = req.params;

    const athleteIdNum = parseInt(athleteId as string);

    if (isNaN(athleteIdNum)) {
      return res.status(400).json({ error: 'Invalid athlete ID' });
    }

    // Execute all queries in parallel - first page only
    const [upcomingAppointments, cases, treatments, exams, labTests] = await Promise.all([
      ApptService.getUpcomingAppointmentsByAthleteId(athleteIdNum),
      CaseService.getCases({ athleteId: athleteIdNum, page: 1, limit: 10 }),
      TreatmentService.getTreatmentsByAthleteId(athleteIdNum, 1, 10),
      ExamService.getExamsByAthleteId(athleteIdNum, 1, 10),
      LabTestService.getLabTestsByAthleteId(athleteIdNum, 1, 10)
    ]);

    res.status(200).json({
      success: true,
      data: {
        upcomingAppointments: {
          count: upcomingAppointments.length,
          appointments: upcomingAppointments
        },
        report: cases,
        prescriptions: treatments,
        imaging: exams,
        tests: labTests
      }
    });
  } catch (error: any) {
    console.error('Error fetching athlete dashboard:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch athlete dashboard'
    });
  }
};
