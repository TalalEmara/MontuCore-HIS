import { useQuery } from '@tanstack/react-query';
import type { InvoiceData } from '../components/level-1/bill/bills';

const API_URL = 'http://localhost:3000/api/billing';

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBzcG9ydHNoaXMuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzY2NzEwOTExLCJleHAiOjE3NjY5NzAxMTF9.bQVzVtXpBSKyyCz1oKbI_jSW2pgoOXx8GuM_73L6QNg";

const transformInvoice = (d: any): InvoiceData => ({
  invoiceNumber: d.invoiceNumber,
  invoiceDate: new Date(d.invoiceDate).toLocaleDateString(),
  dueDate: new Date(d.dueDate).toLocaleDateString(),
  patient: {
    name: d.athlete?.fullName || 'N/A',
    email: d.athlete?.email || 'N/A',
    id: d.athleteId.toString(),
  },
  items: (d.items as any[] || []).map((item) => ({
    description: item.description || "Medical Service",
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: item.quantity * item.unitPrice,
  })),
  subtotal: d.subtotal,
  tax: 0,
  discount: 0,
  totalAmount: d.totalAmount,
  paidAmount: d.paidAmount,
  status: d.status,
  caseId: d.caseId?.toString(),
  notes: d.notes,
  createdBy: d.createdBy.toString(),
});

const fetcher = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    },
  });
  if (!response.ok) throw new Error('Fetch failed');
  return response.json();
};

export const useInvoiceByCaseId = (caseId: number | undefined) => {
  return useQuery({
    queryKey: ['invoice', 'case', caseId],
    queryFn: () => fetcher(`${API_URL}/invoices/case/${caseId}`),
    enabled: !!caseId,
    select: (json) => transformInvoice(json.data), 
  });
};

