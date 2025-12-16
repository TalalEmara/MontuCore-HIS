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

    const caseIdNum = parseInt(caseId as string);

    if (isNaN(caseIdNum)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid case ID' 
      });
    }

    // Execute all queries in parallel for optimal performance
    const [caseDetails, appointments, treatments, exams, labTests] = await Promise.all([
      // 1. Get case with athlete and clinician details
      CaseService.getCaseById(caseIdNum),
      
      // 2. Get all appointments for this case
      AppointmentService.getAppointmentsByCaseId(caseIdNum),
      
      // 3. Get all treatments for this case (no pagination - return all)
      TreatmentService.getTreatmentsByCaseId(caseIdNum, 1, 1000),
      
      // 4. Get all exams with images for this case (no pagination - return all)
      ExamService.getExamsByCaseId(caseIdNum, 1, 1000),
      
      // 5. Get all lab tests for this case (no pagination - return all)
      LabTestService.getLabTestsByCaseId(caseIdNum, 1, 1000)
    ]);

    // Format the response
    const responseData = {
      // Case overview with athlete and clinician information
      case: {
        id: caseDetails.id,
        diagnosisName: caseDetails.diagnosisName,
        icd10Code: caseDetails.icd10Code,
        injuryDate: caseDetails.injuryDate,
        status: caseDetails.status,
        severity: caseDetails.severity,
        medicalGrade: caseDetails.medicalGrade,
        athlete: {
          id: caseDetails.athlete.id,
          fullName: caseDetails.athlete.fullName,
          email: caseDetails.athlete.email,
          dateOfBirth: caseDetails.athlete.dateOfBirth,
          phoneNumber: caseDetails.athlete.phoneNumber,
          gender: caseDetails.athlete.gender
        },
        managingClinician: {
          id: caseDetails.managingClinician.id,
          fullName: caseDetails.managingClinician.fullName,
          email: caseDetails.managingClinician.email,
          phoneNumber: caseDetails.managingClinician.phoneNumber
        },
        initialAppointment: caseDetails.initialAppointment ? {
          id: caseDetails.initialAppointment.id,
          scheduledAt: caseDetails.initialAppointment.scheduledAt,
          diagnosisNotes: caseDetails.initialAppointment.diagnosisNotes,
          status: caseDetails.initialAppointment.status
        } : null
      },

      // All appointments related to this case
      appointments: {
        count: appointments.length,
        data: appointments.map(appt => ({
          id: appt.id,
          scheduledAt: appt.scheduledAt,
          status: appt.status,
          height: appt.height,
          weight: appt.weight,
          diagnosisNotes: appt.diagnosisNotes,
          clinician: {
            id: appt.clinician.id,
            fullName: appt.clinician.fullName
          },
          athlete: {
            id: appt.athlete.id,
            fullName: appt.athlete.fullName
          }
        }))
      },

      // All treatments
      treatments: {
        count: treatments.treatments.length,
        data: treatments.treatments.map(treatment => ({
          id: treatment.id,
          type: treatment.type,
          description: treatment.description,
          providerName: treatment.providerName,
          cost: treatment.cost,
          date: treatment.date
        }))
      },

      // All physio programs (from case details)
      physioPrograms: {
        count: caseDetails.physioPrograms.length,
        data: caseDetails.physioPrograms.map(program => ({
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
      labTests: {
        count: labTests.labTests.length,
        data: labTests.labTests.map(test => ({
          id: test.id,
          testName: test.testName,
          category: test.category,
          status: test.status,
          resultPdfUrl: test.resultPdfUrl,
          resultValues: test.resultValues,
          labTechnicianNotes: test.labTechnicianNotes,
          sampleDate: test.sampleDate,
          cost: test.cost
        }))
      },

      // All exams with images
      exams: {
        count: exams.exams.length,
        data: exams.exams.map(exam => ({
          id: exam.id,
          modality: exam.modality,
          bodyPart: exam.bodyPart,
          status: exam.status,
          scheduledAt: exam.scheduledAt,
          performedAt: exam.performedAt,
          radiologistNotes: exam.radiologistNotes,
          conclusion: exam.conclusion,
          images: exam.images?.map((img: any) => ({
            id: img.id,
            fileName: img.fileName,
            publicUrl: img.publicUrl,
            uploadedAt: img.uploadedAt
          })) || []
        }))
      }
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
