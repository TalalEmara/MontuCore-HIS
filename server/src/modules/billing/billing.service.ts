// server/src/modules/billing/billing.service.ts
import { prisma } from "../../config/db.js"; // Prisma client
import type { InputJsonValue } from "@prisma/client/runtime/library.js";

interface InvoiceItem {
  quantity: number;
  unitPrice: number;
  description?: string;
}

interface InvoiceData {
  athleteId: number;
  clinicianId: number;
  caseId?: number;
  appointmentId?: number;
  items: InvoiceItem[];
  notes?: string;
  createdBy: number;
}

/**
 * Create a new invoice (automatically PAID since insurance covers it)
 */
export const createInvoice = async (data: InvoiceData) => {
  const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const invoiceData: any = {
    athleteId: data.athleteId,
    clinicianId: data.clinicianId,
    invoiceNumber: await generateInvoiceNumber(),
    invoiceDate: new Date(),
    dueDate: new Date(),
    items: data.items as unknown as InputJsonValue,
    subtotal,
    totalAmount: subtotal,
    paidAmount: subtotal,
    status: "PAID",
    notes: data.notes,
    createdBy: data.createdBy,
    icd10Code: null,
  };

  // Only add optional fields if they exist
  if (data.caseId) invoiceData.caseId = data.caseId;
  if (data.appointmentId) invoiceData.appointmentId = data.appointmentId;

  const invoice = await prisma.invoice.create({
    data: invoiceData,
    include: {
      athlete: { select: { id: true, fullName: true, email: true } },
    },
  });

  return invoice;
};

/**
 * Get all invoices (optionally filtered by athlete)
 */
export const getAllInvoices = async (athleteId?: number) => {
  return prisma.invoice.findMany({
    where: athleteId ? { athleteId } : {},
    include: { athlete: { select: { id: true, fullName: true, email: true } } },
    orderBy: { invoiceDate: "desc" },
  });
};

/**
 * Get invoice by ID
 */
export const getInvoiceById = async (id: number) => {
  return prisma.invoice.findUnique({
    where: { id },
    include: { athlete: true, case: true, appointment: true },
  });
};

/**
 * Generate unique invoice number (monthly reset)
 */
const generateInvoiceNumber = async (): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  const count = await prisma.invoice.count({
    where: {
      invoiceDate: {
        gte: new Date(year, date.getMonth(), 1),
        lt: new Date(year, date.getMonth() + 1, 1),
      },
    },
  });

  return `INV-${year}${month}-${String(count + 1).padStart(4, "0")}`;
};
/**
 * Get invoices by Case ID
 */
export const getInvoicesByCaseId = async (caseId: number) => {
  const invoice = await prisma.invoice.findFirst({
    where: { caseId },
    select: {
      id: true,
      invoiceNumber: true,
      invoiceDate: true,
      items: true,
      subtotal: true,
      athlete: {
        select: {
          fullName: true
        }
      }
    }
  });

  if (!invoice) return null;

  const rawItems: any = invoice.items || {};

  const cleanedItems = {
    exams: (rawItems.exams ?? []).map((e: any) => ({
      id: e.id,
      description: `${e.modality} - ${e.bodyPart}`,
      cost: e.cost ?? 0,
    })),

    labTests: (rawItems.labTests ?? []).map((l: any) => ({
      id: l.id,
      description: l.testName,
      cost: l.cost ?? 0,
      
    })),

    treatments: (rawItems.treatments ?? []).map((t: any) => ({
      id: t.id,
      description: t.description,
      cost: t.cost ?? 0
    })),

    physioPrograms: (rawItems.physioPrograms ?? []).map((p: any) => ({
      id: p.id,
      description: p.description ?? p.title ?? "Physio Program",
      numberOfSessions: p.numberOfSessions ?? p.sessions ?? 0,
      costPerSession: p.costPerSession ?? 0,
      totalCost:
        p.totalCost ??
        p.cost ??
        ((p.costPerSession || 0) * (p.numberOfSessions || 0)),
    })),

  };

  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: invoice.invoiceDate,
    items: cleanedItems,
    subtotal: invoice.subtotal,
    athleteName: invoice.athlete.fullName
  };
};






