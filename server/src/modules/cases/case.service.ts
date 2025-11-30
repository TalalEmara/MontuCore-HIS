import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CaseData {
  patientId: string;
  diagnosis?: string;
  symptoms?: string;
  status?: string;
  priority?: string;
  notes?: string;
  createdBy: string;
}

interface GetAllCasesParams {
  page?: number;
  limit?: number;
  status?: string;
}

/**
 * Create a new case
 */
export const createCase = async (caseData: CaseData) => {
  const newCase = await prisma.case.create({
    data: {
      patientId: caseData.patientId,
      diagnosis: caseData.diagnosis,
      symptoms: caseData.symptoms,
      status: caseData.status || 'OPEN',
      priority: caseData.priority || 'MEDIUM',
      notes: caseData.notes,
      createdBy: caseData.createdBy
    },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
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
export const getAllCases = async ({ page = 1, limit = 10, status }: GetAllCasesParams) => {
  const skip = (page - 1) * limit;
  const where = status ? { status } : {};

  const [cases, total] = await Promise.all([
    prisma.case.findMany({
      where,
      skip,
      take: limit,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
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
export const getCaseById = async (caseId: string) => {
  const caseData = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      patient: true,
      appointments: true,
      sessions: true
    }
  });

  if (!caseData) {
    throw new Error('Case not found');
  }

  return caseData;
};

/**
 * Update case
 */
export const updateCase = async (caseId: string, updates: Partial<CaseData>) => {
  const updatedCase = await prisma.case.update({
    where: { id: caseId },
    data: updates,
    include: {
      patient: {
        select: {
          id: true,
          name: true,
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
export const deleteCase = async (caseId: string) => {
  await prisma.case.delete({
    where: { id: caseId }
  });

  return { message: 'Case deleted successfully' };
};
