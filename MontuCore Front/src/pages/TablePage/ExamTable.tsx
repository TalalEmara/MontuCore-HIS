import { useState, useCallback } from "react"; 
import TablePage from "./TablePage";
import Badge from "../../components/level-0/Badge/Badge";
import ExamDetail from "../../components/level-2/DetailsOverlay/ExamOverlay";
import ExamPreview from "../../components/level-2/Preview/ExamPreview";
import { useExams } from "../../hooks/useExams";

function ExamTable() {
  const [detailItem, setDetailItem] = useState<any>(null);

  const useExamsAdapter = () => {
    const { data, isLoading } = useExams();
    return { data: data || [], isLoading, totalItems: data?.length || 0 };
  };

  // Use useCallback to prevent unnecessary re-renders of the wrapper
  const ExamPreviewWrapper = useCallback((props: any) => (
    <ExamPreview 
      {...props} 
      onSeeDetails={() => {
        console.log("Opening details for exam:", props.data.id);
        setDetailItem(props.data);
      }} 
    />
  ), []);

  return (
    <>
      <TablePage
        title="Imaging & Radiology"
        useDataHook={useExamsAdapter}
        columns={[
          { header: "#", cell: (row: any) => row.id },
          { header: "Modality", cell: (row: any) => <strong>{row.modality}</strong> },
          { header: "Body Part", cell: (row: any) => row.bodyPart },
          { header: "Status", cell: (row: any) => <Badge label={row.status} variant={row.status === "COMPLETED" ? "success" : "pending"} /> },
        ]}
        PreviewComponent={ExamPreviewWrapper}
      />

      {/* RENDER OVERLAY LAST TO ENSURE IT APPEARS ON TOP */}
      {detailItem && (
        <ExamDetail 
          isOpen={!!detailItem} 
          onClose={() => setDetailItem(null)} 
        />
      )}
    </>
  );
}

export default ExamTable;