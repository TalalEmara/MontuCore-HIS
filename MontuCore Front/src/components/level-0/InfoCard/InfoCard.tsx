import styles from './InfoCard.module.css';
type InfoCardProps = {
  label: string;
  value: string | number | undefined;
};
 function InfoCard( {label, value}: InfoCardProps) {
  return (
    <div className={styles.card} >
        <p className={styles.value}>{value}</p>
        <p className={styles.label}>{label}</p>
    </div>
  )
 
}
export default InfoCard