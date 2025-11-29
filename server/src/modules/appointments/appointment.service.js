const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Create a new appointment
 */
const createAppointment = async (appointmentData) => {
  // Check for conflicting appointments
  const conflictingAppointment = await prisma.appointment.findFirst({
    where: {
      doctorId: appointmentData.doctorId,
      scheduledAt: new Date(appointmentData.scheduledAt),
      status: {
        not: 'CANCELLED'
      }
    }
  });

  if (conflictingAppointment) {
    throw new Error('Doctor already has an appointment at this time');
  }

  const newAppointment = await prisma.appointment.create({
    data: {
      patientId: appointmentData.patientId,
      doctorId: appointmentData.doctorId,
      caseId: appointmentData.caseId,
      scheduledAt: new Date(appointmentData.scheduledAt),
      duration: appointmentData.duration || 30,
      type: appointmentData.type || 'CONSULTATION',
      status: appointmentData.status || 'SCHEDULED',
      notes: appointmentData.notes,
      createdBy: appointmentData.createdBy
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

  return newAppointment;
};

/**
 * Get all appointments with pagination and filters
 */
const getAllAppointments = async ({ page = 1, limit = 10, status, patientId, doctorId, date }) => {
  const skip = (page - 1) * limit;
  const where = {};
  
  if (status) where.status = status;
  if (patientId) where.patientId = patientId;
  if (doctorId) where.doctorId = doctorId;
  if (date) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    where.scheduledAt = {
      gte: startDate,
      lt: endDate
    };
  }

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
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
        }
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    }),
    prisma.appointment.count({ where })
  ]);

  return {
    appointments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get appointment by ID
 */
const getAppointmentById = async (appointmentId) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: true,
      doctor: true,
      case: true
    }
  });

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  return appointment;
};

/**
 * Update appointment
 */
const updateAppointment = async (appointmentId, updates) => {
  if (updates.scheduledAt) {
    updates.scheduledAt = new Date(updates.scheduledAt);
  }

  const updatedAppointment = await prisma.appointment.update({
    where: { id: appointmentId },
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

  return updatedAppointment;
};

/**
 * Cancel appointment
 */
const cancelAppointment = async (appointmentId, reason) => {
  const cancelledAppointment = await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      status: 'CANCELLED',
      notes: reason ? `Cancelled: ${reason}` : 'Cancelled'
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

  return cancelledAppointment;
};

module.exports = {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment
};
