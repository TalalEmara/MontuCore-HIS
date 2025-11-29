const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Create a new session
 */
const createSession = async (sessionData) => {
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
const getAllSessions = async ({ page = 1, limit = 10, status, patientId, caseId }) => {
  const skip = (page - 1) * limit;
  const where = {};
  
  if (status) where.status = status;
  if (patientId) where.patientId = patientId;
  if (caseId) where.caseId = caseId;

  const [sessions, total] = await Promise.all([
    prisma.session.findMany({
      where,
      skip,
      take: parseInt(limit),
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
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get session by ID
 */
const getSessionById = async (sessionId) => {
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
const updateSession = async (sessionId, updates) => {
  if (updates.sessionDate) {
    updates.sessionDate = new Date(updates.sessionDate);
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
const completeSession = async (sessionId, { notes, prescriptions }) => {
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

module.exports = {
  createSession,
  getAllSessions,
  getSessionById,
  updateSession,
  completeSession
};
