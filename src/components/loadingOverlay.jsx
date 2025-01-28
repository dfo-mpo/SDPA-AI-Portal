import styles from '../styles/loadingOverlay.module.css';

function LoadingOverlay({active}) {

    return(
    <div id={styles.loadingOverlay} style={{display: active === true ? '' : 'none'}}>
        <div className={styles.loader}>
            <div className={`${styles.inner} ${styles.innerOne}`}></div>
            <div className={`${styles.inner} ${styles.innerTwo}`}></div>
            <div className={`${styles.inner} ${styles.innerThree}`}></div>
        </div>
    </div>
    );
}
export default LoadingOverlay;