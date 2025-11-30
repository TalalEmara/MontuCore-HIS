import { PrismaClient, ApptStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface AppointmentData {
  athleteId: number;
  clinicianId: number;
  scheduledAt: string;
  height?: number;
  weight?: number;
  status?: ApptStatus;
  diagnosisNotes?: string;
}

interface GetAllAppointmentsParams {
  page?: number;
  limit?: number;
  status?: ApptStatus;
  athleteId?: number | undefined;
  clinicianId?: number | undefined;
  date?: string;
}

/**
 * Create a new appointment
 */
export const createAppointment = async (appointmentData: AppointmentData) => {
  // Check for conflicting appointments
  const conflictingAppointment = await prisma.appointment.findFirst({
    where: {
      clinicianId: appointmentData.clinicianId,
      scheduledAt: new Date(appointmentData.scheduledAt),
      status: {
        not: ApptStatus.CANCELLED
      }
    }
  });

  if (conflictingAppointment) {
    throw new Error('Clinician already has an appointment at this time');
  }

  const newAppointment = await prisma.appointment.create({
    data: {
      athleteId: appointmentData.athleteId,
      clinicianId: appointmentData.clinicianId,
      scheduledAt: new Date(appointmentData.scheduledAt),
      height: appointmentData.height ?? null,
      weight: appointmentData.weight ?? null,
      status: appointmentData.status || ApptStatus.SCHEDULED,
      diagnosisNotes: appointmentData.diagnosisNotes ?? null
    },
    include: {
      athlete: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      },
      clinician: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });

  return newAppointment;
};

/**
 * Get all appointments with pagination and filters
 */
export const getAllAppointments = async ({ page = 1, limit = 10, status, athleteId, clinicianId, date }: GetAllAppointmentsParams) => {
  const skip = (page - 1) * limit;
  const where: any = {};
  
  if (status) where.status = status;
  if (athleteId) where.athleteId = athleteId;
  if (clinicianId) where.clinicianId = clinicianId;
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
      take: limit,
      include: {
        athlete: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        clinician: {
          select: {
            id: true,
            fullName: true,
            email: true
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
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get appointment by ID
 */
export const getAppointmentById = async (appointmentId: number) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      athlete: true,
      clinician: true,
      generatedCase: true
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
export const updateAppointment = async (appointmentId: number, updates: Partial<AppointmentData>) => {
  const updateData: any = {};
  
  if (updates.scheduledAt) updateData.scheduledAt = new Date(updates.scheduledAt);
  if (updates.height !== undefined) updateData.height = updates.height;
  if (updates.weight !== undefined) updateData.weight = updates.weight;
  if (updates.status) updateData.status = updates.status;
  if (updates.diagnosisNotes) updateData.diagnosisNotes = updates.diagnosisNotes;

  const updatedAppointment = await prisma.appointment.update({
    where: { id: appointmentId },
    data: updateData,
    include: {
      athlete: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      },
      clinician: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });

  return updatedAppointment;
};

/**
 * Cancel appointment
 */
export const cancelAppointment = async (appointmentId: number, reason?: string) => {
  const cancelledAppointment = await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      status: ApptStatus.CANCELLED,
      diagnosisNotes: reason ? `Cancelled: ${reason}` : 'Cancelled'
    },
    include: {
      athlete: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });

  return cancelledAppointment;
};
