import { Severity, CaseStatus } from '@prisma/client';
import { prisma } from '../../config/db.js';
import { get } from 'http';

interface CaseData {
  athleteId:           number;
  managingClinicianId: number;
  initialAppointmentId: number;
  diagnosisName:       string;
  icd10Code:           string | null;
  injuryDate:          Date;
  status:              CaseStatus;
  severity:            Severity;
  medicalGrade:        string | null;
}

interface GetAllCasesParams {
  page?: number;
  limit?: number;
  status?: CaseStatus;
  athleteId?: number | undefined;
  initialAppointmentId?: number | null;
}

interface GetCasesFilterParams {
  caseId?: number;
  clinicianId?: number;
  athleteId?: number;
  initialAppointmentId?: number | null;
  status?: CaseStatus;
  severity?: string;
  page?: number;
  limit?: number;
  isToday?: boolean;
}

/**
 * Create a new case
 */
export const createCase = async (caseData: CaseData) => {
  const newCase = await prisma.case.create({
    data: {
      athleteId: caseData.athleteId,
      managingClinicianId: caseData.managingClinicianId,
      initialAppointmentId: caseData.initialAppointmentId,
      diagnosisName: caseData.diagnosisName,
      icd10Code: caseData.icd10Code,
      injuryDate: caseData.injuryDate,
      status: caseData.status,
      severity: caseData.severity,
      medicalGrade: caseData.medicalGrade
    },
    include: {
      athlete: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });

  return newCase;
};

/**
 * Get all cases with pagination and filters
 */
export const getAllCases = async ({ page = 1, limit = 10, status, athleteId }: GetAllCasesParams) => {
  const skip = (page - 1) * limit;
  const where: any = {};
  
  if (status) where.status = status;
  if (athleteId) where.athleteId = athleteId;

  const [cases, total] = await Promise.all([
    prisma.case.findMany({
      where,
      skip,
      take: limit,
      include: {
        athlete: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        managingClinician: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      },
      orderBy: {
        injuryDate: 'desc'
      }
    }),
    prisma.case.count({ where })
  ]);

  return {
    cases,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get case by ID - Uses base getCases logic then adds extra details
 */
export const getCaseById = async (caseId: number) => {
  // Use base getCases function with caseId filter to ensure dependency chain
  const result = await getCases({ caseId });
  
  if (!result.cases || result.cases.length === 0) {
    throw new Error('Case not found');
  }

  const baseCaseData = result.cases[0];

  if (!baseCaseData?.athlete?.id || !baseCaseData?.managingClinician?.id) {
    throw new Error('Invalid case data: missing athlete or clinician information');
  }

  // Now fetch all the extra details in parallel
  const [exams, labTests, treatments, physioPrograms, athlete, managingClinician] = await Promise.all([
    prisma.exam.findMany({
      where: { caseId },
      select: {
        id: true,
        modality: true,
        bodyPart: true,
        status: true,
        scheduledAt: true,
        performedAt: true,
        radiologistNotes: true,
        conclusion: true,
        cost: true,
        images: {
          select: {
            id: true,
            fileName: true,
            publicUrl: true,
            uploadedAt: true
          }
        }
      }
    }),
    prisma.labTest.findMany({
      where: { caseId },
      select: {
        id: true,
        testName: true,
        category: true,
        status: true,
        resultPdfUrl: true,
        resultValues: true,
        labTechnicianNotes: true,
        sampleDate: true,
        cost: true
      }
    }),
    prisma.treatment.findMany({
      where: { caseId },
      select: {
        id: true,
        type: true,
        description: true,
        providerName: true,
        date: true,
        cost: true
      }
    }),
    prisma.physioProgram.findMany({
      where: { caseId },
      select: {
        id: true,
        title: true,
        numberOfSessions: true,
        sessionsCompleted: true,
        startDate: true,
        weeklyRepetition: true,
        costPerSession: true
      }
    }),
    prisma.user.findUnique({
      where: { id: baseCaseData.athlete.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        dateOfBirth: true,
        phoneNumber: true,
        gender: true
      }
    }),
    prisma.user.findUnique({
      where: { id: baseCaseData.managingClinician.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true
      }
    })
  ]);

  if (!athlete || !managingClinician) {
    throw new Error('Related athlete or clinician not found');
  }

  // Combine base info with extra details
  return {
    ...baseCaseData,
    athlete,
    managingClinician,
    exams,
    labTests,
    treatments,
    physioPrograms
  };
};

/**
 * Update case (partial update - only provided fields are updated)
 */
export const updateCase = async (caseId: number, updates: Partial<CaseData>) => {
  // Check if case exists
  const existingCase = await prisma.case.findUnique({
    where: { id: caseId }
  });

  if (!existingCase) {
    throw new Error('Case not found');
  }

  // Filter out undefined fields to only update provided fields
  const filteredUpdates = Object.fromEntries(
    Object.entries(updates).filter(([_, value]) => value !== undefined)
  );

  // Ensure we don't have an empty update
  if (Object.keys(filteredUpdates).length === 0) {
    throw new Error('No fields to update');
  }

  const updatedCase = await prisma.case.update({
    where: { id: caseId },
    data: filteredUpdates as any,
    include: {
      athlete: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      },
      managingClinician: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });

  return updatedCase;
};

/**
 * Delete case
 */
export const deleteCase = async (caseId: number) => {
  await prisma.case.delete({
    where: { id: caseId }
  });

  return { message: 'Case deleted successfully' };
};

/**
 * FLEXIBLE BASE FUNCTION - Get cases with multiple filter options
 * Supports: clinician, athlete, status, severity, pagination, date filtering
 * @example getCases({ clinicianId: 1, severity: 'CRITICAL' })
 * @example getCases({ clinicianId: 1, status: 'ACTIVE', page: 1, limit: 10 })
 * @example getCases({ athleteId: 5, isToday: true })
 */
export const getCases = async (filters: GetCasesFilterParams = {}) => {
  try {
    const { 
      clinicianId, 
      athleteId, 
      status, 
      severity, 
      page = 1, 
      limit = 10, 
      isToday 
    } = filters;

    const where: any = {};

    // Apply filters
    if (clinicianId) where.managingClinicianId = clinicianId;
    if (athleteId) where.athleteId = athleteId;
    if (status) where.status = status;
    if (severity) where.severity = severity;

    // Date filter for today's cases
    if (isToday) {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      where.injuryDate = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    const skip = (page - 1) * limit;

    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where,
        select: {
          id: true,
          diagnosisName: true,
          severity: true,
          status: true,
          injuryDate: true,
          athlete: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          },
          managingClinician: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: {
          injuryDate: 'desc'
        }
      }),
      prisma.case.count({ where })
    ]);

    return {
      cases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw error;
  }
};

/**
 * CONVENIENCE WRAPPER - Get critical cases by clinician ID
 * Returns: id, athlete name, diagnosis name
 */
export const getCriticalCasesByClinicianId = async (clinicianId: number) => {
  const result = await getCases({
    clinicianId,
    severity: 'CRITICAL'
  });
  
  return result.cases;
};

/**
 * CONVENIENCE WRAPPER - Get active cases by clinician ID with pagination
 * Returns: id, athlete name, diagnosis name
 */
export const getActiveCasesByClinicianId = async (clinicianId: number, page: number = 1, limit: number = 10) => {
  // use pagination
  return getCases({
    clinicianId,
    status: 'ACTIVE' as CaseStatus,
    page,
    limit
  });
};

export const getActiveCasesByPhysioId = async (physioId: number) => {
  // no pagination for physio therapist dashboard
  try {
    const cases = await getCases({
      clinicianId: physioId,
      status: 'ACTIVE' as CaseStatus
    });
    return cases.cases;
  } catch (error) {
    throw error;
  }
};

/**
 * CONVENIENCE WRAPPER - Get all cases by athlete ID
 * Returns: case id, diagnosis name, injury date, status
 */
export const getCasesByAthleteId = async (athleteId: number) => {
  try {
    const cases = await getCases({
      athleteId
    });
    return cases.cases;
  } catch (error) {
    throw error;
  }
};