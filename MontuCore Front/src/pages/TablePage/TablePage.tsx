import React, { useState } from "react";
import List from "../../components/level-0/List/List";
import Pagination from "../../components/level-0/Pagination/Pagination";
import styles from "./TablePage.module.css";

function TablePage<T extends { id: string | number }>({
  title,
  useDataHook,
  columns,
  ActionHeader,
  PreviewComponent,
}: any) {
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, totalItems } = useDataHook(currentPage, pageSize);

  const tableHeaders = columns.map((c: any) => c.header);
  const tableData = data?.map((item: T) => columns.map((col: any) => col.cell(item)));

// src/pages/TablePage/TablePage.tsx
const handleRowClick = (index: number) => {
  console.log("Row clicked index:", index); // Add this for debugging
  if (data && data[index]) {
    setSelectedItem(data[index]); 
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
          <List header={tableHeaders} data={tableData} onRowClick={handleRowClick} />
        </div>
        
        {/* The side panel integration */}
        {selectedItem && PreviewComponent && (
          <PreviewComponent 
            onClose={() => setSelectedItem(null)} 
            data={selectedItem} 
          />
        )}
      </div>
    </div>
  );
}

export default TablePage;