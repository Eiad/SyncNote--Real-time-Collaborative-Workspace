import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { logAnalyticsEvent } from '@/lib/firebase';
import styles from './AlertMonitor.module.scss';

const AlertMonitor = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [eventCounts, setEventCounts] = useState({
    login_failed: 0,
    quicknote_save_error: 0,
    media_upload_error: 0,
    text_save_error: 0
  });

  // Only show for Ash user
  if (user?.displayName !== 'Ash') {
    return null;
  }

  // Monitor events in real-time
  useEffect(() => {
    const checkForAlerts = () => {
      const newAlerts = [];
      
      // Alert 1: Login failure rate
      if (eventCounts.login_failed > 5) {
        newAlerts.push({
          id: 'login_failure',
          severity: 'high',
          message: `High login failure rate: ${eventCounts.login_failed} failures detected`,
          timestamp: new Date().toISOString()
        });
      }
      
      // Alert 2: QuickNote save errors
      if (eventCounts.quicknote_save_error > 3) {
        newAlerts.push({
          id: 'quicknote_error',
          severity: 'medium',
          message: `QuickNote save errors: ${eventCounts.quicknote_save_error} errors detected`,
          timestamp: new Date().toISOString()
        });
      }
      
      // Alert 3: Media upload errors
      if (eventCounts.media_upload_error > 2) {
        newAlerts.push({
          id: 'media_error',
          severity: 'medium',
          message: `Media upload errors: ${eventCounts.media_upload_error} errors detected`,
          timestamp: new Date().toISOString()
        });
      }
      
      // Alert 4: Text save errors
      if (eventCounts.text_save_error > 3) {
        newAlerts.push({
          id: 'text_error',
          severity: 'medium',
          message: `Text save errors: ${eventCounts.text_save_error} errors detected`,
          timestamp: new Date().toISOString()
        });
      }
      
      setAlerts(newAlerts);
    };

    // Check for alerts every 30 seconds
    const interval = setInterval(checkForAlerts, 30000);
    
    return () => clearInterval(interval);
  }, [eventCounts]);

  // Simulate event counting AND send real analytics events
  const simulateEvent = (eventType) => {
    // Update local counter
    setEventCounts(prev => ({
      ...prev,
      [eventType]: prev[eventType] + 1
    }));

    // Send real analytics event
    logAnalyticsEvent(eventType, {
      simulated: true,
      timestamp: Date.now(),
      user_id: user?.uid,
      test_event: true
    });

    // console.log(`Sent real analytics event: ${eventType}`);
  };

  return (
    <div className={styles.alertMonitor}>
      <h3>Alert Monitor</h3>
      
      {/* Event Counters */}
      <div className={styles.eventCounters}>
        <div className={styles.counter}>
          <span>Login Failures:</span>
          <span className={eventCounts.login_failed > 5 ? styles.warning : ''}>
            {eventCounts.login_failed}
          </span>
        </div>
        <div className={styles.counter}>
          <span>QuickNote Errors:</span>
          <span className={eventCounts.quicknote_save_error > 3 ? styles.warning : ''}>
            {eventCounts.quicknote_save_error}
          </span>
        </div>
        <div className={styles.counter}>
          <span>Media Upload Errors:</span>
          <span className={eventCounts.media_upload_error > 2 ? styles.warning : ''}>
            {eventCounts.media_upload_error}
          </span>
        </div>
        <div className={styles.counter}>
          <span>Text Save Errors:</span>
          <span className={eventCounts.text_save_error > 3 ? styles.warning : ''}>
            {eventCounts.text_save_error}
          </span>
        </div>
      </div>

      {/* Simulate Events (for testing) */}
      <div className={styles.simulation}>
        <h4>🧪 Simulate Events (Testing)</h4>
        <button onClick={() => simulateEvent('login_failed')}>
          Simulate Login Failure
        </button>
        <button onClick={() => simulateEvent('quicknote_save_error')}>
          Simulate QuickNote Error
        </button>
        <button onClick={() => simulateEvent('media_upload_error')}>
          Simulate Media Upload Error
        </button>
        <button onClick={() => simulateEvent('text_save_error')}>
          Simulate Text Save Error
        </button>
      </div>

      {/* Active Alerts */}
      <div className={styles.alerts}>
        <h4>🚨 Active Alerts</h4>
        {alerts.length === 0 ? (
          <p className={styles.noAlerts}>✅ No alerts - everything looks good!</p>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className={`${styles.alert} ${styles[alert.severity]}`}>
              <span className={styles.alertIcon}>
                {alert.severity === 'high' ? '🔴' : '🟡'}
              </span>
              <span className={styles.alertMessage}>{alert.message}</span>
              <span className={styles.alertTime}>
                {new Date(alert.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Alert History */}
      <div className={styles.history}>
        <h4>📊 Alert History</h4>
        <p>This would show historical alerts and trends</p>
      </div>
    </div>
  );
};

export default AlertMonitor; 