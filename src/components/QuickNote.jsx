import { useState, useEffect } from 'react';
import { db, logAnalyticsEvent } from '@/lib/firebase';
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

  /**
   * Set up real-time listener for quick note document changes
   * Tracks loading errors for analytics and debugging
   */
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
        
        // Track loading errors to identify data access issues
        logAnalyticsEvent('quicknote_load_error', {
          error_message: error.message,       // Specific error message for debugging
          document_id: documentId,            // Which quick note document failed to load
          user_id: user?.uid                  // User identifier for support
        });
      }
    );

    return () => unsubscribe();
  }, [documentId, user]);

  /**
   * Handle quick note saving with comprehensive analytics tracking
   * Tracks both manual saves and clear operations with detailed parameters
   */
  const handleSave = async (clear = false) => {
    if (!user) return;
    
    // console.log('💾 QuickNote save attempt:', { clear, textLength: text.length });
    
    setSaving(true);
    setError(null);
    
    try {
      const docRef = doc(db, `users/${user.uid}/quicknotes`, documentId);
      await setDoc(docRef, { 
        content: clear ? '' : text 
      }, { merge: true });
      
      if (clear) {
        setText('');
        // console.log('🗑️ QuickNote cleared');
        
        // Track quick note clearing to understand user behavior patterns
        logAnalyticsEvent('quicknote_cleared', {
          document_id: documentId,            // Which quick note document was cleared
          user_id: user.uid,                  // User identifier
          text_length_before: text.length     // How much text was cleared
        });
      } else {
        // console.log('✅ QuickNote saved successfully');
        
        // Track successful quick note saves to understand content creation patterns
        logAnalyticsEvent('quicknote_saved', {
          document_id: documentId,            // Which quick note document was saved
          user_id: user.uid,                  // User identifier
          text_length: text.length,           // Length of saved content
          save_method: 'manual'               // How the save was triggered
        });
      }
    } catch (err) {
      // console.log('❌ QuickNote save error:', err);
      setError('Error saving: ' + err.message);
      
      // Track save errors to identify data persistence issues
      logAnalyticsEvent('quicknote_save_error', {
        error_message: err.message,           // Specific error message
        document_id: documentId,              // Which quick note document failed to save
        user_id: user.uid,                    // User identifier for support
        text_length: text.length              // Length of content that failed to save
      });
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle clear and save operation
   * Wrapper for handleSave with clear flag for analytics tracking
   */
  const handleClearAndSave = () => {
    handleSave(true);
  };

  /**
   * Handle keyboard shortcuts for quick note operations
   * Tracks keyboard-based saves for UX analysis and user preference understanding
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
      
      // Track keyboard shortcut saves to understand user preferences
      logAnalyticsEvent('quicknote_saved', {
        document_id: documentId,              // Which quick note document was saved
        user_id: user?.uid,                   // User identifier
        text_length: text.length,             // Length of saved content
        save_method: 'keyboard_shortcut'      // Indicates keyboard shortcut was used
      });
    }
  };

  /**
   * Handle text changes with milestone tracking for quick notes
   * Tracks significant text changes (every 100 characters) for engagement analysis
   * Helps understand how users interact with quick notes vs regular text areas
   */
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    
    // Track significant text changes to understand user engagement with quick notes
    // Only fires at 100-character milestones to avoid excessive events
    if (newText.length % 100 === 0 && newText.length > 0) {
      logAnalyticsEvent('quicknote_edited', {
        document_id: documentId,              // Which quick note document is being edited
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
      <h3 className={styles.title}>Quick Note</h3>
      <textarea
        className={styles.textarea}
        value={text}
        onChange={handleTextChange}
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
