import type { Request, Response } from 'express';
import * as imagingService from './imaging.service.js';

/**
 * Create a new imaging order
 */
export const createImagingOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderData = req.body;
    const orderedBy = (req as any).user.id;
    
    const newOrder = await imagingService.createImagingOrder({ ...orderData, orderedBy });
    
    res.status(201).json({
      success: true,
      message: 'Imaging order created successfully',
      data: newOrder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get all imaging orders
 */
export const getAllImagingOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, caseId } = req.query;
    
    const orders = await imagingService.getAllImagingOrders({ 
      page: Number(page), 
      limit: Number(limit), 
      status: status as string, 
      caseId: caseId ? Number(caseId) : undefined 
    });
    
    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get imaging order by ID
 */
export const getImagingOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const order = await imagingService.getImagingOrderById(Number(id));
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update imaging order
 */
export const updateImagingOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedOrder = await imagingService.updateImagingOrder(Number(id), updates);
    
    res.status(200).json({
      success: true,
      message: 'Imaging order updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Upload imaging results
 */
export const uploadImagingResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { radiologistNotes, conclusion, performedAt } = req.body;
    
    const updatedOrder = await imagingService.uploadImagingResults(Number(id), { radiologistNotes, conclusion, performedAt });
    
    res.status(200).json({
      success: true,
      message: 'Imaging results uploaded successfully',
      data: updatedOrder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
