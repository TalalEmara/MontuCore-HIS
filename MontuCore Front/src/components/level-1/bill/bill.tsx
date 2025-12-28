import { useState } from "react";
import styles from "./bill.module.css";
import { generateBillPDF } from "./billPdfGeneration";
import { useInvoiceByCaseId } from "../../../hooks/useBilling"; 

interface BillProps {
  // In CaseView, you pass <Bill invoiceId={caseId} />, so this prop holds the Case ID.
  invoiceId?: number; 
}

export default function Bill({ invoiceId }: BillProps) {
  const [open, setOpen] = useState(false);

  // Fetch data only when the modal is open to save resources
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

  // Calculate remaining balance
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
                <div className={styles.loader}>Loading Invoice...</div>
              ) : isError ? (
                <div className={styles.error}>
                  <p>Error loading invoice data.</p>
                  <small>Could not find an invoice for Case #{invoiceId}</small>
                </div>
              ) : invoice ? (
                <>
                  <div className={styles.invoiceHeader}>
                    <h1>INVOICE <span>#{invoice.invoiceNumber}</span></h1>
                  </div>
                  
                  <div className={styles.metaInfo}>
                    <p><strong>Status:</strong> <span style={{ textTransform: 'capitalize' }}>{invoice.status.replace(/_/g, " ").toLowerCase()}</span></p>
                    <p><strong>Date:</strong> {invoice.invoiceDate}</p>
                    <p><strong>Due Date:</strong> {invoice.dueDate}</p>
                    <p><strong>Patient:</strong> {invoice.patient.name} (ID: {invoice.patient.id})</p>
                    <p><strong>Email:</strong> {invoice.patient.email || 'N/A'}</p>
                    {invoice.caseId && <p><strong>Case ID:</strong> {invoice.caseId}</p>}
                    <p><strong>Created By:</strong> {invoice.createdBy || 'System'}</p>
                  </div>

                  {invoice.notes && (
                    <div className={styles.notesSection}>
                      <strong>Notes:</strong> {invoice.notes}
                    </div>
                  )}

                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th style={{ textAlign: 'center' }}>Qty</th>
                        <th style={{ textAlign: 'right' }}>Price</th>
                        <th style={{ textAlign: 'right' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.length > 0 ? (
                        invoice.items.map((item, i) => (
                          <tr key={i}>
                            <td>{item.description}</td>
                            <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                            <td style={{ textAlign: 'right' }}>${item.unitPrice.toFixed(2)}</td>
                            <td style={{ textAlign: 'right' }}>${item.total.toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} style={{ textAlign: "center", fontStyle: "italic" }}>
                            No billable items found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <div className={styles.totals}>
                    <div className={styles.totalRow}>
                       <span>Subtotal:</span> 
                       <span>${invoice.subtotal.toFixed(2)}</span>
                    </div>
                    {invoice.tax > 0 && (
                      <div className={styles.totalRow}>
                         <span>Tax:</span> 
                         <span>${invoice.tax.toFixed(2)}</span>
                      </div>
                    )}
                    {invoice.discount > 0 && (
                      <div className={styles.totalRow}>
                         <span>Discount:</span> 
                         <span>-${invoice.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                       <strong>Total:</strong> 
                       <strong>${invoice.totalAmount.toFixed(2)}</strong>
                    </div>
                    <div className={styles.totalRow}>
                       <span>Paid:</span> 
                       <span>-${invoice.paidAmount.toFixed(2)}</span>
                    </div>
                    <div className={`${styles.totalRow} ${styles.balance}`}>
                       <span>Balance Due:</span> 
                       <span>${remaining.toFixed(2)}</span>
                    </div>
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
                Download PDF
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