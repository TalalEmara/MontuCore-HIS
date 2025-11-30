import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SessionData {
  patientId: string;
  doctorId: string;
  caseId?: string;
  appointmentId?: string;
  sessionDate?: string;
  chiefComplaint?: string;
  vitalSigns?: any;
  examination?: string;
  diagnosis?: string;
  treatment?: string;
  prescriptions?: any;
  notes?: string;
  status?: string;
  createdBy: string;
}

interface GetAllSessionsParams {
  page?: number;
  limit?: number;
  status?: string;
  patientId?: string;
  caseId?: string;
}

interface CompleteSessionData {
  notes?: string;
  prescriptions?: any;
}

/**
 * Create a new session
 */
export const createSession = async (sessionData: SessionData) => {
  const newSession = await prisma.session.create({
    data: {
      patientId: sessionData.patientId,
      doctorId: sessionData.doctorId,
      caseId: sessionData.caseId,
      appointmentId: sessionData.appointmentId,
      sessionDate: sessionData.sessionDate ? new Date(sessionData.sessionDate) : new Date(),
      chiefComplaint: sessionData.chiefComplaint,
      vitalSigns: sessionData.vitalSigns,
      examination: sessionData.examination,
      diagnosis: sessionData.diagnosis,
      treatment: sessionData.treatment,
      prescriptions: sessionData.prescriptions,
      notes: sessionData.notes,
      status: sessionData.status || 'IN_PROGRESS',
      createdBy: sessionData.createdBy
    },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      doctor: {
        select: {
          id: true,
          name: true,
          specialization: true
        }
      },
      case: {
        select: {
          id: true,
          diagnosis: true
        }
      }
    }
  });

  return newSession;
};

/**
 * Get all sessions with pagination and filters
 */
export const getAllSessions = async ({ page = 1, limit = 10, status, patientId, caseId }: GetAllSessionsParams) => {
  const skip = (page - 1) * limit;
  const where: any = {};
  
  if (status) where.status = status;
  if (patientId) where.patientId = patientId;
  if (caseId) where.caseId = caseId;

  const [sessions, total] = await Promise.all([
    prisma.session.findMany({
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
        },
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true
          }
        },
        case: {
          select: {
            id: true,
            diagnosis: true
          }
        }
      },
      orderBy: {
        sessionDate: 'desc'
      }
    }),
    prisma.session.count({ where })
  ]);

  return {
    sessions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get session by ID
 */
export const getSessionById = async (sessionId: string) => {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      patient: true,
      doctor: true,
      case: true,
      appointment: true
    }
  });

  if (!session) {
    throw new Error('Session not found');
  }

  return session;
};

/**
 * Update session
 */
export const updateSession = async (sessionId: string, updates: Partial<SessionData>) => {
  if (updates.sessionDate) {
    (updates as any).sessionDate = new Date(updates.sessionDate);
  }

  const updatedSession = await prisma.session.update({
    where: { id: sessionId },
    data: updates,
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      doctor: {
        select: {
          id: true,
          name: true,
          specialization: true
        }
      }
    }
  });

  return updatedSession;
};

/**
 * Complete session
 */
export const completeSession = async (sessionId: string, { notes, prescriptions }: CompleteSessionData) => {
  const completedSession = await prisma.session.update({
    where: { id: sessionId },
    data: {
      status: 'COMPLETED',
      notes,
      prescriptions,
      completedAt: new Date()
    },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      doctor: {
        select: {
          id: true,
          name: true,
          specialization: true
        }
      }
    }
  });

  return completedSession;
};
