import React from 'react';
import styles from './UsersList.module.css';
import List from '../../level-0/List/List';
import { Status, StatusBadge } from '../../level-0/Badge/badge';
type UsersListProps = {
  data :string[][];
};

function checkDataStructure(data: String[][], headerLength: number): boolean {
  return data.every(row => row.length === headerLength);
}

function UsersList({data}: UsersListProps) {
  // chekk data structure number of columns match header length
  // extract the certain data
  // the avatar path handeling and not found case
  // status rendering with colors
  // button no added no data (should be passed as cell)
  const headerLabels = ['No.', 'name', 'position', 'status', 'actions'];
  if (!checkDataStructure(data, headerLabels.length)) {
    throw new Error("Data structure does not match header length");
  }
  const processedData = data.map(row => [
    row[0], // jerseyNumber
    <span className={styles.name}>{row[1]}</span>, // name
    row[2], // position
    // need to be  a badge
    // row[3] === 'active' ? <span className={styles.active}>Active</span> : <span className={styles.inactive}>Inactive</span>, // status with color
     <StatusBadge status={Status[row[3] as keyof typeof Status]} />, // status with color
    <div className={styles.actions}>
    <button className={styles.actionButton}>report</button> 
    <button className={styles.actionButton}>book</button> 
    </div>
  ]);

  // const data = data
  return (
    <List data={processedData} header={headerLabels} />
  );
}
export default UsersList;