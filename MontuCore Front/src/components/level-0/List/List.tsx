// List.tsx
import React from 'react';
import styles from './List.module.css';

type ListProps = {
  header: string[];
  data: React.ReactNode[][];
  gridTemplateColumns?: string;
  listClassName?: string;
  headerClassName?: string;
  rowClassName?: string;
};

function List({
  header,
  data,
  gridTemplateColumns,
  listClassName,
  headerClassName,
  rowClassName,
}: ListProps) {
  // Memoize style to avoid unnecessary re-renders
  const rowStyle = React.useMemo(
    () => (gridTemplateColumns ? { gridTemplateColumns } : undefined),
    [gridTemplateColumns]
  );

  return (
    <div className={`${styles.container} ${listClassName ?? ''}`}>
      <table className={styles.list}>
        <thead>
          <tr
            className={`${styles.headerRow} ${headerClassName ?? ''}`}
            style={rowStyle}
          >
            {header.map((h, i) => (
              <th key={i} title={typeof h === 'string' ? h : undefined}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className={`${styles.row} ${rowClassName ?? ''}`}
              style={rowStyle}
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