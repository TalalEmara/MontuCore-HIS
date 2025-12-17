import type { Request, Response } from 'express';
import * as CaseService from '../../cases/case.service.js';
import * as AppointmentService from '../../appointments/appointment.service.js';
import * as TreatmentService from '../../treatments/treatment.service.js';
import * as ExamService from '../../imaging/exam.service.js';
import * as LabTestService from '../../lab_tests/labtest.service.js';

/**
 * Get Complete Case View Data
 * Aggregates all data related to a specific case from multiple tables
 * @route GET /api/case-view/:caseId
 * @param caseId - The ID of the case
 * @returns Comprehensive case data including:
 *  - Case details with athlete and clinician names
 *  - All appointments (initial + follow-ups)
 *  - All treatments
 *  - All physio programs
 *  - All lab tests
 *  - All exams with images
 */
export const getCaseView = async (req: Request, res: Response) => {
  try {
    const { caseId } = req.params;
    const {
      appointmentsPage = '1',
      appointmentsLimit = '10',
      treatmentsPage = '1',
      treatmentsLimit = '10',
      examsPage = '1',
      examsLimit = '10',
      labTestsPage = '1',
      labTestsLimit = '10',
      table
    } = req.query;

    const scopes = typeof table === 'string' && table.trim().length > 0
      ? table.split(',').map(s => s.trim().toLowerCase())
      : ['all'];
    const wants = (section: string) => scopes.includes('all') || scopes.includes(section);

    const apPage = Number(appointmentsPage) || 1;
    const apLimit = Number(appointmentsLimit) || 10;
    const trPage = Number(treatmentsPage) || 1;
    const trLimit = Number(treatmentsLimit) || 10;
    const exPage = Number(examsPage) || 1;
    const exLimit = Number(examsLimit) || 10;
    const lbPage = Number(labTestsPage) || 1;
    const lbLimit = Number(labTestsLimit) || 10;

    const caseIdNum = parseInt(caseId as string);

    if (isNaN(caseIdNum)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid case ID' 
      });
    }

    // Execute queries in parallel for requested sections only
    const [caseDetails, appointments, treatments, exams, labTests] = await Promise.all([
      // 1. Get case with athlete and clinician details (always fetched)
      CaseService.getCaseById(caseIdNum),
      
      // 2. Appointments
      wants('appointments')
        ? AppointmentService.getAppointmentsByCaseId(caseIdNum, apPage, apLimit)
        : Promise.resolve(null),
      
      // 3. Treatments
      wants('treatments')
        ? TreatmentService.getTreatmentsByCaseId(caseIdNum, trPage, trLimit)
        : Promise.resolve(null),
      
      // 4. Exams
      wants('exams')
        ? ExamService.getExamsByCaseId(caseIdNum, exPage, exLimit)
        : Promise.resolve(null),
      
      // 5. Lab tests
      wants('labtests')
        ? LabTestService.getLabTestsByCaseId(caseIdNum, lbPage, lbLimit)
        : Promise.resolve(null)
    ]);

    const fullCase: any = caseDetails;

    // Format the response
    const responseData = {
      // Case overview with athlete and clinician information
      case: {
        id: fullCase.id,
        diagnosisName: fullCase.diagnosisName,
        icd10Code: fullCase.icd10Code,
        injuryDate: fullCase.injuryDate,
        status: fullCase.status,
        severity: fullCase.severity,
        medicalGrade: fullCase.medicalGrade,
        initialAppointmentId: fullCase.initialAppointmentId ?? null,
        athlete: fullCase.athlete,
        managingClinician: fullCase.managingClinician,
        initialAppointment: fullCase.initialAppointment ?? null
      },

      // All appointments related to this case
      appointments: appointments ? {
        count: appointments.pagination.total,
        pagination: appointments.pagination,
        data: appointments.appointments.map((appt: any) => ({
          id: appt.id,
          scheduledAt: appt.scheduledAt,
          status: appt.status,
          height: appt.height,
          weight: appt.weight,
          diagnosisNotes: appt.diagnosisNotes,
          clinician: appt.clinician,
          athlete: appt.athlete
        }))
      } : null,

      // All treatments
      treatments: treatments ? {
        count: treatments.pagination.total,
        pagination: treatments.pagination,
        data: treatments.treatments
      } : null,

      // All physio programs (from case details)
      physioPrograms: {
        count: (fullCase.physioPrograms || []).length,
        data: (fullCase.physioPrograms || []).map((program: any) => ({
          id: program.id,
          title: program.title,
          numberOfSessions: program.numberOfSessions,
          sessionsCompleted: program.sessionsCompleted,
          startDate: program.startDate,
          weeklyRepetition: program.weeklyRepetition,
          costPerSession: program.costPerSession
        }))
      },

      // All lab tests
      labTests: labTests ? {
        count: labTests.pagination.total,
        pagination: labTests.pagination,
        data: labTests.labTests
      } : null,

      // All exams with images
      exams: exams ? {
        count: exams.pagination.total,
        pagination: exams.pagination,
        data: exams.exams
      } : null
    };

    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error: any) {
    console.error('Error fetching case view:', error);
    
    if (error.message === 'Case not found') {
      return res.status(404).json({
        success: false,
        error: 'Case not found'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch case view data'
    });
  }
};
