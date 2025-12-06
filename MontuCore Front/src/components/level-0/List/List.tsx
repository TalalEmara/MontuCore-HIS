import React from 'react';
import styles from './List.module.css';

type CellProps = {
  children: React.ReactNode;
};

function Cell({ children }: CellProps) {
  return <div className={styles.cell}>{children}</div>;
}

type RowProps = {
  cells: React.ReactNode[];
};

function Row({ cells }: RowProps) {
  return (
    <div className={styles.row}>
      {cells.map((child, index) => (
        <Cell key={index}>{child}</Cell>
      ))}
    </div>
  );
}

type ListHeaderProps = {
  headers: React.ReactNode[];
};

function ListHeader({ headers }: ListHeaderProps) {
  return (
    <div className={styles.listHeader}>
      {headers.map((header, index) => (
        <Cell key={index}>{header}</Cell>
      ))}
    </div>
  );
}

type ElementCardProps = {
  cells: React.ReactNode[];
};

function ElementCard({ cells }: ElementCardProps) {
  // ElementCard is just one Row
  return <Row cells={cells} />;
}

// needs validation to be same number of columns in header and data
type ListProps = {
  header: React.ReactNode[];
  data: React.ReactNode[][];
};

function List({ header, data }: ListProps) {
  return (
    <div className={styles.list}>
      <ListHeader headers={header} />
      {data.map((rowCells, index) => (
        <ElementCard key={index} cells={rowCells} />
      ))}
    </div>
  );
}

export default List;
