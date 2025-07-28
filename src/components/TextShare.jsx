import { useState, useEffect } from 'react';
import { db, logAnalyticsEvent } from '@/lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import styles from './TextShare.module.scss';
import { FiTrash2, FiSave, FiLoader } from 'react-icons/fi';

const TextShare = ({ documentId }) => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);

  /**
   * Set up real-time listener for text document changes
   * Also tracks loading errors for analytics
   */
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
        
        // Track loading errors to identify data access issues
        logAnalyticsEvent('text_load_error', {
          error_message: error.message,       // Specific error message for debugging
          document_id: documentId,            // Which document failed to load
          user_id: user?.uid                  // User identifier for support
        });
      }
    );

    return () => unsubscribe();
  }, [documentId, user]);

  /**
   * Handle text saving with comprehensive analytics tracking
   * Tracks both manual saves and clear operations
   */
  const handleSave = async (clear = false) => {
    if (!user) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const docRef = doc(db, `users/${user.uid}/texts`, documentId);
      await setDoc(docRef, { 
        content: clear ? '' : text 
      }, { merge: true });
      
      if (clear) {
        setText('');
        
        // Track text clearing to understand user behavior patterns
        logAnalyticsEvent('text_cleared', {
          document_id: documentId,            // Which document was cleared
          user_id: user.uid,                  // User identifier
          text_length_before: text.length     // How much text was cleared
        });
      } else {
        
        // Track successful text saves to understand content creation patterns
        logAnalyticsEvent('text_saved', {
          document_id: documentId,            // Which document was saved
          user_id: user.uid,                  // User identifier
          text_length: text.length,           // Length of saved content
          save_method: 'manual'               // How the save was triggered
        });
      }
    } catch (err) {
      setError('Error saving: ' + err.message);
      
      // Track save errors to identify data persistence issues
      logAnalyticsEvent('text_save_error', {
        error_message: err.message,           // Specific error message
        document_id: documentId,              // Which document failed to save
        user_id: user.uid,                    // User identifier for support
        text_length: text.length              // Length of content that failed to save
      });
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle clear and save operation
   * Wrapper for handleSave with clear flag
   */
  const handleClearAndSave = () => {
    handleSave(true);
  };

  /**
   * Handle keyboard shortcuts for text operations
   * Tracks keyboard-based saves for UX analysis
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
      
      // Track keyboard shortcut saves to understand user preferences
      logAnalyticsEvent('text_saved', {
        document_id: documentId,              // Which document was saved
        user_id: user?.uid,                   // User identifier
        text_length: text.length,             // Length of saved content
        save_method: 'keyboard_shortcut'      // Indicates keyboard shortcut was used
      });
    }
  };

  /**
   * Handle text changes with milestone tracking
   * Tracks significant text changes (every 100 characters) for engagement analysis
   */
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    
    // Track significant text changes to understand user engagement
    // Only fires at 100-character milestones to avoid excessive events
    if (newText.length % 100 === 0 && newText.length > 0) {
      logAnalyticsEvent('text_edited', {
        document_id: documentId,              // Which document is being edited
        user_id: user?.uid,                   // User identifier
        text_length: newText.length,          // Current text length
        change_milestone: Math.floor(newText.length / 100) * 100 // Milestone reached
      });
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Frequently Shared Text</h3>
      <textarea
        className={styles.textarea}
        value={text}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder="Start typing here... (Press Cmd/Ctrl + Enter to save)"
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
                <FiLoader className={styles.buttonIcon} />
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
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default TextShare; 