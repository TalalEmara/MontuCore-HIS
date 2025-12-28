// server/src/modules/billing/billing.service.ts
import { prisma } from "../../config/db.js"; // Prisma client
import type { InputJsonValue } from "@prisma/client/runtime/library.js";

interface InvoiceItems {
  appointments?: Array<{ id: number; cost: number }>;
  exams?: Array<{ id: number; cost: number }>;
  labTests?: Array<{ id: number; cost: number }>;
  treatments?: Array<{ id: number; cost: number }>;
  physioPrograms?: Array<{ id: number; totalCost: number }>;
}

interface InvoiceData {
  athleteId: number;
  clinicianId: number;
  caseId?: number;
  appointmentId?: number;
  items: InvoiceItems;
  notes?: string;
  createdBy: number;
}

interface InvoiceUpdateData {
  items?: InvoiceItems;
  notes?: string;
  dueDate?: Date;
  status?: string;
  caseId?: number;
}

/**
 * Create a new invoice (automatically PAID since insurance covers it)
 */
export const createInvoice = async (data: InvoiceData) => {
  return await prisma.$transaction(async (tx) => {
    // Calculate subtotal from the structured items
    const subtotal =
      (data.items.appointments?.reduce((sum, appt) => sum + (appt.cost || 0), 0) || 0) +
      (data.items.exams?.reduce((sum, exam) => sum + (exam.cost || 0), 0) || 0) +
      (data.items.labTests?.reduce((sum, test) => sum + (test.cost || 0), 0) || 0) +
      (data.items.treatments?.reduce((sum, treatment) => sum + (treatment.cost || 0), 0) || 0) +
      (data.items.physioPrograms?.reduce((sum, program) => sum + (program.totalCost || 0), 0) || 0);

    const invoiceData: any = {
      athleteId: data.athleteId,
      clinicianId: data.clinicianId,
      invoiceNumber: await generateInvoiceNumber(tx),
      invoiceDate: new Date(),
      dueDate: new Date(),
      items: data.items as unknown as InputJsonValue,
      subtotal,
      totalAmount: subtotal,
      paidAmount: subtotal,
      status: "PAID",
      notes: data.notes,
      createdBy: data.createdBy,
    };

    // Only add optional fields if they exist
    if (data.caseId) invoiceData.caseId = data.caseId;
    if (data.appointmentId) invoiceData.appointmentId = data.appointmentId;

    const invoice = await tx.invoice.create({
      data: invoiceData,
      include: {
        athlete: { select: { id: true, fullName: true, email: true } },
      },
    });

    return invoice;
  });
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
 * Get invoice by ID with lazy total recalculation
 */
export const getInvoiceById = async (id: number) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { athlete: true, case: true, appointment: true },
  });

  if (invoice) {
    // Trigger lazy recalculation on access
    await recalculateInvoiceTotals(id);
    // Re-fetch with updated totals
    return prisma.invoice.findUnique({
      where: { id },
      include: { athlete: true, case: true, appointment: true },
    });
  }

  return invoice;
};

/**
 * Update invoice data and recalculate totals
 */
export const updateInvoice = async (id: number, data: InvoiceUpdateData) => {
  // Prepare update data
  const updateData: any = {};

  if (data.items) {
    // Recalculate subtotal when items are updated
    const subtotal =
      (data.items.appointments?.reduce((sum, appt) => sum + (appt.cost || 0), 0) || 0) +
      (data.items.exams?.reduce((sum, exam) => sum + (exam.cost || 0), 0) || 0) +
      (data.items.labTests?.reduce((sum, test) => sum + (test.cost || 0), 0) || 0) +
      (data.items.treatments?.reduce((sum, treatment) => sum + (treatment.cost || 0), 0) || 0) +
      (data.items.physioPrograms?.reduce((sum, program) => sum + (program.totalCost || 0), 0) || 0);

    updateData.items = data.items as unknown as InputJsonValue;
    updateData.subtotal = subtotal;
    updateData.totalAmount = subtotal;
    // Keep paidAmount the same since insurance covers everything
  }

  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.dueDate) updateData.dueDate = data.dueDate;
  if (data.status) updateData.status = data.status;
  if (data.caseId !== undefined) updateData.caseId = data.caseId;

  const updatedInvoice = await prisma.invoice.update({
    where: { id },
    data: updateData,
    include: {
      athlete: { select: { id: true, fullName: true, email: true } },
      case: true,
      appointment: true,
    },
  });

  return updatedInvoice;
};

