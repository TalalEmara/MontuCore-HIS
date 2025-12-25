import { useState } from "react";
import styles from "./bill.module.css";
import { generateBillPDF } from "./billPdfGeneration";

import type { InvoiceData } from "./bills";

interface BillProps {
  invoiceId?: string;
  onFetchInvoice?: (id: string) => Promise<InvoiceData>;
}

export default function Bill({ invoiceId, onFetchInvoice }: BillProps) {
  const [open, setOpen] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleView = async () => {
    if (!invoiceId || !onFetchInvoice) return;
    setLoading(true);
    setOpen(true);
    try {
      const data = await onFetchInvoice(invoiceId);
      setInvoice(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!invoice) return;
    generateBillPDF(invoice);
  };

  const remaining = invoice ? invoice.totalAmount - invoice.paidAmount : 0;

  return (
    <>
      <button className={styles.billButton} onClick={handleView}>
        Bill
      </button>

      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.header}>
              <button className={styles.closeBtn} onClick={() => setOpen(false)}>×</button>
            </div>

            <div className={styles.content}>
              {loading ? (
                <div>Loading...</div>
              ) : invoice ? (
                <>
                  <h1>
                    INVOICE <span>#{invoice.invoiceNumber}</span>
                  </h1>
                  <p><strong>Status:</strong> {invoice.status.replace("_", " ")}</p>
                  <p><strong>Date:</strong> {invoice.invoiceDate}</p>
                  <p><strong>Due Date:</strong> {invoice.dueDate}</p>
                  <p><strong>Patient:</strong> {invoice.patient.name} ({invoice.patient.id})</p>
                  <p><strong>Email:</strong> {invoice.patient.email}</p>
                  {invoice.caseId && <p><strong>Case:</strong> {invoice.caseId}</p>}
                  {invoice.sessionId && <p><strong>Session:</strong> {invoice.sessionId}</p>}
                  {invoice.notes && <p><strong>Notes:</strong> {invoice.notes}</p>}
                  <p><strong>Created By:</strong> {invoice.createdBy || 'Unknown'}</p>

                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((item, i) => (
                        <tr key={i}>
                          <td>{item.description}</td>
                          <td>{item.quantity}</td>
                          <td>${item.unitPrice.toFixed(2)}</td>
                          <td>${item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className={styles.totals}>
                    <div><span>Subtotal:</span> <span>${invoice.subtotal.toFixed(2)}</span></div>
                    <div><span>Tax:</span> <span>${invoice.tax.toFixed(2)}</span></div>
                    <div><span>Discount:</span> <span>-${invoice.discount.toFixed(2)}</span></div>
                    <div><strong>Total:</strong> <strong>${invoice.totalAmount.toFixed(2)}</strong></div>
                    <div><span>Paid:</span> <span>-${invoice.paidAmount.toFixed(2)}</span></div>
                    <div><span>Remaining:</span> <span>${remaining.toFixed(2)}</span></div>
                  </div>
                </>
              ) : (
                <p>No invoice data.</p>
              )}
            </div>

            <div className={styles.footer}>
              <button className={styles.downloadBtn} onClick={downloadPDF} disabled={!invoice}>
                Download
              </button>
              <button className={styles.closeModalBtn} onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
