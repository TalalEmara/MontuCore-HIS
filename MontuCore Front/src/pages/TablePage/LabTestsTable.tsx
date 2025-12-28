import React, { useState, useCallback } from "react";
import LabTestDetail from "../../components/level-2/DetailsOverlay/labTestOverlay";
import TablePage from "./TablePage";
import LabTestPreview from "../../components/level-2/Preview/LabTestPreview";
import Badge from "../../components/level-0/Badge/Badge"; 
import { useLabTests } from "../../hooks/useLabTests";

function LabTable() {
  const [detailItem, setDetailItem] = useState<any>(null);

  const useLabDataAdapter = () => {
    const { data, isLoading } = useLabTests();
    return { data: data || [], isLoading, totalItems: data?.length || 0 };
  };

  const LabPreviewWrapper = useCallback((props: any) => (
    <LabTestPreview 
      {...props} 
      onSeeDetails={() => {
        console.log("Opening details for lab test:", props.data.id);
        setDetailItem(props.data);
      }} 
    />
  ), []);

  return (
    <>
      <TablePage
        title="Laboratory Tests"
        useDataHook={useLabDataAdapter}
        columns={[
          { header: "ID", cell: (row: any) => row.id },
          { header: "Test Name", cell: (row: any) => <strong>{row.testName}</strong> },
          { header: "Category", cell: (row: any) => row.category },
          { header: "Status", cell: (row: any) => <Badge label={row.status} variant={row.status === "COMPLETED" ? "success" : "pending"} /> },
        ]}
        PreviewComponent={LabPreviewWrapper}
      />

      {/* RENDER OVERLAY LAST */}
      {detailItem && (
        <LabTestDetail 
          isOpen={!!detailItem} 
          onClose={() => setDetailItem(null)} 
        />
      )}
    </>
  );
}

export default LabTable;