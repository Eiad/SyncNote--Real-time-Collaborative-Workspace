import { FiLoader } from 'react-icons/fi';
import styles from './GlobalLoader.module.scss';

const GlobalLoader = ({ message }) => {
  return (
    <div className={styles.loaderOverlay}>
      <div className={styles.loaderContent}>
        <FiLoader className={styles.spinnerIcon} />
        <span>{message}</span>
      </div>
    </div>
  );
};

export default GlobalLoader;
