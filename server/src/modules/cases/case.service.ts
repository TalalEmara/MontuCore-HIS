import { Severity, CaseStatus } from '@prisma/client';
import { prisma } from '../../config/db.js';
import { get } from 'http';

interface CaseData {
  athleteId:           number;
  managingClinicianId: number;
  initialAppointmentId?: number; // Optional: The appointment where case was first detected
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
}

interface GetCasesFilterParams {
  clinicianId?: number;
  athleteId?: number;
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
 * Get case by ID
 */
export const getCaseById = async (caseId: number) => {
  const caseData = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      athlete: true,
      managingClinician: true,
      initialAppointment: true,
      appointments: true,
      exams: {
        include: {
          images: true
        }
      },
      labTests: true,
      treatments: true,
      physioPrograms: true
    }
  });

  if (!caseData) {
    throw new Error('Case not found');
  }

  return caseData;
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
              fullName: true
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
  return getCases({
    clinicianId,
    status: 'ACTIVE' as CaseStatus,
    page,
    limit
  });
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