import React, { useState } from "react";
import LabTestDetail from "../../components/level-2/DetailsOverlay/labTestOverlay";
import TablePage from "./TablePage";
import LabTestPreview from "../../components/level-2/Preview/LabTestPreview";
import Badge from "../../components/level-0/Badge/Badge"; 

interface LabRecord {
  id: number;
  testName: string;
  category: string;
  status: "COMPLETED" | "PENDING" | "CANCELLED";
  date: string;
}

const labsData: LabRecord[] = [
  { id: 1, testName: "Complete Blood Count", category: "Hematology", status: "COMPLETED", date: "2025-12-11" },
  { id: 7, testName: "Coagulation Profile", category: "Hematology", status: "COMPLETED", date: "2025-12-11" },
];

const useLabData = (page: number, pageSize: number) => ({
  data: labsData,
  isLoading: false,
  totalItems: labsData.length,
});

const testColumns = [
  { header: "ID", cell: (row: LabRecord) => row.id },
  { header: "Test Name", cell: (row: LabRecord) => <strong>{row.testName}</strong> },
  { header: "Category", cell: (row: LabRecord) => row.category },
  { header: "Date", cell: (row: LabRecord) => row.date },
  { 
    header: "Status", 
    cell: (row: LabRecord) => (
      <Badge 
        label={row.status} 
        variant={row.status === "COMPLETED" ? "success" : "pending"} 
      />
    ) 
  },
];

function LabTable() {
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);

  const LabPreviewWithDetails = (props: any) => (
    <LabTestPreview {...props} onSeeDetails={() => setIsOverlayVisible(true)} />
  );

  return (
    <>
      <LabTestDetail 
        isOpen={isOverlayVisible} 
        onClose={() => setIsOverlayVisible(false)} 
      />
      
      <TablePage
        title="Laboratory Tests"
        useDataHook={useLabData}
        columns={testColumns}
        PreviewComponent={LabPreviewWithDetails}
      />
    </>
  );
}

export default LabTable;