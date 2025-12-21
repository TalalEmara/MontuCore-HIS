// src/pages/TablePage/TablePage.tsx
import React, { useState } from "react";
import List from "../../components/level-0/List/List";
import Pagination from "../../components/level-0/Pagination/Pagination"; //
import styles from "./TablePage.module.css"; // You'll need to create this
import Preview from "../../components/level-2/Preview/Preview";
import PreviewCase from "../../components/level-2/Preview/Preview";
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
}

function TablePage<T extends { id: string | number }>({
  title,
  useDataHook,
  columns,
  ActionHeader,
}: TablePageProps<T>) {
  const [doPreview, setDoPreview] = useState(true);
  
    const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // 1. Fetch Data
  const { data, isLoading, totalItems } = useDataHook(currentPage, pageSize);

  // 2. Transform Data for your specific <List /> component
  // Your <List /> expects string[] or ReactNode[], so we map it here
  const tableHeaders = columns.map((c) => c.header);

  const tableData = data?.map((item) => {
    return columns.map((col) => col.cell(item));
  });

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
          {/* Reusing your existing Level-0 List */}
          <List
            header={tableHeaders}
            data={tableData}
            // Pass grid template if needed, or make it dynamic
          />

          
        </div>
        {doPreview && <PreviewCase />}
      </div>
    </div>
  );
}

export default TablePage;
