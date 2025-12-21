// Inside src/router.tsx (or a new file)
import TablePage from "./TablePage"; // Ensure this import path is correct
// OR define the interface locally if you haven't made a types file yet:


// --- 1. Mock Data Hook ---
const useMockUsers = (page: number, pageSize: number) => {
  // Simulating an API call
  return {
    data: [
      { id: 1, name: "Cristiano Ronaldo", role: "Striker", status: "Active" },
      { id: 2, name: "Lionel Messi", role: "Playmaker", status: "Inactive" },
    ],
    isLoading: false,
    totalItems: 2,
  };
};

// --- 2. Define Columns ---
const testColumns = [
  { header: "ID", cell: (row: any) => row.id },
  { header: "Name", cell: (row: any) => <strong>{row.name}</strong> },
  { header: "Role", cell: (row: any) => row.role },
  { header: "Status", cell: (row: any) => row.status },
];

// --- 3. The Configuration Wrapper ---
function TestTablePage() {
  return (
    <TablePage
      title="Test Table Integration"
      useDataHook={useMockUsers}
      columns={testColumns}
      ActionHeader={<button>Test Action</button>}
    />
  );
}
export default TestTablePage;