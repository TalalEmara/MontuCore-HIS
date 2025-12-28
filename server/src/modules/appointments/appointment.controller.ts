import type { Request, Response } from 'express';
import * as appointmentService from './appointment.service.js';
import * as authC from '../auth/auth.controller.js';
import { prisma } from '../../config/db.js';
import { error } from 'console';

export const createAppointment = async (req: Request, res: Response): Promise<void> => {
  try{
    const appointmentData = req.body;
    const authHeader = req.headers['authorization'] || '';
    const userToken = authHeader.startsWith('Bearer ')  
      ? authHeader.substring(7) 
      : authHeader;

    // Log the token for debugging
    console.log('Authorization Header:', authHeader);
    console.log('Extracted Token:', userToken);

    // Validate token format
    if (!userToken || userToken.split('.').length !== 3) {
      res.status(400).json({
        success: false,
        message: 'Invalid token format',
      });
      return;
    }

    // Validate the token
    if (!userToken) {
      res.status(401).json({
        success: false,
        message: 'Authorization token is missing',
      });
      return;
    }

    try {
      // Updated to handle decoded payload
      const validToken = await authC.verifyToken(userToken);
      if (!validToken || !['ADMIN', 'ATHLETE'].includes((validToken as any).role)) {
        res.status(403).json({
          success: false,
          message: `Unauthorized role: ${(validToken as any).role || 'none'}`,
        });
        return;
      }

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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        message: 'Token validation failed',
        error: errorMessage,
      });
    }
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
        
    const authHeader = req.headers['authorization'] || '';
    const userToken = authHeader.startsWith('Bearer ')  
      ? authHeader.substring(7) 
      : authHeader;
    const validToken = await authC.verifyToken(userToken);
    if (validToken && (authC.isAdmin(userToken) || authC.isClinician(userToken) || authC.isAthlete(userToken)) ){
      const updatedAppointment = await appointmentService.updateAppointmentStatus(Number(id), status);
      if (updatedAppointment instanceof Error){
        res.status(400).json({
          success: false,
          message: 'Failed to update appointment status: ' + updatedAppointment.message,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Appointment status updated successfully',
        //data: updatedAppointment
      })
    }
    else{
        res.status(401).json({
        success: false,
      });
    }
    
  }
  catch(error){
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export const updateAppointment = async (req: Request, res: Response): Promise<void> => {
  try{
    // extract appointment id and data from request body
    const { appointmentId } = req.params;
    const appointmentData = req.body;
    const authHeader = req.headers['authorization'] || '';
    const userToken = authHeader.startsWith('Bearer ')  
      ? authHeader.substring(7)
      : authHeader;
    const validToken = await authC.verifyToken(userToken);
    if (validToken && (authC.isAdmin(userToken) || authC.isClinician(userToken) || authC.isAthlete(userToken)) ){
      const updatedAppointment = await appointmentService.updateAppointment(Number(appointmentId), appointmentData);
      if (updatedAppointment instanceof Error){
        res.status(400).json({
          success: false,
          message: 'Failed to update appointment details: ' + updatedAppointment.message
        });
      }

      res.status(200).json({
        success: true,
        message: 'Appointment details updated successfully',
        data: updatedAppointment
      });
    }
    else{
      res.status(401).json({
        success: false,
      });
    }
  }
  catch(error){
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getAppointmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const authHeader = req.headers['authorization'] || '';
    const userToken = authHeader.startsWith('Bearer ')  
      ? authHeader.substring(7) 
      : authHeader;
    const validToken = await authC.verifyToken(userToken);
    if (validToken && (authC.isAdmin(userToken) || authC.isClinician(userToken) || authC.isAthlete(userToken)) ){
      const userId = (validToken as any).id;
      const appointmentUser = await prisma.appointment.findUnique({ where: { id: Number(id) } });
      if ((validToken as any).role === 'ATHLETE'){
        if (userId != appointmentUser?.athleteId){
          res.status(403).json({
            success: false,
            message: 'Access denied'
          });
          return;
        }
      }
      if ((validToken as any).role === 'CLINICIAN'){
        if (userId != appointmentUser?.clinicianId){
          res.status(403).json({
            success: false,
            message: 'Access denied'
          });
          return;
        }
      }
      const appointment = await appointmentService.getAppointment(Number(id));
      if (appointment instanceof Error){
        res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }

      res.status(200).json({
        success: true,
        data: appointment
      });
    }
  }
  catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Endpoints By Admin Only
export const deleteAppointment = async (req: Request, res: Response): Promise<void> => {
  try{
    const {id} = req.params;
    console.log("Deleting appointment with ID:", id);
    const authHeader = req.headers['authorization'] || '';
    const userToken = authHeader.startsWith('Bearer ')  
      ? authHeader.substring(7) 
      : authHeader;
    const validToken = await authC.verifyToken(userToken);
    if (validToken && authC.isAdmin(userToken)){
      const deletedAppointment = await appointmentService.deleteAppointment(Number(id));
      if ((deletedAppointment as any) instanceof Error){
        res.status(400).json({
          success: false,
        });
      }
      res.status(200).json({
        success: true,
      });
      return;
    }
    res.status(401).json({
      success: false,
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
    const { page = 1, limit = 10, status, caseId } = req.query;
    const authHeader = req.headers['authorization'] || '';
    const userToken = authHeader.startsWith('Bearer ')  
      ? authHeader.substring(7) 
      : authHeader;
    const validToken = await authC.verifyToken(userToken);
    if(validToken && authC.isAdmin(userToken)){
      const filters: any = {
        page: Number(page),
        limit: Number(limit),
      };
      if (status) filters.status = status as any;
      if (caseId) filters.caseId = Number(caseId);
      
      const allAppointments = await appointmentService.getAllAppointments(filters);
      if (allAppointments instanceof Error){
        res.status(400).json({
          success: false,
          message: 'Something went wrong'
        });
      }
      res.status(200).json({
        success: true,
        data: allAppointments
      });
      return;
    }
    res.status(401).json({
      success: false,
    });
    
  }
  catch (error){
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }

}

export const getAppointmentsByAthleteId = async (req: Request, res: Response): Promise<void> => {
  try{
    const { athleteId } = req.params;
    const { page = 1, limit = 10, status, caseId } = req.query;
    const authHeader = req.headers['authorization'] || '';
    const userToken = authHeader.startsWith('Bearer ')  
      ? authHeader.substring(7) 
      : authHeader;
    const validToken = await authC.verifyToken(userToken);
    if (validToken && (authC.isAdmin(userToken) || authC.isAthlete(userToken)) || authC.isClinician(userToken) ){
      const userId = (validToken as any).id;
      if (authC.isAthlete(userToken)){

        if (userId != Number(athleteId)){
          res.status(403).json({
            success: false,
            message: 'Access denied'
          });
          return;
        }
      }
      
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

      if (appointments instanceof Error){
        res.status(400).json({
          success: false,
        message: 'Something went wrong'
        });
      }
      res.status(200).json({
        success: true,
        data: appointments
      });  
    }
    res.status(401).json({
      success: false,
    });
  }

  catch(error){
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export const getAppointmentsByClinicianId = async (req: Request, res: Response): Promise<void> => {
  try{
    const { clinicianId } = req.params;
    const { page = 1, limit = 10, status, caseId } = req.query;

    const authHeader = req.headers['authorization'] || '';
    const userToken = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;
    const validToken = await authC.verifyToken(userToken);
    if (validToken && (authC.isAdmin(userToken) || authC.isClinician(userToken)) ){
      const userId = (validToken as any).id;
      if (authC.isClinician(userToken)){
        if (userId != Number(clinicianId)){
          res.status(403).json({
            success: false,
          });
          return;
        }
      }

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

      if (appointments instanceof Error){
        res.status(400).json({
          success: false,
          message: appointments.message
        });
      }
      res.status(200).json({
        success: true,
        data: appointments
      });

    }
    res.status(401).json({
      success: false,
    });
  }
  catch(error){
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}