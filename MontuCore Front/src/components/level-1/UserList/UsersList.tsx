import React from 'react';
import styles from './UsersList.module.css';
import List from '../../level-0/List/List';
type UsersListProps = {
  data :String[][];
};

function UsersList({data}: UsersListProps) {
  // chekk data structure number of columns match header length
  // extract the certain data
  // the avatar path handeling and not found case
  // status rendering with colors
  // button no added no data (should be passed as cell)
  const data = 
  return (
    <List data={data} header={['ID', 'Name', 'Status', 'Actions', 'LL']} />
  );
}