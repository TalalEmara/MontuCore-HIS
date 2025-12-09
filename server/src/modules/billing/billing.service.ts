import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// -----------------------------
// Types
// -----------------------------
interface InvoiceItem {
  quantity: number;
  unitPrice: number;
  [key: string]: any;
}

interface InvoiceData {
  patientId: number;
  caseId?: number;
  sessionId?: number;
  dueDate?: string;
  items: InvoiceItem[];
  tax?: number;
  discount?: number;
  notes?: string;
  createdBy: number;
}

interface GetAllInvoicesParams {
  page: number | undefined;
  limit: number | undefined;
  status?: string;
  patientId: number | undefined;
}

interface PaymentData {
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  notes?: string;
}

// -----------------------------
// Invoice Services
// -----------------------------

export const createInvoice = async (invoiceData: InvoiceData) => {
  const totalAmount = invoiceData.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const data: any = {
    patientId: invoiceData.patientId,
    invoiceNumber: await generateInvoiceNumber(),
    invoiceDate: new Date(),
    dueDate: invoiceData.dueDate
      ? new Date(invoiceData.dueDate)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    items: invoiceData.items,
    subtotal: totalAmount,
    tax: invoiceData.tax || 0,
    discount: invoiceData.discount || 0,
    totalAmount: totalAmount + (invoiceData.tax || 0) - (invoiceData.discount || 0),
    paidAmount: 0,
    status: 'PENDING',
    notes: invoiceData.notes,
    createdBy: invoiceData.createdBy,
  };

  if (invoiceData.caseId) data.caseId = invoiceData.caseId;
  if (invoiceData.sessionId) data.sessionId = invoiceData.sessionId;

  const newInvoice = await prisma.invoice.create({
    data,
    include: {
      patient: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  return newInvoice;
};

export const getAllInvoices = async ({
  page = 1,
  limit = 10,
  status,
  patientId,
}: GetAllInvoicesParams) => {
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
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        invoiceDate: 'desc',
      },
    }),
    prisma.invoice.count({ where }),
  ]);

  return {
    invoices,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getInvoiceById = async (invoiceId: number) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      patient: true,
      case: true,
      session: true,
      payments: true,
    },
  });

  if (!invoice) throw new Error('Invoice not found');
  return invoice;
};

export const updateInvoice = async (invoiceId: number, updates: Partial<InvoiceData>) => {
  const data: any = { ...updates };
  if (updates.dueDate) data.dueDate = new Date(updates.dueDate);
  if (updates.caseId === undefined) delete data.caseId;
  if (updates.sessionId === undefined) delete data.sessionId;

  const updatedInvoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data,
    include: {
      patient: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  return updatedInvoice;
};

// -----------------------------
// Payment Services
// -----------------------------

export const recordPayment = async (invoiceId: number, paymentData: PaymentData) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  const newPaidAmount = invoice.paidAmount + paymentData.amount;
  const remainingAmount = invoice.totalAmount - newPaidAmount;

  // create payment
  const payment = await prisma.payment.create({
    data: {
      invoiceId,
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      paymentDate: new Date(),
      transactionId: paymentData.transactionId ?? null, // <-- use null
      notes: paymentData.notes ?? null,                 // <-- use null
    },
  });

  // determine new status
  let status = 'PENDING';
  if (remainingAmount <= 0) {
    status = 'PAID';
  } else if (newPaidAmount > 0) {
    status = 'PARTIALLY_PAID';
  }

  // update invoice
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      paidAmount: newPaidAmount,
      status,
      // ensure optional relational fields are null, not undefined
      caseId: invoice.caseId ?? null,
      sessionId: invoice.sessionId ?? null,
      notes: invoice.notes ?? null,
    },
  });

  return payment;
};


// -----------------------------
// Patient Billing Summary
// -----------------------------

export const getPatientBillingSummary = async (patientId: number) => {
  const invoices = await prisma.invoice.findMany({ where: { patientId } });

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
      overdue: invoices.filter(inv => inv.status === 'OVERDUE').length,
    },
  };
};

// -----------------------------
// Generate Invoice Number
// -----------------------------

const generateInvoiceNumber = async (): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  const count = await prisma.invoice.count({
    where: {
      invoiceDate: {
        gte: new Date(year, date.getMonth(), 1),
        lt: new Date(year, date.getMonth() + 1, 1),
      },
    },
  });

  return `INV-${year}${month}-${String(count + 1).padStart(4, '0')}`;
};

