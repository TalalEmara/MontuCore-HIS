import { PrismaClient, ApptStatus, Prisma } from '@prisma/client';
import { prisma } from '../../index.js'
import * as billingService from '../billing/billing.service.js';
import { localToUTC, utcToLocalByTimezone } from '../../utils/timezone.js';
//const prisma = new PrismaClient();

interface AppointmentData {
  athleteId: number;
  clinicianId: number;
  scheduledAt: string;
  height?: number;
  weight?: number;
  status?: ApptStatus;
  diagnosisNotes?: string;
  caseId?: number;
  timezone?: string; // e.g., "Europe/Berlin", "America/New_York"
}

interface GetAllAppointmentsParams {
  page?: number;
  limit?: number;
  status?: ApptStatus;
  athleteName?: string;
  clinicianName?: string;
  date?: string;
  caseId?: number;
  clinicianId?: number;
  athleteId?: number;
}


interface GetAppointmentsFilterParams {
  clinicianId?: number;
  athleteId?: number;
  caseId?: number;
  status?: ApptStatus;
  page?: number;
  limit?: number;
  isToday?: boolean;
  dateRange?: { startDate: Date; endDate: Date };
  timezone?: string | undefined; // User's timezone for date filtering and response formatting
}

/**
 * Helper: Get timezone offset in minutes
 */
const DEFAULT_TIMEZONE = 'Africa/Cairo'; // Egypt GMT+2

function getTimezoneOffsetInMinutes(timezone: string = DEFAULT_TIMEZONE): number {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const formatted = parts.reduce((acc, part) => {
    if (part.type === 'literal') return acc;
    return { ...acc, [part.type]: part.value };
  }, {} as Record<string, string>);

  const localDate = new Date(
    `${formatted.year}-${formatted.month}-${formatted.day}T${formatted.hour}:${formatted.minute}:${formatted.second}`
  );

  return Math.round((now.getTime() - localDate.getTime()) / (1000 * 60));
}

/**
 * Create a new appointment
 */
export const createAppointment = async(appointmentData : AppointmentData) => {
  try{
    // Convert local time (Egypt timezone) to UTC for storage
    let scheduledDate = new Date(appointmentData.scheduledAt);
    // scheduledDate = localToUTC(appointmentData.scheduledAt, offset); // Input is already UTC

    /*
      Some Important Checks
        1-> scheduledAt should be in the future
        2-> Clinician should not have another appointment at the same time
        3-> Athlete should not have another appointment at the same time
        4-> at least 30 min between each appointment for the same clinician
    */
    const now = new Date();
    if (scheduledDate <= now){
      throw new Error('Appointment must be scheduled for a future date and time');
    }

    // Check for clinician conflicts
    const appointmentConflicted = await prisma.appointment.findFirst(
      {
        where: {
          clinicianId: appointmentData.clinicianId,
          scheduledAt: new Date(appointmentData.scheduledAt),
          status: ApptStatus.SCHEDULED
        }
      }
    )
    if (appointmentConflicted){
      throw new Error('Clinician already has an appointment at this time');
    }

    // Check for athlete conflicts
    const athleteAppointmentConflicted = await prisma.appointment.findFirst(
      {
        where: {
          athleteId: appointmentData.athleteId,
          scheduledAt: new Date(appointmentData.scheduledAt),
          status: ApptStatus.SCHEDULED
        }
      }
    )
    if (athleteAppointmentConflicted){
      throw new Error('Athlete already has an appointment at this time');
    }

    // Check for at least 30 minutes gap between appointments for the same clinician
    const thirtyMinutes = 30 * 60 * 1000; // in milliseconds
    // Getting the time range to check
    const startRange = new Date(scheduledDate.getTime() - thirtyMinutes);
    const endRange = new Date(scheduledDate.getTime() + thirtyMinutes);
    const overlappingAppointment = await prisma.appointment.findFirst({
      where: {
        clinicianId: appointmentData.clinicianId,
        scheduledAt: {
          // the scheduledAt falls within the range of startRange and endRange
          gte: startRange,
          lte: endRange
        },
        status: ApptStatus.SCHEDULED
      }
    });
    // If there is an overlapping appointment, throw an error
    if (overlappingAppointment){
      const availableTime = new Date(overlappingAppointment.scheduledAt.getTime() + thirtyMinutes);
      throw new Error('Booked appointments must have at least 30 minutes gap. Next available time is ' + availableTime.toISOString());
    }

    // Create the appointment
    const newAppointment = await prisma.appointment.create({
      data: {
        athleteId: appointmentData.athleteId,
        clinicianId: appointmentData.clinicianId,
        scheduledAt: new Date(appointmentData.scheduledAt),
        height: appointmentData.height ?? null,
        weight: appointmentData.weight ?? null,
        status: appointmentData.status || ApptStatus.SCHEDULED,
        caseId: appointmentData.caseId ?? null,
        diagnosisNotes: appointmentData.diagnosisNotes ?? null
      }
    })

    if(!newAppointment){
      throw new Error('Failed to create appointment');
    }
    return newAppointment;
  }

  catch(error){
    return error;
  }
}