/**
 * Generate unique invoice number (monthly reset)
 */
const generateInvoiceNumber = async (tx: any): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  // Get the highest existing invoice number for this month within the transaction
  const lastInvoice = await tx.invoice.findFirst({
    where: {
      invoiceDate: {
        gte: new Date(year, date.getMonth(), 1),
        lt: new Date(year, date.getMonth() + 1, 1),
      },
      invoiceNumber: {
        startsWith: `INV-${year}${month}-`
      }
    },
    orderBy: {
      invoiceNumber: 'desc'
    },
    select: {
      invoiceNumber: true
    }
  });

  let nextNumber = 1;
  if (lastInvoice) {
    // Extract the sequential number from the last invoice
    const parts = lastInvoice.invoiceNumber.split('-');
    if (parts.length === 3) {
      const currentNumber = parseInt(parts[2], 10);
      if (!isNaN(currentNumber)) {
        nextNumber = currentNumber + 1;
      }
    }
  }

  return `INV-${year}${month}-${String(nextNumber).padStart(4, "0")}`;
};
/**
 * Recalculate and update invoice totals
 */
export const recalculateInvoiceTotals = async (invoiceId: number) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { items: true }
  });

  if (!invoice) throw new Error('Invoice not found');

  const items: any = invoice.items || {};

  // Calculate subtotal from all items
  const subtotal =
    (items.appointment?.cost || 0) +
    (items.appointments?.reduce((sum: number, appt: any) => sum + (appt.cost || 0), 0) || 0) +
    (items.exams?.reduce((sum: number, exam: any) => sum + (exam.cost || 0), 0) || 0) +
    (items.labTests?.reduce((sum: number, test: any) => sum + (test.cost || 0), 0) || 0) +
    (items.treatments?.reduce((sum: number, treatment: any) => sum + (treatment.cost || 0), 0) || 0) +
    (items.physioPrograms?.reduce((sum: number, program: any) => sum + (program.totalCost || 0), 0) || 0);

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      subtotal,
      totalAmount: subtotal
    }
  });

  return subtotal;
};

/**
 * Get invoices by Case ID (recalculates totals on access)
 */
export const getInvoicesByCaseId = async (caseId: number) => {
  const invoice = await prisma.invoice.findFirst({
    where: { caseId },
    select: {
      id: true,
      invoiceNumber: true,
      invoiceDate: true,
      items: true,
      athlete: {
        select: {
          fullName: true
        }
      }
    }
  });

  if (!invoice) return null;

  // Recalculate totals on access
  await recalculateInvoiceTotals(invoice.id);

  // Fetch updated invoice
  const updatedInvoice = await prisma.invoice.findUnique({
    where: { id: invoice.id },
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

  if (!updatedInvoice) return null;

  const rawItems: any = updatedInvoice.items || {};

  const cleanedItems = {
    appointments: (rawItems.appointments ?? []).map((a: any) => ({
      id: a.id,
      description: a.description ?? 'Appointment',
      cost: a.cost ?? 0,
    })),

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
    id: updatedInvoice.id,
    invoiceNumber: updatedInvoice.invoiceNumber,
    invoiceDate: updatedInvoice.invoiceDate,
    items: cleanedItems,
    subtotal: updatedInvoice.subtotal,
    athleteName: updatedInvoice.athlete.fullName
  };
};






