import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface InvoiceItem {
  quantity: number;
  unitPrice: number;
  [key: string]: any;
}

interface InvoiceData {
  patientId: string;
  caseId?: string;
  sessionId?: string;
  dueDate?: string;
  items: InvoiceItem[];
  tax?: number;
  discount?: number;
  notes?: string;
  createdBy: string;
}

interface GetAllInvoicesParams {
  page?: number;
  limit?: number;
  status?: string;
  patientId?: string;
}

interface PaymentData {
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  notes?: string;
}

/**
 * Create a new invoice
 */
export const createInvoice = async (invoiceData: InvoiceData) => {
  const totalAmount = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  
  const newInvoice = await prisma.invoice.create({
    data: {
      patientId: invoiceData.patientId,
      caseId: invoiceData.caseId,
      sessionId: invoiceData.sessionId,
      invoiceNumber: await generateInvoiceNumber(),
      invoiceDate: new Date(),
      dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      items: invoiceData.items,
      subtotal: totalAmount,
      tax: invoiceData.tax || 0,
      discount: invoiceData.discount || 0,
      totalAmount: totalAmount + (invoiceData.tax || 0) - (invoiceData.discount || 0),
      paidAmount: 0,
      status: 'PENDING',
      notes: invoiceData.notes,
      createdBy: invoiceData.createdBy
    },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return newInvoice;
};

/**
 * Get all invoices with pagination and filters
 */
export const getAllInvoices = async ({ page = 1, limit = 10, status, patientId }: GetAllInvoicesParams) => {
  const skip = (page - 1) * limit;
  const where: any = {};
  
  if (status) where.status = status;
  if (patientId) where.patientId = patientId;

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      skip,
      take: limit,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        invoiceDate: 'desc'
      }
    }),
    prisma.invoice.count({ where })
  ]);

  return {
    invoices,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get invoice by ID
 */
export const getInvoiceById = async (invoiceId: string) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      patient: true,
      case: true,
      session: true,
      payments: true
    }
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  return invoice;
};

/**
 * Update invoice
 */
export const updateInvoice = async (invoiceId: string, updates: Partial<InvoiceData>) => {
  if (updates.dueDate) {
    (updates as any).dueDate = new Date(updates.dueDate);
  }

  const updatedInvoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: updates,
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return updatedInvoice;
};

/**
 * Record payment
 */
export const recordPayment = async (invoiceId: string, paymentData: PaymentData) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId }
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  const newPaidAmount = invoice.paidAmount + paymentData.amount;
  const remainingAmount = invoice.totalAmount - newPaidAmount;

  const payment = await prisma.payment.create({
    data: {
      invoiceId,
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      paymentDate: new Date(),
      transactionId: paymentData.transactionId,
      notes: paymentData.notes
    }
  });

  // Update invoice status
  let status = 'PENDING';
  if (remainingAmount <= 0) {
    status = 'PAID';
  } else if (newPaidAmount > 0) {
    status = 'PARTIALLY_PAID';
  }

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      paidAmount: newPaidAmount,
      status
    }
  });

  return payment;
};

/**
 * Get patient billing summary
 */
export const getPatientBillingSummary = async (patientId: string) => {
  const invoices = await prisma.invoice.findMany({
    where: { patientId }
  });

  const totalBilled = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalOutstanding = totalBilled - totalPaid;

  return {
    patientId,
    totalInvoices: invoices.length,
    totalBilled,
    totalPaid,
    totalOutstanding,
    invoicesByStatus: {
      pending: invoices.filter(inv => inv.status === 'PENDING').length,
      partiallyPaid: invoices.filter(inv => inv.status === 'PARTIALLY_PAID').length,
      paid: invoices.filter(inv => inv.status === 'PAID').length,
      overdue: invoices.filter(inv => inv.status === 'OVERDUE').length
    }
  };
};

/**
 * Generate unique invoice number
 */
const generateInvoiceNumber = async (): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  const count = await prisma.invoice.count({
    where: {
      invoiceDate: {
        gte: new Date(year, date.getMonth(), 1),
        lt: new Date(year, date.getMonth() + 1, 1)
      }
    }
  });

  return `INV-${year}${month}-${String(count + 1).padStart(4, '0')}`;
};