export const updateAppointment = async(appointmentID: number, appointmentData : AppointmentData) => {
  // Update an existing appointment, not all fields are required, change only the provided fields
  try{
    const existingAppointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentID
      }
    });
    if (!existingAppointment){
      throw new Error('Appointment not found');
    }
    // Prepare updated data
    const updatedData: any = {};
    if (appointmentData.athleteId) updatedData.athleteId = appointmentData.athleteId;
    if (appointmentData.clinicianId) updatedData.clinicianId = appointmentData.clinicianId;
    if (appointmentData.scheduledAt) {
      // Convert local time (Egypt timezone) to UTC for storage
      // const offset = getTimezoneOffsetInMinutes();
      // updatedData.scheduledAt = localToUTC(appointmentData.scheduledAt, offset);
      updatedData.scheduledAt = new Date(appointmentData.scheduledAt); // Input is already UTC
    }
    if (appointmentData.height !== undefined) updatedData.height = appointmentData.height;
    if (appointmentData.weight !== undefined) updatedData.weight = appointmentData.weight;
    if (appointmentData.status) updatedData.status = appointmentData.status;
    if (appointmentData.diagnosisNotes !== undefined) updatedData.diagnosisNotes = appointmentData.diagnosisNotes;
    if (appointmentData.caseId !== undefined) updatedData.caseId = appointmentData.caseId;
    const updatedAppointment = await prisma.appointment.update({
      where: {
        id: appointmentID
      },
      data: updatedData
    });
    return updatedAppointment;
  }
  catch(error){
    return error;
  }
}

export const updateAppointmentStatus = async (appointmentID: number, status: ApptStatus) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentID },
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentID },
      data: { status },
    });

    // Auto-create invoice if appointment is COMPLETED
    if (status === ApptStatus.COMPLETED) {
      const invoiceData: any = {
        athleteId: appointment.athleteId,
        clinicianId: appointment.clinicianId,
        appointmentId: appointment.id,
        items: [
          {
            quantity: 1,
            unitPrice: 0,
            description: 'Appointment services (covered by insurance)',
          },
        ],
        notes: 'Automatically generated invoice for completed appointment',
        createdBy: appointment.clinicianId,
        caseId: appointment.caseId ?? undefined, // safely add caseId if exists
      };

      await billingService.createInvoice(invoiceData);
    }

    // Return the usual response
    const responseData = {
      "Athlete Name": await prisma.user
        .findUnique({ where: { id: appointment.athleteId } })
        ?.then((athlete) => athlete?.fullName),
      "Clinician Name": await prisma.user
        .findUnique({ where: { id: appointment.clinicianId } })
        ?.then((clinician) => clinician?.fullName),
      "Scheduled At": appointment.scheduledAt,
      "Status": updatedAppointment.status,
      "Diagnosis Notes": appointment.diagnosisNotes,
    };

    return responseData;
  } catch (error) {
    return error;
  }
};



export const getAppointment = async(appointmentID: number) => {
  try{
    const appointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentID}
    });

    if (!appointment){
      throw new Error('Appointment not found');
    }

    const responseData = {
      "Athelte Name" : await prisma.user.findUnique({
        where: {
          id: appointment.athleteId}
        }
        )?.then(athlete => athlete?.fullName),


      "Clinician Name" : await prisma.user.findUnique({
        where: {
          id: appointment.clinicianId}
        })?.then(clinician => clinician?.fullName),


      "Scheduled At" : appointment.scheduledAt,
      "Status" : appointment.status,
      "Diagnosis Notes" : appointment.diagnosisNotes
    }
    return responseData;
  }

  catch(error){
    return error;
  }
}


export const deleteAppointment = async(appointmentID: number) => {
  try{
    const appointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentID}
    });

    if(!appointment){
      throw new Error('Appointment not found');
    }

    await prisma.appointment.delete({
      where: {
        id: appointmentID}
    });

    return 'Appointment deleted successfully';
  }
  catch(error){
    return 'Unknown error occurred';
  }
}

// When we return a lot of data,we will use pagination to limit the amount of data returned.
export const getAllAppointments = async({ page = 1, limit = 10, status, athleteName, clinicianName, date, caseId, clinicianId, athleteId }: GetAllAppointmentsParams = {}) => {
  try{
    // Return all appointments
    const where: Prisma.AppointmentWhereInput = {};
    if (status) where.status = status;
    if (date) where.scheduledAt = new Date(date);
    if (caseId) where.caseId = caseId;
    if (clinicianId) where.clinicianId = clinicianId;
    if (athleteId) where.athleteId = athleteId;
    const appointments = await prisma.appointment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        select: {
        id: true,
        scheduledAt: true,
        height: true,
        weight: true,
        status: true,
        diagnosisNotes: true,
        athlete: {
          select: { fullName: true }
        },
        clinician: {
          select: { fullName: true }
        }
      }
    });
    return appointments;
  }
  catch(error){
    return error;
  }
} 




/**
 * FLEXIBLE BASE FUNCTION - Get appointments with multiple filter options
 * Supports: clinician, athlete, status, pagination, date filtering
 * @example getAppointments({ clinicianId: 1, isToday: true })
 * @example getAppointments({ athleteId: 5, status: 'SCHEDULED' })
 * @example getAppointments({ clinicianId: 1, dateRange: { startDate: new Date(), endDate: new Date() } })
 */
