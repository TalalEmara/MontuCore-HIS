import { PrismaClient, ApptStatus, Prisma } from '@prisma/client';

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
  athleteName: string;
  clinicianName: string;
  date?: string;
}

/**
 * Create a new appointment
 */
export const createAppointment = async(appointmentData : AppointmentData) => {
  try{
    /*
      Some Important Checks
        1-> scheduledAt should be in the future
        2-> Clinician should not have another appointment at the same time
        3-> Athlete should not have another appointment at the same time
        4-> at least 30 min between each appointment for the same clinician
    */
    const now = new Date();
    const scheduledDate = new Date(appointmentData.scheduledAt);
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


export const updateAppointmentStatus  = async(appointmentID: number, status: ApptStatus) => {
  try{
    const appointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentID
      }
    });
    if (!appointment){
      throw new Error('Appointment not found');
    }

    const updatedAppointment = await prisma.appointment.update({
      where: {
        id: appointmentID
      },
      data: {
        status: status
      }
    });

    if(!updatedAppointment){
      throw new Error('Failed to update appointment status');
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
export const getAllAppointments = async({ page = 1, limit = 10, status, athleteName, clinicianName, date }: GetAllAppointmentsParams) => {
  try{
    // Return all appointments
    const where: Prisma.AppointmentWhereInput = {};
    if (status) where.status = status;
    if (date) where.scheduledAt = new Date(date);
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


export const getAllAppointmentsByAthelete = async({ page = 1, limit = 10, status, athleteName, clinicianName, date }: GetAllAppointmentsParams, athleteId: Number) => {
  try{
    const athelte = await prisma.user.findFirst({
      where: {
        id: Number(athleteId),
        role: 'ATHLETE'
      }
    });

    if (!athelte){
      throw new Error('Athlete not found');
    }
    // Get All the appointments for the athlete

    // I wrote the condition as a separate variable to make it easier to read and maintain, then i will add it in the find query.
    const where: Prisma.AppointmentWhereInput = {
      athleteId: athelte.id
    };
    if (status) where.status = status;
    if (date) where.scheduledAt = new Date(date);

    const appointments = await prisma.appointment.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        clinician: {
          select: { fullName: true }
        },
        athlete:{
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


export const getAllAppointmentsByClinician = async({ page = 1, limit = 10, status, athleteName, clinicianName, date }: GetAllAppointmentsParams, clinicianId : Number) => {
  try{
    const clinician = await prisma.user.findFirst({
      where: {
        id: Number(clinicianId),
        role: 'CLINICIAN'
      }
    });

    if (!clinician){
      throw new Error('Clinician not found');
    }
    // Get All the appointments for the clinician
    const where: Prisma.AppointmentWhereInput = {
      clinicianId: clinician.id
    };
    if (status) where.status = status;
    if (date) where.scheduledAt = new Date(date);

    const appointments = await prisma.appointment.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        athlete:{
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