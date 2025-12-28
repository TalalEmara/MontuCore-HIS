import React from "react";
import { useNavigate } from "@tanstack/react-router"; 
import TablePage from "./TablePage";
import Badge from "../../components/level-0/Badge/Badge";
import PreviewCase from "../../components/level-2/Preview/Preview";
import { useMedicalCases } from "../../hooks/useMedicalCases"; 

const useMedicalCasesAdapter = (page: number, pageSize: number) => {
  const { data, isLoading } = useMedicalCases(); 
  return {
    data: data || [],
    isLoading,
    totalItems: data?.length || 0,
  };
};

const caseColumns = [
  { header: "#", cell: (row: any) => row.id },
  { header: "Athlete", cell: (row: any) => <span>{row.athlete?.fullName}</span> },
  { header: "Diagnosis", cell: (row: any) => <strong>{row.diagnosisName}</strong> },
  { 
    header: "Severity", 
    cell: (row: any) => <Badge label={row.severity} />
  },
  { header: "Date", cell: (row: any) => new Date(row.injuryDate).toLocaleDateString() },
  { 
    header: "Status", 
    cell: (row: any) => (
      <Badge 
        label={row.status} 
        variant={row.status === "RECOVERED" ? "success" : "pending"} 
      />
    ) 
  },
];

function CasesTablePage() {
  const navigate = useNavigate();

  // Inject navigation into Preview
  const CasePreviewWrapper = (props: { onClose: () => void; data: any }) => {
    return (
      <PreviewCase 
        {...props} 
        onSeeDetails={() => navigate({ to: `/cases/${props.data.id}` })} 
      />
    );
  };

  return (
    <TablePage
      title="Medical Cases"
      useDataHook={useMedicalCasesAdapter}
      columns={caseColumns}
      PreviewComponent={CasePreviewWrapper}
    />
  );
}

export default CasesTablePage;