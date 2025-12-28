import React from "react";
import TablePage from "./TablePage";
import Badge from "../../components/level-0/Badge/Badge";

interface PhysioProgram {
  id: number;
  case_id: number;
  title: string;
  number_of_sessions: number;
  sessions_completed: number;
  start_date: string;
  weekly_repetition: number;
}

const usePhysioProgress = (page: number, pageSize: number) => {
  const programs: PhysioProgram[] = [
    {
      id: 1,
      case_id: 101,
      title: "ACL Rehab Phase 1",
      number_of_sessions: 12,
      sessions_completed: 4,
      start_date: "2024-05-10",
      weekly_repetition: 3,
    },
    {
      id: 2,
      case_id: 105,
      title: "Ankle Mobility Protocol",
      number_of_sessions: 8,
      sessions_completed: 8,
      start_date: "2024-04-15",
      weekly_repetition: 2,
    },
  ];

  return {
    data: programs,
    isLoading: false,
    totalItems: programs.length,
  };
};

const progressColumns = [
  { header: "#", cell: (row: PhysioProgram) => row.id },
  { header: "Program Title", cell: (row: PhysioProgram) => <strong>{row.title}</strong> },
  { 
    header: "Total Sessions", 
    cell: (row: PhysioProgram) => (
      <span>{row.number_of_sessions}</span>
    ) 
  },
  { 
    header: "Sessions Completed", 
    cell: (row: PhysioProgram) => (
      <span>{row.sessions_completed}</span>
    ) 
  },
  { 
    header: "Status", 
    cell: (row: PhysioProgram) => {
      const isDone = row.sessions_completed === row.number_of_sessions;
      return (
        <Badge 
          label={isDone ? "Completed" : "In Progress"} 
          variant={isDone ? "success" : "pending"} 
        />
      );
    } 
  },
  { header: "Weekly Reps", cell: (row: PhysioProgram) => `${row.weekly_repetition}x` },
  { header: "Start Date", cell: (row: PhysioProgram) => new Date(row.start_date).toLocaleDateString() },
];

function PhysioProgressTable() {
  return (
    <TablePage
      title="Physio Progress"
      useDataHook={usePhysioProgress}
      columns={progressColumns}

    />
  );
}

export default PhysioProgressTable;