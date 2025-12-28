import React from "react";
import TablePage from "./TablePage";
import Badge from "../../components/level-0/Badge/Badge";
import { usePhysioPrograms } from "../../hooks/usePhysioPrograms";

const usePhysioAdapter = () => {
  const { data, isLoading } = usePhysioPrograms();

  return {
    data: data || [],
    isLoading,
    totalItems: data?.length || 0,
  };
};

const progressColumns = [
  { header: "#", cell: (row: any) => row.id },
  { header: "Program Title", cell: (row: any) => <strong>{row.title}</strong> },
  { 
    header: "Total Sessions", 
    cell: (row: any) => <span>{row.numberOfSessions}</span> 
  },
  { 
    header: "Sessions Completed", 
    cell: (row: any) => <span>{row.sessionsCompleted}</span> 
  },
  { 
    header: "Status", 
    cell: (row: any) => {
      const isDone = row.sessionsCompleted >= row.numberOfSessions;
      return (
        <Badge 
          label={isDone ? "Completed" : "In Progress"} 
          variant={isDone ? "success" : "pending"} 
        />
      );
    } 
  },
  { header: "Weekly Reps", cell: (row: any) => `${row.weeklyRepetition}x` },
  { header: "Start Date", cell: (row: any) => new Date(row.startDate).toLocaleDateString() },
];

function PhysioProgressTable() {
  return (
    <TablePage
      title="Physio Progress"
      useDataHook={usePhysioAdapter}
      columns={progressColumns}
    />
  );
}

export default PhysioProgressTable;