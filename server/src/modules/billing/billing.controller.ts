import { Request, Response } from 'express';
import * as billingService from './billing.service';

/**
 * Create a new invoice
 */
export const createInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoiceData = req.body;
    const createdBy = (req as any).user.id;
    
    const newInvoice = await billingService.createInvoice({ ...invoiceData, createdBy });
    
    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: newInvoice
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get all invoices
 */
export const getAllInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, patientId } = req.query;
    
    const invoices = await billingService.getAllInvoices({ page: Number(page), limit: Number(limit), status: status as string, patientId: patientId as string });
    
    res.status(200).json({
      success: true,
      data: invoices
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get invoice by ID
 */
export const getInvoiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const invoice = await billingService.getInvoiceById(id);
    
    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update invoice
 */
export const updateInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedInvoice = await billingService.updateInvoice(id, updates);
    
    res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      data: updatedInvoice
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Record payment
 */
export const recordPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const paymentData = req.body;
    
    const payment = await billingService.recordPayment(id, paymentData);
    
    res.status(200).json({
      success: true,
      message: 'Payment recorded successfully',
      data: payment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get patient billing summary
 */
export const getPatientBillingSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    
    const summary = await billingService.getPatientBillingSummary(patientId);
    
    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
  getPatientBillingSummary
};
