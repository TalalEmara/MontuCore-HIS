import type { Request, Response } from "express";
import * as billingService from "./billing.service.js";
import * as authC from '../auth/auth.controller.js';
import { prisma } from '../../config/db.js';


export const createInvoice = async (req: Request, res: Response) => {
  try {
    const createdBy = (req as any).user.id;
    const authHeader = req.headers['authorization'] || '';
    const userToken = authHeader.startsWith('Bearer ')  
      ? authHeader.substring(7) 
      : authHeader;

    const decodedToken = await authC.verifyToken(userToken);
    if (!decodedToken) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (authC.isAdmin(userToken) || (typeof decodedToken === 'object' && decodedToken.id == createdBy)){
      const invoice = await billingService.createInvoice({ ...req.body, createdBy });
      res.status(201).json({ success: true, data: invoice });
    }
    res.status(403).json({ success: false, message: "Forbidden" });
  } catch (error) {
    res.status(400).json({ success: false, message: error instanceof Error ? error.message : "Unknown error" });
  }
};

export const getAllInvoices = async (req: Request, res: Response) => {
  try {
    const athleteId = req.query.athleteId ? Number(req.query.athleteId) : undefined;
    const createdBy = (req as any).user.id;
    const authHeader = req.headers['authorization'] || '';
    const userToken = authHeader.startsWith('Bearer ')  
      ? authHeader.substring(7) 
      : authHeader;
    const vierifiedToken = await authC.verifyToken(userToken);
    if (!vierifiedToken) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (authC.isAdmin(userToken) || authC.isAthlete(userToken)){
      if (authC.isAthlete(userToken)){
        const userId = (vierifiedToken as any).id;
        if (userId != athleteId){
          return res.status(403).json({ success: false, message: "Forbidden" });
        }
      }

      const invoices = await billingService.getAllInvoices(athleteId);
      res.status(200).json({ success: true, data: invoices });
    }
    res.status(403).json({ success: false, message: "Forbidden" });
  } catch (error) {
    res.status(400).json({ success: false, message: error instanceof Error ? error.message : "Unknown error" });
  }
};

export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const invoice = await billingService.getInvoiceById(Number(req.params.id));
    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(404).json({ success: false, message: error instanceof Error ? error.message : "Invoice not found" });
  }
};

export const updateInvoice = async (req: Request, res: Response) => {
  try {
    const invoiceId = Number(req.params.id);
    if (isNaN(invoiceId)) {
      return res.status(400).json({ success: false, message: "Invalid invoice ID" });
    }

    const updatedInvoice = await billingService.updateInvoice(invoiceId, req.body);
    res.status(200).json({ success: true, data: updatedInvoice });
  } catch (error) {
    res.status(400).json({ success: false, message: error instanceof Error ? error.message : "Failed to update invoice" });
  }
};

export const getInvoicesByCaseId = async (req: Request, res: Response) => {
  try {
    const caseId = Number(req.params.caseId);
    if (isNaN(caseId)) {
      return res.status(400).json({ success: false, message: "Invalid case ID" });
    }

    const invoices = await billingService.getInvoicesByCaseId(caseId);
    res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : "Unknown error" });
  }
};

export const recalculateInvoice = async (req: Request, res: Response) => {
  try {
    const invoiceId = Number(req.params.id);
    if (isNaN(invoiceId)) {
      return res.status(400).json({ success: false, message: "Invalid invoice ID" });
    }

    const newTotal = await billingService.recalculateInvoiceTotals(invoiceId);
    res.status(200).json({ success: true, message: "Invoice recalculated", newTotal });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : "Unknown error" });
  }
};