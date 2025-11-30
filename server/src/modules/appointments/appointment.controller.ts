import type { Request, Response } from 'express';
import * as appointmentService from './appointment.service.js';

export const createAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const appointmentData = req.body;
    const createdBy = (req as any).user.id;
    
    const newAppointment = await appointmentService.createAppointment({ ...appointmentData, createdBy });
    
    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: newAppointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getAllAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, athleteId, clinicianId, date } = req.query;
    
    const appointments = await appointmentService.getAllAppointments({
      page: Number(page),
      limit: Number(limit),
      status: status as any,
      athleteId: athleteId ? Number(athleteId) : undefined,
      clinicianId: clinicianId ? Number(clinicianId) : undefined,
      date: date as string
    });
    
    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};export const getAppointmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const appointment = await appointmentService.getAppointmentById(Number(id));
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedAppointment = await appointmentService.updateAppointment(Number(id), updates);
    
    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: updatedAppointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const cancelAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const cancelledAppointment = await appointmentService.cancelAppointment(Number(id), reason);
    
    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: cancelledAppointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
