import React from 'react';
import styles from './List.module.css';

type ListProps = {
  header: string[];
  data: React.ReactNode[][] | string[][] | undefined;
  gridTemplateColumns?: string;
  listClassName?: string;
  headerClassName?: string;
  rowClassName?: string;
  // 1. Add this prop
  onRowClick?: (index: number) => void; 
};

function List({
  header,
  data,
  gridTemplateColumns,
  listClassName,
  headerClassName,
  rowClassName,
  onRowClick, // 2. Destructure it
}: ListProps) {
  
  const rowStyle = React.useMemo(
    () => (gridTemplateColumns ? { gridTemplateColumns } : undefined),
    [gridTemplateColumns]
  );
  
  const safeData = data || [];

  return (
    <div className={`${styles.container} ${listClassName ?? ''}`}>
      <table className={styles.list}>
        <thead>
          <tr className={`${styles.headerRow} ${headerClassName ?? ''}`} style={rowStyle}>
            {header.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {safeData.map((row, i) => (
            <tr
              key={i}
              className={`${styles.row} ${rowClassName ?? ''}`}
              style={{
                ...rowStyle,
                // Optional: Show pointer cursor if clickable
                cursor: onRowClick ? 'pointer' : 'default' 
              }}
              // 3. Attach the click handler, passing the index
              onClick={() => onRowClick && onRowClick(i)} 
            >
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default List;