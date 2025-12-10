import type { Request, Response } from 'express';
import * as appointmentService from '../modules/appointments/appointment.service.js';


export const createAppointment = async (req: Request, res: Response): Promise<void> => {
  try{
    const appointmentData = req.body;

    const createdAppointment = await appointmentService.createAppointment(appointmentData);
    if (createdAppointment instanceof Error){
      res.status(400).json({
        success: false,
        message: createdAppointment.message,
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: createdAppointment
    });

  }

  catch(error){
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}


export const updateAppointmentStatus = async (req: Request, res: Response): Promise<void> => {
  try{
    const bodyData = req.body;
    const id  = bodyData.id;
    const status  = bodyData.status;
    const updatedAppointment = await appointmentService.updateAppointmentStatus(Number(id), status);
    if (updatedAppointment instanceof Error){
      res.status(400).json({
        success: false,
        message: 'Faileed to update appointment status: '
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Appointment status updated successfully',
      //data: updatedAppointment
    });
  }
  catch(error){
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export const getAppointmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const appointment = await appointmentService.getAppointment(Number(id));
    if (appointment instanceof Error){
      res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  }
  catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export const deleteAppointment = async (req: Request, res: Response): Promise<void> => {
  try{
    const {id} = req.params;
    const deletedAppointment = await appointmentService.deleteAppointment(Number(id));

    if ((deletedAppointment as any) instanceof Error){
      res.status(400).json({
        success: false,
      });
      return;
    }
    res.status(200).json({
      success: true,
    });
  }
  catch(error){
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export const getAllAppointments = async (req: Request, res: Response): Promise<void> => {
  try{
    const { page = 1, limit = 10, status, athleteName, clinicianName, date } = req.query;
    const allAppointments = await appointmentService.getAllAppointments({
      page: Number(page),
      limit: Number(limit),
      status: status as any,
      athleteName: athleteName as string,
      clinicianName: clinicianName as string,
      date: date as string
    });
    if (allAppointments instanceof Error){
      res.status(400).json({
        success: false,
        message: 'Something went wrong'
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: allAppointments
    });
  }
  catch (error){
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }

}

export const getAllAppointmentsByAthelete = async (req: Request, res: Response): Promise<void> => {
  try{
    const { athleteId } = req.params;
    const { page = 1, limit = 20, status, athleteName, clinicianName, date } = req.query;
    const appointments = await appointmentService.getAllAppointmentsByAthelete({
      page: Number(page),
      limit: Number(limit),
      status: status as any,
      athleteName: athleteName as string,
      clinicianName: clinicianName as string,
      date: date as string
    },
    Number(athleteId));

    if (appointments instanceof Error){
      res.status(400).json({
        success: false,
       message: 'Something went wrong'
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: appointments
    });
  }

  catch(error){
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export const getAllAppointmentsByClinician = async (req: Request, res: Response): Promise<void> => {
  try{
    const { clinicianId } = req.params;
    const { page = 1, limit = 30, status, athleteName, clinicianName, date } = req.query;
    const appointments = await appointmentService.getAllAppointmentsByClinician({
      page: Number(page),
      limit: Number(limit),
      status: status as any,
      athleteName: athleteName as string,
      clinicianName: clinicianName as string,
      date: date as string
    },
    Number(clinicianId));

    if (appointments instanceof Error){
      res.status(400).json({
        success: false,
        message: appointments.message
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: appointments
    });
  }
  catch(error){
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}