import { prisma } from '../../config/db.js';

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
