import { useState } from "react";
import styles from "./bill.module.css";
import { generateBillPDF } from "./billPdfGeneration";
import { useInvoiceByCaseId } from "../../../hooks/useBilling"; 

interface BillProps {
  invoiceId?: number; 
}

export default function Bill({ invoiceId }: BillProps) {
  const [open, setOpen] = useState(false);

  const { 
    data: invoice, 
    isLoading, 
    isError 
  } = useInvoiceByCaseId(open ? invoiceId : undefined);

  const handleView = () => {
    if (!invoiceId) return;
    setOpen(true);
  };

  const downloadPDF = () => {
    if (!invoice) return;
    generateBillPDF(invoice);
  };

  const remaining = invoice ? invoice.totalAmount - invoice.paidAmount : 0;

  return (
    <>
      <button 
        className={styles.billButton} 
        onClick={handleView} 
        disabled={!invoiceId}
      >
        Bill
      </button>

      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.header}>
              <button className={styles.closeBtn} onClick={() => setOpen(false)}>×</button>
            </div>

            <div className={styles.content}>
              {isLoading ? (
                <div className={styles.loader}>Loading...</div>
              ) : isError ? (
                <div className={styles.error}>
                  <p>Error loading invoice data.</p>
                  <small>Ensure an invoice exists for Case #{invoiceId}</small>
                </div>
              ) : invoice ? (
                <>
                  <h1>
                    INVOICE <span>#{invoice.invoiceNumber}</span>
                  </h1>
                  <p><strong>Status:</strong> {invoice.status.replace("_", " ")}</p>
                  <p><strong>Date:</strong> {invoice.invoiceDate}</p>
                  <p><strong>Due Date:</strong> {invoice.dueDate}</p>
                  <p><strong>Patient:</strong> {invoice.patient.name} (ID: {invoice.patient.id})</p>
                  <p><strong>Email:</strong> {invoice.patient.email}</p>
                  {invoice.caseId && <p><strong>Case:</strong> {invoice.caseId}</p>}
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
                <p>No invoice data available.</p>
              )}
            </div>

            <div className={styles.footer}>
              <button 
                className={styles.downloadBtn} 
                onClick={downloadPDF} 
                disabled={!invoice}
              >
                Download
              </button>
              <button 
                className={styles.closeModalBtn} 
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}