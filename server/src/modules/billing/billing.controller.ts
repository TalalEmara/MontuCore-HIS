import type { Request, Response } from 'express';
import * as billingService from './billing.service.js';

// -----------------------------
// Invoice Controllers
// -----------------------------

export const createInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoiceData = req.body;
    const createdBy = (req as any).user?.id;
    if (!createdBy) throw new Error('Unauthorized');

    const newInvoice = await billingService.createInvoice({
      ...invoiceData,
      createdBy: Number(createdBy),
      patientId: Number(invoiceData.patientId),
      caseId: invoiceData.caseId ? Number(invoiceData.caseId) : undefined,
      sessionId: invoiceData.sessionId ? Number(invoiceData.sessionId) : undefined,
    });

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: newInvoice,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getAllInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, status, patientId } = req.query;

    const invoices = await billingService.getAllInvoices({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status: status as string | undefined,
      patientId: patientId ? Number(patientId) : undefined,
    });

    res.status(200).json({
      success: true,
      data: invoices,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getInvoiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id ? Number(req.params.id) : undefined;
    if (!id) throw new Error('Invoice ID is required');

    const invoice = await billingService.getInvoiceById(id);

    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id ? Number(req.params.id) : undefined;
    if (!id) throw new Error('Invoice ID is required');

    const updates = req.body;

    const updatedInvoice = await billingService.updateInvoice(id, {
      ...updates,
      patientId: updates.patientId ? Number(updates.patientId) : undefined,
      caseId: updates.caseId ? Number(updates.caseId) : undefined,
      sessionId: updates.sessionId ? Number(updates.sessionId) : undefined,
    });

    res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      data: updatedInvoice,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// -----------------------------
// Payment Controller
// -----------------------------

export const recordPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id ? Number(req.params.id) : undefined;
    if (!id) throw new Error('Invoice ID is required');

    const paymentData = req.body;

    const payment = await billingService.recordPayment(id, {
      amount: Number(paymentData.amount),
      paymentMethod: paymentData.paymentMethod,
      transactionId: paymentData.transactionId,
      notes: paymentData.notes,
    });

    res.status(200).json({
      success: true,
      message: 'Payment recorded successfully',
      data: payment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// -----------------------------
// Patient Billing Summary Controller
// -----------------------------

export const getPatientBillingSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const patientId = req.params.patientId ? Number(req.params.patientId) : undefined;
    if (!patientId) throw new Error('Patient ID is required');

    const summary = await billingService.getPatientBillingSummary(patientId);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