export const getAppointments = async (filters: GetAppointmentsFilterParams = {}) => {
  try {
    const {
      clinicianId,
      athleteId,
      status,
      caseId,
      page = 1,
      limit = 10,
      isToday,
      dateRange,
      timezone = DEFAULT_TIMEZONE
    } = filters;

    const where: any = {};

    // Apply filters
    if (clinicianId) where.clinicianId = clinicianId;
    if (athleteId) where.athleteId = athleteId;
    if (status) where.status = status;
    if (caseId) where.caseId = caseId;

    // Date filtering (timezone-aware, defaults to Egypt)
    if (isToday) {
      const now = new Date();
      const offset = getTimezoneOffsetInMinutes(timezone);
      // Adjust now to local timezone
      const localNow = new Date(now.getTime() + offset * 60 * 1000);
      // Create local start and end of day, then convert back to UTC
      const localStart = new Date(Date.UTC(
        localNow.getUTCFullYear(),
        localNow.getUTCMonth(),
        localNow.getUTCDate(),
        0, 0, 0
      ));
      const localEnd = new Date(Date.UTC(
        localNow.getUTCFullYear(),
        localNow.getUTCMonth(),
        localNow.getUTCDate(),
        23, 59, 59
      ));
      const startOfDay = new Date(localStart.getTime() - offset * 60 * 1000);
      const endOfDay = new Date(localEnd.getTime() - offset * 60 * 1000);

      where.scheduledAt = {
        gte: startOfDay,
        lte: endOfDay
      };
    } else if (dateRange) {
      where.scheduledAt = {
        gte: dateRange.startDate,
        lte: dateRange.endDate
      };
    }

    const skip = (page - 1) * limit;

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        select: {
          id: true,
          scheduledAt: true,
          height: true,
          weight: true,
          status: true,
          diagnosisNotes: true,
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
        skip,
        take: limit,
        orderBy: {
          scheduledAt: 'asc'
        }
      }),
      prisma.appointment.count({ where })
    ]);

    // Convert times to local timezone (Egypt by default)
    const formattedAppointments = appointments.map(apt => ({
      ...apt,
      scheduledAt: utcToLocalByTimezone(apt.scheduledAt, timezone)
    }));

    return {
      appointments: formattedAppointments,
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
 * CONVENIENCE WRAPPER - Get appointments for clinician for today only
 */
export const getTodaysAppointmentsByClinicianId = async (clinicianId: number, timezone?: string) => {
  try {
    const result = await getAppointments({
      clinicianId,
      isToday: true,
      timezone
    });
    return result.appointments;
  } catch (error) {
    throw error;
  }
};

export const getTodaysAppointmentsByPhysioId = async (physioId: number, timezone?: string) => {
  try {
    const result = await getAppointments({
      clinicianId: physioId,
      isToday: true,
      timezone
    });
    return result.appointments;
  } catch (error) {
    throw error;
  }
};

/**
 * CONVENIENCE WRAPPER - Get upcoming appointments for athlete
 * Returns: appointment id, scheduled at, physician name and role
 */
export const getUpcomingAppointmentsByAthleteId = async (athleteId: number) => {
  try {
    const now = new Date();
    const result = await getAppointments({
      athleteId,
      status: ApptStatus.SCHEDULED,
      dateRange: { startDate: now, endDate: new Date('2100-01-01') } // Far future date
    });
    return result.appointments;
  } catch (error) {
    throw error;
  }
};

/**
 * CONVENIENCE WRAPPER - Get all appointments for a specific case
 * Uses the base getAppointments function for consistent filtering
 * Returns: appointments related to the case
 */
export const getAppointmentsByCaseId = async (caseId: number, page: number = 1, limit: number = 10) => {
  try {
    return await getAppointments({
      caseId,
      page,
      limit
    });
  } catch (error) {
    throw error;
  }
};

export const getAppointmentsByAthleteId = async (athleteId: number, filters: Partial<GetAppointmentsFilterParams> = {}) => {
  try{
    const athlete = await prisma.user.findFirst({
      where: {
        id: athleteId,
        role: 'ATHLETE'
      }
    });

    if (!athlete){
      throw new Error('Athlete not found');
    }

    // Use the generic getAppointments function with athleteId filter and additional filters
    const result = await getAppointments({ athleteId, ...filters });
    return result.appointments;
  }
  catch(error){
    throw error;
  }
} 


export const getAppointmentsByClinicianId = async (clinicianId: number, filters: Partial<GetAppointmentsFilterParams> = {}) => {
  try{
    const clinician = await prisma.user.findFirst({
      where: {
        id: clinicianId,
        role: 'CLINICIAN'
      }
    });

    if (!clinician){
      throw new Error('Clinician not found');
    }

    // Use the generic getAppointments function with clinicianId filter and additional filters
    const result = await getAppointments({ clinicianId, ...filters });
    return result.appointments;
  }
  catch(error){
    throw error;
  }
}; 
