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



