
import styles from './Preview.module.css'

interface PreviewProps {
    children?: React.ReactNode;
}
function Preview({children}: PreviewProps) {
  return (
   <div className={styles.panel} >
            {children}
        </div>
  )
}


function PreviewCase() {
    return (
        <Preview >
        <h1>Preview Panel</h1>
    </Preview>
  )
}
export default PreviewCase