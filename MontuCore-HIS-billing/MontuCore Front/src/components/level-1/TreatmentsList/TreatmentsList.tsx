import React from 'react';

import styles from './TreatmentsList.module.css';

import List from '../../level-0/List/List';

type TreatmentsListProps = {
  // [type, provider_name, cost, date]
  data: string[][];
};

function checkDataStructure(data: string[][], headerLength: number): boolean {
  return data.every((row) => row.length === headerLength);
}

function TreatmentsList({ data }: TreatmentsListProps) {
  const headerLabels = ['Type', 'Provider', 'Cost', 'Date'];

  if (!checkDataStructure(data, headerLabels.length)) {
    throw new Error('Data structure does not match header length');
  }

  const processedData = data.map((row) => {
    const [type, providerName, cost, date] = row;

    return [
      <span className={styles.type} key={`type-${type}-${date}`}>
        {type}
      </span>,
      <span className={styles.name}>providerName</span>,
      cost,
      <span className={styles.date}>{date}</span>,
    ];
  });

  return <List
    header={headerLabels}
    data={processedData}
    gridTemplateColumns="minmax(100px, 1fr) repeat(3, 5vw)"
    rowClassName={styles.row}
    headerClassName={styles.header}
  />
}

export default TreatmentsList;
