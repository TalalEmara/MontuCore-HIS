export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Patient {
  name: string;
  email: string;
  id: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  patient: Patient;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  status: "PENDING" | "PARTIALLY_PAID" | "PAID" | "OVERDUE";
  caseId?: string;
  sessionId?: string;
  notes?: string;
  createdBy: string;
}
