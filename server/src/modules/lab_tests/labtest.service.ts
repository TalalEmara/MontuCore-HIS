import { prisma } from '../../config/db.js';
import { validateRequired, validatePositiveInt, validateEnum } from '../../utils/validation.js';
import { NotFoundError, ValidationError } from '../../utils/AppError.js';

interface LabTestFilter {
  caseId?: number;
  athleteId?: number;
  status?: string;
  category?: string;
  dateRange?: { startDate: Date; endDate: Date };
  page?: number;
  limit?: number;
}

// Base: get lab tests with filters + pagination
export const getLabTests = async (filters: LabTestFilter = {}) => {
  try {
    const { caseId,
      athleteId,
      status,
      category,
      dateRange,
      page = 1,
      limit = 10 } = filters;

    const where: any = {};

    // Resolve athlete -> caseIds
    if (athleteId) {
      const cases = await prisma.case.findMany({
        where: { athleteId },
        select: { id: true }
      });
      const caseIds = cases.map(c => c.id);
      if (caseIds.length === 0) {
        return { labTests: [], pagination: { page, limit, total: 0, totalPages: 0 } };
      }
      where.caseId = { in: caseIds };
    } else if (caseId) {
      where.caseId = caseId;
    }

    if (status) where.status = status;
    if (category) where.category = category;
    if (dateRange) {
      where.sampleDate = {
        gte: dateRange.startDate,
        lte: dateRange.endDate
      };
    }

    const skip = (page - 1) * limit;

    const [labTests, total] = await Promise.all([
      prisma.labTest.findMany({
        where,
        select: {
          id: true,
          testName: true,
          category: true,
          status: true,
          resultPdfUrl: true,
          resultValues: true,
          labTechnicianNotes: true,
          sampleDate: true,
          cost: true,
          medicalCase: {
            select: { diagnosisName: true }
          }
        },
        orderBy: { sampleDate: 'desc' },
        skip,
        take: limit
      }),
      prisma.labTest.count({ where })
    ]);

    return {
      labTests,
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
 * Convenience: get lab tests by athlete ID with full pagination
 */
export const getLabTestsByAthleteId = async (athleteId: number, page = 1, limit = 10) => {
  return getLabTests({ athleteId, page, limit });
};

/**
 * Convenience: get lab tests by case ID with full pagination
 */
export const getLabTestsByCaseId = async (caseId: number, page = 1, limit = 10) => {
  return getLabTests({ caseId, page, limit });
};

/**
 * Data interface for creating a lab test
 */
export interface CreateLabTestData {
  caseId: number;
  testName: string; // 'CBC', 'Lipid Profile', 'Blood Glucose', etc.
  category?: string; // 'Hematology', 'Chemistry', 'Microbiology', etc.
  status?: string; // Default: 'PENDING'
  resultPdfUrl?: string;
  resultValues?: any; // JSON object with test values
  labTechnicianNotes?: string;
  sampleDate?: Date;
  cost?: number;
}

/**
 * Create a new lab test
 */
export const createLabTest = async (data: CreateLabTestData) => {
  // Validate required fields
  validateRequired(data, ['caseId', 'testName']);
  validatePositiveInt(data.caseId, 'caseId');

  // Validate status if provided
  if (data.status) {
    const validStatuses = ['PENDING', 'COMPLETED', 'CANCELLED'];
    validateEnum(data.status, validStatuses, 'status');
  }

  // Validate case exists
  const caseExists = await prisma.case.findUnique({
    where: { id: data.caseId },
    select: { id: true, athleteId: true }
  });

  if (!caseExists) {
    throw new NotFoundError('Case not found');
  }

  // Validate cost if provided
  if (data.cost !== undefined && data.cost < 0) {
    throw new ValidationError('Cost must be a positive number');
  }

  // Create the lab test
  const labTest = await prisma.labTest.create({
    data: {
      caseId: data.caseId,
      testName: data.testName,
      category: data.category || null,
      status: data.status || 'PENDING',
      resultPdfUrl: data.resultPdfUrl || null,
      resultValues: data.resultValues || null,
      labTechnicianNotes: data.labTechnicianNotes || null,
      sampleDate: data.sampleDate || new Date(),
      cost: data.cost || null
    },
    include: {
      medicalCase: {
        select: {
          id: true,
          diagnosisName: true,
          athlete: {
            select: {
              id: true,
              fullName: true
            }
          }
        }
      }
    }
  });

  return labTest;
};

/**
 * Get lab test by ID
 */
export const getLabTestById = async (id: number) => {
  validatePositiveInt(id, 'id');

  const labTest = await prisma.labTest.findUnique({
    where: { id },
    include: {
      medicalCase: {
        select: {
          id: true,
          diagnosisName: true,
          athlete: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        }
      }
    }
  });

  if (!labTest) {
    throw new NotFoundError('Lab test not found');
  }

  return labTest;
};

/**
 * Update lab test
 */
export const updateLabTest = async (id: number, data: Partial<CreateLabTestData>) => {
  validatePositiveInt(id, 'id');

  // Check lab test exists
  const labTestExists = await prisma.labTest.findUnique({
    where: { id },
    select: { id: true }
  });

  if (!labTestExists) {
    throw new NotFoundError('Lab test not found');
  }

  // Validate status if provided
  if (data.status) {
    const validStatuses = ['PENDING', 'COMPLETED', 'CANCELLED'];
    validateEnum(data.status, validStatuses, 'status');
  }

  const updatedLabTest = await prisma.labTest.update({
    where: { id },
    data: {
      ...(data.testName && { testName: data.testName }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.status && { status: data.status }),
      ...(data.resultPdfUrl !== undefined && { resultPdfUrl: data.resultPdfUrl }),
      ...(data.resultValues !== undefined && { resultValues: data.resultValues }),
      ...(data.labTechnicianNotes !== undefined && { labTechnicianNotes: data.labTechnicianNotes }),
      ...(data.sampleDate !== undefined && { sampleDate: data.sampleDate }),
      ...(data.cost !== undefined && { cost: data.cost })
    },
    include: {
      medicalCase: {
        select: {
          diagnosisName: true
        }
      }
    }
  });

  return updatedLabTest;
};
