import { PrismaClient, Severity, CaseStatus } from '@prisma/client';
import { prisma } from '../../index.js';
// const prisma = new PrismaClient();

interface CaseData {
  athleteId:           number;
  managingClinicianId: number;
  appointmentId:       number;
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

/**
 * Create a new case
 */
export const createCase = async (caseData: CaseData) => {
  const newCase = await prisma.case.create({
    data: {
      athleteId: caseData.athleteId,
      managingClinicianId: caseData.managingClinicianId,
      appointmentId: caseData.appointmentId,
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
      originAppointment: true,
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
