import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import styles from './QuickNote.module.scss';
import { FiTrash2, FiSave, FiLoader } from 'react-icons/fi';

const QuickNote = ({ documentId }) => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (!user) return;

    const docRef = doc(db, `users/${user.uid}/quicknotes`, documentId);
    
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

  const handleSave = async (clear = false) => {
    if (!user) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const docRef = doc(db, `users/${user.uid}/quicknotes`, documentId);
      await setDoc(docRef, { 
        content: clear ? '' : text 
      }, { merge: true });
      
      if (clear) {
        setText('');
      }
    } catch (err) {
      setError('Error saving: ' + err.message);
    } finally {
      setSaving(false);
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
        placeholder="Quick notes... (Press Cmd/Ctrl + Enter to save)"
      />
      <div className={styles.buttonContainer}>
        <div className={styles.buttonGroup}>
          <button 
            onClick={handleClearAndSave}
            className={styles.clearButton}
            disabled={!text || loading || saving}
          >
            <FiTrash2 className={styles.buttonIcon} />
            Clear
          </button>
          <button 
            onClick={() => handleSave(false)}
            className={styles.saveButton}
            disabled={loading || saving}
          >
            {saving ? (
              <>
                <FiLoader className={`${styles.buttonIcon} ${styles.spinningIcon}`} />
                Saving...
              </>
            ) : (
              <>
                <FiSave className={styles.buttonIcon} />
                Save
              </>
            )}
          </button>
        </div>
      </div>
      {error && (
        <div className={styles.error}>
          {error}
          <button onClick={() => handleSave(false)} type="button">
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default QuickNote;
