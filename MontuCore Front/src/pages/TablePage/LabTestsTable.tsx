import React, { useState } from "react";
import LabTestDetail from "../../components/level-2/DetailsOverlay/labTestOverlay";
import TablePage from "./TablePage";
import LabTestPreview from "../../components/level-2/Preview/LabTestPreview";

const useMockUsers = (page: number, pageSize: number) => ({
  data: [
    { id: 1, name: "Cristiano Ronaldo", role: "Striker", status: "Active" },
    { id: 2, name: "Lionel Messi", role: "Playmaker", status: "Inactive" },
  ],
  isLoading: false,
  totalItems: 2,
});

const testColumns = [
  { header: "ID", cell: (row: any) => row.id },
  { header: "Name", cell: (row: any) => <strong>{row.name}</strong> },
  { header: "Role", cell: (row: any) => row.role },
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
        useDataHook={useMockUsers}
        columns={testColumns}
        PreviewComponent={LabPreviewWithDetails}
      />
    </>
  );
}

export default LabTable;