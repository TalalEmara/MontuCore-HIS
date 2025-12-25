import { prisma } from '../../config/db.js';

interface ExamFilters {
  caseId?: number;
  athleteId?: number;
  modality?: string;
  status?: string;
  dateRange?: { startDate: Date; endDate: Date };
  isToday?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Base: get exams with flexible filters + pagination
 */
export const getExams = async (filters: ExamFilters = {}) => {
  const {
    caseId,
    athleteId,
    modality,
    status,
    dateRange,
    isToday,
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
      return { exams: [], pagination: { page, limit, total: 0, totalPages: 0 } };
    }
    where.caseId = { in: caseIds };
  } else if (caseId) {
    where.caseId = caseId;
  }

  if (modality) where.modality = modality;
  if (status) where.status = status;

  if (isToday) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    where.performedAt = { gte: startOfDay, lte: endOfDay };
  } else if (dateRange) {
    where.performedAt = { gte: dateRange.startDate, lte: dateRange.endDate };
  }

  const skip = (page - 1) * limit;

  const [exams, total] = await Promise.all([
    prisma.exam.findMany({
      where,
      select: {
        id: true,
        modality: true,
        bodyPart: true,
        status: true,
        scheduledAt: true,
        performedAt: true,
        radiologistNotes: true,
        conclusion: true,
        medicalCase: {
          select: { diagnosisName: true }
        },
        images: {
          select: {
            id: true,
            fileName: true,
            publicUrl: true,
            uploadedAt: true
          }
        }
      },
      orderBy: { performedAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.exam.count({ where })
  ]);

  return {
    exams,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/** Convenience: exams for athlete with full pagination */
export const getExamsByAthleteId = async (athleteId: number, page = 1, limit = 10) => {
  return getExams({ athleteId, page, limit });
};

/** Convenience: exams for a case with full pagination */
export const getExamsByCaseId = async (caseId: number, page = 1, limit = 10) => {
  return getExams({ caseId, page, limit });
};
