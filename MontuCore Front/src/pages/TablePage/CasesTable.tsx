import TablePage from "./TablePage";
import Badge from "../../components/level-0/Badge/Badge";
import PreviewCase from "../../components/level-2/Preview/Preview"; // Import the Case Preview component

const useMedicalCases = (page: number, pageSize: number) => {
  const cases = [
    { id: 1, diagnosis: "Complete ACL Tear", severity: "SEVERE", date: "12/07/2025", status: "ACTIVE" },
    { id: 10, diagnosis: "Ankle Sprain", severity: "MILD", date: "12/17/2025", status: "RECOVERED" },
    { id: 15, diagnosis: "Spinal Compression", severity: "CRITICAL", date: "12/20/2025", status: "ACTIVE" },
  ];

  return {
    data: cases,
    isLoading: false,
    totalItems: cases.length,
  };
};

const caseColumns = [
  { header: "#", cell: (row: any) => row.id },
  { header: "Diagnosis", cell: (row: any) => <strong>{row.diagnosis}</strong> },
  { 
    header: "Severity", 
    cell: (row: any) => {
      let variant: "success" | "warning" | "pending" = "pending";
      
      if (row.severity === "MILD") variant = "success";
      else if (row.severity === "MODERATE" || row.severity === "SEVERE" || row.severity === "CRITICAL") variant = "warning";
      
      return <Badge label={row.severity} variant={variant} />;
    }
  },
  { header: "Date", cell: (row: any) => row.date },
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
  return (
    <TablePage
      title="Medical Cases"
      useDataHook={useMedicalCases}
      columns={caseColumns}
      PreviewComponent={PreviewCase} 
    />
  );
}

export default CasesTablePage;