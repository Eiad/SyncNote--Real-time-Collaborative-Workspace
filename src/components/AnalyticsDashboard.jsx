import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styles from './AnalyticsDashboard.module.scss';

/**
 * Analytics Dashboard Component
 * 
 * This component provides a floating analytics dashboard that's only visible to the "Ash" user.
 * It serves as a development/testing tool to help understand what analytics events are available
 * and how to test them in the Firebase Console.
 */
const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  // Only show analytics dashboard to Ash user for security
  if (user?.displayName !== 'Ash') {
    return null;
  }

  /**
   * Toggle dashboard visibility
   * Allows Ash to show/hide the analytics reference panel
   */
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className={styles.analyticsContainer}>
      {/* Floating Analytics Button */}
      <button 
        onClick={toggleVisibility}
        className={styles.toggleButton}
      >
        📊 Analytics
      </button>
      
      {/* Analytics Dashboard Panel */}
      {isVisible && (
        <div className={styles.dashboard}>
          <h3>Firebase Analytics Events</h3>
          <div className={styles.eventList}>
            
            {/* Authentication Events Section */}
            <div className={styles.eventCategory}>
              <h4>Authentication Events</h4>
              <ul>
                <li><code>login_attempted</code> - User attempts to login</li>
                <li><code>login_success</code> - Successful login</li>
                <li><code>login_failed</code> - Failed login attempt</li>
                <li><code>signup_attempted</code> - User attempts to signup</li>
                <li><code>signup_success</code> - Successful signup</li>
                <li><code>signup_failed</code> - Failed signup attempt</li>
                <li><code>password_reset_requested</code> - Password reset requested</li>
                <li><code>user_logout</code> - User logout</li>
              </ul>
            </div>
            
            {/* Dashboard Events Section */}
            <div className={styles.eventCategory}>
              <h4>Dashboard Events</h4>
              <ul>
                <li><code>dashboard_accessed</code> - User accessed dashboard</li>
                <li><code>tab_switched</code> - User switched between tabs</li>
                <li><code>login_mode_changed</code> - Login mode changed</li>
              </ul>
            </div>
            
            {/* Text Operations Events Section */}
            <div className={styles.eventCategory}>
              <h4>Text Operations</h4>
              <ul>
                <li><code>text_saved</code> - Text saved (manual or keyboard)</li>
                <li><code>text_cleared</code> - Text cleared</li>
                <li><code>text_edited</code> - Significant text changes</li>
                <li><code>text_load_error</code> - Error loading text</li>
                <li><code>text_save_error</code> - Error saving text</li>
                <li><code>quicknote_saved</code> - Quick note saved</li>
                <li><code>quicknote_cleared</code> - Quick note cleared</li>
                <li><code>quicknote_edited</code> - Quick note text changes</li>
                <li><code>quicknote_load_error</code> - Error loading quick note</li>
                <li><code>quicknote_save_error</code> - Error saving quick note</li>
              </ul>
            </div>
            
            {/* Media Operations Events Section */}
            <div className={styles.eventCategory}>
              <h4>Media Operations</h4>
              <ul>
                <li><code>media_upload_success</code> - Media uploaded successfully</li>
                <li><code>media_upload_error</code> - Media upload error</li>
                <li><code>media_paste_upload_started</code> - Paste upload started</li>
                <li><code>media_paste_upload_success</code> - Paste upload success</li>
                <li><code>media_paste_upload_error</code> - Paste upload error</li>
                <li><code>media_delete_all_started</code> - Delete all started</li>
                <li><code>media_delete_all_success</code> - Delete all success</li>
                <li><code>media_delete_all_error</code> - Delete all error</li>
                <li><code>media_image_viewed</code> - Image viewed</li>
                <li><code>media_upload_widget_opened</code> - Upload widget opened</li>
                <li><code>media_loaded</code> - Media loaded</li>
              </ul>
            </div>
          </div>
          
          {/* Testing Instructions Section */}
          <div className={styles.instructions}>
            <h4>How to Test in Firebase Console:</h4>
            <ol>
              <li>Go to your Firebase Console</li>
              <li>Navigate to Analytics → Events</li>
              <li>Use the DebugView to see real-time events</li>
              <li>Perform actions in the app to trigger events</li>
              <li>Check the Events tab to see all triggered events</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard; 