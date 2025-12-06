import React from 'react'
import styles from './CaseView.module.css';
import UsersList from '../../components/level-1/UserList/UsersList';
import AdjustableCard from '../../components/level-1/AdjustableCard/AdjustableCard';

// should take specific case data
function CaseView() {
  return (
    <div className={styles.caseView}>
      <div className={styles.overview}>
        <p className={styles.title}>CaseView</p>
      </div>
      <div className={styles.reports}>
        {/* <p> reports</p> */}
        <AdjustableCard title='Reports' maxHeight='100%'>
        <UsersList data={[
          ['01', 'Lionel Messi',     'Forward',  'Pending',      'View'],
          ['02', 'Cristiano Ronaldo','Forward',  'Injured',  'Edit'],
          ['03', 'Kevin De Bruyne',  'Midfielder','Pending', 'View'],
          ['03', 'Kevin De Bruyne',  'Midfielder','Pending', 'View'],
          ['04', 'Virgil van Dijk',  'Defender', 'Fit',      'Disable']]} />
          </AdjustableCard>
      </div>
      <div className={styles.treatments}>
        <AdjustableCard title='Treatments' maxHeight='100%' maxWidth='100%'>
           <UsersList data={[
          ['01', 'Lionel Messi',     'Forward',  'Pending',      'View'],
          ['02', 'Cristiano Ronaldo','Forward',  'Injured',  'Edit'],
          ['03', 'Kevin De Bruyne',  'Midfielder','Pending', 'View'],
          ['03', 'Kevin De Bruyne',  'Midfielder','Pending', 'View'],
          ['04', 'Virgil van Dijk',  'Defender', 'Fit',      'Disable']]} />
          </AdjustableCard>
      </div>
      <div className={styles.physiotherapy}>
        <p>physio</p>
      </div>
      <div className={styles.buttons}>
        <p>sasd </p>
      </div>
      </div>
  )
}

export default CaseView