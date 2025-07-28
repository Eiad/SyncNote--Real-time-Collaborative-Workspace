import { useState, useEffect, useCallback } from 'react';
import { db, logAnalyticsEvent } from '@/lib/firebase';
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { CldUploadWidget } from 'next-cloudinary';
import styles from './MediaShare.module.scss';
import ImageModal from './ImageModal';
import { useAuth } from '@/contexts/AuthContext';
import { FiImage, FiTrash2 } from 'react-icons/fi';

const MediaShare = ({ documentId }) => {
  const { user } = useAuth();
  const [mediaUrls, setMediaUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [pasteLoading, setPasteLoading] = useState(false);

  /**
   * Handle paste operations for image uploads
   * Tracks paste upload attempts, success, and errors
   * Supports drag-and-drop and clipboard paste functionality
   */
  const handlePaste = useCallback(async (event) => {
    const items = event.clipboardData?.items;
    if (!items || !user) return;

    for (const item of items) {
      if (item.type.indexOf('image') === 0) {
        const file = item.getAsFile();
        if (!file) continue;

        setPasteLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        // Track paste upload attempts to understand user behavior
        logAnalyticsEvent('media_paste_upload_started', {
          file_size: file.size,               // File size in bytes for performance analysis
          file_type: file.type,               // MIME type (e.g., 'image/jpeg')
          user_id: user.uid,                  // User identifier
          document_id: documentId             // Which document receives the upload
        });

        try {
          const response = await fetch('/api/uploadImage', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Failed to upload pasted image');
          }

          const data = await response.json();
          const imageUrl = data.secure_url;

          const docRef = doc(db, `users/${user.uid}/media`, documentId);
          const docSnap = await getDoc(docRef);
          const currentUrls = docSnap.exists() ? docSnap.data().urls || [] : [];

          await setDoc(docRef, {
            urls: [...currentUrls, imageUrl]
          }, { merge: true });

          // Track successful paste uploads for feature usage analysis
          logAnalyticsEvent('media_paste_upload_success', {
            file_size: file.size,              // File size for performance tracking
            file_type: file.type,              // File type for format analysis
            user_id: user.uid,                 // User identifier
            document_id: documentId,           // Target document
            total_images: currentUrls.length + 1 // Total images in collection
          });
        } catch (err) {
          setError('Error uploading pasted image: ' + err.message);
          
          // Track paste upload errors to identify upload issues
          logAnalyticsEvent('media_paste_upload_error', {
            error_message: err.message,        // Specific error message
            file_size: file.size,              // File size that failed
            file_type: file.type,              // File type that failed
            user_id: user.uid,                 // User identifier for support
            document_id: documentId            // Target document
          });
        } finally {
          setPasteLoading(false);
        }
      }
    }
  }, [user, documentId]);

  // Set up global paste event listener
  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  /**
   * Set up real-time listener for media document changes
   * Tracks when media is loaded for engagement analysis
   */
  useEffect(() => {
    if (!user) return;

    const docRef = doc(db, `users/${user.uid}/media`, documentId);

    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const urls = doc.data().urls || [];
        setMediaUrls(urls);
        
        // Track media loading to understand content access patterns
        if (urls.length > 0) {
          logAnalyticsEvent('media_loaded', {
            user_id: user.uid,                 // User identifier
            document_id: documentId,           // Which document was loaded
            image_count: urls.length           // Number of images loaded
          });
        }
      }
    });

    return () => unsubscribe();
  }, [documentId, user]);

  /**
   * Handle successful uploads from the Cloudinary widget
   * Tracks upload success with detailed file information
   */
  const handleUploadSuccess = async (result) => {
    try {
      const imageUrl = result.info.secure_url;
      const docRef = doc(db, `users/${user.uid}/media`, documentId);
      const docSnap = await getDoc(docRef);
      const currentUrls = docSnap.exists() ? docSnap.data().urls || [] : [];

      await setDoc(docRef, {
        urls: [...currentUrls, imageUrl]
      }, { merge: true });

      // Track successful widget uploads for feature usage analysis
      logAnalyticsEvent('media_upload_success', {
        user_id: user.uid,                    // User identifier
        document_id: documentId,              // Target document
        file_size: result.info.bytes,         // File size in bytes
        file_format: result.info.format,      // File format (jpg, png, etc.)
        total_images: currentUrls.length + 1, // Total images in collection
        upload_method: 'widget'               // Indicates widget upload method
      });
    } catch (err) {
      setError('Error saving image: ' + err.message);
      
      // Track upload errors to identify widget issues
      logAnalyticsEvent('media_upload_error', {
        error_message: err.message,           // Specific error message
        user_id: user.uid,                    // User identifier for support
        document_id: documentId               // Target document
      });
    }
  };

  /**
   * Handle bulk deletion of all media
   * Tracks deletion attempts, success, and errors
   */
  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete all images? This cannot be undone.')) {
      return;
    }

    setDeleting(true);
    setError(null);

    // Track deletion attempts to understand user behavior
    logAnalyticsEvent('media_delete_all_started', {
      user_id: user?.uid,                     // User identifier
      document_id: documentId,                // Target document
      image_count: mediaUrls.length           // Number of images to delete
    });

    try {
      // Delete from Cloudinary
      for (const url of mediaUrls) {
        // Extract public ID from Cloudinary URL
        // Example URL: https://res.cloudinary.com/drkarc7oe/image/upload/v1234567890/folder/image.jpg
        const matches = url.match(/\/v\d+\/(.+)\./);
        if (!matches || !matches[1]) {
          console.error('Could not extract public ID from URL:', url);
          continue;
        }
        const publicId = matches[1];

        const response = await fetch('/api/deleteImage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ publicId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete image from Cloudinary');
        }
      }

      // Clear Firebase storage
      const docRef = doc(db, `users/${user.uid}/media`, documentId);
      await setDoc(docRef, { urls: [] }, { merge: true });

      // Track successful bulk deletions
      logAnalyticsEvent('media_delete_all_success', {
        user_id: user?.uid,                   // User identifier
        document_id: documentId,              // Target document
        deleted_count: mediaUrls.length       // Number of images deleted
      });

    } catch (err) {
      setError('Error deleting images: ' + err.message);
      
      // Track deletion errors to identify cleanup issues
      logAnalyticsEvent('media_delete_all_error', {
        error_message: err.message,           // Specific error message
        user_id: user?.uid,                   // User identifier for support
        document_id: documentId,              // Target document
        image_count: mediaUrls.length         // Number of images that failed to delete
      });
    } finally {
      setDeleting(false);
    }
  };

  /**
   * Handle image viewing with analytics tracking
   * Tracks which images users view for content engagement analysis
   */
  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    
    // Track image views to understand content engagement
    logAnalyticsEvent('media_image_viewed', {
      user_id: user?.uid,                     // User identifier
      document_id: documentId,                // Target document
      image_index: mediaUrls.indexOf(imageUrl), // Position of image in collection
      total_images: mediaUrls.length          // Total number of images available
    });
  };

  return (
    <div className={styles.container}>
      {mediaUrls.length > 0 && (
        <div className={styles.header}>

          <button
            className={styles.deleteButton}
            onClick={handleDeleteAll}
            disabled={deleting}
          >
            <FiTrash2 className={styles.buttonIcon} />
            {deleting ? 'Deleting...' : 'Clear'}
          </button>

        </div>
      )}

      {pasteLoading && (
        <div className={styles.loading}>
          Uploading image...
        </div>
      )}

      <div className={styles.imageGrid}>
        {mediaUrls.map((url, index) => (
          <div
            key={index}
            className={styles.imageWrapper}
            onClick={() => handleImageClick(url)}
          >
            <img src={url} alt={`Shared media ${index + 1}`} />
            <div className={styles.imageOverlay}>
              <span>Click to view</span>
            </div>
          </div>
        ))}
      </div>
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}

      <div className={styles.uploadButtonContainer}>
        <CldUploadWidget
          cloudName="drkarc7oe"
          uploadPreset="syncnote"
          onSuccess={handleUploadSuccess}
          options={{
            maxFiles: 10,
            sources: ['local', 'camera', 'url'],
            resourceType: "image",
            clientAllowedFormats: ["png", "gif", "jpeg", "jpg"],
            maxFileSize: 10000000,
            cropping: false,
            multiple: true,
            showAdvancedOptions: false,
            showCompletedButton: true,
            styles: {
              palette: {
                window: "#FFFFFF",
                windowBorder: "#90A0B3",
                tabIcon: "#0078FF",
                menuIcons: "#5A616A",
                textDark: "#000000",
                textLight: "#FFFFFF",
                link: "#0078FF",
                action: "#FF620C",
                inactiveTabIcon: "#0E2F5A",
                error: "#F44235",
                inProgress: "#0078FF",
                complete: "#20B832",
                sourceBg: "#E4EBF1"
              }
            }
          }}
        >
          {({ open }) => (
            <button 
              className={styles.uploadButton} 
              onClick={() => {
                open();
                
                // Track widget opens to understand upload method preferences
                logAnalyticsEvent('media_upload_widget_opened', {
                  user_id: user?.uid,          // User identifier
                  document_id: documentId      // Target document
                });
              }}
            >
              <FiImage className={styles.buttonIcon} />
              Upload Media
            </button>
          )}
        </CldUploadWidget>
      </div>

      {loading && <div className={styles.loading}>Uploading media...</div>}
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.instructions}>
        You can also paste images directly (Ctrl/Cmd + V)
      </div>
    </div>
  );
};

export default MediaShare;