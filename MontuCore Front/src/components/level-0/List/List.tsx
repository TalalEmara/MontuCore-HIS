
import React from 'react';
import styles from './List.module.css';

type ListProps = {
  header: string[];
  data: React.ReactNode[][];
  gridTemplateColumns?: string;
  listClassName?: string;
  headerClassName?: string;
  rowClassName?: string;
  // Update type to accept index number
  onClick?: (index: number) => void;
};

function List({
  header,
  data,
  gridTemplateColumns,
  listClassName,
  headerClassName,
  rowClassName,
  onClick
}: ListProps) {
  return (
    <div className={`${styles.list} ${listClassName ?? ''}`}>
      <div
        className={`${styles.listHeader} ${headerClassName ?? ''}`}
        style={{ gridTemplateColumns }}
      >
        {header.map((h) => (
          <div key={h}>{h}</div>
        ))}
      </div>

      {data.map((row, i) => (
        <div
          key={i}
          className={`${styles.row} ${rowClassName ?? ''}`}
          style={{ gridTemplateColumns }}
          // FIX IS HERE: Wrap in arrow function and pass 'i'
          onClick={() => onClick && onClick(i)}
        >
          {row.map((cell, j) => (
            <div key={j}>{cell}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default List;