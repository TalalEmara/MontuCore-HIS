import React from 'react';
import styles from './LabTestsList.module.css';
import List from '../../level-0/List/List';
import Badge from '../../level-0/Badge/badge';

type LabTestsListProps = {
  data :string[][];
};

function checkDataStructure(data: String[][], headerLength: number): boolean {
  return data.every(row => row.length === headerLength);
}

function LabTestsList({data}: LabTestsListProps) {
  // chekk data structure number of columns match header length
  // extract the certain data
  // the avatar path handeling and not found case
  // status rendering with colors
  // button no added no data (should be passed as cell)
  const headerLabels = ['id', 'name', 'category', 'status', 'sample date'];
  if (!checkDataStructure(data, headerLabels.length)) {
    throw new Error("Data structure does not match header length");
  }
  const processedData = data.map(row => [
    row[0], // id
    <span className={styles.name}>{row[1]}</span>, // name
    row[2], // category
    // need to be  a badge
    row[3] === "COMPLETED"? <Badge label= "completed" variant = 'success'/> : <Badge variant='pending' label={''}/>,
   
    row[4]
  ]);

  // const data = data
  return (
    <List data={processedData} header={headerLabels} />
  );
}
export default LabTestsList;