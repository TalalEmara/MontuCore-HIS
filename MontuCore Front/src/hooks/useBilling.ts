import { useQuery } from '@tanstack/react-query';
import type { InvoiceData, InvoiceItem } from '../components/level-1/bill/bills';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:3000/api/billing';

// Note: In a real app, you should replace this with the token from your AuthContext
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBzcG9ydHNoaXMuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzY2NzEwOTExLCJleHAiOjE3NjY5NzAxMTF9.bQVzVtXpBSKyyCz1oKbI_jSW2pgoOXx8GuM_73L6QNg";

// Helper to safely format currency/numbers
const safeNumber = (num: any) => Number(num) || 0;

const transformInvoice = (d: any): InvoiceData => {
  const items: InvoiceItem[] = [];

  // 1. Map Physio Programs
  if (d.items?.physioPrograms) {
    d.items.physioPrograms.forEach((p: any) => {
      items.push({
        description: p.description || "Physiotherapy Program",
        quantity: safeNumber(p.numberOfSessions),
        unitPrice: safeNumber(p.costPerSession),
        total: safeNumber(p.totalCost),
      });
    });
  }

  // 2. Map Treatments (Assuming standard structure: 1 qty, fixed cost)
  if (d.items?.treatments) {
    d.items.treatments.forEach((t: any) => {
      items.push({
        description: t.description || t.type || "Medical Treatment",
        quantity: 1,
        unitPrice: safeNumber(t.cost),
        total: safeNumber(t.cost),
      });
    });
  }

  // 3. Map Exams
  if (d.items?.exams) {
    d.items.exams.forEach((e: any) => {
      items.push({
        description: `${e.modality} - ${e.bodyPart}` || "Imaging Exam",
        quantity: 1,
        unitPrice: safeNumber(e.cost),
        total: safeNumber(e.cost),
      });
    });
  }

  // 4. Map Lab Tests
  if (d.items?.labTests) {
    d.items.labTests.forEach((l: any) => {
      items.push({
        description: l.testName || "Lab Test",
        quantity: 1,
        unitPrice: safeNumber(l.cost),
        total: safeNumber(l.cost),
      });
    });
  }

  // Calculate generic defaults for missing fields
  const subtotal = safeNumber(d.subtotal);
  const tax = 0; // API doesn't seem to return tax yet
  const discount = 0; 
  const totalAmount = subtotal + tax - discount;

  return {
    invoiceNumber: d.invoiceNumber || 'DRAFT',
    invoiceDate: d.invoiceDate ? new Date(d.invoiceDate).toLocaleDateString() : new Date().toLocaleDateString(),
    dueDate: d.dueDate ? new Date(d.dueDate).toLocaleDateString() : new Date().toLocaleDateString(), // Default to today if missing
    patient: {
      name: d.athleteName || 'Unknown Patient',
      email: d.athleteEmail || '', // API response didn't show email, falling back to empty
      id: (d.athleteId || '').toString(),
    },
    items: items,
    subtotal: subtotal,
    tax: tax,
    discount: discount,
    totalAmount: totalAmount,
    paidAmount: safeNumber(d.paidAmount), // Assuming 0 if not present
    status: d.status || "PENDING",
    caseId: d.caseId?.toString(),
    notes: d.notes,
    createdBy: (d.createdBy || 'System').toString(),
  };
};

const fetcher = async (url: string, token: string) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Fetch failed');
  return response.json();
};

export const useInvoiceByCaseId = (caseId: number | undefined) => {
   const { token } = useAuth();
  return useQuery({
    queryKey: ['invoice', 'case', caseId],
    queryFn: () => fetcher(`${API_URL}/invoices/case/${caseId}`, token!),
    enabled: !!caseId,
    select: (json) => transformInvoice(json.data), 
  });
};