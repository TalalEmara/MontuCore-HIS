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

export const getInvoiceByCaseId = async (req: Request, res: Response) => {
  try {
    const invoice = await billingService.getInvoiceByCaseId(Number(req.params.caseId));
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }
    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(400).json({ success: false, message: error instanceof Error ? error.message : "Unknown error" });
  }
};