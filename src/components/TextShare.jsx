import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import styles from './TextShare.module.scss';

const TextShare = ({ documentId }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const docRef = doc(db, 'texts', documentId);
    
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
  }, [documentId]);

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    
    try {
      const docRef = doc(db, 'texts', documentId);
      await setDoc(docRef, { content: text }, { merge: true });
    } catch (err) {
      setError('Error saving: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
        placeholder="Start typing here... (Press Enter to save, Shift + Enter for new line)"
      />
      <div className={styles.saveButtonContainer}>
        <button 
          className={styles.saveButton}
          onClick={handleSave}
          disabled={saving}
          type="button"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
      {error && (
        <div className={styles.error}>
          {error}
          <button 
            onClick={handleSave}
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