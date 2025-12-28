// src/pages/TablePage/TablePage.tsx
import React, { useState } from "react";
import List from "../../components/level-0/List/List";
import Pagination from "../../components/level-0/Pagination/Pagination"; //
import styles from "./TablePage.module.css"; // You'll need to create this
import PreviewCase from "../../components/level-2/Preview/Preview";
import AthletePreview from "../../components/level-2/Preview/AthletePreview";
import ExamPreview from "../../components/level-2/Preview/ExamPreview";
import ClinicianPreview from "../../components/level-2/Preview/ClinicianPreview";
import LabTestPreview from "../../components/level-2/Preview/LabTestPreview";
import TreatmentPreview from "../../components/level-2/Preview/TreatmentPreview";

interface ColumnDefinition<T> {
  header: string;
  cell: (item: T) => React.ReactNode;
}

// Define a generic type for the props
interface TablePageProps<T> {
  title: string;

  // The data fetching hook (TanStack Query style)
  useDataHook: (
    page: number,
    pageSize: number
  ) => {
    data?: T[];
    isLoading: boolean;
    totalItems?: number; // Needed for pagination
  };

  // Configuration for columns
  columns: ColumnDefinition<T>[];

  // Optional: Custom Action/Filter bar component
  ActionHeader?: React.ReactNode;

  // Added: Pass the specific Preview component for this page
  PreviewComponent?: React.ComponentType<{ onClose: () => void }>;
}

function TablePage<T extends { id: string | number }>({
  title,
  useDataHook,
  columns,
  ActionHeader,
  PreviewComponent, // Destructured
}: TablePageProps<T>) {
  const [doPreview, setDoPreview] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // 1. Fetch Data
  const { data, isLoading, totalItems } = useDataHook(currentPage, pageSize);

  // 2. Transform Data for your specific <List /> component
  const tableHeaders = columns.map((c) => c.header);

  const tableData = data?.map((item) => {
    return columns.map((col) => col.cell(item));
  });

  const handleRowClick = (index: number) => {
    if (data && data[index]) {
      setDoPreview(true); // Show the panel
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.topBar}>
        <h1>{title}</h1>
        {ActionHeader}
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil((totalItems || 0) / pageSize)}
          onPageChange={setCurrentPage}
        />
      </div>
      <div className={styles.contentArea}>
        <div className={styles.tableWrapper}>
          <List
            header={tableHeaders}
            data={tableData}
            onRowClick={handleRowClick}
          />
        </div>
        {doPreview && PreviewComponent && (
          <PreviewComponent onClose={() => setDoPreview(false)} />
        )}
      </div>
    </div>
  );
}

export default TablePage;