import { prisma } from '../../config/db.js';
import { validateRequired, validatePositiveInt } from '../../utils/validation.js';
import { NotFoundError, ValidationError } from '../../utils/AppError.js';

interface PhysioFilter {
  caseId?: number;
  athleteId?: number;
  page?: number;
  limit?: number;
}

export const getPhysioPrograms = async (filters: PhysioFilter = {}) => {
  const {
    caseId,
    athleteId,
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
      return { physioPrograms: [], pagination: { page, limit, total: 0, totalPages: 0 } };

    where.caseId = { in: caseIds };
  } else if (caseId) {
    where.caseId = caseId;
  }

  const skip = (page - 1) * limit;

  const [programs, total] = await Promise.all([
    prisma.physioProgram.findMany({
      where,
      orderBy: { startDate: 'desc' },
      skip,
      take: limit,
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
    }),
    prisma.physioProgram.count({ where })
  ]);

  return {
    physioPrograms: programs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export interface CreatePhysioProgramData {
  caseId: number;
  title: string;
  numberOfSessions: number;
  sessionsCompleted?: number;
  startDate: Date;
  weeklyRepetition: number;
  costPerSession?: number;
}

export const createPhysioProgram = async (data: CreatePhysioProgramData) => {
  validateRequired(data, [
    'caseId',
    'title',
    'numberOfSessions',
    'startDate',
    'weeklyRepetition'
  ]);

  validatePositiveInt(data.caseId, 'caseId');
  validatePositiveInt(data.numberOfSessions, 'numberOfSessions');
  validatePositiveInt(data.weeklyRepetition, 'weeklyRepetition');

  const caseExists = await prisma.case.findUnique({
    where: { id: data.caseId },
    select: { id: true }
  });

  if (!caseExists) throw new NotFoundError('Case not found');

  if (data.costPerSession !== undefined && data.costPerSession < 0)
    throw new ValidationError('Cost per session must be positive');

  const physio = await prisma.physioProgram.create({
    data: {
      caseId: data.caseId,
      title: data.title,
      numberOfSessions: data.numberOfSessions,
      sessionsCompleted: data.sessionsCompleted ?? 0,
      startDate: data.startDate,
      weeklyRepetition: data.weeklyRepetition,
      costPerSession: data.costPerSession || null
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

  // 🔗 Auto-attach to invoice if exists
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { caseId: physio.caseId }
    });

    if (invoice) {
      const items: any = invoice.items || {};
      if (!items.physioPrograms) items.physioPrograms = [];

      const totalCost =
        physio.costPerSession
          ? physio.costPerSession * physio.numberOfSessions
          : 0;

      items.physioPrograms.push({
        id: physio.id,
        type: 'Physio Program',
        description: physio.title,
        numberOfSessions: physio.numberOfSessions,
        costPerSession: physio.costPerSession || 0,
        totalCost
        });

      const subtotal =
        (items.appointment?.cost || 0) +
        (items.exams?.reduce((s: any, e: any) => s + (e.cost || 0), 0) || 0) +
        (items.labTests?.reduce((s: any, l: any) => s + (l.cost || 0), 0) || 0) +
        (items.treatments?.reduce((s: any, t: any) => s + (t.cost || 0), 0) || 0) +
        (items.physioPrograms?.reduce((s: any, p: any) => s + (p.cost || 0), 0) || 0);

      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          items,
          subtotal,
          totalAmount: subtotal
        }
      });
    }
  } catch (err) {
    console.error('Failed updating invoice for physio program', err);
  }

  return physio;
};

export const getPhysioProgramById = async (id: number) => {
  validatePositiveInt(id, 'id');

  const physio = await prisma.physioProgram.findUnique({
    where: { id },
    include: {
      medicalCase: {
        select: {
          id: true,
          diagnosisName: true,
          athlete: {
            select: { id: true, fullName: true, email: true }
          }
        }
      }
    }
  });

  if (!physio) throw new NotFoundError('Physio program not found');

  return physio;
};

export const updatePhysioProgram = async (
  id: number,
  data: Partial<CreatePhysioProgramData>
) => {
  validatePositiveInt(id, 'id');

  const exists = await prisma.physioProgram.findUnique({
    where: { id },
    select: { id: true }
  });

  if (!exists) throw new NotFoundError('Physio program not found');

  if (data.costPerSession !== undefined && data.costPerSession < 0)
    throw new ValidationError('Cost per session must be positive');

  return prisma.physioProgram.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.numberOfSessions !== undefined && { numberOfSessions: data.numberOfSessions }),
      ...(data.sessionsCompleted !== undefined && { sessionsCompleted: data.sessionsCompleted }),
      ...(data.startDate !== undefined && { startDate: data.startDate }),
      ...(data.weeklyRepetition !== undefined && { weeklyRepetition: data.weeklyRepetition }),
      ...(data.costPerSession !== undefined && { costPerSession: data.costPerSession })
    },
    include: {
      medicalCase: {
        select: { diagnosisName: true }
      }
    }
  });
};
