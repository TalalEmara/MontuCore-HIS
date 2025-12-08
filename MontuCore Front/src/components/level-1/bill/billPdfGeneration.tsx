import jsPDF from "jspdf";
import type { InvoiceData } from "./bills";

export const generateBillPDF = (invoice: InvoiceData) => {
  const doc = new jsPDF();

  doc.setTextColor(153, 0, 0);
  doc.setFontSize(22);
  doc.text("INVOICE", 105, 20, { align: "center" });

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Invoice #${invoice.invoiceNumber}`, 20, 40);
  doc.text(`Date: ${invoice.invoiceDate}`, 20, 48);
  doc.text(`Due: ${invoice.dueDate}`, 20, 56);
  doc.text(`Status: ${invoice.status.replace("_", " ")}`, 20, 64);
  doc.text(`Patient: ${invoice.patient.name}`, 20, 72);
  doc.text(invoice.patient.email, 20, 80);
  doc.text(`ID: ${invoice.patient.id}`, 20, 88);

  let infoY = 96;
  if (invoice.caseId) {
    doc.text(`Case: ${invoice.caseId}`, 20, infoY);
    infoY += 8;
  }
  if (invoice.sessionId) {
    doc.text(`Session: ${invoice.sessionId}`, 20, infoY);
    infoY += 8;
  }
  if (invoice.notes) {
    doc.text(`Notes: ${invoice.notes}`, 20, infoY);
    infoY += 8;
  }
  doc.text(`Created: ${invoice.createdBy || 'Unknown'}`, 20, infoY);

  doc.setFillColor(92, 6, 6);
  doc.rect(20, 115, 170, 10, 'F'); 
  doc.setTextColor(245, 239, 239);
  doc.setFont("helvetica", 'bold');
  doc.text("Description", 25, 122);
  doc.text("Quantity", 110, 122);
  doc.text("Price", 135, 122);
  doc.text("Total", 165, 122);
  doc.setFont("helvetica", 'normal');

  let y = 134;
  doc.setTextColor(0, 0, 0);
  invoice.items.forEach(item => {
    doc.text(item.description.substring(0, 25), 25, y);
    doc.text(`${item.quantity}`, 110, y, { align: 'right' });
    doc.text(`$${item.unitPrice.toFixed(2)}`, 135, y, { align: 'right' });
    doc.text(`$${item.total.toFixed(2)}`, 165, y, { align: 'right' });
    y += 8;
  });

  y += 8;
  doc.setDrawColor(153, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(20, y, 190, y); 

  y += 8;
  doc.setTextColor(0, 0, 0);
  doc.text("Subtotal:", 140, y, { align: 'right' });
  doc.text(`$${invoice.subtotal.toFixed(2)}`, 165, y, { align: 'right' });

  y += 7;
  doc.text("Tax:", 140, y, { align: 'right' });
  doc.text(`$${invoice.tax.toFixed(2)}`, 165, y, { align: 'right' });

  y += 7;
  doc.text("Discount:", 140, y, { align: 'right' });
  doc.text(`-$${invoice.discount.toFixed(2)}`, 165, y, { align: 'right' });

  y += 7;
  doc.setTextColor(153, 0, 0);
  doc.setFont("helvetica", 'bold');
  doc.text("Total:", 140, y, { align: 'right' });
  doc.text(`$${invoice.totalAmount.toFixed(2)}`, 165, y, { align: 'right' });
  doc.setFont("helvetica", 'normal');

  y += 7;
  doc.setTextColor(0, 0, 0);
  doc.text("Paid:", 140, y, { align: 'right' });
  doc.text(`-$${invoice.paidAmount.toFixed(2)}`, 165, y, { align: 'right' });

  y += 7;
  const remaining = invoice.totalAmount - invoice.paidAmount;
  doc.text("Remaining:", 140, y, { align: 'right' });
  doc.text(`$${remaining.toFixed(2)}`, 165, y, { align: 'right' });

  doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
};
