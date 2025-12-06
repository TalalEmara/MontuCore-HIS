import  { useState } from 'react'
import styles from './CaseView.module.css';
import UsersList from '../../components/level-1/UserList/UsersList';
import AdjustableCard from '../../components/level-1/AdjustableCard/AdjustableCard';
import Button from '../../components/level-0/Button/Bottom';
import { BodyComponent } from "reactjs-human-body";
// should take specific case data
function CaseView() {
  const [activeTab, setActiveTab] = useState<'overview' | 'images'>('overview');
  return (
    <div className={styles.caseView}>
      <div className={styles.overview}>
        <div className={styles.tabButtons}>
          <Button variant="primary" onClick={() => setActiveTab('overview')} className={styles.tabButton}>overview</Button>
          <Button variant="primary" onClick={() => setActiveTab('images')} className={styles.tabButton}>Images</Button>
        </div>
        {activeTab === 'overview' && (
          <div className={styles.bodyComponent}>
            <BodyComponent
              onClick={(id: string) => { console.log(id); }}
              partsInput={{
                head: { show: true },
                leftShoulder: { show: true },
                rightShoulder: { show: true },
                leftArm: { show: true },
                rightArm: { show: true },
                chest: { show: true },
                stomach: { show: true },
                leftLeg: { show: true },
                rightLeg: { show: true },
                leftHand: { show: true },
                rightHand: { show: true },
                leftFoot: { show: true },
                rightFoot: { show: true }
              }}
            />
          </div>
        )}

        {activeTab === 'images' && (
            <UsersList data={[
              ['01', 'Lionel Messi',      'Forward',    'Pending', 'View'],
              ['02', 'Cristiano Ronaldo', 'Forward',    'Injured', 'Edit'],
              ['03', 'Kevin De Bruyne',   'Midfielder', 'Pending', 'View'],
              ['04', 'Virgil van Dijk',   'Defender',   'Fit',     'Disable'],
              ['01', 'Lionel Messi',      'Forward',    'Pending', 'View'],
              ['02', 'Cristiano Ronaldo', 'Forward',    'Injured', 'Edit'],
              ['03', 'Kevin De Bruyne',   'Midfielder', 'Pending', 'View'],
              ['04', 'Virgil van Dijk',   'Defender',   'Fit',     'Disable'],
              ['01', 'Lionel Messi',      'Forward',    'Pending', 'View'],
              ['02', 'Cristiano Ronaldo', 'Forward',    'Injured', 'Edit'],
              ['03', 'Kevin De Bruyne',   'Midfielder', 'Pending', 'View'],
              ['03', 'Kevin De Bruyne',   'Midfielder', 'Pending', 'View'],
              ['03', 'Kevin De Bruyne',   'Midfielder', 'Pending', 'View'],
              ['03', 'Kevin De Bruyne',   'Midfielder', 'Pending', 'View'],
              ['04', 'Virgil van Dijk',   'Defender',   'Fit',     'Disable'],
            ]} />

        )}
          <p className={styles.title}>Case number <span>Dr. Alphons</span></p>
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
        <Button variant="primary" width='100%' className= {styles.addbutton}  >Add report</Button>
        <Button variant="secondary" >delete</Button>
      </div>
      </div>
  )
}

export default CaseView