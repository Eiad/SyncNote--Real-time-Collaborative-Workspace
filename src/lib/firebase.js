import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics, logEvent } from 'firebase/analytics';

// Firebase configuration object containing all necessary credentials
// These are loaded from environment variables for security
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize the Firebase app with our configuration
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics only on client side to avoid SSR issues
// Analytics requires browser APIs that aren't available during server-side rendering
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

/**
 * Helper function to log Firebase Analytics events
 * This function provides a centralized way to track user interactions and app events
 * 
 * @param {string} eventName - The name of the event to log (e.g., 'login_success', 'text_saved')
 * @param {Object} parameters - Optional parameters to include with the event
 * @param {string} parameters.user_id - User's unique identifier
 * @param {string} parameters.user_email - User's email address
 * @param {string} parameters.document_id - Document identifier for content operations
 * @param {number} parameters.text_length - Length of text content
 * @param {string} parameters.error_message - Error message for failed operations
 * @param {string} parameters.error_type - Type of error (e.g., 'invalid_credentials', 'network_error')
 * @param {string} parameters.login_method - Method used for login ('email', 'google', 'ash')
 * @param {string} parameters.save_method - Method used for saving ('manual', 'keyboard_shortcut')
 * @param {number} parameters.file_size - Size of uploaded file in bytes
 * @param {string} parameters.file_format - Format of uploaded file (e.g., 'jpg', 'png')
 * @param {number} parameters.total_images - Total number of images in media collection
 * @param {number} parameters.image_count - Number of images in current operation
 * @param {number} parameters.deleted_count - Number of items deleted
 * @param {string} parameters.upload_method - Method used for upload ('widget', 'paste')
 * @param {number} parameters.change_milestone - Milestone for text changes (every 100 characters)
 * @param {string} parameters.from_tab - Previous tab name when switching tabs
 * @param {string} parameters.to_tab - New tab name when switching tabs
 * @param {string} parameters.from_mode - Previous login mode when switching modes
 * @param {string} parameters.to_mode - New login mode when switching modes
 * @param {number} parameters.session_duration - Duration of user session in milliseconds
 * @param {string} parameters.user_display_name - User's display name
 * @param {number} parameters.image_index - Index of viewed image in collection
 * @param {string} parameters.error_code - Firebase error code for authentication failures
 * 
 * Usage examples:
 * - logAnalyticsEvent('login_success', { user_id: '123', login_method: 'email' })
 * - logAnalyticsEvent('text_saved', { document_id: 'notes-123', text_length: 150 })
 * - logAnalyticsEvent('media_upload_success', { file_size: 1024000, file_format: 'jpg' })
 */
export const logAnalyticsEvent = (eventName, parameters = {}) => {
  // Only log events on client side and when analytics is available
  if (analytics && typeof window !== 'undefined') {
    logEvent(analytics, eventName, parameters);
  }
};
