import { prisma } from '../../config/db.js';
import { validateRequired, validatePositiveInt } from '../../utils/validation.js';
import { NotFoundError, ValidationError } from '../../utils/AppError.js';

interface TreatmentFilter {
  id?: number;
  caseId?: number;
  athleteId?: number;
  type?: string;
  page?: number;
  limit?: number;
}

export const getTreatments = async (filters: TreatmentFilter = {}) => {
  const {
    caseId,
    athleteId,
    type,
    page = 1,
    limit = 10
  } = filters;

  const where: any = {};

  if (athleteId) {
    const cases = await prisma.case.findMany({
      where: { athleteId },
      select: { id: true }
    });

    const caseIds = cases.map(c => c.id);
    
    if (!caseIds.length)
      return { treatments: [], pagination: { page, limit, total: 0, totalPages: 0 } };

    where.caseId = { in: caseIds };
  } else if (caseId) {
    where.caseId = caseId;
  }

  if (type) where.type = type;

  const skip = (page - 1) * limit;

  const [treatments, total] = await Promise.all([
    prisma.treatment.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take: limit,
      include: {
        medicalCase: {
          select: {
            id: true,
            diagnosisName: true,
            athlete: {
              select: { id: true, fullName: true }
            }
          }
        }
      }
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
};

export const getTreatmentsByCaseId = (caseId: number, page = 1, limit = 10) =>
  getTreatments({ caseId, page, limit });

export const getTreatmentById = (id: number) => 
  getTreatments({id});

export const getTreatmentsByAthleteId = (athleteId: number, page = 1, limit = 10) =>
  getTreatments({ athleteId, page, limit });

export interface CreateTreatmentData {
  caseId: number;
  type: string;
  description: string;
  providerName?: string;
  cost?: number;
  date?: Date;
}

export const createTreatment = async (data: CreateTreatmentData) => {
  validateRequired(data, ['caseId', 'type', 'description']);
  validatePositiveInt(data.caseId, 'caseId');

  const caseExists = await prisma.case.findUnique({
    where: { id: data.caseId },
    select: { id: true }
  });

  if (!caseExists) throw new NotFoundError('Case not found');

  if (data.cost !== undefined && data.cost < 0)
    throw new ValidationError('Cost must be a positive number');

  const treatment = await prisma.treatment.create({
    data: {
      caseId: data.caseId,
      type: data.type,
      description: data.description,
      providerName: data.providerName || null,
      cost: data.cost || null,
      date: data.date || new Date()
    },
    include: {
      medicalCase: {
        select: {
          id: true,
          diagnosisName: true,
          athlete: {
            select: { id: true, fullName: true }
          }
        }
      }
    }
  });

  // 🔗 Attach to invoice if exists (no recalculation)
  try {
    const existingInvoice = await prisma.invoice.findFirst({
      where: { caseId: treatment.caseId }
    });

    if (existingInvoice) {
      const items: any = existingInvoice.items || {};

      if (!items.treatments) items.treatments = [];

      items.treatments.push({
        id: treatment.id,
        type: 'Treatment',
        description: treatment.description,
        cost: treatment.cost || 0
      });

      await prisma.invoice.update({
        where: { id: existingInvoice.id },
        data: { items }
      });
    }
  } catch (e) {
    console.error('Failed to update invoice after treatment creation', e);
  }

  return treatment;
};



export const updateTreatment = async (id: number, data: Partial<CreateTreatmentData>) => {
  validatePositiveInt(id, 'id');

  const exists = await prisma.treatment.findUnique({ where: { id }, select: { id: true } });
  if (!exists) throw new NotFoundError('Treatment not found');

  if (data.cost !== undefined && data.cost < 0)
    throw new ValidationError('Cost must be positive');

  return prisma.treatment.update({
    where: { id },
    data: {
      ...(data.type && { type: data.type }),
      ...(data.description && { description: data.description }),
      ...(data.providerName !== undefined && { providerName: data.providerName }),
      ...(data.cost !== undefined && { cost: data.cost }),
      ...(data.date !== undefined && { date: data.date })
    },
    include: {
      medicalCase: {
        select: { diagnosisName: true }
      }
    }
  });
};



/**
 * Delete a treatment
 */
export const deleteTreatment = async (treatmentId: number) => {
  try {
    await prisma.treatment.delete({
      where: { id: treatmentId }
    });
  } catch (error) {
    throw error;
  }
};


