import { useQuery } from '@tanstack/react-query';
import type { InvoiceData } from '../components/level-1/bill/bills';

const fetchInvoiceById = async (id: number) => {
  const token = localStorage.getItem('token');
  // NOTE: Ensure your base URL matches your backend (localhost:3000)
  const response = await fetch(`http://localhost:3000/api/billing/invoices/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // Required by your authenticateToken middleware
    },
  });

  if (!response.ok) throw new Error('Invoice fetch failed');
  return response.json();
};

export const useInvoice = (invoiceId: number | undefined) => {
  return useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => fetchInvoiceById(invoiceId!),
    enabled: !!invoiceId, // Only fetch if ID exists
    select: (response): InvoiceData => {
      const d = response.data;
      return {
        invoiceNumber: d.invoiceNumber,
        invoiceDate: new Date(d.invoiceDate).toLocaleDateString(),
        dueDate: new Date(d.dueDate).toLocaleDateString(),
        patient: {
          name: d.athlete.fullName,
          email: d.athlete.email,
          id: d.athleteId.toString(),
        },
        // Backend stores items as JSON, we map them here
        items: (d.items as any[]).map((item) => ({
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
        status: d.status, // "PAID"
        caseId: d.caseId?.toString(),
        notes: d.notes,
        createdBy: d.createdBy.toString(),
      };
    },
  });
};