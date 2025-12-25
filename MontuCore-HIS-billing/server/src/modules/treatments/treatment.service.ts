import { prisma } from '../../config/db.js';

interface TreatmentFilters {
  caseId?: number;
  athleteId?: number;
  type?: string;
  dateRange?: { startDate: Date; endDate: Date };
  page?: number;
  limit?: number;
}

/**
 * Base: get treatments with flexible filters + pagination
 */
export const getTreatments = async (filters: TreatmentFilters = {}) => {
  try {
    const {
      caseId,
      athleteId,
      type,
      dateRange,
      page = 1,
      limit = 10
    } = filters;

    const where: any = {};

    // Resolve athlete -> caseIds if provided
    if (athleteId) {
      const cases = await prisma.case.findMany({
        where: { athleteId },
        select: { id: true }
      });
      const caseIds = cases.map(c => c.id);
      if (caseIds.length === 0) {
        return { treatments: [], pagination: { page, limit, total: 0, totalPages: 0 } };
      }
      where.caseId = { in: caseIds };
    } else if (caseId) {
      where.caseId = caseId;
    }

    if (type) where.type = type;
    if (dateRange) {
      where.date = {
        gte: dateRange.startDate,
        lte: dateRange.endDate
      };
    }

    const skip = (page - 1) * limit;

    const [treatments, total] = await Promise.all([
      prisma.treatment.findMany({
        where,
        select: {
          id: true,
          type: true,
          description: true,
          providerName: true,
          date: true,
          cost: true,
          medicalCase: {
            select: { diagnosisName: true }
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit
      }),
      prisma.treatment.count({ where })
    ]);

    return {
      treatments,
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
 * Convenience: get treatments by athlete ID with pagination
 */
export const getTreatmentsByAthleteId = async (athleteId: number, page = 1, limit = 10) => {
  return getTreatments({ athleteId, page, limit });
};

/**
 * Convenience: get treatments by case ID with pagination
 */
export const getTreatmentsByCaseId = async (caseId: number, page = 1, limit = 10) => {
  return getTreatments({ caseId, page, limit });
};


