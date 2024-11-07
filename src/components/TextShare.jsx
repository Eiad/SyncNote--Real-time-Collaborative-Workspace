import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import styles from './TextShare.module.scss';
import { FiTrash2, FiSave } from 'react-icons/fi';

const TextShare = ({ documentId }) => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (!user) return;

    const docRef = doc(db, `users/${user.uid}/texts`, documentId);
    
    const unsubscribe = onSnapshot(docRef, 
      (doc) => {
        if (doc.exists()) {
          setText(doc.data().content);
        }
        setLoading(false);
      },
      (error) => {
        setError('Error loading document: ' + error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [documentId, user]);

  const handleSave = async (clearText = false) => {
    setError(null);
    setSaving(true);
    if (clearText) setClearing(true);
    
    try {
      const docRef = doc(db, `users/${user.uid}/texts`, documentId);
      await setDoc(docRef, { content: clearText ? '' : text }, { merge: true });
      if (clearText) setText('');
    } catch (err) {
      setError('Error saving: ' + err.message);
    } finally {
      setSaving(false);
      setClearing(false);
    }
  };

  const handleClearAndSave = () => {
    handleSave(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <textarea
        className={styles.textarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Start typing here... (Press Cmd/Ctrl + Enter to save)"
      />
      <div className={styles.buttonContainer}>
        <div className={styles.buttonGroup}>
          <button 
            onClick={handleClearAndSave}
            className={styles.clearButton}
            disabled={!text || loading}
          >
            <FiTrash2 className={styles.buttonIcon} />
            Clear
          </button>
          <button 
            onClick={handleSave}
            className={styles.saveButton}
            disabled={loading}
          >
            <FiSave className={styles.buttonIcon} />
            Save
          </button>
        </div>
      </div>
      {error && (
        <div className={styles.error}>
          {error}
          <button 
            onClick={() => handleSave()}
            type="button"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default TextShare; 