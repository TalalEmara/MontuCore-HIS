import { useState } from "react";
import styles from "./bill.module.css";
import { useInvoice } from "../../../hooks/useBilling"; // Import the hook
import { generateBillPDF } from "./billPdfGeneration";

interface BillProps {
  invoiceId?: number; // Backend uses numbers for IDs
}

export default function Bill({ invoiceId }: BillProps) {
  const [open, setOpen] = useState(false);
  
  // Use the hook inside the component
  const { data: invoice, isLoading, isError } = useInvoice(open ? invoiceId : undefined);

  const handleView = () => setOpen(true);

  const downloadPDF = () => {
    if (invoice) generateBillPDF(invoice);
  };

  return (
    <>
      <button className={styles.billButton} onClick={handleView} disabled={!invoiceId}>
        Bill
      </button>

      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.content}>
              {isLoading ? (
                <div className={styles.loader}>Loading...</div>
              ) : isError ? (
                <div className={styles.error}>Error loading invoice data.</div>
              ) : invoice ? (
                <>
                  <h1>INVOICE <span>#{invoice.invoiceNumber}</span></h1>
                  <p><strong>Status:</strong> {invoice.status}</p>
                  <p><strong>Patient:</strong> {invoice.patient.name}</p>
                  
                  <table className={styles.table}>
                    {/* ... (Keep your existing table mapping) ... */}
                    <tbody>
                       {invoice.items.map((item, i) => (
                         <tr key={i}>
                           <td>{item.description}</td>
                           <td>{item.quantity}</td>
                           <td>${item.unitPrice}</td>
                           <td>${item.total}</td>
                         </tr>
                       ))}
                    </tbody>
                  </table>
                </>
              ) : null}
            </div>
            <div className={styles.footer}>
              <button onClick={downloadPDF} disabled={!invoice}>Download</button>
              <button onClick={() => setOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}