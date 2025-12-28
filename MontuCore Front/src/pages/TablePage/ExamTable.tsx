import  { useState } from "react"; 
import TablePage from "./TablePage";
import Badge from "../../components/level-0/Badge/Badge";
import ExamOverlay from "../../components/level-2/DetailsOverlay/ExamOverlay";
import ExamPreview from "../../components/level-2/Preview/ExamPreview";

const useExamsData = (page: number, pageSize: number) => {
  const exams = [
    { id: 13, modality: "MRI", bodyPart: "Knee", status: "COMPLETED", scheduledAt: "2025-12-09T13:50:06.658Z" },
    { id: 10, modality: "X-RAY", bodyPart: "Knee", status: "COMPLETED", scheduledAt: "2025-12-08T13:50:06.658Z" },
  ];
  return { data: exams, isLoading: false, totalItems: exams.length };
};

function ExamTable() {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  // Wrapper to pass the overlay trigger into the preview
  const ExamPreviewWithOverlay = (props: any) => (
    <ExamPreview {...props} onSeeDetails={() => setIsOverlayOpen(true)} />
  );

  const examColumns = [
    { header: "#", cell: (row: any) => row.id },
    { header: "Modality", cell: (row: any) => <strong>{row.modality}</strong> },
    { header: "Body Part", cell: (row: any) => row.bodyPart },
    { header: "Scheduled At", cell: (row: any) => new Date(row.scheduledAt).toLocaleDateString() },
    { 
      header: "Status", 
      cell: (row: any) => (
        <Badge label={row.status} variant={row.status === "COMPLETED" ? "success" : "pending"} />
      ) 
    },
  ];

  return (
    <>
      <ExamOverlay isOpen={isOverlayOpen} onClose={() => setIsOverlayOpen(false)} />
      <TablePage
        title="Imaging & Radiology"
        useDataHook={useExamsData}
        columns={examColumns}
        PreviewComponent={ExamPreviewWithOverlay}
      />
    </>
  );
}

export default ExamTable;