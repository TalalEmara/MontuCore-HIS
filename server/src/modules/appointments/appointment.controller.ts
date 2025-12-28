import type { Request, Response } from 'express';
import * as appointmentService from './appointment.service.js';
import { prisma } from '../../config/db.js';

export const createAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const appointmentData = req.body;

    // Proceed with appointment creation
    const createdAppointment = await appointmentService.createAppointment(appointmentData);
    if (createdAppointment instanceof Error) {
      res.status(400).json({
        success: false,
        message: createdAppointment.message,
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: createdAppointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};


export const updateAppointmentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const bodyData = req.body;
    const id = bodyData.id;
    const status = bodyData.status;

    const updatedAppointment = await appointmentService.updateAppointmentStatus(Number(id), status);
    if (updatedAppointment instanceof Error) {
      res.status(400).json({
        success: false,
        message: 'Failed to update appointment status: ' + updatedAppointment.message,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Appointment status updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    // extract appointment id and data from request body
    const { appointmentId } = req.params;
    const appointmentData = req.body;

    const updatedAppointment = await appointmentService.updateAppointment(Number(appointmentId), appointmentData);
    if (updatedAppointment instanceof Error) {
      res.status(400).json({
        success: false,
        message: 'Failed to update appointment details: ' + updatedAppointment.message
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Appointment details updated successfully',
      data: updatedAppointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getAppointmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const appointment = await appointmentService.getAppointment(Number(id));
    if (appointment instanceof Error) {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Endpoints By Admin Only
export const deleteAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log("Deleting appointment with ID:", id);

    const deletedAppointment = await appointmentService.deleteAppointment(Number(id));
    if ((deletedAppointment as any) instanceof Error) {
      res.status(400).json({
        success: false,
      });
      return;
    }
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};



export const getAllAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, caseId } = req.query;

    const filters: any = {
      page: Number(page),
      limit: Number(limit),
    };
    if (status) filters.status = status as any;
    if (caseId) filters.caseId = Number(caseId);

    const allAppointments = await appointmentService.getAllAppointments(filters);
    if (allAppointments instanceof Error) {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getAppointmentsByClinicianId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clinicianId } = req.params;
    const { page = 1, limit = 10, status, caseId } = req.query;

    const filters: any = {
      page: Number(page),
      limit: Number(limit),
    };
    if (status) filters.status = status as any;
    if (caseId) filters.caseId = Number(caseId);

    const appointments = await appointmentService.getAppointmentsByClinicianId(
      Number(clinicianId),
      filters
    );

    if (appointments instanceof Error) {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getAppointmentsByAthleteId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { athleteId } = req.params;
    const { page = 1, limit = 10, status, caseId } = req.query;

    const filters: any = {
      page: Number(page),
      limit: Number(limit),
    };
    if (status) filters.status = status as any;
    if (caseId) filters.caseId = Number(caseId);

    const appointments = await appointmentService.getAppointmentsByAthleteId(
      Number(athleteId),
      filters
    );

    if (appointments instanceof Error) {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};