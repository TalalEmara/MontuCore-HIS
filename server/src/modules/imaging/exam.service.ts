import { prisma } from '../../config/db.js';
import { validateRequired, validatePositiveInt, validateEnum } from '../../utils/validation.js';
import { NotFoundError, ValidationError } from '../../utils/AppError.js';

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

/**
 * Data interface for creating an exam
 */
export interface CreateExamData {
  caseId: number;
  modality: string; // 'MRI', 'CT', 'X-RAY', 'Ultrasound'
  bodyPart: string; // 'Knee', 'Shoulder', 'Head', etc.
  status?: string; // Default: 'ORDERED'
  scheduledAt?: Date;
  performedAt?: Date;
  radiologistNotes?: string;
  conclusion?: string;
  cost?: number;
}

/**
 * Create a new exam
 */
export const createExam = async (data: CreateExamData) => {
  // Validate required fields
  validateRequired(data, ['caseId', 'modality', 'bodyPart']);
  validatePositiveInt(data.caseId, 'caseId');

  // Validate modality
  const validModalities = ['MRI', 'CT', 'X-RAY', 'Ultrasound', 'PET', 'DEXA'];
  validateEnum(data.modality, validModalities, 'modality');

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

  // Create the exam
  const exam = await prisma.exam.create({
    data: {
      caseId: data.caseId,
      modality: data.modality,
      bodyPart: data.bodyPart,
      status: data.status || 'ORDERED',
      scheduledAt: data.scheduledAt || null,
      performedAt: data.performedAt || null,
      radiologistNotes: data.radiologistNotes || null,
      conclusion: data.conclusion || null,
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
      },
      images: true
    }
  });

  return exam;
};

/**
 * Get exam by ID
 */
export const getExamById = async (id: number) => {
  validatePositiveInt(id, 'id');

  const exam = await prisma.exam.findUnique({
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
      },
      images: {
        select: {
          id: true,
          fileName: true,
          publicUrl: true,
          uploadedAt: true
        }
      }
    }
  });

  if (!exam) {
    throw new NotFoundError('Exam not found');
  }

  return exam;
};

/**
 * Update exam
 */
export const updateExam = async (id: number, data: Partial<CreateExamData>) => {
  validatePositiveInt(id, 'id');

  // Check exam exists
  const examExists = await prisma.exam.findUnique({
    where: { id },
    select: { id: true }
  });

  if (!examExists) {
    throw new NotFoundError('Exam not found');
  }

  // Validate modality if provided
  if (data.modality) {
    const validModalities = ['MRI', 'CT', 'X-RAY', 'Ultrasound', 'PET', 'DEXA'];
    validateEnum(data.modality, validModalities, 'modality');
  }

  const updatedExam = await prisma.exam.update({
    where: { id },
    data: {
      ...(data.modality && { modality: data.modality }),
      ...(data.bodyPart && { bodyPart: data.bodyPart }),
      ...(data.status && { status: data.status }),
      ...(data.scheduledAt !== undefined && { scheduledAt: data.scheduledAt }),
      ...(data.performedAt !== undefined && { performedAt: data.performedAt }),
      ...(data.radiologistNotes !== undefined && { radiologistNotes: data.radiologistNotes }),
      ...(data.conclusion !== undefined && { conclusion: data.conclusion }),
      ...(data.cost !== undefined && { cost: data.cost })
    },
    include: {
      medicalCase: {
        select: {
          diagnosisName: true
        }
      },
      images: true
    }
  });

  return updatedExam;
};
