import { useEffect } from 'react';
import styles from './ImageModal.module.scss';

const ImageModal = ({ imageUrl, onClose }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <img src={imageUrl} alt="Full size" className={styles.image} />
      </div>
    </div>
  );
};

export default ImageModal; 